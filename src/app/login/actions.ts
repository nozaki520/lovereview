'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login error:', error.message)
    redirect(`/login?message=${encodeURIComponent('メールアドレスまたはパスワードが正しくありません')}`)
  }

  revalidatePath('/', 'layout')
  redirect('/home')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const usernameInput = formData.get('username') as string
  const displayNameInput = formData.get('display_name') as string
  const username = usernameInput?.trim()

  // サーバー側バリデーション
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    redirect(`/login?message=${encodeURIComponent('ユーザーIDは英数字・アンダースコアのみ、3〜20文字で入力してください')}&tab=signup`)
  }

  // ユーザーID重複チェック
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single()

  if (existing) {
    redirect(`/login?message=${encodeURIComponent('このユーザーIDはすでに使われています')}&tab=signup`)
  }

  // Authアカウント作成
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    redirect(`/login?message=${encodeURIComponent('登録失敗: ' + error.message)}&tab=signup`)
  }

  if (data.user) {
    const { error: profileError } = await supabase.from('users').insert({
      id: data.user.id,
      username: username,
      display_name: displayNameInput?.trim() || username
    })

    if (profileError) {
      redirect(`/login?message=${encodeURIComponent('アカウント作成に失敗しました。もう一度お試しください')}&tab=signup`)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/home?welcome=1')
}
