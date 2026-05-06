'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DeleteReviewButtonProps {
  reviewId: string
  userId: string
  currentUserId: string
  itemId: string
}

export default function DeleteReviewButton({ reviewId, userId, currentUserId, itemId }: DeleteReviewButtonProps) {
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const router = useRouter()

  if (userId !== currentUserId) return null

  const handleDelete = async () => {
    if (!confirm) {
      setConfirm(true)
      return
    }

    setLoading(true)
    const supabase = createClient()

await supabase.from('likes').delete().eq('review_id', reviewId)
    await supabase.from('feed_events').delete().eq('target_id', reviewId)
    await supabase.from('reviews').delete().eq('id', reviewId)

    // 星平均を再計算して更新
    const { data: remainingReviews } = await supabase
      .from('reviews')
      .select('rating, user_id')
      .eq('item_id', itemId)
      .not('rating', 'is', null)

    if (remainingReviews && remainingReviews.length > 0) {
      const uniqueUserRatings = Object.values(
        remainingReviews.reduce((acc: any, r: any) => {
          acc[r.user_id] = r.rating
          return acc
        }, {})
      ) as number[]
      const avg = uniqueUserRatings.reduce((a, b) => a + b, 0) / uniqueUserRatings.length
      await supabase
        .from('items')
        .update({ rating_average: avg, rating_count: uniqueUserRatings.length })
        .eq('id', itemId)
    } else {
      await supabase
        .from('items')
        .update({ rating_average: 0, rating_count: 0 })
        .eq('id', itemId)
    }

    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
        confirm
          ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
          : 'bg-white/5 text-zinc-500 border-white/10 hover:bg-white/10 hover:text-zinc-300'
      }`}
    >
      <Trash2 className="w-3 h-3" />
      {confirm ? '本当に削除する？' : '削除'}
    </button>
  )
}