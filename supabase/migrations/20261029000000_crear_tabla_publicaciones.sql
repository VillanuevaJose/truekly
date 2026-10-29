-- ==============================================================================
-- TRUEKLY - TABLA Y RLS PARA PUBLICACIONES (TRUEQUE LIBRE)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.publications (
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
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices de filtrado rápido en feed
CREATE INDEX IF NOT EXISTS idx_publications_category ON public.publications(category);
CREATE INDEX IF NOT EXISTS idx_publications_zone ON public.publications(zone);
CREATE INDEX IF NOT EXISTS idx_publications_user_id ON public.publications(user_id);
CREATE INDEX IF NOT EXISTS idx_publications_created_at ON public.publications(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;

-- Lectura pública para cualquier usuario (anónimo o autenticado)
DROP POLICY IF EXISTS "publications_select_all" ON public.publications;
CREATE POLICY "publications_select_all"
  ON public.publications
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Creación permitida solo para el usuario autenticado
DROP POLICY IF EXISTS "publications_insert_own" ON public.publications;
CREATE POLICY "publications_insert_own"
  ON public.publications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Actualización permitida solo para el dueño
DROP POLICY IF EXISTS "publications_update_own" ON public.publications;
CREATE POLICY "publications_update_own"
  ON public.publications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Eliminación permitida solo para el dueño
DROP POLICY IF EXISTS "publications_delete_own" ON public.publications;
CREATE POLICY "publications_delete_own"
  ON public.publications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
