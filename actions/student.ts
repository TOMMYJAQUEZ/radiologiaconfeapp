'use server'

import { createClient } from '@/lib/supabase/server'

export async function getStudentDashboardData() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 1. Obtener perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 2. Intentos completados
  const { data: attempts } = await supabase
    .from('exam_attempts')
    .select(`
      id, score_percentage, is_passed, time_used_seconds, submitted_at, status,
      exam:exams(id, title, category:categories(name))
    `)
    .eq('student_id', user.id)
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: false })

  // 3. Certificados
  const { count: certCount, data: certificates } = await supabase
    .from('certificates')
    .select('*, exam:exams(title)', { count: 'exact' })
    .eq('student_id', user.id)

  // 4. Próximos exámenes disponibles (publicados)
  const { data: publishedExams } = await supabase
    .from('exams')
    .select('*, category:categories(name)')
    .eq('is_published', true)
    .limit(5)

  // Cálculos
  const completedCount = attempts?.length ?? 0
  const scores = attempts?.map((a) => Number(a.score_percentage) || 0) ?? []
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const totalSeconds = attempts?.reduce((acc, a) => acc + (a.time_used_seconds || 0), 0) ?? 0
  const totalHours = Math.round((totalSeconds / 3600) * 10) / 10

  return {
    profile,
    stats: {
      completedExams: completedCount,
      avgScore: `${avgScore}%`,
      certificatesCount: certCount ?? 0,
      studyHours: `${totalHours}h`,
    },
    recentAttempts: attempts?.slice(0, 5) ?? [],
    availableExams: publishedExams ?? [],
    certificates: certificates ?? [],
  }
}

export async function getStudentExams() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: exams } = await supabase
    .from('exams')
    .select(`
      *,
      category:categories(name),
      attempts:exam_attempts(id, status, score_percentage, is_passed)
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (!exams) return []

  return exams.map((exam) => {
    const userAttempts = (exam.attempts as any[])?.filter((a: any) => true) ?? []
    const lastAttempt = userAttempts[0]
    return {
      ...exam,
      categoryName: (exam.category as any)?.name ?? 'General',
      isCompleted: lastAttempt?.status === 'submitted',
      lastScore: lastAttempt?.score_percentage ?? null,
      isPassed: lastAttempt?.is_passed ?? false,
    }
  })
}

export async function getStudentProgressData() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 0. Perfil del estudiante (para usar su nombre en el certificado PDF)
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  // 1. Progreso por categoría
  const { data: progress } = await supabase
    .from('student_progress')
    .select('*, category:categories(name)')
    .eq('student_id', user.id)

  // 2. Intentos completados ordenados por fecha
  const { data: attempts } = await supabase
    .from('exam_attempts')
    .select('score_percentage, submitted_at')
    .eq('student_id', user.id)
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: true })

  // 3. Certificados (incluye categoría del examen para el PDF)
  const { data: certificates } = await supabase
    .from('certificates')
    .select(`
      *,
      exam:exams(title, category:categories(name)),
      attempt:exam_attempts(score_percentage)
    `)
    .eq('student_id', user.id)
    .order('issued_at', { ascending: false })

  const scores = attempts?.map((a) => Number(a.score_percentage) || 0) ?? []
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const passedCount = attempts?.filter((a) => (Number(a.score_percentage) || 0) >= 70).length ?? 0

  return {
    profile: profile ?? null,
    avgScore,
    totalAttempts: attempts?.length ?? 0,
    passedCount,
    certificatesCount: certificates?.length ?? 0,
    attemptsHistory: attempts ?? [],
    certificates: certificates ?? [],
    categoryProgress: progress ?? [],
  }
}
