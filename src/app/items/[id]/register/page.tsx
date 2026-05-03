import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import RegisterForm from './RegisterForm'

export default async function RegisterPurchasePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ error?: string }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()
  
  const { data: item } = await supabase.from('items').select('*').eq('id', resolvedParams.id).single()

  if (!item) return <div>商品が見つかりません</div>

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <Link href={`/items/${item.id}`} className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors mb-8 inline-flex font-medium">
        <ArrowLeft className="w-4 h-4" />
        商品詳細へ戻る
      </Link>
      
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
          <div className="w-16 h-16 bg-white/5 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/10">
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">📦</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{item.name}</h1>
            <p className="text-zinc-400 text-sm">この商品の購入・体験日を記録します</p>
          </div>
        </div>

        <RegisterForm itemId={item.id} error={resolvedSearchParams.error} />
      </div>
    </div>
  )
}
