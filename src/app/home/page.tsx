export const dynamic = 'force-dynamic'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut, Flame, Clock } from 'lucide-react'
import Link from 'next/link'
import ShareButton from '@/components/ShareButton'
import NotificationBell from '@/components/NotificationBell'
import MobileMenu from '@/components/MobileMenu'
import LikeButton from '@/components/LikeButton'
import OnboardingModal from '@/components/OnboardingModal'
import RecapModal from '@/components/RecapModal'
import FadeInCard from '@/components/FadeInCard'
import ReviewComments from '@/components/ReviewComments'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>
}) {
  const resolvedSearch = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // 通知取得
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  // Fetch feed events
  const { data: feedEvents } = await supabase
    .from('feed_events')
    .select(`
      *,
    users(display_name, avatar_url, username),      items(id, name, genre, image_url)
    `)
    .order('created_at', { ascending: false })
    .limit(30)

  // Fetch related reviews since target_id is polymorphic without FK
  const reviewIds = feedEvents?.filter(e => e.event_type === 'review_posted' && e.target_id).map(e => e.target_id) || []
  let reviews: any[] = []
  if (reviewIds.length > 0) {
    const { data } = await supabase.from('reviews').select('id, rating, body, stage, days_elapsed, review_comments(id, body, created_at, user_id, users(display_name, avatar_url, username))').in('id', reviewIds)
    reviews = data || []
  }

  // Fetch likes for reviews
  const likesCounts: Record<string, number> = {}
  const userLikes: Record<string, boolean> = {}
  if (reviewIds.length > 0) {
    const { data: likesData } = await supabase
      .from('likes')
      .select('review_id, user_id')
      .in('review_id', reviewIds)

    likesData?.forEach(like => {
      likesCounts[like.review_id] = (likesCounts[like.review_id] || 0) + 1
      if (like.user_id === user.id) {
        userLikes[like.review_id] = true
      }
    })
  }

  const eventsWithReviews = feedEvents?.map(event => {
    if (event.event_type === 'review_posted') {
      return { ...event, review: reviews.find(r => r.id === event.target_id) }
    }
    return event
  })

  // 12月限定まとめモーダル用データ
  const isDecember = new Date().getMonth() === 11 || new Date().getMonth() === 4 // テスト用に5月も含む

  const { data: recapReviews } = isDecember ? await supabase
    .from('reviews')
    .select('*, items(name)')
    .eq('user_id', user.id)
    .order('published_at', { ascending: false })
    .limit(1) : { data: null }

  const { data: recapItems } = isDecember ? await supabase
    .from('user_items')
    .select('*, items(id, name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1) : { data: null }

  const { data: recapAllItems } = isDecember ? await supabase
    .from('user_items')
    .select('*, items(id, name)')
    .eq('user_id', user.id) : { data: null }

  const recapLongest = recapAllItems
    ?.map(ui => ({
      name: (ui.items as any)?.name,
      days: Math.floor((Date.now() - new Date(ui.purchased_at).getTime()) / (1000 * 60 * 60 * 24))
    }))
    .sort((a, b) => b.days - a.days)[0] || null

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      {resolvedSearch.welcome === '1' && <OnboardingModal />}
      {isDecember && resolvedSearch.welcome !== '1' && 
      (Date.now() - new Date(profile?.created_at).getTime()) > 1000 * 60 * 60 && (
        <RecapModal
          displayName={profile?.display_name || 'ゲスト'}
          topReview={recapReviews?.[0] ? {
            itemName: (recapReviews[0].items as any)?.name,
            stage: recapReviews[0].stage,
          } : null}
          topItem={recapItems?.[0] ? { name: (recapItems[0].items as any)?.name } : null}
          longestItem={recapLongest}
        />
      )}
      <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
          LoveRevi
        </h1>
        <div className="flex items-center gap-2 md:gap-6">
          <Link href="/explore" className="hidden md:block text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors">🔍 探す・登録する</Link>
          <Link href="/ranking" className="hidden md:block text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors">🏆 ランキング</Link>
          {(new Date().getMonth() === 11) && (
            <Link href="/recap" className="hidden md:block text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors">📊 まとめ</Link>
          )}
          <Link href="/settings/profile" className="flex items-center gap-2 hover:bg-white/5 px-2 py-1.5 rounded-full transition-colors">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center border border-white/10">👤</div>
            )}
            <span className="hidden md:block text-sm font-medium text-zinc-300">{profile?.display_name || 'ゲストユーザー'}</span>
          </Link>
          <NotificationBell initialNotifications={notifications || []} />
          <form action="/auth/signout" method="post">
            <button className="hidden md:block p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors">
              <LogOut className="w-4 h-4 text-zinc-300" />
            </button>
          </form>
          <MobileMenu username={profile?.username} />
        </div>
      </header>

      <main>
        <div className="flex items-center gap-3 mb-6">
          <Flame className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-bold">みんなの熟成タイムライン</h2>
        </div>

        <div className="space-y-6">
          {eventsWithReviews && eventsWithReviews.length > 0 ? (
            eventsWithReviews.map((event: any, index: number) => {
              const review = event.review;

              const stageLabels: Record<string, string> = {
                'day1': 'ファーストインプレッション',
                'week1': '1週間後レビュー',
                'month1': '1ヶ月後レビュー',
                'month3': '3ヶ月後レビュー',
                'month6': '半年後レビュー',
                'year1': '1年後レビュー',
                'beyond': '長期レビュー'
              }

              // ここに追加
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
              const stageName = review?.stage ? stageLabels[review.stage] || review.stage : '';

              return (
                <FadeInCard key={event.id} delay={index * 80}>
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-lg hover:border-amber-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <Link href={`/profile/${event.users?.username}`} className="w-10 h-10 bg-white/10 rounded-full overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-amber-400 transition-all">
                        {event.users?.avatar_url ? (
                          <img src={event.users.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg">👤</span>
                        )}
                      </Link>
                      <div>
                        <Link href={`/profile/${event.users?.username}`} className="font-bold text-zinc-200 hover:text-amber-400 transition-colors">
                          {event.users?.display_name || '名無し'}
                        </Link>
                        <div className="text-xs text-zinc-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(event.created_at).toLocaleString('ja-JP')}
                        </div>
                      </div>
                    </div>

                    {event.event_type === 'review_posted' && (
                      <div className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold inline-block">
                        {stageName}
                      </div>
                    )}
                  </div>

                  {/* Item preview block */}
                  <Link href={`/items/${event.items?.id}`} className="block">
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex gap-4 mb-4 hover:bg-white/10 transition-colors">
                      <div className="w-16 h-16 bg-black/50 rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
                        {event.items?.image_url ? (
                          <img src={event.items.image_url} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl">📦</span>
                        )}
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500 mb-1">{genreLabels[event.items?.genre] || event.items?.genre}</div>
                        <div className="font-bold text-white mb-1">{event.items?.name}</div>
                        {review && (
                          <div className="flex items-center gap-1 text-amber-500 text-sm">
                            {'★'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}
                            <span className="text-zinc-500 text-xs ml-2">({review.days_elapsed}日目)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Review Content Preview */}
                  {review && (
                    <div className="mt-4">
                      <Link href={`/reviews/${review.id}`} className="block">
                       <p className="text-zinc-300 leading-relaxed text-sm whitespace-pre-wrap mb-4 hover:text-white transition-colors cursor-pointer">
                        {review.body}
                       </p>
                      </Link>
                      <div className="flex justify-end items-center gap-3">
                        <LikeButton
                          reviewId={review.id}
                          initialLiked={userLikes[review.id] || false}
                          initialCount={likesCounts[review.id] || 0}
                          userId={user.id}
                        />
                        <ShareButton
                          text={`${event.items?.name}の${stageName}！\n使用開始から${review.days_elapsed}日目\n評価：★${review.rating}\n\n#LoveRevi #熟成レビュー`}
                          url={`https://lovereview.vercel.app/reviews/${event.target_id}`}
                        />
                      </div>
                      <div className="mt-3">
                        <ReviewComments
                          reviewId={review.id}
                          initialComments={(review.review_comments as any[]) || []}
                          currentUserId={user.id}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </FadeInCard>
              )
            })
          ) : (
            <div className="text-center py-20 text-zinc-500 bg-black/40 rounded-3xl border border-white/5">
              まだタイムラインに何もありません。<br />一番最初のレビューを投稿してみましょう！
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
