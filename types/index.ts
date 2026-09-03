// ============================================================
// TIPOS GLOBALES — RADIOLOGÍA CON FE
// ============================================================

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN'
export type Difficulty = 'basic' | 'intermediate' | 'advanced'
export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_in_the_blank'
export type AttemptStatus = 'in_progress' | 'submitted' | 'expired'

// ============================================================
// PERFIL DE USUARIO
// ============================================================
export interface Profile {
  id: string
  role: UserRole
  full_name: string
  email: string
  institution: string | null
  academic_level: string | null
  country: string | null
  phone: string | null
  student_id: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// ============================================================
// CATEGORÍAS (MATERIAS)
// ============================================================
export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  is_active: boolean
  order_index: number
  created_at: string
}

export interface Subcategory {
  id: string
  category_id: string
  name: string
  description: string | null
  is_active: boolean
  category?: Category
}

// ============================================================
// PREGUNTAS
// ============================================================
export interface QuestionOption {
  id: string
  question_id: string
  option_text: string
  is_correct: boolean
  order_index: number
}

export interface Question {
  id: string
  category_id: string
  subcategory_id: string | null
  question_text: string
  difficulty: Difficulty
  question_type: QuestionType
  explanation: string
  points: number
  image_url: string | null
  image_alt: string | null
  image_caption: string | null
  is_active: boolean
  author_id: string
  created_at: string
  updated_at: string
  // Relations
  category?: Category
  subcategory?: Subcategory
  options?: QuestionOption[]
}

// Para formularios del maestro
export interface QuestionFormData {
  question_text: string
  category_id: string
  subcategory_id?: string
  difficulty: Difficulty
  question_type: QuestionType
  explanation: string
  points: number
  image_url?: string
  image_alt?: string
  image_caption?: string
  is_active: boolean
  options: {
    option_text: string
    is_correct: boolean
    order_index: number
  }[]
}

// ============================================================
// EXÁMENES
// ============================================================
export interface Exam {
  id: string
  title: string
  description: string | null
  category_id: string
  question_count: number
  time_limit_minutes: number | null
  passing_score: number
  difficulty: Difficulty | null
  is_published: boolean
  created_by: string
  created_at: string
  updated_at: string
  // Relations
  category?: Category
  creator?: Profile
}

export interface ExamQuestion {
  id: string
  exam_id: string
  question_id: string
  order_index: number
  question?: Question
}

// ============================================================
// INTENTOS DE EXAMEN
// ============================================================
export interface ExamAttempt {
  id: string
  exam_id: string
  student_id: string
  started_at: string
  submitted_at: string | null
  total_questions: number
  correct_answers: number
  incorrect_answers: number
  unanswered: number
  score_percentage: number | null
  is_passed: boolean | null
  time_used_seconds: number | null
  status: AttemptStatus
  // Relations
  exam?: Exam
  student?: Profile
}

// Snapshot inmutable de respuesta
export interface AttemptAnswer {
  id: string
  attempt_id: string
  question_id: string
  question_text_snapshot: string
  selected_option_id: string | null
  correct_option_id: string
  is_correct: boolean
  options_snapshot: { id: string; text: string; order_index: number }[]
  order_index: number
  // Runtime (no almacenado)
  selected_option_text?: string
  correct_option_text?: string
}

// ============================================================
// CERTIFICADOS
// ============================================================
export interface Certificate {
  id: string
  student_id: string
  exam_id: string
  attempt_id: string
  certificate_number: string
  issued_at: string
  teacher_signature: string | null
  is_valid: boolean
  qr_code_url: string | null
  // Relations
  student?: Profile
  exam?: Exam
  attempt?: ExamAttempt
}

// ============================================================
// PROGRESO DEL ESTUDIANTE
// ============================================================
export interface StudentProgress {
  id: string
  student_id: string
  category_id: string
  total_attempts: number
  avg_score: number
  best_score: number
  worst_score: number
  last_attempt_at: string | null
  // Relations
  category?: Category
}

// ============================================================
// AUDITORÍA
// ============================================================
export interface AuditLog {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string | null
  details: Record<string, unknown> | null
  created_at: string
  user?: Profile
}

// ============================================================
// DTOs PARA LA UI
// ============================================================

// Vista que muestra el examen al estudiante (sin respuestas correctas)
export interface ExamForStudent {
  id: string
  title: string
  description: string | null
  category: Category
  question_count: number
  time_limit_minutes: number | null
  passing_score: number
  difficulty: Difficulty | null
}

// Pregunta durante el examen (sin indicar cuál es correcta)
export interface QuestionForExam {
  id: string
  question_text: string
  question_type: QuestionType
  image_url: string | null
  image_alt: string | null
  image_caption: string | null
  options: { id: string; option_text: string; order_index: number }[]
}

// Datos del intento activo para el frontend
export interface ActiveAttempt {
  attemptId: string
  examId: string
  examTitle: string
  categoryName: string
  timeLimitMinutes: number | null
  startedAt: string
  questions: QuestionForExam[]
  // Respuestas guardadas durante el intento (solo IDs)
  savedAnswers: Record<string, string> // questionId → optionId
}

// Resultado final para mostrar al estudiante
export interface ExamResult {
  attempt: ExamAttempt
  exam: Exam
  answers: AttemptAnswer[]
  gradeLabel: string
  gradeColor: string
}

// Estadísticas para el dashboard del estudiante
export interface StudentStats {
  totalAttempts: number
  avgScore: number
  bestScore: number
  worstScore: number
  passRate: number
  approvedCount: number
  failedCount: number
  progressByCategory: {
    categoryName: string
    avgScore: number
    attempts: number
  }[]
}

// Estadísticas para el panel del maestro
export interface TeacherStats {
  totalStudents: number
  totalAttempts: number
  avgScore: number
  passRate: number
  totalQuestions: number
  publishedExams: number
}

// Calificación label
export type GradeLabel = 'Excelente' | 'Muy bueno' | 'Aprobado' | 'Necesita reforzamiento'
