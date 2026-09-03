-- ============================================================
-- MÓDULO DE CLASES PRE-GRABADAS — Radiología con Fe
-- Ejecuta este script en Supabase → SQL Editor → New Query
-- ============================================================

-- ── 1. Crear tabla lessons ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lessons (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  description      TEXT,
  video_url        TEXT NOT NULL,          -- URL embed lista para usar (YouTube/Vimeo/Drive/MP4)
  original_url     TEXT,                   -- URL original tal como la ingresó el docente
  category         TEXT,
  duration_minutes INTEGER,
  is_published     BOOLEAN NOT NULL DEFAULT FALSE,
  order_index      INTEGER NOT NULL DEFAULT 0,
  author_id        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Índices ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_lessons_published   ON public.lessons(is_published);
CREATE INDEX IF NOT EXISTS idx_lessons_category    ON public.lessons(category);
CREATE INDEX IF NOT EXISTS idx_lessons_author      ON public.lessons(author_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order       ON public.lessons(order_index ASC);

-- ── 3. Trigger updated_at ─────────────────────────────────────────────────────
CREATE TRIGGER set_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── 4. Row Level Security (RLS) ───────────────────────────────────────────────
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Estudiantes, maestros y admins ven clases publicadas
CREATE POLICY "published_lessons_visible_to_all"
  ON public.lessons FOR SELECT
  USING (is_published = TRUE);

-- Maestros y admins ven TODAS las clases (incluyendo borradores)
CREATE POLICY "teacher_admin_read_all_lessons"
  ON public.lessons FOR SELECT
  USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));

-- Maestros y admins pueden crear clases
CREATE POLICY "teacher_admin_insert_lessons"
  ON public.lessons FOR INSERT
  WITH CHECK (public.get_user_role() IN ('TEACHER', 'ADMIN'));

-- Maestros y admins pueden actualizar clases
CREATE POLICY "teacher_admin_update_lessons"
  ON public.lessons FOR UPDATE
  USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));

-- Maestros y admins pueden eliminar clases
CREATE POLICY "teacher_admin_delete_lessons"
  ON public.lessons FOR DELETE
  USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));

-- ── 5. Datos de ejemplo (opcional) ───────────────────────────────────────────
-- Descomenta y ajusta si quieres insertar clases de prueba:
/*
INSERT INTO public.lessons (title, description, video_url, original_url, category, duration_minutes, is_published, order_index)
VALUES
  (
    'Introducción a la Radiología Diagnóstica',
    'Principios básicos de los rayos X, producción y factores técnicos. Clase introductoria para estudiantes de primer año.',
    'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'General / Introducción',
    45,
    TRUE,
    1
  ),
  (
    'Anatomía del Tórax en Rayos X — PA y Lateral',
    'Identificación de estructuras anatómicas en la radiografía de tórax: silueta cardíaca, hilios pulmonares, mediastino y diafragma.',
    'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'Anatomía Radiológica',
    60,
    TRUE,
    2
  );
*/

-- ✅ ¡Listo! La tabla de clases está configurada.
-- ¡Ahora sube tus clases desde el dashboard → Clases Pre-grabadas!
