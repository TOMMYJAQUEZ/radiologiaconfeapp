-- ============================================================
-- RADIOLOGÍA CON FE — SCRIPT MAESTRO DE BASE DE DATOS
-- Copia y pega TODO este código en:
-- Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TABLA: teacher_signatures (Firmas de Maestros)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.teacher_signatures (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id    UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  signature_url TEXT,
  signature_b64 TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. TABLA: director_config (Configuración y Ponderaciones del Director)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.director_config (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_name     TEXT NOT NULL DEFAULT 'Radiología con Fe',
  program_name         TEXT NOT NULL DEFAULT 'Técnico en Radiología e Imágenes Médicas',
  director_name        TEXT NOT NULL DEFAULT 'Francisco Jáquez',
  director_title       TEXT NOT NULL DEFAULT 'Director General',
  passing_grade        NUMERIC(5,2) NOT NULL DEFAULT 70.00,
  weight_exams         NUMERIC(5,2) NOT NULL DEFAULT 35.00,
  weight_lab           NUMERIC(5,2) NOT NULL DEFAULT 25.00,
  weight_assignments   NUMERIC(5,2) NOT NULL DEFAULT 25.00,
  weight_participation NUMERIC(5,2) NOT NULL DEFAULT 15.00,
  director_signature_url TEXT,
  director_signature_b64 TEXT,
  certificate_footer   TEXT DEFAULT 'Este certificado avala el desempeño académico integral del participante en la plataforma educativa Radiología con Fe.',
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.director_config (id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. TABLA: assignments (Tareas de Maestros)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assignments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  category_id  UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  instructions TEXT,
  due_date     TIMESTAMPTZ,
  max_score    NUMERIC(5,2) NOT NULL DEFAULT 100.00,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. TABLA: assignment_submissions (Entregas de Estudiantes)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id  UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content        TEXT,
  file_url       TEXT,
  plagiarism_report JSONB,
  submitted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- ============================================================
-- 5. TABLA: assignment_grades (Calificaciones de Tareas y Participación)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assignment_grades (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id       UUID NOT NULL UNIQUE REFERENCES public.assignment_submissions(id) ON DELETE CASCADE,
  teacher_id          UUID NOT NULL REFERENCES public.profiles(id),
  score               NUMERIC(5,2) NOT NULL,
  feedback            TEXT,
  participation_score NUMERIC(5,2) DEFAULT 0,
  is_published        BOOLEAN NOT NULL DEFAULT FALSE,
  graded_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. TABLA: certificate_requests (Solicitudes de Certificados)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.certificate_requests (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_id           UUID REFERENCES public.profiles(id),
  grade_exams          NUMERIC(5,2),
  grade_lab            NUMERIC(5,2),
  grade_assignments    NUMERIC(5,2),
  grade_participation  NUMERIC(5,2),
  grade_total          NUMERIC(5,2),
  status               TEXT NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','teacher_approved','teacher_rejected','director_approved','director_rejected','issued')),
  teacher_note         TEXT,
  director_note        TEXT,
  teacher_approved_at  TIMESTAMPTZ,
  director_approved_at TIMESTAMPTZ,
  issued_at            TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. TABLA: certificates (Certificados Expedidos Oficiales)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.certificates (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id           UUID REFERENCES public.certificate_requests(id) ON DELETE SET NULL,
  student_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_id           UUID REFERENCES public.profiles(id),
  certificate_number   TEXT NOT NULL UNIQUE,
  student_name         TEXT NOT NULL,
  program_name         TEXT NOT NULL,
  institution_name     TEXT NOT NULL DEFAULT 'Radiología con Fe',
  teacher_name         TEXT,
  director_name        TEXT NOT NULL DEFAULT 'Francisco Jáquez',
  grade_total          NUMERIC(5,2),
  teacher_signature    TEXT,
  director_signature   TEXT,
  verification_code    TEXT NOT NULL UNIQUE DEFAULT UPPER(REPLACE(uuid_generate_v4()::TEXT, '-', '')),
  pdf_url              TEXT,
  issued_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. TABLA: notifications (Notificaciones en Tiempo Real)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'assignment', 'grade', 'exam', 'certificate', 'system')),
  link_url    TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON public.notifications(user_id, is_read, created_at DESC);

-- ============================================================
-- 9. TABLA: lessons (Clases Pre-grabadas / Videoteca)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lessons (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  description      TEXT,
  video_url        TEXT NOT NULL,
  original_url     TEXT,
  category         TEXT,
  duration_minutes INTEGER,
  is_published     BOOLEAN NOT NULL DEFAULT FALSE,
  order_index      INTEGER NOT NULL DEFAULT 0,
  author_id        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. FUNCIÓN: Generador de Número de Certificado Secuencial
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  seq_num      INTEGER;
  new_number   TEXT;
BEGIN
  current_year := TO_CHAR(NOW(), 'YYYY');
  SELECT COUNT(*) + 1 INTO seq_num
  FROM public.certificates
  WHERE certificate_number LIKE 'RCF-' || current_year || '-%';

  new_number := 'RCF-' || current_year || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 11. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.teacher_signatures    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.director_config       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_grades     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons               ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 12. POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================================

-- teacher_signatures
DROP POLICY IF EXISTS "signatures_select_all" ON public.teacher_signatures;
CREATE POLICY "signatures_select_all" ON public.teacher_signatures FOR SELECT USING (true);

DROP POLICY IF EXISTS "signatures_modify_own" ON public.teacher_signatures;
CREATE POLICY "signatures_modify_own" ON public.teacher_signatures FOR ALL USING (teacher_id = auth.uid() OR public.get_user_role() = 'ADMIN');

-- director_config
DROP POLICY IF EXISTS "director_config_read" ON public.director_config;
CREATE POLICY "director_config_read" ON public.director_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "director_config_update" ON public.director_config;
CREATE POLICY "director_config_update" ON public.director_config FOR UPDATE USING (public.get_user_role() = 'ADMIN');

-- assignments
DROP POLICY IF EXISTS "assignments_read_all" ON public.assignments;
CREATE POLICY "assignments_read_all" ON public.assignments FOR SELECT USING (is_published = true OR public.get_user_role() IN ('TEACHER', 'ADMIN'));

DROP POLICY IF EXISTS "assignments_modify_teacher" ON public.assignments;
CREATE POLICY "assignments_modify_teacher" ON public.assignments FOR ALL USING (teacher_id = auth.uid() OR public.get_user_role() = 'ADMIN');

-- assignment_submissions
DROP POLICY IF EXISTS "submissions_read" ON public.assignment_submissions;
CREATE POLICY "submissions_read" ON public.assignment_submissions FOR SELECT USING (student_id = auth.uid() OR public.get_user_role() IN ('TEACHER', 'ADMIN'));

DROP POLICY IF EXISTS "submissions_insert_student" ON public.assignment_submissions;
CREATE POLICY "submissions_insert_student" ON public.assignment_submissions FOR INSERT WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "submissions_update_student" ON public.assignment_submissions;
CREATE POLICY "submissions_update_student" ON public.assignment_submissions FOR UPDATE USING (student_id = auth.uid());

-- assignment_grades
DROP POLICY IF EXISTS "grades_read" ON public.assignment_grades;
CREATE POLICY "grades_read" ON public.assignment_grades FOR SELECT USING (
  is_published = true OR 
  public.get_user_role() IN ('TEACHER', 'ADMIN') OR
  EXISTS (SELECT 1 FROM public.assignment_submissions sub WHERE sub.id = submission_id AND sub.student_id = auth.uid())
);

DROP POLICY IF EXISTS "grades_modify_teacher" ON public.assignment_grades;
CREATE POLICY "grades_modify_teacher" ON public.assignment_grades FOR ALL USING (teacher_id = auth.uid() OR public.get_user_role() = 'ADMIN');

-- certificate_requests
DROP POLICY IF EXISTS "cert_req_select" ON public.certificate_requests;
CREATE POLICY "cert_req_select" ON public.certificate_requests FOR SELECT USING (student_id = auth.uid() OR public.get_user_role() IN ('TEACHER', 'ADMIN'));

DROP POLICY IF EXISTS "cert_req_insert" ON public.certificate_requests;
CREATE POLICY "cert_req_insert" ON public.certificate_requests FOR INSERT WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "cert_req_update" ON public.certificate_requests;
CREATE POLICY "cert_req_update" ON public.certificate_requests FOR UPDATE USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));

-- certificates
DROP POLICY IF EXISTS "certs_select_public" ON public.certificates;
CREATE POLICY "certs_select_public" ON public.certificates FOR SELECT USING (true);

DROP POLICY IF EXISTS "certs_insert_admin" ON public.certificates;
CREATE POLICY "certs_insert_admin" ON public.certificates FOR INSERT WITH CHECK (public.get_user_role() = 'ADMIN');

-- notifications
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_insert_all" ON public.notifications;
CREATE POLICY "notifications_insert_all" ON public.notifications FOR INSERT WITH CHECK (true);

-- lessons
DROP POLICY IF EXISTS "lessons_read" ON public.lessons;
CREATE POLICY "lessons_read" ON public.lessons FOR SELECT USING (is_published = true OR public.get_user_role() IN ('TEACHER', 'ADMIN'));

DROP POLICY IF EXISTS "lessons_modify" ON public.lessons;
CREATE POLICY "lessons_modify" ON public.lessons FOR ALL USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));

-- ============================================================
-- ¡LISTO! RECARGAR LA PLATAFORMA DESPUÉS DE EJECUTAR
-- ============================================================
