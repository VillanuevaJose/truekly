-- ==============================================================================
-- TRUEKLY - ESQUEMA DE BASE DE DATOS Y STORAGE (SUPABASE)
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA PROFILES
-- Vinculada directamente con auth.users vía UUID (1 a 1)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dni text UNIQUE NOT NULL,
  primer_nombre text NOT NULL,
  segundo_nombre text,
  apellido_paterno text NOT NULL,
  apellido_materno text,
  nombre_reniec text,
  username text UNIQUE NOT NULL,
  email text NOT NULL,
  avatar_url text,
  selfie_path text,
  dni_foto_path text,
  identidad_verificada boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT dni_format CHECK (dni ~ '^[0-9]{8}$'),
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30)
);

-- Índices de búsqueda rápida y unicidad
CREATE INDEX IF NOT EXISTS idx_profiles_dni ON public.profiles(dni);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(LOWER(username));

-- 3. ROW LEVEL SECURITY (RLS) EN PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver su propio perfil completo (DNI, fotos y correo protegidos)
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Los usuarios solo pueden actualizar su propio perfil
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Inserción permitida al usuario autenticado para su propio registro
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 4. VISTA PÚBLICA SEGURA (Sin DNI, sin correo, sin rutas de documentos de identidad)
-- Usada para mostrar avatar, nombre y verificación del autor en publicaciones
CREATE OR REPLACE VIEW public.public_profiles AS
  SELECT
    id,
    username,
    avatar_url,
    primer_nombre,
    apellido_paterno,
    TRIM(CONCAT(primer_nombre, ' ', apellido_paterno)) AS nombre_mostrar,
    identidad_verificada
  FROM public.profiles;

-- Otorgar permisos de lectura en la vista pública
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 5. FUNCIONES RPC DE VALIDACIÓN (SECURITY DEFINER)
-- Permiten consultar disponibilidad de DNI y Username desde el paso 1 sin exponer datos ajenos

CREATE OR REPLACE FUNCTION public.check_dni_registrado(p_dni text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE dni = TRIM(p_dni)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_dni_registrado(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.check_username_disponible(p_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE LOWER(username) = LOWER(TRIM(p_username))
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_username_disponible(text) TO anon, authenticated;

-- 6. TRIGGER PARA CREACIÓN AUTOMÁTICA O SINCRONIZACIÓN DE PERFIL (Opcional si vienen datos en metadata)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    dni,
    primer_nombre,
    segundo_nombre,
    apellido_paterno,
    apellido_materno,
    nombre_reniec,
    username,
    email,
    avatar_url,
    identidad_verificada
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'dni', ''),
    COALESCE(new.raw_user_meta_data->>'primer_nombre', ''),
    new.raw_user_meta_data->>'segundo_nombre',
    COALESCE(new.raw_user_meta_data->>'apellido_paterno', ''),
    new.raw_user_meta_data->>'apellido_materno',
    new.raw_user_meta_data->>'nombre_reniec',
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    COALESCE((new.raw_user_meta_data->>'identidad_verificada')::boolean, false)
  )
  ON CONFLICT (id) DO UPDATE SET
    updated_at = now();
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Si la inserción desde metadata falla (ej. faltan campos), el frontend inserta el perfil explícitamente
    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. BUCKETS DE STORAGE PRIVADOS: selfies Y dni-fotos
INSERT INTO storage.buckets (id, name, public)
VALUES ('selfies', 'selfies', false)
ON CONFLICT (id) DO UPDATE SET public = false;

INSERT INTO storage.buckets (id, name, public)
VALUES ('dni-fotos', 'dni-fotos', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 8. POLÍTICAS DE RLS PARA STORAGE (Carpeta aislada por usuario: {user_id}/*)

-- Políticas de selfies
DROP POLICY IF EXISTS "selfies_insert_own" ON storage.objects;
CREATE POLICY "selfies_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'selfies' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "selfies_select_own" ON storage.objects;
CREATE POLICY "selfies_select_own"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'selfies' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "selfies_update_own" ON storage.objects;
CREATE POLICY "selfies_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'selfies' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Políticas de dni-fotos (NUNCA PÚBLICAS)
DROP POLICY IF EXISTS "dni_fotos_insert_own" ON storage.objects;
CREATE POLICY "dni_fotos_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'dni-fotos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "dni_fotos_select_own" ON storage.objects;
CREATE POLICY "dni_fotos_select_own"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'dni-fotos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "dni_fotos_update_own" ON storage.objects;
CREATE POLICY "dni_fotos_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'dni-fotos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
