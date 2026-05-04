'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Heart } from 'lucide-react'

interface LikeButtonProps {
  reviewId: string
  initialLiked: boolean
  initialCount: number
  userId: string
}

export default function LikeButton({ reviewId, initialLiked, initialCount, userId }: LikeButtonProps) {
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