'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { UserPlus, UserCheck } from 'lucide-react'

interface FollowButtonProps {
  targetUserId: string
  currentUserId: string
  initialFollowing: boolean
}

export default function FollowButton({ targetUserId, currentUserId, initialFollowing }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  if (targetUserId === currentUserId) return null

  const handleFollow = async () => {
    if (loading) return
    setLoading(true)

    const supabase = createClient()

    if (following) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
      setFollowing(false)
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: currentUserId, following_id: targetUserId })
      setFollowing(true)
    }

    setLoading(false)
  }

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border ${
        following
          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
          : 'bg-amber-500 text-black border-amber-500 hover:bg-amber-400'
      }`}
    >
      {following ? (
        <>
          <UserCheck className="w-4 h-4" />
          フォロー中
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          フォローする
        </>
      )}
    </button>
  )
}