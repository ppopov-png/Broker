export type Risk = 'Низкий' | 'Умеренный' | 'Высокий'

/** * Открытые Events. Лежат в модели, а не в странице: дашборду тоже нужно
 * показывать ближайшее окно, и оно должно быть тем же самым.
 */

export type LiveEvent = {
  id: string
  title: string
  category: string
  asset: string
  shortIdea: string
  driver: string
  thesis: string
  taisPosition: string
  counterPosition: string
  targetLow: number
  targetHigh: number
  horizon: string
  risk: Risk
  minInvestment: number
  maxInvestment: number
  capacity: number
  committed: number
  contraCapital: number
  velocityPerMinute: number
  secondsLeft: number
  participants: number
  trigonumCapital: number
  scarcity: number
  liveCapital: boolean
  flowMultiplier: number
  visual: 'btc' | 'eth' | 'basket' | 'relative'
}

export const liveEvents: LiveEvent[] = [
  { id: 'EV-ETF-061', title: 'ETF-притоки в Bitcoin', category: 'Институциональные потоки', asset: 'BTC', shortIdea: 'Притоки в spot Bitcoin ETF ускоряются', driver: 'Ускорение чистых притоков капитала в spot Bitcoin ETF', thesis: 'TAIS ожидает, что устойчивый институциональный спрос поддержит рост Bitcoin в пределах горизонта Event.', taisPosition: 'LONG BTC', counterPosition: 'SHORT BTC', targetLow: 8, targetHigh: 12, horizon: '7 – 14 дней', risk: 'Умеренный', minInvestment: 5000, maxInvestment: 50000, capacity: 1200000, committed: 986000, contraCapital: 288000, velocityPerMinute: 13800, secondsLeft: 24 * 60 + 37, participants: 146, trigonumCapital: 120000, scarcity: 93, liveCapital: true, flowMultiplier: 1, visual: 'btc' },
  { id: 'EV-DER-044', title: 'Перекос деривативов BTC', category: 'Деривативы', asset: 'BTC', shortIdea: 'Рынок перегружен длинными позициями', driver: 'Экстремальное позиционирование участников на рынке деривативов', thesis: 'TAIS ожидает коррекцию перегруженного позиционирования и снижение Bitcoin.', taisPosition: 'SHORT BTC', counterPosition: 'LONG BTC', targetLow: 6, targetHigh: 10, horizon: '3 – 8 дней', risk: 'Высокий', minInvestment: 10000, maxInvestment: 35000, capacity: 650000, committed: 650000, contraCapital: 247000, velocityPerMinute: 0, secondsLeft: 19 * 60 + 16, participants: 91, trigonumCapital: 65000, scarcity: 100, liveCapital: false, flowMultiplier: 0, visual: 'btc' },
  { id: 'EV-STB-028', title: 'Рост stablecoin-ликвидности', category: 'Ликвидность', asset: 'BTC + ETH', shortIdea: 'Свободная ликвидность крипторынка расширяется', driver: 'Расширение доступной stablecoin-ликвидности внутри крипторынка', thesis: 'TAIS ожидает, что рост свободной ликвидности усилит спрос на крупнейшие цифровые активы.', taisPosition: 'LONG BTC + ETH', counterPosition: 'SHORT BTC + ETH', targetLow: 7, targetHigh: 11, horizon: '8 – 18 дней', risk: 'Умеренный', minInvestment: 5000, maxInvestment: 40000, capacity: 1500000, committed: 914000, contraCapital: 214000, velocityPerMinute: 7200, secondsLeft: 72 * 60 + 44, participants: 174, trigonumCapital: 150000, scarcity: 68, liveCapital: true, flowMultiplier: 0.72, visual: 'basket' },
  { id: 'EV-ROT-019', title: 'Ротация капитала BTC → ETH', category: 'Ротация капитала', asset: 'ETH / BTC', shortIdea: 'Потоки капитала смещаются в сторону Ethereum', driver: 'Изменение относительных потоков капитала между Bitcoin и Ethereum', thesis: 'TAIS ожидает относительное усиление Ethereum по отношению к Bitcoin.', taisPosition: 'LONG ETH / SHORT BTC', counterPosition: 'SHORT ETH / LONG BTC', targetLow: 5, targetHigh: 9, horizon: '10 – 24 дня', risk: 'Умеренный', minInvestment: 7500, maxInvestment: 45000, capacity: 1100000, committed: 734000, contraCapital: 301000, velocityPerMinute: 5100, secondsLeft: 103 * 60 + 21, participants: 112, trigonumCapital: 110000, scarcity: 57, liveCapital: false, flowMultiplier: 0, visual: 'relative' },
  { id: 'EV-ETH-035', title: 'Институциональный спрос на ETH', category: 'Институциональные потоки', asset: 'ETH', shortIdea: 'Спрос на Ethereum ускоряется относительно рынка', driver: 'Рост институционального спроса и относительных потоков капитала в Ethereum', thesis: 'TAIS ожидает продолжение притока капитала и положительную динамику Ethereum.', taisPosition: 'LONG ETH', counterPosition: 'SHORT ETH', targetLow: 9, targetHigh: 15, horizon: '5 – 12 дней', risk: 'Высокий', minInvestment: 10000, maxInvestment: 30000, capacity: 800000, committed: 708000, contraCapital: 126000, velocityPerMinute: 10400, secondsLeft: 11 * 60 + 52, participants: 76, trigonumCapital: 80000, scarcity: 96, liveCapital: true, flowMultiplier: 1.25, visual: 'eth' },
]
