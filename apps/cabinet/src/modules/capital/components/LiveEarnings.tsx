import { Activity, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatCurrency, formatPercent } from '../../../shared/lib/format'
import { Card } from '../../../shared/ui/Card'
import { ProgressBar } from '../../../shared/ui/ProgressBar'
import { earningSources, earningsPerSecond, totalEarned } from '../model/capital-data'

const TICK_MS = 100

export function LiveEarnings() {
  const [ticked, setTicked] = useState(0)

  useEffect(() => {
    const startedAt = Date.now()
    const id = window.setInterval(() => setTicked((Date.now() - startedAt) / 1000), TICK_MS)
    return () => window.clearInterval(id)
  }, [])

  const live = totalEarned + ticked * earningsPerSecond
  const perDay = earningsPerSecond * 86_400
  const perHour = earningsPerSecond * 3_600

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_2fr] lg:items-start">
      <Card className="bg-[linear-gradient(140deg,var(--trigonum-ink),#123a6b)] text-white">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/70">
          <Activity size={13} /> Заработано всего
        </p>
        <p className="mt-2 font-bold tabular-nums">
          <span className="text-3xl">{formatCurrency(Math.floor(live))}</span>
          <span className="trg-glow text-xl text-[#7ee2b8]">.{live.toFixed(4).split('.')[1]}</span>
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-white/70">
          <span className="trg-glow inline-block size-1.5 rounded-full bg-[#7ee2b8]" />
          Начисления идут непрерывно, прямо сейчас
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-white/10 px-3 py-2">
            <p className="text-[11px] text-white/70">В час</p>
            <p className="text-sm font-semibold tabular-nums">{formatCurrency(perHour, true)}</p>
          </div>
          <div className="rounded-lg bg-white/10 px-3 py-2">
            <p className="text-[11px] text-white/70">В сутки</p>
            <p className="text-sm font-semibold tabular-nums">{formatCurrency(perDay, true)}</p>
          </div>
        </div>
      </Card>

      <Card title="Откуда приходит доход" subtitle="Вклад каждого направления в общий заработок">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {earningSources.map((source) => {
            const share = (source.earned / totalEarned) * 100
            return (
              <div key={source.key} className="rounded-xl border border-[var(--trigonum-border)] p-4">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: source.color }} />
                  <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{source.label}</p>
                </div>
                <p className="mt-2 text-xl font-bold text-[var(--trigonum-success)]">+{formatCurrency(source.earned)}</p>
                <p className="flex items-center gap-1 text-xs text-[var(--trigonum-muted)]">
                  <TrendingUp size={12} /> {source.apy}% годовых · вложено {formatCurrency(source.principal)}
                </p>
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-[11px] text-[var(--trigonum-muted)]">
                    <span>Доля в заработке</span>
                    <span className="font-semibold text-[var(--trigonum-ink)]">{formatPercent(share, false)}</span>
                  </div>
                  <ProgressBar value={share} tone={source.key === 'strategies' ? 'blue' : 'green'} />
                </div>
                <p className="mt-3 text-[11px] leading-snug text-[var(--trigonum-muted)]">{source.hint}</p>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
