'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

const MASTER_IMG = 'https://iwmdbxoqfbyxpidhopdt.supabase.co/storage/v1/object/public/images/Gemini_Generated_Image_9emc8i9emc8i9emc-removebg-preview.png'
const BG_IMG = 'https://iwmdbxoqfbyxpidhopdt.supabase.co/storage/v1/object/public/images/Gemini_Generated_Image_acjskgacjskgacjs.png'

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
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${BG_IMG})` }}
        />
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

  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">

      {/* レイヤー1：バー背景 */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${BG_IMG})` }}
      />
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* レイヤー2：マスター（上半身のみ・カウンターの後ろに立っている） */}
      <div className="absolute z-10 left-1/2 -translate-x-1/2"
        style={{ bottom: '5%' }}
      >
        <img
          src={MASTER_IMG}
          alt="マスター"
          className="h-[150vh] object-contain object-top"
          style={{
            filter: 'drop-shadow(0 0 30px rgba(180,120,40,0.3))',
            maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
          }}
        />
      </div>

      {/* 戻るボタン */}
      <div className="absolute top-4 left-4 z-30">
        <Link href="/home" className="text-zinc-500 hover:text-zinc-300 transition-colors text-xs tracking-widest">
          ← 出る
        </Link>
      </div>

      {/* Bar名 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 text-center">
        <p className="text-zinc-500 text-xs tracking-[0.3em]">Bar Lumoi · リュモワ</p>
      </div>

      {/* 下半分のスペーサー */}
      <div className="flex-1" />

      {/* レイヤー4：セリフバー */}
      <div className="relative z-30 mx-4 mb-4">
        <div className="bg-black/85 border border-amber-500/20 rounded-2xl p-5 backdrop-blur-sm shadow-[0_0_40px_rgba(0,0,0,0.9)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="px-3 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded text-amber-400 text-xs font-bold tracking-widest">
              マスター
            </div>
          </div>
          <div className="min-h-[64px] flex items-center">
            {loading && !currentText ? (
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-amber-500/50 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                <span className="w-2 h-2 bg-amber-500/50 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                <span className="w-2 h-2 bg-amber-500/50 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
              </div>
            ) : (
              <p className="text-zinc-100 text-sm leading-relaxed">
                {currentText}
                {isTyping && <span className="animate-pulse text-amber-400">▌</span>}
              </p>
            )}
          </div>
        </div>

        {lastUserMessage && (
          <div className="mt-2 text-right">
            <span className="text-zinc-600 text-xs">「{lastUserMessage.content}」</span>
          </div>
        )}
      </div>

      {/* レイヤー5：入力欄 */}
      <div className="relative z-30 border-t border-white/5 px-4 py-3 bg-black/60 backdrop-blur-sm">
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
            className="p-3 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-2xl hover:bg-amber-500/30 transition-all disabled:opacity-30 text-sm font-bold px-5"
          >
            送る
          </button>
        </div>
        <p className="text-xs text-zinc-700 text-center mt-2">Enterで送信 · Shift+Enterで改行</p>
      </div>
    </div>
  )
}