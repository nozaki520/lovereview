export const dynamic = 'force-dynamic'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut, Flame, Clock } from 'lucide-react'
import Link from 'next/link'
import ShareButton from '@/components/ShareButton'

export default async function HomePage() {
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

  // Fetch feed events
  const { data: feedEvents } = await supabase
    .from('feed_events')
    .select(`
      *,
      users(display_name, avatar_url),
      items(id, name, genre, image_url)
    `)
    .order('created_at', { ascending: false })
    .limit(30)

  // Fetch related reviews since target_id is polymorphic without FK
  const reviewIds = feedEvents?.filter(e => e.event_type === 'review_posted' && e.target_id).map(e => e.target_id) || []
  let reviews: any[] = []
  if (reviewIds.length > 0) {
    const { data } = await supabase.from('reviews').select('id, rating, body, stage, days_elapsed').in('id', reviewIds)
    reviews = data || []
  }

  const eventsWithReviews = feedEvents?.map(event => {
    if (event.event_type === 'review_posted') {
      return { ...event, review: reviews.find(r => r.id === event.target_id) }
    }
    return event
  })

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500 flex items-center gap-2">
          LoveRevi
        </h1>
        <div className="flex items-center gap-6">
          <Link href="/explore" className="text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors">🔍 探す・登録する</Link>
          <Link href="/settings/profile" className="text-sm font-medium text-zinc-300 flex items-center gap-2 hover:bg-white/5 px-3 py-1.5 rounded-full transition-colors">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center border border-white/10">👤</div>
            )}
            {profile?.display_name || 'ゲストユーザー'}
          </Link>
          <form action="/auth/signout" method="post">
            <button className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors">
              <LogOut className="w-4 h-4 text-zinc-300" />
            </button>
          </form>
        </div>
      </header>

      <main>
        <div className="flex items-center gap-3 mb-6">
          <Flame className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-bold">みんなの熟成タイムライン</h2>
        </div>
        
        <div className="space-y-6">
          {eventsWithReviews && eventsWithReviews.length > 0 ? (
            eventsWithReviews.map((event: any) => {
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
              const stageName = review?.stage ? stageLabels[review.stage] || review.stage : '';

              return (
                <div key={event.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-lg hover:border-amber-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-full overflow-hidden flex items-center justify-center">
                         <span className="text-lg">👤</span>
                      </div>
                      <div>
                        <div className="font-bold text-zinc-200">{event.users?.display_name || '名無し'}</div>
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
                        <div className="text-xs text-zinc-500 mb-1">{event.items?.genre}</div>
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
                      <p className="text-zinc-300 leading-relaxed text-sm whitespace-pre-wrap mb-4">
                        {review.body}
                      </p>
                      <div className="flex justify-end">
                        <ShareButton 
                          text={`${event.items?.name}の${stageName}！\n使用開始から${review.days_elapsed}日目\n評価：★${review.rating}\n\n#LoveRevi #熟成レビュー`}
                          url={`http://localhost:3000/items/${event.items?.id}`} 
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="text-center py-20 text-zinc-500 bg-black/40 rounded-3xl border border-white/5">
              まだタイムラインに何もありません。<br/>一番最初のレビューを投稿してみましょう！
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
