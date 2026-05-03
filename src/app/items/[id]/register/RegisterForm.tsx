'use client'

import { useState, useEffect } from 'react'
import { Calendar, Info } from 'lucide-react'
import { registerPurchase } from './actions'

export default function RegisterForm({ itemId, error }: { itemId: string, error?: string }) {
  const [accuracy, setAccuracy] = useState('exact')
  const [todayDate, setTodayDate] = useState('')
  const [todayMonth, setTodayMonth] = useState('')

  useEffect(() => {
    // To prevent hydration mismatch, set default dates on client
    const d = new Date()
    // Local date string in YYYY-MM-DD
    const pad = (n: number) => n.toString().padStart(2, '0')
    const yyyy = d.getFullYear()
    const mm = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    
    setTodayDate(`${yyyy}-${mm}-${dd}`)
    setTodayMonth(`${yyyy}-${mm}`)
  }, [])

  return (
    <form action={registerPurchase} className="space-y-8">
      <input type="hidden" name="item_id" value={itemId} />
      
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl flex items-center gap-2">
          <Info className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="w-full">
            <h3 className="font-bold text-amber-400 mb-1">いつから使っていますか？</h3>
            <p className="text-sm text-amber-400/80 mb-4">
              正確な日付がわからない場合は、だいたいの時期を選択できます。<br/>
              <span className="font-bold text-white/80">※購入から1日以上経過していないとレビューは投稿できません。</span>
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-300">精度の選択 <span className="text-red-400">*</span></label>
                <select 
                  name="accuracy" 
                  required
                  value={accuracy}
                  onChange={(e) => setAccuracy(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white appearance-none font-medium"
                >
                  <option value="exact">正確な日付がわかる</option>
                  <option value="month">年月だけわかる</option>
                  <option value="over1y">1年以上前</option>
                  <option value="over3y">3年以上前</option>
                  <option value="over5y">5年以上前</option>
                </select>
              </div>

              {(accuracy === 'exact' || accuracy === 'month') && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-300">
                    {accuracy === 'exact' ? '日付' : '年月'} <span className="text-red-400">*</span>
                  </label>
                  {/* color-scheme: dark ensures calendar icon is white on dark mode */}
                  <input 
                    type={accuracy === 'exact' ? 'date' : 'month'} 
                    name="purchased_date" 
                    required
                    style={{ colorScheme: 'dark' }}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white font-medium"
                    defaultValue={accuracy === 'exact' ? todayDate : todayMonth}
                  />
                  <p className="text-xs text-zinc-500">
                    入力欄の右側のカレンダーアイコン（📅）をタップして選択できます。
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <button 
        type="submit"
        className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-[0.98]"
      >
        購入・体験を記録して次へ
      </button>
    </form>
  )
}
