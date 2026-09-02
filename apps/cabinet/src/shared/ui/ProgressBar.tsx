import { useEffect, useState } from 'react'

export function ProgressBar({ value, tone = 'blue' }: { value: number; tone?: 'blue' | 'green' }) {
  const clamped = Math.min(100, Math.max(0, value))
  const [width, setWidth] = useState(0)

  // Первый кадр рисуем пустым, чтобы полоса заполнилась анимацией.
  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(clamped))
    return () => cancelAnimationFrame(id)
  }, [clamped])

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--trigonum-border)]">
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{
          width: `${width}%`,
          backgroundColor: tone === 'green' ? 'var(--trigonum-green)' : 'var(--trigonum-blue)',
        }}
      />
    </div>
  )
}
