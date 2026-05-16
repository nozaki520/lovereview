'use client'

import { useEffect, useRef, useState } from 'react'

export default function AnimatedBadge({ emoji, label, color, delay = 0 }: {
  emoji: string
  label: string
  color: string
  delay?: number
}) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={`flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full transition-all duration-500 ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
      }`}
    >
      <span className="text-base">{emoji}</span>
      <span className={`text-xs font-bold ${color}`}>{label}愛用</span>
    </div>
  )
}