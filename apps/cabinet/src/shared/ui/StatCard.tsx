import type { ReactNode } from 'react'
import { IconTile } from './IconTile'

interface StatCardProps {
  label: string
  value: string
  hint?: string
  hintTone?: 'success' | 'danger' | 'muted'
  icon?: ReactNode
  iconTone?: 'blue' | 'green' | 'violet' | 'amber' | 'ink' | 'muted'
}

const hintColor: Record<NonNullable<StatCardProps['hintTone']>, string> = {
  success: 'text-[var(--trigonum-success)]',
  danger: 'text-[var(--trigonum-danger)]',
  muted: 'text-[var(--trigonum-muted)]',
}

export function StatCard({ label, value, hint, hintTone = 'muted', icon, iconTone = 'blue' }: StatCardProps) {
  return (
    <div className="rounded-[var(--trigonum-radius-lg)] border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] p-5 shadow-[var(--trigonum-shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--trigonum-blue)_30%,var(--trigonum-border))]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--trigonum-muted)]">{label}</p>
        {icon && <IconTile icon={icon} tone={iconTone} size={34} />}
      </div>
      <p className="mt-2 text-2xl font-bold text-[var(--trigonum-ink)]">{value}</p>
      {hint && <p className={`mt-1 text-xs font-medium ${hintColor[hintTone]}`}>{hint}</p>}
    </div>
  )
}
