import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { formatCurrency, formatDate, formatPercent, formatSigned } from '../../../shared/lib/format'
import { capitalTotals, positions } from '../../../shared/mock/data'
import type { Position } from '../../../shared/mock/types'
import { Card } from '../../../shared/ui/Card'
import { Pill } from '../../../shared/ui/Pill'
import { ProgressBar } from '../../../shared/ui/ProgressBar'
import { Sparkline } from '../../../shared/ui/Sparkline'
import { OutlineButton, PrimaryButton } from '../../../shared/ui/buttons'

const kindTone = {
  earn: { label: 'Earn', tone: 'info' as const },
  strategies: { label: 'Strategies', tone: 'violet' as const },
  events: { label: 'Events', tone: 'success' as const },
}

function daysInPosition(openedAt: string): number {
  return Math.max(1, Math.round((Date.now() - new Date(openedAt).getTime()) / 86_400_000))
}

function PositionRow({ position }: { position: Position }) {
  const [open, setOpen] = useState(false)
  const share = (position.currentValue / capitalTotals.total) * 100
  const days = daysInPosition(position.openedAt)
  const meta = kindTone[position.kind]

  return (
    <div className="border-b border-[var(--trigonum-border)] last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 rounded-lg py-3 text-left transition-colors hover:bg-[var(--trigonum-bg)]"
      >
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-semibold text-[var(--trigonum-ink)]">
            {position.product}
            <Pill tone={meta.tone}>{meta.label}</Pill>
          </p>
          <p className="text-xs text-[var(--trigonum-muted)]">
            {formatCurrency(position.invested)} вложено · {days} дн. в позиции
          </p>
        </div>
        <div className="hidden sm:block">
          <Sparkline data={position.series} width={96} height={28} />
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-[var(--trigonum-success)]">{formatSigned(position.profit)}</p>
          <p className="text-xs text-[var(--trigonum-muted)]">{position.yieldLabel}</p>
        </div>
        <ChevronDown size={16} className={`shrink-0 text-[var(--trigonum-muted)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-[1.6fr_1fr]">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Вложено', formatCurrency(position.invested)],
              ['Текущая стоимость', formatCurrency(position.currentValue)],
              ['Открыта', formatDate(position.openedAt)],
              ['Прибыль за всё время', formatSigned(position.profit)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-[var(--trigonum-bg)] p-3">
                <p className="text-[11px] text-[var(--trigonum-muted)]">{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-[var(--trigonum-ink)]">{value}</p>
              </div>
            ))}
            <div className="col-span-2 sm:col-span-4">
              <div className="mb-1 flex items-center justify-between text-xs text-[var(--trigonum-muted)]">
                <span>Доля в портфеле</span>
                <span className="font-semibold text-[var(--trigonum-ink)]">{formatPercent(share, false)}</span>
              </div>
              <ProgressBar value={share} />
            </div>
          </div>
            <div className="flex flex-col justify-center gap-2">
              <PrimaryButton className="w-full">Докупить</PrimaryButton>
              <OutlineButton className="w-full">Вывести из позиции</OutlineButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PositionsBreakdown() {
  const invested = positions.reduce((sum, p) => sum + p.invested, 0)

  return (
    <Card
      title="Во что инвестировано"
      subtitle={`${positions.length} активные позиции на ${formatCurrency(invested)} — раскройте для деталей`}
    >
      <div className="flex flex-col">
        {positions.map((position) => (
          <PositionRow key={position.id} position={position} />
        ))}
      </div>
    </Card>
  )
}
