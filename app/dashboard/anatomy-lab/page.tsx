import { getCurrentUser } from '@/actions/auth'
import { redirect } from 'next/navigation'
import AnatomyLab from '@/components/dashboard/AnatomyLab'

export const metadata = {
  title: 'Laboratorio de Anatomía Radiológica | Radiología con Fe',
  description: 'Simulador interactivo de anatomía radiológica con estudios reales, pines interactivos y desafíos clínicos.',
}

export default async function AnatomyLabPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  return <AnatomyLab />
}
