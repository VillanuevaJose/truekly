-- =============================================================================
-- TABLA DE CÓDIGOS DE VERIFICACIÓN (OTP) PARA REGISTRO
-- Archivo: supabase/migrations/20261016000000_tabla_otp.sql
-- Ejecutar en Supabase > SQL Editor
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.codigo_verificacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(150) NOT NULL,
    codigo_hash TEXT NOT NULL,
    password_hash TEXT,
    nombre VARCHAR(100),
    intentos SMALLINT NOT NULL DEFAULT 0,
    max_intentos SMALLINT NOT NULL DEFAULT 5,
    expira_at TIMESTAMPTZ NOT NULL,
    consumido BOOLEAN NOT NULL DEFAULT false,
    creado_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    ultimo_envio_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índice para búsquedas rápidas por email
CREATE INDEX IF NOT EXISTS idx_codigo_verif_email ON public.codigo_verificacion (email);

-- RLS: Bloqueo total desde el cliente (solo service_role / Edge Functions pueden acceder)
ALTER TABLE public.codigo_verificacion ENABLE ROW LEVEL SECURITY;

-- Ningún usuario anónimo ni autenticado puede leer/escribir directamente los códigos
DROP POLICY IF EXISTS "otp_deny_all" ON public.codigo_verificacion;
CREATE POLICY "otp_deny_all" ON public.codigo_verificacion
    FOR ALL
    USING (false);
