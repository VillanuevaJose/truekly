-- Otorgar permisos controlados (principio de mínimo privilegio)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE public.publicacion TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.publicacion TO authenticated;
GRANT ALL ON TABLE public.publicacion TO service_role;

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.publicacion ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
DROP POLICY IF EXISTS "publicacion_select_all" ON public.publicacion;
CREATE POLICY "publicacion_select_all"
  ON public.publicacion
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "publicacion_insert_own" ON public.publicacion;
CREATE POLICY "publicacion_insert_own"
  ON public.publicacion
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "publicacion_update_own" ON public.publicacion;
CREATE POLICY "publicacion_update_own"
  ON public.publicacion
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "publicacion_delete_own" ON public.publicacion;
CREATE POLICY "publicacion_delete_own"
  ON public.publicacion
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
