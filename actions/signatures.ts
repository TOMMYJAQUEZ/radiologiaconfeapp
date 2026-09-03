'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================================
// GUARDAR FIRMA (Maestro o Director)
// ============================================================
export async function saveSignature(signatureB64: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['TEACHER', 'ADMIN'].includes(profile.role)) {
    return { error: 'Solo maestros y el director pueden registrar firma.' }
  }

  // Si es ADMIN, guardar en director_config también
  if (profile.role === 'ADMIN') {
    await supabase.from('director_config').update({
      director_signature_b64: signatureB64,
      updated_at: new Date().toISOString(),
    }).eq('id', '00000000-0000-0000-0000-000000000001')
  }

  // Guardar en teacher_signatures (aplica para maestros y director)
  const { error } = await supabase.from('teacher_signatures').upsert({
    teacher_id: user.id,
    signature_b64: signatureB64,
    is_active: true,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'teacher_id' })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/teacher/signatures')
  revalidatePath('/dashboard/certificates')
  return { success: true }
}

// ============================================================
// OBTENER FIRMA DEL USUARIO ACTUAL
// ============================================================
export async function getMySignature() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { signature: null }

  const { data } = await supabase
    .from('teacher_signatures')
    .select('signature_b64, signature_url, updated_at')
    .eq('teacher_id', user.id)
    .single()

  return { signature: data ?? null }
}

// ============================================================
// OBTENER FIRMA POR ID DE MAESTRO (para certificado)
// ============================================================
export async function getSignatureByTeacherId(teacherId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('teacher_signatures')
    .select('signature_b64, signature_url')
    .eq('teacher_id', teacherId)
    .eq('is_active', true)
    .single()

  return { signature: data ?? null }
}

// ============================================================
// ELIMINAR FIRMA
// ============================================================
export async function deleteSignature() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { error } = await supabase
    .from('teacher_signatures')
    .update({ signature_b64: null, signature_url: null, is_active: false, updated_at: new Date().toISOString() })
    .eq('teacher_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/teacher/signatures')
  return { success: true }
}
