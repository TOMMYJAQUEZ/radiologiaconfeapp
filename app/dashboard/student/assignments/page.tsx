import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getMyAssignments } from '@/actions/assignments'
import { getStudentGradeSummary, getCertificates } from '@/actions/certificates'
import StudentAssignmentsClient from './StudentAssignmentsClient'

export const metadata = {
  title: 'Mis Tareas | Radiología con Fe',
  description: 'Entregar tareas y consultar calificaciones de radiología.',
}

export default async function StudentAssignmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ assignments }, gradeSummary, { certificates }] = await Promise.all([
    getMyAssignments(),
    getStudentGradeSummary(user.id),
    getCertificates(user.id),
  ])

  // Verificar solicitud pendiente
  const { data: pendingReq } = await supabase
    .from('certificate_requests')
    .select('id, status')
    .eq('student_id', user.id)
    .not('status', 'in', '(teacher_rejected,director_rejected)')
    .maybeSingle()

  const safeGradeSummary = 'error' in gradeSummary ? null : gradeSummary

  return (
    <StudentAssignmentsClient
      assignments={(assignments as unknown as Array<{ id: string; title: string; description: string; instructions?: string; due_date?: string; max_score: number; teacher?: { full_name: string }; mySubmission?: { id: string; content?: string; submitted_at: string; grade?: Array<{ score?: number; participation_score?: number; feedback?: string; is_published?: boolean }> | null } | null }>) ?? []}
      gradeSummary={safeGradeSummary}
      hasCertificate={(certificates?.length ?? 0) > 0}
      hasPendingRequest={!!pendingReq && pendingReq.status !== 'issued'}
    />
  )
}
