'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DeleteReviewButtonProps {
  reviewId: string
  userId: string
  currentUserId: string
}

export default function DeleteReviewButton({ reviewId, userId, currentUserId }: DeleteReviewButtonProps) {
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