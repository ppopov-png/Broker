import { ArrowLeft, Check, Lock, Minus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../../shared/lib/format'
import {
  buildScoreHistory,
  calculateInvestorStatus,
  INVESTOR_TIERS,
  SCORE_RULES,
  TIER_PERK_MATRIX,
  tierAccent,
  tierHero,
  tierInk,
  tierMetallic,
  tierAchievedAt,
  tierPerks,
  tierSummary,
} from '../../../shared/lib/InvestorStatus'
import { useInvestorStatus } from '../../../shared/lib/useInvestorStatus'
import { Card } from '../../../shared/ui/Card'
import { Reveal } from '../../../shared/ui/Reveal'
import { Sparkline } from '../../../shared/ui/Sparkline'
import { Switch } from '../../../shared/ui/Switch'

export function LevelsPage() {
  const { status, input } = useInvestorStatus()

  // Калькулятор: что нужно сделать для следующего уровня.
  const [extraCapital, setExtraCapital] = useState(0)
  const [longTerm, setLongTerm] = useState(true)
  const [extraEvents, setExtraEvents] = useState(0)
  const [extraReferrals, setExtraReferrals] = useState(0)

  const simulated = calculateInvestorStatus({
    ...input,
    qualifiedCapital: input.qualifiedCapital + extraCapital,
    longTermCapital: input.longTermCapital + (longTerm ? extraCapital : 0),
    activeEvents: input.activeEvents + extraEvents,
    qualifiedReferrals: input.qualifiedReferrals + extraReferrals,
  })

  const untouched = extraCapital === 0 && extraEvents === 0 && extraReferrals === 0
  const gainedTier = simulated.tier !== status.tier
  const maxRulePoints = Math.max(...SCORE_RULES.map((rule) => status.breakdown[rule.key]), 1)

  const accent = tierAccent[status.tier]
  const ink = tierInk[status.tier]
  const onMetal = status.tier === 'Black' ? '#f4f4f5' : '#1b1d22'
  const onMetalMuted = status.tier === 'Black' ? 'rgb(255 255 255 / 50%)' : 'rgb(0 0 0 / 48%)'

  return (
    <div className="pb-10">
      <Link
        to="/profile"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--trigonum-blue)]"
      >
        <ArrowLeft size={14} />
        Профиль
      </Link>

      <Reveal>
        <section
          className="relative overflow-hidden rounded-[24px] p-7 text-white"
          style={{ background: tierHero[status.tier] }}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-36 size-[240px] sm:size-[420px] rounded-full"
            style={{ background: `radial-gradient(circle, ${accent}26 0%, transparent 68%)` }}
          />

          <div className="relative grid gap-7 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:items-center">
            <div className="rounded-[20px] p-px" style={{ background: tierMetallic[status.tier] }}>
              <div className="rounded-[19px] bg-black/8 px-5 py-6">
                <p className="text-[10px] font-bold uppercase tracking-[.18em]" style={{ color: onMetalMuted }}>
                  Ваш уровень
                </p>
                <p
                  className="mt-2 text-[40px] font-semibold leading-none tracking-[-.04em]"
                  style={{ color: onMetal }}
                >
                  {status.tier}
                </p>
                <p className="mt-2 text-sm font-semibold tabular-nums" style={{ color: onMetalMuted }}>
                  {status.score} pts
                </p>
              </div>
            </div>

            <div>
              <h1 className="text-[26px] font-medium leading-tight tracking-[-.03em]">
                {status.nextTier ? (
                  <>
                    До {status.nextTier} — <span className="tabular-nums">{status.pointsToNext} pts</span>
                  </>
                ) : (
                  'Максимальный уровень'
                )}
              </h1>

              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/12">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${status.progress}%`, background: tierMetallic[status.tier] }}
                />
              </div>

              <p className="mt-4 max-w-[52ch] text-sm text-white/50">{tierSummary[status.tier]}</p>

              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-white/35">Баллы за 12 месяцев</p>
                <div className="mt-2 h-10">
                  <Sparkline data={buildScoreHistory(status.score)} color={accent} height={40} area />
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal delay={40}>
        <Card className="mt-5" title="История статуса">
          <ol className="grid gap-4 sm:grid-cols-3">
            {INVESTOR_TIERS.filter((tier) => tierAchievedAt[tier.tier]).map((tier, index, list) => (
              <li key={tier.tier} className="relative">
                {index < list.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-[5px] hidden h-px w-full bg-[var(--trigonum-border)] sm:block"
                  />
                )}
                <span
                  className="relative block size-2.5 rounded-full ring-4 ring-[var(--trigonum-surface)]"
                  style={{ background: tierMetallic[tier.tier] }}
                />
                <p className="mt-3 text-sm font-semibold text-[var(--trigonum-ink)]">{tier.tier}</p>
                <p className="text-xs tabular-nums text-[var(--trigonum-muted)]">{tierAchievedAt[tier.tier]}</p>
              </li>
            ))}
          </ol>
          {status.nextTier && (
            <p className="mt-5 border-t border-[var(--trigonum-border)] pt-4 text-sm text-[var(--trigonum-muted)]">
              Следующая отметка — <b className="text-[var(--trigonum-ink)]">{status.nextTier}</b>, осталось{' '}
              <b className="tabular-nums text-[var(--trigonum-ink)]">{status.pointsToNext} pts</b>
            </p>
          )}
        </Card>
      </Reveal>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
        <Reveal delay={60}>
          <Card title="Из чего сложились баллы">
            <div className="flex flex-col gap-3.5">
              {SCORE_RULES.map((rule) => {
                const points = status.breakdown[rule.key]
                return (
                  <div key={rule.key}>
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{rule.label}</p>
                      <p className="shrink-0 text-sm font-bold tabular-nums" style={{ color: ink }}>
                        +{points}
                      </p>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--trigonum-bg)]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(points / maxRulePoints) * 100}%`, background: ink }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-[var(--trigonum-muted)]">
                      <b className="font-semibold text-[var(--trigonum-text)]">{rule.describe(input)}</b> · {rule.rule}
                    </p>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[var(--trigonum-border)] pt-3">
              <span className="text-sm font-semibold text-[var(--trigonum-ink)]">Итого</span>
              <span className="text-lg font-bold tabular-nums text-[var(--trigonum-ink)]">{status.score}</span>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={120}>
          <Card title="Калькулятор">
            <div className="flex flex-col gap-5">
              <Slider
                label="Капитал в продуктах"
                value={extraCapital}
                onChange={setExtraCapital}
                max={250_000}
                step={5_000}
                display={`+${formatCurrency(extraCapital)}`}
                accent={ink}
              />

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-[var(--trigonum-text)]">На 12 месяцев</span>
                <Switch checked={longTerm} onChange={setLongTerm} label="Долгосрочное размещение" tone="ink" />
              </div>

              <Slider
                label="Активные Events"
                value={extraEvents}
                onChange={setExtraEvents}
                max={10}
                step={1}
                display={`+${extraEvents}`}
                accent={ink}
              />

              <Slider
                label="Рекомендации"
                value={extraReferrals}
                onChange={setExtraReferrals}
                max={10}
                step={1}
                display={`+${extraReferrals}`}
                accent={ink}
              />
            </div>

            <div
              className="mt-5 rounded-xl p-4"
              style={{ background: gainedTier ? tierMetallic[simulated.tier] : 'var(--trigonum-bg)' }}
            >
              <div className="flex items-end justify-between gap-3">
                <p
                  className="text-xl font-bold"
                  style={{ color: gainedTier ? (simulated.tier === 'Black' ? '#f4f4f5' : '#1b1d22') : 'var(--trigonum-ink)' }}
                >
                  {simulated.tier}
                </p>
                <p
                  className="text-sm font-semibold tabular-nums"
                  style={{
                    color: gainedTier
                      ? simulated.tier === 'Black'
                        ? 'rgb(255 255 255 / 55%)'
                        : 'rgb(0 0 0 / 50%)'
                      : 'var(--trigonum-muted)',
                  }}
                >
                  {simulated.score} pts{!untouched && ` (+${simulated.score - status.score})`}
                </p>
              </div>
            </div>
          </Card>
        </Reveal>
      </div>

      <Reveal delay={180}>
        <Card className="mt-5" title="Привилегии по уровням" padded={false}>
          <div className="overflow-x-auto p-5 pt-0">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-[210px] px-3 pb-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">
                    Привилегия
                  </th>
                  {INVESTOR_TIERS.map(({ tier, threshold }) => (
                    <th key={tier} className="px-3 pb-3 text-left">
                      <span
                        className={`inline-flex flex-col rounded-lg px-2.5 py-1.5 ${
                          tier === status.tier ? 'ring-2 ring-[var(--trigonum-ink)]' : ''
                        }`}
                        style={{ background: tierMetallic[tier] }}
                      >
                        <b className={`text-xs font-bold ${tier === 'Black' ? 'text-white' : 'text-[#1b1d22]'}`}>
                          {tier}
                        </b>
                        <span
                          className={`text-[10px] tabular-nums ${tier === 'Black' ? 'text-white/55' : 'text-black/45'}`}
                        >
                          от {threshold}
                        </span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIER_PERK_MATRIX.map((row) => (
                  <tr key={row.label} className="border-t border-[var(--trigonum-border)]">
                    <th scope="row" className="px-3 py-3 text-left text-sm font-semibold text-[var(--trigonum-ink)]">
                      {row.label}
                    </th>
                    {INVESTOR_TIERS.map(({ tier }) => {
                      const value = row.values[tier]
                      const own = tier === status.tier
                      return (
                        <td
                          key={tier}
                          className={`px-3 py-3 text-xs ${own ? 'font-semibold text-[var(--trigonum-ink)]' : 'text-[var(--trigonum-muted)]'}`}
                          style={own ? { background: 'color-mix(in srgb, var(--trigonum-ink) 4%, white)' } : undefined}
                        >
                          {value ?? <Minus size={13} className="text-[var(--trigonum-muted)] opacity-45" />}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Reveal>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
        <Reveal delay={240}>
          <Card title={`Доступно на ${status.tier}`}>
            <ul className="flex flex-col gap-2">
              {tierPerks[status.tier].map((perk) => (
                <li key={perk} className="flex items-start gap-2.5 text-sm text-[var(--trigonum-text)]">
                  <Check size={15} className="mt-0.5 shrink-0" style={{ color: ink }} />
                  {perk}
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>

        {status.nextTier && (
          <Reveal delay={300}>
            <Card
              title={`Откроется на ${status.nextTier}`}
              action={
                <Link to="/invest" className="text-xs font-semibold text-[var(--trigonum-blue)]">
                  Разместить капитал →
                </Link>
              }
            >
              <ul className="flex flex-col gap-2">
                {tierPerks[status.nextTier].map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5 text-sm text-[var(--trigonum-muted)]">
                    <Lock size={14} className="mt-0.5 shrink-0" />
                    {perk}
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        )}
      </div>
    </div>
  )
}

function Slider({
  label,
  value,
  onChange,
  max,
  step,
  display,
  accent,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  max: number
  step: number
  display: string
  accent: string
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-[var(--trigonum-text)]">{label}</span>
        <b className="text-sm font-bold tabular-nums text-[var(--trigonum-ink)]">{display}</b>
      </span>
      <input
        type="range"
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 w-full"
        style={{ accentColor: accent }}
      />
    </label>
  )
}
