import type { Language } from '../i18n/I18nProvider'
import { landingContent as baseLandingContent, type LandingContent, type ProductRow } from './landing'

export type { LandingContent, ProductRow } from './landing'

type ProductPatch = Partial<ProductRow> & Pick<ProductRow, 'id'>
type LandingOverride = Record<string, any>

const overrides: Record<Language, LandingOverride> = {
  ru: {
    stats: [
      { value: 'от $1 000', label: 'Минимальная сумма', note: 'Earn и Strategies · Events от $5 000' },
      { value: 'до 1 дня', label: 'Рассмотрение заявки', note: 'Проверка документов и открытие счёта' },
      { value: '7 дней', label: 'Периодичность вывода Earn', note: 'Основная сумма — еженедельно, начисление дохода — ежедневно' },
      { value: '24/7', label: 'Клиентская поддержка', note: 'Чат, электронная почта и Telegram; персональный менеджер — с уровня Platinum' },
    ],
    products: {
      title: 'Инвестиционные продукты',
      subtitle: 'Продукты различаются по профилю риска, сроку размещения, условиям ликвидности и модели вознаграждения.',
      note: 'Целевая доходность Strategies и Events не является гарантией результата. Фактическая доходность зависит от рыночных условий и результатов управления.',
      columns: { rate: 'Доходность', term: 'Срок', liquidity: 'Ликвидность', min: 'Минимальная сумма', fee: 'Комиссия', risk: 'Риск', open: 'Открыть счёт', more: 'Условия продукта' },
      proof: {
        events: ['прибыльных закрытых сделок', 'чистый результат инвесторов', 'средний срок сделки'],
        strategies: ['активов под управлением', 'чистый результат за 12 месяцев', 'инвесторов в стратегиях'],
        earn: ['активов под управлением', 'выплаченного дохода', 'месяцев без задержек выплат'],
      },
      visual: {
        events: { title: 'Результаты последних 10 закрытых сделок', hint: 'Наведите на столбец для просмотра параметров сделки' },
        strategies: { title: 'Накопленная доходность по кварталам', hint: 'Наведите на линию для просмотра параметров стратегии' },
        earn: { title: 'Динамика $100 000 за 12 месяцев', hint: 'Доход начисляется ежедневно; возврат основной суммы осуществляется в установленное окно' },
      },
      rows: [
        { id: 'earn', tagline: 'Размещение капитала по фиксированной ставке с установленными условиями ликвидности', rateNote: 'годовых, фиксированная ставка', term: 'Без ограничения срока', liquidity: 'Еженедельно', risk: 'Низкий' },
        { id: 'strategies', tagline: 'Управляемые стратегии с различными профилями риска', rateNote: 'целевая доходность годовых', term: '3–12 месяцев', liquidity: 'По окончании срока', risk: 'От консервативного до высокого' },
        { id: 'events', tagline: 'Ограниченные по сроку инвестиционные идеи на основе аналитики TAIS', rateNote: 'целевая доходность на сделку', term: '7–30 дней', liquidity: 'При закрытии сделки', risk: 'Высокий' },
      ],
    },
    fees: {
      title: 'Комиссии и вознаграждение',
      subtitle: 'Структура комиссий раскрывается до размещения капитала и зависит от выбранного продукта.',
      columns: { product: 'Продукт', management: 'Комиссия за управление', result: 'Комиссия за результат' },
      neverTitle: 'Дополнительные комиссии отсутствуют',
      never: ['За ввод средств', 'За вывод средств', 'За неактивность счёта', 'С нереализованного финансового результата', 'Сверх раскрытых условий исполнения'],
      note: 'Комиссия за управление удерживается в соответствии с условиями продукта. Комиссия за результат взимается только с реализованной прибыли; при отрицательном результате она не начисляется. Для Strategies применяется принцип high-water mark.',
    },
    custody: {
      title: 'Хранение и учёт средств',
      subtitle: 'Для каждого клиента открывается отдельный счёт хранения в соответствии с договором и установленными процедурами учёта.',
      points: [
        { title: 'Индивидуальные реквизиты', text: 'Клиенту предоставляются реквизиты, закреплённые за его счётом. Пополнение возможно с поддерживаемого внешнего кошелька или биржи.' },
        { title: 'Договорная основа', text: 'Счёт хранения открывается после одобрения заявки и подписания соответствующих документов.' },
        { title: 'Поддерживаемые сети', text: 'Arbitrum, Ethereum, TRON и Base. Допустимый актив и минимальная сумма определяются условиями выбранной сети и договора.' },
        { title: 'Учёт и вывод средств', text: 'Зачисление отражается после необходимого количества подтверждений сети. Вывод осуществляется на заранее подтверждённые реквизиты.' },
      ],
      cta: 'Порядок открытия счёта хранения',
    },
    tiers: {
      title: 'Уровни обслуживания',
      subtitle: 'Уровень определяется с учётом объёма капитала, срока отношений, участия в продуктах и иных предусмотренных программой критериев.',
      note: 'Пересмотр уровня осуществляется ежеквартально в соответствии с правилами программы обслуживания.',
    },
    open: {
      title: 'Порядок открытия счёта',
      subtitle: 'Процедура включает регистрацию, идентификацию, подписание документов, комплаенс-проверку и открытие счёта хранения.',
      steps: [
        { title: 'Регистрация', text: 'Укажите имя, адрес электронной почты и пароль, затем подтвердите адрес электронной почты.', time: 'около 5 минут' },
        { title: 'Идентификация', text: 'Предоставьте документ, удостоверяющий личность, и пройдите проверку личности.', time: 'около 10 минут' },
        { title: 'Анкета и документы', text: 'Заполните предусмотренные анкеты и подпишите необходимые соглашения в личном кабинете.', time: 'около 10 минут' },
        { title: 'Комплаенс-проверка', text: 'Специалисты проверяют предоставленные сведения и принимают решение по заявке.', time: 'до 1 рабочего дня' },
        { title: 'Открытие счёта хранения', text: 'После одобрения и подписания договора предоставляются сеть и индивидуальные реквизиты для пополнения.', time: '1 рабочий день' },
        { title: 'Выбор продукта', text: 'Выберите Earn, подходящую по профилю риска стратегию или доступный Event с учётом раскрытых условий.', time: 'по готовности клиента' },
      ],
      needTitle: 'Необходимые документы',
      need: 'Физическому лицу потребуются документ, удостоверяющий личность, средство для прохождения проверки личности и адрес электронной почты. Для юридического лица перечень включает учредительные документы, сведения о бенефициарных владельцах и подтверждение источника средств; окончательный состав зависит от юрисдикции и статуса клиента.',
      cta: 'Открыть счёт',
    },
    compliance: {
      title: 'Регулирование и комплаенс',
      subtitle: 'Деятельность осуществляется в лицензируемой юрисдикции с применением предусмотренных процедур идентификации, финансового мониторинга и защиты доступа.',
      points: [
        { title: 'Лицензия ФСА КР', text: 'Сведения о лицензии и деятельности в сфере виртуальных активов доступны в открытом реестре уполномоченного органа Кыргызской Республики.' },
        { title: 'AML · KYC · ПОД/ФТ', text: 'Применяются процедуры идентификации клиента, проверки источника средств и предусмотренного законодательством финансового мониторинга.' },
        { title: 'Отчётность', text: 'В личном кабинете формируются выписки и документы по операциям в предусмотренном формате.' },
        { title: 'Защита доступа', text: 'Используются двухфакторная аутентификация, контроль сессий и устройств, подтверждение операций и журнал подписанных документов.' },
      ],
      link: 'Открыть реестр регулятора',
    },
    results: {
      title: 'Исторические результаты',
      subtitle: 'В разделе представлены обезличенные данные по счетам и завершённым операциям за указанный период. Прошлые результаты не определяют будущую доходность.',
      investorsTitle: 'Результаты счетов за 12 месяцев',
      investorsNote: 'Счета обезличены. Финансовый результат указан после применимых комиссий.',
      columns: { investor: 'Счёт', tier: 'Уровень', capital: 'Средний капитал', profit: 'Чистый результат', mix: 'Используемые продукты', since: 'Дата начала' },
      eventsTitle: 'Завершённые сделки Events',
      eventsNote: 'По каждой сделке указываются фактический результат, срок и объём участия.',
      eventLabels: { days: 'дн. в позиции', investors: 'участников', kept: 'Чистый результат инвесторов' },
      note: 'Исторические показатели приведены исключительно в информационных целях и не являются гарантией либо прогнозом будущих результатов.',
    },
    calculator: {
      title: 'Расчёт требуемого капитала',
      subtitle: 'Укажите целевую сумму и инвестиционный горизонт. Расчёт выполняется на основе исторических показателей продуктов и не является прогнозом доходности.',
      goalLabel: 'Целевая сумма',
      yearsLabel: 'Инвестиционный горизонт',
      columns: { plan: 'Продукт', net: 'Историческая доходность нетто', lump: 'Расчётная сумма размещения' },
      netNote: 'после комиссии за результат',
      tickerTitle: 'Расчётная иллюстрация',
      tickerCaption: 'оценка на основе исторических показателей платформы',
      tickerText: 'Для цели {goal} при использовании {plan} расчётная величина результата за 25 минут составила бы {app}, а среднемесячная величина — {month}.',
      note: 'Расчёт основан на исторической доходности за последние 12 месяцев, не учитывает все возможные рыночные сценарии и не является инвестиционной рекомендацией или гарантией результата.',
    },
    faq: {
      title: 'Основные вопросы',
      rows: [
        { question: 'Какова минимальная сумма размещения?', answer: 'Минимальная сумма составляет $1 000 для Earn и Strategies и $5 000 для Events. Для крупных сумм может потребоваться расширенная проверка источника средств.' },
        { question: 'Каковы условия вывода средств?', answer: 'Для Earn возврат основной суммы осуществляется в еженедельное окно. Для Strategies — в соответствии со сроком договора. Для Events — после закрытия соответствующей сделки. Возможность досрочного выхода определяется условиями конкретного продукта.' },
        { question: 'Какие риски несёт инвестор?', answer: 'Strategies и Events связаны с рыночным риском и могут привести к отрицательному финансовому результату. Условия и риски Earn определяются договором продукта. Перед размещением капитала инвестор должен ознакомиться с раскрытием рисков.' },
        { question: 'Как осуществляется контроль средств?', answer: 'Средства учитываются на счёте хранения Trigonum. Клиент получает индивидуальные реквизиты для пополнения и распоряжается операциями через личный кабинет в рамках установленных процедур безопасности.' },
        { question: 'Как учитываются налоговые обязательства?', answer: 'Налоговые обязательства определяются законодательством страны налогового резидентства клиента. Trigonum предоставляет отчётность по операциям, которая может использоваться для подготовки налоговой отчётности.' },
        { question: 'Что происходит при отказе в открытии счёта?', answer: 'До одобрения заявки средства не принимаются. В случае отказа клиент получает соответствующее уведомление; возможность повторной подачи заявки определяется действующими процедурами.' },
        { question: 'Можно ли закрыть счёт?', answer: 'Да. Свободный остаток может быть выведен на подтверждённые реквизиты, а действующие продукты завершаются в соответствии с их условиями и сроками.' },
      ],
    },
    final: { title: 'Открытие инвестиционного счёта', text: 'Регистрация занимает несколько минут. После предоставления необходимых документов заявка проходит комплаенс-проверку; средства принимаются только после открытия счёта.', cta: 'Открыть счёт', secondary: 'Войти в кабинет' },
  },
  en: {
    products: { title: 'Investment products', subtitle: 'Products differ by risk profile, investment term, liquidity conditions and fee structure.', note: 'Target returns for Strategies and Events are not guaranteed. Actual performance depends on market conditions and investment results.' },
    fees: { title: 'Fees and remuneration', subtitle: 'The fee structure is disclosed before capital is invested and depends on the selected product.', neverTitle: 'No additional charges for', note: 'Management fees are charged in accordance with product terms. Performance fees apply only to realised profit; no performance fee is charged on a negative result. Strategies apply a high-water-mark principle.' },
    custody: { title: 'Custody and account records', subtitle: 'Each client is provided with a separate custody account in accordance with the agreement and applicable record-keeping procedures.' },
    tiers: { title: 'Service tiers', subtitle: 'Service tier is determined by capital, relationship duration, product participation and other criteria set out in the programme.', note: 'Service tiers are reviewed quarterly in accordance with programme rules.' },
    open: { title: 'Account opening procedure', subtitle: 'The process includes registration, identification, document execution, compliance review and custody-account opening.', needTitle: 'Required documentation', cta: 'Open account' },
    compliance: { title: 'Regulation and compliance', subtitle: 'Activities are conducted in a licensed jurisdiction with applicable identification, financial-monitoring and access-security procedures.', link: 'Open regulator register' },
    results: { title: 'Historical performance', subtitle: 'This section presents anonymised account and completed-transaction data for the stated period. Past performance does not determine future returns.', investorsTitle: 'Account results over 12 months', investorsNote: 'Accounts are anonymised. Financial results are shown after applicable fees.', eventsTitle: 'Completed Events transactions', eventsNote: 'Actual result, duration and invested amount are shown for each transaction.', note: 'Historical indicators are provided for information only and do not constitute a guarantee or forecast of future performance.' },
    calculator: { title: 'Required-capital calculation', subtitle: 'Enter a target amount and investment horizon. The calculation uses historical product performance and is not a return forecast.', goalLabel: 'Target amount', yearsLabel: 'Investment horizon', tickerTitle: 'Illustrative calculation', tickerCaption: 'estimate based on historical platform indicators', note: 'The calculation is based on the previous 12 months of historical performance and is not investment advice or a guarantee of results.' },
    faq: { title: 'Key questions' },
    final: { title: 'Open an investment account', text: 'Registration takes several minutes. Once the required documentation is provided, the application undergoes compliance review; funds are accepted only after the account is opened.', cta: 'Open account', secondary: 'Log in' },
  },
  ky: {
    products: { title: 'Инвестициялык продукттар', subtitle: 'Продукттар тобокелдик профили, жайгаштыруу мөөнөтү, ликвиддүүлүк шарттары жана комиссия түзүмү боюнча айырмаланат.', note: 'Strategies жана Events боюнча максаттуу киреше кепилденбейт. Иш жүзүндөгү натыйжа рыноктук шарттарга жана башкаруунун жыйынтыгына жараша болот.' },
    fees: { title: 'Комиссиялар жана сый акы', subtitle: 'Комиссия түзүмү капитал жайгаштырылганга чейин ачылат жана тандалган продуктка жараша болот.', neverTitle: 'Кошумча комиссия алынбайт', note: 'Башкаруу жана натыйжа үчүн комиссиялар продукттун шарттарына ылайык алынат. Терс натыйжа болгон учурда натыйжа үчүн комиссия эсептелбейт.' },
    custody: { title: 'Каражаттарды сактоо жана эсепке алуу', subtitle: 'Ар бир кардар үчүн келишимге жана белгиленген эсепке алуу жол-жоболоруна ылайык өзүнчө сактоо эсеби ачылат.' },
    tiers: { title: 'Тейлөө деңгээлдери', subtitle: 'Тейлөө деңгээли капиталдын көлөмүнө, мамиленин мөөнөтүнө, продукттарга катышууга жана программада каралган башка критерийлерге жараша аныкталат.', note: 'Деңгээлдер программа эрежелерине ылайык квартал сайын кайра каралат.' },
    open: { title: 'Эсеп ачуу тартиби', subtitle: 'Процесс каттоону, идентификацияны, документтерге кол коюуну, комплаенс-текшерүүнү жана сактоо эсебин ачууну камтыйт.', needTitle: 'Керектүү документтер', cta: 'Эсеп ачуу' },
    compliance: { title: 'Жөнгө салуу жана комплаенс', subtitle: 'Ишмердик лицензиялануучу юрисдикцияда идентификация, финансылык мониторинг жана жетүүнү коргоо боюнча колдонулуучу жол-жоболор менен жүргүзүлөт.', link: 'Жөнгө салуучунун реестрин ачуу' },
    results: { title: 'Тарыхый натыйжалар', subtitle: 'Бул бөлүмдө көрсөтүлгөн мезгил үчүн жашырындалган эсептердин жана аяктаган операциялардын маалыматтары берилет. Мурунку натыйжалар келечектеги кирешени аныктабайт.', investorsTitle: '12 айдагы эсептердин натыйжалары', investorsNote: 'Эсептер жашырындалган. Финансылык натыйжа колдонулуучу комиссиялардан кийин көрсөтүлөт.', eventsTitle: 'Аяктаган Events операциялары', eventsNote: 'Ар бир операция боюнча иш жүзүндөгү натыйжа, мөөнөт жана катышуу көлөмү көрсөтүлөт.', note: 'Тарыхый көрсөткүчтөр маалыматтык максатта гана берилет жана келечектеги натыйжанын кепилдиги же божомолу болуп саналбайт.' },
    calculator: { title: 'Керектүү капиталды эсептөө', subtitle: 'Максаттуу сумманы жана инвестициялык мөөнөттү көрсөтүңүз. Эсеп тарыхый көрсөткүчтөргө негизделет жана кирешенин божомолу болуп саналбайт.', goalLabel: 'Максаттуу сумма', yearsLabel: 'Инвестициялык мөөнөт', tickerTitle: 'Иллюстрациялык эсеп', tickerCaption: 'платформанын тарыхый көрсөткүчтөрүнө негизделген баалоо', note: 'Эсеп акыркы 12 айдагы тарыхый натыйжаларга негизделет жана инвестициялык сунуш же натыйжанын кепилдиги болуп саналбайт.' },
    faq: { title: 'Негизги суроолор' },
    final: { title: 'Инвестициялык эсеп ачуу', text: 'Каттоо бир нече мүнөттү талап кылат. Документтер берилгенден кийин арыз комплаенс-текшерүүдөн өтөт; каражат эсеп ачылгандан кийин гана кабыл алынат.', cta: 'Эсеп ачуу', secondary: 'Кабинетке кирүү' },
  },
}

function mergeRows(base: ProductRow[], patches: ProductPatch[] = []): ProductRow[] {
  return base.map((row) => ({ ...row, ...(patches.find((patch) => patch.id === row.id) ?? {}) }))
}

export function landingContent(language: Language): LandingContent {
  const base = baseLandingContent(language)
  const o = overrides[language]

  return {
    ...base,
    ...(o.stats ? { stats: o.stats } : {}),
    products: { ...base.products, ...o.products, columns: { ...base.products.columns, ...(o.products?.columns ?? {}) }, proof: o.products?.proof ?? base.products.proof, visual: o.products?.visual ?? base.products.visual, rows: mergeRows(base.products.rows, o.products?.rows) },
    fees: { ...base.fees, ...o.fees, columns: { ...base.fees.columns, ...(o.fees?.columns ?? {}) }, never: o.fees?.never ?? base.fees.never },
    custody: { ...base.custody, ...o.custody, points: o.custody?.points ?? base.custody.points },
    tiers: { ...base.tiers, ...o.tiers },
    open: { ...base.open, ...o.open, steps: o.open?.steps ?? base.open.steps },
    compliance: { ...base.compliance, ...o.compliance, points: o.compliance?.points ?? base.compliance.points },
    results: { ...base.results, ...o.results, columns: { ...base.results.columns, ...(o.results?.columns ?? {}) }, eventLabels: { ...base.results.eventLabels, ...(o.results?.eventLabels ?? {}) } },
    calculator: { ...base.calculator, ...o.calculator, columns: { ...base.calculator.columns, ...(o.calculator?.columns ?? {}) } },
    faq: { ...base.faq, ...o.faq, rows: o.faq?.rows ?? base.faq.rows },
    final: { ...base.final, ...o.final },
  }
}
