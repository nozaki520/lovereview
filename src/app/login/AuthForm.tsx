'use client'

import { useState } from 'react'
import { login, signup } from './actions'

export default function AuthForm({ message }: { message?: string }) {
  const [isLogin, setIsLogin] = useState(true)

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
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
            <label htmlFor="username" className="text-sm font-medium text-zinc-300 ml-1">ユーザー名 <span className="text-red-400">*</span></label>
            <input 
              id="username" 
              name="username" 
              type="text" 
              required={!isLogin}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white placeholder:text-zinc-600 font-medium"
              placeholder="表示名（後から変更可能）"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-zinc-300 ml-1">メールアドレス</label>
          <input 
            id="email" 
            name="email" 
            type="email" 
            required 
            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white placeholder:text-zinc-600 font-medium"
            placeholder="you@example.com"
          />
        </div>
        
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-zinc-300 ml-1">パスワード</label>
          <input 
            id="password" 
            name="password" 
            type="password" 
            required 
            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white placeholder:text-zinc-600 font-medium"
            placeholder="••••••••"
          />
        </div>

        <div className="pt-4">
          <button 
            formAction={isLogin ? login : signup}
            className="w-full py-4 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] active:scale-[0.98]"
          >
            {isLogin ? 'ログイン' : 'この内容で登録'}
          </button>
        </div>
      </form>
    </div>
  )
}
