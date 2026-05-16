'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function RetireButton({ 
  userItemId, 
  itemId,
  itemName,
  userId,
  daysElapsed
}: { 
  userItemId: string
  itemId: string
  itemName: string
  userId: string
  daysElapsed: number
}) {
  const [showModal, setShowModal] = useState(false)
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleRetire() {
    setLoading(true)
    const supabase = createClient()

    // リタイアレビューを投稿
    const { error: reviewError } = await supabase
      .from('reviews')
      .insert({
        user_item_id: userItemId,
        user_id: userId,
        item_id: itemId,
        body: body || 'リタイアしました。',
        rating: null,
        days_elapsed: daysElapsed,
        stage: 'retired',
      })

    if (reviewError) {
      alert('投稿に失敗しました。もう一度お試しください。')
      setLoading(false)
      return
    }

    // is_still_usingをfalseに更新
    await supabase
      .from('user_items')
      .update({ is_still_using: false })
      .eq('id', userItemId)

    // feed_eventsに記録
    await supabase
      .from('feed_events')
      .insert({
        user_id: userId,
        item_id: itemId,
        event_type: 'retired',
        target_id: userItemId,
      })

    setShowModal(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full py-3 border border-zinc-700 text-zinc-400 font-bold rounded-xl hover:bg-zinc-800/50 hover:text-zinc-300 transition-all text-sm"
      >
        🏁 この商品をリタイアする
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-lg font-bold mb-2">🏁 リタイアレビュー</h2>
            <p className="text-zinc-400 text-sm mb-6">
              <span className="text-white font-bold">{itemName}</span>を使うのをやめた理由や感想を書いてください。
            </p>

            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={4}
              placeholder="使わなくなった理由や感想など（任意）"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder:text-zinc-600 mb-6"
            />

            <div className="text-xs text-zinc-500 mb-6">
              使用開始から <span className="text-white font-bold">{daysElapsed}日目</span> でリタイア
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 py-3 border border-white/10 text-zinc-300 font-bold rounded-xl hover:bg-white/5 transition-all"
              >
                キャンセル
              </button>
              <button
                onClick={handleRetire}
                disabled={loading}
                className="flex-1 py-3 bg-zinc-700 text-white font-bold rounded-xl hover:bg-zinc-600 transition-all disabled:opacity-50"
              >
                {loading ? '投稿中...' : 'リタイアする'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}