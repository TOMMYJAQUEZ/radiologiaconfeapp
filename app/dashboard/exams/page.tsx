import { getTeacherExams } from '@/actions/teacher'
import { getCategories } from '@/actions/categories'
import { getCurrentUser } from '@/actions/auth'
import { redirect } from 'next/navigation'
import ExamsView from '@/components/dashboard/ExamsView'

export const metadata = {
  title: 'Gestión de Exámenes | Radiología con Fe',
  description: 'Crea, configura y publica evaluaciones de radiología para los alumnos.',
}

export default async function ExamsPage() {
  const user = await getCurrentUser()
  if (!user || !['TEACHER', 'ADMIN'].includes(user.role)) redirect('/dashboard')

  const [exams, categories] = await Promise.all([
    getTeacherExams(),
    getCategories(),
  ])

  return <ExamsView initialExams={exams as any} categories={categories} />
}
