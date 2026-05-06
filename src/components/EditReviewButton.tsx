'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Pencil, X, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface EditReviewButtonProps {
  reviewId: string
  userId: string
  currentUserId: string
  initialBody: string
  initialRating: number
  itemId: string
}

export default function EditReviewButton({
  reviewId,
  userId,
  currentUserId,
  initialBody,
  initialRating,
  itemId,
}: EditReviewButtonProps) {
  const [editing, setEditing] = useState(false)
  const [body, setBody] = useState(initialBody)
  const [rating, setRating] = useState(initialRating)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  if (userId !== currentUserId) return null

  const handleSave = async () => {
    setLoading(true)
    const supabase = createClient()

    await supabase
      .from('reviews')
      .update({ body, rating, updated_at: new Date().toISOString() })
      .eq('id', reviewId)

    // 星平均を再計算
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating, user_id')
      .eq('item_id', itemId)
      .not('rating', 'is', null)

    if (allReviews && allReviews.length > 0) {
      const uniqueUserRatings = Object.values(
        allReviews.reduce((acc: any, r: any) => {
          acc[r.user_id] = r.rating
          return acc
        }, {})
      ) as number[]
      const avg = uniqueUserRatings.reduce((a, b) => a + b, 0) / uniqueUserRatings.length
      await supabase
        .from('items')
        .update({ rating_average: avg, rating_count: uniqueUserRatings.length })
        .eq('id', itemId)
    }

    setEditing(false)
    setLoading(false)
    router.refresh()
  }

  if (editing) {
    return (
      <div className="mt-4 space-y-3">
        {/* 星評価 */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-2xl transition-transform hover:scale-110 ${
                star <= rating ? 'text-amber-400' : 'text-zinc-600'
              }`}
            >
              ★
            </button>
          ))}
        </div>

        {/* 本文 */}
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
          rows={4}
        />

        {/* ボタン */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setEditing(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10 transition-all"
          >
            <X className="w-3 h-3" />
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-all"
          >
            <Check className="w-3 h-3" />
            保存する
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/5 text-zinc-500 border border-white/10 hover:bg-white/10 hover:text-zinc-300 transition-all"
    >
      <Pencil className="w-3 h-3" />
      編集
    </button>
  )
}