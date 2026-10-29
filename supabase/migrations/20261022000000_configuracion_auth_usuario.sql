-- =============================================================================
-- MIGRACIÓN TRUEKLY: CONFIGURACIÓN AUTH Y PERMISOS DE USUARIO
-- Archivo: supabase/migrations/20261022000000_configuracion_auth_usuario.sql
-- 
-- INSTRUCCIONES PARA APLICAR EN SUPABASE:
-- 1. Abre tu panel de Supabase: https://supabase.com/dashboard/project/fzjxhliildjlhvrbqiwo
-- 2. Ve a "SQL Editor" en el menú de la izquierda.
-- 3. Crea una "New query" (+), pega todo este código y pulsa "Run".
-- =============================================================================

-- 1. Otorgar permisos de esquema y tablas a anon y authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated;

-- 2. Asegurar columnas de identidad en public.usuario
ALTER TABLE public.usuario
    ADD COLUMN IF NOT EXISTS dni VARCHAR(8),
    ADD COLUMN IF NOT EXISTS primer_nombre VARCHAR(60),
    ADD COLUMN IF NOT EXISTS segundo_nombre VARCHAR(60),
    ADD COLUMN IF NOT EXISTS nombres VARCHAR(120),
    ADD COLUMN IF NOT EXISTS apellido_paterno VARCHAR(60),
    ADD COLUMN IF NOT EXISTS apellido_materno VARCHAR(60),
    ADD COLUMN IF NOT EXISTS nombre_mostrar VARCHAR(80),
    ADD COLUMN IF NOT EXISTS nombre_usuario VARCHAR(50);

-- 3. Restricciones UNIQUE e índices
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'usuario_dni_key') THEN
        ALTER TABLE public.usuario ADD CONSTRAINT usuario_dni_key UNIQUE (dni);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'usuario_nombre_usuario_key') THEN
        ALTER TABLE public.usuario ADD CONSTRAINT usuario_nombre_usuario_key UNIQUE (nombre_usuario);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_usuario_dni ON public.usuario(dni);
CREATE INDEX IF NOT EXISTS idx_usuario_nombre_usuario ON public.usuario(nombre_usuario);

-- 4. Funciones RPC seguras para validación de DNI y username
CREATE OR REPLACE FUNCTION public.check_dni_registrado(p_dni VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.usuario 
        WHERE dni = p_dni
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_dni_registrado(VARCHAR) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.check_username_disponible(p_username VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 
        FROM public.usuario 
        WHERE LOWER(nombre_usuario) = LOWER(p_username)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_username_disponible(VARCHAR) TO anon, authenticated;

-- 5. Trigger sincronizador automático: auth.users -> public.usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuario (
        id,
        nombre,
        email,
        foto_perfil_url,
        fecha_nacimiento,
        email_verificado,
        dni,
        primer_nombre,
        segundo_nombre,
        nombres,
        apellido_paterno,
        apellido_materno,
        nombre_mostrar,
        nombre_usuario
    )
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'nombre',
            NEW.raw_user_meta_data->>'name',
            'Usuario Truekly'
        ),
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE((NEW.raw_user_meta_data->>'fecha_nacimiento')::DATE, '2000-01-01'::DATE),
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
        NEW.raw_user_meta_data->>'dni',
        NEW.raw_user_meta_data->>'primer_nombre',
        NEW.raw_user_meta_data->>'segundo_nombre',
        COALESCE(
            NEW.raw_user_meta_data->>'nombres',
            TRIM(CONCAT(NEW.raw_user_meta_data->>'primer_nombre', ' ', NEW.raw_user_meta_data->>'segundo_nombre'))
        ),
        NEW.raw_user_meta_data->>'apellido_paterno',
        NEW.raw_user_meta_data->>'apellido_materno',
        COALESCE(
            NEW.raw_user_meta_data->>'nombre_mostrar',
            TRIM(CONCAT(NEW.raw_user_meta_data->>'primer_nombre', ' ', NEW.raw_user_meta_data->>'apellido_paterno')),
            NEW.raw_user_meta_data->>'nombre'
        ),
        NEW.raw_user_meta_data->>'nombre_usuario'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        email_verificado = EXCLUDED.email_verificado,
        dni = COALESCE(EXCLUDED.dni, public.usuario.dni),
        primer_nombre = COALESCE(EXCLUDED.primer_nombre, public.usuario.primer_nombre),
        segundo_nombre = COALESCE(EXCLUDED.segundo_nombre, public.usuario.segundo_nombre),
        nombres = COALESCE(EXCLUDED.nombres, public.usuario.nombres),
        apellido_paterno = COALESCE(EXCLUDED.apellido_paterno, public.usuario.apellido_paterno),
        apellido_materno = COALESCE(EXCLUDED.apellido_materno, public.usuario.apellido_materno),
        nombre_mostrar = COALESCE(EXCLUDED.nombre_mostrar, public.usuario.nombre_mostrar),
        nombre_usuario = COALESCE(EXCLUDED.nombre_usuario, public.usuario.nombre_usuario);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Políticas de Seguridad de Filas (RLS) en public.usuario
ALTER TABLE public.usuario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuario_select_perfiles" ON public.usuario;
DROP POLICY IF EXISTS "usuario_select_propio" ON public.usuario;
DROP POLICY IF EXISTS "usuario_update_propio" ON public.usuario;
DROP POLICY IF EXISTS "usuario_insert_propio" ON public.usuario;

CREATE POLICY "usuario_select_perfiles" ON public.usuario
    FOR SELECT 
    USING (estado_cuenta = 'activo' OR auth.uid() = id);

CREATE POLICY "usuario_update_propio" ON public.usuario
    FOR UPDATE 
    USING (auth.uid() = id) 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "usuario_insert_propio" ON public.usuario
    FOR INSERT 
    WITH CHECK (auth.uid() = id);
