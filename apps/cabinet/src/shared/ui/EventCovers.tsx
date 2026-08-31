import { useId } from 'react'

const wrapProps = {
  width: '100%',
  height: '100%',
  viewBox: '0 0 400 200',
  preserveAspectRatio: 'xMidYMid slice',
} as const

function CryptoRecoveryCover() {
  const id = useId()
  return (
    <svg {...wrapProps} aria-hidden>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="400" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#04140f" />
          <stop offset="1" stopColor="#0c3b28" />
        </linearGradient>
        <radialGradient id={`${id}-ring`} cx="0.72" cy="0.42" r="0.55">
          <stop stopColor="#34e2a8" stopOpacity="0.9" />
          <stop offset="1" stopColor="#34e2a8" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-blur`}>
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <rect width="400" height="200" fill={`url(#${id}-bg)`} />
      <circle cx="288" cy="84" r="70" fill={`url(#${id}-ring)`} filter={`url(#${id}-blur)`} />
      {[26, 42, 58, 74].map((r) => (
        <circle key={r} cx="288" cy="84" r={r} fill="none" stroke="#4ade80" strokeOpacity={0.55 - r / 200} strokeWidth="1.5" />
      ))}
      <circle cx="288" cy="84" r="10" fill="#a7f3d0" filter={`url(#${id}-blur)`} />
      {[
        [40, 150],
        [70, 40],
        [130, 170],
        [200, 30],
        [330, 160],
        [360, 60],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.6" fill="#86efac" opacity="0.6" />
      ))}
    </svg>
  )
}

function AiInfrastructureCover() {
  const id = useId()
  const nodes = [
    [40, 150],
    [95, 100],
    [70, 45],
    [150, 70],
    [180, 140],
    [240, 40],
    [255, 110],
    [310, 60],
    [340, 130],
    [370, 30],
  ]
  const links: [number, number][] = [
    [0, 1],
    [1, 2],
    [1, 3],
    [3, 4],
    [3, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [7, 9],
  ]
  return (
    <svg {...wrapProps} aria-hidden>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="400" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#070d24" />
          <stop offset="1" stopColor="#142a5c" />
        </linearGradient>
        <filter id={`${id}-blur`}>
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <rect width="400" height="200" fill={`url(#${id}-bg)`} />
      {links.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke="#60a5fa"
          strokeOpacity="0.35"
          strokeWidth="1"
        />
      ))}
      {nodes.map(([cx, cy], i) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={i % 3 === 0 ? 5 : 2.5} fill="#93c5fd" opacity={i % 3 === 0 ? 0.95 : 0.6} />
      ))}
      <circle cx="255" cy="110" r="26" fill="#3b82f6" opacity="0.35" filter={`url(#${id}-blur)`} />
      <circle cx="95" cy="100" r="20" fill="#22d3ee" opacity="0.3" filter={`url(#${id}-blur)`} />
    </svg>
  )
}

function EmergingMarketsCover() {
  const id = useId()
  const bars = [18, 30, 22, 40, 34, 52, 44, 60, 50, 70, 58, 78]
  return (
    <svg {...wrapProps} aria-hidden>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="400" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2b1204" />
          <stop offset="1" stopColor="#c2650f" />
        </linearGradient>
        <filter id={`${id}-blur`}>
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      <rect width="400" height="200" fill={`url(#${id}-bg)`} />
      <circle cx="330" cy="46" r="34" fill="#fdba74" opacity="0.55" filter={`url(#${id}-blur)`} />
      {bars.map((h, i) => (
        <rect
          key={i}
          x={16 + i * 32}
          y={200 - h}
          width="18"
          height={h}
          rx="2"
          fill="#7c2d12"
          opacity={0.45 + (i / bars.length) * 0.35}
        />
      ))}
      <polyline
        points={bars.map((h, i) => `${16 + i * 32 + 9},${200 - h - 10}`).join(' ')}
        fill="none"
        stroke="#fed7aa"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  )
}

function MacroRotationCover() {
  const id = useId()
  return (
    <svg {...wrapProps} aria-hidden>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="400" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0f172a" />
          <stop offset="1" stopColor="#1f2937" />
        </linearGradient>
        <filter id={`${id}-blur`}>
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <rect width="400" height="200" fill={`url(#${id}-bg)`} />
      <circle cx="150" cy="100" r="18" fill="#94a3b8" opacity="0.5" filter={`url(#${id}-blur)`} />
      {[36, 58, 80].map((r) => (
        <ellipse key={r} cx="150" cy="100" rx={r} ry={r * 0.55} fill="none" stroke="#cbd5e1" strokeOpacity={0.5 - r / 260} strokeWidth="1.2" strokeDasharray="3 4" />
      ))}
      {[
        [150 + 80, 100],
        [150 - 58 * 0.7, 100 - 58 * 0.55 * 0.7],
        [150 + 36 * 0.3, 100 + 36 * 0.55],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" fill="#e2e8f0" />
      ))}
    </svg>
  )
}

const registry = {
  crypto: CryptoRecoveryCover,
  ai: AiInfrastructureCover,
  emerging: EmergingMarketsCover,
  macro: MacroRotationCover,
} as const

export type EventCoverKind = keyof typeof registry

export function EventCover({ kind, className = '' }: { kind: EventCoverKind; className?: string }) {
  const Cover = registry[kind]
  return (
    <div className={`overflow-hidden ${className}`}>
      <Cover />
    </div>
  )
}
