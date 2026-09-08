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
  strategies: { rate: '8–20%', min: '$1 000', fee: '1% + 10%', hurdle: null },
  events: { rate: 'до 20%+', min: '$5 000', fee: '1% + 20%', hurdle: null },
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
    /** Подписи к трём числам доказательства. Значения считаются из данных. */
    proof: Record<ProductRow['id'], [string, string, string]>
    /** Заголовок и подсказка к графику продукта. */
    visual: Record<ProductRow['id'], { title: string; hint: string }>
  }
  how: {
    title: string
    subtitle: string
    steps: { title: string; text: string; metrics: { value: string; label: string }[] }[]
    flow: { sources: string; core: string; products: string; share: string }
    /** Подписи внутри иллюстраций. Держим тут же, иначе картинки останутся русскими. */
    art: {
      algo: { venueA: string; venueB: string; close: string; spread: string }
      team: { committee: string; accepted: string; rejected: string }
      tais: { feeds: string }
      liquidity: { capital: string; desks: [string, string, string]; coupon: string }
    }
    note: string
  }
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
  results: {
    title: string
    subtitle: string
    investorsTitle: string
    investorsNote: string
    columns: { investor: string; tier: string; capital: string; profit: string; mix: string; since: string }
    eventsTitle: string
    eventsNote: string
    eventLabels: { days: string; investors: string; kept: string }
    note: string
  }
  calculator: {
    title: string
    subtitle: string
    goalLabel: string
    yearsLabel: string
    yearsUnit: (n: number) => string
    columns: { plan: string; net: string; lump: string; monthly: string }
    netNote: string
    monthlyNote: string
    tickerTitle: string
    tickerCaption: string
    tickerText: string
    note: string
  }
  /** Подписи внутри графиков продуктов. Значения приходят из данных. */
  charts: {
    events: { average: string; best: string; worst: string; days: string }
    strategies: { drawdown: string }
    earn: { monthsShort: string; base: string; windows: string; rows: [string, string][] }
  }
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
    proof: {
      events: ['сделок закрыто в плюс', 'заработали инвесторы', 'средний срок сделки'],
      strategies: ['под управлением', 'заработали за 12 месяцев', 'инвесторов в стратегиях'],
      earn: ['под управлением', 'выплачено дохода', 'месяцев без задержек выплат'],
    },
    visual: {
      events: { title: 'Результат последних 10 закрытых сделок', hint: 'Наведите на столбец — покажем сделку' },
      strategies: { title: 'Накопленная доходность по кварталам', hint: 'Наведите на линию — покажем стратегию' },
      earn: { title: 'Рост $100 000 за 12 месяцев', hint: 'Доход начисляется каждый день, тело выводится раз в неделю' },
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
        fee: `${PRODUCT_FACTS.earn.fee} при пополнении, уже в ставке`,
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
        fee: `${PRODUCT_FACTS.events.fee} от прибыли`,
        risk: 'Высокий',
      },
    ],
  },
  how: {
    title: 'Откуда берётся доходность',
    subtitle: 'Не из одного источника. Доход складывается из трёх направлений, а TAIS — ядро архитектуры, через которое проходит каждое решение.',
    steps: [
      {
        title: 'Алгоритмическая торговля',
        text: 'Собственные торговые алгоритмы работают круглосуточно на арбитраже, маркет-мейкинге и расхождениях цены между площадками. Там, где решает скорость, человек не участвует.',
        metrics: [
          { value: '< 40 мс', label: 'реакция на расхождение цены' },
          { value: '6 площадок', label: 'одновременно под наблюдением' },
        ],
      },
      {
        title: 'Управление командой',
        text: 'Трейдеры и аналитики ведут направленные позиции там, где нужны решение человека и понимание контекста, а не скорость. Каждая идея защищается перед инвесткомитетом.',
        metrics: [
          { value: '11 лет', label: 'средний опыт управляющих' },
          { value: '2 из 3', label: 'идей не проходят комитет' },
        ],
      },
      {
        title: 'TAIS как ядро',
        text: 'Система анализа рынка собирает данные с бирж и ончейна, находит аномалии и оценивает риск. Через неё проходит каждая идея — и от алгоритма, и от человека: она не торгует, а решает, какого размера позиция допустима.',
        metrics: [
          { value: '100%', label: 'идей проходят оценку риска' },
          { value: '2,1 млн', label: 'сигналов обрабатывается в сутки' },
        ],
      },
      {
        title: 'Размещение ликвидности',
        text: 'Часть капитала работает в кредитовании и на предоставлении ликвидности. Это самый предсказуемый источник — именно им обеспечена фиксированная ставка Earn.',
        metrics: [
          { value: '~7%', label: 'ставка, которую видит инвестор' },
          { value: '18 мес.', label: 'без единой задержки выплаты' },
        ],
      },
    ],
    flow: { sources: 'Источники дохода', core: 'Оценка риска', products: 'Продукты', share: 'доля в доходе' },
    art: {
      algo: { venueA: 'Площадка A', venueB: 'Площадка B', close: 'закрытие расхождения', spread: '+0,8%' },
      team: { committee: 'инвесткомитет', accepted: 'Идея принята', rejected: 'Отклонена' },
      tais: { feeds: 'биржи · ончейн · деривативы' },
      liquidity: {
        capital: 'Капитал',
        desks: ['Кредитование', 'Пулы ликвидности', 'Стейкинг'],
        coupon: 'ровный купон → ставка Earn',
      },
    },
    note: 'Ни одно направление не решает в одиночку: алгоритм даёт скорость, команда — контекст, TAIS — общую оценку риска. Часть капитала в каждом Event — собственные средства Trigonum.',
  },
  fees: {
    title: 'Сколько мы берём',
    subtitle: 'Комиссия за управление одна на все продукты — 1% от суммы пополнения, разово. Дальше мы зарабатываем только вместе с вами.',
    columns: { product: 'Продукт', management: 'За управление', result: 'За результат' },
    rows: [
      { product: 'Earn', management: '1% при пополнении', result: 'Нет' },
      { product: 'Strategies', management: '1% при пополнении', result: '10% от прибыли' },
      { product: 'Events', management: '1% при пополнении', result: '20% от прибыли' },
    ],
    neverTitle: 'Чего мы не берём',
    never: [
      'За ввод средств',
      'За вывод средств',
      'За неактивность счёта',
      'С нереализованной прибыли',
      'Скрытого спреда сверх раскрытого',
    ],
    note: 'Комиссия за управление удерживается один раз, в момент зачисления средств на продукт, и не зависит от того, сколько капитал пролежит. Ставка Earn публикуется чистой: 1% в ней уже учтён. Комиссия за результат берётся только с фактической прибыли: при убытке она равна нулю, а в стратегиях следующая прибыль сначала закрывает предыдущую просадку (high-water mark).',
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
      { name: 'Diamond', perk: 'Закрытые сделки, co-investment, вывод без комиссии' },
      { name: 'Californium', perk: 'Клубные сделки, управляющий партнёр, бессрочный статус' },
    ],
    note: 'Уровень пересматривается раз в квартал, снижается не более чем на ступень и не раньше чем через 30 дней после предупреждения.',
  },
  open: {
    title: 'Как начать зарабатывать с Trigonum',
    subtitle: 'Шесть шагов от письма с подтверждением до первой позиции. Между ними ничего не теряется: заявку можно продолжить с того места, где остановились.',
    steps: [
      { title: 'Регистрация', text: 'Имя, email и пароль. Подтверждаете почту по ссылке из письма.', time: '5 минут' },
      { title: 'Проверка личности', text: 'Паспорт и селфи через сервис проверки. Данные заполняют профиль автоматически.', time: '10 минут' },
      { title: 'Анкета и соглашения', text: 'Самосертификация инвестора и подписание документов. Всё остаётся в кабинете.', time: '10 минут' },
      { title: 'Решение', text: 'Комплаенс проверяет заявку. После одобрения кабинет открывается полностью.', time: 'до 1 рабочего дня' },
      { title: 'Открыть счёт', text: 'Счёт хранения в Trigonum открывается по заявке и договору. После подписания получаете сеть и персональный адрес для пополнения.', time: '1 рабочий день' },
      { title: 'Выбрать подходящий портфель', text: 'Earn, стратегия под ваш риск-профиль или участие в Event. Калькулятор в кабинете подскажет сумму под вашу цель.', time: '10 минут' },
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
  results: {
    title: 'Что заработали инвесторы',
    subtitle: 'Публикуем не только среднее по платформе. Ниже — реальные счета из первой пятёрки за последние 12 месяцев и три лучших закрытых сделки.',
    investorsTitle: 'Топ инвесторов за 12 месяцев',
    investorsNote: 'Счета обезличены. Прибыль — чистая, после всех комиссий.',
    columns: { investor: 'Инвестор', tier: 'Уровень', capital: 'Средний капитал', profit: 'Чистая прибыль', mix: 'Что использует', since: 'С нами с' },
    eventsTitle: 'Лучшие сделки Events',
    eventsNote: 'Результат — валовый, до комиссии за результат. Рядом показано, сколько осталось инвесторам.',
    eventLabels: { days: 'дн. в позиции', investors: 'инвесторов', kept: 'Осталось инвесторам' },
    note: 'Прошлые результаты не гарантируют будущих. Из десяти закрытых сделок две принесли убыток — мы показываем их в разделе Events полностью.',
  },
  calculator: {
    title: 'Сколько нужно завести под вашу цель',
    subtitle: 'Укажите сумму и срок — посчитаем по фактической доходности каждого продукта за последние 12 месяцев, уже за вычетом комиссий.',
    goalLabel: 'Моя цель',
    yearsLabel: 'Срок',
    yearsUnit: (n: number) => (n === 1 ? 'год' : n < 5 ? 'года' : 'лет'),
    columns: { plan: 'Куда размещаю', net: 'Чистыми в год', lump: 'Внести сразу', monthly: 'Или в месяц' },
    netNote: 'после комиссии за результат',
    monthlyNote: 'равными взносами весь срок',
    tickerTitle: 'Пока вы читаете эту страницу',
    tickerCaption: 'заработали инвесторы Trigonum — прямо сейчас, в реальном времени',
    tickerText: 'Ваша цель {goal} в {plan} принесла бы {app} за 25 минут, пока вы заполняете анкету, и {month} в месяц.',
    note: 'Расчёт использует фактическую доходность за последние 12 месяцев и не является обещанием результата. Комиссия за управление 1% удержана с каждого взноса.',
  },
  charts: {
    events: { average: 'Средний результат', best: 'Лучшая', worst: 'Худшая', days: 'дн.' },
    strategies: { drawdown: 'просадка' },
    earn: {
      monthsShort: 'мес.',
      base: 'на вложенные {amount} по ставке ~{rate}% годовых',
      windows: '52 окна вывода в год',
      rows: [
        ['Начисление', 'каждый день'],
        ['Вывод тела', 'раз в неделю'],
        ['Заявка', '{days} дн.'],
      ],
    },
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
    proof: {
      events: ['trades closed in profit', 'earned by investors', 'average trade length'],
      strategies: ['under management', 'earned over 12 months', 'investors in strategies'],
      earn: ['under management', 'income paid out', 'months without a delayed payout'],
    },
    visual: {
      events: { title: 'Result of the last 10 closed trades', hint: 'Hover a bar to see the trade' },
      strategies: { title: 'Cumulative return by quarter', hint: 'Hover a line to see the strategy' },
      earn: { title: 'How $100,000 grows over 12 months', hint: 'Income accrues daily, principal is withdrawn weekly' },
    },
    rows: [
      { id: 'earn', name: 'Earn', tagline: 'Capital works, access stays', rate: PRODUCT_FACTS.earn.rate, rateNote: 'annual, fixed rate', term: 'Open-ended', liquidity: 'Weekly', min: PRODUCT_FACTS.earn.min, fee: `${PRODUCT_FACTS.earn.fee} on deposit, already in the rate`, risk: 'Low' },
      { id: 'strategies', name: 'Strategies', tagline: 'Three profiles: conservative, moderate, aggressive', rate: PRODUCT_FACTS.strategies.rate, rateNote: 'target annual return', term: '3–12 months', liquidity: 'At term end', min: PRODUCT_FACTS.strategies.min, fee: `${PRODUCT_FACTS.strategies.fee} of profit`, risk: 'Conservative · high' },
      { id: 'events', name: 'Events', tagline: 'Short trades on a TAIS signal', rate: PRODUCT_FACTS.events.rate, rateNote: 'target return per trade', term: '7–30 days', liquidity: 'On trade close', min: PRODUCT_FACTS.events.min, fee: `${PRODUCT_FACTS.events.fee} of profit`, risk: 'High' },
    ],
  },
  how: {
    title: 'Where the return comes from',
    subtitle: 'Not from a single source. Returns come from three directions, and TAIS is the core of the architecture every decision passes through.',
    steps: [
      {
        title: 'Algorithmic trading',
        text: 'Proprietary algorithms run around the clock on arbitrage, market making and price dislocations between venues. Where speed decides, no human is involved.',
        metrics: [
          { value: '< 40 ms', label: 'reaction to a price dislocation' },
          { value: '6 venues', label: 'watched simultaneously' },
        ],
      },
      {
        title: 'Managed by the team',
        text: 'Traders and analysts run directional positions where human judgement and context matter more than speed. Every idea is defended before the investment committee.',
        metrics: [
          { value: '11 years', label: 'average manager experience' },
          { value: '2 in 3', label: 'ideas never clear the committee' },
        ],
      },
      {
        title: 'TAIS as the core',
        text: 'The market analysis system collects exchange and on-chain data, detects anomalies and scores risk. Every idea passes through it — from an algorithm or a person: it does not trade, it decides how large a position may be.',
        metrics: [
          { value: '100%', label: 'of ideas are risk-scored' },
          { value: '2.1M', label: 'signals processed per day' },
        ],
      },
      {
        title: 'Liquidity deployment',
        text: 'Part of the capital works in lending and liquidity provision. This is the most predictable source — and it is what backs the fixed Earn rate.',
        metrics: [
          { value: '~7%', label: 'the rate the investor sees' },
          { value: '18 mo', label: 'without a single delayed payout' },
        ],
      },
    ],
    flow: { sources: 'Income sources', core: 'Risk scoring', products: 'Products', share: 'share of income' },
    art: {
      algo: { venueA: 'Venue A', venueB: 'Venue B', close: 'dislocation closes', spread: '+0.8%' },
      team: { committee: 'committee', accepted: 'Idea accepted', rejected: 'Rejected' },
      tais: { feeds: 'exchanges · on-chain · derivatives' },
      liquidity: {
        capital: 'Capital',
        desks: ['Lending', 'Liquidity pools', 'Staking'],
        coupon: 'steady coupon → Earn rate',
      },
    },
    note: 'No single direction decides alone: the algorithm brings speed, the team brings context, TAIS brings a shared view of risk. Part of the capital in every Event is Trigonum’s own.',
  },
  fees: {
    title: 'What we charge',
    subtitle: 'One management fee across every product — 1% of the deposit, charged once. After that we only earn together with you.',
    columns: { product: 'Product', management: 'Management', result: 'Result' },
    rows: [
      { product: 'Earn', management: '1% on deposit', result: 'None' },
      { product: 'Strategies', management: '1% on deposit', result: '10% of profit' },
      { product: 'Events', management: '1% on deposit', result: '20% of profit' },
    ],
    neverTitle: 'What we never charge',
    never: ['Deposit fees', 'Withdrawal fees', 'Inactivity fees', 'Fees on unrealised profit', 'Any spread beyond the disclosed one'],
    note: 'The management fee is charged once, when funds are credited to a product, and does not depend on how long the capital stays. The Earn rate is published net: the 1% is already deducted. The result fee applies to realised profit only: on a loss it is zero, and in Strategies the next profit first recovers the previous drawdown (high-water mark).',
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
      { name: 'Diamond', perk: 'Closed deals, co-investment, no withdrawal fee' },
      { name: 'Californium', perk: 'Club deals, managing partner, permanent status' },
    ],
    note: 'Tiers are reviewed quarterly, drop by no more than one step, and never sooner than 30 days after a warning.',
  },
  open: {
    title: 'How to start earning with Trigonum',
    subtitle: 'Six steps from the confirmation email to your first position. Nothing is lost in between: you can resume the application where you left off.',
    steps: [
      { title: 'Registration', text: 'Name, email and password. Confirm your email via the link we send.', time: '5 minutes' },
      { title: 'Identity check', text: 'Passport and selfie through the verification service. Your profile is filled in automatically.', time: '10 minutes' },
      { title: 'Questionnaire and agreements', text: 'Investor self-certification and document signing. Everything stays in the cabinet.', time: '10 minutes' },
      { title: 'Decision', text: 'Compliance reviews the application. Once approved, the cabinet unlocks in full.', time: 'up to 1 business day' },
      { title: 'Open an account', text: 'A Trigonum custody account opens on an application and a contract. After signing you receive the network and a personal deposit address.', time: '1 business day' },
      { title: 'Pick the right portfolio', text: 'Earn, a strategy matching your risk profile, or a seat in an Event. The cabinet calculator suggests the amount for your goal.', time: '10 minutes' },
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
  results: {
    title: 'What investors actually earned',
    subtitle: 'Not just the platform average. Below are five real accounts from the past 12 months and the three best closed trades.',
    investorsTitle: 'Top investors over 12 months',
    investorsNote: 'Accounts are anonymised. Profit is net, after all fees.',
    columns: { investor: 'Investor', tier: 'Tier', capital: 'Average capital', profit: 'Net profit', mix: 'What they use', since: 'With us since' },
    eventsTitle: 'Best Events trades',
    eventsNote: 'The result is gross, before the result fee. Next to it is what investors kept.',
    eventLabels: { days: 'days in position', investors: 'investors', kept: 'Investors kept' },
    note: 'Past performance does not guarantee future results. Two of the ten closed trades lost money — the Events section shows all of them.',
  },
  calculator: {
    title: 'How much to deposit for your goal',
    subtitle: 'Enter an amount and a horizon — we compute it from each product’s actual 12-month return, already net of fees.',
    goalLabel: 'My goal',
    yearsLabel: 'Horizon',
    yearsUnit: (n: number) => (n === 1 ? 'year' : 'years'),
    columns: { plan: 'Where I place it', net: 'Net per year', lump: 'Deposit now', monthly: 'Or per month' },
    netNote: 'after the result fee',
    monthlyNote: 'equal instalments for the whole term',
    tickerTitle: 'While you read this page',
    tickerCaption: 'earned by Trigonum investors — right now, in real time',
    tickerText: 'Your goal of {goal} in {plan} would have earned {app} in the 25 minutes it takes to fill in the application, and {month} a month.',
    note: 'The calculation uses the actual 12-month return and is not a promise of results. The 1% management fee is deducted from every instalment.',
  },
  charts: {
    events: { average: 'Weighted average', best: 'Best', worst: 'Worst', days: 'd' },
    strategies: { drawdown: 'drawdown' },
    earn: {
      monthsShort: 'mo',
      base: 'on {amount} at ~{rate}% a year',
      windows: '52 withdrawal windows a year',
      rows: [
        ['Accrual', 'every day'],
        ['Principal', 'weekly'],
        ['Request', '{days} days'],
      ],
    },
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
    proof: {
      events: ['бүтүм кирешелүү жабылды', 'инвесторлор тапты', 'бүтүмдүн орточо мөөнөтү'],
      strategies: ['башкарууда', '12 айда табылды', 'стратегиядагы инвестор'],
      earn: ['башкарууда', 'киреше төлөндү', 'ай кечиктирүүсүз'],
    },
    visual: {
      events: { title: 'Акыркы 10 жабылган бүтүмдүн натыйжасы', hint: 'Мамычага курсорду алып барыңыз' },
      strategies: { title: 'Кварталдар боюнча топтолгон киреше', hint: 'Сызыкка курсорду алып барыңыз' },
      earn: { title: '$100 000 12 айда кантип өсөт', hint: 'Киреше күн сайын кошулат, негизги сумма жумасына бир жолу чыгарылат' },
    },
    rows: [
      { id: 'earn', name: 'Earn', tagline: 'Капитал иштейт, жетүү мүмкүнчүлүгү калат', rate: PRODUCT_FACTS.earn.rate, rateNote: 'жылдык, туруктуу ставка', term: 'Мөөнөтсүз', liquidity: 'Жумасына бир жолу', min: PRODUCT_FACTS.earn.min, fee: `${PRODUCT_FACTS.earn.fee} толуктоодо, ставкада эсептелген`, risk: 'Төмөн' },
      { id: 'strategies', name: 'Strategies', tagline: 'Тобокел деңгээлиңизге ылайык башкарылуучу стратегиялар', rate: PRODUCT_FACTS.strategies.rate, rateNote: 'максаттуу жылдык киреше', term: '3–12 ай', liquidity: 'Мөөнөт аягында', min: PRODUCT_FACTS.strategies.min, fee: `${PRODUCT_FACTS.strategies.fee} кирешеден`, risk: 'Консервативдүү · жогорку' },
      { id: 'events', name: 'Events', tagline: 'TAIS сигналы боюнча кыска бүтүмдөр', rate: PRODUCT_FACTS.events.rate, rateNote: 'бүтүм боюнча максаттуу киреше', term: '7–30 күн', liquidity: 'Бүтүм жабылганда', min: PRODUCT_FACTS.events.min, fee: `${PRODUCT_FACTS.events.fee} кирешеден`, risk: 'Жогорку' },
    ],
  },
  how: {
    title: 'Киреше кайдан келет',
    subtitle: 'Бир булактан эмес. Киреше үч багыттан түзүлөт, TAIS болсо — ар бир чечим өтүүчү архитектуранын өзөгү.',
    steps: [
      {
        title: 'Алгоритмдик соода',
        text: 'Өздүк алгоритмдер тынымсыз иштейт: арбитраж, маркет-мейкинг жана аянтчалар ортосундагы баа айырмасы. Ылдамдык чечкен жерде адам катышпайт.',
        metrics: [
          { value: '< 40 мс', label: 'баа айырмасына реакция' },
          { value: '6 аянтча', label: 'бир убакта көзөмөлдө' },
        ],
      },
      {
        title: 'Команданын башкаруусу',
        text: 'Трейдерлер жана аналитиктер ылдамдык эмес, адамдын чечими керек болгон жерде позицияларды жүргүзөт. Ар бир идея инвесткомитетте корголот.',
        metrics: [
          { value: '11 жыл', label: 'башкаруучулардын орточо тажрыйбасы' },
          { value: '3түн 2си', label: 'идея комитеттен өтпөйт' },
        ],
      },
      {
        title: 'Өзөк катары TAIS',
        text: 'Рынокту талдоо системасы биржа жана ончейн маалыматтарын чогултуп, аномалияларды табат жана тобокелди баалайт. Ар бир идея ушул системадан өтөт: ал соода кылбайт, позициянын өлчөмүн чечет.',
        metrics: [
          { value: '100%', label: 'идея тобокел боюнча бааланат' },
          { value: '2,1 млн', label: 'сигнал бир суткада' },
        ],
      },
      {
        title: 'Ликвиддүүлүктү жайгаштыруу',
        text: 'Капиталдын бир бөлүгү кредиттөөдө жана ликвиддүүлүк берүүдө иштейт. Бул эң болжолдуу булак — Earn’дин туруктуу ставкасы ушуга таянат.',
        metrics: [
          { value: '~7%', label: 'инвестор көргөн ставка' },
          { value: '18 ай', label: 'бир да кечиктирүүсүз' },
        ],
      },
    ],
    flow: { sources: 'Киреше булактары', core: 'Тобокелди баалоо', products: 'Продукттар', share: 'кирешедеги үлүш' },
    art: {
      algo: { venueA: 'A аянтчасы', venueB: 'B аянтчасы', close: 'айырма жабылат', spread: '+0,8%' },
      team: { committee: 'инвесткомитет', accepted: 'Идея кабыл алынды', rejected: 'Четке кагылды' },
      tais: { feeds: 'биржалар · ончейн · деривативдер' },
      liquidity: {
        capital: 'Капитал',
        desks: ['Кредиттөө', 'Ликвиддүүлүк пулдары', 'Стейкинг'],
        coupon: 'туруктуу купон → Earn ставкасы',
      },
    },
    note: 'Бир дагы багыт жалгыз чечпейт: алгоритм ылдамдык берет, команда — контекст, TAIS — тобокелдин жалпы баасы. Ар бир Event’теги капиталдын бир бөлүгү — Trigonum’дун өз каражаты.',
  },
  fees: {
    title: 'Биз канча алабыз',
    subtitle: 'Башкаруу комиссиясы бардык продуктта бирдей — толуктоо суммасынан 1%, бир жолу. Андан ары биз сиз менен бирге гана табабыз.',
    columns: { product: 'Продукт', management: 'Башкаруу үчүн', result: 'Натыйжа үчүн' },
    rows: [
      { product: 'Earn', management: 'толуктоодо 1%', result: 'Жок' },
      { product: 'Strategies', management: 'толуктоодо 1%', result: 'кирешеден 10%' },
      { product: 'Events', management: 'толуктоодо 1%', result: 'кирешеден 20%' },
    ],
    neverTitle: 'Биз эмне албайбыз',
    never: ['Каражат киргизүү үчүн', 'Каражат чыгаруу үчүн', 'Эсептин активсиздиги үчүн', 'Ишке ашпаган кирешеден', 'Ачыкталгандан тышкары жашыруун спред'],
    note: 'Башкаруу комиссиясы каражат продуктка чегерилген учурда бир жолу кармалат жана капиталдын мөөнөтүнө көз каранды эмес. Earn ставкасы таза жарыяланат: 1% мурунтан эсептелген. Натыйжа комиссиясы иш жүзүндөгү кирешеден гана алынат: зыян болгондо ал нөлгө барабар, стратегияларда кийинки киреше адегенде мурунку төмөндөөнү жабат (high-water mark).',
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
      { name: 'Diamond', perk: 'Жабык бүтүмдөр, co-investment, комиссиясыз чыгаруу' },
      { name: 'Californium', perk: 'Клубдук бүтүмдөр, башкаруучу өнөктөш, мөөнөтсүз статус' },
    ],
    note: 'Деңгээл кварталына бир жолу каралат, бир баскычтан ашык төмөндөбөйт жана эскертүүдөн 30 күн өтпөй өзгөрбөйт.',
  },
  open: {
    title: 'Trigonum менен кантип киреше таба баштоо керек',
    subtitle: 'Ырастоо катынан биринчи позицияга чейин алты кадам. Арызды токтогон жериңизден улантууга болот.',
    steps: [
      { title: 'Каттоо', text: 'Аты-жөнү, email жана сырсөз. Почтаны каттан келген шилтеме менен ырастайсыз.', time: '5 мүнөт' },
      { title: 'Инсандыкты текшерүү', text: 'Паспорт жана селфи. Маалыматтар профилди автоматтык түрдө толтурат.', time: '10 мүнөт' },
      { title: 'Анкета жана келишимдер', text: 'Инвестордун өз-өзүн сертификациялоосу жана документтерге кол коюу.', time: '10 мүнөт' },
      { title: 'Чечим', text: 'Комплаенс арызды текшерет. Жактыргандан кийин кабинет толук ачылат.', time: '1 жумуш күнүнө чейин' },
      { title: 'Эсеп ачуу', text: 'Trigonum сактоо эсеби арыз жана келишим боюнча ачылат. Кол койгондон кийин тармак жана жеке дарек берилет.', time: '1 жумуш күнү' },
      { title: 'Ылайыктуу портфелди тандоо', text: 'Earn, тобокел профилиңизге ылайык стратегия же Eventке катышуу. Кабинеттеги калькулятор максатыңызга керектүү сумманы эсептейт.', time: '10 мүнөт' },
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
  results: {
    title: 'Инвесторлор канча тапты',
    subtitle: 'Платформа боюнча орточо гана эмес. Төмөндө соңку 12 айдын беш реалдуу эсеби жана үч эң мыкты жабылган бүтүм.',
    investorsTitle: '12 айдагы мыкты инвесторлор',
    investorsNote: 'Эсептер жашыруун. Киреше — бардык комиссиядан кийинки таза.',
    columns: { investor: 'Инвестор', tier: 'Деңгээл', capital: 'Орточо капитал', profit: 'Таза киреше', mix: 'Эмнени колдонот', since: 'Биз менен' },
    eventsTitle: 'Events боюнча мыкты бүтүмдөр',
    eventsNote: 'Натыйжа — комиссияга чейинки жалпы. Жанында инвесторлорго калганы көрсөтүлгөн.',
    eventLabels: { days: 'күн позицияда', investors: 'инвестор', kept: 'Инвесторлорго калды' },
    note: 'Мурунку натыйжалар келечекке кепилдик бербейт. Он жабылган бүтүмдүн экөө зыян алып келди — Events бөлүмүндө баары көрсөтүлгөн.',
  },
  calculator: {
    title: 'Максатыңыз үчүн канча киргизүү керек',
    subtitle: 'Сумманы жана мөөнөттү көрсөтүңүз — ар бир продукттун соңку 12 айдагы иш жүзүндөгү, комиссиядан кийинки кирешеси боюнча эсептейбиз.',
    goalLabel: 'Менин максатым',
    yearsLabel: 'Мөөнөт',
    yearsUnit: () => 'жыл',
    columns: { plan: 'Кайда жайгаштырам', net: 'Жылына таза', lump: 'Азыр киргизүү', monthly: 'Же айына' },
    netNote: 'натыйжа комиссиясынан кийин',
    monthlyNote: 'бүт мөөнөт бою бирдей төгүм',
    tickerTitle: 'Сиз бул бетти окуп жатканда',
    tickerCaption: 'Trigonum инвесторлору тапты — азыр, реалдуу убакытта',
    tickerText: 'Максатыңыз {goal} {plan} ичинде анкетаны толтурган 25 мүнөттө {app}, ал эми айына {month} алып келмек.',
    note: 'Эсеп соңку 12 айдагы иш жүзүндөгү кирешеге негизделген жана натыйжага убада эмес. 1% башкаруу комиссиясы ар бир төгүмдөн кармалат.',
  },
  charts: {
    events: { average: 'Орточо натыйжа', best: 'Мыкты', worst: 'Начар', days: 'күн' },
    strategies: { drawdown: 'төмөндөө' },
    earn: {
      monthsShort: 'ай',
      base: 'салынган {amount} үчүн жылдык ~{rate}% ставка боюнча',
      windows: 'жылына 52 чыгаруу терезеси',
      rows: [
        ['Кошуу', 'күн сайын'],
        ['Негизги сумма', 'жумасына бир жолу'],
        ['Арыз', '{days} күн'],
      ],
    },
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
