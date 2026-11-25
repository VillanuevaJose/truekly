-- 1. Rol en profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_role_check' AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

-- 2. Estado de revisión en publicacion (existentes pasan como aprobadas)
ALTER TABLE public.publicacion
  ADD COLUMN IF NOT EXISTS estado_revision text NOT NULL DEFAULT 'aprobada',
  ADD COLUMN IF NOT EXISTS motivo_rechazo text;

ALTER TABLE public.publicacion
  ALTER COLUMN estado_revision SET DEFAULT 'pendiente';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'publicacion_estado_revision_check' AND conrelid = 'public.publicacion'::regclass
  ) THEN
    ALTER TABLE public.publicacion
      ADD CONSTRAINT publicacion_estado_revision_check CHECK (estado_revision IN ('pendiente', 'aprobada', 'rechazada'));
  END IF;
END $$;

-- 3. Función helper is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 4. Actualizar RLS de publicacion
DROP POLICY IF EXISTS publicacion_select_all ON public.publicacion;
CREATE POLICY publicacion_select_all ON public.publicacion
  FOR SELECT
  USING (
    estado_revision = 'aprobada'
    OR auth.uid() = user_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS publicacion_insert_own ON public.publicacion;
CREATE POLICY publicacion_insert_own ON public.publicacion
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (auth.uid() = user_id OR user_id IS NULL)
  );

DROP POLICY IF EXISTS publicacion_update_own ON public.publicacion;
CREATE POLICY publicacion_update_own ON public.publicacion
  FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS publicacion_delete_own ON public.publicacion;
CREATE POLICY publicacion_delete_own ON public.publicacion
  FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- 4b. Ajustar constraints de notificacion (permitir tipos de moderación y apuntar FK a auth.users)
ALTER TABLE public.notificacion
  DROP CONSTRAINT IF EXISTS notificacion_tipo_check;
ALTER TABLE public.notificacion
  ADD CONSTRAINT notificacion_tipo_check CHECK (
    tipo::text = ANY (
      ARRAY[
        'chat', 'intercambio', 'sistema', 'comunidad', 'subasta', 'reporte',
        'publicacion_aprobada', 'publicacion_rechazada'
      ]::text[]
    )
  );

ALTER TABLE public.notificacion
  DROP CONSTRAINT IF EXISTS notificacion_usuario_id_fkey;
ALTER TABLE public.notificacion
  ADD CONSTRAINT notificacion_usuario_id_fkey
  FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. RPC transaccional para aprobar o rechazar publicaciones y notificar al autor
CREATE OR REPLACE FUNCTION public.revisar_publicacion(
  p_publicacion_id text,
  p_decision text,
  p_motivo text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_title text;
  v_motivo text;
  v_contenido text;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo un administrador puede revisar publicaciones';
  END IF;

  IF p_decision NOT IN ('aprobada', 'rechazada') THEN
    RAISE EXCEPTION 'Decisión inválida: %', p_decision;
  END IF;

  v_motivo := NULLIF(BTRIM(COALESCE(p_motivo, '')), '');

  UPDATE public.publicacion
  SET
    estado_revision = p_decision,
    motivo_rechazo = CASE WHEN p_decision = 'rechazada' THEN v_motivo ELSE NULL END
  WHERE id = p_publicacion_id
  RETURNING user_id, title INTO v_user_id, v_title;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Publicación no encontrada: %', p_publicacion_id;
  END IF;

  IF v_user_id IS NOT NULL THEN
    IF p_decision = 'aprobada' THEN
      v_contenido := format('Tu publicación "%s" fue aprobada y ya está visible en el feed.', v_title);
    ELSE
      IF v_motivo IS NOT NULL THEN
        v_contenido := format('Tu publicación "%s" fue rechazada. Motivo: %s', v_title, v_motivo);
      ELSE
        v_contenido := format('Tu publicación "%s" fue rechazada por no cumplir las normas de la comunidad.', v_title);
      END IF;
    END IF;

    INSERT INTO public.notificacion (usuario_id, tipo, contenido, leida)
    VALUES (
      v_user_id,
      CASE WHEN p_decision = 'aprobada' THEN 'publicacion_aprobada' ELSE 'publicacion_rechazada' END,
      v_contenido,
      false
    );
  END IF;
END;
$$;

-- 6. Permisos Data API y Realtime para notificacion
REVOKE TRUNCATE ON public.notificacion FROM anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.notificacion TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notificacion'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacion;
  END IF;
END $$;
