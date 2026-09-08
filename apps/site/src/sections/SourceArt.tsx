/**
 * Иллюстрации к источникам дохода. Инлайновый SVG, а не картинки: четыре
 * растра весили бы больше всего остального лендинга, не масштабировались бы
 * на ретине и не перекрашивались бы вместе с темой.
 *
 * Геометрия у всех четырёх одна — одинаковый viewBox, одна толщина линии,
 * один набор классов. Иначе набор читается как коллаж из стоков.
 */

import { landingContent, type LandingContent } from '../content/landing'
import { useI18n } from '../i18n/I18nProvider'

const VB = '0 0 420 150'

type ArtText = LandingContent['how']['art']

export function SourceArt({ index }: { index: number }) {
  const { language } = useI18n()
  const art = landingContent(language).how.art
  if (index === 0) return <AlgoArt t={art.algo} />
  if (index === 1) return <TeamArt t={art.team} />
  if (index === 2) return <TaisArt t={art.tais} />
  return <LiquidityArt t={art.liquidity} />
}

function Grid() {
  return (
    <g className="art-grid">
      {[30, 60, 90, 120].map((y) => (
        <line key={y} x1={0} x2={420} y1={y} y2={y} />
      ))}
    </g>
  )
}

/* --- 1. Алгоритмическая торговля: расхождение цены между площадками -------- */

const VENUE_A = '0,96 42,88 84,92 126,74 168,64 210,56 252,64 294,48 336,38 378,44 420,30'
const VENUE_B = '0,104 42,98 84,100 126,86 168,90 210,76 252,74 294,68 336,46 378,52 420,38'

function AlgoArt({ t }: { t: ArtText['algo'] }) {
  return (
    <svg viewBox={VB} className="art" aria-hidden="true">
      <Grid />
      <polygon className="art-band" points={`${VENUE_A} 420,38 378,52 336,46 294,68 252,74 210,76 168,90 126,86 84,100 42,98 0,104`} />
      <polyline className="art-line art-muted" points={VENUE_B} />
      <polyline className="art-line" points={VENUE_A} />

      {/* Самое широкое расхождение — то, на чём зарабатывает алгоритм. */}
      <g className="art-accent-group">
        <line className="art-accent" x1={210} x2={210} y1={56} y2={76} strokeDasharray="0" />
        <circle className="art-dot" cx={210} cy={56} r={4} />
        <circle className="art-dot" cx={210} cy={76} r={4} />
        <rect className="art-chip" x={186} y={16} width={48} height={20} rx={6} />
        <text className="art-chip-text" x={210} y={30} textAnchor="middle">
          {t.spread}
        </text>
        <line className="art-accent art-thin" x1={210} x2={210} y1={36} y2={52} />
      </g>

      <text className="art-label" x={0} y={144}>
        {t.venueA}
      </text>
      <text className="art-label art-label-muted" x={92} y={144}>
        {t.venueB}
      </text>
      <text className="art-label art-label-accent" x={420} y={144} textAnchor="end">
        {t.close}
      </text>
    </svg>
  )
}

/* --- 2. Управление командой: идея проходит инвесткомитет ------------------- */

const CANDLES = [
  { x: 20, open: 92, close: 74, high: 66, low: 98 },
  { x: 62, open: 74, close: 82, high: 70, low: 92 },
  { x: 104, open: 82, close: 62, high: 54, low: 88 },
  { x: 146, open: 62, close: 68, high: 56, low: 78 },
  { x: 188, open: 68, close: 48, high: 40, low: 72 },
  { x: 230, open: 48, close: 56, high: 44, low: 64 },
  { x: 272, open: 56, close: 38, high: 30, low: 60 },
  { x: 314, open: 38, close: 44, high: 34, low: 52 },
]

function TeamArt({ t }: { t: ArtText['team'] }) {
  return (
    <svg viewBox={VB} className="art" aria-hidden="true">
      <Grid />
      {CANDLES.map((candle) => {
        const up = candle.close < candle.open
        return (
          <g key={candle.x} className={up ? 'art-candle art-candle-up' : 'art-candle'}>
            <line x1={candle.x + 9} x2={candle.x + 9} y1={candle.high} y2={candle.low} />
            <rect
              x={candle.x}
              y={Math.min(candle.open, candle.close)}
              width={18}
              height={Math.max(Math.abs(candle.close - candle.open), 3)}
              rx={2}
            />
          </g>
        )
      })}

      {/* Разметка аналитика поверх графика — то, чего алгоритм не делает. */}
      <path className="art-accent art-dashed" d="M 24 96 C 120 92, 200 62, 330 40" />
      <circle className="art-dot" cx={328} cy={40} r={5} />
      <rect className="art-chip" x={340} y={22} width={80} height={22} rx={7} />
      <text className="art-chip-text" x={380} y={37} textAnchor="middle">
        {t.committee}
      </text>

      <g className="art-verdict">
        <rect x={0} y={116} width={132} height={22} rx={7} />
        <rect className="art-verdict-off" x={142} y={116} width={132} height={22} rx={7} />
        <rect className="art-verdict-off" x={284} y={116} width={132} height={22} rx={7} />
        <text className="art-verdict-text" x={66} y={131} textAnchor="middle">
          {t.accepted}
        </text>
        <text className="art-verdict-text art-verdict-text-off" x={208} y={131} textAnchor="middle">
          {t.rejected}
        </text>
        <text className="art-verdict-text art-verdict-text-off" x={350} y={131} textAnchor="middle">
          {t.rejected}
        </text>
      </g>
    </svg>
  )
}

/* --- 3. TAIS: данные сходятся в ядро, из ядра выходит оценка риска --------- */

const FEED_ROWS = [26, 50, 74, 98, 122]

function TaisArt({ t }: { t: ArtText['tais'] }) {
  return (
    <svg viewBox={VB} className="art" aria-hidden="true">
      {FEED_ROWS.map((y, row) => (
        <g key={y} className="art-feed" style={{ animationDelay: `${row * 90}ms` }}>
          {[0, 1, 2, 3].map((column) => (
            <rect key={column} x={column * 15} y={y - 4} width={9} height={8} rx={2} />
          ))}
          <path className="art-thin art-muted" d={`M 62 ${y} C 120 ${y}, 140 75, 176 75`} fill="none" />
        </g>
      ))}

      <g className="art-core">
        <circle className="art-core-ring" cx={210} cy={75} r={46} />
        <circle className="art-core-ring" cx={210} cy={75} r={36} />
        <path
          className="art-core-shape"
          d="M 210 41 L 239 58 L 239 92 L 210 109 L 181 92 L 181 58 Z"
        />
        <text className="art-core-text" x={210} y={80} textAnchor="middle">
          TAIS
        </text>
      </g>

      {[45, 75, 105].map((y) => (
        <path key={y} className="art-accent art-thin" d={`M 244 75 C 288 75, 300 ${y}, 344 ${y}`} fill="none" />
      ))}
      {[45, 75, 105].map((y, index) => (
        <g key={y}>
          <rect className="art-chip" x={344} y={y - 11} width={76} height={22} rx={7} />
          <text className="art-chip-text" x={382} y={y + 4} textAnchor="middle">
            {['Events', 'Strategies', 'Earn'][index]}
          </text>
        </g>
      ))}

      <text className="art-label" x={0} y={144}>
        {t.feeds}
      </text>
    </svg>
  )
}

/* --- 4. Размещение ликвидности: пул, размещения и купон обратно ------------ */

const DESKS = [40, 72, 104]

function LiquidityArt({ t }: { t: ArtText['liquidity'] }) {
  return (
    <svg viewBox={VB} className="art" aria-hidden="true">
      <text className="art-label art-label-strong" x={54} y={20} textAnchor="middle">
        {t.capital}
      </text>
      <rect className="art-pool" x={0} y={28} width={108} height={88} rx={12} />
      <rect className="art-pool-fill" x={0} y={62} width={108} height={54} rx={12} />

      {DESKS.map((y, index) => (
        <g key={y} className="art-flow">
          <path className="art-thin art-accent" d={`M 108 72 C 140 72, 140 ${y}, 172 ${y}`} fill="none" />
          <rect className="art-chip" x={172} y={y - 13} width={148} height={26} rx={8} />
          <text className="art-chip-text" x={246} y={y + 4} textAnchor="middle">
            {t.desks[index]}
          </text>
        </g>
      ))}

      {/* Купон возвращается ровной линией — на ней и держится фиксированная ставка Earn. */}
      <polyline className="art-accent" points="0,140 52,137 104,134 156,131 208,128 260,125" />
      {[0, 52, 104, 156, 208, 260].map((x, index) => (
        <circle key={x} className="art-dot" cx={x} cy={140 - index * 3} r={3} />
      ))}
      <text className="art-label art-label-accent" x={420} y={143} textAnchor="end">
        {t.coupon}
      </text>
    </svg>
  )
}
