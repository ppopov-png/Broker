import { CalendarClock, Crown, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { formatCurrency, formatDate, formatPercent, formatSigned } from '../../../shared/lib/format'
import { capitalTotals, positions } from '../../../shared/mock/data'
import type { Position } from '../../../shared/mock/types'
import { Card } from '../../../shared/ui/Card'
import { Pill } from '../../../shared/ui/Pill'
import { SegmentedControl } from '../../../shared/ui/SegmentedControl'
import { Sparkline } from '../../../shared/ui/Sparkline'
import { OutlineButton, PrimaryButton } from '../../../shared/ui/buttons'

const kindMeta = {
  earn: { label: 'Earn', tone: 'info' as const, color: 'var(--trigonum-blue)' },
  strategies: { label: 'Strategies', tone: 'violet' as const, color: 'var(--trigonum-violet)' },
  events: { label: 'Events', tone: 'success' as const, color: 'var(--trigonum-green)' },
}

const sortOptions = [
  { value: 'profit', label: 'По прибыли' },
  { value: 'yield', label: 'По доходности' },
  { value: 'age', label: 'По сроку' },
] as const

type SortValue = (typeof sortOptions)[number]['value']

function daysInPosition(openedAt: string): number {
  return Math.max(1, Math.round((Date.now() - new Date(openedAt).getTime()) / 86_400_000))
}

function PositionCard({ position, isBest }: { position: Position; isBest: boolean }) {
  const meta = kindMeta[position.kind]
  const share = (position.currentValue / capitalTotals.total) * 100
  const days = daysInPosition(position.openedAt)
  const perDay = (position.invested * position.yieldPct) / 100 / 365

  // Где текущая доходность стоит внутри целевого коридора продукта.
  const span = position.targetHigh - position.targetLow || 1
  const inRange = Math.min(100, Math.max(0, ((position.yieldPct - position.targetLow) / span) * 100))

  return (
    <div className="group overflow-hidden rounded-[var(--trigonum-radius-lg)] border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] transition duration-200 hover:-translate-y-1 hover:shadow-[var(--trigonum-shadow-card)]">
      <div className="h-1" style={{ backgroundColor: meta.color }} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[var(--trigonum-ink)]">
              {position.product}
              <Pill tone={meta.tone}>{meta.label}</Pill>
              {isBest && (
                <Pill tone="warning" icon={<Crown size={11} />}>
                  Лучшая
                </Pill>
              )}
            </p>
            <p className="mt-1 text-xs text-[var(--trigonum-muted)]">
              {formatCurrency(position.invested)} вложено · открыта {formatDate(position.openedAt)}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-bold text-[var(--trigonum-ink)]">{formatCurrency(position.currentValue)}</p>
            <p className="text-sm font-semibold text-[var(--trigonum-success)]">
              {formatSigned(position.profit)} · {formatPercent(position.yieldPct)}
            </p>
          </div>
        </div>

        <div className="mt-3 h-12">
          <Sparkline data={position.series} width={320} height={48} area color={meta.color} />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            ['Приносит в день', `≈${formatCurrency(perDay, true)}`, <TrendingUp key="i" size={12} />],
            ['В позиции', `${days} дн.`, <CalendarClock key="i" size={12} />],
            ['Доля портфеля', formatPercent(share, false), null],
          ].map(([label, value, icon]) => (
            <div key={label as string} className="rounded-lg bg-[var(--trigonum-bg)] px-2.5 py-2">
              <p className="flex items-center gap-1 text-[10px] text-[var(--trigonum-muted)]">
                {icon}
                {label}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-[var(--trigonum-ink)]">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[11px] text-[var(--trigonum-muted)]">
            <span>Целевой коридор продукта</span>
            <span>
              {position.targetLow}% – {position.targetHigh}%
            </span>
          </div>
          <div className="relative h-1.5 w-full rounded-full bg-[color-mix(in_srgb,var(--trigonum-success)_18%,white)]">
            <span
              className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--trigonum-surface)] shadow transition-[left] duration-500"
              style={{ left: `${inRange}%`, backgroundColor: meta.color }}
            />
          </div>
          <p className="mt-1 text-[11px] text-[var(--trigonum-muted)]">
            Текущая доходность {formatPercent(position.yieldPct)} — внутри коридора
          </p>
        </div>

        <div className="mt-4 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
          <PrimaryButton className="flex-1 px-3 py-2 text-xs">Докупить</PrimaryButton>
          <OutlineButton className="flex-1 px-3 py-2 text-xs">Вывести</OutlineButton>
        </div>
      </div>
    </div>
  )
}

export function PositionsBreakdown() {
  const [sort, setSort] = useState<SortValue>('profit')

  const totals = useMemo(() => {
    const invested = positions.reduce((sum, p) => sum + p.invested, 0)
    const value = positions.reduce((sum, p) => sum + p.currentValue, 0)
    return { invested, value, profit: value - invested }
  }, [])

  const bestId = useMemo(() => positions.reduce((best, p) => (p.profit > best.profit ? p : best), positions[0]).id, [])

  const sorted = useMemo(() => {
    const list = [...positions]
    if (sort === 'profit') return list.sort((a, b) => b.profit - a.profit)
    if (sort === 'yield') return list.sort((a, b) => b.yieldPct - a.yieldPct)
    return list.sort((a, b) => new Date(a.openedAt).getTime() - new Date(b.openedAt).getTime())
  }, [sort])

  return (
    <Card
      title="Во что инвестировано"
      subtitle={`${positions.length} позиции · ${formatCurrency(totals.value)} текущая стоимость · ${formatSigned(totals.profit)} прибыль`}
      action={<SegmentedControl value={sort} onChange={setSort} options={sortOptions.map(({ value, label }) => ({ value, label }))} />}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {sorted.map((position) => (
          <PositionCard key={position.id} position={position} isBest={position.id === bestId} />
        ))}
      </div>
    </Card>
  )
}
