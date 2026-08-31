import { CheckCircle2, ChevronRight, Timer, Users, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { formatCurrency } from '../../../shared/lib/format'
import { useCountdown } from '../../../shared/lib/useCountdown'
import { capitalTotals, events } from '../../../shared/mock/data'
import type { EventItem, EventStatus, RiskLevel } from '../../../shared/mock/types'
import { Card } from '../../../shared/ui/Card'
import { EventCover } from '../../../shared/ui/EventCovers'
import { Modal } from '../../../shared/ui/Modal'
import { Pill } from '../../../shared/ui/Pill'
import { ProgressBar } from '../../../shared/ui/ProgressBar'
import { OutlineButton, PrimaryButton } from '../../../shared/ui/buttons'

const statusFilters: { value: EventStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Открытые' },
  { value: 'upcoming', label: 'Скоро' },
  { value: 'closed', label: 'Закрытые' },
]

const riskFilters: { value: RiskLevel | 'all'; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'Low', label: 'Low' },
  { value: 'Moderate', label: 'Moderate' },
  { value: 'High', label: 'High' },
]

function riskTone(risk: RiskLevel) {
  return risk === 'High' ? 'danger' : risk === 'Moderate' ? 'warning' : 'success'
}

function Countdown({ target }: { target: string }) {
  const remaining = useCountdown(target)
  if (remaining <= 0) return <span>завершено</span>

  const totalSeconds = Math.floor(remaining / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (days > 0) return <span>{days}д {hours}ч {minutes}м</span>
  return (
    <span>
      {hours}ч {minutes}м {seconds}с
    </span>
  )
}

function EventDetails({ event }: { event: EventItem }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[var(--trigonum-text)]">{event.description}</p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-[var(--trigonum-muted)]">Target</p>
          <p className="font-semibold text-[var(--trigonum-ink)]">{event.targetRange}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--trigonum-muted)]">Horizon</p>
          <p className="font-semibold text-[var(--trigonum-ink)]">{event.horizon}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--trigonum-muted)]">Risk</p>
          <Pill tone={riskTone(event.risk)}>{event.risk}</Pill>
        </div>
        <div>
          <p className="text-xs text-[var(--trigonum-muted)]">Мин. сумма</p>
          <p className="font-semibold text-[var(--trigonum-ink)]">{formatCurrency(event.minAmount)}</p>
        </div>
      </div>
      {event.status === 'closed' ? (
        <div className="rounded-lg bg-[var(--trigonum-bg)] px-4 py-3 text-sm text-[var(--trigonum-text)]">
          Событие закрыто {event.closedDate}. Фактический результат: <b className="text-[var(--trigonum-success)]">{event.result}</b>. Участников: {event.participants}.
        </div>
      ) : (
        <InvestForm minAmount={event.minAmount} disabled={event.status === 'upcoming'} />
      )}
    </div>
  )
}

function InvestForm({ minAmount, disabled }: { minAmount: number; disabled?: boolean }) {
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="rounded-xl bg-[color-mix(in_srgb,var(--trigonum-success)_10%,white)] p-4 text-sm font-medium text-[var(--trigonum-success)]">
        Заявка на участие в событии принята.
      </div>
    )
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        setSubmitted(true)
      }}
    >
      <label className="text-sm">
        <span className="mb-1 block font-medium text-[var(--trigonum-text)]">Сумма участия</span>
        <input required type="number" min={minAmount} placeholder={`от ${formatCurrency(minAmount)}`} className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm" />
      </label>
      <PrimaryButton type="submit" disabled={disabled} className="w-full">
        {disabled ? 'Окно входа ещё не открыто' : 'Участвовать в событии'}
      </PrimaryButton>
    </form>
  )
}

export function EventsPage() {
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all')
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all')
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null)

  const filtered = useMemo(
    () =>
      events.filter(
        (e) => (statusFilter === 'all' || e.status === statusFilter) && (riskFilter === 'all' || e.risk === riskFilter),
      ),
    [statusFilter, riskFilter],
  )

  const active = filtered.filter((e) => e.status === 'active')
  const upcoming = filtered.filter((e) => e.status === 'upcoming')
  const closed = filtered.filter((e) => e.status === 'closed')

  return (
    <div className="pb-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--trigonum-ink)]">Events</h1>
        <p className="mt-1 text-sm text-[var(--trigonum-muted)]">
          Событийные инвестиционные возможности, созданные на основе анализа AI-системы TAIS. Доступны только в ограниченные периоды.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr] lg:items-start">
        <div className="flex flex-col gap-5">
          {active.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">
                <span className="size-2 rounded-full bg-[var(--trigonum-success)]" /> Активные Event
              </p>
              {active.map((event) => (
                <Card key={event.id} className="overflow-hidden !p-0">
                  <EventCover kind={event.cover} className="h-36 w-full" />
                  <div className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-bold text-[var(--trigonum-ink)]">{event.title}</p>
                        <p className="mt-1 text-xs text-[var(--trigonum-muted)]">{event.windowLabel}</p>
                        <p className="flex items-center gap-1.5 text-sm font-semibold text-[var(--trigonum-success)]">
                          <Timer size={14} /> {event.windowTarget && <Countdown target={event.windowTarget} />}
                        </p>
                      </div>
                      <Pill tone="success">Открыт для входа</Pill>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div>
                        <p className="text-xs text-[var(--trigonum-muted)]">Target</p>
                        <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{event.targetRange}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--trigonum-muted)]">Horizon</p>
                        <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{event.horizon}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--trigonum-muted)]">Risk</p>
                        <Pill tone={riskTone(event.risk)}>{event.risk}</Pill>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--trigonum-muted)]">Мин. сумма</p>
                        <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{formatCurrency(event.minAmount)}</p>
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-[var(--trigonum-text)]">{event.description}</p>

                    {event.progress && (
                      <div className="mt-4">
                        <p className="mb-1 text-xs text-[var(--trigonum-muted)]">
                          Доступно для входа: {formatCurrency(event.progress.current)} / {formatCurrency(event.progress.total)}
                        </p>
                        <ProgressBar value={(event.progress.current / event.progress.total) * 100} tone="green" />
                      </div>
                    )}

                    <PrimaryButton className="mt-4" onClick={() => setActiveEvent(event)}>
                      Рассмотреть Event <ChevronRight size={16} />
                    </PrimaryButton>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {upcoming.length > 0 && (
            <div className="flex flex-col gap-3">
              {upcoming.map((event) => (
                <Card key={event.id} className="flex flex-wrap items-center gap-4 !p-4">
                  <EventCover kind={event.cover} className="h-16 w-24 shrink-0 rounded-lg" />
                  <div className="min-w-[180px] flex-1">
                    <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{event.title}</p>
                    <p className="text-xs text-[var(--trigonum-muted)]">
                      {event.windowLabel} · {event.windowTarget && <Countdown target={event.windowTarget} />}
                    </p>
                  </div>
                  <div className="text-xs text-[var(--trigonum-muted)]">
                    Target <span className="font-semibold text-[var(--trigonum-ink)]">{event.targetRange}</span>
                  </div>
                  <div className="text-xs text-[var(--trigonum-muted)]">
                    Horizon <span className="font-semibold text-[var(--trigonum-ink)]">{event.horizon}</span>
                  </div>
                  <Pill tone={riskTone(event.risk)}>{event.risk}</Pill>
                  <OutlineButton onClick={() => setActiveEvent(event)}>Подробнее</OutlineButton>
                </Card>
              ))}
            </div>
          )}

          {closed.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">Недавно закрытые Event</p>
              <div className="flex flex-col gap-3">
                {closed.map((event) => (
                  <Card key={event.id} className="flex flex-wrap items-center gap-4 !p-4">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg grayscale">
                      <EventCover kind={event.cover} className="size-12" />
                      <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full bg-[var(--trigonum-success)] text-white ring-2 ring-[var(--trigonum-surface)]">
                        <CheckCircle2 size={12} />
                      </span>
                    </div>
                    <div className="min-w-[160px] flex-1">
                      <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{event.title}</p>
                      <p className="text-xs text-[var(--trigonum-muted)]">Закрыт {event.closedDate}</p>
                    </div>
                    <div className="text-xs text-[var(--trigonum-muted)]">
                      Target <span className="font-semibold text-[var(--trigonum-ink)]">{event.targetRange}</span>
                    </div>
                    <div className="text-xs text-[var(--trigonum-muted)]">
                      Результат <span className="font-semibold text-[var(--trigonum-success)]">{event.result}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[var(--trigonum-muted)]">
                      <Users size={13} /> {event.participants}
                    </div>
                    <OutlineButton onClick={() => setActiveEvent(event)}>Подробнее</OutlineButton>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <Card className="text-center text-sm text-[var(--trigonum-muted)]">По выбранным фильтрам событий не найдено.</Card>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">Доступно для инвестирования</p>
            <p className="mt-2 flex items-center gap-2 text-xl font-bold text-[var(--trigonum-ink)]">
              <Wallet size={18} className="text-[var(--trigonum-green)]" /> {formatCurrency(capitalTotals.available)}
            </p>
          </Card>

          <Card title="Фильтры" action={<button type="button" onClick={() => { setStatusFilter('all'); setRiskFilter('all') }} className="text-xs font-semibold text-[var(--trigonum-blue)]">Сбросить</button>}>
            <p className="mb-2 text-xs font-semibold text-[var(--trigonum-muted)]">Статус</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {statusFilters.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setStatusFilter(f.value)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                    statusFilter === f.value
                      ? 'border-[var(--trigonum-blue)] bg-[color-mix(in_srgb,var(--trigonum-blue)_8%,white)] text-[var(--trigonum-blue)]'
                      : 'border-[var(--trigonum-border)] text-[var(--trigonum-text)]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <p className="mb-2 text-xs font-semibold text-[var(--trigonum-muted)]">Уровень риска</p>
            <div className="flex flex-wrap gap-2">
              {riskFilters.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setRiskFilter(f.value)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                    riskFilter === f.value
                      ? 'border-[var(--trigonum-blue)] bg-[color-mix(in_srgb,var(--trigonum-blue)_8%,white)] text-[var(--trigonum-blue)]'
                      : 'border-[var(--trigonum-border)] text-[var(--trigonum-text)]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </Card>

          <Card title="Что такое Event?">
            <p className="text-sm text-[var(--trigonum-text)]">
              Events — это редкие инвестиционные возможности, которые появляются только при анализе рыночной неэффективности, выявленной AI-системой TAIS.
            </p>
          </Card>

          <Card title="Как это работает?">
            <ol className="flex flex-col gap-2 text-sm text-[var(--trigonum-text)]">
              {['TAIS анализирует рынок 24/7', 'Выявляет аномалию или неэффективность', 'Формируется Event с чёткими параметрами', 'Открывается окно входа на ограниченное время', 'Капитал работает на достижение целевого результата'].map(
                (step, i) => (
                  <li key={step} className="flex items-start gap-2">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--trigonum-success)_14%,white)] text-[10px] font-bold text-[var(--trigonum-success)]">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ),
              )}
            </ol>
          </Card>
        </div>
      </div>

      <Modal open={!!activeEvent} onClose={() => setActiveEvent(null)} title={activeEvent?.title ?? ''}>
        {activeEvent && <EventDetails event={activeEvent} />}
      </Modal>
    </div>
  )
}
