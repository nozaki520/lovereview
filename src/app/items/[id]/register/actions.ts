'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function registerPurchase(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Unauthorized")

  const item_id = formData.get('item_id') as string
  const accuracy = formData.get('accuracy') as string
  let purchased_date = formData.get('purchased_date') as string

  // Handle approximate dates
  const today = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  const mm = pad(today.getMonth() + 1)
  const dd = pad(today.getDate())

  if (accuracy === 'over1y') {
    purchased_date = `${today.getFullYear() - 1}-${mm}-${dd}`
  } else if (accuracy === 'over3y') {
    purchased_date = `${today.getFullYear() - 3}-${mm}-${dd}`
  } else if (accuracy === 'over5y') {
    purchased_date = `${today.getFullYear() - 5}-${mm}-${dd}`
  } else if (accuracy === 'month') {
    // Input is 'YYYY-MM', append '-01'
    purchased_date = `${purchased_date}-01`
  }

  // Insert or update user_items
  const { error } = await supabase
    .from('user_items')
    .upsert({
      user_id: user.id,
      item_id: item_id,
      purchased_at: purchased_date,
      purchased_at_approx: accuracy,
      is_still_using: true,
      last_used_at: new Date().toISOString()
    }, { onConflict: 'user_id, item_id' })

  if (error) {
    console.error("Purchase registration error:", error)
    redirect(`/items/${item_id}/register?error=${encodeURIComponent('記録の保存に失敗しました。')}`)
  }

  revalidatePath(`/items/${item_id}`)
  // After saving purchase date, redirect to write review
  redirect(`/items/${item_id}/review/new`)
}
