export const dynamic = 'force-dynamic'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import FollowButton from '@/components/FollowButton'

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const activeTab = resolvedSearchParams.tab || 'reviews'
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('username', resolvedParams.username)
    .single()

  if (!profile) return <div className="p-8 text-zinc-400">ユーザーが見つかりません</div>

  const { data: followData } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', user.id)
    .eq('following_id', profile.id)
    .single()

  const isFollowing = !!followData

  const { count: followerCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profile.id)

  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', profile.id)

  const { data: userItems } = await supabase
    .from('user_items')
    .select('*, items(id, name, genre, image_url, rating_average, rating_count)')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, items(name, genre)')
    .eq('user_id', profile.id)
    .order('published_at', { ascending: false })
    .limit(10)

  const BADGES = [
    { days: 2000, emoji: '👑', label: '2000日', color: 'text-yellow-300' },
    { days: 1000, emoji: '💎', label: '1000日', color: 'text-blue-300' },
    { days: 365, emoji: '🌳', label: '365日', color: 'text-emerald-400' },
    { days: 100, emoji: '🌿', label: '100日', color: 'text-green-400' },
    { days: 30, emoji: '🌱', label: '30日', color: 'text-lime-400' },
  ]

  const earnedBadges = BADGES.filter(badge =>
    userItems?.some(ui =>
      Math.floor((Date.now() - new Date(ui.purchased_at).getTime()) / (1000 * 60 * 60 * 24)) >= badge.days
    )
  )

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <Link href="/home" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors mb-8 font-medium">
        <ArrowLeft className="w-4 h-4" />
        ホームへ戻る
      </Link>

      {/* プロフィールヘッダー */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/10 rounded-full overflow-hidden border border-white/10 flex items-center justify-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">👤</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{profile.display_name}</h1>
              <p className="text-zinc-500 text-sm mb-3">@{profile.username}</p>
              {profile.bio && (
                <p className="text-zinc-400 text-sm">{profile.bio}</p>
              )}
            </div>
          </div>
          <FollowButton
            targetUserId={profile.id}
            currentUserId={user.id}
            initialFollowing={isFollowing}
          />
        </div>

        {/* フォロワー数 */}
        <div className="flex gap-6 mt-6 pt-6 border-t border-white/10">
          <div className="text-center">
            <div className="text-xl font-bold text-white">{followerCount || 0}</div>
            <div className="text-xs text-zinc-500">フォロワー</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">{followingCount || 0}</div>
            <div className="text-xs text-zinc-500">フォロー中</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">{reviews?.length || 0}</div>
            <div className="text-xs text-zinc-500">レビュー数</div>
          </div>
        </div>

        {/* 愛用日数バッジ */}
        {earnedBadges.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
            {earnedBadges.map(badge => (
              <div
                key={badge.days}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full"
              >
                <span className="text-base">{badge.emoji}</span>
                <span className={`text-xs font-bold ${badge.color}`}>{badge.label}愛用</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* タブ */}
      <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
        <Link
          href={`/profile/${resolvedParams.username}?tab=reviews`}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${activeTab === 'reviews'
            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10'
            }`}
        >
          📝 レビュー ({reviews?.length || 0})
        </Link>
        <Link
          href={`/profile/${resolvedParams.username}?tab=items`}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${activeTab === 'items'
            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10'
            }`}
        >
          📦 登録商品 ({userItems?.length || 0})
        </Link>
      </div>

      {/* コンテンツ */}
      {activeTab === 'reviews' ? (
        <div className="space-y-4">
          {reviews && reviews.length > 0 ? (
            reviews.map((review: any) => {
              const stageLabels: Record<string, string> = {
                'day1': 'ファーストインプレッション',
                'week1': '1週間後レビュー',
                'month1': '1ヶ月後レビュー',
                'month3': '3ヶ月後レビュー',
                'month6': '半年後レビュー',
                'year1': '1年後レビュー',
                'beyond': '長期レビュー'
              }
              return (
                <div key={review.id} className="bg-black/40 border border-white/10 rounded-2xl p-5 hover:border-amber-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-white">{review.items?.name}</div>
                      <div className="text-xs text-zinc-500">{review.items?.genre}</div>
                    </div>
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold">
                      {stageLabels[review.stage] || review.stage}
                    </span>
                  </div>
                  <div className="text-amber-500 text-sm mb-2">
                    {'★'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}
                    <span className="text-zinc-500 text-xs ml-2">{review.days_elapsed}日目</span>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed">{review.body}</p>
                </div>
              )
            })
          ) : (
            <div className="text-center py-12 text-zinc-500 bg-white/5 rounded-2xl border border-white/5">
              まだレビューがありません
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {userItems && userItems.length > 0 ? (
            userItems.map((userItem: any) => (
              <Link key={userItem.id} href={`/items/${userItem.items?.id}`} className="block">
                <div className="bg-black/40 border border-white/10 rounded-2xl p-4 hover:border-amber-500/30 transition-all hover:-translate-y-0.5">
                  <div className="w-12 h-12 bg-white/5 rounded-xl overflow-hidden flex items-center justify-center border border-white/10 mb-3">
                    {userItem.items?.image_url ? (
                      <img src={userItem.items.image_url} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">📦</span>
                    )}
                  </div>
                  <div className="font-bold text-white text-sm mb-1 line-clamp-2">{userItem.items?.name}</div>
                  <div className="text-xs text-zinc-500">
                    {Math.floor((Date.now() - new Date(userItem.purchased_at).getTime()) / (1000 * 60 * 60 * 24))}日愛用中
                  </div>
                  {userItem.is_still_using && (
                    <div className="text-xs text-emerald-400 mt-1">🌿 まだ使ってる！</div>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-zinc-500 bg-white/5 rounded-2xl border border-white/5">
              まだ登録商品がありません
            </div>
          )}
        </div>
      )}
    </div>
  )
}