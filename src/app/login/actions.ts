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
    redirect(`/login?message=${encodeURIComponent('ログイン失敗: ' + error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/home')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const usernameInput = formData.get('username') as string
  
  // Extract username from form or fallback to email prefix
  const username = usernameInput ? usernameInput.trim() : email.split('@')[0] + '_' + Math.floor(Math.random() * 10000)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('Signup error:', error.message)
    redirect(`/login?message=${encodeURIComponent('登録失敗: ' + error.message)}`)
  }

  if (data.user) {
    // Insert into public.users
    const { error: profileError } = await supabase.from('users').insert({
      id: data.user.id,
      username: username,
      display_name: username
    })
    
    if (profileError) {
      console.error('Profile creation failed:', profileError)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/home?welcome=1')
}
