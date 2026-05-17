'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MessageCircle, Trash2 } from 'lucide-react'

type Comment = {
  id: string
  body: string
  created_at: string
  user_id: string
  users: {
    display_name: string
    avatar_url: string | null
    username: string
  }
}

export default function ReviewComments({
  reviewId,
  initialComments,
  currentUserId,
  reviewOwnerId,
}: {
  reviewId: string
  initialComments: Comment[]
  currentUserId: string | null
  reviewOwnerId?: string
}) {
  const [comments, setComments] = useState(initialComments)
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const supabase = createClient()

  const submit = async () => {
    if (!body.trim() || !currentUserId || loading) return
    setLoading(true)

    const { data, error } = await supabase
      .from('review_comments')
      .insert({ review_id: reviewId, user_id: currentUserId, body: body.trim() })
      .select('*, users(display_name, avatar_url, username)')
      .single()

    if (!error && data) {
      setComments(prev => [...prev, data as Comment])
      setBody('')

      // 自分のレビュー以外へのコメントのみ通知
      if (reviewOwnerId && reviewOwnerId !== currentUserId) {
        const { data: myProfile } = await supabase
          .from('users')
          .select('display_name, username')
          .eq('id', currentUserId)
          .single()

        await supabase.from('notifications').insert({
          user_id: reviewOwnerId,
          type: 'commented',
          target_id: reviewId,
          is_read: false,
          meta: {
            review_id: reviewId,
            user_display_name: myProfile?.display_name,
            username: myProfile?.username,
          }
        })
      }
    }
    setLoading(false)
  }

  const deleteComment = async (commentId: string) => {
    await supabase.from('review_comments').delete().eq('id', commentId)
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-400 transition-colors font-medium"
      >
        <MessageCircle className="w-4 h-4" />
        コメント {comments.length > 0 && `(${comments.length})`}
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3 items-start">
              <div className="w-8 h-8 bg-white/10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                {comment.users?.avatar_url ? (
                  <img src={comment.users.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm">👤</span>
                )}
              </div>
              <div className="flex-1 bg-white/5 rounded-2xl px-4 py-3 border border-white/5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-zinc-300">{comment.users?.display_name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-600">
                      {new Date(comment.created_at).toLocaleDateString('ja-JP')}
                    </span>
                    {currentUserId === comment.user_id && (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="text-zinc-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">{comment.body}</p>
              </div>
            </div>
          ))}

          {currentUserId ? (
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="コメントを書く..."
                  rows={2}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white text-sm resize-none placeholder:text-zinc-600"
                />
              </div>
              <button
                onClick={submit}
                disabled={loading || !body.trim()}
                className="px-4 py-3 bg-amber-500 text-black font-bold rounded-2xl hover:opacity-90 transition-all disabled:opacity-40 text-sm"
              >
                送信
              </button>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 text-center py-2">
              コメントするには<a href="/login" className="text-amber-400 hover:underline">ログイン</a>が必要です
            </p>
          )}
        </div>
      )}
    </div>
  )
}