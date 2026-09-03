'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================================
// OBTENER CONFIG DEL DIRECTOR
// ============================================================
export async function getDirectorConfig() {
  const supabase = await createClient()
  const { data } = await supabase.from('director_config').select('*').single()
  return { config: data }
}

export async function saveDirectorConfig(updates: {
  institution_name?: string
  program_name?: string
  director_name?: string
  director_title?: string
  passing_grade?: number
  weight_exams?: number
  weight_lab?: number
  weight_assignments?: number
  weight_participation?: number
  certificate_footer?: string
  director_signature_b64?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'ADMIN') return { error: 'Solo el Director puede modificar la configuración.' }

  const { error } = await supabase
    .from('director_config')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', '00000000-0000-0000-0000-000000000001')

  if (error) return { error: error.message }
  revalidatePath('/dashboard/certificates')
  return { success: true }
}

// ============================================================
// CALCULAR NOTA TOTAL DEL ESTUDIANTE
// ============================================================
export async function getStudentGradeSummary(studentId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const targetId = studentId || user.id

  // Nota de exámenes
  const { data: examAttempts } = await supabase
    .from('exam_attempts')
    .select('score, total_points')
    .eq('student_id', targetId)
    .eq('status', 'completed')

  let gradeExams = 0
  if (examAttempts && examAttempts.length > 0) {
    const avg = examAttempts.reduce((sum: number, a: { score: number; total_points: number }) =>
      sum + (a.total_points > 0 ? (a.score / a.total_points) * 100 : 0), 0)
    gradeExams = Math.round(avg / examAttempts.length)
  }

  // Nota de laboratorio (estimada)
  const gradeLab = gradeExams > 0 ? Math.min(gradeExams + 5, 100) : 0

  // Nota de trabajos y participación (promedio de calificaciones publicadas del estudiante)
  const { data: submissionsWithGrades } = await supabase
    .from('assignment_submissions')
    .select(`
      id,
      assignment_grades(score, participation_score, is_published)
    `)
    .eq('student_id', targetId)

  let gradeAssignments = 0
  let gradeParticipation = 0

  const publishedGrades = submissionsWithGrades
    ?.flatMap((s: { id: string; assignment_grades: Array<{ score: number; participation_score: number; is_published: boolean }> }) => s.assignment_grades)
    .filter((g: { is_published: boolean }) => g?.is_published) ?? []

  if (publishedGrades.length > 0) {
    gradeAssignments = Math.round(publishedGrades.reduce((s: number, g: { score: number }) => s + (g.score || 0), 0) / publishedGrades.length)
    gradeParticipation = Math.round(publishedGrades.reduce((s: number, g: { participation_score: number }) => s + (g.participation_score || 0), 0) / publishedGrades.length)
  }

  // Pesos desde configuración
  const { config } = await getDirectorConfig()
  const weights = {
    exams: config?.weight_exams ?? 35,
    lab: config?.weight_lab ?? 25,
    assignments: config?.weight_assignments ?? 25,
    participation: config?.weight_participation ?? 15,
  }
  const passingGrade = config?.passing_grade ?? 70

  const gradeTotal = Math.round(
    (gradeExams * weights.exams +
     gradeLab * weights.lab +
     gradeAssignments * weights.assignments +
     gradeParticipation * weights.participation) / 100
  )

  return {
    gradeExams,
    gradeLab,
    gradeAssignments,
    gradeParticipation,
    gradeTotal,
    weights,
    passingGrade,
    canRequestCertificate: gradeTotal >= passingGrade,
  }
}

// ============================================================
// SOLICITAR CERTIFICADO (Estudiante)
// ============================================================
export async function requestCertificate() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { data: existing } = await supabase
    .from('certificate_requests')
    .select('id, status')
    .eq('student_id', user.id)
    .not('status', 'in', '(teacher_rejected,director_rejected)')
    .maybeSingle()

  if (existing) return { error: 'Ya tienes una solicitud de certificado activa o un certificado expedido.' }

  const grades = await getStudentGradeSummary(user.id)
  if ('error' in grades) return { error: grades.error }
  if (!grades.canRequestCertificate) {
    return { error: `Tu nota total (${grades.gradeTotal}%) no alcanza el mínimo requerido de ${grades.passingGrade}% para solicitar el certificado.` }
  }

  const { error } = await supabase.from('certificate_requests').insert({
    student_id: user.id,
    grade_exams: grades.gradeExams,
    grade_lab: grades.gradeLab,
    grade_assignments: grades.gradeAssignments,
    grade_participation: grades.gradeParticipation,
    grade_total: grades.gradeTotal,
    status: 'pending',
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/student/progress')
  return { success: true }
}

// ============================================================
// LISTAR SOLICITUDES
// ============================================================
export async function getCertificateRequests(statusFilter?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { requests: [] }

  let query = supabase
    .from('certificate_requests')
    .select(`
      *,
      student:profiles!certificate_requests_student_id_fkey(id, full_name, email, student_id),
      teacher:profiles!certificate_requests_teacher_id_fkey(id, full_name)
    `)
    .order('created_at', { ascending: false })

  if (statusFilter) query = query.eq('status', statusFilter)

  const { data } = await query
  return { requests: data ?? [] }
}

// ============================================================
// REVISIÓN DEL MAESTRO
// ============================================================
export async function teacherReviewCertificate(
  requestId: string,
  action: 'approve' | 'reject',
  note?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { error } = await supabase
    .from('certificate_requests')
    .update({
      status: action === 'approve' ? 'teacher_approved' : 'teacher_rejected',
      teacher_id: user.id,
      teacher_note: note ?? null,
      teacher_approved_at: action === 'approve' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/certificates')
  revalidatePath('/dashboard/assignments')
  return { success: true }
}

// ============================================================
// REVISIÓN DEL DIRECTOR — APRUEBA Y EXPIDE
// ============================================================
export async function directorReviewCertificate(
  requestId: string,
  action: 'approve' | 'reject',
  note?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'ADMIN') return { error: 'Solo el Director puede realizar esta acción.' }

  if (action === 'reject') {
    await supabase.from('certificate_requests').update({
      status: 'director_rejected',
      director_note: note ?? null,
      updated_at: new Date().toISOString(),
    }).eq('id', requestId)
    revalidatePath('/dashboard/certificates')
    return { success: true }
  }

  // Obtener datos del request con estudiante y maestro
  const { data: req } = await supabase
    .from('certificate_requests')
    .select(`
      *,
      student:profiles!certificate_requests_student_id_fkey(full_name),
      teacher:profiles!certificate_requests_teacher_id_fkey(full_name)
    `)
    .eq('id', requestId)
    .single()

  if (!req) return { error: 'Solicitud no encontrada.' }

  const { config } = await getDirectorConfig()

  // Firma del maestro
  let teacherSig: string | null = null
  if (req.teacher_id) {
    const { data: sigData } = await supabase
      .from('teacher_signatures')
      .select('signature_b64, signature_url')
      .eq('teacher_id', req.teacher_id)
      .single()
    teacherSig = sigData?.signature_b64 || sigData?.signature_url || null
  }

  // Número secuencial
  const { data: certNum } = await supabase.rpc('generate_certificate_number')
  const certificateNumber = certNum || `RCF-${new Date().getFullYear()}-0001`

  const { error: issueError } = await supabase.from('certificates').insert({
    request_id: requestId,
    student_id: req.student_id,
    teacher_id: req.teacher_id ?? null,
    certificate_number: certificateNumber,
    student_name: (req.student as { full_name: string })?.full_name ?? 'Estudiante',
    program_name: config?.program_name ?? 'Técnico en Radiología',
    institution_name: config?.institution_name ?? 'Radiología con Fe',
    teacher_name: (req.teacher as { full_name: string } | null)?.full_name ?? null,
    director_name: config?.director_name ?? 'Francisco Jáquez',
    grade_total: req.grade_total,
    teacher_signature: teacherSig,
    director_signature: config?.director_signature_b64 || config?.director_signature_url || null,
  })

  if (issueError) return { error: issueError.message }

  await supabase.from('certificate_requests').update({
    status: 'issued',
    director_note: note ?? null,
    director_approved_at: new Date().toISOString(),
    issued_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', requestId)

  revalidatePath('/dashboard/certificates')
  return { success: true, certificateNumber }
}

// ============================================================
// OBTENER CERTIFICADOS EXPEDIDOS
// ============================================================
export async function getCertificates(studentId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { certificates: [] }

  let query = supabase
    .from('certificates')
    .select('*')
    .order('issued_at', { ascending: false })

  if (studentId) query = query.eq('student_id', studentId)

  const { data } = await query
  return { certificates: data ?? [] }
}

// ============================================================
// VERIFICAR CERTIFICADO (público por código o número)
// ============================================================
export async function verifyCertificate(codeOrNumber: string) {
  const supabase = await createClient()
  const clean = codeOrNumber.trim()
  if (!clean) return { certificate: null }

  // Soporte para Certificado de Demostración / Muestra Académica
  if (clean.toLowerCase() === 'demo' || clean.toLowerCase().startsWith('sample') || clean.toUpperCase() === 'RCF-2026-DEMO') {
    const { config } = await getDirectorConfig()
    return {
      certificate: {
        id: 'demo-sample-id',
        certificate_number: 'RCF-2026-DEMO',
        student_name: 'Estudiante Ejemplo (Muestra Académica)',
        program_name: config?.program_name ?? 'Técnico en Radiología e Imágenes Diagnósticas',
        institution_name: config?.institution_name ?? 'Radiología con Fe',
        teacher_name: 'Docente Titular de Radiología',
        director_name: config?.director_name ?? 'Francisco Jáquez',
        grade_total: 94.5,
        verification_code: 'RCF-DEMO-SAMPLE-2026-VERIFIED',
        issued_at: new Date().toISOString(),
        is_sample: true,
      }
    }
  }

  // Buscar por verification_code
  let { data } = await supabase
    .from('certificates')
    .select('*')
    .eq('verification_code', clean)
    .maybeSingle()

  // Si no se encuentra, intentar buscar por certificate_number (case insensitive)
  if (!data) {
    const { data: byNum } = await supabase
      .from('certificates')
      .select('*')
      .ilike('certificate_number', clean)
      .maybeSingle()
    data = byNum
  }

  return { certificate: data ?? null }
}

