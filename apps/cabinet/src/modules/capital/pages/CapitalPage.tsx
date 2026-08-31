import { ArrowDownCircle, ArrowRightLeft, ArrowUpCircle, PieChart as PieChartIcon, ShieldCheck, TrendingUp, Wallet, WalletCards } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatPercent, formatShare, formatSigned } from '../../../shared/lib/format'
import { capitalBreakdown, capitalTotals, positions } from '../../../shared/mock/data'
import { Card } from '../../../shared/ui/Card'
import { CapitalChart } from '../../../shared/ui/CapitalChart'
import { StatCard } from '../../../shared/ui/StatCard'
import { OutlineButton, PrimaryButton } from '../../../shared/ui/buttons'
import { Modal } from '../../../shared/ui/Modal'

const movement = [
  { label: 'Пополнения', amount: 50_000, icon: ArrowDownCircle, tone: 'text-[var(--trigonum-success)]' },
  { label: 'Выводы', amount: -15_000, icon: ArrowUpCircle, tone: 'text-[var(--trigonum-ink)]' },
  { label: 'Инвестиции в продукты', amount: -95_000, icon: TrendingUp, tone: 'text-[var(--trigonum-ink)]' },
  { label: 'Возвраты из продуктов', amount: 28_000, icon: ArrowDownCircle, tone: 'text-[var(--trigonum-success)]' },
  { label: 'Чистый поток', amount: capitalTotals.netFlow, icon: ArrowRightLeft, tone: 'text-[var(--trigonum-success)]', strong: true },
]

const incomeByDirection = [
  { label: 'Earn', value: 101_950, profit: 1_950, yieldLabel: '≈7% p.a.', tone: 'blue' as const },
  { label: 'Strategies', value: 81_286, profit: 6_286, yieldLabel: '+8.4%', tone: 'violet' as const },
  { label: 'Events', value: 25_184, profit: 184, yieldLabel: '+0.7%', tone: 'green' as const },
]

export function CapitalPage() {
  const [transferOpen, setTransferOpen] = useState(false)

  return (
    <div className="pb-10">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--trigonum-ink)]">Капитал</h1>
          <p className="mt-1 text-sm text-[var(--trigonum-muted)]">Полная картина вашего капитала, доходности и движения средств</p>
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Общий капитал" value={formatCurrency(capitalTotals.total)} hint="USD" icon={<Wallet size={17} />} iconTone="blue" />
        <StatCard
          label="В работе"
          value={formatCurrency(capitalTotals.inWork)}
          hint={`${formatShare((capitalTotals.inWork / capitalTotals.total) * 100)} от капитала`}
          icon={<PieChartIcon size={17} />}
          iconTone="violet"
        />
        <StatCard
          label="Доступно"
          value={formatCurrency(capitalTotals.available)}
          hint={`${formatShare((capitalTotals.available / capitalTotals.total) * 100)} от капитала`}
          icon={<WalletCards size={17} />}
          iconTone="green"
        />
        <StatCard
          label="Чистая прибыль YTD"
          value={formatSigned(capitalTotals.ytdProfit)}
          hint={formatPercent(capitalTotals.ytdProfitPct)}
          hintTone="success"
          icon={<TrendingUp size={17} />}
          iconTone="green"
        />
        <StatCard
          label="Чистый поток"
          value={formatSigned(capitalTotals.netFlow)}
          hint={formatPercent(capitalTotals.netFlowPct)}
          hintTone="success"
          icon={<ArrowRightLeft size={17} />}
          iconTone="blue"
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-start">
        <Card className="lg:col-span-2">
          <CapitalChart />
        </Card>

        <Card title="Структура капитала">
          <div className="relative mx-auto h-44 w-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={capitalBreakdown} dataKey="amount" nameKey="label" innerRadius={54} outerRadius={78} paddingAngle={2} stroke="none">
                  {capitalBreakdown.map((slice) => (
                    <Cell key={slice.key} fill={slice.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="text-base font-bold text-[var(--trigonum-ink)]">{formatCurrency(capitalTotals.total)}</p>
                <p className="text-[11px] text-[var(--trigonum-muted)]">Общий капитал</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {capitalBreakdown.map((slice) => (
              <div key={slice.key} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-[var(--trigonum-text)]">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
                  {slice.label}
                </span>
                <span className="text-[var(--trigonum-muted)]">
                  {formatShare(slice.share)} · {formatCurrency(slice.amount)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
        <Card title="Движение капитала">
          <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
            {movement.map((m) => (
              <div key={m.label} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <span className={`text-sm ${m.strong ? 'font-semibold text-[var(--trigonum-ink)]' : 'text-[var(--trigonum-text)]'}`}>{m.label}</span>
                <span className={`text-sm font-semibold ${m.tone}`}>{formatSigned(m.amount)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Доход по направлениям">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {incomeByDirection.map((d) => (
              <div key={d.label} className="rounded-xl border border-[var(--trigonum-border)] p-3">
                <p className="text-xs font-semibold text-[var(--trigonum-muted)]">{d.label}</p>
                <p className="mt-1 text-sm font-bold text-[var(--trigonum-ink)]">{formatCurrency(d.value)}</p>
                <p className="text-xs font-semibold text-[var(--trigonum-success)]">{formatSigned(d.profit)}</p>
                <p className="text-xs text-[var(--trigonum-muted)]">{d.yieldLabel}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card
        className="mt-5"
        title="Активные позиции"
        action={
          <Link to="/invest" className="text-xs font-semibold text-[var(--trigonum-blue)]">
            Все позиции →
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-[var(--trigonum-border)] text-left text-xs uppercase tracking-wide text-[var(--trigonum-muted)]">
                <th className="py-2 font-semibold">Продукт</th>
                <th className="py-2 font-semibold">Инвестировано</th>
                <th className="py-2 font-semibold">Прибыль</th>
                <th className="py-2 text-right font-semibold">Доходность</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => (
                <tr key={p.id} className="border-b border-[var(--trigonum-border)] last:border-0">
                  <td className="py-3 font-medium text-[var(--trigonum-ink)]">{p.product}</td>
                  <td className="py-3 text-[var(--trigonum-text)]">{formatCurrency(p.invested)}</td>
                  <td className="py-3 font-semibold text-[var(--trigonum-success)]">{formatSigned(p.profit)}</td>
                  <td className="py-3 text-right text-[var(--trigonum-text)]">{p.yieldLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[var(--trigonum-radius-lg)] border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] px-5 py-4">
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
