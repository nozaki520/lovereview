import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Vercel cronからのリクエストか確認
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  // 全ユーザーの購入記録を取得
  const { data: userItems } = await supabase
    .from('user_items')
    .select('*, users(id)')
    .eq('is_still_using', true)

  if (!userItems) return NextResponse.json({ success: true, count: 0 })

  const today = new Date()
  const notifications = []

  for (const userItem of userItems) {
    const purchasedAt = new Date(userItem.purchased_at)
    const daysElapsed = Math.floor((today.getTime() - purchasedAt.getTime()) / (1000 * 60 * 60 * 24))

    // リマインドするタイミング
    const remindDays = [1, 7, 30, 90, 180, 365]
    
    if (remindDays.includes(daysElapsed)) {
      const typeMap: Record<number, string> = {
        1: 'reminder_day1',
        7: 'reminder_week1',
        30: 'reminder_month1',
        90: 'reminder_month3',
        180: 'reminder_month6',
        365: 'reminder_year1',
      }

      // 同じ通知が既にあるか確認
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userItem.user_id)
        .eq('type', typeMap[daysElapsed])
        .eq('target_id', userItem.id)
        .single()

      if (!existing) {
        notifications.push({
          user_id: userItem.user_id,
          type: typeMap[daysElapsed],
          target_id: userItem.id,
          is_read: false,
        })
      }
    }
  }

  if (notifications.length > 0) {
    await supabase.from('notifications').insert(notifications)
  }

  return NextResponse.json({ success: true, count: notifications.length })
}