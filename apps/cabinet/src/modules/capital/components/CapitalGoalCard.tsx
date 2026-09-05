import { Flag, Lightbulb, Rocket } from 'lucide-react'
import { useMemo, useState } from 'react'
import { formatCurrency } from '../../../shared/lib/format'
import { capitalTotals } from '../../../shared/mock/data'
import { AnimatedNumber } from '../../../shared/ui/AnimatedNumber'
import { Card } from '../../../shared/ui/Card'
import { ProgressBar } from '../../../shared/ui/ProgressBar'
import { INVESTOR_TIERS, capitalForPoints } from '../../../shared/lib/InvestorStatus'
import { useInvestorStatus } from '../../../shared/lib/useInvestorStatus'
import { capitalGoalDefault, earningsPerSecond } from '../model/capital-data'

const YEAR_SECONDS = 365 * 24 * 60 * 60
const annualIncome = earningsPerSecond * YEAR_SECONDS
const MILESTONES = [25, 50, 75, 100]

/** Цели по уровням: сколько всего капитала нужно, чтобы добрать баллы до следующих тиров. */
function buildPresets(score: number) {
  return [
    ...INVESTOR_TIERS.filter((tier) => tier.threshold > score).map((tier) => ({
      label: `${tier.tier} · ${formatCurrency(capitalTotals.total + capitalForPoints(tier.threshold - score, true))}`,
      value: capitalTotals.total + capitalForPoints(tier.threshold - score, true),
    })),
    { label: '$1,000,000', value: 1_000_000 },
  ]
}

function formatEta(years: number): string {
  if (!Number.isFinite(years) || years <= 0) return 'цель уже достигнута'
  const wholeYears = Math.floor(years)
  const months = Math.round((years - wholeYears) * 12)
  if (wholeYears === 0) return `${Math.max(months, 1)} мес.`
  return `${wholeYears} г. ${months} мес.`
}

export function CapitalGoalCard() {
  const { status } = useInvestorStatus()
  const presets = buildPresets(status.score)
  const [goal, setGoal] = useState(capitalGoalDefault)
  const [targetYears, setTargetYears] = useState(5)
  const capital = capitalTotals.total
  const progress = Math.min(100, (capital / goal) * 100)
  const remaining = Math.max(0, goal - capital)

  // Сложный процент при текущей доходности портфеля, без учёта новых пополнений.
  const rate = annualIncome / capital
  const eta = Math.log(goal / capital) / Math.log(1 + rate)
  const boostedRate = (annualIncome + capitalTotals.available * 0.07) / capital
  const boostedEta = Math.log(goal / capital) / Math.log(1 + boostedRate)
  const monthsSaved = Math.max(0, Math.round((eta - boostedEta) * 12))

  // Сколько докладывать в месяц сверх органического роста, чтобы уложиться в targetYears.
  const requiredMonthly = useMemo(() => {
    const monthlyRate = rate / 12
    const months = targetYears * 12
    const compoundedCapital = capital * Math.pow(1 + monthlyRate, months)
    const need = goal - compoundedCapital
    if (need <= 0) return 0
    const annuityFactor = monthlyRate === 0 ? months : (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate
    return need / annuityFactor
  }, [capital, goal, rate, targetYears])

  return (
    <Card
      title="Цель по капиталу"
      subtitle="Прогноз построен на текущей доходности портфеля"
      action={<Flag size={16} className="text-[var(--trigonum-blue)]" />}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-[var(--trigonum-muted)]">Сейчас</p>
          <AnimatedNumber value={capital} format={(v) => formatCurrency(v)} className="block text-2xl font-bold text-[var(--trigonum-ink)]" />
        </div>
        <label className="text-xs text-[var(--trigonum-muted)]">
          <span className="mb-1 block">Цель</span>
          <input
            type="number"
            min={capital}
            step={10_000}
            value={goal}
            onChange={(e) => setGoal(Math.max(1, Number(e.target.value)))}
            className="w-36 rounded-lg border border-[var(--trigonum-border)] px-3 py-2 text-right text-sm font-semibold text-[var(--trigonum-ink)]"
          />
        </label>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setGoal(p.value)}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
              goal === p.value
                ? 'border-[var(--trigonum-blue)] bg-[color-mix(in_srgb,var(--trigonum-blue)_8%,white)] text-[var(--trigonum-blue)]'
                : 'border-[var(--trigonum-border)] text-[var(--trigonum-muted)] hover:border-[var(--trigonum-blue)]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <div className="relative py-1">
          <ProgressBar value={progress} tone="green" />
          <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2">
            {MILESTONES.map((m) => (
              <span
                key={m}
                className={`absolute size-3 -translate-x-1/2 rounded-full border-2 border-[var(--trigonum-surface)] ${
                  progress >= m ? 'bg-[var(--trigonum-success)]' : 'bg-[var(--trigonum-border)]'
                }`}
                style={{ left: `${m}%` }}
              />
            ))}
          </div>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs text-[var(--trigonum-muted)]">
          <span>
            <AnimatedNumber value={progress} format={(v) => v.toFixed(1)} duration={400} /> % пути пройдено
          </span>
          <span>
            осталось <AnimatedNumber value={remaining} format={(v) => formatCurrency(v)} duration={400} />
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[var(--trigonum-bg)] p-3">
          <p className="text-[11px] text-[var(--trigonum-muted)]">Достижение цели</p>
          <p className="text-sm font-bold text-[var(--trigonum-ink)]">≈ {formatEta(eta)}</p>
        </div>
        <div className="rounded-xl bg-[var(--trigonum-bg)] p-3">
          <p className="text-[11px] text-[var(--trigonum-muted)]">Доход в год сейчас</p>
          <p className="text-sm font-bold text-[var(--trigonum-success)]">+{formatCurrency(annualIncome)}</p>
        </div>
      </div>

      {monthsSaved > 0 && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-[color-mix(in_srgb,var(--trigonum-warning)_10%,white)] p-3 text-xs text-[#92650c]">
          <Lightbulb size={14} className="mt-0.5 shrink-0" />
          Переведите {formatCurrency(capitalTotals.available)} из Available в Earn — цель приблизится примерно на {monthsSaved} мес.
        </p>
      )}

      <div className="mt-3 rounded-xl border border-[var(--trigonum-border)] p-3">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--trigonum-text)]">
            <Rocket size={13} className="text-[var(--trigonum-blue)]" /> Хочу уложиться за {targetYears} {targetYears === 1 ? 'год' : targetYears < 5 ? 'года' : 'лет'}
          </p>
        </div>
        <input
          type="range"
          min={1}
          max={15}
          step={1}
          value={targetYears}
          onChange={(e) => setTargetYears(Number(e.target.value))}
          className="w-full accent-[var(--trigonum-blue)]"
          aria-label="Срок достижения цели"
        />
        <p className="mt-2 text-xs text-[var(--trigonum-muted)]">
          {requiredMonthly <= 1 ? (
            <>Органического роста уже достаточно — доплачивать не нужно</>
          ) : (
            <>
              Нужно докладывать ещё <b className="text-[var(--trigonum-ink)]">{formatCurrency(requiredMonthly, true)}</b> в месяц сверх текущей
              доходности
            </>
          )}
        </p>
      </div>
    </Card>
  )
}
