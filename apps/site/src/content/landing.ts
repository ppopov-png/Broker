import type { Language } from '../i18n/I18nProvider'

/**
 * Контент новых секций лендинга. Держим одним модулем, а не по ключу на
 * строку: блоки табличные, и в разбитом виде три языка неизбежно
 * разъезжаются — часть лендинга молча выпадает на одном из них.
 *
 * Числа в контент не попадают дважды: ставки и комиссии берутся из
 * констант ниже, чтобы совпадать с регламентами №2 и №4.
 */

/* --- Цифры продукта. Единственное место, где они заданы. ---------------- */

export const PRODUCT_FACTS = {
  earn: { rate: '~7%', min: '$1 000', fee: '1%', liquidityDays: 7 },
  strategies: { rate: '8–20%', min: '$1 000', fee: '2% + 10–20%', hurdle: null },
  events: { rate: 'до 20%+', min: '$5 000', fee: '2% + 20%', hurdle: '8%' },
} as const

export interface ProductRow {
  id: 'earn' | 'strategies' | 'events'
  name: string
  tagline: string
  rate: string
  rateNote: string
  term: string
  liquidity: string
  min: string
  fee: string
  risk: string
}

export interface StepRow {
  title: string
  text: string
  time: string
}

export interface FaqRow {
  question: string
  answer: string
}

export interface TierRow {
  name: string
  perk: string
}

export interface LandingContent {
  stats: { value: string; label: string; note: string }[]
  products: {
    title: string
    subtitle: string
    note: string
    rows: ProductRow[]
    columns: { rate: string; term: string; liquidity: string; min: string; fee: string; risk: string; open: string; more: string }
  }
  how: { title: string; subtitle: string; steps: { title: string; text: string }[]; note: string }
  fees: {
    title: string
    subtitle: string
    rows: { product: string; management: string; result: string }[]
    columns: { product: string; management: string; result: string }
    neverTitle: string
    never: string[]
    note: string
  }
  custody: { title: string; subtitle: string; points: { title: string; text: string }[]; cta: string }
  tiers: { title: string; subtitle: string; rows: TierRow[]; note: string }
  open: { title: string; subtitle: string; steps: StepRow[]; needTitle: string; need: string; cta: string }
  compliance: { title: string; subtitle: string; points: { title: string; text: string }[]; link: string }
  faq: { title: string; rows: FaqRow[] }
  final: { title: string; text: string; cta: string; secondary: string }
  footer: { rights: string; risk: string; docs: string[] }
}

const ru: LandingContent = {
  stats: [
    { value: 'от $1 000', label: 'Минимальный вход', note: 'Earn и Strategies · от $5 000 в Events' },
    { value: '1 день', label: 'Решение по заявке', note: 'Проверка документов и открытие счёта' },
    { value: '7 дней', label: 'Окно вывода Earn', note: 'Тело выводится еженедельно, начисление ежедневно' },
    { value: '24/7', label: 'Поддержка', note: 'Чат, почта и Telegram, персональный менеджер с Platinum' },
  ],
  products: {
    title: 'Три способа разместить капитал',
    subtitle: 'Отличаются не только доходностью, но и тем, когда вы сможете забрать деньги.',
    note: 'Целевая доходность стратегий и Events — ориентир, а не обязательство. Фактический результат определяется по итогам периода.',
    columns: {
      rate: 'Доходность',
      term: 'Срок',
      liquidity: 'Когда заберу',
      min: 'Минимум',
      fee: 'Комиссия',
      risk: 'Риск',
      open: 'Открыть счёт',
      more: 'Подробнее',
    },
    rows: [
      {
        id: 'earn',
        name: 'Earn',
        tagline: 'Капитал работает, доступ остаётся',
        rate: PRODUCT_FACTS.earn.rate,
        rateNote: 'годовых, фиксированная ставка',
        term: 'Без срока',
        liquidity: 'Раз в неделю',
        min: PRODUCT_FACTS.earn.min,
        fee: `${PRODUCT_FACTS.earn.fee} годовых, уже в ставке`,
        risk: 'Низкий',
      },
      {
        id: 'strategies',
        name: 'Strategies',
        tagline: 'Три профиля: консервативный, умеренный, агрессивный',
        rate: PRODUCT_FACTS.strategies.rate,
        rateNote: 'целевая доходность годовых',
        term: '3–12 месяцев',
        liquidity: 'В конце срока',
        min: PRODUCT_FACTS.strategies.min,
        fee: `${PRODUCT_FACTS.strategies.fee} от прибыли`,
        risk: 'Консервативный · высокий',
      },
      {
        id: 'events',
        name: 'Events',
        tagline: 'Короткие сделки по сигналу TAIS',
        rate: PRODUCT_FACTS.events.rate,
        rateNote: 'целевая доходность за сделку',
        term: '7–30 дней',
        liquidity: 'При закрытии сделки',
        min: PRODUCT_FACTS.events.min,
        fee: `${PRODUCT_FACTS.events.fee} сверх ${PRODUCT_FACTS.events.hurdle}`,
        risk: 'Высокий',
      },
    ],
  },
  how: {
    title: 'Откуда берётся доходность',
    subtitle: 'TAIS — система анализа рынка Trigonum. Она ищет расхождения, которые держатся недолго, и превращает их в сделку с понятными границами.',
    steps: [
      { title: 'Сигнал', text: 'TAIS фиксирует рыночную аномалию: перекос позиционирования, движение ликвидности, расхождение потоков капитала.' },
      { title: 'Гипотеза', text: 'Аналитики проверяют сигнал и формулируют тезис: что покупаем, против чего, на каком горизонте и при каких условиях выходим.' },
      { title: 'Окно входа', text: 'Открывается ограниченный объём. Когда капитал распределён, вход закрывается — размер позиции определяется идеей, а не спросом.' },
      { title: 'Закрытие', text: 'Позиция закрывается по достижении цели или по стоп-условию. Результат распределяется между участниками, комиссия берётся только с прибыли.' },
    ],
    note: 'Часть капитала в каждом Event — собственные средства Trigonum. Мы в одной позиции с инвесторами, а не рядом с ней.',
  },
  fees: {
    title: 'Сколько мы берём',
    subtitle: 'В Earn берём только за управление. В стратегиях и Events участвуем в прибыли — доля зависит от профиля риска.',
    columns: { product: 'Продукт', management: 'За управление', result: 'За результат' },
    rows: [
      { product: 'Earn', management: '1% годовых', result: 'Нет' },
      { product: 'Strategies', management: '2% годовых', result: '10–20% от прибыли по профилю риска' },
      { product: 'Events', management: '2% годовых', result: '20% сверх 8% годовых' },
    ],
    neverTitle: 'Чего мы не берём',
    never: [
      'За ввод средств',
      'За вывод средств',
      'За неактивность счёта',
      'С нереализованной прибыли',
      'Скрытого спреда сверх раскрытого',
    ],
    note: 'Ставка Earn публикуется чистой: 1% годовых уже удержан. В стратегиях доля берётся с любой прибыли по базовой ставке, а повышенная — только с части сверх целевой доходности. При убытке комиссия за результат не взимается ни в стратегиях, ни в Events.',
  },
  custody: {
    title: 'Где лежат ваши средства',
    subtitle: 'Не на общем адресе биржи и не «где-то у брокера». У каждого клиента свой счёт хранения, открытый по договору.',
    points: [
      { title: 'Собственные реквизиты', text: 'Вы получаете адрес, закреплённый за вашим счётом. Переводите с любого кошелька или биржи, не подключая их к кабинету.' },
      { title: 'Только по договору', text: 'Счёт открывается по заявке и подписанному договору. Адрес выдаётся после подписания — не раньше.' },
      { title: 'Поддерживаемые сети', text: 'Arbitrum, Ethereum, TRON и Base. Актив и минимальная сумма зависят от сети и указаны в договоре.' },
      { title: 'Учёт и вывод', text: 'Зачисление отражается в кабинете после подтверждений сети. Вывод — только на реквизиты, подтверждённые вами заранее.' },
    ],
    cta: 'Как открыть счёт хранения',
  },
  tiers: {
    title: 'Чем дольше и больше — тем лучше условия',
    subtitle: 'Уровень считается по баллам за капитал, срок отношений, участие в программах и приглашённых инвесторов.',
    rows: [
      { name: 'Member', perk: 'Earn и базовые продукты, поддержка 24/7' },
      { name: 'Silver', perk: 'Открываются Strategies, комиссия вывода 0.75%' },
      { name: 'Gold', perk: 'Ранний доступ к Events, приоритетная поддержка' },
      { name: 'Platinum', perk: 'Персональный менеджер, закрытые Events, ставка Earn выше' },
      { name: 'Californium', perk: 'Приватные сделки, co-investment, вывод без комиссии' },
      { name: 'Diamond', perk: 'Клубные сделки, управляющий партнёр, бессрочный статус' },
    ],
    note: 'Уровень пересматривается раз в квартал, снижается не более чем на ступень и не раньше чем через 30 дней после предупреждения.',
  },
  open: {
    title: 'Как открыть счёт',
    subtitle: 'Четыре шага. Между ними ничего не теряется: заявку можно продолжить с того места, где остановились.',
    steps: [
      { title: 'Регистрация', text: 'Имя, email и пароль. Подтверждаете почту по ссылке из письма.', time: '5 минут' },
      { title: 'Проверка личности', text: 'Паспорт и селфи через сервис проверки. Данные заполняют профиль автоматически.', time: '10 минут' },
      { title: 'Анкета и соглашения', text: 'Самосертификация инвестора и подписание документов. Всё остаётся в кабинете.', time: '10 минут' },
      { title: 'Решение', text: 'Комплаенс проверяет заявку. После одобрения счёт открыт и доступны все продукты.', time: 'до 1 рабочего дня' },
    ],
    needTitle: 'Что понадобится',
    need: 'Паспорт или ID-карта, камера для селфи и адрес электронной почты.',
    cta: 'Открыть счёт',
  },
  compliance: {
    title: 'Регулирование и безопасность',
    subtitle: 'Мы работаем в лицензируемой юрисдикции и отчитываемся перед регулятором. Это проверяется, а не декларируется.',
    points: [
      { title: 'Лицензия ФСА КР', text: 'Служба регулирования и надзора за финансовым рынком Кыргызской Республики. Сведения о лицензии — в открытом реестре регулятора.' },
      { title: 'AML · KYC · CFT', text: 'Идентификация клиента, проверка источника средств и скрининг операций по санкционным спискам.' },
      { title: 'Отчётность', text: 'Выписка по счёту в форме, принятой в вашей юрисдикции — Кыргызстан и Россия. Формируется в кабинете.' },
      { title: 'Защита доступа', text: 'Двухфакторная аутентификация, журнал сессий и устройств, подтверждение операций и журнал подписанных документов.' },
    ],
    link: 'Реестр регулятора',
  },
  faq: {
    title: 'Вопросы',
    rows: [
      { question: 'С какой суммы можно начать?', answer: 'От $1 000 в Earn и Strategies, от $5 000 в Events. Верхнего порога нет, но крупные суммы проходят расширенную проверку источника средств.' },
      { question: 'Как быстро я смогу забрать деньги?', answer: 'Из Earn — в еженедельное окно вывода, тело возвращается целиком. Из стратегии — в конце срока договора. Из Event — при закрытии сделки. Досрочный выход из стратегии возможен с перерасчётом по фактическому сроку.' },
      { question: 'Что будет, если рынок упадёт?', answer: 'Ставка Earn зафиксирована договором и не зависит от рынка. Стратегии и Events — рыночные продукты: результат может быть отрицательным. Комиссия за результат при убытке не взимается.' },
      { question: 'Кто распоряжается моими средствами?', answer: 'Средства хранятся на кошельке Trigonum, ключами распоряжается брокер. Вы получаете адрес для пополнения и право распоряжения через кабинет. Вывод возможен только на реквизиты, которые вы подтвердили заранее.' },
      { question: 'Что с налогами?', answer: 'Налоговые обязательства зависят от вашего налогового резидентства. Мы формируем отчёт о движении средств по счёту в форме, принятой в Кыргызстане и России, — его можно использовать для декларирования.' },
      { question: 'Что если в открытии счёта откажут?', answer: 'Вы получите решение с причиной. Средства на счёт до одобрения не принимаются, поэтому возвращать нечего. Повторная заявка возможна через 30 дней.' },
      { question: 'Можно ли закрыть счёт и забрать всё?', answer: 'Да. Действующие договоры закрываются по своим условиям, свободный остаток выводится на подтверждённые реквизиты. Документы и журнал согласий остаются доступны.' },
    ],
  },
  final: {
    title: 'Открыть счёт',
    text: 'Регистрация занимает пять минут, решение по заявке — до одного рабочего дня. Средства принимаются только после открытия счёта.',
    cta: 'Открыть счёт',
    secondary: 'Войти в кабинет',
  },
  footer: {
    rights: '© 2026 Trigonum Broker. Все права защищены.',
    risk: 'Инвестиции в цифровые активы связаны с риском частичной или полной потери вложенного капитала. Целевая доходность не является гарантией. Результаты прошлых периодов не определяют будущие. Настоящий сайт не является публичной офертой и индивидуальной инвестиционной рекомендацией.',
    docs: ['Публичная оферта', 'Политика обработки персональных данных', 'Раскрытие рисков', 'Политика AML/KYC'],
  },
}

const en: LandingContent = {
  stats: [
    { value: 'from $1,000', label: 'Minimum entry', note: 'Earn and Strategies · from $5,000 in Events' },
    { value: '1 day', label: 'Application decision', note: 'Document review and account opening' },
    { value: '7 days', label: 'Earn withdrawal window', note: 'Principal weekly, accrual daily' },
    { value: '24/7', label: 'Support', note: 'Chat, email and Telegram; personal manager from Platinum' },
  ],
  products: {
    title: 'Three ways to deploy capital',
    subtitle: 'They differ not only in return, but in when you can take your money back.',
    note: 'Target returns for Strategies and Events are a guideline, not an obligation. Actual results are determined at the end of the period.',
    columns: { rate: 'Return', term: 'Term', liquidity: 'Access', min: 'Minimum', fee: 'Fee', risk: 'Risk', open: 'Open account', more: 'Learn more' },
    rows: [
      { id: 'earn', name: 'Earn', tagline: 'Capital works, access stays', rate: PRODUCT_FACTS.earn.rate, rateNote: 'annual, fixed rate', term: 'Open-ended', liquidity: 'Weekly', min: PRODUCT_FACTS.earn.min, fee: `${PRODUCT_FACTS.earn.fee} annual, already in the rate`, risk: 'Low' },
      { id: 'strategies', name: 'Strategies', tagline: 'Three profiles: conservative, moderate, aggressive', rate: PRODUCT_FACTS.strategies.rate, rateNote: 'target annual return', term: '3–12 months', liquidity: 'At term end', min: PRODUCT_FACTS.strategies.min, fee: `${PRODUCT_FACTS.strategies.fee} of profit`, risk: 'Conservative · high' },
      { id: 'events', name: 'Events', tagline: 'Short trades on a TAIS signal', rate: PRODUCT_FACTS.events.rate, rateNote: 'target return per trade', term: '7–30 days', liquidity: 'On trade close', min: PRODUCT_FACTS.events.min, fee: `${PRODUCT_FACTS.events.fee} above ${PRODUCT_FACTS.events.hurdle}`, risk: 'High' },
    ],
  },
  how: {
    title: 'Where the return comes from',
    subtitle: 'TAIS is the Trigonum market analysis system. It looks for dislocations that do not last long and turns them into a trade with defined boundaries.',
    steps: [
      { title: 'Signal', text: 'TAIS detects a market anomaly: positioning skew, liquidity shift, divergence in capital flows.' },
      { title: 'Thesis', text: 'Analysts verify the signal and state the case: what we buy, against what, over which horizon and on what exit conditions.' },
      { title: 'Entry window', text: 'A limited size opens. Once capital is allocated, entry closes — position size follows the idea, not demand.' },
      { title: 'Close', text: 'The position closes on target or stop. The result is distributed among participants; the fee applies to profit only.' },
    ],
    note: 'Part of the capital in every Event is Trigonum’s own. We are in the position with investors, not beside it.',
  },
  fees: {
    title: 'What we charge',
    subtitle: 'In Earn we charge management only. In Strategies and Events we share the profit — the rate follows the risk profile.',
    columns: { product: 'Product', management: 'Management', result: 'Result' },
    rows: [
      { product: 'Earn', management: '1% annual', result: 'None' },
      { product: 'Strategies', management: '2% annual', result: '10–20% of profit by risk profile' },
      { product: 'Events', management: '2% annual', result: '20% above 8% annual' },
    ],
    neverTitle: 'What we never charge',
    never: ['Deposit fees', 'Withdrawal fees', 'Inactivity fees', 'Fees on unrealised profit', 'Any spread beyond the disclosed one'],
    note: 'The Earn rate is published net: the 1% is already deducted. In Strategies the base share applies to any profit, while the higher rate applies only above the target return. No result fee is charged on a loss, in Strategies or Events.',
  },
  custody: {
    title: 'Where your funds are held',
    subtitle: 'Not on a shared exchange address and not «somewhere at the broker». Every client gets a custody account opened under a contract.',
    points: [
      { title: 'Your own address', text: 'You receive an address tied to your account. Transfer from any wallet or exchange without connecting it to the cabinet.' },
      { title: 'Contract first', text: 'The account opens on an application and a signed contract. The address is issued after signing — not before.' },
      { title: 'Supported networks', text: 'Arbitrum, Ethereum, TRON and Base. Asset and minimum depend on the network and are stated in the contract.' },
      { title: 'Accounting and withdrawal', text: 'Deposits appear in the cabinet after network confirmations. Withdrawals go only to details you confirmed in advance.' },
    ],
    cta: 'How a custody account works',
  },
  tiers: {
    title: 'The longer and larger, the better the terms',
    subtitle: 'Your tier is scored on capital, tenure, participation in programmes and invited investors.',
    rows: [
      { name: 'Member', perk: 'Earn and base products, 24/7 support' },
      { name: 'Silver', perk: 'Strategies unlocked, 0.75% withdrawal fee' },
      { name: 'Gold', perk: 'Early access to Events, priority support' },
      { name: 'Platinum', perk: 'Personal manager, closed Events, higher Earn rate' },
      { name: 'Californium', perk: 'Private deals, co-investment, no withdrawal fee' },
      { name: 'Diamond', perk: 'Club deals, managing partner, permanent status' },
    ],
    note: 'Tiers are reviewed quarterly, drop by no more than one step, and never sooner than 30 days after a warning.',
  },
  open: {
    title: 'How to open an account',
    subtitle: 'Four steps. Nothing is lost in between: you can resume the application where you left off.',
    steps: [
      { title: 'Registration', text: 'Name, email and password. Confirm your email via the link we send.', time: '5 minutes' },
      { title: 'Identity check', text: 'Passport and selfie through the verification service. Your profile is filled in automatically.', time: '10 minutes' },
      { title: 'Questionnaire and agreements', text: 'Investor self-certification and document signing. Everything stays in the cabinet.', time: '10 minutes' },
      { title: 'Decision', text: 'Compliance reviews the application. Once approved, the account is open and all products are available.', time: 'up to 1 business day' },
    ],
    needTitle: 'What you will need',
    need: 'A passport or ID card, a camera for the selfie and an email address.',
    cta: 'Open account',
  },
  compliance: {
    title: 'Regulation and security',
    subtitle: 'We operate in a licensed jurisdiction and report to the regulator. This is verifiable, not declared.',
    points: [
      { title: 'FSA licence', text: 'Financial Market Regulation and Supervision Service of the Kyrgyz Republic. Licence details are in the regulator’s public register.' },
      { title: 'AML · KYC · CFT', text: 'Client identification, source of funds checks and screening of transactions against sanctions lists.' },
      { title: 'Reporting', text: 'An account statement in the form accepted in your jurisdiction — Kyrgyzstan and Russia. Generated in the cabinet.' },
      { title: 'Access protection', text: 'Two-factor authentication, session and device log, operation confirmation and a log of signed documents.' },
    ],
    link: 'Regulator register',
  },
  faq: {
    title: 'Questions',
    rows: [
      { question: 'What is the minimum to start?', answer: 'From $1,000 in Earn and Strategies, from $5,000 in Events. There is no upper limit, but large amounts go through extended source-of-funds review.' },
      { question: 'How quickly can I withdraw?', answer: 'From Earn — in the weekly withdrawal window, principal in full. From a strategy — at the end of the contract term. From an Event — on trade close. Early exit from a strategy is possible with a recalculation for the actual period.' },
      { question: 'What happens if the market falls?', answer: 'The Earn rate is fixed by contract and independent of the market. Strategies and Events are market products: the result can be negative. No result fee is charged on a loss.' },
      { question: 'Who controls my funds?', answer: 'Funds are held in Trigonum’s wallet and the broker controls the keys. You receive a deposit address and control through the cabinet. Withdrawals are only possible to details you confirmed in advance.' },
      { question: 'What about taxes?', answer: 'Tax obligations depend on your tax residency. We generate an account movement report in the form accepted in Kyrgyzstan and Russia, which can be used for filing.' },
      { question: 'What if my application is declined?', answer: 'You receive a decision with a reason. Funds are not accepted before approval, so there is nothing to return. A new application is possible after 30 days.' },
      { question: 'Can I close the account and take everything?', answer: 'Yes. Active contracts close on their own terms, the free balance is withdrawn to confirmed details. Documents and the consent log remain available.' },
    ],
  },
  final: {
    title: 'Open an account',
    text: 'Registration takes five minutes, the decision up to one business day. Funds are accepted only after the account is open.',
    cta: 'Open account',
    secondary: 'Log in',
  },
  footer: {
    rights: '© 2026 Trigonum Broker. All rights reserved.',
    risk: 'Investing in digital assets involves the risk of partial or total loss of capital. Target returns are not guaranteed. Past results do not determine future performance. This site is not a public offer or individual investment advice.',
    docs: ['Public offer', 'Personal data policy', 'Risk disclosure', 'AML/KYC policy'],
  },
}

/**
 * Кыргызская версия переведена по русской и требует вычитки носителем
 * перед публикацией. Оставлять блоки непереведёнными нельзя: часть
 * лендинга молча выпадала бы на одном из трёх языков.
 */
const ky: LandingContent = {
  stats: [
    { value: '$1 000дөн', label: 'Минималдык кирүү', note: 'Earn жана Strategies · Events боюнча $5 000дөн' },
    { value: '1 күн', label: 'Арыз боюнча чечим', note: 'Документтерди текшерүү жана эсеп ачуу' },
    { value: '7 күн', label: 'Earn алуу терезеси', note: 'Негизги сумма жумасына бир жолу, кошумчалоо күн сайын' },
    { value: '24/7', label: 'Колдоо', note: 'Чат, почта жана Telegram; Platinum’ден жеке менеджер' },
  ],
  products: {
    title: 'Капиталды жайгаштыруунун үч жолу',
    subtitle: 'Алар кирешеси менен гана эмес, акчаңызды качан кайра ала турганыңыз менен айырмаланат.',
    note: 'Strategies жана Events боюнча максаттуу киреше — багыт, милдеттенме эмес. Иш жүзүндөгү натыйжа мезгилдин аягында аныкталат.',
    columns: { rate: 'Киреше', term: 'Мөөнөт', liquidity: 'Качан алам', min: 'Минимум', fee: 'Комиссия', risk: 'Тобокел', open: 'Эсеп ачуу', more: 'Толугураак' },
    rows: [
      { id: 'earn', name: 'Earn', tagline: 'Капитал иштейт, жетүү мүмкүнчүлүгү калат', rate: PRODUCT_FACTS.earn.rate, rateNote: 'жылдык, туруктуу ставка', term: 'Мөөнөтсүз', liquidity: 'Жумасына бир жолу', min: PRODUCT_FACTS.earn.min, fee: `${PRODUCT_FACTS.earn.fee} жылдык, ставкада эсептелген`, risk: 'Төмөн' },
      { id: 'strategies', name: 'Strategies', tagline: 'Тобокел деңгээлиңизге ылайык башкарылуучу стратегиялар', rate: PRODUCT_FACTS.strategies.rate, rateNote: 'максаттуу жылдык киреше', term: '3–12 ай', liquidity: 'Мөөнөт аягында', min: PRODUCT_FACTS.strategies.min, fee: `${PRODUCT_FACTS.strategies.fee} кирешеден`, risk: 'Консервативдүү · жогорку' },
      { id: 'events', name: 'Events', tagline: 'TAIS сигналы боюнча кыска бүтүмдөр', rate: PRODUCT_FACTS.events.rate, rateNote: 'бүтүм боюнча максаттуу киреше', term: '7–30 күн', liquidity: 'Бүтүм жабылганда', min: PRODUCT_FACTS.events.min, fee: `${PRODUCT_FACTS.events.fee}, ${PRODUCT_FACTS.events.hurdle} үстүнөн`, risk: 'Жогорку' },
    ],
  },
  how: {
    title: 'Киреше кайдан келет',
    subtitle: 'TAIS — Trigonum’дун рынокту талдоо системасы. Ал узакка созулбаган айырмачылыктарды издеп, аларды чектери түшүнүктүү бүтүмгө айландырат.',
    steps: [
      { title: 'Сигнал', text: 'TAIS рыноктук аномалияны байкайт: позициялардын кыйшаюусу, ликвиддүүлүктүн жылышы, капитал агымдарынын айырмасы.' },
      { title: 'Гипотеза', text: 'Аналитиктер сигналды текшерип, тезис түзөт: эмнени, эмнеге каршы, кандай мөөнөттө жана кандай шартта чыгабыз.' },
      { title: 'Кирүү терезеси', text: 'Чектелген көлөм ачылат. Капитал бөлүштүрүлгөндөн кийин кирүү жабылат — көлөм суроо-талап эмес, идея менен аныкталат.' },
      { title: 'Жабылуу', text: 'Позиция максатка жеткенде же стоп боюнча жабылат. Натыйжа катышуучуларга бөлүштүрүлөт, комиссия киреше менен гана алынат.' },
    ],
    note: 'Ар бир Event’теги капиталдын бир бөлүгү — Trigonum’дун өз каражаты. Биз инвесторлор менен бир позициядабыз.',
  },
  fees: {
    title: 'Биз канча алабыз',
    subtitle: 'Earn боюнча башкаруу үчүн гана алабыз. Strategies жана Events’те кирешеге катышабыз — үлүш тобокел профилине жараша.',
    columns: { product: 'Продукт', management: 'Башкаруу үчүн', result: 'Натыйжа үчүн' },
    rows: [
      { product: 'Earn', management: 'жылдык 1%', result: 'Жок' },
      { product: 'Strategies', management: 'жылдык 2%', result: 'тобокел профили боюнча кирешеден 10–20%' },
      { product: 'Events', management: 'жылдык 2%', result: 'жылдык 8% үстүнөн 20%' },
    ],
    neverTitle: 'Биз эмне албайбыз',
    never: ['Каражат киргизүү үчүн', 'Каражат чыгаруу үчүн', 'Эсептин активсиздиги үчүн', 'Ишке ашпаган кирешеден', 'Ачыкталгандан тышкары жашыруун спред'],
    note: 'Earn ставкасы таза жарыяланат: 1% мурунтан кармалган. Стратегияларда базалык үлүш ар кандай кирешеден, жогорулатылганы максаттуу кирешеден ашкан бөлүктөн гана алынат. Зыян болгондо натыйжа комиссиясы алынбайт.',
  },
  custody: {
    title: 'Каражатыңыз кайда сакталат',
    subtitle: 'Биржанын жалпы дарегинде эмес. Ар бир кардардын келишим боюнча ачылган өз сактоо эсеби бар.',
    points: [
      { title: 'Өз реквизиттериңиз', text: 'Эсебиңизге бекитилген дарек аласыз. Каалаган капчыктан же биржадан которо аласыз.' },
      { title: 'Келишим менен гана', text: 'Эсеп арыз жана кол коюлган келишим боюнча ачылат. Дарек кол коюлгандан кийин берилет.' },
      { title: 'Колдоого алынган тармактар', text: 'Arbitrum, Ethereum, TRON жана Base. Актив жана минималдык сумма тармакка көз каранды.' },
      { title: 'Эсепке алуу жана чыгаруу', text: 'Түшкөн каражат тармактын ырастоолорунан кийин кабинетте көрүнөт. Чыгаруу — алдын ала ырасталган реквизиттерге гана.' },
    ],
    cta: 'Сактоо эсеби кантип иштейт',
  },
  tiers: {
    title: 'Канчалык узак жана көп — шарттар ошончолук жакшы',
    subtitle: 'Деңгээл капитал, мамиленин мөөнөтү, программаларга катышуу жана чакырылган инвесторлор боюнча эсептелет.',
    rows: [
      { name: 'Member', perk: 'Earn жана негизги продуктулар, 24/7 колдоо' },
      { name: 'Silver', perk: 'Strategies ачылат, чыгаруу комиссиясы 0.75%' },
      { name: 'Gold', perk: 'Events’ке эрте жетүү, артыкчылыктуу колдоо' },
      { name: 'Platinum', perk: 'Жеке менеджер, жабык Events, жогорку Earn ставкасы' },
      { name: 'Californium', perk: 'Жеке бүтүмдөр, co-investment, комиссиясыз чыгаруу' },
      { name: 'Diamond', perk: 'Клубдук бүтүмдөр, башкаруучу өнөктөш, мөөнөтсүз статус' },
    ],
    note: 'Деңгээл кварталына бир жолу каралат, бир баскычтан ашык төмөндөбөйт жана эскертүүдөн 30 күн өтпөй өзгөрбөйт.',
  },
  open: {
    title: 'Эсепти кантип ачуу керек',
    subtitle: 'Төрт кадам. Арызды токтогон жериңизден улантууга болот.',
    steps: [
      { title: 'Каттоо', text: 'Аты-жөнү, email жана сырсөз. Почтаны каттан келген шилтеме менен ырастайсыз.', time: '5 мүнөт' },
      { title: 'Инсандыкты текшерүү', text: 'Паспорт жана селфи. Маалыматтар профилди автоматтык түрдө толтурат.', time: '10 мүнөт' },
      { title: 'Анкета жана келишимдер', text: 'Инвестордун өз-өзүн сертификациялоосу жана документтерге кол коюу.', time: '10 мүнөт' },
      { title: 'Чечим', text: 'Комплаенс арызды текшерет. Жактыргандан кийин эсеп ачылат.', time: '1 жумуш күнүнө чейин' },
    ],
    needTitle: 'Эмне керек болот',
    need: 'Паспорт же ID-карта, селфи үчүн камера жана электрондук почта дареги.',
    cta: 'Эсеп ачуу',
  },
  compliance: {
    title: 'Жөнгө салуу жана коопсуздук',
    subtitle: 'Биз лицензияланган юрисдикцияда иштейбиз жана жөнгө салуучуга отчёт беребиз.',
    points: [
      { title: 'КР ФКЖ лицензиясы', text: 'Кыргыз Республикасынын Финансы рыногун жөнгө салуу жана көзөмөлдөө кызматы. Лицензия жөнүндө маалымат ачык реестрде.' },
      { title: 'AML · KYC · CFT', text: 'Кардарды идентификациялоо, каражаттын булагын текшерүү жана санкциялык тизмелер боюнча скрининг.' },
      { title: 'Отчёттуулук', text: 'Юрисдикцияңызда кабыл алынган формадагы эсеп боюнча көчүрмө — Кыргызстан жана Россия.' },
      { title: 'Жетүүнү коргоо', text: 'Эки факторлуу аутентификация, сессиялардын журналы, операцияларды ырастоо жана кол коюлган документтердин журналы.' },
    ],
    link: 'Жөнгө салуучунун реестри',
  },
  faq: {
    title: 'Суроолор',
    rows: [
      { question: 'Кандай суммадан баштаса болот?', answer: 'Earn жана Strategies боюнча $1 000, Events боюнча $5 000. Жогорку чек жок, бирок ири суммалар булагын кеңири текшерүүдөн өтөт.' },
      { question: 'Акчаны канчалык тез ала алам?', answer: 'Earn’ден — жума сайынкы терезеде, негизги сумма толук. Стратегиядан — келишимдин аягында. Event’тен — бүтүм жабылганда.' },
      { question: 'Рынок түшүп кетсе эмне болот?', answer: 'Earn ставкасы келишим менен бекитилген жана рынокко көз каранды эмес. Strategies жана Events — рыноктук продуктулар, натыйжа терс болушу мүмкүн. Зыянга комиссия алынбайт.' },
      { question: 'Каражатымды ким башкарат?', answer: 'Каражат Trigonum капчыгында сакталат, ачкычтарды брокер башкарат. Сиз толуктоо үчүн дарек жана кабинет аркылуу башкаруу укугун аласыз.' },
      { question: 'Салыктар боюнча эмне?', answer: 'Салык милдеттенмелери сиздин салык резиденттигиңизге көз каранды. Биз Кыргызстанда жана Россияда кабыл алынган формада отчёт түзөбүз.' },
      { question: 'Эсеп ачуудан баш тартылса эмне болот?', answer: 'Сиз себеби менен чечим аласыз. Жактыруудан мурун каражат кабыл алынбайт. Кайра арыз 30 күндөн кийин мүмкүн.' },
      { question: 'Эсепти жаап, баарын алса болобу?', answer: 'Ооба. Колдонуудагы келишимдер өз шарттары боюнча жабылат, эркин калдык ырасталган реквизиттерге чыгарылат.' },
    ],
  },
  final: {
    title: 'Эсеп ачуу',
    text: 'Каттоо беш мүнөт алат, арыз боюнча чечим — бир жумуш күнүнө чейин. Каражат эсеп ачылгандан кийин гана кабыл алынат.',
    cta: 'Эсеп ачуу',
    secondary: 'Кабинетке кирүү',
  },
  footer: {
    rights: '© 2026 Trigonum Broker. Бардык укуктар корголгон.',
    risk: 'Санариптик активдерге инвестициялоо капиталды жарым-жартылай же толук жоготуу тобокелдиги менен байланышкан. Максаттуу киреше кепилдик эмес. Өткөн мезгилдин натыйжалары келечекти аныктабайт. Бул сайт коомдук оферта жана жеке инвестициялык сунуш эмес.',
    docs: ['Коомдук оферта', 'Жеке маалыматтарды иштетүү саясаты', 'Тобокелдиктерди ачыкка чыгаруу', 'AML/KYC саясаты'],
  },
}

const content: Record<Language, LandingContent> = { ru, en, ky }

export function landingContent(language: Language): LandingContent {
  return content[language]
}
