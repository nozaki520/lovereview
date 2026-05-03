'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const display_name = formData.get('display_name') as string
  const bio = formData.get('bio') as string
  
  let avatar_url = formData.get('current_avatar_url') as string
  const avatarFile = formData.get('avatar_file') as File | null

  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(`avatars/${fileName}`, avatarFile)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      redirect(`/settings/profile?error=${encodeURIComponent('画像のアップロードに失敗しました。SQLでStorageの準備ができているか確認してください。')}`)
    } else {
      const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(`avatars/${fileName}`)
      avatar_url = publicUrlData.publicUrl
    }
  }

  const { error } = await supabase
    .from('users')
    .update({
      display_name,
      bio,
      avatar_url,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    console.error('Profile update error:', error)
    redirect(`/settings/profile?error=${encodeURIComponent('更新に失敗しました')}`)
  }

  revalidatePath('/', 'layout')
  redirect(`/settings/profile?message=${encodeURIComponent('プロフィールを更新しました')}`)
}
