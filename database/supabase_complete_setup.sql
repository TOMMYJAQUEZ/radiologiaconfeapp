-- ============================================================
-- RADIOLOGÍA CON FE — SCRIPT COMPLETO PARA SUPABASE
-- 
-- INSTRUCCIONES:
--   1. Ve al dashboard de Supabase → SQL Editor
--   2. Haz clic en "New query"
--   3. Copia y pega TODO este archivo
--   4. Haz clic en "Run" (▶️)
--   5. Verifica las tablas en Table Editor
--
-- Este script crea:
--   ✅ 11 tablas con todas sus relaciones
--   ✅ Índices de rendimiento
--   ✅ Triggers automáticos (updated_at, nuevo usuario, progreso)
--   ✅ Políticas RLS (Row Level Security)
--   ✅ Función helper para roles
-- ============================================================

-- ============================================================
-- PARTE 1: EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PARTE 2: TABLAS
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- PROFILES — Extiende auth.users con datos del perfil
-- Se crea automáticamente al registrar un usuario
-- ────────────────────────────────────────────────────────────
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

-- ────────────────────────────────────────────────────────────
-- CATEGORIES — Materias de radiología
-- ────────────────────────────────────────────────────────────
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

-- ────────────────────────────────────────────────────────────
-- SUBCATEGORIES — Subcategorías de cada materia
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subcategories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- QUESTIONS — Banco de preguntas
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.questions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id      UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  subcategory_id   UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
  question_text    TEXT NOT NULL,
  difficulty       TEXT NOT NULL DEFAULT 'basic' CHECK (difficulty IN ('basic', 'intermediate', 'advanced')),
  question_type    TEXT NOT NULL DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_in_the_blank')),
  explanation      TEXT NOT NULL DEFAULT '',
  points           INTEGER NOT NULL DEFAULT 1,
  image_url        TEXT,
  image_alt        TEXT,
  image_caption    TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  author_id        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- QUESTION_OPTIONS — Opciones de respuesta por pregunta
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.question_options (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id  UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  option_text  TEXT NOT NULL,
  is_correct   BOOLEAN NOT NULL DEFAULT FALSE,
  order_index  INTEGER NOT NULL DEFAULT 0
);

-- ────────────────────────────────────────────────────────────
-- EXAMS — Exámenes configurados por maestros
-- ────────────────────────────────────────────────────────────
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

-- ────────────────────────────────────────────────────────────
-- EXAM_ATTEMPTS — Intentos de examen por estudiante
-- ────────────────────────────────────────────────────────────
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

-- ────────────────────────────────────────────────────────────
-- ATTEMPT_ANSWERS — Respuestas individuales (snapshot inmutable)
-- ────────────────────────────────────────────────────────────
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

-- ────────────────────────────────────────────────────────────
-- CERTIFICATES — Certificados emitidos
-- ────────────────────────────────────────────────────────────
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

-- ────────────────────────────────────────────────────────────
-- STUDENT_PROGRESS — Progreso acumulado por categoría
-- ────────────────────────────────────────────────────────────
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

-- ────────────────────────────────────────────────────────────
-- AUDIT_LOGS — Registro de auditoría
-- ────────────────────────────────────────────────────────────
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
-- PARTE 3: ÍNDICES DE RENDIMIENTO
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_questions_category   ON public.questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty  ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_active      ON public.questions(is_active);
CREATE INDEX IF NOT EXISTS idx_exams_category        ON public.exams(category_id);
CREATE INDEX IF NOT EXISTS idx_exams_published       ON public.exams(is_published);
CREATE INDEX IF NOT EXISTS idx_attempts_student      ON public.exam_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_attempts_exam         ON public.exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_attempts_status       ON public.exam_attempts(status);
CREATE INDEX IF NOT EXISTS idx_answers_attempt       ON public.attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_progress_student      ON public.student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_audit_user            ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created         ON public.audit_logs(created_at DESC);


-- ============================================================
-- PARTE 4: FUNCIONES Y TRIGGERS
-- ============================================================

-- ── Trigger: actualizar updated_at automáticamente ──────────
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

-- ── Trigger: crear perfil automáticamente al registrarse ────
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

-- ── Trigger: actualizar progreso al completar un intento ────
CREATE OR REPLACE FUNCTION public.update_student_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_category_id UUID;
BEGIN
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


-- ============================================================
-- PARTE 5: ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_answers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs       ENABLE ROW LEVEL SECURITY;

-- ── Función helper: obtener rol del usuario actual ──────────
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ── PROFILES ────────────────────────────────────────────────
-- Estudiante ve su propio perfil
CREATE POLICY "student_own_profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

-- Maestro y admin ven todos los perfiles
CREATE POLICY "teacher_view_profiles" ON public.profiles
  FOR SELECT USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));

-- Estudiante actualiza su propio perfil (no puede cambiar su rol)
CREATE POLICY "student_update_own_profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Admin puede actualizar cualquier perfil
CREATE POLICY "admin_update_profiles" ON public.profiles
  FOR UPDATE USING (public.get_user_role() = 'ADMIN');

-- Admin puede insertar perfiles
CREATE POLICY "admin_insert_profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.get_user_role() = 'ADMIN');


-- ── CATEGORIES ──────────────────────────────────────────────
CREATE POLICY "all_read_categories" ON public.categories
  FOR SELECT USING (TRUE);

CREATE POLICY "teacher_manage_categories" ON public.categories
  FOR ALL USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));


-- ── SUBCATEGORIES ───────────────────────────────────────────
CREATE POLICY "all_read_subcategories" ON public.subcategories
  FOR SELECT USING (TRUE);

CREATE POLICY "teacher_manage_subcategories" ON public.subcategories
  FOR ALL USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));


-- ── QUESTIONS ───────────────────────────────────────────────
-- Estudiante solo ve preguntas activas
CREATE POLICY "student_read_active_questions" ON public.questions
  FOR SELECT USING (is_active = TRUE);

-- Maestro y admin gestionan todas las preguntas
CREATE POLICY "teacher_manage_questions" ON public.questions
  FOR ALL USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));


-- ── QUESTION OPTIONS ────────────────────────────────────────
CREATE POLICY "all_read_options" ON public.question_options
  FOR SELECT USING (TRUE);

CREATE POLICY "teacher_manage_options" ON public.question_options
  FOR ALL USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));


-- ── EXAMS ───────────────────────────────────────────────────
-- Estudiante solo ve exámenes publicados
CREATE POLICY "student_read_published_exams" ON public.exams
  FOR SELECT USING (is_published = TRUE);

-- Maestro y admin ven todos los exámenes
CREATE POLICY "teacher_read_all_exams" ON public.exams
  FOR SELECT USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));

-- Maestro y admin gestionan exámenes
CREATE POLICY "teacher_manage_exams" ON public.exams
  FOR INSERT WITH CHECK (public.get_user_role() IN ('TEACHER', 'ADMIN'));

CREATE POLICY "teacher_update_exams" ON public.exams
  FOR UPDATE USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));

CREATE POLICY "teacher_delete_exams" ON public.exams
  FOR DELETE USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));


-- ── EXAM ATTEMPTS ───────────────────────────────────────────
-- Estudiante ve solo sus propios intentos
CREATE POLICY "student_own_attempts" ON public.exam_attempts
  FOR SELECT USING (student_id = auth.uid());

-- Estudiante puede crear sus propios intentos
CREATE POLICY "student_create_attempts" ON public.exam_attempts
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- Estudiante puede actualizar sus propios intentos
CREATE POLICY "student_update_own_attempts" ON public.exam_attempts
  FOR UPDATE USING (student_id = auth.uid());

-- Maestro y admin ven todos los intentos
CREATE POLICY "teacher_read_all_attempts" ON public.exam_attempts
  FOR SELECT USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));


-- ── ATTEMPT ANSWERS ─────────────────────────────────────────
-- Estudiante ve solo sus propias respuestas
CREATE POLICY "student_own_answers" ON public.attempt_answers
  FOR SELECT USING (
    attempt_id IN (
      SELECT id FROM public.exam_attempts WHERE student_id = auth.uid()
    )
  );

-- Estudiante puede insertar sus propias respuestas
CREATE POLICY "student_insert_answers" ON public.attempt_answers
  FOR INSERT WITH CHECK (
    attempt_id IN (
      SELECT id FROM public.exam_attempts WHERE student_id = auth.uid()
    )
  );

-- Maestro y admin ven todas las respuestas
CREATE POLICY "teacher_read_all_answers" ON public.attempt_answers
  FOR SELECT USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));


-- ── CERTIFICATES ────────────────────────────────────────────
-- Cualquiera puede verificar un certificado (página pública de verificación)
CREATE POLICY "public_read_certificates" ON public.certificates
  FOR SELECT USING (TRUE);

-- Maestro y admin gestionan certificados
CREATE POLICY "teacher_manage_certificates" ON public.certificates
  FOR ALL USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));


-- ── STUDENT PROGRESS ────────────────────────────────────────
CREATE POLICY "student_own_progress" ON public.student_progress
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "teacher_read_all_progress" ON public.student_progress
  FOR SELECT USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));


-- ── AUDIT LOGS ──────────────────────────────────────────────
CREATE POLICY "admin_read_audit" ON public.audit_logs
  FOR SELECT USING (public.get_user_role() = 'ADMIN');

CREATE POLICY "system_insert_audit" ON public.audit_logs
  FOR INSERT WITH CHECK (TRUE);


-- ============================================================
-- ✅ ¡LISTO! Tu base de datos está completamente configurada.
--
-- Tablas creadas: 11
-- Índices: 12
-- Triggers: 4 (updated_at x3, nuevo usuario, progreso)
-- Políticas RLS: 27
--
-- Próximo paso: registra un usuario desde tu app
-- y verifica que aparezca en la tabla "profiles".
-- ============================================================
