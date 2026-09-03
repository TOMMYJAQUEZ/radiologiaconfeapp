import { getTeacherAnalytics } from '@/actions/teacher';
import TeacherAnalytics from '@/components/dashboard/TeacherAnalytics';
import { getCurrentUser } from '@/actions/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Analíticas | Radiología con Fe',
  description: 'Panel de analíticas y seguimiento de estudiantes para maestros.',
};

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user || !['TEACHER', 'ADMIN'].includes(user.role)) {
    redirect('/dashboard');
  }

  const data = await getTeacherAnalytics();

  return <TeacherAnalytics data={data} />;
}
