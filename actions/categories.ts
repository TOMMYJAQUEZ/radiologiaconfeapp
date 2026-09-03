'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function generateSlug(text: string): string {
  const base = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
  return base || `categoria-${Date.now()}`
}

export async function getCategories() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select(`
      *,
      subcategories(count),
      questions(count)
    `)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  // format subcategories count since it comes as an array of [{ count: number }]
  return data.map(cat => ({
    ...cat,
    subcategories_count: cat.subcategories?.[0]?.count ?? 0,
    questions_count: cat.questions?.[0]?.count ?? 0
  }))
}

// ============================================================
// CREAR CATEGORÍA
// ============================================================
export async function createCategory(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado. Debes iniciar sesión.' }

  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const isActive = formData.get('is_active') === 'true'

  if (!name) return { error: 'El nombre de la categoría es obligatorio.' }

  const baseSlug = generateSlug(name)
  // Asegurar slug único agregando timestamp si es necesario
  const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`

  const { data: category, error } = await supabase
    .from('categories')
    .insert({
      name,
      slug,
      description,
      is_active: isActive,
      order_index: 0,
    })
    .select('id')
    .single()

  if (error || !category) {
    console.error('[CREATE CATEGORY ERROR]', error)
    return { error: error?.message || 'No se pudo crear la categoría en la base de datos.' }
  }

  try {
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'CATEGORY_CREATED',
      entity_type: 'category',
      entity_id: category.id,
      details: { name, slug },
    })
  } catch (auditErr) {
    console.warn('Audit log error (ignored):', auditErr)
  }

  revalidatePath('/dashboard/categories')
  return { success: true, id: category.id }
}

// ============================================================
// ACTUALIZAR CATEGORÍA
// ============================================================
export async function updateCategory(categoryId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const isActive = formData.get('is_active') === 'true'

  if (!name) return { error: 'El nombre de la categoría es obligatorio.' }

  const { error } = await supabase
    .from('categories')
    .update({
      name,
      description,
      is_active: isActive,
    })
    .eq('id', categoryId)

  if (error) {
    console.error('[UPDATE CATEGORY ERROR]', error)
    return { error: error?.message || 'No se pudo actualizar la categoría.' }
  }

  try {
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'CATEGORY_UPDATED',
      entity_type: 'category',
      entity_id: categoryId,
      details: { name },
    })
  } catch (auditErr) {
    console.warn('Audit log error (ignored):', auditErr)
  }

  revalidatePath('/dashboard/categories')
  return { success: true }
}

// ============================================================
// ELIMINAR CATEGORÍA
// ============================================================
export async function deleteCategory(categoryId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)

  if (error) {
    console.error('[DELETE CATEGORY ERROR]', error)
    return { error: 'No se pudo eliminar la categoría. Es posible que tenga preguntas o exámenes asociados.' }
  }

  try {
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'CATEGORY_DELETED',
      entity_type: 'category',
      entity_id: categoryId,
    })
  } catch (auditErr) {
    console.warn('Audit log error (ignored):', auditErr)
  }

  revalidatePath('/dashboard/categories')
  return { success: true }
}
