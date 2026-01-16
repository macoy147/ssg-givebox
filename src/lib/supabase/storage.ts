import { createClient } from './client'

export async function uploadItemImage(file: File): Promise<string | null> {
  const supabase = createClient()
  if (!supabase) return null

  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `items/${fileName}`

  const { error } = await supabase.storage
    .from('item-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Error uploading image:', error)
    return null
  }

  const { data } = supabase.storage
    .from('item-images')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function deleteItemImage(imageUrl: string): Promise<boolean> {
  const supabase = createClient()
  if (!supabase) return false

  // Extract file path from URL
  const urlParts = imageUrl.split('/item-images/')
  if (urlParts.length < 2) return false
  
  const filePath = urlParts[1]

  const { error } = await supabase.storage
    .from('item-images')
    .remove([filePath])

  if (error) {
    console.error('Error deleting image:', error)
    return false
  }

  return true
}