import { getCurrentUser } from '@/actions/auth'
import { getAllLessons } from '@/actions/lessons'
import { redirect } from 'next/navigation'
import LessonsManagement from '@/components/dashboard/LessonsManagement'

export const metadata = {
  title: 'Clases Pre-grabadas — Gestión | Radiología con Fe',
  description: 'Sube y gestiona las clases pre-grabadas para los estudiantes.',
}

export default async function LessonsManagementPage() {
  const user = await getCurrentUser()
  if (!user || !['TEACHER', 'ADMIN'].includes(user.role)) {
    redirect('/dashboard')
  }

  const lessons = await getAllLessons()

  return <LessonsManagement initialLessons={lessons} />
}
