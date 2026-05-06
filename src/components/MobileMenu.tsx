'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Search, Trophy, User, LogOut } from 'lucide-react'

interface MobileMenuProps {
  username?: string
}

export default function MobileMenu({ username }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
      >
        {open ? <X className="w-4 h-4 text-zinc-300" /> : <Menu className="w-4 h-4 text-zinc-300" />}
      </button>

      {open && (
        <>
          {/* オーバーレイ */}
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setOpen(false)}
          />

          {/* メニュー */}
          <div className="fixed top-0 right-0 h-full w-72 bg-zinc-900 border-l border-white/10 z-50 p-6 flex flex-col gap-2">
            <div className="flex justify-end mb-6">
              <button onClick={() => setOpen(false)}>
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <Link
              href="/explore"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-zinc-300 hover:text-amber-400 transition-colors font-medium"
            >
              <Search className="w-5 h-5" />
              探す・登録する
            </Link>

            <Link
              href="/ranking"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-zinc-300 hover:text-amber-400 transition-colors font-medium"
            >
              <Trophy className="w-5 h-5" />
              ランキング
            </Link>

            {username && (
              <Link
                href={`/profile/${username}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-zinc-300 hover:text-amber-400 transition-colors font-medium"
              >
                <User className="w-5 h-5" />
                マイプロフィール
              </Link>
            )}

            <div className="mt-auto">
              <form action="/auth/signout" method="post">
                <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-red-400 transition-colors font-medium w-full">
                  <LogOut className="w-5 h-5" />
                  ログアウト
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}