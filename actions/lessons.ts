'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/actions/auth'

// ─── HELPERS ─────────────────────────────────────────────────────────────────

async function ensureTeacherOrAdmin() {
  const user = await getCurrentUser()
  if (!user || !['TEACHER', 'ADMIN'].includes(user.role)) {
    throw new Error('Acceso no autorizado.')
  }
  return user
}

// ─── GET ALL LESSONS (public / published) ────────────────────────────────────

export async function getPublishedLessons(categoryFilter?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('lessons')
    .select(`*, author:profiles(full_name)`)
    .eq('is_published', true)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false })

  if (categoryFilter && categoryFilter !== 'ALL') {
    query = query.eq('category', categoryFilter)
  }

  const { data, error } = await query
  if (error) {
    console.error('Error fetching lessons:', error)
    return []
  }
  return data || []
}

// ─── GET ALL LESSONS FOR ADMIN/TEACHER ───────────────────────────────────────

export async function getAllLessons() {
  await ensureTeacherOrAdmin()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lessons')
    .select(`*, author:profiles(full_name)`)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all lessons:', error)
    return []
  }
  return data || []
}

// ─── CREATE LESSON ────────────────────────────────────────────────────────────

export async function createLesson(formData: FormData) {
  const user = await ensureTeacherOrAdmin()
  const supabase = await createClient()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const video_url = formData.get('video_url') as string
  const category = formData.get('category') as string
  const duration_minutes = parseInt(formData.get('duration_minutes') as string) || null
  const is_published = formData.get('is_published') === 'true'
  const order_index = parseInt(formData.get('order_index') as string) || 0

  if (!title || !video_url) {
    return { error: 'El título y la URL del video son obligatorios.' }
  }

  // Normalizar URL de YouTube/Vimeo para embed
  const embed_url = normalizeVideoUrl(video_url)
  if (!embed_url) {
    return { error: 'URL de video no válida. Usa YouTube, Vimeo o un enlace directo .mp4.' }
  }

  const { error } = await supabase.from('lessons').insert({
    title,
    description,
    video_url: embed_url,
    original_url: video_url,
    category,
    duration_minutes,
    is_published,
    order_index,
    author_id: user.id,
  })

  if (error) {
    console.error('Error creating lesson:', error)
    return { error: 'No se pudo guardar la clase. Verifica los datos e intenta de nuevo.' }
  }

  revalidatePath('/dashboard/lessons')
  revalidatePath('/dashboard/student/lessons')
  return { success: true }
}

// ─── UPDATE LESSON ────────────────────────────────────────────────────────────

export async function updateLesson(lessonId: string, formData: FormData) {
  await ensureTeacherOrAdmin()
  const supabase = await createClient()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const video_url = formData.get('video_url') as string
  const category = formData.get('category') as string
  const duration_minutes = parseInt(formData.get('duration_minutes') as string) || null
  const is_published = formData.get('is_published') === 'true'
  const order_index = parseInt(formData.get('order_index') as string) || 0

  const embed_url = normalizeVideoUrl(video_url)
  if (!embed_url) {
    return { error: 'URL de video no válida.' }
  }

  const { error } = await supabase
    .from('lessons')
    .update({
      title,
      description,
      video_url: embed_url,
      original_url: video_url,
      category,
      duration_minutes,
      is_published,
      order_index,
      updated_at: new Date().toISOString(),
    })
    .eq('id', lessonId)

  if (error) {
    return { error: 'No se pudo actualizar la clase.' }
  }

  revalidatePath('/dashboard/lessons')
  revalidatePath('/dashboard/student/lessons')
  return { success: true }
}

// ─── DELETE LESSON ────────────────────────────────────────────────────────────

export async function deleteLesson(lessonId: string) {
  await ensureTeacherOrAdmin()
  const supabase = await createClient()

  const { error } = await supabase.from('lessons').delete().eq('id', lessonId)

  if (error) {
    return { error: 'No se pudo eliminar la clase.' }
  }

  revalidatePath('/dashboard/lessons')
  revalidatePath('/dashboard/student/lessons')
  return { success: true }
}

// ─── TOGGLE PUBLISH ───────────────────────────────────────────────────────────

export async function toggleLessonPublished(lessonId: string, isPublished: boolean) {
  await ensureTeacherOrAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('lessons')
    .update({ is_published: isPublished, updated_at: new Date().toISOString() })
    .eq('id', lessonId)

  if (error) {
    return { error: 'No se pudo cambiar el estado de publicación.' }
  }

  revalidatePath('/dashboard/lessons')
  revalidatePath('/dashboard/student/lessons')
  return { success: true }
}

// ─── HELPER: Normalizar URLs de YouTube / Vimeo ───────────────────────────────

function normalizeVideoUrl(url: string): string | null {
  if (!url || !url.trim()) return null
  url = url.trim()

  // YouTube watch URL → embed
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`
  }

  // Already an embed URL
  if (url.includes('youtube.com/embed/')) return url
  if (url.includes('player.vimeo.com/video/')) return url

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }

  // Direct MP4 or other video
  if (url.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) return url

  // Google Drive embed
  if (url.includes('drive.google.com')) {
    const driveMatch = url.match(/\/d\/([^/]+)/)
    if (driveMatch) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`
    }
  }

  return null
}
