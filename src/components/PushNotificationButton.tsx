'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'

export default function PushNotificationButton() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if ('Notification' in window) {
      setPermission(Notification.permission)
      if (Notification.permission === 'granted') {
        checkSubscription()
      }
    }
  }, [])

  async function checkSubscription() {
    const registration = await navigator.serviceWorker.getRegistration('/sw.js')
    if (!registration) return
    const sub = await registration.pushManager.getSubscription()
    setSubscribed(!!sub)
  }

  async function subscribe() {
    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      const activeRegistration = await navigator.serviceWorker.getRegistration('/sw.js')
      const sub = await activeRegistration!.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
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

      setSubscribed(true)
    } catch (e) {
      console.error('Subscribe failed:', e)
    }
    setLoading(false)
  }

  async function unsubscribe() {
    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js')
      if (registration) {
        const sub = await registration.pushManager.getSubscription()
        if (sub) {
          await fetch('/api/push/unsubscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          })
          await sub.unsubscribe()
        }
      }
      setSubscribed(false)
    } catch (e) {
      console.error('Unsubscribe failed:', e)
    }
    setLoading(false)
  }

  if (!mounted) return null
  if (!('Notification' in window)) return null
  if (permission === 'denied') return null

  return (
    <button
      onClick={subscribed ? unsubscribe : subscribe}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all ${
        subscribed
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
          : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
      }`}
    >
      {subscribed ? (
        <><Bell className="w-4 h-4" />{loading ? '処理中...' : '通知ON'}</>
      ) : (
        <><BellOff className="w-4 h-4" />{loading ? '設定中...' : '通知を受け取る'}</>
      )}
    </button>
  )
}