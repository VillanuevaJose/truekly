-- =============================================================================
-- MIGRACIÓN TRUEKLY: HANDSHAKE TRANSACCIONAL ACID DE TRUEQUE
-- Archivo: supabase/migrations/20261119000000_handshake_transaccional_trueque.sql
-- =============================================================================

-- 1. Tabla de propuestas de trueque
CREATE TABLE IF NOT EXISTS public.propuesta_trueque (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proponente_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receptor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    publicacion_ofertada_id TEXT NOT NULL,
    publicacion_solicitada_id TEXT NOT NULL,
    titulo_ofertado VARCHAR(150) NOT NULL,
    titulo_solicitado VARCHAR(150) NOT NULL,
    imagen_ofertada TEXT,
    imagen_solicitada TEXT,
    punto_encuentro VARCHAR(150) NOT NULL DEFAULT 'Plaza de Armas de Chimbote',
    confirmado_proponente BOOLEAN NOT NULL DEFAULT false,
    confirmado_receptor BOOLEAN NOT NULL DEFAULT false,
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente' 
        CHECK (estado IN ('pendiente', 'confirmado_parcial', 'completada', 'cancelada')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_cierre TIMESTAMPTZ
);

-- 2. Permisos y RLS
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.propuesta_trueque TO authenticated;
GRANT ALL ON TABLE public.propuesta_trueque TO service_role;

ALTER TABLE public.propuesta_trueque ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "propuesta_select_participantes" ON public.propuesta_trueque;
CREATE POLICY "propuesta_select_participantes"
    ON public.propuesta_trueque
    FOR SELECT
    TO authenticated
    USING (auth.uid() = proponente_id OR auth.uid() = receptor_id);

DROP POLICY IF EXISTS "propuesta_insert_proponente" ON public.propuesta_trueque;
CREATE POLICY "propuesta_insert_proponente"
    ON public.propuesta_trueque
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = proponente_id);

DROP POLICY IF EXISTS "propuesta_update_participantes" ON public.propuesta_trueque;
CREATE POLICY "propuesta_update_participantes"
    ON public.propuesta_trueque
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = proponente_id OR auth.uid() = receptor_id)
    WITH CHECK (auth.uid() = proponente_id OR auth.uid() = receptor_id);

-- 3. Función RPC Transaccional con Bloqueo Pesimista (SELECT FOR UPDATE)
CREATE OR REPLACE FUNCTION public.confirmar_handshake_trueque(p_propuesta_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_propuesta RECORD;
    v_current_user UUID;
    v_new_proponente BOOLEAN;
    v_new_receptor BOOLEAN;
    v_nuevo_estado VARCHAR(30);
BEGIN
    v_current_user := auth.uid();
    IF v_current_user IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;

    -- Bloqueo a nivel de fila (Pessimistic Concurrency Control)
    SELECT * INTO v_propuesta
    FROM public.propuesta_trueque
    WHERE id = p_propuesta_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Propuesta de trueque no encontrada';
    END IF;

    IF v_propuesta.estado = 'completada' THEN
        RETURN jsonb_build_object(
            'success', true,
            'estado', 'completada',
            'mensaje', 'El trueque ya se encuentra completado'
        );
    END IF;

    IF v_propuesta.estado = 'cancelada' THEN
        RAISE EXCEPTION 'No se puede confirmar un trueque previamente cancelado';
    END IF;

    IF v_current_user != v_propuesta.proponente_id AND v_current_user != v_propuesta.receptor_id THEN
        RAISE EXCEPTION 'No tienes permisos para confirmar este intercambio';
    END IF;

    v_new_proponente := v_propuesta.confirmado_proponente;
    v_new_receptor := v_propuesta.confirmado_receptor;

    IF v_current_user = v_propuesta.proponente_id THEN
        v_new_proponente := true;
    ELSIF v_current_user = v_propuesta.receptor_id THEN
        v_new_receptor := true;
    END IF;

    -- Doble confirmación alcanzada: Transacción ACID de cierre
    IF v_new_proponente AND v_new_receptor THEN
        v_nuevo_estado := 'completada';

        -- Cerrar y actualizar publicaciones involucradas
        UPDATE public.publicacion
        SET estado_publicacion = 'intercambiado',
            fecha_actualizacion = now()
        WHERE id::text IN (v_propuesta.publicacion_ofertada_id, v_propuesta.publicacion_solicitada_id);

        -- Cancelar atómicamente otras propuestas pendientes de los mismos artículos para evitar doble trueque
        UPDATE public.propuesta_trueque
        SET estado = 'cancelada',
            fecha_cierre = now(),
            updated_at = now()
        WHERE id != p_propuesta_id
          AND estado IN ('pendiente', 'confirmado_parcial')
          AND (
              publicacion_ofertada_id IN (v_propuesta.publicacion_ofertada_id, v_propuesta.publicacion_solicitada_id) OR
              publicacion_solicitada_id IN (v_propuesta.publicacion_ofertada_id, v_propuesta.publicacion_solicitada_id)
          );

        -- Actualizar propuesta principal
        UPDATE public.propuesta_trueque
        SET confirmado_proponente = true,
            confirmado_receptor = true,
            estado = 'completada',
            fecha_cierre = now(),
            updated_at = now()
        WHERE id = p_propuesta_id;

        RETURN jsonb_build_object(
            'success', true,
            'estado', 'completada',
            'mensaje', 'Intercambio completado exitosamente con doble confirmación'
        );
    ELSE
        -- Primera confirmación registrada: a la espera del interlocutor
        v_nuevo_estado := 'confirmado_parcial';
        UPDATE public.propuesta_trueque
        SET confirmado_proponente = v_new_proponente,
            confirmado_receptor = v_new_receptor,
            estado = v_nuevo_estado,
            updated_at = now()
        WHERE id = p_propuesta_id;

        RETURN jsonb_build_object(
            'success', true,
            'estado', 'confirmado_parcial',
            'mensaje', 'Confirmación registrada. Esperando que la contraparte confirme el intercambio'
        );
    END IF;
END;
$$;
