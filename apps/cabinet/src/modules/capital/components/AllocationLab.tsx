import { AlertTriangle, Check, RotateCcw, Sparkles, Target } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatSigned } from '../../../shared/lib/format'
import { capitalTotals } from '../../../shared/mock/data'
import { AnimatedNumber } from '../../../shared/ui/AnimatedNumber'
import { Card } from '../../../shared/ui/Card'
import { Modal } from '../../../shared/ui/Modal'
import { SegmentedControl } from '../../../shared/ui/SegmentedControl'
import { OutlineButton, PrimaryButton } from '../../../shared/ui/buttons'
import { allocationOrder, allocationProfile, currentAllocation } from '../model/capital-data'
import {
  constraints,
  maxIncomeAtRisk,
  projectedIncome,
  rebalance,
  riskLabel,
  riskPresets,
  riskScore,
  solveAllocation,
  yearForecast,
  type Allocation,
  type RiskPresetKey,
} from '../model/allocator'
import { AllocationSummary } from './AllocationSummary'

type Mode = 'goal' | 'manual'

const baseIncome = projectedIncome(currentAllocation)

export function AllocationLab() {
  const [mode, setMode] = useState<Mode>('goal')
  const [allocation, setAllocation] = useState<Allocation>(currentAllocation)
  const [applyOpen, setApplyOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const [riskPreset, setRiskPreset] = useState<RiskPresetKey>('moderate')
  const [targetIncome, setTargetIncome] = useState(Math.round(baseIncome / 500) * 500)

  const maxRisk = riskPresets.find((p) => p.key === riskPreset)!.maxRisk
  const ceiling = useMemo(() => maxIncomeAtRisk(maxRisk), [maxRisk])
  const solution = useMemo(() => solveAllocation(targetIncome, maxRisk), [targetIncome, maxRisk])

  // В режиме подбора ползунки ведомые: их расставляет решение.
  useEffect(() => {
    if (mode === 'goal') setAllocation(solution.allocation)
  }, [mode, solution])

  const income = projectedIncome(allocation)
  const risk = riskScore(allocation)
  const { label: riskName, tone: riskTone } = riskLabel(risk)
  const delta = income - baseIncome
  const forecast = yearForecast(allocation)
  const touched = allocationOrder.some((key) => Math.abs(allocation[key] - currentAllocation[key]) > 0.5)
  const sliderMax = useMemo(() => Math.ceil(maxIncomeAtRisk(100) / 500) * 500, [])

  const pieData = allocationOrder.map((key) => ({
    key,
    label: allocationProfile[key].label,
    value: Math.max(allocation[key], 0.01),
    color: allocationProfile[key].color,
  }))

  return (
    <Card
      title="Аллокатор «что если»"
      subtitle="Задайте цель — система подберёт распределение. Или соберите его вручную"
      action={
        touched && (
          <OutlineButton
            className="px-3 py-1.5 text-xs"
            onClick={() => {
              setAllocation(currentAllocation)
              setTargetIncome(Math.round(baseIncome / 500) * 500)
            }}
          >
            <RotateCcw size={13} /> Сбросить
          </OutlineButton>
        )
      }
    >
      <div className="mb-4">
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { value: 'goal', label: 'Подобрать по цели' },
            { value: 'manual', label: 'Настроить вручную' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-5">
          {mode === 'goal' ? (
            <>
              <div>
                <div className="mb-1 flex items-end justify-between">
                  <span className="text-sm font-medium text-[var(--trigonum-text)]">Желаемый доход в год</span>
                  <span className="text-right">
                    <AnimatedNumber
                      value={targetIncome}
                      format={(v) => formatCurrency(v)}
                      duration={200}
                      className="block text-lg font-bold text-[var(--trigonum-ink)]"
                    />
                    <span className="text-xs text-[var(--trigonum-muted)]">
                      {((targetIncome / capitalTotals.total) * 100).toFixed(1)}% годовых
                    </span>
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={sliderMax}
                  step={250}
                  value={targetIncome}
                  onChange={(e) => setTargetIncome(Number(e.target.value))}
                  className="w-full accent-[var(--trigonum-blue)]"
                  aria-label="Желаемый доход в год"
                />
                <div className="mt-1 flex justify-between text-[11px] text-[var(--trigonum-muted)]">
                  <span>{formatCurrency(0)}</span>
                  <span>{formatCurrency(sliderMax)}</span>
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-sm font-medium text-[var(--trigonum-text)]">Допустимый риск</p>
                <div className="flex flex-wrap gap-2">
                  {riskPresets.map((preset) => (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => setRiskPreset(preset.key)}
                      className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                        riskPreset === preset.key
                          ? 'border-[var(--trigonum-blue)] bg-[color-mix(in_srgb,var(--trigonum-blue)_8%,white)] text-[var(--trigonum-blue)]'
                          : 'border-[var(--trigonum-border)] text-[var(--trigonum-text)] hover:border-[var(--trigonum-blue)]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className={`flex items-start gap-2 rounded-xl p-3 text-sm ${
                  solution.feasible
                    ? 'bg-[color-mix(in_srgb,var(--trigonum-success)_10%,white)] text-[var(--trigonum-success)]'
                    : 'bg-[color-mix(in_srgb,var(--trigonum-warning)_12%,white)] text-[#92650c]'
                }`}
              >
                {solution.feasible ? <Check size={16} className="mt-0.5 shrink-0" /> : <AlertTriangle size={16} className="mt-0.5 shrink-0" />}
                <span>
                  {solution.feasible ? (
                    <>Найдено распределение под цель — {formatCurrency(solution.income)} в год при риске «{riskName}»</>
                  ) : (
                    <>
                      При риске «{riskPresets.find((p) => p.key === riskPreset)!.label}» максимум {formatCurrency(ceiling)} в год.
                      Ближайшее возможное — {formatCurrency(solution.income)}: снизьте цель или повысьте допустимый риск.
                    </>
                  )}
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">Подобранное распределение</p>
                {allocationOrder.map((key) => {
                  const profile = allocationProfile[key]
                  const amount = (capitalTotals.total * allocation[key]) / 100
                  return (
                    <div key={key}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 font-medium text-[var(--trigonum-text)]">
                          <span className="size-2.5 rounded-full" style={{ backgroundColor: profile.color }} />
                          {profile.label}
                          <span className="text-xs text-[var(--trigonum-muted)]">{profile.apy}% годовых</span>
                        </span>
                        <span className="tabular-nums font-semibold text-[var(--trigonum-ink)]">
                          {allocation[key].toFixed(0)}% · {formatCurrency(amount)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--trigonum-border)]">
                        <div
                          className="h-full rounded-full transition-[width] duration-500 ease-out"
                          style={{ width: `${allocation[key]}%`, backgroundColor: profile.color }}
                        />
                      </div>
                    </div>
                  )
                })}
                <OutlineButton className="mt-1 self-start px-3 py-1.5 text-xs" onClick={() => setMode('manual')}>
                  <Target size={13} /> Докрутить вручную
                </OutlineButton>
              </div>
            </>
          ) : (
            allocationOrder.map((key) => {
              const profile = allocationProfile[key]
              const amount = (capitalTotals.total * allocation[key]) / 100
              return (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-[var(--trigonum-text)]">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: profile.color }} />
                      {profile.label}
                      <span className="text-xs text-[var(--trigonum-muted)]">{profile.apy}% годовых</span>
                    </span>
                    <span className="tabular-nums font-semibold text-[var(--trigonum-ink)]">
                      {allocation[key].toFixed(0)}% · {formatCurrency(amount)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={Math.round(allocation[key])}
                    onChange={(e) => setAllocation(rebalance(allocation, key, Number(e.target.value)))}
                    className="w-full accent-[var(--trigonum-blue)]"
                    aria-label={profile.label}
                  />
                </div>
              )
            })
          )}

          <p className="text-[11px] leading-snug text-[var(--trigonum-muted)]">
            Ограничения продукта: не более {constraints.maxEventsShare}% капитала в Events, минимум {constraints.minAvailableShare}% в Available,
            вход в Event — от {formatCurrency(constraints.minEventsAmount)}.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative mx-auto h-40 w-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="label" innerRadius={48} outerRadius={70} paddingAngle={2} stroke="none" isAnimationActive={false}>
                  {pieData.map((slice) => (
                    <Cell key={slice.key} fill={slice.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="text-sm font-bold text-[var(--trigonum-ink)]">{formatCurrency(capitalTotals.total)}</p>
                <p className="text-[11px] text-[var(--trigonum-muted)]">распределение</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[var(--trigonum-bg)] p-4">
            <p className="text-xs text-[var(--trigonum-muted)]">Прогноз дохода в год</p>
            <AnimatedNumber
              value={income}
              format={(v) => formatCurrency(v)}
              duration={350}
              className="block text-2xl font-bold text-[var(--trigonum-ink)]"
            />
            <p className={`text-xs font-semibold transition-colors ${delta >= 0 ? 'text-[var(--trigonum-success)]' : 'text-[var(--trigonum-danger)]'}`}>
              {Math.abs(delta) < 1 ? 'ставка как сейчас' : `${formatSigned(delta)} в год к текущей ставке`}
            </p>

            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-[var(--trigonum-muted)]">Риск-профиль</span>
                <span className="font-semibold transition-colors duration-300" style={{ color: riskTone }}>
                  {riskName}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--trigonum-border)]">
                <div
                  className="h-full rounded-full transition-[width,background-color] duration-300 ease-out"
                  style={{ width: `${risk}%`, backgroundColor: riskTone }}
                />
              </div>
            </div>

            <div className="mt-3 border-t border-[var(--trigonum-border)] pt-3">
              <p className="text-xs text-[var(--trigonum-muted)]">Капитал на конец года ({forecast.daysLeft} дн.)</p>
              <AnimatedNumber
                value={forecast.yearEndCapital}
                format={(v) => formatCurrency(v)}
                duration={350}
                className="block text-lg font-bold text-[var(--trigonum-success)]"
              />
            </div>
          </div>

          <PrimaryButton className="w-full" disabled={!touched} onClick={() => setApplyOpen(true)}>
            <Sparkles size={16} /> Применить распределение
          </PrimaryButton>
        </div>
      </div>

      <Modal
        open={applyOpen}
        onClose={() => {
          setApplyOpen(false)
          setConfirmed(false)
        }}
        title="Итог перераспределения"
        subtitle="Что зафиксируется и каким станет капитал"
      >
        {confirmed ? (
          <div className="rounded-xl bg-[color-mix(in_srgb,var(--trigonum-success)_10%,white)] p-4 text-sm font-medium text-[var(--trigonum-success)]">
            Заявка на перераспределение создана. Мгновенные переводы уже исполнены, выход из стратегий появится в «Транзакциях».
          </div>
        ) : (
          <AllocationSummary allocation={allocation} onConfirm={() => setConfirmed(true)} />
        )}
      </Modal>
    </Card>
  )
}
