import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Search, Plus, Home } from 'lucide-react'

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const q = resolvedSearchParams.q || ''
  
  const supabase = await createClient()
  
  let query = supabase.from('items').select('*').order('created_at', { ascending: false }).limit(20)
  
  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

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
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full hover:bg-amber-500/20 transition-colors font-bold shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        >
          <Plus className="w-5 h-5" />
          新規商品登録
        </Link>
      </header>

      <div className="mb-8">
        <form className="relative max-w-2xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input 
            type="text" 
            name="q"
            defaultValue={q}
            placeholder="商品名で検索..." 
            className="w-full pl-14 pr-4 py-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white font-medium shadow-lg"
          />
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items?.map(item => (
          <Link key={item.id} href={`/items/${item.id}`} className="block group">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full hover:border-amber-500/50 transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)]">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center overflow-hidden border border-white/10">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">📦</span>
                  )}
                </div>
                <span className="px-3 py-1 bg-white/5 text-zinc-300 text-xs font-medium rounded-full border border-white/10">
                  {item.genre}
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
        ))}

        {items?.length === 0 && (
          <div className="col-span-full py-20 text-center text-zinc-400 font-medium">
            <div className="text-4xl mb-4">🔍</div>
            「{q}」に一致する商品は見つかりませんでした。<br/>
            ぜひ新しく登録してください！
          </div>
        )}
      </div>
    </div>
  )
}
