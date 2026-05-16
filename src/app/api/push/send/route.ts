import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = req.headers.get('x-vercel-cron-signature') 
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && !cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  // 全購読を取得
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('*, users(id)')

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ message: 'No subscriptions' })
  }

  // notificationsテーブルから未送信の通知を取得
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('is_read', false)

  if (!notifications || notifications.length === 0) {
    return NextResponse.json({ message: 'No notifications' })
  }

  const typeMessages: Record<string, string> = {
    'reminder_day1': '🌱 ファーストインプレッションを書いてみよう！',
    'reminder_week1': '🌱 1週間後レビューのタイミングです！',
    'reminder_month1': '🌿 1ヶ月後レビューを書いてみよう！',
    'reminder_month3': '🌿 3ヶ月後レビューのタイミングです！',
    'reminder_month6': '🌳 半年後レビューを書いてみよう！',
    'reminder_year1': '🌳 1年後レビューのタイミングです！',
  }

  let sent = 0

  for (const notification of notifications) {
    const sub = subscriptions.find(s => s.user_id === notification.user_id)
    if (!sub) continue

    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({
          title: 'LoveRevi',
          body: typeMessages[notification.type] || '新しい通知があります',
          url: '/home',
        })
      )
      sent++
    } catch (e) {
      console.error('Push failed:', e)
    }
  }

  return NextResponse.json({ sent })
}