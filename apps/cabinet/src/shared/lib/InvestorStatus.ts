/**
 * Уровни инвестора. Diamond — вершина лестницы, Californium — чёрный уровень
 * под ним. Порядок массива INVESTOR_TIERS задаёт лестницу целиком: пороги,
 * сравнение уровней и понижение считаются от него, отдельных списков нет.
 */
export type InvestorTier = 'Member' | 'Silver' | 'Gold' | 'Platinum' | 'Californium' | 'Diamond'

export const INVESTOR_TIERS: { tier: InvestorTier; threshold: number }[] = [
  { tier: 'Member', threshold: 0 },
  { tier: 'Silver', threshold: 1_000 },
  { tier: 'Gold', threshold: 3_000 },
  { tier: 'Platinum', threshold: 6_500 },
  { tier: 'Californium', threshold: 12_000 },
  { tier: 'Diamond', threshold: 25_000 },
]

/* --- Начисление баллов --------------------------------------------------
 * Баллы живут в скользящем окне 12 месяцев: начисления старше окна выпадают
 * сами, и уровень снижается без отдельной «штрафной» логики. Исключение —
 * стаж: он не выгорает, иначе давний клиент терял бы за верность.
 */

/** Длина окна начисления в месяцах. */
export const SCORE_WINDOW_MONTHS = 12

export interface InvestorStatusInput {
  /** Средний размещённый капитал за окно. Свободный остаток не считается. */
  qualifiedCapital: number
  /** Часть размещённого капитала на срок от 12 месяцев — идёт с двойным весом. */
  longTermCapital: number
  /** Сколько месяцев окна капитал реально удерживался, 0–12. */
  holdingMonths: number
  /** Сумма зачислений на основной счёт за окно. */
  depositsInWindow: number
  /** Новых договоров заключено за окно. */
  contractsInWindow: number
  /** Число разных программ, в которых клиент участвует. */
  programs: number
  completedEvents: number
  activeEvents: number
  /** Полных месяцев с момента открытия счёта. */
  tenureMonths: number
  qualifiedReferrals: number
  /** Баллы приглашённых за окно — с них идёт доля пригласившему. */
  referralPoints: number
  /** Кварталов окна, в которых была хотя бы одна операция, 0–4. */
  activeQuarters: number
  /** Месяцев с последней операции — для правил спящего счёта. */
  monthsSinceActivity: number
}

export interface InvestorStatusBreakdown {
  holding: number
  deposits: number
  contracts: number
  programs: number
  events: number
  referrals: number
  tenure: number
  regularity: number
}

/** Ставки начисления. Держатся здесь, чтобы формула и её описание не разъезжались. */
export const SCORE_RATES = {
  /** Баллов за $1,000 размещённого капитала за каждый месяц удержания. */
  perThousandPerMonth: 1,
  /** Долгосрочное размещение (12+ мес.) считается дважды. */
  longTermMultiplier: 2,
  perThousandDeposited: 1,
  perContract: 150,
  perProgram: 250,
  perCompletedEvent: 200,
  perActiveEvent: 400,
  perReferral: 500,
  /** Доля баллов приглашённого, начисляемая пригласившему. */
  referralShare: 0.05,
  perTenureQuarter: 100,
  tenureCap: 2_000,
  perActiveQuarter: 300,
  regularityCap: 1_200,
} as const

export interface InvestorStatusResult {
  score: number
  tier: InvestorTier
  nextTier: InvestorTier | null
  nextThreshold: number | null
  progress: number
  pointsToNext: number
  breakdown: InvestorStatusBreakdown
  /** Удержание уровня: порог понижения и запас над ним. */
  retention: TierRetention
}

export interface TierRetention {
  /** Ниже этого числа баллов уровень снимается на ближайшем пересмотре. */
  threshold: number
  /** Запас баллов над порогом удержания. */
  buffer: number
  /** Баллов не хватает уже сейчас либо счёт признан спящим. */
  atRisk: boolean
  /** Причина риска — для баннера. */
  reason: 'ok' | 'below-threshold' | 'dormant'
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function calculateInvestorStatus(input: InvestorStatusInput): InvestorStatusResult {
  const months = clamp(input.holdingMonths, 0, SCORE_WINDOW_MONTHS)
  const capital = Math.max(0, input.qualifiedCapital)
  // Долгосрочная часть учитывается ещё раз поверх общей — отсюда двойной вес.
  const longTerm = clamp(input.longTermCapital, 0, capital) * (SCORE_RATES.longTermMultiplier - 1)

  const breakdown: InvestorStatusBreakdown = {
    holding: Math.round(((capital + longTerm) / 1000) * months * SCORE_RATES.perThousandPerMonth),
    deposits: Math.round((Math.max(0, input.depositsInWindow) / 1000) * SCORE_RATES.perThousandDeposited),
    contracts: Math.max(0, input.contractsInWindow) * SCORE_RATES.perContract,
    programs: Math.max(0, input.programs) * SCORE_RATES.perProgram,
    events:
      Math.max(0, input.completedEvents) * SCORE_RATES.perCompletedEvent +
      Math.max(0, input.activeEvents) * SCORE_RATES.perActiveEvent,
    referrals: Math.round(
      Math.max(0, input.qualifiedReferrals) * SCORE_RATES.perReferral +
        Math.max(0, input.referralPoints) * SCORE_RATES.referralShare,
    ),
    tenure: Math.min(
      SCORE_RATES.tenureCap,
      Math.floor(Math.max(0, input.tenureMonths) / 3) * SCORE_RATES.perTenureQuarter,
    ),
    regularity: Math.min(
      SCORE_RATES.regularityCap,
      clamp(input.activeQuarters, 0, 4) * SCORE_RATES.perActiveQuarter,
    ),
  }

  const score = Object.values(breakdown).reduce((sum, value) => sum + value, 0)

  let tierIndex = 0
  for (let index = 0; index < INVESTOR_TIERS.length; index += 1) {
    if (score >= INVESTOR_TIERS[index].threshold) tierIndex = index
  }

  const current = INVESTOR_TIERS[tierIndex]
  const next = INVESTOR_TIERS[tierIndex + 1] ?? null
  const range = next ? Math.max(1, next.threshold - current.threshold) : 1
  const progress = next ? clamp(((score - current.threshold) / range) * 100, 0, 100) : 100

  const retentionThreshold = retentionThresholdFor(current.tier)
  const dormant = input.monthsSinceActivity >= DORMANCY.downgradeAfterMonths
  const belowThreshold = score < retentionThreshold

  return {
    score,
    tier: current.tier,
    nextTier: next?.tier ?? null,
    nextThreshold: next?.threshold ?? null,
    progress,
    pointsToNext: next ? Math.max(0, next.threshold - score) : 0,
    breakdown,
    retention: {
      threshold: retentionThreshold,
      buffer: score - retentionThreshold,
      atRisk: belowThreshold || dormant,
      reason: dormant ? 'dormant' : belowThreshold ? 'below-threshold' : 'ok',
    },
  }
}

/* --- Понижение уровня ---------------------------------------------------
 * Уровень пересматривается раз в квартал. Порог удержания ниже порога
 * получения: без этого зазора клиент прыгал бы между уровнями от любого
 * колебания капитала.
 */

/** Доля порога получения, ниже которой уровень снимается. */
export const RETENTION_RATIO = 0.8

export function retentionThresholdFor(tier: InvestorTier): number {
  const entry = INVESTOR_TIERS.find((item) => item.tier === tier)
  return entry ? Math.round(entry.threshold * RETENTION_RATIO) : 0
}

/** Сколько пересмотров уровень держится после первого получения. */
export const TIER_GRACE_REVIEWS: Record<InvestorTier, number | 'unlimited'> = {
  Member: 0,
  Silver: 0,
  Gold: 1,
  Platinum: 2,
  Californium: 4,
  Diamond: 'unlimited',
}

export const DOWNGRADE = {
  /** Пересмотр — первое число квартала. */
  reviewMonths: [0, 3, 6, 9],
  /** За сколько дней предупреждаем о понижении. */
  warningDays: 30,
  /** Больше одного уровня за пересмотр не снимаем. */
  maxStepsPerReview: 1,
  /** Сколько месяцев после понижения действует ускоренный возврат. */
  fastTrackMonths: 12,
} as const

export const DORMANCY = {
  /** С этого месяца бездействия показываем предупреждение. */
  warnAfterMonths: 6,
  /** С этого — снимаем уровень на ближайшем пересмотре независимо от баллов. */
  downgradeAfterMonths: 12,
  /** С этого — уровень сбрасывается до Member. */
  resetAfterMonths: 24,
} as const

/** Ближайшая дата пересмотра уровней от указанного момента. */
export function nextReviewDate(from = new Date()): Date {
  const nextQuarter = (Math.floor(from.getMonth() / 3) + 1) * 3
  return new Date(from.getFullYear(), nextQuarter, 1)
}

export interface DowngradeRule {
  title: string
  text: string
}

/** Правила понижения для страницы уровней — та же формулировка, что в регламенте. */
export const DOWNGRADE_RULES: DowngradeRule[] = [
  {
    title: 'Пересмотр раз в квартал',
    text: 'Уровень проверяется первого числа января, апреля, июля и октября. Между пересмотрами он не меняется — вырасти можно в любой день, потерять только на пересмотре.',
  },
  {
    title: 'Зазор в 20%',
    text: `Уровень снимается не на пороге получения, а при падении ниже ${Math.round(RETENTION_RATIO * 100)}% от него. Колебание капитала на несколько процентов статуса не стоит.`,
  },
  {
    title: 'Не больше одного уровня за раз',
    text: 'За один пересмотр можно опуститься только на ступень ниже, даже если баллов не хватает на несколько.',
  },
  {
    title: 'Защита нового уровня',
    text: 'Впервые достигнутый уровень держится оговорённое число пересмотров независимо от баллов. Срок защиты растёт с уровнем и указан в таблице привилегий.',
  },
  {
    title: 'Предупреждение за 30 дней',
    text: 'Перед понижением приходит уведомление с точной суммой, которой не хватает, и сроком, до которого её нужно набрать.',
  },
  {
    title: 'Спящий счёт',
    text: `Без единой операции ${DORMANCY.warnAfterMonths} месяцев приходит предупреждение, через ${DORMANCY.downgradeAfterMonths} — уровень снижается на ступень независимо от баллов, через ${DORMANCY.resetAfterMonths} — сбрасывается до Member.`,
  },
  {
    title: 'Условия открытых договоров не меняются',
    text: 'Ставка и комиссия фиксируются на момент заключения договора. Понижение уровня действует только на новые операции.',
  },
  {
    title: 'Быстрый возврат',
    text: `Если баллы вернулись в течение ${DOWNGRADE.fastTrackMonths} месяцев после понижения, уровень восстанавливается на ближайшем пересмотре без периода защиты.`,
  },
]

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
    values: { Member: 'Доступны', Silver: 'Доступны', Gold: 'Доступны', Platinum: 'Доступны', Californium: 'Доступны', Diamond: 'Доступны' },
  },
  {
    label: 'Strategies',
    values: { Member: null, Silver: 'Доступны', Gold: 'Доступны', Platinum: 'Доступны', Californium: 'Доступны', Diamond: 'Доступны' },
  },
  {
    label: 'Доступ к Events',
    values: { Member: 'Общий', Silver: 'Общий', Gold: 'За 24 часа до старта', Platinum: 'Закрытые Events', Californium: 'Приватные сделки', Diamond: 'Клубные сделки' },
  },
  {
    label: 'Комиссия вывода',
    values: { Member: '1.0%', Silver: '0.75%', Gold: '0.5%', Platinum: '0.25%', Californium: 'Без комиссии', Diamond: 'Без комиссии' },
  },
  {
    label: 'Лимит вывода в сутки',
    values: { Member: '$25,000', Silver: '$50,000', Gold: '$150,000', Platinum: '$500,000', Californium: 'Без лимита', Diamond: 'Без лимита' },
  },
  {
    label: 'Ставка Earn',
    values: { Member: 'Базовая', Silver: 'Базовая', Gold: '+0.3 п.п.', Platinum: '+0.6 п.п.', Californium: 'Индивидуальная', Diamond: 'Индивидуальная' },
  },
  {
    label: 'Поддержка',
    values: { Member: '24/7', Silver: '24/7', Gold: 'Приоритетная', Platinum: 'Персональный менеджер', Californium: 'Прямая линия с инвесткомитетом', Diamond: 'Управляющий партнёр' },
  },
  {
    label: 'Отчётность',
    values: { Member: null, Silver: null, Gold: 'Раз в квартал', Platinum: 'Ежемесячно', Californium: 'По запросу', Diamond: 'Индивидуальная аналитика' },
  },
  {
    label: 'Co-investment с фондом',
    values: { Member: null, Silver: null, Gold: null, Platinum: null, Californium: 'По приглашению', Diamond: 'Гарантированная квота' },
  },
  {
    label: 'Множитель баллов за рефералов',
    values: { Member: '×1', Silver: '×1', Gold: '×1.25', Platinum: '×1.5', Californium: '×2', Diamond: '×2' },
  },
  {
    label: 'Защита от понижения',
    values: { Member: null, Silver: null, Gold: '1 пересмотр', Platinum: '2 пересмотра', Californium: '1 год', Diamond: 'Бессрочно' },
  },
]

export const tierSummary: Record<InvestorTier, string> = {
  Member: 'Стартовый уровень: Earn, базовые продукты и круглосуточная поддержка.',
  Silver: 'Открываются Strategies и сниженная комиссия вывода.',
  Gold: 'Ранний доступ к Events, приоритетная поддержка и повышенный лимит вывода.',
  Platinum: 'Персональный менеджер, закрытые Events и ставка Earn выше базовой.',
  Californium: 'Приватные сделки, co-investment с фондом и вывод без комиссии.',
  Diamond: 'Вершина лестницы: клубные сделки, управляющий партнёр и бессрочный статус.',
}

/** Что появляется именно на этом уровне — для карточек «уже доступно» и «откроется». */
export const tierPerks: Record<InvestorTier, string[]> = {
  Member: ['Earn и базовые продукты', 'Поддержка 24/7', 'Лимит вывода $25,000 в сутки'],
  Silver: ['Доступ к Strategies', 'Комиссия вывода 0.75%', 'Лимит вывода $50,000 в сутки'],
  Gold: ['Ранний доступ к Events за 24 часа', 'Приоритетная поддержка', 'Ставка Earn +0.3 п.п.', 'Защита уровня на один пересмотр'],
  Platinum: ['Персональный менеджер', 'Закрытые Events', 'Ставка Earn +0.6 п.п.', 'Ежемесячная отчётность', 'Баллы за рефералов ×1.5'],
  Californium: ['Приватные сделки вне платформы', 'Co-investment по приглашению', 'Вывод без комиссии и без лимита', 'Прямая линия с инвесткомитетом', 'Защита уровня на год'],
  Diamond: ['Клубные сделки', 'Гарантированная квота в co-investment', 'Управляющий партнёр на связи', 'Индивидуальная аналитика', 'Статус не понижается'],
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

/** Баллы с разделителем разрядов: значения пятизначные, слитно не читаются. */
export function formatPoints(value: number): string {
  return Math.round(value).toLocaleString('ru-RU')
}

export const SCORE_RULES: ScoreRule[] = [
  {
    key: 'holding',
    label: 'Удержание капитала',
    rule: '1 балл за $1,000 в месяц, долгосрочное размещение ×2',
    describe: (input) => `${usd(input.qualifiedCapital)} · ${input.holdingMonths} мес.`,
    hint: 'Считается размещённый капитал за каждый месяц удержания. Свободный остаток на счёте баллов не даёт.',
  },
  {
    key: 'deposits',
    label: 'Пополнения счёта',
    rule: '1 балл за каждые $1,000 зачисления',
    describe: (input) => usd(input.depositsInWindow),
    hint: 'Начисляется сразу при зачислении на основной счёт, ещё до размещения в продукт.',
  },
  {
    key: 'contracts',
    label: 'Заключённые договоры',
    rule: `${SCORE_RATES.perContract} баллов за договор`,
    describe: (input) => `${input.contractsInWindow} за 12 месяцев`,
    hint: 'Учитываются договоры, заключённые за последние 12 месяцев. Продление считается новым договором.',
  },
  {
    key: 'programs',
    label: 'Программы инвестиций',
    rule: `${SCORE_RATES.perProgram} баллов за программу`,
    describe: (input) => `${input.programs} программы`,
    hint: 'Считаются разные программы, а не договоры: три вклада в Earn дают баллы одной программы.',
  },
  {
    key: 'events',
    label: 'Участие в Events',
    rule: `${SCORE_RATES.perCompletedEvent} за завершённый, ${SCORE_RATES.perActiveEvent} за активный`,
    describe: (input) => `${input.completedEvents} завершённых · ${input.activeEvents} активных`,
    hint: 'Активные Events весят вдвое больше — статус реагирует сразу после входа в сделку.',
  },
  {
    key: 'referrals',
    label: 'Рекомендации',
    rule: `${SCORE_RATES.perReferral} за реферала + ${Math.round(SCORE_RATES.referralShare * 100)}% его баллов`,
    describe: (input) => `${input.qualifiedReferrals} квалифицированных`,
    hint: 'Реферал считается квалифицированным после открытия счёта и первого размещения капитала.',
  },
  {
    key: 'tenure',
    label: 'Срок отношений',
    rule: `${SCORE_RATES.perTenureQuarter} баллов за квартал, максимум ${SCORE_RATES.tenureCap}`,
    describe: (input) => `${input.tenureMonths} мес.`,
    hint: 'Единственная категория, которая не выгорает: набранное за стаж остаётся навсегда.',
  },
  {
    key: 'regularity',
    label: 'Регулярность',
    rule: `${SCORE_RATES.perActiveQuarter} баллов за активный квартал`,
    describe: (input) => `${input.activeQuarters} из 4 кварталов`,
    hint: 'Квартал считается активным, если в нём было хотя бы одно пополнение или новый договор.',
  },
]

/* --- Тема уровня -------------------------------------------------------
 * Уровень окрашивает интерфейс: тёмная шапка профиля, подложки карточек
 * и акценты берут тон отсюда, а не из общей палитры.
 */

export const tierAccent: Record<InvestorTier, string> = {
  Member: '#7d8190',
  Silver: '#b8bec9',
  Gold: '#cda64a',
  Platinum: '#8aa6c2',
  Californium: '#3fae74',
  Diamond: '#9fd8f5',
}

export const tierMetallic: Record<InvestorTier, string> = {
  Member: 'linear-gradient(135deg,#f3f4f6 0%,#d8dbe2 52%,#babfca 100%)',
  Silver: 'linear-gradient(135deg,#f8f9fb 0%,#dfe3ea 34%,#aeb5c2 68%,#eceff4 100%)',
  Gold: 'linear-gradient(135deg,#fff5cf 0%,#e9cf78 30%,#c89734 62%,#f2dc8a 100%)',
  Platinum: 'linear-gradient(135deg,#fdfeff 0%,#e2ebf4 30%,#9db2c8 64%,#f1f6fb 100%)',
  Californium: 'linear-gradient(135deg,#1c2721 0%,#0a0d0b 44%,#22362b 72%,#060908 100%)',
  Diamond: 'linear-gradient(135deg,#f8fdff 0%,#d9f4ff 28%,#9fd8f5 58%,#c7b9f6 84%,#eef9ff 100%)',
}

/** Тёмная подложка шапки профиля. */
export const tierHero: Record<InvestorTier, string> = {
  Member: 'linear-gradient(135deg,#16181d 0%,#1d2027 54%,#272b34 100%)',
  Silver: 'linear-gradient(135deg,#14171c 0%,#1c2129 52%,#2c333d 100%)',
  Gold: 'linear-gradient(135deg,#15140f 0%,#201c12 50%,#302818 100%)',
  Platinum: 'linear-gradient(135deg,#0f1419 0%,#182430 52%,#25394b 100%)',
  Californium: 'linear-gradient(135deg,#050806 0%,#0d1612 55%,#15241b 100%)',
  Diamond: 'linear-gradient(135deg,#0f1820 0%,#142430 52%,#1b3444 100%)',
}

/** Мягкая подложка светлых блоков в тон уровню. */
export const tierSoft: Record<InvestorTier, string> = {
  Member: '#f4f5f7',
  Silver: '#f3f5f8',
  Gold: '#faf5e9',
  Platinum: '#eff4f9',
  Californium: '#eef4f0',
  Diamond: '#eff7fc',
}

/** Акцент уровня, читаемый на светлом фоне. */
export const tierInk: Record<InvestorTier, string> = {
  Member: '#5c616e',
  Silver: '#6b7686',
  Gold: '#9a7c25',
  Platinum: '#41729e',
  Californium: '#1f7a4d',
  Diamond: '#2f7fae',
}

/**
 * Цвет текста поверх металлической плашки уровня. Держим здесь, а не в
 * экранах: иначе каждый новый тёмный уровень означал бы правку восьми
 * условий вида `tier === 'Californium'` по всему кабинету.
 */
export const tierOnMetal: Record<InvestorTier, string> = {
  Member: '#1b1d22',
  Silver: '#1b1d22',
  Gold: '#1b1d22',
  Platinum: '#1b1d22',
  Californium: '#f4f4f5',
  Diamond: '#1b1d22',
}

export const tierOnMetalMuted: Record<InvestorTier, string> = {
  Member: 'rgb(0 0 0 / 48%)',
  Silver: 'rgb(0 0 0 / 48%)',
  Gold: 'rgb(0 0 0 / 48%)',
  Platinum: 'rgb(0 0 0 / 48%)',
  Californium: 'rgb(255 255 255 / 52%)',
  Diamond: 'rgb(0 0 0 / 48%)',
}

/**
 * Насыщенная обложка уровня — в языке карточек Events: тёмный цветной
 * градиент, поверх которого читаются белый текст и водяной знак.
 */
export const tierCover: Record<InvestorTier, string> = {
  Member: 'linear-gradient(140deg,#141c28 0%,#2b3949 45%,#4a5a72 100%)',
  Silver: 'linear-gradient(140deg,#161d27 0%,#39465a 45%,#7f8da3 100%)',
  Gold: 'linear-gradient(140deg,#1d1706 0%,#6b4f11 48%,#c9a53f 100%)',
  Platinum: 'linear-gradient(140deg,#0d1620 0%,#2e4a68 48%,#8fb0d0 100%)',
  Californium: 'linear-gradient(140deg,#050806 0%,#123021 50%,#2f9e63 100%)',
  Diamond: 'linear-gradient(140deg,#08202f 0%,#115e75 48%,#3b82f6 100%)',
}

/** Свечение поверх обложки — тот же приём, что на карточках Events. */
export const tierGlow: Record<InvestorTier, string> = {
  Member: '#94a3b8',
  Silver: '#cbd5e1',
  Gold: '#f2d98b',
  Platinum: '#bcd4ea',
  Californium: '#4ade80',
  Diamond: '#7dd3fc',
}

/* --- Производные от формулы -------------------------------------------
 * Держим обратный пересчёт рядом с самой формулой, чтобы «сколько денег
 * до следующего уровня» не разъезжалось с начислением баллов.
 */

/**
 * Капитал, который нужно разместить ради указанного числа баллов при
 * удержании весь период окна.
 */
export function capitalForPoints(points: number, longTerm = false): number {
  if (points <= 0) return 0
  const perThousand =
    SCORE_WINDOW_MONTHS * SCORE_RATES.perThousandPerMonth * (longTerm ? SCORE_RATES.longTermMultiplier : 1)
  return Math.ceil(points / perThousand) * 1000
}

/** Даты получения уровней. В мок-слое зашиты, в проде придут из истории счёта. */
export const tierAchievedAt: Partial<Record<InvestorTier, string>> = {
  Member: '12.03.2024',
  Silver: '26.08.2024',
  Gold: '14.02.2025',
  Platinum: '30.09.2025',
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
