-- =============================================================================
-- MIGRACIÓN TRUEKLY: DNI ÚNICO, NOMBRES SEPARADOS Y PROTECCIÓN RLS
-- Archivo: supabase/migrations/20261021000000_agregar_dni_y_nombres_usuario.sql
-- 
-- INSTRUCCIONES PARA APLICAR:
-- 1. Abre tu panel de control de Supabase: https://supabase.com/dashboard
-- 2. Entra a tu proyecto Truekly -> Menú izquierdo "SQL Editor".
-- 3. Haz clic en "New query" (Nueva consulta).
-- 4. Copia y pega el contenido completo de este script SQL.
-- 5. Presiona "Run" (Ejecutar) en la esquina inferior derecha.
-- =============================================================================

-- 1. Agregar columnas de nombres separados, apodo y DNI a public.usuario
ALTER TABLE public.usuario
    ADD COLUMN IF NOT EXISTS dni VARCHAR(8),
    ADD COLUMN IF NOT EXISTS primer_nombre VARCHAR(60),
    ADD COLUMN IF NOT EXISTS segundo_nombre VARCHAR(60),
    ADD COLUMN IF NOT EXISTS apellido_paterno VARCHAR(60),
    ADD COLUMN IF NOT EXISTS apellido_materno VARCHAR(60),
    ADD COLUMN IF NOT EXISTS nombre_mostrar VARCHAR(80);

-- 2. Asegurar restricción UNIQUE en dni (una sola cuenta por DNI)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'usuario_dni_key'
    ) THEN
        ALTER TABLE public.usuario ADD CONSTRAINT usuario_dni_key UNIQUE (dni);
    END IF;
END $$;

-- 3. Crear índice para acelerar consultas de validación de DNI
CREATE INDEX IF NOT EXISTS idx_usuario_dni ON public.usuario(dni);

-- 4. Función segura con SECURITY DEFINER para comprobar disponibilidad de DNI
-- Permite verificar si un DNI ya existe sin exponer los registros ni otros campos por RLS
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

-- Permisos de ejecución de la función para usuarios anónimos y autenticados
GRANT EXECUTE ON FUNCTION public.check_dni_registrado(VARCHAR) TO anon, authenticated;

-- 5. RLS: El usuario SOLO puede leer y editar su propia fila en public.usuario
-- Evita que otros usuarios lean datos sensibles como el DNI, teléfono o email
DROP POLICY IF EXISTS "usuario_select_perfiles" ON public.usuario;
DROP POLICY IF EXISTS "usuario_select_propio" ON public.usuario;

CREATE POLICY "usuario_select_propio" ON public.usuario
    FOR SELECT 
    USING (auth.uid() = id);

-- 6. Vista pública segura de perfiles para la app (sin DNI ni datos privados)
-- Los demás usuarios consultarán esta vista para ver el perfil público del vendedor/intercambiador
CREATE OR REPLACE VIEW public.vista_usuario_publico AS
SELECT
    id,
    COALESCE(nombre_mostrar, primer_nombre || ' ' || apellido_paterno, nombre) AS nombre_mostrar,
    foto_perfil_url,
    ciudad,
    distrito_zona,
    nivel_confianza,
    estado_cuenta,
    fecha_registro
FROM public.usuario
WHERE estado_cuenta = 'activo';

GRANT SELECT ON public.vista_usuario_publico TO anon, authenticated;

-- 7. Actualizar función trigger handle_new_user() para persistir los nuevos campos
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
        apellido_paterno,
        apellido_materno,
        nombre_mostrar
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'name', 'Usuario Truekly'),
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE((NEW.raw_user_meta_data->>'fecha_nacimiento')::DATE, '2000-01-01'::DATE),
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
        NEW.raw_user_meta_data->>'dni',
        NEW.raw_user_meta_data->>'primer_nombre',
        NEW.raw_user_meta_data->>'segundo_nombre',
        NEW.raw_user_meta_data->>'apellido_paterno',
        NEW.raw_user_meta_data->>'apellido_materno',
        COALESCE(
            NEW.raw_user_meta_data->>'nombre_mostrar', 
            NEW.raw_user_meta_data->>'primer_nombre' || ' ' || NEW.raw_user_meta_data->>'apellido_paterno', 
            NEW.raw_user_meta_data->>'nombre'
        )
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        email_verificado = EXCLUDED.email_verificado,
        dni = COALESCE(EXCLUDED.dni, public.usuario.dni),
        primer_nombre = COALESCE(EXCLUDED.primer_nombre, public.usuario.primer_nombre),
        segundo_nombre = COALESCE(EXCLUDED.segundo_nombre, public.usuario.segundo_nombre),
        apellido_paterno = COALESCE(EXCLUDED.apellido_paterno, public.usuario.apellido_paterno),
        apellido_materno = COALESCE(EXCLUDED.apellido_materno, public.usuario.apellido_materno),
        nombre_mostrar = COALESCE(EXCLUDED.nombre_mostrar, public.usuario.nombre_mostrar);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
