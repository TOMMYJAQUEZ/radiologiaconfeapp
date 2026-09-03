-- ============================================================
-- AGREGAR MODALIDAD 'fill_in_the_blank' (COMPLETA) A PREGUNTAS
-- ============================================================

-- Actualizar restricción de tipo de pregunta
ALTER TABLE public.questions 
  DROP CONSTRAINT IF EXISTS questions_question_type_check;

ALTER TABLE public.questions 
  ADD CONSTRAINT questions_question_type_check 
  CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_in_the_blank'));
