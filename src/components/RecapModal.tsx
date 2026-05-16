'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, ChevronRight } from 'lucide-react'

type Props = {
  displayName: string
  topReview: { itemName: string; stage: string } | null
  topItem: { name: string } | null
  longestItem: { name: string; days: number } | null
}

const stageLabels: Record<string, string> = {
  'day1': 'ファーストインプレッション',
  'week1': '1週間後レビュー',
  'month1': '1ヶ月後レビュー',
  'month3': '3ヶ月後レビュー',
  'month6': '半年後レビュー',
  'year1': '1年後レビュー',
  'beyond': '長期レビュー',
  'retired': 'リタイアレビュー',
}

export default function RecapModal({ displayName, topReview, topItem, longestItem }: Props) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const router = useRouter()
  const year = new Date().getFullYear()
  const storageKey = `recap_shown_${year}`

  useEffect(() => {
    const shown = localStorage.getItem(storageKey)
    const isNewUser = new Date().getTime() - new Date().setHours(0,0,0,0) < 1000 * 60 * 5
    if (!shown && !isNewUser) setVisible(true)
  }, [])

  const close = () => {
    localStorage.setItem(storageKey, 'true')
    setVisible(false)
  }

  const goRecap = () => {
    localStorage.setItem(storageKey, 'true')
    setVisible(false)
    router.push('/recap')
  }

  if (!visible) return null

  const STEPS = [
    {
      emoji: '✍️',
      title: `今年書いたレビュー`,
      content: topReview ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left">
          <div className="text-xs text-zinc-500 mb-1">{stageLabels[topReview.stage] || topReview.stage}</div>
          <div className="font-bold text-white">{topReview.itemName}</div>
        </div>
      ) : (
        <p className="text-zinc-400">今年はまだレビューがありません</p>
      ),
    },
    {
      emoji: '📦',
      title: '今年登録した商品',
      content: topItem ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left">
          <div className="font-bold text-white">{topItem.name}</div>
        </div>
      ) : (
        <p className="text-zinc-400">今年はまだ商品を登録していません</p>
      ),
    },
    {
      emoji: '❤️',
      title: '最長愛用品',
      content: longestItem ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left">
          <div className="font-bold text-white mb-1">{longestItem.name}</div>
          <div className="text-amber-400 font-black text-2xl">{longestItem.days}<span className="text-sm text-zinc-400 ml-1">日愛用</span></div>
        </div>
      ) : (
        <p className="text-zinc-400">愛用品がまだありません</p>
      ),
    },
    {
      emoji: '🎊',
      title: `${displayName}さん、今年もありがとう！`,
      content: (
        <p className="text-zinc-400 leading-relaxed">
          今年の愛用記録をまとめました。<br />
          詳しい内容はまとめページで確認できます！
        </p>
      ),
    },
  ]

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#18181b] border border-white/10 rounded-3xl p-8 shadow-2xl">

        {/* 閉じるボタン */}
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
          <div className="text-5xl">{current.emoji}</div>
          <h2 className="text-2xl font-bold text-white">{current.title}</h2>
          <div className="w-full">{current.content}</div>
        </div>

        {/* ボタン */}
        <div className="flex gap-3">
          <button
            onClick={close}
            className="flex-1 py-3 bg-white/5 border border-white/10 text-zinc-400 font-bold rounded-xl hover:bg-white/10 transition-colors"
          >
            あとで見る
          </button>
          {isLast ? (
            <button
              onClick={goRecap}
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-xl hover:opacity-90 transition-all"
            >
              まとめを見る 🎊
            </button>
          ) : (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              次へ
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}