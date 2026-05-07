import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Hourglass, PackagePlus, PenLine, Heart, ChevronRight } from 'lucide-react'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/home')

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-['Outfit',sans-serif]">

      {/* ナビ */}
      <nav className="flex justify-between items-center px-6 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
            <Hourglass className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400">LoveRevi</span>
        </div>
        <Link href="/login" className="px-4 py-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors">
          ログイン
        </Link>
      </nav>

      {/* ヒーロー */}
      <section className="text-center px-6 pt-20 pb-24 max-w-3xl mx-auto">
        <div className="inline-block px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-bold mb-8">
          熟成レビューSNS
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
          「まだ使ってる」が、<br />最高のレビューである。
        </h1>
        <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
          購入直後の興奮じゃなく、<br className="md:hidden" />時間が経っても使い続けているリアルな声を届けよう。
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black rounded-full text-lg shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] hover:scale-105 transition-all active:scale-95"
        >
          無料ではじめる
          <ChevronRight className="w-5 h-5" />
        </Link>
        <p className="text-zinc-600 text-xs mt-4">登録無料・広告なし</p>
      </section>

      {/* 課題提起 */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <div className="bg-black/40 border border-white/10 rounded-3xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-black mb-8 text-center">
            こんなレビュー、信じられますか？
          </h2>
          <div className="space-y-4">
            {[
              { icon: '📢', text: '発売日当日に投稿された「神ゲー！」レビュー' },
              { icon: '💰', text: 'PR案件で書かれたインフルエンサーのレビュー' },
              { icon: '⚡', text: '開封直後の興奮で書かれた高評価レビュー' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-zinc-400 font-medium">{item.text}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-zinc-300 font-bold mt-8 text-lg">
            LoveReviは、<span className="text-amber-400">購入翌日以降</span>しかレビューを書けません。
          </p>
        </div>
      </section>

      {/* 使い方3ステップ */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-black text-center mb-12">
          使い方はシンプル
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <PackagePlus className="w-8 h-8 text-amber-400" />, step: '01', title: '商品を登録', body: '使っている商品と購入日を登録する。それだけ。' },
            { icon: <PenLine className="w-8 h-8 text-amber-400" />, step: '02', title: 'レビューを書く', body: '1日後から書けます。1週間後・1ヶ月後・1年後と、時間で深まるレビューを。' },
            { icon: <Heart className="w-8 h-8 text-amber-400" />, step: '03', title: 'まだ使ってる！', body: '今日も使ってたらボタンを押すだけ。愛用の証が積み重なる。' },
          ].map((item) => (
            <div key={item.step} className="bg-black/40 border border-white/10 rounded-2xl p-6 text-center hover:border-amber-500/30 transition-colors">
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                {item.icon}
              </div>
              <div className="text-amber-500 text-xs font-black mb-2">STEP {item.step}</div>
              <h3 className="font-black text-lg mb-2">{item.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ステージ紹介 */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-black text-center mb-4">
          時間が経つほど、深くなる
        </h2>
        <p className="text-center text-zinc-400 mb-10">レビューには「熟成ステージ」があります</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { emoji: '🌱', label: 'ファースト\nインプレッション', sub: '1日後〜' },
            { emoji: '🌱', label: '1週間後\nレビュー', sub: '7日後〜' },
            { emoji: '🌿', label: '1ヶ月後\nレビュー', sub: '30日後〜' },
            { emoji: '🌿', label: '3ヶ月後\nレビュー', sub: '90日後〜' },
            { emoji: '🌳', label: '半年後\nレビュー', sub: '180日後〜' },
            { emoji: '🌳', label: '1年後\nレビュー', sub: '365日後〜' },
            { emoji: '🏆', label: '長期\nレビュー', sub: '730日後〜' },
            { emoji: '🏁', label: 'リタイア\nレビュー', sub: 'いつでも' },
          ].map((stage, i) => (
            <div key={i} className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center hover:border-amber-500/30 transition-colors">
              <div className="text-3xl mb-2">{stage.emoji}</div>
              <div className="text-xs font-bold text-zinc-300 whitespace-pre-line leading-tight mb-1">{stage.label}</div>
              <div className="text-xs text-zinc-500">{stage.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black mb-4">
          あなたの愛用品を、<br />世界に届けよう。
        </h2>
        <p className="text-zinc-400 mb-10">時間が証明する、本当の価値。</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black rounded-full text-lg shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] hover:scale-105 transition-all active:scale-95"
        >
          無料ではじめる
          <ChevronRight className="w-5 h-5" />
        </Link>
        <p className="text-zinc-600 text-xs mt-4">登録無料・広告なし</p>
      </section>

      {/* フッター */}
      <footer className="border-t border-white/5 py-8 text-center text-zinc-600 text-xs">
        <p>© 2026 LoveRevi · <a href="https://twitter.com/LoveRevi_app" className="hover:text-amber-400 transition-colors">@LoveRevi_app</a></p>
      </footer>

    </div>
  )
}