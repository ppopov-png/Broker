import { useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency } from '../lib/format'
import { capitalSeries } from '../mock/data'
import { SegmentedControl } from './SegmentedControl'

const ranges = [
  { value: '1m', label: '1M', points: 2 },
  { value: '3m', label: '3M', points: 4 },
  { value: '6m', label: '6M', points: 7 },
  { value: 'ytd', label: 'YTD', points: 5 },
  { value: 'all', label: 'ALL', points: capitalSeries.length },
] as const

type RangeValue = (typeof ranges)[number]['value']

export function CapitalChart() {
  const [range, setRange] = useState<RangeValue>('all')
  const points = ranges.find((r) => r.value === range)?.points ?? capitalSeries.length
  const data = useMemo(() => capitalSeries.slice(-points), [points])

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[15px] font-semibold text-[var(--trigonum-ink)]">Динамика капитала</p>
        <SegmentedControl value={range} onChange={setRange} options={ranges.map(({ value, label }) => ({ value, label }))} />
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -12, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="capital-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--trigonum-blue)" stopOpacity={0.22} />
                <stop offset="100%" stopColor="var(--trigonum-blue)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--trigonum-border)" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--trigonum-muted)' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--trigonum-muted)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${Math.round(v / 1000)}K`}
              width={48}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{ borderRadius: 12, border: '1px solid var(--trigonum-border)', fontSize: 12 }}
            />
            <Area type="monotone" dataKey="value" stroke="var(--trigonum-blue)" strokeWidth={2.5} fill="url(#capital-fill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
