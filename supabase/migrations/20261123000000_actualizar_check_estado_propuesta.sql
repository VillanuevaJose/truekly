-- =============================================================================
-- MIGRACIÓN TRUEKLY: ACTUALIZACIÓN DE CHECK CONSTRAINT Y RLS PARA ESTADO PACTADO
-- Archivo: supabase/migrations/20261123000000_actualizar_check_estado_propuesta.sql
-- =============================================================================

ALTER TABLE public.propuesta_trueque 
DROP CONSTRAINT IF EXISTS propuesta_trueque_estado_check;

ALTER TABLE public.propuesta_trueque 
ADD CONSTRAINT propuesta_trueque_estado_check 
CHECK (estado IN ('pendiente', 'pactado', 'confirmado_parcial', 'completada', 'cancelada'));

-- Permitir a usuarios autenticados consultar propuestas asociadas a publicaciones
DROP POLICY IF EXISTS "propuesta_select_participantes" ON public.propuesta_trueque;
CREATE POLICY "propuesta_select_participantes"
    ON public.propuesta_trueque
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = proponente_id 
        OR auth.uid() = receptor_id 
        OR receptor_id IS NULL
    );
