-- ============================================================
-- RADIOLOGÍA CON FE — MIGRACIÓN INICIAL
-- Ejecutar en el editor SQL de Supabase
-- ============================================================

-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: profiles
-- Extiende auth.users de Supabase con datos del perfil
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'TEACHER', 'ADMIN')),
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  institution TEXT,
  academic_level TEXT,
  country     TEXT,
  phone       TEXT,
  student_id  TEXT,
  avatar_url  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: categories (materias)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  icon        TEXT,
  color       TEXT DEFAULT '#f2c400',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: subcategories
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subcategories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: questions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.questions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id      UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  subcategory_id   UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
  question_text    TEXT NOT NULL,
  difficulty       TEXT NOT NULL DEFAULT 'basic' CHECK (difficulty IN ('basic', 'intermediate', 'advanced')),
  question_type    TEXT NOT NULL DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false')),
  explanation      TEXT NOT NULL DEFAULT '',
  points           INTEGER NOT NULL DEFAULT 1,
  image_url        TEXT,
  image_alt        TEXT,
  image_caption    TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  author_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET DEFAULT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: question_options
-- ============================================================
CREATE TABLE IF NOT EXISTS public.question_options (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id  UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  option_text  TEXT NOT NULL,
  is_correct   BOOLEAN NOT NULL DEFAULT FALSE,
  order_index  INTEGER NOT NULL DEFAULT 0
);

-- Garantizar al menos una opción correcta por pregunta (trigger)
CREATE OR REPLACE FUNCTION check_correct_option()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.question_options
    WHERE question_id = NEW.question_id AND is_correct = TRUE
  ) THEN
    RAISE EXCEPTION 'Each question must have at least one correct option';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLA: exams
-- ============================================================
CREATE TABLE IF NOT EXISTS public.exams (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                TEXT NOT NULL,
  description          TEXT,
  category_id          UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  question_count       INTEGER NOT NULL DEFAULT 10 CHECK (question_count > 0),
  time_limit_minutes   INTEGER CHECK (time_limit_minutes > 0),
  passing_score        INTEGER NOT NULL DEFAULT 70 CHECK (passing_score BETWEEN 1 AND 100),
  difficulty           TEXT CHECK (difficulty IN ('basic', 'intermediate', 'advanced')),
  is_published         BOOLEAN NOT NULL DEFAULT FALSE,
  created_by           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: exam_attempts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.exam_attempts (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id             UUID NOT NULL REFERENCES public.exams(id) ON DELETE RESTRICT,
  student_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at        TIMESTAMPTZ,
  total_questions     INTEGER NOT NULL DEFAULT 0,
  correct_answers     INTEGER NOT NULL DEFAULT 0,
  incorrect_answers   INTEGER NOT NULL DEFAULT 0,
  unanswered          INTEGER NOT NULL DEFAULT 0,
  score_percentage    NUMERIC(5,2),
  is_passed           BOOLEAN,
  time_used_seconds   INTEGER,
  status              TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'expired'))
);

-- ============================================================
-- TABLA: attempt_answers (snapshot inmutable)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.attempt_answers (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id              UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
  question_id             UUID NOT NULL REFERENCES public.questions(id) ON DELETE RESTRICT,
  question_text_snapshot  TEXT NOT NULL,
  selected_option_id      UUID REFERENCES public.question_options(id) ON DELETE SET NULL,
  correct_option_id       UUID NOT NULL REFERENCES public.question_options(id) ON DELETE RESTRICT,
  is_correct              BOOLEAN NOT NULL DEFAULT FALSE,
  options_snapshot        JSONB NOT NULL DEFAULT '[]',
  order_index             INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- TABLA: certificates
-- ============================================================
CREATE TABLE IF NOT EXISTS public.certificates (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_id             UUID NOT NULL REFERENCES public.exams(id) ON DELETE RESTRICT,
  attempt_id          UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE RESTRICT,
  certificate_number  TEXT NOT NULL UNIQUE,
  issued_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  teacher_signature   TEXT,
  is_valid            BOOLEAN NOT NULL DEFAULT TRUE,
  qr_code_url         TEXT
);

-- ============================================================
-- TABLA: student_progress (materializado por categoría)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.student_progress (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id     UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  total_attempts  INTEGER NOT NULL DEFAULT 0,
  avg_score       NUMERIC(5,2) NOT NULL DEFAULT 0,
  best_score      NUMERIC(5,2) NOT NULL DEFAULT 0,
  worst_score     NUMERIC(5,2) NOT NULL DEFAULT 100,
  last_attempt_at TIMESTAMPTZ,
  UNIQUE (student_id, category_id)
);

-- ============================================================
-- TABLA: audit_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   UUID,
  details     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_questions_category ON public.questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_active ON public.questions(is_active);
CREATE INDEX IF NOT EXISTS idx_exams_category ON public.exams(category_id);
CREATE INDEX IF NOT EXISTS idx_exams_published ON public.exams(is_published);
CREATE INDEX IF NOT EXISTS idx_attempts_student ON public.exam_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_attempts_exam ON public.exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_attempts_status ON public.exam_attempts(status);
CREATE INDEX IF NOT EXISTS idx_answers_attempt ON public.attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_progress_student ON public.student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);

-- ============================================================
-- FUNCIÓN: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_exams_updated_at
  BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FUNCIÓN: auto-crear perfil al registrarse
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Sin nombre'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- FUNCIÓN: actualizar student_progress al terminar un intento
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_student_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_category_id UUID;
BEGIN
  -- Solo actuar cuando se completa el intento
  IF NEW.status = 'submitted' AND OLD.status = 'in_progress' THEN
    SELECT category_id INTO v_category_id FROM public.exams WHERE id = NEW.exam_id;

    INSERT INTO public.student_progress (student_id, category_id, total_attempts, avg_score, best_score, worst_score, last_attempt_at)
    VALUES (NEW.student_id, v_category_id, 1, NEW.score_percentage, NEW.score_percentage, NEW.score_percentage, NEW.submitted_at)
    ON CONFLICT (student_id, category_id) DO UPDATE SET
      total_attempts  = student_progress.total_attempts + 1,
      avg_score       = (student_progress.avg_score * student_progress.total_attempts + EXCLUDED.avg_score) / (student_progress.total_attempts + 1),
      best_score      = GREATEST(student_progress.best_score, EXCLUDED.best_score),
      worst_score     = LEAST(student_progress.worst_score, EXCLUDED.worst_score),
      last_attempt_at = EXCLUDED.last_attempt_at;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_attempt_submitted
  AFTER UPDATE ON public.exam_attempts
  FOR EACH ROW EXECUTE FUNCTION public.update_student_progress();
