'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Bookmark } from 'lucide-react'

export default function WatchlistButton({
  itemId,
  userId,
  initialWatching,
}: {
  itemId: string
  userId: string
  initialWatching: boolean
}) {
  const [watching, setWatching] = useState(initialWatching)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const toggle = async () => {
    if (loading) return
    setLoading(true)

    if (watching) {
      await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', userId)
        .eq('item_id', itemId)
      setWatching(false)
    } else {
      await supabase
        .from('watchlist')
        .insert({ user_id: userId, item_id: itemId })
      setWatching(true)
    }

    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all ${
        watching
          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
          : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Bookmark className={`w-4 h-4 ${watching ? 'fill-amber-400' : ''}`} />
      {watching ? 'ウォッチ中' : 'ウォッチリストに追加'}
    </button>
  )
}