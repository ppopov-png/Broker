import type { ReactNode } from 'react'

/** Появление блока снизу вверх со сдвигом по времени — для каскада секций страницы. */
export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <div className={`trg-rise ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}
