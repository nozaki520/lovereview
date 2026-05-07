'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PackagePlus, PenLine, Heart, Hourglass, X, ChevronRight } from 'lucide-react'

const STEPS = [
  {
    icon: <Hourglass className="w-10 h-10 text-amber-400" />,
    title: 'LoveReviへようこそ！🎉',
    body: '「まだ使ってる」が、最高のレビューです。\n購入・体験から時間が経ったものだけレビューできるSNSです。',
  },
  {
    icon: <PackagePlus className="w-10 h-10 text-amber-400" />,
    title: '📦 商品を登録する',
    body: '使っているものを登録して、購入日を記録します。\n「探す・登録する」から検索して見つからなければ新規登録できます。',
  },
  {
    icon: <PenLine className="w-10 h-10 text-amber-400" />,
    title: '✍️ レビューを書く',
    body: '購入日の翌日から書けます。\n1週間後・1ヶ月後・1年後…時間が経つほど深いレビューになります。',
  },
  {
    icon: <Heart className="w-10 h-10 text-amber-400" />,
    title: '❤️ まだ使ってる！ボタン',
    body: '今日も使ってたら押すだけ。\n1日1回押せて、愛用の証になります。',
  },
]

export default function OnboardingModal() {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(true)
  const router = useRouter()

  const close = () => {
    setVisible(false)
    router.replace('/home')
  }

  if (!visible) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#18181b] border border-white/10 rounded-3xl p-8 shadow-2xl">
        
        {/* スキップ */}
        <button
          onClick={close}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ステップインジケーター */}
        <div className="flex gap-2 justify-center mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-amber-400' : 'w-3 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* コンテンツ */}
        <div className="flex flex-col items-center text-center gap-6 mb-10">
          <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
            {current.icon}
          </div>
          <h2 className="text-2xl font-bold text-white">{current.title}</h2>
          <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap">{current.body}</p>
        </div>

        {/* ボタン */}
        <div className="flex gap-3">
          <button
            onClick={close}
            className="flex-1 py-3 bg-white/5 border border-white/10 text-zinc-400 font-bold rounded-xl hover:bg-white/10 transition-colors"
          >
            スキップ
          </button>
          <button
            onClick={() => isLast ? close() : setStep(s => s + 1)}
            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            {isLast ? 'はじめる！🔥' : '次へ'}
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}