-- Otorgar permisos a los roles de la API de Supabase (anon y authenticated)
GRANT ALL ON TABLE public.publicacion TO anon, authenticated, service_role;

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
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "publicacion_update_own" ON public.publicacion;
CREATE POLICY "publicacion_update_own"
  ON public.publicacion
  FOR UPDATE
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "publicacion_delete_own" ON public.publicacion;
CREATE POLICY "publicacion_delete_own"
  ON public.publicacion
  FOR DELETE
  TO anon, authenticated
  USING (true);
