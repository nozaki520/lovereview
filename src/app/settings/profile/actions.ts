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

export async function deleteAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // 1. usersテーブルを匿名化
  const { error: anonymizeError } = await supabase
    .from('users')
    .update({
      display_name: '退会済みユーザー',
      username: `deleted_${user.id.slice(0, 8)}`,
      avatar_url: null,
      bio: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (anonymizeError) throw new Error('退会処理に失敗しました')

  // 2. Auth側のアカウントを物理削除
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const adminSupabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { error: deleteAuthError } = await adminSupabase.auth.admin.deleteUser(user.id)

  if (deleteAuthError) throw new Error('退会処理に失敗しました')

  redirect('/')
}