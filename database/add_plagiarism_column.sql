ALTER TABLE public.assignment_submissions ADD COLUMN IF NOT EXISTS plagiarism_report JSONB;

-- También debemos asegurarnos de que el bucket 'assignments' exista en storage:
-- (Esto asume que el usuario puede crearlo manualmente o mediante otro script, 
-- pero para Supabase a veces se hace desde el Dashboard).
