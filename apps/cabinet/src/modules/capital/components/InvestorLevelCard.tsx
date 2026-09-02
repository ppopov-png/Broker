import { Check, Lock, Medal } from 'lucide-react'
import { formatCurrency } from '../../../shared/lib/format'
import { capitalTotals } from '../../../shared/mock/data'
import { Card } from '../../../shared/ui/Card'
import { Pill } from '../../../shared/ui/Pill'
import { ProgressBar } from '../../../shared/ui/ProgressBar'
import { investorLevels } from '../model/capital-data'

export function InvestorLevelCard() {
  const capital = capitalTotals.total
  const currentIndex = investorLevels.reduce((acc, level, i) => (capital >= level.threshold ? i : acc), 0)
  const current = investorLevels[currentIndex]
  const next = investorLevels[currentIndex + 1]

  const progress = next
    ? ((capital - current.threshold) / (next.threshold - current.threshold)) * 100
    : 100

  return (
    <Card
      title="Уровень инвестора"
      subtitle="Растёт вместе с капиталом и открывает новые условия"
      action={
        <Pill tone="warning" icon={<Medal size={13} />}>
          {current.label}
        </Pill>
      }
    >
      <div className="flex items-center justify-between text-xs text-[var(--trigonum-muted)]">
        <span>{current.label}</span>
        {next && <span>{next.label}</span>}
      </div>
      <div className="mt-1.5">
        <ProgressBar value={progress} tone="green" />
      </div>
      {next ? (
        <p className="mt-2 text-xs text-[var(--trigonum-muted)]">
          До уровня {next.label} осталось{' '}
          <b className="text-[var(--trigonum-ink)]">{formatCurrency(next.threshold - capital)}</b>
        </p>
      ) : (
        <p className="mt-2 text-xs text-[var(--trigonum-success)]">Достигнут максимальный уровень</p>
      )}

      <div className="mt-4 flex flex-col gap-3">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">Уже доступно</p>
          <ul className="flex flex-col gap-1.5">
            {current.perks.map((perk) => (
              <li key={perk} className="flex items-center gap-2 text-sm text-[var(--trigonum-text)]">
                <Check size={14} className="shrink-0 text-[var(--trigonum-success)]" />
                {perk}
              </li>
            ))}
          </ul>
        </div>

        {next && (
          <div className="rounded-xl bg-[var(--trigonum-bg)] p-3">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">
              Откроется на {next.label}
            </p>
            <ul className="flex flex-col gap-1.5">
              {next.perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2 text-sm text-[var(--trigonum-muted)]">
                  <Lock size={13} className="shrink-0" />
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  )
}
