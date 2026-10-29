DROP TABLE IF EXISTS public.foto_publicacion CASCADE;
DROP TABLE IF EXISTS public.publicacion CASCADE;

CREATE TABLE public.publicacion (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL,
  condition text NOT NULL,
  wants_in_return text NOT NULL,
  description text NOT NULL,
  zone text NOT NULL,
  safe_point_recommended text,
  image text NOT NULL,
  gallery text[] NOT NULL DEFAULT '{}',
  owner_name text NOT NULL,
  owner_avatar text,
  owner_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.publicacion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "publicacion_select_all"
  ON public.publicacion
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "publicacion_insert_own"
  ON public.publicacion
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "publicacion_update_own"
  ON public.publicacion
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "publicacion_delete_own"
  ON public.publicacion
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
