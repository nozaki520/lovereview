'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function BarClient({ displayName }: { displayName: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [entered, setEntered] = useState(false)
  const [currentText, setCurrentText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const typeText = (text: string) => {
    setIsTyping(true)
    setCurrentText('')
    let i = 0
    const timer = setInterval(() => {
      setCurrentText(text.slice(0, i + 1))
      i++
      if (i >= text.length) {
        clearInterval(timer)
        setIsTyping(false)
      }
    }, 30)
  }

  const enter = async () => {
    setEntered(true)
    setLoading(true)
    const greeting = await callClaude([], `${displayName}さんが今夜バーに入ってきました。カウンター越しに、短く穏やかに声をかけてください。`)
    setMessages([{ role: 'assistant', content: greeting }])
    typeText(greeting)
    setLoading(false)
  }

  const send = async () => {
    if (!input.trim() || loading || isTyping) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setCurrentText('')
    const reply = await callClaude(newMessages, '')
    setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    typeText(reply)
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

  // 扉画面
  if (!entered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
        {/* 背景グラデーション */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-zinc-950 to-black" />
        
        <div className="relative text-center z-10">
          <div className="text-7xl mb-8 drop-shadow-lg">🚪</div>
          <p className="text-amber-500/60 text-xs tracking-[0.3em] uppercase mb-3">Open</p>
          <h1 className="text-4xl font-bold text-white mb-1 tracking-wide">Bar Lumoi</h1>
          <p className="text-zinc-500 text-sm tracking-widest mb-1">リュモワ</p>
          <p className="text-zinc-600 text-xs mb-12">たった一瞬でも、自分を好きになれる場所。</p>
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

  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] relative overflow-hidden">

      {/* バー背景 */}
      <div className="absolute inset-0 z-0">
        {/* 床 */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-amber-950/40 to-transparent" />
        {/* カウンター */}
        <div className="absolute bottom-[28%] left-0 right-0 h-8 bg-gradient-to-r from-amber-900/60 via-amber-800/80 to-amber-900/60 shadow-[0_-4px_20px_rgba(180,120,40,0.3)]" />
        {/* 棚・ボトルのシルエット */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-end gap-2 opacity-20">
          {[40,55,48,62,45,58,42,50,65,44].map((h, i) => (
            <div key={i} className="bg-amber-200 rounded-sm" style={{width: '12px', height: `${h}px`}} />
          ))}
        </div>
        {/* 照明 */}
        <div className="absolute top-0 left-1/4 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />
        {/* 全体暗め */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* 戻るボタン */}
      <div className="absolute top-4 left-4 z-20">
        <Link href="/home" className="text-zinc-700 hover:text-zinc-500 transition-colors text-xs tracking-widest">
          ← 出る
        </Link>
      </div>

      {/* Bar名 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-center">
        <p className="text-zinc-700 text-xs tracking-[0.3em]">Bar Lumoi · リュモワ</p>
      </div>

      {/* マスターエリア */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-end pb-[42%]">
        {/* マスターのプレースホルダー（画像差し替え予定） */}
        <div className="relative">
          <div className="flex flex-col items-center justify-end">
            {/* シルエット */}
            <img
              src="https://iwmdbxoqfbyxpidhopdt.supabase.co/storage/v1/object/public/images/Gemini_Generated_Image_9emc8i9emc8i9emc.png"
              alt="マスター"
              className="h-64 object-contain drop-shadow-2xl"
            />
          </div>
          {/* 名前プレート */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/60 border border-amber-500/20 rounded px-3 py-1">
            <p className="text-amber-400 text-xs font-bold tracking-widest whitespace-nowrap">マスター</p>
          </div>
        </div>
      </div>

      {/* セリフ吹き出し */}
      <div className="relative z-10 mx-4 mb-4">
        <div className="bg-black/80 border border-amber-500/20 rounded-2xl p-4 backdrop-blur-sm shadow-[0_0_30px_rgba(0,0,0,0.8)]">
          {/* 名前 */}
          <div className="flex items-center gap-2 mb-2">
            <div className="px-3 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded text-amber-400 text-xs font-bold tracking-widest">
              マスター
            </div>
          </div>

          {/* セリフ */}
          <div className="min-h-[60px] flex items-center">
            {loading && !currentText ? (
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-amber-500/50 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                <span className="w-1.5 h-1.5 bg-amber-500/50 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                <span className="w-1.5 h-1.5 bg-amber-500/50 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
              </div>
            ) : (
              <p className="text-zinc-200 text-sm leading-relaxed">
                {currentText}
                {isTyping && <span className="animate-pulse">▌</span>}
              </p>
            )}
          </div>
        </div>

        {/* 直前のユーザーの発言 */}
        {lastUserMessage && (
          <div className="mt-2 text-right">
            <span className="text-zinc-600 text-xs">「{lastUserMessage.content}」</span>
          </div>
        )}
      </div>

      {/* 入力欄 */}
      <div className="relative z-10 border-t border-white/5 px-4 py-3 bg-black/40 backdrop-blur-sm">
        <div className="flex gap-2 items-end max-w-2xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder={isTyping ? "マスターが話しています..." : "マスターに話しかける..."}
            disabled={isTyping}
            rows={2}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-white text-sm resize-none placeholder:text-zinc-600 disabled:opacity-40"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim() || isTyping}
            className="p-3 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-2xl hover:bg-amber-500/30 transition-all disabled:opacity-30 text-sm font-bold"
          >
            送る
          </button>
        </div>
        <p className="text-xs text-zinc-700 text-center mt-2">Enterで送信 · Shift+Enterで改行</p>
      </div>
    </div>
  )
}