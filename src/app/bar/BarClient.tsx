'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send } from 'lucide-react'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT = `あなたは「LoveReviバー」のマスターです。名前はありません。みんなから「マスター」と呼ばれています。

【キャラクター】
- 60代くらいの穏やかなおじさん
- いつもカウンターの向こうでグラスを磨いている
- にこやかで、話を聞くのが上手
- 相手の話を否定しない
- アドバイスはするけど、押しつけない
- 「答え」より「気づき」を大切にする
- 少しだけ詩的な言い回しをすることがある
- 口調は「〜ですね」「〜でしょうか」「〜かもしれません」など柔らかめ
- 返答は短めに。長くても4〜5文まで。

【占いについて】
- 占いといっても、話を聞いて、その人の言葉の中から光るものを見つけてあげるスタイル
- 断言しない。「〜かもしれませんね」「そう感じているなら、そうなのかもしれません」
- 相手が話したいことを話せる場を作る

【禁止事項】
- 「絶対に〜です」という断言
- ネガティブな予言
- 過度な励まし・テンションの高い返し
- タメ口`

export default function BarClient({ displayName }: { displayName: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [entered, setEntered] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const enter = async () => {
    setEntered(true)
    setLoading(true)
    const greeting = await callClaude([], `${displayName}さんが今夜バーに入ってきました。カウンター越しに、短く穏やかに声をかけてください。`)
    setMessages([{ role: 'assistant', content: greeting }])
    setLoading(false)
  }

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    const reply = await callClaude(newMessages, '')
    setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    setLoading(false)
  }

  async function callClaude(msgs: Message[], prompt: string) {
    try {
      const response = await fetch('/api/bar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: prompt
            ? [{ role: 'user', content: prompt }]
            : msgs.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await response.json()
      return data.text || '……'
    } catch {
      return 'すみません、少し聞き取れませんでした。'
    }
  }

  // 入店前の扉画面
  if (!entered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="text-6xl mb-8">🚪</div>
          <p className="text-zinc-500 text-sm mb-2">営業中</p>
          <h1 className="text-2xl font-bold text-zinc-200 mb-2">Bar Lumoi</h1>
          <p className="text-zinc-500 text-sm mb-12">扉を開けると、マスターがいます。<br />たった一瞬でも、自分を好きになれる場所。</p>
          <button
            onClick={enter}
            className="px-8 py-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold rounded-full hover:bg-amber-500/20 transition-all"
          >
            扉を開ける
          </button>
          <div className="mt-8">
            <Link href="/home" className="text-zinc-600 text-sm hover:text-zinc-400 transition-colors">
              ← タイムラインへ戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* ヘッダー */}
      <div className="border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <Link href="/home" className="text-zinc-600 hover:text-zinc-400 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-sm">
            🍶
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-300">マスター</div>
            <div className="text-xs text-zinc-600">Bar Lumoi · リュモワ</div>
          </div>
        </div>
      </div>

      {/* バーの雰囲気 */}
      <div className="text-center py-6 border-b border-white/5">
        <p className="text-xs text-zinc-700 tracking-widest">— 薄暗い照明、グラスの音、静かな夜 —</p>
      </div>

      {/* メッセージ */}
      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-2xl mx-auto w-full space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-1">
                🍶
              </div>
            )}
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-amber-500/10 text-amber-100 border border-amber-500/20'
                : 'bg-white/5 text-zinc-300 border border-white/5'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-sm flex-shrink-0">
              🍶
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-3">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 入力欄 */}
      <div className="border-t border-white/5 px-6 py-4 max-w-2xl mx-auto w-full">
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder="マスターに話しかける..."
            rows={2}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-white text-sm resize-none placeholder:text-zinc-600"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="p-3 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-2xl hover:bg-amber-500/30 transition-all disabled:opacity-30"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-zinc-700 text-center mt-3">Enterで送信 · Shift+Enterで改行</p>
      </div>
    </div>
  )
}