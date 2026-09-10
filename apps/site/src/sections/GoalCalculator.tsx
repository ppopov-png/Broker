import { Flag, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { landingContent } from '../content/landingOfficial'
import { GOAL_PLANS, PLATFORM_SUMMARY, planForGoal, STRATEGIES_SUMMARY } from '../content/products'
import { onboardingUrl } from '../lib/appLinks'
import { usd, pct } from '../lib/format'

const PRESETS = [50_000, 100_000, 250_000, 1_000_000]
const YEAR_SECONDS = 365 * 24 * 60 * 60
const APPLICATION_SECONDS = 25 * 60

function money(value: number): string {
  const cents = Math.round(value * 100)
  return `${usd(Math.trunc(cents / 100))}.${String(Math.abs(cents) % 100).padStart(2, '0')}`
}

const bestPlan = GOAL_PLANS.reduce((best, plan) => (plan.netAnnual > best.netAnnual ? plan : best))

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

      <GoalTicker goal={goal} />
      <p className="goal-note">{calculator.note}</p>
    </div>
  )
}

function GoalTicker({ goal }: { goal: number }) {
  const { language } = useI18n()
  const { calculator, final } = landingContent(language)
  const startedAt = useRef(Date.now())
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setElapsed((Date.now() - startedAt.current) / 1000), 100)
    return () => window.clearInterval(id)
  }, [])

  const platformPerSecond = (PLATFORM_SUMMARY.aum * (STRATEGIES_SUMMARY.weightedNet / 100)) / YEAR_SECONDS
  const goalPerSecond = (goal * (bestPlan.netAnnual / 100)) / YEAR_SECONDS
  const text = calculator.tickerText.replace('{goal}', usd(goal)).replace('{plan}', bestPlan.name).replace('{app}', money(goalPerSecond * APPLICATION_SECONDS)).replace('{month}', money((goal * (bestPlan.netAnnual / 100)) / 12))

  return (
    <div className="goal-ticker">
      <Sparkles size={16} />
      <div><span className="goal-ticker-label">{calculator.tickerTitle}</span><strong>+{money(platformPerSecond * elapsed)}</strong><p><span className="goal-ticker-caption">{calculator.tickerCaption}</span>{text}</p></div>
      <a className="button button-primary" href={onboardingUrl()}>{final.cta}</a>
    </div>
  )
}
