export type InvestorTier = 'Member' | 'Silver' | 'Gold' | 'Diamond' | 'Black'

export interface InvestorStatusInput {
  qualifiedCapital: number
  longTermCapital: number
  completedEvents: number
  activeEvents: number
  tenureMonths: number
  qualifiedReferrals: number
}

export interface InvestorStatusBreakdown {
  capital: number
  longTerm: number
  events: number
  tenure: number
  referrals: number
}

export interface InvestorStatusResult {
  score: number
  tier: InvestorTier
  nextTier: InvestorTier | null
  nextThreshold: number | null
  progress: number
  pointsToNext: number
  breakdown: InvestorStatusBreakdown
}

export const INVESTOR_TIERS: { tier: InvestorTier; threshold: number }[] = [
  { tier: 'Member', threshold: 0 },
  { tier: 'Silver', threshold: 200 },
  { tier: 'Gold', threshold: 500 },
  { tier: 'Diamond', threshold: 1000 },
  { tier: 'Black', threshold: 2500 },
]

export function calculateInvestorStatus(input: InvestorStatusInput): InvestorStatusResult {
  const breakdown: InvestorStatusBreakdown = {
    capital: Math.round(Math.max(0, input.qualifiedCapital) / 1000 * 7.5),
    longTerm: Math.round(Math.max(0, input.longTermCapital) / 1000 * 4),
    events: Math.round(Math.max(0, input.completedEvents) * 4 + Math.max(0, input.activeEvents) * 8),
    tenure: Math.min(100, Math.round(Math.max(0, input.tenureMonths) * 5)),
    referrals: Math.round(Math.max(0, input.qualifiedReferrals) * 15),
  }

  const score = Object.values(breakdown).reduce((sum, value) => sum + value, 0)
  let tierIndex = 0
  for (let index = 0; index < INVESTOR_TIERS.length; index += 1) {
    if (score >= INVESTOR_TIERS[index].threshold) tierIndex = index
  }

  const current = INVESTOR_TIERS[tierIndex]
  const next = INVESTOR_TIERS[tierIndex + 1] ?? null
  const range = next ? Math.max(1, next.threshold - current.threshold) : 1
  const progress = next ? Math.min(100, Math.max(0, (score - current.threshold) / range * 100)) : 100

  return {
    score,
    tier: current.tier,
    nextTier: next?.tier ?? null,
    nextThreshold: next?.threshold ?? null,
    progress,
    pointsToNext: next ? Math.max(0, next.threshold - score) : 0,
    breakdown,
  }
}

export const tierAccent: Record<InvestorTier, string> = {
  Member: '#7d8190',
  Silver: '#b8bec9',
  Gold: '#cda64a',
  Diamond: '#9fd8f5',
  Black: '#1b1d22',
}

export const tierMetallic: Record<InvestorTier, string> = {
  Member: 'linear-gradient(135deg,#f3f4f6 0%,#d8dbe2 52%,#babfca 100%)',
  Silver: 'linear-gradient(135deg,#f8f9fb 0%,#dfe3ea 34%,#aeb5c2 68%,#eceff4 100%)',
  Gold: 'linear-gradient(135deg,#fff5cf 0%,#e9cf78 30%,#c89734 62%,#f2dc8a 100%)',
  Diamond: 'linear-gradient(135deg,#f8fdff 0%,#d9f4ff 28%,#9fd8f5 58%,#c7b9f6 84%,#eef9ff 100%)',
  Black: 'linear-gradient(135deg,#2c2f35 0%,#111317 46%,#30343d 72%,#0b0c0f 100%)',
}

/* --- Привилегии уровней -----------------------------------------------
 * Матрица — единственный источник правды для сравнения уровней, короткие
 * списки ниже используются в карточках, где на таблицу нет места.
 */

export interface TierPerkRow {
  label: string
  /** Значение привилегии на каждом уровне; `null` — привилегия ещё не открыта. */
  values: Record<InvestorTier, string | null>
}

export const TIER_PERK_MATRIX: TierPerkRow[] = [
  {
    label: 'Earn и базовые продукты',
    values: { Member: 'Доступны', Silver: 'Доступны', Gold: 'Доступны', Diamond: 'Доступны', Black: 'Доступны' },
  },
  {
    label: 'Strategies',
    values: { Member: null, Silver: 'Доступны', Gold: 'Доступны', Diamond: 'Доступны', Black: 'Доступны' },
  },
  {
    label: 'Доступ к Events',
    values: { Member: 'Общий', Silver: 'Общий', Gold: 'За 24 часа до старта', Diamond: 'Закрытые Events', Black: 'Приватные сделки' },
  },
  {
    label: 'Комиссия вывода',
    values: { Member: '1.0%', Silver: '0.75%', Gold: '0.5%', Diamond: 'Без комиссии', Black: 'Без комиссии' },
  },
  {
    label: 'Лимит вывода в сутки',
    values: { Member: '$25,000', Silver: '$50,000', Gold: '$150,000', Diamond: 'Без лимита', Black: 'Без лимита' },
  },
  {
    label: 'Ставка Earn',
    values: { Member: 'Базовая', Silver: 'Базовая', Gold: '+0.3 п.п.', Diamond: 'Индивидуальная', Black: 'Индивидуальная' },
  },
  {
    label: 'Поддержка',
    values: { Member: '24/7', Silver: '24/7', Gold: 'Приоритетная', Diamond: 'Персональный менеджер', Black: 'Прямая линия с инвесткомитетом' },
  },
  {
    label: 'Отчётность',
    values: { Member: null, Silver: null, Gold: 'Раз в квартал', Diamond: 'Ежемесячно', Black: 'По запросу' },
  },
  {
    label: 'Co-investment с фондом',
    values: { Member: null, Silver: null, Gold: null, Diamond: null, Black: 'По приглашению' },
  },
]

export const tierSummary: Record<InvestorTier, string> = {
  Member: 'Стартовый уровень: Earn, базовые продукты и круглосуточная поддержка.',
  Silver: 'Открываются Strategies и сниженная комиссия вывода.',
  Gold: 'Ранний доступ к Events, приоритетная поддержка и повышенный лимит вывода.',
  Diamond: 'Персональный менеджер, закрытые Events и вывод без комиссии.',
  Black: 'Приватные сделки, co-investment с фондом и прямая линия с инвесткомитетом.',
}

/** Что появляется именно на этом уровне — для карточек «уже доступно» и «откроется». */
export const tierPerks: Record<InvestorTier, string[]> = {
  Member: ['Earn и базовые продукты', 'Поддержка 24/7', 'Лимит вывода $25,000 в сутки'],
  Silver: ['Доступ к Strategies', 'Комиссия вывода 0.75%', 'Лимит вывода $50,000 в сутки'],
  Gold: ['Ранний доступ к Events за 24 часа', 'Приоритетная поддержка', 'Ставка Earn +0.3 п.п.', 'Отчёт раз в квартал'],
  Diamond: ['Персональный менеджер', 'Закрытые Events', 'Вывод без комиссии и без лимита', 'Индивидуальная ставка Earn'],
  Black: ['Приватные сделки вне платформы', 'Co-investment с фондом', 'Прямая линия с инвесткомитетом'],
}

/* --- Правила начисления баллов ----------------------------------------
 * Держим формулу и её описание рядом: страница уровней объясняет ровно то,
 * что считает calculateInvestorStatus, и не расходится с ней при правках.
 */

export interface ScoreRule {
  key: keyof InvestorStatusBreakdown
  label: string
  rule: string
  /** Текущее значение показателя человекочитаемо. */
  describe: (input: InvestorStatusInput) => string
  hint: string
}

const usd = (value: number) => `$${Math.round(value).toLocaleString('en-US')}`

export const SCORE_RULES: ScoreRule[] = [
  {
    key: 'capital',
    label: 'Капитал в продуктах',
    rule: '7.5 баллов за каждые $1,000',
    describe: (input) => usd(input.qualifiedCapital),
    hint: 'Свободный остаток на счёте не считается — баллы даёт только размещённый капитал.',
  },
  {
    key: 'longTerm',
    label: 'Долгосрочный капитал',
    rule: '+4 балла за каждые $1,000 на срок от 12 месяцев',
    describe: (input) => usd(input.longTermCapital),
    hint: 'Контракт на 12 месяцев вместо 6 даёт те же деньги, но вдвое больше баллов.',
  },
  {
    key: 'events',
    label: 'Участие в Events',
    rule: '4 балла за завершённый, 8 за активный',
    describe: (input) => `${input.completedEvents} завершённых · ${input.activeEvents} активных`,
    hint: 'Активные Events весят вдвое больше — статус реагирует сразу после входа в сделку.',
  },
  {
    key: 'tenure',
    label: 'Срок отношений',
    rule: '5 баллов за месяц, максимум 100',
    describe: (input) => `${input.tenureMonths} мес.`,
    hint: 'Начисляется автоматически и достигает потолка через 20 месяцев.',
  },
  {
    key: 'referrals',
    label: 'Рекомендации',
    rule: '15 баллов за квалифицированного реферала',
    describe: (input) => `${input.qualifiedReferrals} квалифицированных`,
    hint: 'Реферал считается квалифицированным после KYC и первого размещения капитала.',
  },
]

/* --- Тема уровня -------------------------------------------------------
 * Уровень окрашивает интерфейс: тёмная шапка профиля, подложки карточек
 * и акценты берут тон отсюда, а не из общей палитры.
 */

/** Тёмная подложка шапки профиля. */
export const tierHero: Record<InvestorTier, string> = {
  Member: 'linear-gradient(135deg,#16181d 0%,#1d2027 54%,#272b34 100%)',
  Silver: 'linear-gradient(135deg,#14171c 0%,#1c2129 52%,#2c333d 100%)',
  Gold: 'linear-gradient(135deg,#15140f 0%,#201c12 50%,#302818 100%)',
  Diamond: 'linear-gradient(135deg,#0f1820 0%,#142430 52%,#1b3444 100%)',
  Black: 'linear-gradient(135deg,#08080a 0%,#131315 55%,#1f1f22 100%)',
}

/** Мягкая подложка светлых блоков в тон уровню. */
export const tierSoft: Record<InvestorTier, string> = {
  Member: '#f4f5f7',
  Silver: '#f3f5f8',
  Gold: '#faf5e9',
  Diamond: '#eff7fc',
  Black: '#f2f2f3',
}

/** Акцент уровня, читаемый на светлом фоне. */
export const tierInk: Record<InvestorTier, string> = {
  Member: '#5c616e',
  Silver: '#6b7686',
  Gold: '#9a7c25',
  Diamond: '#2f7fae',
  Black: '#1b1d22',
}

/* --- Производные от формулы -------------------------------------------
 * Держим обратный пересчёт рядом с самой формулой, чтобы «сколько денег
 * до следующего уровня» не разъезжалось с начислением баллов.
 */

const POINTS_PER_1K = 7.5
const LONG_TERM_BONUS_PER_1K = 4

/** Капитал, который нужно разместить ради указанного числа баллов. */
export function capitalForPoints(points: number, longTerm = false): number {
  if (points <= 0) return 0
  const perThousand = POINTS_PER_1K + (longTerm ? LONG_TERM_BONUS_PER_1K : 0)
  return Math.ceil(points / perThousand) * 1000
}

/** Даты получения уровней. В мок-слое зашиты, в проде придут из истории счёта. */
export const tierAchievedAt: Partial<Record<InvestorTier, string>> = {
  Member: '12.03.2024',
  Silver: '26.08.2024',
  Gold: '14.02.2025',
}

/**
 * Ряд баллов за последние 12 месяцев для спарклайна. Детерминированный:
 * одинаков между рендерами и заканчивается текущим значением.
 */
export function buildScoreHistory(current: number, months = 12): number[] {
  const start = Math.max(0, Math.round(current * 0.52))
  return Array.from({ length: months }, (_, index) => {
    const progress = index / (months - 1)
    const base = start + (current - start) * progress
    // Лёгкая рябь, чтобы линия не выглядела нарисованной по линейке.
    const ripple = Math.sin(index * 1.7) * (current - start) * 0.035
    return index === months - 1 ? current : Math.round(base + ripple)
  })
}
