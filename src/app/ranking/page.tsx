import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Home, Trophy } from 'lucide-react'

const GENRES = [
  { value: 'book', label: '📚 本・漫画' },
  { value: 'game', label: '🎮 ゲーム' },
  { value: 'gadget', label: '📱 ガジェット・家電' },
  { value: 'fashion', label: '👗 ファッション' },
  { value: 'food', label: '🍜 食品' },
  { value: 'spiritual', label: '🔮 占い・スピリチュアル' },  // 追加
  { value: 'beauty', label: '💄 コスメ・美容' },            // 追加
  { value: 'other', label: '🎁 その他' },
]

const RANK_MEDALS = ['🥇', '🥈', '🥉']

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

export default async function RankingPage() {
  const supabase = await createClient()

  // ジャンル別トップ3を取得
  const genreRankings = await Promise.all(
    GENRES.map(async (genre) => {
      const { data: items } = await supabase
        .from('items')
        .select('*')
        .eq('genre', genre.value)
        .gt('rating_count', 0)
        .order('rating_average', { ascending: false })
        .order('rating_count', { ascending: false })
        .limit(3)
      return { ...genre, items: items || [] }
    })
  )

  // 総合ランキング（レビュー数順）
  const { data: topItems } = await supabase
    .from('items')
    .select('*')
    .gt('rating_count', 0)
    .order('rating_count', { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <header className="flex items-center gap-4 mb-12">
        <Link href="/home" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/10">
          <Home className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-400" />
          ランキング
        </h1>
      </header>

      {/* 総合ランキング */}
      <section className="mb-16">
        <h2 className="text-xl font-bold mb-6 text-zinc-200 border-b border-white/10 pb-3">
          🏆 総合ランキング（レビュー数順）
        </h2>
        <div className="space-y-3">
          {topItems && topItems.length > 0 ? topItems.map((item, index) => (
            <Link key={item.id} href={`/items/${item.id}`} className="block">
              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:border-amber-500/30 transition-all hover:-translate-y-0.5">
                <div className="text-2xl w-10 text-center">
                  {RANK_MEDALS[index] || `${index + 1}`}
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">📦</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white">{item.name}</div>
                  <div className="text-xs text-zinc-500">{genreLabels[item.genre] || item.genre}</div>
                </div>
                <div className="text-right">
                  <div className="text-amber-400 font-bold">★ {item.rating_average.toFixed(1)}</div>
                  <div className="text-xs text-zinc-500">{item.rating_count}件のレビュー</div>
                </div>
              </div>
            </Link>
          )) : (
            <div className="text-center py-12 text-zinc-500 bg-white/5 rounded-2xl border border-white/5">
              まだランキングデータがありません
            </div>
          )}
        </div>
      </section>

      {/* ジャンル別ランキング */}
      <section>
        <h2 className="text-xl font-bold mb-6 text-zinc-200 border-b border-white/10 pb-3">
          📊 ジャンル別ランキング
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {genreRankings.map(genre => (
            <div key={genre.value} className="bg-black/40 border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4 text-amber-400">{genre.label}</h3>
              {genre.items.length > 0 ? (
                <div className="space-y-3">
                  {genre.items.map((item, index) => (
                    <Link key={item.id} href={`/items/${item.id}`} className="block">
                      <div className="flex items-center gap-3 hover:bg-white/5 rounded-xl p-2 transition-colors">
                        <span className="text-lg">{RANK_MEDALS[index] || index + 1}</span>
                        <div className="flex-1">
                          <div className="font-medium text-white text-sm">{item.name}</div>
                        </div>
                        <div className="text-amber-400 text-sm font-bold">
                          ★ {item.rating_average.toFixed(1)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-zinc-600 text-sm">
                  まだデータがありません
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}