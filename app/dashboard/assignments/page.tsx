import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAssignments } from '@/actions/assignments'
import AssignmentsDashboardClient from './AssignmentsDashboardClient'

export const metadata = {
  title: 'Gestión de Tareas | Radiología con Fe',
  description: 'Crear, publicar y calificar tareas para los estudiantes.',
}

export default async function AssignmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || !['TEACHER', 'ADMIN'].includes(profile.role)) redirect('/dashboard')

  const { assignments } = await getAssignments(true)

  return (
    <AssignmentsDashboardClient
      assignments={assignments ?? []}
      userRole={profile.role}
    />
  )
}
