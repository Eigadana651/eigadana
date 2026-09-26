import { supabase } from '../lib/supabase'

export async function fetchTags() {
  const { data, error } = await supabase
    .from('tags')
    .select('id, name')
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  return data || []
}

export async function createTag(name) {
  const { data, error } = await supabase
    .from('tags')
    .insert([{ name }])
    .select('id, name')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function renameTag(id, name) {
  const { data, error } = await supabase
    .from('tags')
    .update({ name })
    .eq('id', id)
    .select('id, name')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteTag(id) {
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}