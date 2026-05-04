export const dynamic = 'force-dynamic'

import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Clock, MessageSquareQuote } from 'lucide-react'
import ShareButton from '@/components/ShareButton'
import StillUsingButton from '@/components/StillUsingButton'

export default async function ItemDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()
  
  // Fetch item details
  const { data: item } = await supabase.from('items').select('*').eq('id', resolvedParams.id).single()

  if (!item) return <div>商品が見つかりません</div>

// ログインユーザー取得
  const { data: { user } } = await supabase.auth.getUser()

  // ユーザーがこの商品を登録済みか確認
  const { data: userItem } = user ? await supabase
    .from('user_items')
    .select('*')
    .eq('user_id', user.id)
    .eq('item_id', item.id)
    .single() : { data: null }

  // 今日すでにまだ使ってる！を押したか確認
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { data: todayLog } = userItem ? await supabase
    .from('still_using_logs')
    .select('id')
    .eq('user_item_id', userItem.id)
    .gte('logged_at', today.toISOString())
    .single() : { data: null }

  const alreadyPressedToday = !!todayLog
  const daysElapsed = userItem
    ? Math.floor((Date.now() - new Date(userItem.purchased_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Fetch reviews with user info
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, users(display_name, avatar_url)')
    .eq('item_id', item.id)
    .order('published_at', { ascending: false })

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <Link href="/explore" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors mb-8 inline-flex font-medium">
        <ArrowLeft className="w-4 h-4" />
        探す画面へ戻る
      </Link>
      
      {/* Item Header */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-12 flex flex-col md:flex-row gap-8 shadow-2xl">
        <div className="w-40 h-40 bg-white/5 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl">📦</span>
          )}
        </div>
        <div className="flex-1">
          <span className="px-3 py-1 bg-white/5 text-zinc-300 text-xs font-bold rounded-full border border-white/10 inline-block mb-4">
            {item.genre}
          </span>
          <h1 className="text-3xl font-bold mb-4 leading-tight">{item.name}</h1>
          <div className="flex items-center gap-4 text-sm font-bold text-zinc-300 mb-6 bg-white/5 inline-flex px-4 py-2 rounded-xl border border-white/5">
            <span className="flex items-center gap-1 text-yellow-500">★ {item.rating_average.toFixed(1)}</span>
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-400">{item.rating_count}件のレビュー</span>
          </div>
          <p className="text-zinc-400 text-sm whitespace-pre-wrap leading-relaxed">{item.description || "説明はありません。"}</p>
        </div>
      </div>

      {/* Action Banner */}
      <div className="text-center py-10 px-6 bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20 rounded-3xl shadow-[0_0_30px_rgba(245,158,11,0.05)] mb-12">
        <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-400">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-200">
          この商品を持っていますか？
        </h2>
        <p className="text-zinc-400 text-sm mb-8 font-medium max-w-md mx-auto">
          購入日を登録して、時間経過とともに変化するリアルなレビューを共有しましょう。
        </p>
        <Link 
          href={`/items/${item.id}/register`}
          className="inline-block px-8 py-4 bg-amber-500 text-black font-bold rounded-full shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-105 transition-all active:scale-95"
        >
          購入・体験を記録する / レビューを書く
        </Link>
      </div>

        {userItem && (
          <div className="mt-6">
            <StillUsingButton
              userItemId={userItem.id}
              itemName={item.name}
              daysElapsed={daysElapsed}
              initialPressed={alreadyPressedToday}
            />
          </div>
        )}

      {/* Reviews Section */}
      <div>
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 border-b border-white/10 pb-4">
          <MessageSquareQuote className="text-amber-400 w-6 h-6" />
          熟成レビュー
        </h2>

        {reviews && reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review: any) => {
              const stageLabels: Record<string, string> = {
                'day1': 'ファーストインプレッション',
                'week1': '1週間後レビュー',
                'month1': '1ヶ月後レビュー',
                'month3': '3ヶ月後レビュー',
                'month6': '半年後レビュー',
                'year1': '1年後レビュー',
                'beyond': '長期レビュー'
              }
              const stageName = stageLabels[review.stage] || review.stage

              return (
                <div key={review.id} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 hover:border-amber-500/30 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center overflow-hidden">
                        {review.users?.avatar_url ? (
                          <img src={review.users.avatar_url} alt={review.users.display_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg">👤</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-zinc-200">{review.users?.display_name || '名無しユーザー'}</div>
                        <div className="text-xs text-zinc-500">
                          {new Date(review.published_at).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold mb-1">
                        {stageName}
                      </div>
                      <div className="text-xs text-zinc-400 font-medium">使用開始から {review.days_elapsed} 日目</div>
                    </div>
                  </div>
                  
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500 text-sm">
                      {'★'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}
                    </div>
                    <ShareButton 
                      text={`${item.name}の${stageName}を投稿しました！\n使用開始から${review.days_elapsed}日目\n評価：★${review.rating}\n\n#LoveRevi #熟成レビュー\n`}
                      url={`http://lovereview.vercel.app/items/${item.id}`} 
                    />
                  </div>

                  <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{review.body}</p>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500 bg-white/5 rounded-3xl border border-white/5">
            まだレビューがありません。<br/>一番最初のレビューを書いてみませんか？
          </div>
        )}
      </div>
    </div>
  )
}
