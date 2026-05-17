import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'
import ShareButton from '@/components/ShareButton'
import LikeButton from '@/components/LikeButton'
import type { Metadata } from 'next'
import AnimatedStars from '@/components/AnimatedStars'
import ReviewComments from '@/components/ReviewComments'

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

const genreLabels: Record<string, string> = {
  'book': '📚 本・漫画',
  'game': '🎮 ゲーム',
  'gadget': '📱 ガジェット・家電',
  'fashion': '👗 ファッション',
  'food': '🍜 食品',
  'spiritual': '🔮 占い・スピリチュアル',
  'beauty': '💄 コスメ・美容',
  'other': '🎁 その他',
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: review } = await supabase
    .from('reviews')
    .select('*, users(display_name), items(name)')
    .eq('id', id)
    .single()

  if (!review) return { title: 'LoveRevi' }

  const stageName = stageLabels[review.stage] || review.stage
  const title = `${review.items?.name}の${stageName} | LoveRevi`
  const description = review.body.slice(0, 100)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://lovereview.vercel.app/reviews/${id}`,
      siteName: 'LoveRevi',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: review } = await supabase
    .from('reviews')
    .select('*, users(display_name, avatar_url, username), items(id, name, genre, image_url), review_comments(id, body, created_at, user_id, users(display_name, avatar_url, username))')
    .eq('id', id)
    .single()

  if (!review) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  // いいね情報
  const { data: likesData } = await supabase
    .from('likes')
    .select('user_id')
    .eq('review_id', id)

  const likeCount = likesData?.length || 0
  const liked = likesData?.some(l => l.user_id === user?.id) || false

  const stageName = stageLabels[review.stage] || review.stage
  const item = review.items as any
  const author = review.users as any

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/items/${item?.id}`} className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />
          商品ページへ戻る
        </Link>
        <Link href="/home" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-300 transition-colors font-medium text-sm">
          🔥 タイムラインへ
        </Link>
      </div>

      {/* 商品情報 */}
      <Link href={`/items/${item?.id}`} className="block mb-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 hover:bg-white/10 transition-colors">
          <div className="w-16 h-16 bg-black/50 rounded-xl overflow-hidden flex items-center justify-center border border-white/10 flex-shrink-0">
            {item?.image_url ? (
              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">📦</span>
            )}
          </div>
          <div>
            <div className="text-xs text-zinc-500 mb-1">{genreLabels[item?.genre] || item?.genre}</div>
            <div className="font-bold text-white text-lg">{item?.name}</div>
          </div>
        </div>
      </Link>

      {/* レビュー本体 */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-lg">
        {/* ヘッダー */}
        <div className="flex justify-between items-start mb-6">
          <Link href={`/profile/${author?.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-white/10 rounded-full overflow-hidden flex items-center justify-center">
              {author?.avatar_url ? (
                <img src={author.avatar_url} alt={author.display_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl">👤</span>
              )}
            </div>
            <div>
              <div className="font-bold text-zinc-200">{author?.display_name || '名無し'}</div>
              <div className="text-xs text-zinc-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(review.published_at).toLocaleDateString('ja-JP')}
              </div>
            </div>
          </Link>
          <div className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold">
            {stageName}
          </div>
        </div>

        {/* 星・経過日数 */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
          {review.rating ? (
            <AnimatedStars rating={review.rating} />
          ) : (
            <span className="text-zinc-500 text-sm">評価なし</span>
          )}
          <div className="text-sm text-zinc-400 font-medium">
            使用開始から <span className="text-white font-bold">{review.days_elapsed}日目</span>
          </div>
        </div>

        {/* 本文 */}
        <p className="text-zinc-200 leading-relaxed whitespace-pre-wrap text-base mb-8">
          {review.body}
        </p>

        {/* アクション */}
        <div className="flex justify-end items-center gap-3">
          <LikeButton
            reviewId={review.id}
            initialLiked={liked}
            initialCount={likeCount}
            userId={user?.id || ''}
            reviewOwnerId={review.user_id}
          />
          <ShareButton
            text={`${item?.name}の${stageName}を投稿しました！\n使用開始から${review.days_elapsed}日目\n${review.rating ? `評価：★${review.rating}` : ''}\n\n#LoveRevi #熟成レビュー`}
            url={`https://lovereview.vercel.app/reviews/${review.id}`}
          />
        </div>
        <ReviewComments
          reviewId={review.id}
          initialComments={(review.review_comments as any[]) || []}
          currentUserId={user?.id || null}
          reviewOwnerId={review.user_id}
        />
      </div>

      {/* 未ログインの場合のCTA */}
      {!user && (
        <div className="mt-8 text-center p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
          <p className="text-amber-400 font-bold mb-3">LoveReviに参加して、あなたの愛用品をレビューしよう！</p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-amber-500 text-black font-bold rounded-full hover:opacity-90 transition-all"
          >
            無料で登録する
          </Link>
        </div>
      )}
    </div>
  )
}