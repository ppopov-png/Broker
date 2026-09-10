import { Flag } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { landingContent } from '../content/landingOfficial'
import { GOAL_PLANS, planForGoal } from '../content/products'
import { usd, pct } from '../lib/format'
import { LiveEarningsTicker } from '../widgets/LiveEarningsTicker'

const PRESETS = [50_000, 100_000, 250_000, 1_000_000]

export function GoalCalculator() {
  const { language } = useI18n()
  const { calculator } = landingContent(language)
  const [goal, setGoal] = useState(100_000)
  const [years, setYears] = useState(5)

  return (
    <div className="goal-calc">
      <header className="goal-calc-head">
        <div><h3><Flag size={16} /> {calculator.title}</h3><p>{calculator.subtitle}</p></div>
        <label className="goal-input">
          <span>{calculator.goalLabel}</span>
          <input type="number" min={1000} step={10_000} value={goal} onChange={(event) => setGoal(Math.max(1000, Number(event.target.value) || 0))} />
        </label>
      </header>

      <div className="goal-controls">
        <div className="goal-presets" role="group" aria-label={calculator.goalLabel}>
          {PRESETS.map((preset) => <button key={preset} type="button" className={goal === preset ? 'active' : undefined} onClick={() => setGoal(preset)}>{usd(preset)}</button>)}
        </div>
        <label className="goal-years">
          <span>{calculator.yearsLabel}: <b>{years}</b> {calculator.yearsUnit(years)}</span>
          <input type="range" min={1} max={15} step={1} value={years} onChange={(event) => setYears(Number(event.target.value))} />
        </label>
      </div>

      <div className="goal-table-wrap">
        <table className="goal-table">
          <thead><tr><th>{calculator.columns.plan}</th><th>{calculator.columns.net}</th><th>{calculator.columns.lump}</th></tr></thead>
          <tbody>
            {GOAL_PLANS.map((plan) => {
              const lump = planForGoal(plan, goal, years)
              return <tr key={plan.id}><th scope="row">{plan.name}<small>{plan.profile}</small></th><td data-label={calculator.columns.net}><b>{pct(plan.netAnnual)}</b><small>{calculator.netNote}</small></td><td data-label={calculator.columns.lump}><b>{usd(lump)}</b></td></tr>
            })}
          </tbody>
        </table>
      </div>

      <LiveEarningsTicker withCta />
      <p className="goal-note">{calculator.note}</p>
    </div>
  )
}
