export const dynamic = 'force-dynamic'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import FollowButton from '@/components/FollowButton'

export default async function ProfilePage({
  params
}: {
  params: Promise<{ username: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()

  // ログインユーザー取得
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // プロフィールユーザー取得
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('username', resolvedParams.username)
    .single()

  if (!profile) return <div className="p-8 text-zinc-400">ユーザーが見つかりません</div>

  // フォロー状態確認
  const { data: followData } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', user.id)
    .eq('following_id', profile.id)
    .single()

  const isFollowing = !!followData

  // フォロワー数・フォロー数取得
  const { count: followerCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profile.id)

  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', profile.id)

  // レビュー取得
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, items(name, genre)')
    .eq('user_id', profile.id)
    .order('published_at', { ascending: false })
    .limit(10)

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
      </div>

      {/* レビュー一覧 */}
      <h2 className="text-xl font-bold mb-4 text-zinc-200">熟成レビュー</h2>
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
    </div>
  )
}