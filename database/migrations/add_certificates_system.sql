-- ============================================================
-- RADIOLOGÍA CON FE — SISTEMA INTEGRAL DE CERTIFICACIÓN
-- Ejecutar en el editor SQL de Supabase DESPUÉS de 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- TABLA: teacher_signatures
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
-- TABLA: director_config
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
ON CONFLICT DO NOTHING;

-- ============================================================
-- TABLA: assignments
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
-- TABLA: assignment_submissions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id  UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content        TEXT,
  file_url       TEXT,
  submitted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- ============================================================
-- TABLA: assignment_grades
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
-- TABLA: certificate_requests
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
-- TABLA: certificates
-- ============================================================
CREATE TABLE IF NOT EXISTS public.certificates (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id          UUID NOT NULL UNIQUE REFERENCES public.certificate_requests(id),
  student_id          UUID NOT NULL REFERENCES public.profiles(id),
  teacher_id          UUID REFERENCES public.profiles(id),
  certificate_number  TEXT NOT NULL UNIQUE,
  student_name        TEXT NOT NULL,
  program_name        TEXT NOT NULL,
  institution_name    TEXT NOT NULL,
  teacher_name        TEXT,
  director_name       TEXT NOT NULL,
  grade_total         NUMERIC(5,2),
  teacher_signature   TEXT,
  director_signature  TEXT,
  verification_code   TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::TEXT,
  issued_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FUNCIÓN: número de certificado secuencial
-- ============================================================
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  year_str TEXT;
BEGIN
  year_str := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SPLIT_PART(certificate_number, '-', 3) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.certificates
  WHERE certificate_number LIKE 'RCF-' || year_str || '-%';
  RETURN 'RCF-' || year_str || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.teacher_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.director_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "signatures_own" ON public.teacher_signatures FOR ALL
  USING (teacher_id = auth.uid() OR EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='ADMIN'));

CREATE POLICY "dir_config_read" ON public.director_config FOR SELECT USING (true);
CREATE POLICY "dir_config_write" ON public.director_config FOR ALL
  USING (EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='ADMIN'));

CREATE POLICY "assignments_read" ON public.assignments FOR SELECT
  USING (is_published=true OR teacher_id=auth.uid() OR EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='ADMIN'));
CREATE POLICY "assignments_write" ON public.assignments FOR ALL
  USING (teacher_id=auth.uid() OR EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='ADMIN'));

CREATE POLICY "submissions_read" ON public.assignment_submissions FOR SELECT
  USING (student_id=auth.uid() OR EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role IN ('TEACHER','ADMIN')));
CREATE POLICY "submissions_insert" ON public.assignment_submissions FOR INSERT
  WITH CHECK (student_id=auth.uid());

CREATE POLICY "grades_read" ON public.assignment_grades FOR SELECT
  USING (is_published=true OR EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role IN ('TEACHER','ADMIN')));
CREATE POLICY "grades_write" ON public.assignment_grades FOR ALL
  USING (EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role IN ('TEACHER','ADMIN')));

CREATE POLICY "cert_req_select" ON public.certificate_requests FOR SELECT
  USING (student_id=auth.uid() OR EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role IN ('TEACHER','ADMIN')));
CREATE POLICY "cert_req_insert" ON public.certificate_requests FOR INSERT
  WITH CHECK (student_id=auth.uid());
CREATE POLICY "cert_req_update" ON public.certificate_requests FOR UPDATE
  USING (EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role IN ('TEACHER','ADMIN')));

CREATE POLICY "certificates_select" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "certificates_insert" ON public.certificates FOR INSERT
  WITH CHECK (EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND role='ADMIN'));
