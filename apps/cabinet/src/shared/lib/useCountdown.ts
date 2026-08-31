import { useEffect, useState } from 'react'

export function useCountdown(targetIso: string): number {
  const [remaining, setRemaining] = useState(() => new Date(targetIso).getTime() - Date.now())

  useEffect(() => {
    const target = new Date(targetIso).getTime()
    const tick = () => setRemaining(target - Date.now())
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [targetIso])

  return remaining
}
