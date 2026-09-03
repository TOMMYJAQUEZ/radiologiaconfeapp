-- ============================================================
-- MIGRACIÓN: Arreglar eliminación de exámenes con cascada
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Agregar CASCADE en la FK de exam_attempts hacia exams
ALTER TABLE public.exam_attempts
  DROP CONSTRAINT IF EXISTS exam_attempts_exam_id_fkey;

ALTER TABLE public.exam_attempts
  ADD CONSTRAINT exam_attempts_exam_id_fkey
  FOREIGN KEY (exam_id)
  REFERENCES public.exams(id)
  ON DELETE CASCADE;

-- 2. También asegurar CASCADE en exam_answers -> exam_attempts
ALTER TABLE public.exam_answers
  DROP CONSTRAINT IF EXISTS exam_answers_attempt_id_fkey;

ALTER TABLE public.exam_answers
  ADD CONSTRAINT exam_answers_attempt_id_fkey
  FOREIGN KEY (attempt_id)
  REFERENCES public.exam_attempts(id)
  ON DELETE CASCADE;

-- 3. En attempt_answers también (tabla alternativa que puede existir)
ALTER TABLE public.attempt_answers
  DROP CONSTRAINT IF EXISTS attempt_answers_attempt_id_fkey;

ALTER TABLE public.attempt_answers
  ADD CONSTRAINT attempt_answers_attempt_id_fkey
  FOREIGN KEY (attempt_id)
  REFERENCES public.exam_attempts(id)
  ON DELETE CASCADE;

-- Verificar: SELECT conname, confdeltype FROM pg_constraint
-- WHERE conname LIKE '%exam%' AND contype = 'f';
-- confdeltype = 'c' = CASCADE
