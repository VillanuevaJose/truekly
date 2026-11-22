-- =============================================================================
-- MIGRACIÓN TRUEKLY: CHAT PRIVADO 1 A 1 DE TRUEQUES CON RLS
-- Archivo: supabase/migrations/20261122000000_chat_mensajes_trueque.sql
-- =============================================================================

-- 1. Tabla de mensajes de trueque
CREATE TABLE IF NOT EXISTS public.mensaje_trueque (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publicacion_id TEXT NOT NULL,
    emisor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receptor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    contenido TEXT NOT NULL CHECK (char_length(trim(contenido)) > 0 AND char_length(contenido) <= 2000),
    leido BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Índices de optimización de lectura y orden cronológico
CREATE INDEX IF NOT EXISTS idx_mensaje_trueque_pub_created 
    ON public.mensaje_trueque (publicacion_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_mensaje_trueque_participantes 
    ON public.mensaje_trueque (emisor_id, receptor_id);

-- 3. Permisos
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.mensaje_trueque TO authenticated;
GRANT ALL ON TABLE public.mensaje_trueque TO service_role;

-- 4. Seguridad a Nivel de Fila (Row Level Security)
ALTER TABLE public.mensaje_trueque ENABLE ROW LEVEL SECURITY;

-- Política SELECT: Solo los participantes (emisor o receptor) pueden ver la conversación
DROP POLICY IF EXISTS "mensaje_select_participantes" ON public.mensaje_trueque;
CREATE POLICY "mensaje_select_participantes"
    ON public.mensaje_trueque
    FOR SELECT
    TO authenticated
    USING (auth.uid() = emisor_id OR auth.uid() = receptor_id);

-- Política INSERT: Solo el usuario emisor autenticado puede crear mensajes a su nombre
DROP POLICY IF EXISTS "mensaje_insert_emisor" ON public.mensaje_trueque;
CREATE POLICY "mensaje_insert_emisor"
    ON public.mensaje_trueque
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = emisor_id);

-- Política UPDATE: Solo el receptor puede marcar mensajes como leídos
DROP POLICY IF EXISTS "mensaje_update_receptor" ON public.mensaje_trueque;
CREATE POLICY "mensaje_update_receptor"
    ON public.mensaje_trueque
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = receptor_id)
    WITH CHECK (auth.uid() = receptor_id);

-- 5. Habilitar Realtime para la tabla de mensajes (para clientes supabase-js)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.mensaje_trueque;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END $$;
