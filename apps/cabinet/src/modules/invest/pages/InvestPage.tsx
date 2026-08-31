import { ArrowRight, Boxes, Calendar1, Coins, Layers, ShieldAlert, Sparkles, TrendingUp, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../../shared/lib/format'
import { capitalTotals, earnProduct, positions, strategies } from '../../../shared/mock/data'
import type { StrategyProduct } from '../../../shared/mock/types'
import { Card } from '../../../shared/ui/Card'
import { IconTile } from '../../../shared/ui/IconTile'
import { Modal } from '../../../shared/ui/Modal'
import { Pill } from '../../../shared/ui/Pill'
import { StatCard } from '../../../shared/ui/StatCard'
import { OutlineButton, PrimaryButton } from '../../../shared/ui/buttons'

const freeBalance = 12_000

function AmountForm({ minAmount, cta, onDone }: { minAmount: number; cta: string; onDone: () => void }) {
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="rounded-xl bg-[color-mix(in_srgb,var(--trigonum-success)_10%,white)] p-4 text-sm font-medium text-[var(--trigonum-success)]">
        Заявка на инвестирование принята. Средства будут распределены в течение нескольких минут.
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
        <span className="mb-1 block font-medium text-[var(--trigonum-text)]">Сумма инвестирования</span>
        <input required type="number" min={minAmount} placeholder={`от ${formatCurrency(minAmount)}`} className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm" />
      </label>
      <p className="text-xs text-[var(--trigonum-muted)]">Минимальная сумма — {formatCurrency(minAmount)}. Средства спишутся с доступного баланса.</p>
      <PrimaryButton type="submit" className="mt-1 w-full">
        {cta}
      </PrimaryButton>
    </form>
  )
}

function riskTone(risk: StrategyProduct['risk']) {
  return risk === 'High' ? 'danger' : risk === 'Moderate' ? 'warning' : 'success'
}

export function InvestPage() {
  const [earnOpen, setEarnOpen] = useState(false)
  const [activeStrategy, setActiveStrategy] = useState<StrategyProduct | null>(null)

  return (
    <div className="pb-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--trigonum-ink)]">Инвестировать</h1>
        <p className="mt-1 text-sm text-[var(--trigonum-muted)]">Выберите подходящий способ приумножить капитал</p>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Доступно для инвестирования" value={formatCurrency(capitalTotals.available)} icon={<Wallet size={17} />} iconTone="green" />
        <StatCard label="Свободный баланс" value={`${formatCurrency(freeBalance)} USDT`} icon={<Coins size={17} />} iconTone="blue" />
        <StatCard label="Активные продукты" value={String(positions.length)} icon={<Boxes size={17} />} iconTone="violet" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
        <Card title="EARN — капитал работает, пока вы ждёте">
          <div className="flex items-start gap-3">
            <IconTile icon={<TrendingUp size={20} />} tone="green" size={48} />
            <div>
              <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{earnProduct.title}</p>
              <p className="text-xs text-[var(--trigonum-muted)]">{earnProduct.description}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Pill tone="success">~7% годовых</Pill>
            {earnProduct.tags.map((tag) => (
              <Pill key={tag} tone="info">
                {tag}
              </Pill>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-[var(--trigonum-bg)] px-4 py-3">
            <div>
              <p className="text-xs text-[var(--trigonum-muted)]">Ожидаемая доходность</p>
              <p className="text-sm font-bold text-[var(--trigonum-ink)]">{earnProduct.expectedYield} годовых</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--trigonum-muted)]">Минимальная сумма</p>
              <p className="text-sm font-bold text-[var(--trigonum-ink)]">{formatCurrency(earnProduct.minAmount)}</p>
            </div>
          </div>
          <PrimaryButton className="mt-4 w-full" onClick={() => setEarnOpen(true)}>
            Инвестировать
          </PrimaryButton>
        </Card>

        <Card title="STRATEGIES — управляемые стратегии Trigonum">
          <div className="flex flex-col gap-4">
            {strategies.map((s) => (
              <div key={s.id} className="rounded-xl border border-[var(--trigonum-border)] p-4">
                <div className="flex items-center gap-2">
                  <IconTile icon={<Layers size={16} />} tone="violet" size={32} />
                  <div>
                    <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{s.name}</p>
                    <p className="text-xs text-[var(--trigonum-muted)]">{s.tagline}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-[var(--trigonum-muted)]">Целевая доходность</p>
                <p className="text-base font-bold text-[var(--trigonum-violet)]">{s.targetRange} годовых</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-[var(--trigonum-muted)]">
                  <span className="flex items-center gap-1">
                    <Calendar1 size={13} /> {s.horizon}
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldAlert size={13} /> Риск: {s.risk === 'High' ? 'Высокий' : 'Умеренный'}
                  </span>
                </div>
                <OutlineButton className="mt-3 w-full border-[var(--trigonum-violet)] text-[var(--trigonum-violet)]" onClick={() => setActiveStrategy(s)}>
                  Выбрать стратегию
                </OutlineButton>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--trigonum-muted)]">
            <span className="flex items-center gap-1">
              <ShieldAlert size={13} /> Профессиональное управление
            </span>
            <span className="flex items-center gap-1">
              <Layers size={13} /> Диверсификация
            </span>
          </div>
        </Card>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[var(--trigonum-radius-lg)] border border-[var(--trigonum-border)] bg-[color-mix(in_srgb,var(--trigonum-green)_6%,white)] px-5 py-4">
        <div className="flex items-center gap-3">
          <IconTile icon={<Sparkles size={18} />} tone="green" size={40} />
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-[var(--trigonum-ink)]">
              EVENTS — рыночные возможности <Pill tone="success">BETA</Pill>
            </p>
            <p className="text-xs text-[var(--trigonum-muted)]">Events появляются не всегда. Актуальные возможности доступны во вкладке Events. Сейчас доступно: 1 event</p>
          </div>
        </div>
        <Link to="/events">
          <OutlineButton className="border-[var(--trigonum-success)] text-[var(--trigonum-success)]">
            Перейти в Events <ArrowRight size={16} />
          </OutlineButton>
        </Link>
      </div>

      <Modal open={earnOpen} onClose={() => setEarnOpen(false)} title="Инвестировать в Earn" subtitle={earnProduct.title}>
        <AmountForm minAmount={earnProduct.minAmount} cta="Инвестировать" onDone={() => setEarnOpen(false)} />
      </Modal>

      <Modal open={!!activeStrategy} onClose={() => setActiveStrategy(null)} title={activeStrategy?.name ?? ''} subtitle={activeStrategy?.tagline}>
        {activeStrategy && (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              <Pill tone="violet">{activeStrategy.targetRange} годовых</Pill>
              <Pill tone="info">{activeStrategy.horizon}</Pill>
              <Pill tone={riskTone(activeStrategy.risk)}>Риск: {activeStrategy.risk === 'High' ? 'Высокий' : 'Умеренный'}</Pill>
            </div>
            <AmountForm minAmount={1_000} cta="Выбрать стратегию" onDone={() => setActiveStrategy(null)} />
          </>
        )}
      </Modal>
    </div>
  )
}
