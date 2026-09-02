import { useId } from 'react'

export function Sparkline({
  data,
  color = 'var(--trigonum-success)',
  width = 120,
  height = 32,
  area = false,
}: {
  data: number[]
  color?: string
  width?: number
  height?: number
  area?: boolean
}) {
  const id = useId()
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const step = width / (data.length - 1)
  const coords = data.map((value, i) => ({
    x: i * step,
    y: height - ((value - min) / span) * (height - 4) - 2,
  }))
  const points = coords.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden>
      {area && (
        <>
          <defs>
            <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <polygon points={`0,${height} ${points.join(' ')} ${width},${height}`} fill={`url(#${id}-fill)`} />
        </>
      )}
      <polyline
        className="trg-draw"
        pathLength={1}
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle className="trg-pop" style={{ animationDelay: '0.9s' }} cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="2.5" fill={color} />
    </svg>
  )
}
