import type { ReactNode } from 'react'

export type PillTone = 'success' | 'warning' | 'info' | 'danger' | 'neutral' | 'violet'

const toneStyles: Record<PillTone, string> = {
  success: 'bg-[color-mix(in_srgb,var(--trigonum-success)_14%,white)] text-[var(--trigonum-success)]',
  warning: 'bg-[color-mix(in_srgb,var(--trigonum-warning)_16%,white)] text-[#92650c]',
  info: 'bg-[color-mix(in_srgb,var(--trigonum-blue)_12%,white)] text-[var(--trigonum-blue)]',
  danger: 'bg-[color-mix(in_srgb,var(--trigonum-danger)_12%,white)] text-[var(--trigonum-danger)]',
  neutral: 'bg-[color-mix(in_srgb,var(--trigonum-muted)_14%,white)] text-[var(--trigonum-muted)]',
  violet: 'bg-[var(--trigonum-violet-soft)] text-[var(--trigonum-violet)]',
}

export function Pill({ children, tone = 'neutral', icon }: { children: ReactNode; tone?: PillTone; icon?: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${toneStyles[tone]}`}>
      {icon}
      {children}
    </span>
  )
}
