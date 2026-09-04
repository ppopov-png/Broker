import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type ChartPoint = {
  time: number
  value: number
}

type EventMarketChartProps = {
  symbol: string
  tone?: 'up' | 'down'
  seed?: string
  height?: number
  interval?: string
  limit?: number
  eventStart?: number
  eventEnd?: number
}

const BYBIT_ENDPOINT = 'https://api.bybit.com/v5/market/kline'
const cache = new Map<string, Promise<ChartPoint[]>>()

function fallback(seedValue: string, up: boolean, points: number): ChartPoint[] {
  let seed = 0
  for (let index = 0; index < seedValue.length; index += 1) {
    seed = (seed * 31 + seedValue.charCodeAt(index)) % 9_973
  }

  const random = () => {
    seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648
    return seed / 2_147_483_648
  }

  const now = Math.floor(Date.now() / 1000)
  const start = now - points * 3_600
  let value = 100

  return Array.from({ length: points }, (_, index) => {
    value = Math.max(40, value + (up ? 0.22 : -0.2) + (random() - 0.5) * 2.6)
    return {
      time: start + index * 3_600,
      value: Number(value.toFixed(2)),
    }
  })
}

function loadBybit(symbol: string, interval: string, limit: number) {
  const key = `${symbol}|${interval}|${limit}`
  const cached = cache.get(key)
  if (cached) return cached

  const request = fetch(
    `${BYBIT_ENDPOINT}?category=spot&symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${limit}`,
  )
    .then((response) => {
      if (!response.ok) throw new Error(`Bybit ${response.status}`)
      return response.json()
    })
    .then((payload) => {
      const list = payload?.result?.list
      if (!Array.isArray(list) || list.length === 0) throw new Error('Bybit returned no data')

      return list
        .map((row: unknown[]) => ({
          time: Math.floor(Number(row[0]) / 1000),
          value: Number(row[4]),
        }))
        .filter((point: ChartPoint) => Number.isFinite(point.time) && Number.isFinite(point.value))
        .sort((a: ChartPoint, b: ChartPoint) => a.time - b.time)
    })

  cache.set(key, request)
  request.catch(() => cache.delete(key))
  return request
}

function formatTime(value: number) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value * 1000))
}

export function EventMarketChart({
  symbol,
  tone = 'up',
  seed = symbol,
  height = 280,
  interval = '60',
  limit = 200,
  eventStart,
  eventEnd,
}: EventMarketChartProps) {
  const [points, setPoints] = useState<ChartPoint[]>(() => fallback(seed, tone !== 'down', Math.min(limit, 200)))
  const [live, setLive] = useState(false)

  useEffect(() => {
    let active = true
    setLive(false)
    setPoints(fallback(seed, tone !== 'down', Math.min(limit, 200)))

    loadBybit(symbol, interval, limit)
      .then((data) => {
        if (!active) return
        setPoints(data)
        setLive(true)
      })
      .catch(() => {
        if (!active) return
        setLive(false)
      })

    return () => {
      active = false
    }
  }, [interval, limit, seed, symbol, tone])

  const domain = useMemo(() => {
    if (!points.length) return ['auto', 'auto'] as const
    const values = points.map((point) => point.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const pad = Math.max((max - min) * 0.18, max * 0.004)
    return [min - pad, max + pad] as const
  }, [points])

  const line = tone === 'down' ? '#e5484d' : '#5a5ac4'
  const fill = tone === 'down' ? '#fdecec' : '#eeeef8'

  return (
    <div className="relative w-full" style={{ height }}>
      <span className={`absolute right-2 top-1 z-10 text-[10px] font-bold uppercase tracking-[0.06em] ${live ? 'text-[#71719b]' : 'text-[#b3383c]'}`}>
        {live ? `Bybit · ${symbol}` : `${symbol} · локальные данные`}
      </span>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 24, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`event-area-${seed.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={line} stopOpacity={0.25} />
              <stop offset="100%" stopColor={line} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#f0f0f7" />
          <XAxis
            dataKey="time"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(value) => new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short' }).format(new Date(Number(value) * 1000))}
            tick={{ fill: '#71719b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            minTickGap={28}
          />
          <YAxis
            domain={domain}
            orientation="right"
            tick={{ fill: '#71719b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          {eventStart && eventEnd ? (
            <ReferenceArea x1={eventStart} x2={eventEnd} fill="#5a5ac4" fillOpacity={0.1} strokeOpacity={0} />
          ) : null}
          <Tooltip
            cursor={{ stroke: '#b0b0c8', strokeDasharray: '3 3' }}
            labelFormatter={(value) => formatTime(Number(value))}
            formatter={(value) => [Number(value).toLocaleString('en-US', { maximumFractionDigits: symbol === 'ETHBTC' ? 5 : 2 }), symbol]}
            contentStyle={{ border: '1px solid #e4e4f0', borderRadius: 10, fontSize: 12, boxShadow: '0 10px 28px rgb(8 27 58 / 10%)' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={line}
            strokeWidth={2}
            fill={`url(#event-area-${seed.replace(/[^a-zA-Z0-9]/g, '')})`}
            isAnimationActive={false}
            activeDot={{ r: 3, fill: line, stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      {!live ? <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/40 to-transparent" style={{ color: fill }} /> : null}
    </div>
  )
}
