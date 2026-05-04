'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface StillUsingButtonProps {
  userItemId: string
  itemName: string
  daysElapsed: number
  initialPressed: boolean
}

export default function StillUsingButton({ userItemId, itemName, daysElapsed, initialPressed }: StillUsingButtonProps) {
  const [pressed, setPressed] = useState(initialPressed)
  const [loading, setLoading] = useState(false)

  const handlePress = async () => {
    if (loading || pressed) return
    setLoading(true)

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // still_using_logsに記録
    await supabase.from('still_using_logs').insert({
      user_item_id: userItemId,
      user_id: user.id,
      days_elapsed: daysElapsed,
    })

    // user_itemsのlast_used_atを更新
    await supabase
      .from('user_items')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', userItemId)

    setPressed(true)
    setLoading(false)
  }

  return (
    <button
      onClick={handlePress}
      disabled={loading || pressed}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border ${
        pressed
          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 cursor-default'
          : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30'
      }`}
    >
      {pressed ? '✅ 今日もまだ使ってる！' : '🌿 まだ使ってる！'}
    </button>
  )
}