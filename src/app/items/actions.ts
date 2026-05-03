'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createItem(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Unauthorized")

  const name = formData.get('name') as string
  const genre = formData.get('genre') as string
  const description = formData.get('description') as string
  
  let image_url = null
  const imageFile = formData.get('image_file') as File | null

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `items/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, imageFile)

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(fileName)
      image_url = publicUrlData.publicUrl
    }
  }

  const { data, error } = await supabase
    .from('items')
    .insert({
      name,
      genre,
      description,
      image_url,
      created_by: user.id
    })
    .select()
    .single()

  if (error) {
    console.error("Item creation error:", error)
    throw new Error(error.message)
  }

  revalidatePath('/explore')
  redirect('/explore')
}
