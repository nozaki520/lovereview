'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

const MASTER_IMG = 'https://iwmdbxoqfbyxpidhopdt.supabase.co/storage/v1/object/public/images/Adobe%20Express%20-%20file.png'
const BG_IMG = 'https://iwmdbxoqfbyxpidhopdt.supabase.co/storage/v1/object/public/images/Gemini_Generated_Image_acjskgacjskgacjs.png'

const SCRIPTS = {
  greeting: [
    "いらっしゃい。今夜もよく来てくれたね。さあ、座って。",
    "おや、来てくれたか。ちょうどグラスを磨いていたところだよ。",
    "いらっしゃいませ。今夜は静かないい夜だ。ゆっくりしていってくれ。",
  ],
  topic: [
    "今日は新しい商品が登録されたようだね。誰かの大切なものが、また一つ増えたんだろうな。",
    "今日も誰かが『まだ使ってる』って押したみたいだよ。小さな積み重ねって、いいものだね。",
    "時間をかけたレビューって、読むだけで温かい気持ちになるね。急いで書かれた言葉とは、やっぱり違う。",
  ],
  menu: [
    "そんな話をしていたら、今夜はこれがいいかな。じっくり熟成させたウイスキーのロック。時間が育てた味だよ。",
    "今夜はジンのソーダ割りはどうだろう。さっぱりしてるけど、香りに深みがある。気持ちが少し軽くなるかもしれない。",
    "ホットのアイリッシュコーヒーにしようか。温かくて、ほんの少し甘くて、夜に馴染む味だよ。",
  ],
  menuServe: [
    "どうぞ。ゆっくりしていってくれ。",
    "さあ、どうぞ。今夜は急がなくていいよ。",
    "遠慮なく、ゆっくりしていってくれ。",
  ],
  theme: [
    "好きなものを大切にするって、案外勇気がいることだと思う。流行とか、人の目とか、気になっちゃうからね。でもそれを続けている人は、なんか素敵だなって思うよ。",
    "長く使い続けるものって、その人の一部になってくるよね。傷がついても、古くなっても、それがまた味になる。そういうものを持てるって、幸せなことだと思うよ。",
    "誰かの『まだ使ってる』って言葉、すごく正直だと思う。レビューってさ、本当はそういう言葉が一番信頼できるんじゃないかな。",
  ],
  closing: [
    "おっと、そろそろこんな時間か。また来てくれたら嬉しいよ。ゆっくり帰りなよ。",
    "今夜は来てくれてありがとう。また気が向いたら、いつでもここにいるから。",
    "扉はいつでも開いてるよ。また話しに来てくれ。おやすみ。",
  ],
}

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

const FLOW = [
  () => pick(SCRIPTS.greeting),
  () => pick(SCRIPTS.topic),
  () => pick(SCRIPTS.menu),
  () => pick(SCRIPTS.menuServe),
  () => pick(SCRIPTS.theme),
  () => pick(SCRIPTS.closing),
]

export default function BarClient({ displayName }: { displayName: string }) {
  const [currentText, setCurrentText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [entered, setEntered] = useState(false)
  const [flowIndex, setFlowIndex] = useState(0)
  const [isEnd, setIsEnd] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const typeText = (text: string, onDone?: () => void) => {
    setIsTyping(true)
    setCurrentText('')
    let i = 0
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrentText(text.slice(0, i + 1))
      i++
      if (i >= text.length) {
        clearInterval(timerRef.current!)
        setIsTyping(false)
        onDone?.()
      }
    }, 30)
  }

  const enter = () => {
    setEntered(true)
    const text = pick(SCRIPTS.greeting)
    typeText(text)
    setFlowIndex(1)
  }

  const next = () => {
    if (isTyping) {
      // タイプ中にタップしたら即表示
      if (timerRef.current) clearInterval(timerRef.current)
      setIsTyping(false)
      return
    }
    if (flowIndex >= FLOW.length) {
      setIsEnd(true)
      return
    }
    const text = FLOW[flowIndex]()
    typeText(text)
    setFlowIndex(prev => prev + 1)
  }

  // 扉画面
  if (!entered) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BG_IMG})` }} />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative text-center z-10">
          <div className="text-7xl mb-8">🚪</div>
          <p className="text-amber-500/60 text-xs tracking-[0.3em] uppercase mb-3">Open</p>
          <h1 className="text-4xl font-bold text-white mb-1 tracking-wide">Bar Lumoi</h1>
          <p className="text-zinc-400 text-sm tracking-widest mb-1">リュモワ</p>
          <p className="text-zinc-500 text-xs mb-12">たった一瞬でも、自分を好きになれる場所。</p>
          <button
            onClick={enter}
            className="px-10 py-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold rounded-full hover:bg-amber-500/20 transition-all tracking-widest text-sm"
          >
            扉を開ける
          </button>
          <div className="mt-10">
            <Link href="/home" className="text-zinc-700 text-xs hover:text-zinc-500 transition-colors tracking-widest">
              ← タイムラインへ戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" onClick={!isEnd ? next : undefined}>

      {/* レイヤー1：バー背景 */}
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${BG_IMG})` }} />
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* レイヤー2：マスター */}
      <div className="absolute z-10 left-1/2 -translate-x-1/2" style={{ bottom: '-100%' }}>
        <img
          src={MASTER_IMG}
          alt="マスター"
          className="h-[200vh] object-contain object-top"
          style={{
            filter: 'drop-shadow(0 0 30px rgba(180,120,40,0.3))',
            maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
          }}
        />
      </div>

      {/* 戻るボタン */}
      <div className="absolute top-4 left-4 z-30" onClick={e => e.stopPropagation()}>
        <Link href="/home" className="text-zinc-500 hover:text-zinc-300 transition-colors text-xs tracking-widest">
          ← 出る
        </Link>
      </div>

      {/* Bar名 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 text-center">
        <p className="text-zinc-500 text-xs tracking-[0.3em]">Bar Lumoi · リュモワ</p>
      </div>

      <div className="flex-1" />

      {/* レイヤー4：セリフバー */}
      <div className="relative z-30 mx-4 mb-4">
        <div className="bg-black/85 border border-amber-500/20 rounded-2xl p-5 backdrop-blur-sm shadow-[0_0_40px_rgba(0,0,0,0.9)]">
          <div className="flex items-center justify-between mb-3">
            <div className="px-3 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded text-amber-400 text-xs font-bold tracking-widest">
              マスター
            </div>
            {!isEnd && (
              <p className="text-zinc-600 text-xs animate-pulse">
                {isTyping ? 'タップで即表示' : 'タップで次へ'}
              </p>
            )}
          </div>
          <div className="min-h-[64px] flex items-center">
            <p className="text-zinc-100 text-sm leading-relaxed">
              {currentText}
              {isTyping && <span className="animate-pulse text-amber-400">▌</span>}
            </p>
          </div>
        </div>

        {/* 終了後のボタン */}
        {isEnd && (
          <div className="mt-4 text-center" onClick={e => e.stopPropagation()}>
            <Link
              href="/home"
              className="inline-block px-8 py-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold rounded-full hover:bg-amber-500/20 transition-all text-sm tracking-widest"
            >
              バーを出る
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}