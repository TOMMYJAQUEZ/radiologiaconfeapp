import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getMySignature } from '@/actions/signatures'
import SignatureClient from './SignatureClient'

export const metadata = {
  title: 'Mi Firma Digital | Radiología con Fe',
  description: 'Gestión de firma digital institucional para certificados.',
}

export default async function SignaturesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['TEACHER', 'ADMIN'].includes(profile.role)) redirect('/dashboard')

  const { signature } = await getMySignature()

  return (
    <SignatureClient
      currentSignature={signature?.signature_b64 ?? signature?.signature_url ?? null}
      updatedAt={signature?.updated_at ?? null}
    />
  )
}
