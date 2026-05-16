import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Search, Plus, Home } from 'lucide-react'
import FadeInCard from '@/components/FadeInCard'

const GENRES = [
  { value: '', label: 'すべて' },
  { value: 'book', label: '📚 本・漫画' },
  { value: 'game', label: '🎮 ゲーム' },
  { value: 'gadget', label: '📱 ガジェット・家電' },
  { value: 'fashion', label: '👗 ファッション' },
  { value: 'food', label: '🍜 食品' },
  { value: 'spiritual', label: '🔮 占い・スピリチュアル' },  // 追加
  { value: 'beauty', label: '💄 コスメ・美容' },            // 追加
  { value: 'other', label: '🎁 その他' },
]

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string, genre?: string, sort?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const q = resolvedSearchParams.q || ''
  const genre = resolvedSearchParams.genre || ''
  const sort = resolvedSearchParams.sort || 'newest'

  const supabase = await createClient()

  let query = supabase.from('items').select('*')

  if (q) query = query.ilike('name', `%${q}%`)
  if (genre) query = query.eq('genre', genre)

  if (sort === 'rating') {
    query = query.order('rating_average', { ascending: false })
  } else if (sort === 'reviews') {
    query = query.order('rating_count', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  query = query.limit(30)

  const { data: items } = await query

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
        <div className="flex items-center gap-4">
          <Link href="/home" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/10">
            <Home className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400">
            探す・登録する
          </h1>
        </div>
        <Link
          href="/items/new"
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full hover:bg-amber-500/20 transition-colors font-bold"
        >
          <Plus className="w-5 h-5" />
          新規商品登録
        </Link>
      </header>

      {/* 検索 */}
      <form className="mb-6">
        <div className="relative max-w-2xl mb-4">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="商品名で検索..."
            className="w-full pl-14 pr-4 py-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white font-medium shadow-lg"
          />
          <input type="hidden" name="genre" value={genre} />
          <input type="hidden" name="sort" value={sort} />
        </div>

        {/* ジャンルフィルター */}
        <div className="flex flex-wrap gap-2 mb-4">
          {GENRES.map(g => (
            <Link
              key={g.value}
              href={`/explore?q=${q}&genre=${g.value}&sort=${sort}`}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${genre === g.value
                  ? 'bg-amber-500 text-black border-amber-500'
                  : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
                }`}
            >
              {g.label}
            </Link>
          ))}
        </div>

        {/* ソート */}
        <div className="flex gap-2">
          {[
            { value: 'newest', label: '🆕 新着順' },
            { value: 'rating', label: '⭐ 評価順' },
            { value: 'reviews', label: '💬 レビュー数順' },
          ].map(s => (
            <Link
              key={s.value}
              href={`/explore?q=${q}&genre=${genre}&sort=${s.value}`}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${sort === s.value
                  ? 'bg-white/20 text-white border-white/30'
                  : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10'
                }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </form>

      {/* 商品一覧 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items?.map(item => (
          <FadeInCard key={item.id} delay={index * 60}>
            <Link key={item.id} href={`/items/${item.id}`} className="block group">
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full hover:border-amber-500/50 transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)]">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center overflow-hidden border border-white/10">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>
                  <span className="px-3 py-1 bg-white/5 text-zinc-300 text-xs font-medium rounded-full border border-white/10">
                    {GENRES.find(g => g.value === item.genre)?.label || item.genre}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors line-clamp-2 mb-2">
                  {item.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
                  <span className="text-yellow-500">★</span>
                  <span>{item.rating_average.toFixed(1)}</span>
                  <span className="text-zinc-500">({item.rating_count}件のレビュー)</span>
                </div>
              </div>
            </Link>
          </FadeInCard>
        ))}

        {items?.length === 0 && (
          <div className="col-span-full py-20 text-center text-zinc-400 font-medium">
            <div className="text-4xl mb-4">🔍</div>
            {q ? `「${q}」に一致する商品は見つかりませんでした。` : '商品がまだありません。'}
            <br />ぜひ新しく登録してください！
          </div>
        )}
      </div>
    </div>
  )
}