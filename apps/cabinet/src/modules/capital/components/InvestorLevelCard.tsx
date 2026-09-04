import { Check, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../../shared/lib/format'
import { capitalForPoints, tierInk, tierMetallic, tierPerks } from '../../../shared/lib/InvestorStatus'
import { useInvestorStatus } from '../../../shared/lib/useInvestorStatus'
import { Card } from '../../../shared/ui/Card'
import { ProgressBar } from '../../../shared/ui/ProgressBar'

export function InvestorLevelCard() {
  const { status } = useInvestorStatus()
  const ink = tierInk[status.tier]

  return (
    <Card
      title="Уровень инвестора"
      action={
        <Link to="/levels" className="text-xs font-semibold text-[var(--trigonum-blue)]">
          Все уровни →
        </Link>
      }
    >
      <div className="flex items-center gap-3">
        <span
          className="rounded-lg px-3 py-1.5 text-sm font-bold"
          style={{ background: tierMetallic[status.tier], color: status.tier === 'Black' ? '#f4f4f5' : '#1b1d22' }}
        >
          {status.tier}
        </span>
        <span className="text-sm font-semibold tabular-nums text-[var(--trigonum-muted)]">{status.score} pts</span>
      </div>

      <div className="mt-4">
        <ProgressBar value={status.progress} tone="green" />
      </div>

      {status.nextTier ? (
        <p className="mt-2 text-xs text-[var(--trigonum-muted)]">
          До {status.nextTier} — <b className="tabular-nums text-[var(--trigonum-ink)]">{status.pointsToNext} pts</b>, это{' '}
          <b className="text-[var(--trigonum-ink)]">{formatCurrency(capitalForPoints(status.pointsToNext, true))}</b> на
          12 месяцев
        </p>
      ) : (
        <p className="mt-2 text-xs font-semibold text-[var(--trigonum-success)]">Достигнут максимальный уровень</p>
      )}

      <div className="mt-4 flex flex-col gap-3">
        <ul className="flex flex-col gap-1.5">
          {tierPerks[status.tier].map((perk) => (
            <li key={perk} className="flex items-start gap-2 text-sm text-[var(--trigonum-text)]">
              <Check size={14} className="mt-0.5 shrink-0" style={{ color: ink }} />
              {perk}
            </li>
          ))}
        </ul>

        {status.nextTier && (
          <div className="rounded-xl bg-[var(--trigonum-bg)] p-3">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">
              Откроется на {status.nextTier}
            </p>
            <ul className="flex flex-col gap-1.5">
              {tierPerks[status.nextTier].map((perk) => (
                <li key={perk} className="flex items-start gap-2 text-sm text-[var(--trigonum-muted)]">
                  <Lock size={13} className="mt-0.5 shrink-0" />
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
