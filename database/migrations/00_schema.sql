-- Database Schema for Radiología con Fe

-- 1. Create custom ENUM types
CREATE TYPE user_role AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');
CREATE TYPE question_difficulty AS ENUM ('BASIC', 'INTERMEDIATE', 'ADVANCED');
CREATE TYPE question_type AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'MULTIPLE_SELECT', 'IMAGE_IDENTIFICATION');
CREATE TYPE attempt_status AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- 2. Create tables
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role user_role DEFAULT 'STUDENT'::user_role NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    institution TEXT,
    academic_level TEXT,
    country TEXT,
    phone TEXT,
    academic_id TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.subcategories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    UNIQUE(category_id, name)
);

CREATE TABLE public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,
    subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
    difficulty question_difficulty NOT NULL DEFAULT 'BASIC',
    q_type question_type NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    content TEXT NOT NULL,
    explanation TEXT NOT NULL,
    points INTEGER DEFAULT 1 NOT NULL,
    image_url TEXT,
    image_alt TEXT,
    image_caption TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.question_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE public.exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,
    question_count INTEGER NOT NULL,
    time_limit_minutes INTEGER,
    passing_percentage INTEGER NOT NULL DEFAULT 70,
    difficulty question_difficulty,
    is_published BOOLEAN DEFAULT false NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Many-to-many relationship for exams and questions
CREATE TABLE public.exam_questions (
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER,
    PRIMARY KEY (exam_id, question_id)
);

CREATE TABLE public.exam_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
    status attempt_status DEFAULT 'IN_PROGRESS' NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    score_percentage NUMERIC(5,2),
    is_passed BOOLEAN,
    correct_answers INTEGER,
    incorrect_answers INTEGER,
    unanswered INTEGER
);

CREATE TABLE public.attempt_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    attempt_id UUID REFERENCES public.exam_attempts(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    selected_option_id UUID REFERENCES public.question_options(id) ON DELETE RESTRICT,
    is_correct BOOLEAN,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(attempt_id, question_id)
);

CREATE TABLE public.certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    exam_attempt_id UUID REFERENCES public.exam_attempts(id) ON DELETE CASCADE NOT NULL,
    certificate_number TEXT UNIQUE NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    pdf_url TEXT
);

CREATE TABLE public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read everyone (basic info), but only update themselves. Admins can update all.
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories & Subcategories: Viewable by all, editable by TEACHER/ADMIN
CREATE POLICY "Categories viewable by all" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Subcategories viewable by all" ON public.subcategories FOR SELECT USING (true);

-- Questions & Options: Viewable by all (needed for taking exams, but answer correctness should be hidden by logic), editable by TEACHER/ADMIN
CREATE POLICY "Questions viewable by all" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Options viewable by all" ON public.question_options FOR SELECT USING (true);

-- Exams: Published exams viewable by all, unpublished only by TEACHER/ADMIN
CREATE POLICY "Published exams viewable by all" ON public.exams FOR SELECT USING (is_published = true);

-- Exam Attempts: Students can see their own, Teachers can see all
CREATE POLICY "Students see own attempts" ON public.exam_attempts FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students create own attempts" ON public.exam_attempts FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students update own attempts" ON public.exam_attempts FOR UPDATE USING (auth.uid() = student_id);

-- Attempt Answers: Students can see their own, insert their own
CREATE POLICY "Students see own answers" ON public.attempt_answers FOR SELECT USING (EXISTS (SELECT 1 FROM public.exam_attempts e WHERE e.id = attempt_id AND e.student_id = auth.uid()));
CREATE POLICY "Students insert own answers" ON public.attempt_answers FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.exam_attempts e WHERE e.id = attempt_id AND e.student_id = auth.uid()));

-- Certificates: Viewable by all (for verification)
CREATE POLICY "Certificates viewable by all" ON public.certificates FOR SELECT USING (true);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'STUDENT'::user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
