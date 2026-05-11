'use client'

import { useState } from 'react'
import { login, signup } from './actions'

export default function AuthForm({ message, tab }: { message?: string, tab?: string }) {
  const [isLogin, setIsLogin] = useState(tab !== 'signup')
  const [userId, setUserId] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateSignup = () => {
    const newErrors: Record<string, string> = {}
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(userId)) {
      newErrors.userId = '英数字・アンダースコアのみ、3〜20文字で入力してください'
    }
    if (displayName.trim().length < 1 || displayName.trim().length > 30) {
      newErrors.displayName = '1〜30文字で入力してください'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  return (
    <div>
      <div className="flex bg-black/40 p-1 rounded-xl mb-6 border border-white/10">
        <button
          type="button"
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${isLogin ? 'bg-amber-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
        >
          ログイン
        </button>
        <button
          type="button"
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${!isLogin ? 'bg-amber-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
        >
          新規登録
        </button>
      </div>

      <form className="space-y-5">
        {message && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl text-center">
            {message}
          </div>
        )}

        {!isLogin && (
          <>
            {/* ユーザーID */}
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
              <label htmlFor="username" className="text-sm font-medium text-zinc-300 ml-1">
                ユーザーID <span className="text-red-400">*</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={userId}
                onChange={e => setUserId(e.target.value)}
                className={`w-full px-4 py-3 bg-black/40 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white placeholder:text-zinc-600 font-medium ${errors.userId ? 'border-red-500/50' : 'border-white/10'}`}
                placeholder="例：love_revi_123（英数字・_のみ）"
              />
              {errors.userId && <p className="text-red-400 text-xs ml-1">{errors.userId}</p>}
            </div>

            {/* 表示名 */}
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
              <label htmlFor="display_name" className="text-sm font-medium text-zinc-300 ml-1">
                表示名 <span className="text-red-400">*</span>
              </label>
              <input
                id="display_name"
                name="display_name"
                type="text"
                required
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className={`w-full px-4 py-3 bg-black/40 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white placeholder:text-zinc-600 font-medium ${errors.displayName ? 'border-red-500/50' : 'border-white/10'}`}
                placeholder="アルファベット・数字・日本語OK・30文字以内"
              />
              {errors.displayName && <p className="text-red-400 text-xs ml-1">{errors.displayName}</p>}
            </div>
          </>
        )}

        {/* メールアドレス */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-zinc-300 ml-1">メールアドレス <span className="text-red-400">*</span></label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white placeholder:text-zinc-600 font-medium"
            placeholder="you@example.com"
          />
        </div>

        {/* パスワード */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-zinc-300 ml-1">パスワード <span className="text-red-400">*</span></label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white placeholder:text-zinc-600 font-medium"
            placeholder="6文字以上"
          />
        </div>

        <div className="pt-4">
          <button
            formAction={isLogin ? login : signup}
            onClick={!isLogin ? (e) => {
              if (!validateSignup()) e.preventDefault()
            } : undefined}
            className="w-full py-4 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] active:scale-[0.98]"
          >
            {isLogin ? 'ログイン' : 'この内容で登録'}
          </button>
        </div>
      </form>
    </div>
  )
}