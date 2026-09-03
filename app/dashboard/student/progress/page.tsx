import { getStudentProgressData } from '@/actions/student';
import ProgressView from '@/components/dashboard/ProgressView';

export default async function StudentProgressPage() {
  const data = await getStudentProgressData();

  return <ProgressView data={data} />;
}
