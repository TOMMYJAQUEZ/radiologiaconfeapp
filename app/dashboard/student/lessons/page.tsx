import { getCurrentUser } from '@/actions/auth'
import { getPublishedLessons } from '@/actions/lessons'
import { redirect } from 'next/navigation'
import StudentLessons from '@/components/dashboard/StudentLessons'

export const metadata = {
  title: 'Clases Pre-grabadas | Radiología con Fe',
  description: 'Biblioteca de clases pre-grabadas para aprender Radiología Médica a tu ritmo.',
}

export default async function StudentLessonsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const lessons = await getPublishedLessons()

  return <StudentLessons lessons={lessons} />
}
