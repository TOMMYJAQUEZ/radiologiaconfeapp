'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface PlatformNotification {
  id: string
  title: string
  message: string
  type: 'assignment' | 'grade' | 'exam' | 'certificate' | 'system'
  url: string
  is_read: boolean
  created_at: string
}

export async function notifyAllStudents(payload: {
  title: string
  message: string
  type: 'assignment' | 'grade' | 'exam' | 'certificate' | 'system'
  link_url?: string
}) {
  const supabase = await createClient()

  try {
    const { data: students } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'STUDENT')
      .eq('is_active', true)

    if (students && students.length > 0) {
      const inserts = students.map((s) => ({
        user_id: s.id,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        link_url: payload.link_url || '/dashboard',
        is_read: false,
      }))

      await supabase.from('notifications').insert(inserts)
    }
  } catch (err) {
    console.error('Error enviando notificaciones a estudiantes:', err)
  }
}

export async function getUserNotifications(): Promise<{ notifications: PlatformNotification[]; unreadCount: number }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { notifications: [], unreadCount: 0 }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const notifications: PlatformNotification[] = []

  // 1. Notificaciones guardadas en la tabla 'notifications' (si existe)
  try {
    const { data: dbNotifs } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (dbNotifs && dbNotifs.length > 0) {
      for (const n of dbNotifs) {
        notifications.push({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type as any,
          url: n.link_url || '/dashboard',
          is_read: n.is_read,
          created_at: n.created_at,
        })
      }
    }
  } catch {
    // Si la tabla no está creada aún en Supabase, continuamos con los eventos dinámicos
  }

  // 2. Eventos Dinámicos en Tiempo Real según el Rol
  const role = profile?.role || 'STUDENT'

  if (role === 'STUDENT') {
    // A. Exámenes publicados recientemente
    const { data: publishedExams } = await supabase
      .from('exams')
      .select('id, title, category:categories(name), created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(5)

    if (publishedExams) {
      for (const ex of publishedExams) {
        const catName = (ex.category as any)?.name || 'Radiología'
        notifications.push({
          id: `dyn-exam-${ex.id}`,
          title: `Nuevo Examen Disponible: ${ex.title}`,
          message: `Se ha publicado una nueva evaluación de ${catName}. ¡Ponte a prueba!`,
          type: 'exam',
          url: `/exam/${ex.id}`,
          is_read: false,
          created_at: ex.created_at,
        })
      }
    }

    // B. Tareas publicadas recientemente
    const { data: assignments } = await supabase
      .from('assignments')
      .select('id, title, created_at, teacher:profiles(full_name)')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(4)

    if (assignments) {
      for (const a of assignments) {
        const teacherName = (a.teacher as any)?.full_name || 'Tu maestro'
        notifications.push({
          id: `dyn-asg-${a.id}`,
          title: `Nueva Tarea Disponible: ${a.title}`,
          message: `${teacherName} ha publicado una nueva tarea práctica.`,
          type: 'assignment',
          url: '/dashboard/student/assignments',
          is_read: false,
          created_at: a.created_at,
        })
      }
    }

    // B. Calificaciones publicadas para el estudiante
    const { data: myGrades } = await supabase
      .from('assignment_submissions')
      .select(`
        id,
        assignment:assignments(title),
        grade:assignment_grades(score, participation_score, is_published, graded_at)
      `)
      .eq('student_id', user.id)

    if (myGrades) {
      for (const sub of myGrades) {
        const grade = Array.isArray(sub.grade) ? sub.grade[0] : null
        if (grade && grade.is_published) {
          const asgTitle = (sub.assignment as any)?.title || 'Tarea'
          notifications.push({
            id: `dyn-grade-${sub.id}`,
            title: `Calificación Publicada: ${asgTitle}`,
            message: `Has obtenido ${grade.score}% en tu trabajo entregado.`,
            type: 'grade',
            url: '/dashboard/student/assignments',
            is_read: false,
            created_at: grade.graded_at || new Date().toISOString(),
          })
        }
      }
    }

    // C. Estado de Solicitudes de Certificados
    const { data: certReqs } = await supabase
      .from('certificate_requests')
      .select('id, status, updated_at, certificate:certificates(certificate_number)')
      .eq('student_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(2)

    if (certReqs) {
      for (const cr of certReqs) {
        if (cr.status === 'issued') {
          notifications.push({
            id: `dyn-cert-${cr.id}`,
            title: '🎉 ¡Certificado Oficial Expedido!',
            message: 'Tu certificado ha sido expedido por la Dirección. Puedes verlo e imprimirlo en PDF.',
            type: 'certificate',
            url: '/dashboard/student/assignments',
            is_read: false,
            created_at: cr.updated_at,
          })
        } else if (cr.status === 'teacher_approved') {
          notifications.push({
            id: `dyn-cert-teach-${cr.id}`,
            title: 'Certificado Aprobado por Maestro',
            message: 'Tu maestro ha aprobado tu solicitud. Está pendiente de firma del Director.',
            type: 'certificate',
            url: '/dashboard/student/assignments',
            is_read: false,
            created_at: cr.updated_at,
          })
        }
      }
    }
  } else if (role === 'TEACHER') {
    // Para Maestros: Solicitudes pendientes y entregas nuevas
    const { data: pendingCerts } = await supabase
      .from('certificate_requests')
      .select('id, student:profiles(full_name), created_at')
      .eq('status', 'pending')
      .limit(5)

    if (pendingCerts) {
      for (const pc of pendingCerts) {
        const studentName = (pc.student as any)?.full_name || 'Un estudiante'
        notifications.push({
          id: `dyn-tcert-${pc.id}`,
          title: 'Solicitud de Certificado Pendiente',
          message: `${studentName} solicita aprobación de certificado.`,
          type: 'certificate',
          url: '/dashboard/certificates',
          is_read: false,
          created_at: pc.created_at,
        })
      }
    }
  } else if (role === 'ADMIN') {
    // Para el Director: Solicitudes aprobadas por maestro para expedir
    const { data: approvedByTeacher } = await supabase
      .from('certificate_requests')
      .select('id, student:profiles(full_name), updated_at')
      .eq('status', 'teacher_approved')
      .limit(5)

    if (approvedByTeacher) {
      for (const req of approvedByTeacher) {
        const studentName = (req.student as any)?.full_name || 'Estudiante'
        notifications.push({
          id: `dyn-dcert-${req.id}`,
          title: 'Certificado listo para Expedir',
          message: `${studentName} cuenta con el aval docente y espera tu firma y expedición.`,
          type: 'certificate',
          url: '/dashboard/certificates',
          is_read: false,
          created_at: req.updated_at,
        })
      }
    }
  }

  // Ordenar por fecha descendente y eliminar posibles IDs duplicados
  const uniqueMap = new Map<string, PlatformNotification>()
  for (const item of notifications) {
    if (!uniqueMap.has(item.id)) {
      uniqueMap.set(item.id, item)
    }
  }

  const sorted = Array.from(uniqueMap.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const unreadCount = sorted.filter(n => !n.is_read).length

  return { notifications: sorted.slice(0, 15), unreadCount }
}

export async function markNotificationAsRead(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }

  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', user.id)
  } catch {}

  revalidatePath('/dashboard')
  return { success: true }
}

export async function markAllNotificationsAsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }

  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
  } catch {}

  revalidatePath('/dashboard')
  return { success: true }
}
