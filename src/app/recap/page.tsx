export const dynamic = 'force-dynamic'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ShareButton from '@/components/ShareButton'

export default async function RecapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  // 過去1年のレビュー
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, items(id, name, genre, image_url)')
    .eq('user_id', user.id)
    .gte('published_at', oneYearAgo.toISOString())
    .order('published_at', { ascending: false })

  // 過去1年で追加した商品
  const { data: userItems } = await supabase
    .from('user_items')
    .select('*, items(id, name, genre, image_url)')
    .eq('user_id', user.id)
    .gte('created_at', oneYearAgo.toISOString())

  // 全登録商品（愛用日数計算用）
  const { data: allUserItems } = await supabase
    .from('user_items')
    .select('*, items(id, name, genre, image_url)')
    .eq('user_id', user.id)

  // 一番長く使ってる商品
  const longestItem = allUserItems
    ?.map(ui => ({
      ...ui,
      days: Math.floor((Date.now() - new Date(ui.purchased_at).getTime()) / (1000 * 60 * 60 * 24))
    }))
    .sort((a, b) => b.days - a.days)[0]

  // 一番多く書いたジャンル
  const genreCount: Record<string, number> = {}
  reviews?.forEach(r => {
    const genre = (r.items as any)?.genre || 'other'
    genreCount[genre] = (genreCount[genre] || 0) + 1
  })
  const topGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]

  const genreLabels: Record<string, string> = {
    'book': '📚 本・漫画',
    'game': '🎮 ゲーム',
    'gadget': '📱 ガジェット・家電',
    'fashion': '👗 ファッション',
    'food': '🍜 食品',
    'spiritual': '🔮 占い・スピリチュアル',
    'beauty': '💄 コスメ・美容',
    'other': '🎁 その他',
  }

  // バッジ計算
  const BADGES = [
    { days: 2000, emoji: '👑', label: '2000日' },
    { days: 1000, emoji: '💎', label: '1000日' },
    { days: 365, emoji: '🌳', label: '365日' },
    { days: 100, emoji: '🌿', label: '100日' },
    { days: 30, emoji: '🌱', label: '30日' },
  ]
  const earnedBadges = BADGES.filter(badge =>
    allUserItems?.some(ui =>
      Math.floor((Date.now() - new Date(ui.purchased_at).getTime()) / (1000 * 60 * 60 * 24)) >= badge.days
    )
  )

  const shareText = `📊 過去1年間のLoveReviまとめ
・レビュー数：${reviews?.length || 0}件
・登録商品：${userItems?.length || 0}個
・最長愛用：${longestItem?.items ? (longestItem.items as any).name : 'なし'}（${longestItem?.days || 0}日）
・獲得バッジ：${earnedBadges.map(b => b.emoji).join('')}

#LoveRevi #熟成レビュー`

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <Link href="/home" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors mb-8 font-medium">
        <ArrowLeft className="w-4 h-4" />
        ホームへ戻る
      </Link>

      {/* ヘッダー */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">📊</div>
        <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400 mb-2">
          過去1年間のまとめ
        </h1>
        <p className="text-zinc-400 text-sm">{profile?.display_name}さんの愛用記録</p>
      </div>

      <div className="space-y-4">
        {/* レビュー数 */}
        <div className="bg-black/40 border border-white/10 rounded-3xl p-6">
          <div className="text-xs text-zinc-500 font-bold mb-2">✍️ 書いたレビュー</div>
          <div className="text-5xl font-black text-amber-400 mb-1">{reviews?.length || 0}<span className="text-2xl text-zinc-400 ml-1">件</span></div>
          {topGenre && (
            <div className="text-sm text-zinc-400 mt-2">
              一番多く書いたジャンル：<span className="text-amber-400 font-bold">{genreLabels[topGenre[0]] || topGenre[0]}</span>（{topGenre[1]}件）
            </div>
          )}
        </div>

        {/* 新規登録商品 */}
        <div className="bg-black/40 border border-white/10 rounded-3xl p-6">
          <div className="text-xs text-zinc-500 font-bold mb-2">📦 新しく登録した商品</div>
          <div className="text-5xl font-black text-emerald-400 mb-1">{userItems?.length || 0}<span className="text-2xl text-zinc-400 ml-1">個</span></div>
          {userItems && userItems.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {userItems.slice(0, 5).map((ui: any) => (
                <span key={ui.id} className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded-full text-zinc-300">
                  {ui.items?.name}
                </span>
              ))}
              {userItems.length > 5 && (
                <span className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded-full text-zinc-500">
                  +{userItems.length - 5}個
                </span>
              )}
            </div>
          )}
        </div>

        {/* 最長愛用商品 */}
        {longestItem && (
          <div className="bg-black/40 border border-white/10 rounded-3xl p-6">
            <div className="text-xs text-zinc-500 font-bold mb-2">❤️ 最長愛用商品</div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/5 rounded-xl overflow-hidden flex items-center justify-center border border-white/10 flex-shrink-0">
                {(longestItem.items as any)?.image_url ? (
                  <img src={(longestItem.items as any).image_url} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">📦</span>
                )}
              </div>
              <div>
                <div className="font-bold text-white">{(longestItem.items as any)?.name}</div>
                <div className="text-amber-400 font-black text-2xl mt-1">{longestItem.days}<span className="text-sm text-zinc-400 ml-1">日愛用</span></div>
              </div>
            </div>
          </div>
        )}

        {/* 獲得バッジ */}
        {earnedBadges.length > 0 && (
          <div className="bg-black/40 border border-white/10 rounded-3xl p-6">
            <div className="text-xs text-zinc-500 font-bold mb-4">🏅 獲得バッジ</div>
            <div className="flex flex-wrap gap-3">
              {earnedBadges.map(badge => (
                <div key={badge.days} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                  <span className="text-xl">{badge.emoji}</span>
                  <span className="text-sm font-bold text-zinc-300">{badge.label}愛用</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* シェアボタン */}
        <div className="text-center pt-4">
          <ShareButton
            text={shareText}
            url="https://lovereview.vercel.app"
          />
        </div>
      </div>
    </div>
  )
}