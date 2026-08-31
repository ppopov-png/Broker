import type { ReactNode } from 'react'

type Tone = 'blue' | 'green' | 'violet' | 'amber' | 'ink' | 'muted'

const toneStyles: Record<Tone, string> = {
  blue: 'bg-[color-mix(in_srgb,var(--trigonum-blue)_12%,white)] text-[var(--trigonum-blue)]',
  green: 'bg-[color-mix(in_srgb,var(--trigonum-green)_14%,white)] text-[var(--trigonum-green)]',
  violet: 'bg-[var(--trigonum-violet-soft)] text-[var(--trigonum-violet)]',
  amber: 'bg-[color-mix(in_srgb,var(--trigonum-warning)_16%,white)] text-[var(--trigonum-warning)]',
  ink: 'bg-[color-mix(in_srgb,var(--trigonum-ink)_8%,white)] text-[var(--trigonum-ink)]',
  muted: 'bg-[color-mix(in_srgb,var(--trigonum-muted)_12%,white)] text-[var(--trigonum-muted)]',
}

export function IconTile({ icon, tone = 'blue', size = 40 }: { icon: ReactNode; tone?: Tone; size?: number }) {
  return (
    <div
      className={`grid shrink-0 place-items-center rounded-xl ${toneStyles[tone]}`}
      style={{ width: size, height: size }}
    >
      {icon}
    </div>
  )
}
