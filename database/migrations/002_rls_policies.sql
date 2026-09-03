-- ============================================================
-- ROW LEVEL SECURITY — RADIOLOGÍA CON FE
-- Ejecutar DESPUÉS de 001_initial_schema.sql
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- FUNCIÓN HELPER: obtener rol del usuario actual
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- PROFILES
-- ============================================================
-- Estudiante ve su propio perfil
CREATE POLICY "student_own_profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

-- Maestro y admin ven todos los perfiles
CREATE POLICY "teacher_view_profiles" ON public.profiles
  FOR SELECT USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));

-- Estudiante actualiza su propio perfil (no puede cambiar rol)
CREATE POLICY "student_update_own_profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Admin puede actualizar cualquier perfil
CREATE POLICY "admin_update_profiles" ON public.profiles
  FOR UPDATE USING (public.get_user_role() = 'ADMIN');

-- Admin puede insertar perfiles (para crear maestros, etc.)
CREATE POLICY "admin_insert_profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.get_user_role() = 'ADMIN');

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE POLICY "all_read_categories" ON public.categories
  FOR SELECT USING (TRUE);

CREATE POLICY "teacher_manage_categories" ON public.categories
  FOR ALL USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));

-- ============================================================
-- SUBCATEGORIES
-- ============================================================
CREATE POLICY "all_read_subcategories" ON public.subcategories
  FOR SELECT USING (TRUE);

CREATE POLICY "teacher_manage_subcategories" ON public.subcategories
  FOR ALL USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));

-- ============================================================
-- QUESTIONS
-- ============================================================
-- Estudiante solo ve preguntas activas (SIN ver cuál es correcta — eso lo controla la app)
CREATE POLICY "student_read_active_questions" ON public.questions
  FOR SELECT USING (is_active = TRUE);

-- Maestro y admin gestionan preguntas
CREATE POLICY "teacher_manage_questions" ON public.questions
  FOR ALL USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));

-- ============================================================
-- QUESTION OPTIONS
-- ============================================================
-- Estudiante puede ver opciones (la lógica del server action oculta cuál es correcta)
CREATE POLICY "all_read_options" ON public.question_options
  FOR SELECT USING (TRUE);

CREATE POLICY "teacher_manage_options" ON public.question_options
  FOR ALL USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));

-- ============================================================
-- EXAMS
-- ============================================================
-- Estudiante solo ve exámenes publicados
CREATE POLICY "student_read_published_exams" ON public.exams
  FOR SELECT USING (is_published = TRUE);

-- Maestro y admin ven todos los exámenes
CREATE POLICY "teacher_read_all_exams" ON public.exams
  FOR SELECT USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));

CREATE POLICY "teacher_manage_exams" ON public.exams
  FOR INSERT UPDATE DELETE USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));

-- ============================================================
-- EXAM ATTEMPTS
-- ============================================================
-- Estudiante ve solo sus propios intentos
CREATE POLICY "student_own_attempts" ON public.exam_attempts
  FOR SELECT USING (student_id = auth.uid());

-- Estudiante puede crear/actualizar sus propios intentos
CREATE POLICY "student_create_attempts" ON public.exam_attempts
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "student_update_own_attempts" ON public.exam_attempts
  FOR UPDATE USING (student_id = auth.uid());

-- Maestro y admin ven todos los intentos
CREATE POLICY "teacher_read_all_attempts" ON public.exam_attempts
  FOR SELECT USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));

-- ============================================================
-- ATTEMPT ANSWERS
-- ============================================================
-- Estudiante ve solo sus propias respuestas
CREATE POLICY "student_own_answers" ON public.attempt_answers
  FOR SELECT USING (
    attempt_id IN (
      SELECT id FROM public.exam_attempts WHERE student_id = auth.uid()
    )
  );

CREATE POLICY "student_insert_answers" ON public.attempt_answers
  FOR INSERT WITH CHECK (
    attempt_id IN (
      SELECT id FROM public.exam_attempts WHERE student_id = auth.uid()
    )
  );

-- Maestro y admin ven todas las respuestas
CREATE POLICY "teacher_read_all_answers" ON public.attempt_answers
  FOR SELECT USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));

-- ============================================================
-- CERTIFICATES
-- ============================================================
-- Cualquiera puede verificar un certificado (para la página pública)
CREATE POLICY "public_read_certificates" ON public.certificates
  FOR SELECT USING (TRUE);

CREATE POLICY "teacher_manage_certificates" ON public.certificates
  FOR ALL USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));

-- ============================================================
-- STUDENT PROGRESS
-- ============================================================
CREATE POLICY "student_own_progress" ON public.student_progress
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "teacher_read_all_progress" ON public.student_progress
  FOR SELECT USING (public.get_user_role() IN ('TEACHER', 'ADMIN'));

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE POLICY "admin_read_audit" ON public.audit_logs
  FOR SELECT USING (public.get_user_role() = 'ADMIN');

CREATE POLICY "system_insert_audit" ON public.audit_logs
  FOR INSERT WITH CHECK (TRUE);
