export function Sparkline({ data, color = 'var(--trigonum-success)', width = 120, height = 32 }: { data: number[]; color?: string; width?: number; height?: number }) {
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const step = width / (data.length - 1)
  const points = data.map((value, i) => `${(i * step).toFixed(1)},${(height - ((value - min) / span) * height).toFixed(1)}`)

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="overflow-visible">
      <polyline
        className="trg-draw"
        pathLength={1}
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        className="trg-pop"
        style={{ animationDelay: '0.9s' }}
        cx={(data.length - 1) * step}
        cy={height - ((data[data.length - 1] - min) / span) * height}
        r="2.5"
        fill={color}
      />
    </svg>
  )
}
