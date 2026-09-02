import type {
  CapitalBreakdownItem,
  EventItem,
  FundingMethod,
  NotificationItem,
  Position,
  StrategyProduct,
  TransactionItem,
} from './types'

export const user = {
  name: 'Артём Дробков',
  initials: 'АД',
  greetingName: 'Артём',
  kycStatus: 'Пройден' as const,
  kycDate: '12.03.2024',
}

export const capitalTotals = {
  total: 250_000,
  available: 50_000,
  inWork: 200_000,
  ytdProfit: 8_420,
  ytdProfitPct: 3.48,
  netFlow: 35_000,
  netFlowPct: 16.28,
}

export const capitalBreakdown: CapitalBreakdownItem[] = [
  { key: 'earn', label: 'Earn', amount: 100_000, share: 40, color: 'var(--trigonum-blue)' },
  { key: 'strategies', label: 'Strategies', amount: 75_000, share: 30, color: 'var(--trigonum-violet)' },
  { key: 'available', label: 'Available', amount: 50_000, share: 20, color: '#7cc5f7' },
  { key: 'events', label: 'Events', amount: 25_000, share: 10, color: 'var(--trigonum-green)' },
]

export const positions: Position[] = [
  {
    id: 'pos-market-neutral',
    product: 'Market Neutral',
    kind: 'earn',
    invested: 50_000,
    profit: 3_420,
    yieldLabel: '+6.84%',
    currentValue: 53_420,
    openedAt: '2024-11-12',
    series: [50000, 50320, 50180, 50960, 51420, 51240, 52180, 52640, 52410, 53100, 53420],
  },
  {
    id: 'pos-system-alpha',
    product: 'System Alpha',
    kind: 'strategies',
    invested: 25_000,
    profit: 2_866,
    yieldLabel: '+11.46%',
    currentValue: 27_866,
    openedAt: '2024-08-03',
    series: [25000, 25240, 25120, 25780, 26310, 26140, 26820, 27240, 27080, 27610, 27866],
  },
  {
    id: 'pos-macro-rotation',
    product: 'Macro Rotation Event',
    kind: 'events',
    invested: 15_020,
    profit: 1_020,
    yieldLabel: '+6.8%',
    currentValue: 16_040,
    openedAt: '2025-03-18',
    series: [15020, 15180, 15090, 15420, 15680, 15540, 15810, 15960, 15880, 16010, 16040],
  },
  {
    id: 'pos-reserve-earn',
    product: 'Reserve Earn',
    kind: 'earn',
    invested: 100_000,
    profit: 1_950,
    yieldLabel: '≈7% p.a.',
    currentValue: 101_950,
    openedAt: '2025-01-09',
    series: [100000, 100180, 100360, 100540, 100730, 100910, 101100, 101290, 101480, 101720, 101950],
  },
]

export const capitalSeries: { label: string; value: number }[] = [
  { label: 'Янв 2024', value: 101_000 },
  { label: 'Фев 2024', value: 118_000 },
  { label: 'Мар 2024', value: 112_000 },
  { label: 'Апр 2024', value: 131_000 },
  { label: 'Май 2024', value: 149_000 },
  { label: 'Июн 2024', value: 143_000 },
  { label: 'Июл 2024', value: 162_000 },
  { label: 'Авг 2024', value: 178_000 },
  { label: 'Сен 2024', value: 171_000 },
  { label: 'Окт 2024', value: 190_000 },
  { label: 'Ноя 2024', value: 205_000 },
  { label: 'Дек 2024', value: 199_000 },
  { label: 'Янв 2025', value: 214_000 },
  { label: 'Фев 2025', value: 228_000 },
  { label: 'Мар 2025', value: 221_000 },
  { label: 'Апр 2025', value: 238_000 },
  { label: 'Май 2025', value: 250_000 },
]

export const notifications: NotificationItem[] = [
  {
    id: 'notif-crypto-recovery',
    title: 'Новая возможность',
    description: 'Crypto Recovery — окно входа открыто ограниченное время',
    cta: 'Рассмотреть',
    tone: 'warning',
  },
  {
    id: 'notif-market-neutral',
    title: 'Strategy «Market Neutral»',
    description: 'Показан результат +6.84% за период',
    tone: 'success',
  },
  {
    id: 'notif-report',
    title: 'Отчёт за май 2025 готов',
    description: 'Доступен для скачивания в разделе «Документы»',
    tone: 'info',
  },
]

export const accountStatuses = [
  { id: 'kyc', label: 'KYC verified', description: 'Верификация пройдена' },
  { id: '2fa', label: '2FA enabled', description: 'Двухфакторная аутентификация' },
  { id: 'funding', label: 'Funding active', description: 'Финансирование активно' },
]

const now = Date.now()

export const events: EventItem[] = [
  {
    id: 'event-crypto-recovery',
    title: 'Crypto Recovery Event',
    status: 'active',
    cover: 'crypto',
    description:
      'Событие создано на основе аномального падения ликвидности и восстановления спроса на криптовалюту.',
    targetRange: '+12% – 18%',
    horizon: '30 – 60 дней',
    risk: 'High',
    minAmount: 10_000,
    windowLabel: 'Окно входа',
    windowTarget: new Date(now + (17 * 3600 + 42 * 60 + 18) * 1000).toISOString(),
    progress: { current: 4_700_000, total: 10_000_000 },
  },
  {
    id: 'event-ai-infrastructure',
    title: 'AI Infrastructure Event',
    status: 'upcoming',
    cover: 'ai',
    description: 'Инфраструктурный цикл ИИ-дата-центров с точечным входом на аномалиях спроса.',
    targetRange: '+15% – 22%',
    horizon: '45 – 90 дней',
    risk: 'High',
    minAmount: 10_000,
    windowLabel: 'Открытие окна входа',
    windowTarget: new Date(now + (2 * 86400 + 14 * 3600 + 22 * 60) * 1000).toISOString(),
  },
  {
    id: 'event-emerging-markets',
    title: 'Emerging Markets Event',
    status: 'upcoming',
    cover: 'emerging',
    description: 'Точечная возможность на развивающихся рынках при подтверждённом развороте потоков капитала.',
    targetRange: '+10% – 16%',
    horizon: '30 – 60 дней',
    risk: 'Moderate',
    minAmount: 10_000,
    windowLabel: 'Открытие окна входа',
    windowTarget: new Date(now + (5 * 86400 + 8 * 3600 + 10 * 60) * 1000).toISOString(),
  },
  {
    id: 'event-macro-rotation',
    title: 'Macro Rotation Event',
    status: 'closed',
    cover: 'macro',
    description: 'Ротация между классами активов на смене макроцикла.',
    targetRange: '+8% – 14%',
    horizon: '30 дней',
    risk: 'Moderate',
    minAmount: 10_000,
    windowLabel: 'Закрыт',
    result: '+11.32%',
    participants: 312,
    closedDate: '12.05.2024',
  },
]

export const earnProduct = {
  title: 'Простой доход с высокой ликвидностью',
  description: 'Стабильная доходность без сложных решений',
  expectedYield: '~7%',
  minAmount: 1_000,
  tags: ['Высокая ликвидность', 'Без фиксации'],
}

export const strategies: StrategyProduct[] = [
  {
    id: 'strategy-balanced-growth',
    name: 'Balanced Growth',
    tagline: 'Сбалансированный рост',
    targetRange: '10 – 14%',
    horizon: '3 – 6 мес.',
    risk: 'Moderate',
  },
  {
    id: 'strategy-alpha-momentum',
    name: 'Alpha Momentum',
    tagline: 'Агрессивный рост',
    targetRange: '15 – 20%',
    horizon: '6 – 12 мес.',
    risk: 'High',
  },
]

export const fundingMethods: FundingMethod[] = [
  {
    id: 'card',
    title: 'Банковская карта',
    subtitle: 'Visa / Mastercard / МИР',
    points: ['Быстрое пополнение', 'Зачисление: обычно мгновенно', 'Комиссия провайдера возможна'],
    cta: 'Пополнить картой',
  },
  {
    id: 'crypto',
    title: 'Криптовалюта',
    subtitle: 'USDT / USDC / BTC',
    points: ['Выберите сеть', 'Зачисление после подтверждений', 'Реквизиты генерируются автоматически'],
    cta: 'Пополнить криптовалютой',
  },
  {
    id: 'transfer',
    title: 'Банковский перевод',
    subtitle: 'Для физ. и юр. лиц',
    points: ['Пополнение по реквизитам', 'Подходит для крупных сумм', 'Доступно для физ. и юр. лиц'],
    cta: 'Получить реквизиты',
  },
]

export const withdrawalMethods: FundingMethod[] = [
  {
    id: 'card',
    title: 'Банковская карта',
    subtitle: 'Visa / Mastercard / МИР',
    points: ['Вывод на привязанную карту', 'Обычно быстро', 'Комиссия провайдера возможна'],
    cta: 'Вывести на карту',
  },
  {
    id: 'crypto',
    title: 'Криптовалюта',
    subtitle: 'USDT / USDC / BTC',
    points: ['Выбор сети', 'Отправка на верифицированный кошелёк', 'Комиссия сети зависит от актива'],
    cta: 'Вывести криптовалюту',
  },
  {
    id: 'transfer',
    title: 'Банковский перевод',
    subtitle: 'Для физ. и юр. лиц',
    points: ['Вывод по реквизитам', 'Подходит для крупных сумм', 'Доступно для физ. и юр. лиц'],
    cta: 'Вывести переводом',
  },
]

const recentDeposits: TransactionItem[] = [
  { id: 'dep-1', date: '2025-05-24T15:20:00', type: 'deposit', title: 'Пополнение', description: 'USDT (TRC20)', amount: 10_000, status: 'completed' },
  { id: 'dep-2', date: '2025-05-23T11:45:00', type: 'deposit', title: 'Пополнение', description: 'Банковская карта', amount: 2_500, status: 'completed' },
  { id: 'dep-3', date: '2025-05-22T16:30:00', type: 'deposit', title: 'Пополнение', description: 'Банковский перевод', amount: 20_000, status: 'completed' },
  { id: 'dep-4', date: '2025-05-21T18:10:00', type: 'deposit', title: 'Пополнение', description: 'USDC (ERC20)', amount: 5_000, status: 'processing' },
]

const recentWithdrawals: TransactionItem[] = [
  { id: 'wd-1', date: '2025-05-22T16:30:00', type: 'withdrawal', title: 'Вывод', description: 'Банковская карта', amount: -12_000, status: 'completed' },
  { id: 'wd-2', date: '2025-05-21T14:15:00', type: 'withdrawal', title: 'Вывод', description: 'Банковский перевод', amount: -25_000, status: 'completed' },
  { id: 'wd-3', date: '2025-05-20T11:40:00', type: 'withdrawal', title: 'Вывод', description: 'USDT (TRC20)', amount: -8_500, status: 'processing' },
  { id: 'wd-4', date: '2025-05-19T09:20:00', type: 'withdrawal', title: 'Вывод', description: 'USDC (ERC20)', amount: -6_000, status: 'completed' },
]

const seedTransactions: TransactionItem[] = [
  { id: 'tx-1', date: '2025-05-24T14:32:00', type: 'deposit', title: 'Пополнение', description: 'Криптовалюта · USDT (TRC20)', amount: 25_000, status: 'completed' },
  { id: 'tx-2', date: '2025-05-23T09:15:00', type: 'transfer', title: 'Перевод', description: 'На Strategy Market Neutral', amount: -20_000, status: 'completed' },
  { id: 'tx-3', date: '2025-05-22T17:47:00', type: 'withdrawal', title: 'Вывод', description: 'Банковский перевод •••• 4587', amount: -10_000, status: 'completed' },
  { id: 'tx-4', date: '2025-05-22T12:04:00', type: 'accrual', title: 'Начисление', description: 'Доход Earn Reserve', amount: 120.45, status: 'completed' },
  { id: 'tx-5', date: '2025-05-21T19:30:00', type: 'transfer', title: 'Перевод', description: 'Между счетами · На Available', amount: -5_000, status: 'completed' },
  { id: 'tx-6', date: '2025-05-20T11:22:00', type: 'deposit', title: 'Пополнение', description: 'Банковский перевод · АО «ТРИГОНУМ»', amount: 50_000, status: 'completed' },
  { id: 'tx-7', date: '2025-05-19T16:18:00', type: 'accrual', title: 'Начисление', description: 'Доход Earn Reserve', amount: 98.3, status: 'completed' },
  { id: 'tx-8', date: '2025-05-18T14:05:00', type: 'transfer', title: 'Перевод', description: 'На Event Crypto Recovery', amount: -15_000, status: 'completed' },
  { id: 'tx-9', date: '2025-05-17T08:42:00', type: 'withdrawal', title: 'Вывод', description: 'USDT (TRC20) · TQd5...9f8a', amount: -7_500, status: 'completed' },
]

function generateFillerTransactions(count: number): TransactionItem[] {
  const templates: Array<Pick<TransactionItem, 'type' | 'title' | 'description'> & { min: number; max: number }> = [
    { type: 'accrual', title: 'Начисление', description: 'Доход Earn Reserve', min: 60, max: 210 },
    { type: 'accrual', title: 'Начисление', description: 'Доход Strategy System Alpha', min: 90, max: 340 },
    { type: 'deposit', title: 'Пополнение', description: 'Банковская карта', min: 1_000, max: 8_000 },
    { type: 'withdrawal', title: 'Вывод', description: 'USDT (TRC20)', min: -9_000, max: -1_500 },
    { type: 'transfer', title: 'Перевод', description: 'Между счетами · На Strategies', min: -12_000, max: -3_000 },
  ]

  const start = new Date('2025-05-16T10:00:00').getTime()
  return Array.from({ length: count }, (_, i) => {
    const template = templates[i % templates.length]
    const span = template.max - template.min
    const amount = Math.round((template.min + (span * ((i * 37) % 100)) / 100) * 100) / 100
    const date = new Date(start - i * 19 * 3600 * 1000).toISOString()
    return {
      id: `tx-filler-${i}`,
      date,
      type: template.type,
      title: template.title,
      description: template.description,
      amount,
      status: i % 11 === 0 ? 'processing' : 'completed',
    } satisfies TransactionItem
  })
}

export const transactions: TransactionItem[] = [...seedTransactions, ...generateFillerTransactions(31)]

export const fundingHistory = { deposits: recentDeposits, withdrawals: recentWithdrawals }
