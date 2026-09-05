import {
  ArrowRight,
  CalendarClock,
  ChevronRight,
  Flame,
  Landmark,
  Sparkles,
  TrendingUp,
  WalletCards,
  Zap,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useBrokerAccount } from '../../../shared/lib/AccountContext'
import { formatCurrency, formatPercent, formatSigned } from '../../../shared/lib/format'
import {
  calculateInvestorStatus,
  tierAccent,
  tierHero,
  tierInk,
  tierMetallic,
  tierSoft,
} from '../../../shared/lib/InvestorStatus'
import { useCountdown } from '../../../shared/lib/useCountdown'
import { useInvestorStatus } from '../../../shared/lib/useInvestorStatus'
import { capitalTotals, notifications, positions, transactions } from '../../../shared/mock/data'
import { Card } from '../../../shared/ui/Card'
import { CapitalChart } from '../../../shared/ui/CapitalChart'
import { Pill } from '../../../shared/ui/Pill'
import { Reveal } from '../../../shared/ui/Reveal'
import { TransactionRow } from '../../../shared/ui/TransactionRow'
import { EARN_APY, nextEventWindow, upcomingPayouts } from '../model/dashboard-data'

const SECONDS_PER_YEAR = 365 * 24 * 60 * 60

export function DashboardPage() {
  const { activeAccount } = useBrokerAccount()
  const { status, input, invested, lockedEvents, available, totalCapital } = useInvestorStatus()

  const accent = tierAccent[status.tier]
  const ink = tierInk[status.tier]
  const soft = tierSoft[status.tier]
  const onMetal = status.tier === 'Black' ? '#f4f4f5' : '#1b1d22'
  const onMetalMuted = status.tier === 'Black' ? 'rgb(255 255 255 / 50%)' : 'rgb(0 0 0 / 48%)'

  const payouts = useMemo(() => upcomingPayouts(), [invested])
  const event = useMemo(() => nextEventWindow(), [])
  const remaining = useCountdown(event.closesAt)

  // Сколько капитал приносит в секунду при текущем распределении.
  const perSecond = useMemo(() => {
    const annual = positions.reduce((sum, position) => sum + position.invested * (position.yieldPct / 100), 0)
    return annual / SECONDS_PER_YEAR
  }, [])

  return (
    <div className="pb-10">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-[var(--trigonum-ink)]">Добрый день, {activeAccount.shortName}</h1>
        <p className="mt-1 text-sm text-[var(--trigonum-muted)]">
          Капитал работает — свободных средств {formatCurrency(available)}
        </p>
      </header>

      {/* Шапка: капитал, живой счёт и уровень */}
      <Reveal>
        <section className="relative overflow-hidden rounded-[24px] text-white" style={{ background: tierHero[status.tier] }}>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-40 size-[460px] rounded-full"
            style={{ background: `radial-gradient(circle, ${accent}26 0%, transparent 68%)` }}
          />

          <div className="relative grid gap-8 p-7 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)] xl:items-center">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/35">Общий капитал</p>
              <p className="mt-2 text-[44px] font-medium leading-none tracking-[-.04em] tabular-nums">
                {formatCurrency(totalCapital)}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                <span className="text-sm font-semibold text-[#7ee2b8] tabular-nums">
                  {formatSigned(capitalTotals.ytdProfit)} · {formatPercent(capitalTotals.ytdProfitPct)} за 30 дней
                </span>
                <LiveTicker perSecond={perSecond} />
              </div>
            </div>

            <Link
              to="/levels"
              className="group block rounded-[20px] p-px transition hover:brightness-110"
              style={{ background: tierMetallic[status.tier] }}
            >
              <div className="rounded-[19px] bg-black/8 p-5 backdrop-blur-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.18em]" style={{ color: onMetalMuted }}>
                      Уровень
                    </p>
                    <p className="mt-1.5 text-[28px] font-semibold leading-none tracking-[-.03em]" style={{ color: onMetal }}>
                      {status.tier}
                    </p>
                  </div>
                  <ChevronRight size={17} className="mt-1 transition group-hover:translate-x-0.5" style={{ color: onMetalMuted }} />
                </div>

                <div
                  className="mt-5 h-1.5 overflow-hidden rounded-full"
                  style={{ background: status.tier === 'Black' ? 'rgb(255 255 255 / 18%)' : 'rgb(0 0 0 / 14%)' }}
                >
                  <div className="h-full rounded-full" style={{ width: `${status.progress}%`, background: onMetal }} />
                </div>

                <div
                  className="mt-2.5 flex items-center justify-between gap-3 text-[11px] font-semibold tabular-nums"
                  style={{ color: onMetalMuted }}
                >
                  <span>{status.score} pts</span>
                  <span>{status.nextTier ? `${status.pointsToNext} до ${status.nextTier}` : 'Максимум'}</span>
                </div>
              </div>
            </Link>
          </div>

          <div className="relative grid grid-cols-2 gap-px border-t border-white/8 bg-white/8 lg:grid-cols-4">
            <HeroMetric label="Свободно" value={formatCurrency(available)} accent={available > 0 ? accent : undefined} />
            <HeroMetric label="В продуктах" value={formatCurrency(invested)} />
            <HeroMetric label="В Events" value={formatCurrency(lockedEvents)} />
            <HeroMetric
              label="Ближайшая выплата"
              value={payouts.length ? formatCurrency(payouts[0].amount) : '—'}
            />
          </div>
        </section>
      </Reveal>

      {/* Быстрые действия */}
      <Reveal delay={40}>
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <QuickAction to="/deposit" icon={<WalletCards size={17} />} label="Пополнить" soft={soft} ink={ink} />
          <QuickAction to="/invest" icon={<TrendingUp size={17} />} label="Инвестировать" soft={soft} ink={ink} />
          <QuickAction to="/events" icon={<CalendarClock size={17} />} label="Events" soft={soft} ink={ink} />
          <QuickAction to="/withdraw" icon={<Landmark size={17} />} label="Вывести" soft={soft} ink={ink} />
        </div>
      </Reveal>

      {available > 0 && (
        <Reveal delay={80}>
          <IdleCapitalCard available={available} status={status} input={input} ink={ink} soft={soft} />
        </Reveal>
      )}

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <Reveal delay={120}>
            <Card>
              <CapitalChart />
            </Card>
          </Reveal>

          <Reveal delay={180}>
            <Card
              title="Последние операции"
              action={
                <Link to="/transactions" className="text-xs font-semibold text-[var(--trigonum-blue)]">
                  Все операции →
                </Link>
              }
            >
              <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
                {transactions.slice(0, 4).map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </div>
            </Card>
          </Reveal>
          <Reveal delay={240}>
            <Card
              title="Активные продукты"
              action={
                <Link to="/capital" className="text-xs font-semibold text-[var(--trigonum-blue)]">
                  Все продукты →
                </Link>
              }
            >
              <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
                {positions.slice(0, 3).map((position) => (
                  <div key={position.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--trigonum-ink)]">{position.product}</p>
                      <p className="text-xs tabular-nums text-[var(--trigonum-muted)]">{formatCurrency(position.invested)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold tabular-nums text-[var(--trigonum-success)]">
                        {formatSigned(position.profit)}
                      </p>
                      <p className="text-xs text-[var(--trigonum-muted)]">{position.yieldLabel}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
        </div>

        <div className="flex flex-col gap-5">
          {/* Окно Event закрывается — единственное место с обратным отсчётом */}
          <Reveal delay={120}>
            <Card
              title="Окно Event закрывается"
              action={<Pill tone="warning" icon={<Flame size={13} />}>{event.filled}% набрано</Pill>}
            >
              <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{event.title}</p>
              <p className="mt-0.5 text-xs text-[var(--trigonum-muted)]">
                {event.category} · от {formatCurrency(event.minimum)}
              </p>

              <div className="mt-3 rounded-xl p-3.5" style={{ background: soft }}>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">
                  До закрытия входа
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums" style={{ color: ink }}>
                  {formatCountdown(remaining)}
                </p>
              </div>

              <div className="mt-3 flex items-baseline justify-between gap-3">
                <span className="text-xs text-[var(--trigonum-muted)]">Целевая доходность</span>
                <span className="text-sm font-bold text-[var(--trigonum-ink)]">
                  {event.targetLow}–{event.targetHigh}%
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--trigonum-bg)]">
                <div className="h-full rounded-full" style={{ width: `${event.filled}%`, background: ink }} />
              </div>

              <Link
                to="/events"
                className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-[var(--trigonum-ink)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-125"
              >
                Перейти к Events
                <ArrowRight size={15} />
              </Link>
            </Card>
          </Reveal>

          <Reveal delay={180}>
            <Card
              title="Ближайшие начисления"
              action={
                <Link to="/invest" className="text-xs font-semibold text-[var(--trigonum-blue)]">
                  Контракты →
                </Link>
              }
            >
              {payouts.length === 0 ? (
                <p className="text-sm text-[var(--trigonum-muted)]">Активных контрактов нет.</p>
              ) : (
                <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
                  {payouts.slice(0, 4).map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--trigonum-ink)]">{payout.product}</p>
                        <p className="text-xs tabular-nums text-[var(--trigonum-muted)]">
                          {payout.date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' })}
                          {payout.reinvest && ' · реинвест'}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-bold tabular-nums text-[var(--trigonum-success)]">
                        +{formatCurrency(payout.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Reveal>

          <Reveal delay={300}>
            <Card title="Центр действий">
              <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
                {notifications.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{item.title}</p>
                      <p className="mt-0.5 text-xs text-[var(--trigonum-muted)]">{item.description}</p>
                    </div>
                    {item.cta && (
                      <Link
                        to="/events"
                        className="shrink-0 rounded-md border border-[var(--trigonum-border)] px-2.5 py-1 text-xs font-semibold text-[var(--trigonum-ink)] transition hover:border-[var(--trigonum-ink)]"
                      >
                        {item.cta}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  )
}

/**
 * Свободные деньги — единственное место, где капитал ничего не приносит.
 * Показываем цену простоя и то, что размещение даёт по баллам уровня.
 */
function IdleCapitalCard({
  available,
  status,
  input,
  ink,
  soft,
}: {
  available: number
  status: ReturnType<typeof calculateInvestorStatus>
  input: Parameters<typeof calculateInvestorStatus>[0]
  ink: string
  soft: string
}) {
  const step = 1_000
  const [amount, setAmount] = useState(Math.floor(available / step) * step)
  const [longTerm, setLongTerm] = useState(true)

  const perYear = (amount * EARN_APY) / 100
  const perMonth = perYear / 12
  const idleCostPerMonth = (available * EARN_APY) / 100 / 12

  // Тот же расчёт, что и на странице уровней — без второй формулы.
  const projected = calculateInvestorStatus({
    ...input,
    qualifiedCapital: input.qualifiedCapital + amount,
    longTermCapital: input.longTermCapital + (longTerm ? amount : 0),
  })
  const gained = projected.tier !== status.tier

  return (
    <section
      className="mt-5 rounded-[var(--trigonum-radius-lg)] border p-5 shadow-[var(--trigonum-shadow-card)]"
      style={{ background: soft, borderColor: `color-mix(in srgb, ${ink} 25%, white)` }}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:items-center">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em]" style={{ color: ink }}>
            <Zap size={14} />
            Деньги не работают
          </p>
          <p className="mt-2 text-xl font-bold text-[var(--trigonum-ink)]">
            {formatCurrency(available)} лежат на счёте
          </p>
          <p className="mt-1 text-sm text-[var(--trigonum-muted)]">
            Это <b className="text-[var(--trigonum-ink)]">{formatCurrency(idleCostPerMonth)}</b> в месяц мимо кассы при
            ставке Earn {EARN_APY}%
          </p>

          <label className="mt-5 block">
            <span className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-[var(--trigonum-text)]">Разместить</span>
              <b className="text-sm font-bold tabular-nums text-[var(--trigonum-ink)]">{formatCurrency(amount)}</b>
            </span>
            <input
              type="range"
              min={0}
              max={Math.floor(available / step) * step}
              step={step}
              value={amount}
              onChange={(current) => setAmount(Number(current.target.value))}
              className="mt-2 w-full"
              style={{ accentColor: ink }}
            />
          </label>

          <button
            type="button"
            onClick={() => setLongTerm((value) => !value)}
            className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-[var(--trigonum-muted)] transition hover:text-[var(--trigonum-ink)]"
            aria-pressed={longTerm}
          >
            <span
              className={`grid size-4 place-items-center rounded border ${longTerm ? 'border-transparent' : 'border-[var(--trigonum-border)]'}`}
              style={longTerm ? { background: ink } : undefined}
            >
              {longTerm && <span className="size-1.5 rounded-[2px] bg-white" />}
            </span>
            На 12 месяцев — вдвое больше баллов
          </button>
        </div>

        <div className="rounded-xl border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] p-4">
          <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
            <Outcome label="В месяц" value={`+${formatCurrency(perMonth)}`} tone="success" />
            <Outcome label="За год" value={`+${formatCurrency(perYear)}`} tone="success" />
            <Outcome
              label="Баллы уровня"
              value={`+${projected.score - status.score}`}
              tone={gained ? 'accent' : 'normal'}
              accent={ink}
            />
          </div>

          {gained ? (
            <p className="mt-3 rounded-lg px-3 py-2.5 text-xs font-semibold" style={{ background: soft, color: ink }}>
              Этого хватает для уровня {projected.tier}
            </p>
          ) : (
            projected.nextTier && (
              <p className="mt-3 text-xs text-[var(--trigonum-muted)]">
                До {projected.nextTier} останется{' '}
                <b className="tabular-nums text-[var(--trigonum-ink)]">{projected.pointsToNext} pts</b>
              </p>
            )
          )}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              to="/invest"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-[var(--trigonum-ink)] px-3 py-2.5 text-sm font-semibold text-white transition hover:brightness-125"
            >
              В Earn
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/capital"
              className="flex items-center justify-center rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm font-semibold text-[var(--trigonum-ink)] transition hover:border-[var(--trigonum-ink)]"
            >
              Подобрать
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function Outcome({
  label,
  value,
  tone,
  accent,
}: {
  label: string
  value: string
  tone: 'success' | 'accent' | 'normal'
  accent?: string
}) {
  const color =
    tone === 'success' ? 'var(--trigonum-success)' : tone === 'accent' ? accent : 'var(--trigonum-ink)'
  return (
    <div className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
      <span className="text-xs text-[var(--trigonum-muted)]">{label}</span>
      <span className="text-sm font-bold tabular-nums" style={{ color }}>
        {value}
      </span>
    </div>
  )
}

/** Прибавка к капиталу в реальном времени — видно, что деньги работают прямо сейчас. */
function LiveTicker({ perSecond }: { perSecond: number }) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const startedAt = Date.now()
    const id = window.setInterval(() => setSeconds((Date.now() - startedAt) / 1000), 100)
    return () => window.clearInterval(id)
  }, [])

  const earned = perSecond * seconds
  const [whole, fraction] = earned.toFixed(4).split('.')

  return (
    <span className="inline-flex items-baseline gap-1.5 text-sm text-white/45">
      <Sparkles size={13} className="self-center" />
      за эту сессию
      <b className="font-semibold tabular-nums text-white/85">
        +${whole}.<span className="trg-glow">{fraction}</span>
      </b>
    </span>
  )
}

function HeroMetric({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="px-7 py-4" style={{ background: 'rgb(0 0 0 / 18%)' }}>
      <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-white/35">{label}</p>
      <p className="mt-1.5 text-lg font-semibold tabular-nums" style={{ color: accent ?? 'rgb(255 255 255 / 90%)' }}>
        {value}
      </p>
    </div>
  )
}

function QuickAction({
  to,
  icon,
  label,
  soft,
  ink,
}: {
  to: string
  icon: ReactNode
  label: string
  soft: string
  ink: string
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-[var(--trigonum-radius-lg)] border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] px-4 py-3.5 shadow-[var(--trigonum-shadow-card)] transition hover:-translate-y-0.5 hover:border-[var(--trigonum-ink)]"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl" style={{ background: soft, color: ink }}>
        {icon}
      </span>
      <span className="text-sm font-semibold text-[var(--trigonum-ink)]">{label}</span>
      <ChevronRight size={15} className="ml-auto shrink-0 text-[var(--trigonum-muted)]" />
    </Link>
  )
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'окно закрыто'
  const total = Math.floor(ms / 1000)
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  if (days > 0) return `${days}д ${hours}ч ${minutes}м`
  return `${hours}ч ${minutes}м ${seconds}с`
}
