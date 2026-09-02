import { useEffect, useRef, useState } from 'react'

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

/** Плавно докручивает число до нового значения — при монтировании и при каждом изменении. */
export function AnimatedNumber({
  value,
  format,
  duration = 600,
  className = '',
}: {
  value: number
  format: (value: number) => string
  duration?: number
  className?: string
}) {
  const [shown, setShown] = useState(0)
  const fromRef = useRef(0)
  const frameRef = useRef(0)

  useEffect(() => {
    const from = fromRef.current
    const startedAt = performance.now()

    const step = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration)
      const current = from + (value - from) * easeOutCubic(progress)
      setShown(current)
      fromRef.current = current
      if (progress < 1) frameRef.current = requestAnimationFrame(step)
    }

    frameRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameRef.current)
  }, [value, duration])

  return <span className={`tabular-nums ${className}`}>{format(shown)}</span>
}
