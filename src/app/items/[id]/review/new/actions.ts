'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function submitReview(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const item_id = formData.get('item_id') as string
  const user_item_id = formData.get('user_item_id') as string
  const stage = formData.get('stage') as string
  const days_elapsed = parseInt(formData.get('days_elapsed') as string, 10)
  const rating = parseInt(formData.get('rating') as string, 10)
  const body = formData.get('body') as string

  // Insert review
  const { data: newReview, error: reviewError } = await supabase
    .from('reviews')
    .insert({
      user_id: user.id,
      user_item_id,
      item_id,
      stage,
      rating,
      body,
      days_elapsed
    })
    .select('id')
    .single()

  if (reviewError) {
    console.error("Review creation error:", reviewError)
    throw new Error(reviewError.message)
  }

  // Update item's rating average and count
  const { data: reviews } = await supabase.from('reviews').select('rating').eq('item_id', item_id)
  if (reviews) {
    const validRatings = reviews.filter(r => r.rating !== null)
    const count = validRatings.length
    const sum = validRatings.reduce((acc, curr) => acc + (curr.rating || 0), 0)
    const average = count > 0 ? sum / count : 0

    await supabase.from('items').update({
      rating_average: average,
      rating_count: count
    }).eq('id', item_id)
  }

  // Record to feed_events for Timeline
  await supabase.from('feed_events').insert({
    user_id: user.id,
    item_id,
    event_type: 'review_posted',
    target_id: newReview?.id
  })

  revalidatePath(`/items/${item_id}`)
  revalidatePath(`/home`)
  revalidatePath(`/explore`)
  redirect(`/items/${item_id}`)
}
