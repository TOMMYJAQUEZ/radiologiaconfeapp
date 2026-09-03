'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================================
// CREAR TAREA (Maestro)
// ============================================================
export async function createAssignment(data: {
  title: string
  description: string
  instructions?: string
  category_id?: string
  due_date?: string
  max_score?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['TEACHER', 'ADMIN'].includes(profile.role)) return { error: 'Solo maestros pueden crear tareas.' }

  const { error } = await supabase.from('assignments').insert({
    teacher_id: user.id,
    title: data.title,
    description: data.description,
    instructions: data.instructions ?? null,
    category_id: data.category_id ?? null,
    due_date: data.due_date ?? null,
    max_score: data.max_score ?? 100,
    is_published: false,
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/assignments')
  return { success: true }
}

// ============================================================
// ACTUALIZAR TAREA (Maestro)
// ============================================================
export async function updateAssignment(id: string, data: {
  title: string
  description: string
  instructions?: string
  due_date?: string
  max_score?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { error } = await supabase
    .from('assignments')
    .update({
      title: data.title,
      description: data.description,
      instructions: data.instructions ?? null,
      due_date: data.due_date ?? null,
      max_score: data.max_score ?? 100,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('teacher_id', user.id) // Only the owner can edit

  if (error) return { error: error.message }
  revalidatePath('/dashboard/assignments')
  revalidatePath('/dashboard/student/assignments')
  return { success: true }
}

// ============================================================
// ELIMINAR TAREA (Maestro)
// ============================================================
export async function deleteAssignment(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { error } = await supabase
    .from('assignments')
    .delete()
    .eq('id', id)
    .eq('teacher_id', user.id) // Only the owner can delete

  if (error) return { error: error.message }
  revalidatePath('/dashboard/assignments')
  revalidatePath('/dashboard/student/assignments')
  return { success: true }
}

import { notifyAllStudents } from '@/actions/notifications'

// ============================================================
// PUBLICAR / DESPUBLICAR TAREA
// ============================================================
export async function toggleAssignmentPublish(assignmentId: string, publish: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { data: assignment, error } = await supabase
    .from('assignments')
    .update({ is_published: publish, updated_at: new Date().toISOString() })
    .eq('id', assignmentId)
    .select('id, title')
    .single()

  if (error || !assignment) return { error: error?.message || 'Error al actualizar tarea' }

  if (publish) {
    await notifyAllStudents({
      title: `Nueva Tarea Disponible: ${assignment.title}`,
      message: `Se ha publicado una nueva tarea práctica. Revisa las instrucciones y fecha de entrega.`,
      type: 'assignment',
      link_url: '/dashboard/student/assignments',
    })
  }

  revalidatePath('/dashboard/assignments')
  revalidatePath('/dashboard/student/assignments')
  return { success: true }
}

// ============================================================
// LISTAR TAREAS (todas las publicadas para estudiantes; todas para teacher/admin)
// ============================================================
export async function getAssignments(includeUnpublished = false) {
  const supabase = await createClient()

  let query = supabase
    .from('assignments')
    .select(`
      *,
      teacher:profiles!assignments_teacher_id_fkey(id, full_name),
      category:categories(id, name)
    `)
    .order('created_at', { ascending: false })

  if (!includeUnpublished) query = query.eq('is_published', true)

  const { data } = await query
  return { assignments: data ?? [] }
}

// ============================================================
// LISTAR ENTREGAS DE UNA TAREA (Maestro)
// ============================================================
export async function getAssignmentSubmissions(assignmentId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('assignment_submissions')
    .select(`
      *,
      student:profiles!assignment_submissions_student_id_fkey(id, full_name, email, student_id),
      grade:assignment_grades(id, score, participation_score, feedback, is_published, graded_at)
    `)
    .eq('assignment_id', assignmentId)
    .order('submitted_at', { ascending: true })

  return { submissions: data ?? [] }
}

// ============================================================
// SIMULACIÓN DE API DE TERCEROS PARA CONTROL DE PLAGIO
// ============================================================
async function checkPlagiarism(content: string, fileBuffer?: ArrayBuffer | null) {
  // Simularemos que el servicio demora unos segundos analizando
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Lógica ficticia: Si el contenido contiene palabras clave como "copia", "internet", o "wikipedia"
  const textToLower = content.toLowerCase()
  if (textToLower.includes('wikipedia') || textToLower.includes('copia')) {
    return {
      has_plagiarism: true,
      score: 75, // 75% plagio
      sources: [
        { url: 'https://es.wikipedia.org/wiki/Radiologia', title: 'Wikipedia - Radiología', credits: 'Wikipedia Contributors' }
      ]
    }
  }

  // De lo contrario, decimos que está limpio (o con bajo porcentaje)
  return {
    has_plagiarism: false,
    score: 5,
    sources: []
  }
}

// ============================================================
// ENTREGAR TAREA (Estudiante)
// ============================================================
export async function submitAssignment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const assignmentId = formData.get('assignmentId') as string
  const content = (formData.get('content') as string) || ''
  const file = formData.get('file') as File | null

  if (!assignmentId) return { error: 'ID de tarea inválido.' }

  let fileUrl = null
  let fileBuffer = null

  // 1. Subir archivo a Supabase Storage (si existe)
  if (file && file.size > 0) {
    fileBuffer = await file.arrayBuffer()
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `${assignmentId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('assignments')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
      })

    if (uploadError) {
      console.error('Error al subir archivo:', uploadError)
      // Continuamos pero sin el archivo
    } else {
      const { data } = supabase.storage.from('assignments').getPublicUrl(filePath)
      fileUrl = data.publicUrl
    }
  }

  // 2. Control de Plagio (Terceros)
  // Normalmente enviarías el texto extraído o el archivo al servicio
  const plagiarismReport = await checkPlagiarism(content, fileBuffer)

  // 3. Guardar en la BD
  const { error } = await supabase.from('assignment_submissions').upsert({
    assignment_id: assignmentId,
    student_id: user.id,
    content,
    file_url: fileUrl,
    plagiarism_report: plagiarismReport,
    submitted_at: new Date().toISOString(),
  }, { onConflict: 'assignment_id,student_id' })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/student/assignments')
  return { success: true }
}

// ============================================================
// CALIFICAR ENTREGA (Maestro)
// ============================================================
export async function gradeSubmission(data: {
  submissionId: string
  score: number
  participationScore?: number
  feedback?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { error } = await supabase.from('assignment_grades').upsert({
    submission_id: data.submissionId,
    teacher_id: user.id,
    score: data.score,
    participation_score: data.participationScore ?? 0,
    feedback: data.feedback ?? null,
    is_published: false,
    graded_at: new Date().toISOString(),
  }, { onConflict: 'submission_id' })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/assignments')
  return { success: true }
}

// ============================================================
// PUBLICAR CALIFICACIÓN (hace visible al estudiante)
// ============================================================
export async function publishGrade(submissionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { error } = await supabase
    .from('assignment_grades')
    .update({ is_published: true })
    .eq('submission_id', submissionId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/assignments')
  revalidatePath('/dashboard/student/assignments')
  return { success: true }
}

// ============================================================
// OBTENER MIS TAREAS CON ESTADO (Estudiante)
// ============================================================
export async function getMyAssignments() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { assignments: [] }

  const { data: assignments } = await supabase
    .from('assignments')
    .select(`
      *,
      teacher:profiles!assignments_teacher_id_fkey(full_name),
      submissions:assignment_submissions(
        id, content, submitted_at,
        grade:assignment_grades(score, participation_score, feedback, is_published)
      )
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  // Filtrar las submissions solo del estudiante actual
  const withMySubmissions = (assignments ?? []).map((a: {
    submissions: Array<{ id: string; student_id?: string }>
    [key: string]: unknown
  }) => ({
    ...a,
    mySubmission: Array.isArray(a.submissions) ? a.submissions[0] ?? null : null,
  }))

  return { assignments: withMySubmissions }
}
