'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Heart } from 'lucide-react'

interface LikeButtonProps {
  reviewId: string
  initialLiked: boolean
  initialCount: number
  userId: string
  reviewOwnerId?: string  // レビュー投稿者のID
}

export default function LikeButton({ reviewId, initialLiked, initialCount, userId, reviewOwnerId }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    if (loading) return
    setLoading(true)

    const supabase = createClient()

    if (liked) {
      await supabase
        .from('likes')
        .delete()
        .eq('user_id', userId)
        .eq('review_id', reviewId)
      setLiked(false)
      setCount(c => c - 1)
    } else {
      await supabase
        .from('likes')
        .insert({ user_id: userId, review_id: reviewId })
      setLiked(true)
      setCount(c => c + 1)

      // 自分のレビュー以外にいいねした場合のみ通知
      if (reviewOwnerId && reviewOwnerId !== userId) {
        // いいねした人の情報を取得
        const { data: myProfile } = await supabase
          .from('users')
          .select('display_name, username')
          .eq('id', userId)
          .single()

        await supabase.from('notifications').insert({
          user_id: reviewOwnerId,
          type: 'liked',
          target_id: reviewId,
          is_read: false,
          meta: {
            review_id: reviewId,
            user_display_name: myProfile?.display_name,
            username: myProfile?.username,
          }
        })
      }
    }

    setLoading(false)
  }

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
        liked
          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30'
          : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10 hover:text-zinc-300'
      }`}
    >
      <Heart className={`w-4 h-4 ${liked ? 'fill-rose-400' : ''}`} />
      <span>{count}</span>
    </button>
  )
}