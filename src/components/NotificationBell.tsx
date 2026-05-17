'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Bell } from 'lucide-react'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  is_read: boolean
  created_at: string
  target_id: string
  meta?: {
    item_name?: string
    item_id?: string
    user_display_name?: string
    username?: string
    review_id?: string
  }
}

interface NotificationBellProps {
  initialNotifications: Notification[]
}

function getNotificationContent(n: Notification): { message: string; url: string } {
  const itemName = n.meta?.item_name ? `「${n.meta.item_name}」` : ''
  const userName = n.meta?.user_display_name ? `${n.meta.user_display_name}さん` : '誰か'

  switch (n.type) {
    case 'reminder_day1':
      return { message: `🌱 ${itemName}購入から1日！ファーストインプレッションを書いてみよう`, url: `/items/${n.meta?.item_id || n.target_id}` }
    case 'reminder_week1':
      return { message: `🌱 ${itemName}購入から1週間！使い心地はどうですか？`, url: `/items/${n.meta?.item_id || n.target_id}` }
    case 'reminder_month1':
      return { message: `🌿 ${itemName}購入から1ヶ月！レビューを書いてみよう`, url: `/items/${n.meta?.item_id || n.target_id}` }
    case 'reminder_month3':
      return { message: `🌿 ${itemName}購入から3ヶ月！3ヶ月後レビューのタイミングです`, url: `/items/${n.meta?.item_id || n.target_id}` }
    case 'reminder_month6':
      return { message: `🌳 ${itemName}購入から半年！半年後レビューを書いてみよう`, url: `/items/${n.meta?.item_id || n.target_id}` }
    case 'reminder_year1':
      return { message: `🌳 ${itemName}購入から1年！1年後レビューを書いてみよう`, url: `/items/${n.meta?.item_id || n.target_id}` }
    case 'followed':
      return { message: `👤 ${userName}にフォローされました`, url: `/profile/${n.meta?.username || ''}` }
    case 'liked':
      return { message: `❤️ ${userName}があなたのレビューにいいねしました`, url: `/reviews/${n.meta?.review_id || n.target_id}` }
    case 'commented':
      return { message: `💬 ${userName}があなたのレビューにコメントしました`, url: `/reviews/${n.meta?.review_id || n.target_id}` }
    default:
      return { message: n.type, url: '/home' }
  }
}

export default function NotificationBell({ initialNotifications }: NotificationBellProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.is_read).length

  const handleOpen = async () => {
    setOpen(!open)
    if (!open && unreadCount > 0) {
      const supabase = createClient()
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds)
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
      >
        <Bell className="w-4 h-4 text-zinc-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-xs text-black font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-bold text-zinc-200">通知</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(n => {
                const { message, url } = getNotificationContent(n)
                return (
                  <Link
                    key={n.id}
                    href={url}
                    onClick={() => setOpen(false)}
                    className={`block p-4 border-b border-white/5 text-sm hover:bg-white/5 transition-colors ${
                      n.is_read ? 'text-zinc-500' : 'text-zinc-200 bg-amber-500/5'
                    }`}
                  >
                    {message}
                    <div className="text-xs text-zinc-600 mt-1">
                      {new Date(n.created_at).toLocaleDateString('ja-JP')}
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="p-8 text-center text-zinc-500 text-sm">
                通知はありません
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}