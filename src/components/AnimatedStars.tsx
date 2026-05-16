'use client'

import { useEffect, useState, useRef } from 'react'

export default function AnimatedStars({ rating }: { rating: number }) {
  const [filledCount, setFilledCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          let count = 0
          const interval = setInterval(() => {
            count++
            setFilledCount(count)
            if (count >= rating) clearInterval(interval)
          }, 150)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [rating])

  return (
    <div ref={ref} className="flex items-center gap-0.5 text-xl">
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={`transition-all duration-200 ${
            i <= filledCount
              ? 'text-amber-500 scale-110'
              : 'text-zinc-600'
          }`}
        >
          ★
        </span>
      ))}
    </div>
  )
}