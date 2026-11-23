-- =============================================================================
-- MIGRACIÓN TRUEKLY: ACTUALIZACIÓN DE CHECK CONSTRAINT PARA ESTADO PACTADO
-- Archivo: supabase/migrations/20261123000000_actualizar_check_estado_propuesta.sql
-- =============================================================================

ALTER TABLE public.propuesta_trueque 
DROP CONSTRAINT IF EXISTS propuesta_trueque_estado_check;

ALTER TABLE public.propuesta_trueque 
ADD CONSTRAINT propuesta_trueque_estado_check 
CHECK (estado IN ('pendiente', 'pactado', 'confirmado_parcial', 'completada', 'cancelada'));
