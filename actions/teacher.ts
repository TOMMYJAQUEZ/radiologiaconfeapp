'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { QuestionFormData } from '@/types'

// ============================================================
// OBTENER PREGUNTAS (con filtros)
// ============================================================
export async function getQuestions(params?: {
  categoryId?: string
  difficulty?: string
  search?: string
  page?: number
  pageSize?: number
}) {
  const supabase = await createClient()

  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('questions')
    .select(`
      *,
      category:categories(id, name),
      subcategory:subcategories(id, name),
      options:question_options(id, option_text, is_correct, order_index)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (params?.categoryId) {
    query = query.eq('category_id', params.categoryId)
  }
  if (params?.difficulty) {
    query = query.eq('difficulty', params.difficulty)
  }
  if (params?.search) {
    query = query.ilike('question_text', `%${params.search}%`)
  }

  const { data, count, error } = await query

  if (error) return { questions: [], total: 0 }

  return { questions: data ?? [], total: count ?? 0 }
}

// ============================================================
// CREAR PREGUNTA
// ============================================================
export async function createQuestion(data: QuestionFormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  // Validar que haya exactamente una opción correcta en multiple_choice
  const correctOptions = data.options.filter((o) => o.is_correct)
  if (correctOptions.length === 0) {
    return { error: 'Debes marcar al menos una opción como correcta.' }
  }

  const { data: question, error: qError } = await supabase
    .from('questions')
    .insert({
      category_id: data.category_id,
      subcategory_id: data.subcategory_id || null,
      question_text: data.question_text,
      difficulty: data.difficulty,
      question_type: data.question_type,
      explanation: data.explanation,
      points: data.points,
      image_url: data.image_url || null,
      image_alt: data.image_alt || null,
      image_caption: data.image_caption || null,
      is_active: data.is_active,
      author_id: user.id,
    })
    .select('id')
    .single()

  if (qError || !question) return { error: 'No se pudo crear la pregunta.' }

  // Insertar opciones
  const options = data.options.map((o, idx) => ({
    question_id: question.id,
    option_text: o.option_text,
    is_correct: o.is_correct,
    order_index: o.order_index ?? idx,
  }))

  const { error: optError } = await supabase.from('question_options').insert(options)

  if (optError) {
    await supabase.from('questions').delete().eq('id', question.id)
    return { error: 'Error guardando las opciones.' }
  }

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'QUESTION_CREATED',
    entity_type: 'question',
    entity_id: question.id,
  })

  revalidatePath('/teacher/questions')
  return { success: true, id: question.id }
}

// ============================================================
// ACTUALIZAR PREGUNTA
// ============================================================
export async function updateQuestion(questionId: string, data: QuestionFormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const correctOptions = data.options.filter((o) => o.is_correct)
  if (correctOptions.length === 0) {
    return { error: 'Debes marcar al menos una opción como correcta.' }
  }

  const { error: qError } = await supabase
    .from('questions')
    .update({
      category_id: data.category_id,
      subcategory_id: data.subcategory_id || null,
      question_text: data.question_text,
      difficulty: data.difficulty,
      question_type: data.question_type,
      explanation: data.explanation,
      points: data.points,
      image_url: data.image_url || null,
      image_alt: data.image_alt || null,
      image_caption: data.image_caption || null,
      is_active: data.is_active,
    })
    .eq('id', questionId)

  if (qError) return { error: 'No se pudo actualizar la pregunta.' }

  // Reemplazar opciones
  await supabase.from('question_options').delete().eq('question_id', questionId)

  const options = data.options.map((o, idx) => ({
    question_id: questionId,
    option_text: o.option_text,
    is_correct: o.is_correct,
    order_index: o.order_index ?? idx,
  }))

  await supabase.from('question_options').insert(options)

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'QUESTION_UPDATED',
    entity_type: 'question',
    entity_id: questionId,
  })

  revalidatePath('/teacher/questions')
  return { success: true }
}

// ============================================================
// ELIMINAR PREGUNTA
// ============================================================
export async function deleteQuestion(questionId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { error } = await supabase.from('questions').delete().eq('id', questionId)

  if (error) return { error: 'No se pudo eliminar la pregunta.' }

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'QUESTION_DELETED',
    entity_type: 'question',
    entity_id: questionId,
  })

  revalidatePath('/teacher/questions')
  return { success: true }
}

// ============================================================
// GESTIÓN DE EXÁMENES
// ============================================================
export async function getTeacherExams() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('exams')
    .select(`
      *,
      category:categories(name),
      attempts:exam_attempts(count)
    `)
    .order('created_at', { ascending: false })

  if (error) return []

  return data.map((exam) => ({
    ...exam,
    categoryName: (exam.category as any)?.name ?? 'General',
    attemptsCount: (exam.attempts as any[])?.[0]?.count ?? 0,
  }))
}

import { notifyAllStudents } from '@/actions/notifications'

export async function createExam(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const isPublished = formData.get('is_published') === 'true'
  const title = formData.get('title') as string
  const categoryId = formData.get('category_id') as string

  const { data: exam, error } = await supabase
    .from('exams')
    .insert({
      title,
      description: formData.get('description') as string | null,
      category_id: categoryId,
      question_count: parseInt(formData.get('question_count') as string),
      time_limit_minutes: formData.get('time_limit_minutes')
        ? parseInt(formData.get('time_limit_minutes') as string)
        : null,
      passing_score: parseInt(formData.get('passing_score') as string),
      difficulty: (formData.get('difficulty') as string) || null,
      is_published: isPublished,
      created_by: user.id,
    })
    .select('id, category:categories(name)')
    .single()

  if (error || !exam) return { error: 'No se pudo crear el examen.' }

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: isPublished ? 'EXAM_CREATED_AND_PUBLISHED' : 'EXAM_CREATED',
    entity_type: 'exam',
    entity_id: exam.id,
  })

  // Si se crea como publicado directamente, notificar a los estudiantes
  if (isPublished) {
    const catName = (exam.category as any)?.name || 'Radiología'
    await notifyAllStudents({
      title: `Nuevo Examen Disponible: ${title}`,
      message: `Se ha publicado una nueva evaluación de ${catName}. ¡Ponte a prueba!`,
      type: 'exam',
      link_url: `/exam/${exam.id}`,
    })
  }

  revalidatePath('/dashboard/exams')
  revalidatePath('/dashboard/student/exams')
  revalidatePath('/dashboard')
  revalidatePath('/teacher/exams')
  return { success: true, id: exam.id }
}

export async function updateExam(examId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { error } = await supabase
    .from('exams')
    .update({
      title: formData.get('title') as string,
      description: formData.get('description') as string | null,
      category_id: formData.get('category_id') as string,
      question_count: parseInt(formData.get('question_count') as string),
      time_limit_minutes: formData.get('time_limit_minutes')
        ? parseInt(formData.get('time_limit_minutes') as string)
        : null,
      passing_score: parseInt(formData.get('passing_score') as string),
      difficulty: (formData.get('difficulty') as string) || null,
    })
    .eq('id', examId)

  if (error) return { error: 'No se pudo actualizar el examen.' }

  revalidatePath('/dashboard/exams')
  revalidatePath('/dashboard/student/exams')
  revalidatePath('/dashboard')
  revalidatePath('/teacher/exams')
  return { success: true }
}

export async function toggleExamPublished(examId: string, isPublished: boolean) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { data: exam, error } = await supabase
    .from('exams')
    .update({ is_published: isPublished })
    .eq('id', examId)
    .select('id, title, category:categories(name)')
    .single()

  if (error || !exam) return { error: 'No se pudo actualizar el estado del examen.' }

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: isPublished ? 'EXAM_PUBLISHED' : 'EXAM_UNPUBLISHED',
    entity_type: 'exam',
    entity_id: examId,
  })

  // Si se publica, notificar a todos los estudiantes registrados
  if (isPublished) {
    const catName = (exam.category as any)?.name || 'Radiología'
    await notifyAllStudents({
      title: `Nuevo Examen Disponible: ${exam.title}`,
      message: `Se ha publicado una nueva evaluación de ${catName}. ¡Ingresa para completarla!`,
      type: 'exam',
      link_url: `/exam/${exam.id}`,
    })
  }

  revalidatePath('/dashboard/exams')
  revalidatePath('/dashboard/student/exams')
  revalidatePath('/dashboard')
  revalidatePath('/teacher/exams')
  return { success: true }
}

export async function deleteExam(examId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  // 1. Obtener todos los intentos asociados a este examen
  const { data: attempts } = await supabase
    .from('exam_attempts')
    .select('id')
    .eq('exam_id', examId)

  if (attempts && attempts.length > 0) {
    const attemptIds = attempts.map((a: { id: string }) => a.id)

    // 2. Eliminar respuestas individuales de esos intentos
    await supabase
      .from('attempt_answers')
      .delete()
      .in('attempt_id', attemptIds)

    // 3. Eliminar los intentos
    await supabase
      .from('exam_attempts')
      .delete()
      .in('id', attemptIds)
  }

  // 4. Eliminar notificaciones vinculadas a este examen
  await supabase
    .from('notifications')
    .delete()
    .like('link_url', `%/exam/${examId}%`)

  // 5. Finalmente eliminar el examen
  const { error } = await supabase.from('exams').delete().eq('id', examId)

  if (error) return { error: `No se pudo eliminar el examen: ${error.message}` }

  // 6. Registrar en auditoría (silencioso si tabla no existe)
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'EXAM_DELETED',
    entity_type: 'exam',
    entity_id: examId,
  }).then(() => {})

  revalidatePath('/dashboard/exams')
  revalidatePath('/dashboard/student/exams')
  revalidatePath('/dashboard')
  revalidatePath('/teacher/exams')
  return { success: true }
}

// ============================================================
// ESTADÍSTICAS DEL MAESTRO
// ============================================================
export async function getTeacherStats() {
  const supabase = await createClient()

  const [
    { count: totalStudents },
    { count: totalAttempts },
    { data: attempts },
    { count: totalQuestions },
    { count: publishedExams },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'STUDENT'),
    supabase.from('exam_attempts').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
    supabase.from('exam_attempts').select('score_percentage, is_passed').eq('status', 'submitted'),
    supabase.from('questions').select('*', { count: 'exact', head: true }),
    supabase.from('exams').select('*', { count: 'exact', head: true }).eq('is_published', true),
  ])

  const scores = attempts?.map((a) => a.score_percentage ?? 0) ?? []
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, n) => s + n, 0) / scores.length) : 0
  const passedCount = attempts?.filter((a) => a.is_passed).length ?? 0
  const passRate = (attempts?.length ?? 0) > 0 ? Math.round((passedCount / (attempts?.length ?? 1)) * 100) : 0

  return {
    totalStudents: totalStudents ?? 0,
    totalAttempts: totalAttempts ?? 0,
    avgScore,
    passRate,
    totalQuestions: totalQuestions ?? 0,
    publishedExams: publishedExams ?? 0,
  }
}

// ============================================================
// ANALÍTICAS AVANZADAS DEL MAESTRO
// ============================================================
export async function getTeacherAnalytics() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 1. Stats globales rápidas
  const [
    { count: totalStudents },
    { count: totalAttempts },
    { count: totalCerts },
    { count: publishedExams },
    { count: totalQuestions },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'STUDENT'),
    supabase.from('exam_attempts').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
    supabase.from('certificates').select('*', { count: 'exact', head: true }),
    supabase.from('exams').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('questions').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ])

  // 2. Intentos con score para calcular promedio y tasa de aprobación
  const { data: allAttempts } = await supabase
    .from('exam_attempts')
    .select('score_percentage, is_passed, submitted_at')
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: true })

  const scores = allAttempts?.map((a) => Number(a.score_percentage) || 0) ?? []
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((s, n) => s + n, 0) / scores.length)
    : 0
  const passedCount = allAttempts?.filter((a) => a.is_passed).length ?? 0
  const passRate = allAttempts && allAttempts.length > 0
    ? Math.round((passedCount / allAttempts.length) * 100)
    : 0

  // 3. Evolución mensual de intentos (últimos 6 meses)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)

  const monthlyMap: Record<string, { attempts: number; passed: number }> = {}
  allAttempts?.forEach((a) => {
    if (!a.submitted_at) return
    const d = new Date(a.submitted_at)
    if (d < sixMonthsAgo) return
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!monthlyMap[key]) monthlyMap[key] = { attempts: 0, passed: 0 }
    monthlyMap[key].attempts++
    if (a.is_passed) monthlyMap[key].passed++
  })
  const monthlyTrend = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      attempts: data.attempts,
      passed: data.passed,
    }))

  // 4. Rendimiento por examen (top 8)
  const { data: examStats } = await supabase
    .from('exam_attempts')
    .select(`
      exam_id,
      score_percentage,
      is_passed,
      exam:exams(title)
    `)
    .eq('status', 'submitted')

  const examMap: Record<string, { title: string; scores: number[]; passed: number }> = {}
  examStats?.forEach((a) => {
    const examData = a.exam as any
    if (!examData) return
    if (!examMap[a.exam_id]) {
      examMap[a.exam_id] = { title: examData.title, scores: [], passed: 0 }
    }
    examMap[a.exam_id].scores.push(Number(a.score_percentage) || 0)
    if (a.is_passed) examMap[a.exam_id].passed++
  })
  const examPerformance = Object.values(examMap)
    .map((e) => ({
      title: e.title.length > 28 ? e.title.substring(0, 28) + '…' : e.title,
      attempts: e.scores.length,
      avgScore: e.scores.length > 0
        ? Math.round(e.scores.reduce((s, n) => s + n, 0) / e.scores.length)
        : 0,
      passRate: e.scores.length > 0
        ? Math.round((e.passed / e.scores.length) * 100)
        : 0,
    }))
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, 8)

  // 5. Tabla de estudiantes con sus métricas
  const { data: students } = await supabase
    .from('profiles')
    .select(`
      id, full_name, email, institution, created_at
    `)
    .eq('role', 'STUDENT')
    .order('created_at', { ascending: false })
    .limit(50)

  // Obtener progreso por alumno
  const { data: progressRows } = await supabase
    .from('exam_attempts')
    .select('student_id, score_percentage, is_passed, submitted_at')
    .eq('status', 'submitted')

  const studentStatsMap: Record<string, {
    attempts: number
    avgScore: number
    passed: number
    lastAttempt: string | null
  }> = {}

  progressRows?.forEach((r) => {
    if (!studentStatsMap[r.student_id]) {
      studentStatsMap[r.student_id] = { attempts: 0, avgScore: 0, passed: 0, lastAttempt: null }
    }
    const s = studentStatsMap[r.student_id]
    s.avgScore = (s.avgScore * s.attempts + Number(r.score_percentage || 0)) / (s.attempts + 1)
    s.attempts++
    if (r.is_passed) s.passed++
    if (!s.lastAttempt || (r.submitted_at && r.submitted_at > s.lastAttempt)) {
      s.lastAttempt = r.submitted_at
    }
  })

  const studentsList = (students ?? []).map((s) => {
    const stats = studentStatsMap[s.id] ?? { attempts: 0, avgScore: 0, passed: 0, lastAttempt: null }
    return {
      id: s.id,
      fullName: s.full_name,
      email: s.email,
      institution: s.institution ?? '—',
      attempts: stats.attempts,
      avgScore: Math.round(stats.avgScore),
      passRate: stats.attempts > 0 ? Math.round((stats.passed / stats.attempts) * 100) : 0,
      lastAttempt: stats.lastAttempt,
      registeredAt: s.created_at,
    }
  })

  return {
    globalStats: {
      totalStudents: totalStudents ?? 0,
      totalAttempts: totalAttempts ?? 0,
      totalCerts: totalCerts ?? 0,
      publishedExams: publishedExams ?? 0,
      totalQuestions: totalQuestions ?? 0,
      avgScore,
      passRate,
    },
    monthlyTrend,
    examPerformance,
    studentsList,
  }
}
