'use client'

import { createItem } from '../actions'
import { searchItemsForSuggest } from './actions'
import { PackagePlus, Search, ArrowRight, Upload } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewItemPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (name.trim().length >= 2) {
        const results = await searchItemsForSuggest(name.trim())
        setSuggestions(results)
      } else {
        setSuggestions([])
      }
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [name])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const exactMatch = suggestions.find(s => s.name.toLowerCase() === name.trim().toLowerCase())
    if (exactMatch) {
      e.preventDefault()
      if (confirm('この商品は既に登録されています。\n既存の商品ページへ移動してレビューを書きますか？')) {
        router.push(`/items/${exactMatch.id}`)
      }
    }
  }

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <Link href="/explore" className="text-amber-400 hover:underline mb-8 inline-block">
        ← 探す画面へ戻る
      </Link>
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
            <PackagePlus className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">新しく商品を登録</h1>
            <p className="text-zinc-400 text-sm font-medium">データベースにない商品を登録します</p>
          </div>
        </div>

        <form action={createItem} onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 relative">
            <label htmlFor="name" className="text-sm font-bold text-zinc-300">商品・サービス名 <span className="text-red-400">*</span></label>
            <input 
              id="name" name="name" type="text" required 
              value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white font-medium placeholder:text-zinc-600"
              placeholder="例：AirPods Pro (第2世代)"
            />
            
            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                <div className="px-4 py-2 bg-zinc-800/50 text-xs font-bold text-zinc-400 border-b border-white/5 flex items-center gap-2">
                  <Search className="w-3 h-3" />
                  もしかして、探しているのはこれですか？
                </div>
                {suggestions.map(item => (
                  <Link key={item.id} href={`/items/${item.id}`} className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group">
                    <div className="w-10 h-10 bg-black/50 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="flex items-center justify-center w-full h-full text-xs">📦</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate">{item.name}</div>
                      <div className="text-xs text-zinc-500">{item.genre}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="genre" className="text-sm font-bold text-zinc-300">ジャンル <span className="text-red-400">*</span></label>
            <select 
              id="genre" name="genre" required
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white appearance-none font-medium"
            >
              <option value="gadget">📱 ガジェット・家電</option>
              <option value="book">📚 本・漫画</option>
              <option value="game">🎮 ゲーム</option>
              <option value="fashion">👗 ファッション</option>
              <option value="food">🍜 食品</option>
              <option value="spiritual">🔮 占い・スピリチュアル</option>
              <option value="beauty">💄 コスメ・美容</option>
              <option value="other">🎁 その他</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-300">商品画像（任意）</label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white/5 border border-white/10 border-dashed rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-400">端末から画像を選択</span>
                  <input type="file" name="image_file" accept="image/*" className="hidden" />
                </label>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-1">※JPG, PNG, GIFなど。ファイルを選択しない場合は画像なしで登録されます。</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-bold text-zinc-300">説明・備考（任意）</label>
            <textarea 
              id="description" name="description" rows={4}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white resize-none font-medium placeholder:text-zinc-600"
              placeholder="商品の特徴や、どのモデルかなどの補足情報を自由に入力してください"
            ></textarea>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-[0.98]"
          >
            この商品を登録する
          </button>
        </form>
      </div>
    </div>
  )
}
