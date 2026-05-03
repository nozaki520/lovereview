import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Lock, Unlock } from 'lucide-react'
import { submitReview } from './actions'

function calculateStage(days: number) {
  if (days < 7) return { id: 'day1', label: 'ファーストインプレッション' }
  if (days < 30) return { id: 'week1', label: '1週間後レビュー' }
  if (days < 90) return { id: 'month1', label: '1ヶ月後レビュー' }
  if (days < 180) return { id: 'month3', label: '3ヶ月後レビュー' }
  if (days < 365) return { id: 'month6', label: '半年後レビュー' }
  if (days < 1095) return { id: 'year1', label: '1年後レビュー' }
  return { id: 'beyond', label: '長期レビュー' }
}

export default async function NewReviewPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>Unauthorized</div>

  const { data: item } = await supabase.from('items').select('*').eq('id', resolvedParams.id).single()
  const { data: userItem } = await supabase.from('user_items').select('*').eq('user_id', user.id).eq('item_id', resolvedParams.id).single()

  if (!item || !userItem) {
    return (
      <div className="min-h-screen p-8 text-center text-zinc-400">
        データが見つかりません。先に購入日を登録してください。<br/>
        <Link href={`/items/${resolvedParams.id}`} className="text-amber-400 hover:underline mt-4 inline-block">戻る</Link>
      </div>
    )
  }

  // Calculate elapsed days
  const today = new Date()
  const purchasedAt = new Date(userItem.purchased_at)
  // set time to midnight to avoid timezone shift issues
  today.setHours(0, 0, 0, 0)
  purchasedAt.setHours(0, 0, 0, 0)
  
  const diffTime = today.getTime() - purchasedAt.getTime()
  const daysUsed = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)))

  const isLocked = daysUsed < 1
  const stage = calculateStage(daysUsed)

  // Check if they already posted this stage
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('user_id', user.id)
    .eq('item_id', item.id)
    .eq('stage', stage.id)
    .single()

  const alreadyPosted = !!existingReview

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <Link href={`/items/${item.id}`} className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors mb-8 inline-flex font-medium">
        <ArrowLeft className="w-4 h-4" />
        商品詳細へ戻る
      </Link>
      
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/5 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/10">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">📦</span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold">{item.name}</h1>
              <p className="text-amber-400 text-sm font-bold">使用開始から {daysUsed} 日目</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-zinc-500 mb-1">現在のステージ</div>
            <div className="px-3 py-1 bg-white/10 rounded-full text-sm font-bold border border-white/10">
              {stage.label}
            </div>
          </div>
        </div>

        {isLocked ? (
          <div className="bg-zinc-900/80 border border-white/5 rounded-2xl p-8 text-center shadow-inner">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
              <Lock className="w-8 h-8 text-zinc-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">レビューはまだロックされています</h2>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              LoveReviでは、サクラやフェイクレビューを防ぐため、<br/>
              <strong className="text-amber-400">購入から1日以上経過</strong>しないとレビューを投稿できません。<br/>
              明日以降、もう一度お越しください！
            </p>
            <Link href={`/items/${item.id}`} className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors font-bold text-sm inline-block">
              戻る
            </Link>
          </div>
        ) : alreadyPosted ? (
          <div className="bg-amber-900/20 border border-amber-500/20 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-bold mb-2 text-amber-400">投稿済みです</h2>
            <p className="text-zinc-400 text-sm mb-6">
              この「{stage.label}」ステージのレビューは既に投稿済みです。<br/>
              日数が経過して次のステージに進むと、また新しく書けるようになります。
            </p>
            <Link href={`/items/${item.id}`} className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors font-bold text-sm inline-block">
              商品ページへ
            </Link>
          </div>
        ) : (
          <form action={submitReview} className="space-y-6">
            <input type="hidden" name="item_id" value={item.id} />
            <input type="hidden" name="user_item_id" value={userItem.id} />
            <input type="hidden" name="stage" value={stage.id} />
            <input type="hidden" name="days_elapsed" value={daysUsed.toString()} />

            <div className="flex items-center gap-3 text-amber-400 bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 shadow-inner">
              <Unlock className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-bold">ロックが解除されました！今の率直な感想を書いてみましょう。</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-300">評価 (1〜5) <span className="text-red-400">*</span></label>
              <select name="rating" required className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white font-medium appearance-none">
                <option value="5">★★★★★ 5 - 最高！買ってよかった</option>
                <option value="4">★★★★☆ 4 - 良い。満足している</option>
                <option value="3">★★★☆☆ 3 - 普通。期待通り</option>
                <option value="2">★★☆☆☆ 2 - イマイチ。改善の余地あり</option>
                <option value="1">★☆☆☆☆ 1 - 最悪。後悔している</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-300">レビュー内容 <span className="text-red-400">*</span></label>
              <textarea 
                name="body" rows={6} required
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white font-medium resize-none placeholder:text-zinc-600"
                placeholder={`時間が経ったからこそ言える、リアルな感想を書いてください！\n（例：最初は微妙だったけど、〇〇の設定を変えたら最高になった、など）`}
              ></textarea>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-[0.98]"
            >
              レビューを投稿する
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
