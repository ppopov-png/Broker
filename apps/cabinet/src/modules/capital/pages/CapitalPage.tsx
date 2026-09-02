import { ArrowDownCircle, ArrowRightLeft, ArrowUpCircle, CalendarDays, Gauge, Percent, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency, formatPercent, formatSigned } from '../../../shared/lib/format'
import { capitalBreakdown, capitalTotals } from '../../../shared/mock/data'
import { Card } from '../../../shared/ui/Card'
import { Modal } from '../../../shared/ui/Modal'
import { Reveal } from '../../../shared/ui/Reveal'
import { StatCard } from '../../../shared/ui/StatCard'
import { OutlineButton, PrimaryButton } from '../../../shared/ui/buttons'
import { AccrualHeatmap } from '../components/AccrualHeatmap'
import { AchievementsGrid } from '../components/AchievementsGrid'
import { AllocationLab } from '../components/AllocationLab'
import { CapitalGoalCard } from '../components/CapitalGoalCard'
import { InvestorLevelCard } from '../components/InvestorLevelCard'
import { LiveEarnings } from '../components/LiveEarnings'
import { PositionsBreakdown } from '../components/PositionsBreakdown'
import { earningSources, investingSince, totalEarned } from '../model/capital-data'

const movement = [
  { label: 'Пополнения', amount: 50_000 },
  { label: 'Выводы', amount: -15_000 },
  { label: 'Инвестиции в продукты', amount: -95_000 },
  { label: 'Возвраты из продуктов', amount: 28_000 },
  { label: 'Чистый поток', amount: capitalTotals.netFlow, strong: true },
]

const investedTotal = earningSources.reduce((sum, s) => sum + s.principal, 0)
const weightedApy = earningSources.reduce((sum, s) => sum + s.principal * s.apy, 0) / investedTotal
const daysInvesting = Math.round((Date.now() - new Date(investingSince).getTime()) / 86_400_000)

export function CapitalPage() {
  const [transferOpen, setTransferOpen] = useState(false)

  return (
    <div className="flex flex-col gap-5 pb-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--trigonum-ink)]">Капитал</h1>
          <p className="mt-1 text-sm text-[var(--trigonum-muted)]">Где работает ваш капитал, сколько он приносит и что открывается дальше</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/deposit">
            <PrimaryButton>
              <ArrowDownCircle size={16} /> Пополнить
            </PrimaryButton>
          </Link>
          <Link to="/withdraw">
            <OutlineButton>
              <ArrowUpCircle size={16} /> Вывести
            </OutlineButton>
          </Link>
          <OutlineButton onClick={() => setTransferOpen(true)}>
            <ArrowRightLeft size={16} /> Перевести капитал
          </OutlineButton>
        </div>
      </header>

      <Reveal>
        <LiveEarnings />
      </Reveal>

      <Reveal delay={40} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Средневзвешенная доходность"
          value={`${weightedApy.toFixed(1)}% годовых`}
          hint={`по ${formatCurrency(investedTotal)} в работе`}
          icon={<Percent size={17} />}
          iconTone="blue"
        />
        <StatCard
          label="Чистая прибыль YTD"
          value={formatSigned(capitalTotals.ytdProfit)}
          hint={formatPercent(capitalTotals.ytdProfitPct)}
          hintTone="success"
          icon={<Gauge size={17} />}
          iconTone="green"
        />
        <StatCard
          label="Чистый поток"
          value={formatSigned(capitalTotals.netFlow)}
          hint={formatPercent(capitalTotals.netFlowPct)}
          hintTone="success"
          icon={<ArrowRightLeft size={17} />}
          iconTone="violet"
        />
        <StatCard
          label="В инвестициях"
          value={`${daysInvesting} дней`}
          hint={`заработано ${formatCurrency(totalEarned)}`}
          icon={<CalendarDays size={17} />}
          iconTone="amber"
        />
      </Reveal>

      <Reveal delay={80} className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
        <InvestorLevelCard />
        <CapitalGoalCard />
      </Reveal>

      <Reveal delay={140}>
        <AchievementsGrid />
      </Reveal>

      <Reveal delay={200}>
        <AllocationLab />
      </Reveal>

      <Reveal delay={260} className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr] lg:items-start">
        <AccrualHeatmap />
        <Card title="Движение капитала" subtitle="Все переводы за текущий год">
          <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
            {movement.map((m) => (
              <div key={m.label} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <span className={`text-sm ${m.strong ? 'font-semibold text-[var(--trigonum-ink)]' : 'text-[var(--trigonum-text)]'}`}>{m.label}</span>
                <span className={`text-sm font-semibold ${m.amount >= 0 ? 'text-[var(--trigonum-success)]' : 'text-[var(--trigonum-ink)]'}`}>
                  {formatSigned(m.amount)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </Reveal>

      <Reveal delay={320}>
        <PositionsBreakdown />
      </Reveal>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--trigonum-radius-lg)] border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] px-5 py-4">
        <p className="flex items-center gap-2 text-sm text-[var(--trigonum-text)]">
          <ShieldCheck size={18} className="text-[var(--trigonum-success)]" />
          Ваш капитал защищён. Средства хранятся на отдельных счетах у наших кастодианов и не используются в операционной деятельности.
        </p>
        <Link to="/security" className="shrink-0 text-sm font-semibold text-[var(--trigonum-blue)]">
          Подробнее о защите →
        </Link>
      </div>

      <Modal open={transferOpen} onClose={() => setTransferOpen(false)} title="Перевести капитал" subtitle="Переместите средства между продуктами без вывода">
        <TransferForm onDone={() => setTransferOpen(false)} />
      </Modal>
    </div>
  )
}

function TransferForm({ onDone }: { onDone: () => void }) {
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="rounded-xl bg-[color-mix(in_srgb,var(--trigonum-success)_10%,white)] p-4 text-sm font-medium text-[var(--trigonum-success)]">
        Перевод создан. Средства будут перераспределены в течение нескольких минут.
      </div>
    )
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        setSubmitted(true)
        setTimeout(onDone, 1400)
      }}
    >
      <label className="text-sm">
        <span className="mb-1 block font-medium text-[var(--trigonum-text)]">Откуда</span>
        <select className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm" defaultValue="available">
          {capitalBreakdown.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label} · {formatCurrency(c.amount)}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium text-[var(--trigonum-text)]">Куда</span>
        <select className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm" defaultValue="earn">
          {capitalBreakdown.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium text-[var(--trigonum-text)]">Сумма</span>
        <input required type="number" min={1} placeholder="0" className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm" />
      </label>
      <PrimaryButton type="submit" className="mt-2 w-full">
        Перевести
      </PrimaryButton>
    </form>
  )
}
