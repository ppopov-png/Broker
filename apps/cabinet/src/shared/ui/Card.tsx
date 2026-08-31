import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  padded?: boolean
}

export function Card({ title, subtitle, action, padded = true, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-[var(--trigonum-radius-lg)] border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] shadow-[var(--trigonum-shadow-card)] ${padded ? 'p-5' : ''} ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-[15px] font-semibold tracking-wide text-[var(--trigonum-ink)]">{title}</h2>}
            {subtitle && <p className="mt-1 text-xs text-[var(--trigonum-muted)]">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
