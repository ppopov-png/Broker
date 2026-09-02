import { Flag, Lightbulb } from 'lucide-react'
import { useState } from 'react'
import { formatCurrency } from '../../../shared/lib/format'
import { capitalTotals } from '../../../shared/mock/data'
import { AnimatedNumber } from '../../../shared/ui/AnimatedNumber'
import { Card } from '../../../shared/ui/Card'
import { ProgressBar } from '../../../shared/ui/ProgressBar'
import { capitalGoalDefault, earningsPerSecond } from '../model/capital-data'

const YEAR_SECONDS = 365 * 24 * 60 * 60
const annualIncome = earningsPerSecond * YEAR_SECONDS

function formatEta(years: number): string {
  if (!Number.isFinite(years) || years <= 0) return 'цель уже достигнута'
  const wholeYears = Math.floor(years)
  const months = Math.round((years - wholeYears) * 12)
  if (wholeYears === 0) return `${Math.max(months, 1)} мес.`
  return `${wholeYears} г. ${months} мес.`
}

export function CapitalGoalCard() {
  const [goal, setGoal] = useState(capitalGoalDefault)
  const capital = capitalTotals.total
  const progress = Math.min(100, (capital / goal) * 100)
  const remaining = Math.max(0, goal - capital)

  // Сложный процент при текущей доходности портфеля, без учёта новых пополнений.
  const rate = annualIncome / capital
  const eta = Math.log(goal / capital) / Math.log(1 + rate)
  const boostedRate = (annualIncome + capitalTotals.available * 0.07) / capital
  const boostedEta = Math.log(goal / capital) / Math.log(1 + boostedRate)
  const monthsSaved = Math.max(0, Math.round((eta - boostedEta) * 12))

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

      <div className="mt-3">
        <ProgressBar value={progress} tone="green" />
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
    </Card>
  )
}
