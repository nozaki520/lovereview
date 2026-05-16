'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'

export default function PushNotificationButton() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  async function subscribe() {
    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'BCZq7B0ce-RnoQJe0mO4XNY4LR0uHhHHS4THcdAtjYWSFdyPKDP7Psb8wGVtAUPY8dZW4x6swgQ3mbKHTmv0Rts',
      })

      const { endpoint, keys } = sub.toJSON() as any

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
        }),
      })

      setPermission('granted')
    } catch (e) {
      console.error('Subscribe failed:', e)
    }
    setLoading(false)
  }

  if (!('Notification' in window)) return null
  if (permission === 'denied') return null

  return (
    <button
      onClick={subscribe}
      disabled={loading || permission === 'granted'}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all ${
        permission === 'granted'
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
      }`}
    >
      {permission === 'granted' ? (
        <><Bell className="w-4 h-4" />通知ON</>
      ) : (
        <><BellOff className="w-4 h-4" />{loading ? '設定中...' : '通知を受け取る'}</>
      )}
    </button>
  )
}