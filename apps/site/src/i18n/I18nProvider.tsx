import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'

export type Language = 'ru' | 'en' | 'ky'

type Dictionary = Record<string, string>

const dictionaries: Record<Language, Dictionary> = {
  ru: {
    'nav.products': 'ПРОДУКТЫ',
    'nav.how': 'КАК ЭТО РАБОТАЕТ',
    'nav.fees': 'КОМИССИИ',
    'nav.custody': 'ХРАНЕНИЕ',
    'nav.tiers': 'УРОВНИ',
    'nav.compliance': 'КОМПЛАЕНС',
    'nav.about': 'О НАС',
    'nav.login': 'ВОЙТИ',
    'nav.open': 'ОТКРЫТЬ СЧЁТ',
    'hero.eyebrow': 'ИНТЕЛЛЕКТ. СТРАТЕГИИ.',
    'hero.eyebrowResult': 'РЕЗУЛЬТАТ.',
    'hero.capital': 'КАПИТАЛ.',
    'hero.intellect': 'ИНТЕЛЛЕКТ.',
    'hero.opportunities': 'ВОЗМОЖНОСТИ.',
    'hero.description': 'Trigonum Broker — инвестиционные решения для роста и защиты вашего капитала.',
    'hero.more': 'УЗНАТЬ БОЛЬШЕ',
    'adv.reliability': 'ЛИЦЕНЗИЯ ФСА КР',
    'adv.reliabilityText': 'Виртуальные активы · сведения в реестре регулятора',
    'adv.diversification': 'AML · KYC · ПОД/ФТ',
    'adv.diversificationText': 'Идентификация клиента и проверка источника средств',
    'adv.result': 'ОТДЕЛЬНЫЙ СЧЁТ ХРАНЕНИЯ',
    'adv.resultText': 'Реквизиты закреплены за вами и открыты по договору',
    'adv.liquidity': 'ОТЧЁТНОСТЬ ДЛЯ РЕГУЛЯТОРА',
    'adv.liquidityText': 'Выписка по форме Кыргызстана и России из кабинета',
    'value.transparency': 'ПРОЗРАЧНОСТЬ',
    'value.transparencyText': 'Полная информация и контроль над капиталом',
    'value.client': 'КЛИЕНТООРИЕНТИРОВАННОСТЬ',
    'value.clientText': 'Индивидуальный подход и персональные решения',
    'value.tech': 'ТЕХНОЛОГИЧНОСТЬ',
    'value.techText': 'Интеллектуальные системы поддерживают каждое решение',
    'value.global': 'ГЛОБАЛЬНЫЕ ВОЗМОЖНОСТИ',
    'value.globalText': 'Широкий доступ к инструментам по всему миру',
    'products.title': 'НАШИ ПРОДУКТЫ',
    'product.earnText': 'Стабильная доходность на капитал с высокой ликвидностью.',
    'product.earnRate': 'годовых целевая доходность',
    'product.earnRisk': 'НИЗКИЙ РИСК',
    'product.earnBack': 'Капитал размещается под фиксированную ставку, начисления идут регулярно, а доступ к средствам остаётся максимально гибким.',
    'product.strategiesText': 'Активно управляемые стратегии для различных рыночных условий.',
    'product.strategiesRate': 'целевая доходность',
    'product.strategiesRisk': 'УМЕРЕННЫЙ РИСК',
    'product.strategiesBack': 'Trigonum управляет торговыми стратегиями, а вы участвуете в результате с заранее понятными условиями и контролем риска.',
    'product.eventsText': 'Ограниченные по времени возможности с высоким потенциалом.',
    'product.eventsRate': 'целевая доходность',
    'product.eventsRisk': 'ВЫСОКИЙ ПОТЕНЦИАЛ',
    'product.eventsBack': 'TAIS находит рыночные неэффективности, формирует понятную инвестиционную гипотезу и открывает короткое окно для участия.',
    'product.more': 'ПОДРОБНЕЕ',
    'trust.regulation': 'РЕГУЛИРОВАНИЕ В КР',
    'trust.regulationText': 'НАВА — уполномоченный орган в сфере виртуальных активов',
    'trust.license': 'ЛИЦЕНЗИЯ VASP',
    'trust.licenseText': 'Кыргызская Республика · № [указать]',
    'trust.standards': 'СООТВЕТСТВИЕ ТРЕБОВАНИЯМ',
    'trust.standardsText': 'AML · KYC · ПОД/ФТ',
    'trust.support': 'ПОДДЕРЖКА 24/7',
    'trust.supportText': 'Персональная поддержка на каждом этапе',
    'lang.label': 'Язык',
  },
  en: {
    'nav.products': 'PRODUCTS',
    'nav.how': 'HOW IT WORKS',
    'nav.fees': 'FEES',
    'nav.custody': 'CUSTODY',
    'nav.tiers': 'TIERS',
    'nav.compliance': 'COMPLIANCE',
    'nav.about': 'ABOUT US',
    'nav.login': 'LOG IN',
    'nav.open': 'OPEN ACCOUNT',
    'hero.eyebrow': 'INTELLIGENCE. STRATEGIES.',
    'hero.eyebrowResult': 'RESULT.',
    'hero.capital': 'CAPITAL.',
    'hero.intellect': 'INTELLIGENCE.',
    'hero.opportunities': 'OPPORTUNITIES.',
    'hero.description': 'Trigonum Broker — investment solutions designed to grow and protect your capital.',
    'hero.more': 'LEARN MORE',
    'adv.reliability': 'FSA LICENCE',
    'adv.reliabilityText': 'Virtual assets · details in the regulator’s register',
    'adv.diversification': 'AML · KYC · CFT',
    'adv.diversificationText': 'Client identification and source of funds checks',
    'adv.result': 'SEPARATE CUSTODY ACCOUNT',
    'adv.resultText': 'Details tied to you and opened under a contract',
    'adv.liquidity': 'REGULATORY REPORTING',
    'adv.liquidityText': 'Statements for Kyrgyzstan and Russia from the cabinet',
    'value.transparency': 'TRANSPARENCY',
    'value.transparencyText': 'Full information and control over capital',
    'value.client': 'CLIENT FOCUS',
    'value.clientText': 'Individual approach and tailored solutions',
    'value.tech': 'TECHNOLOGY',
    'value.techText': 'Intelligent systems support every decision',
    'value.global': 'GLOBAL ACCESS',
    'value.globalText': 'Broad access to instruments around the world',
    'products.title': 'OUR PRODUCTS',
    'product.earnText': 'Stable capital returns with high liquidity.',
    'product.earnRate': 'target annual return',
    'product.earnRisk': 'LOW RISK',
    'product.earnBack': 'Capital is deployed at a fixed rate with regular accruals while maintaining flexible access to funds.',
    'product.strategiesText': 'Actively managed strategies for different market environments.',
    'product.strategiesRate': 'target return',
    'product.strategiesRisk': 'MODERATE RISK',
    'product.strategiesBack': 'Trigonum manages trading strategies while you participate in the result under transparent terms and controlled risk.',
    'product.eventsText': 'Time-limited opportunities with high potential.',
    'product.eventsRate': 'target return',
    'product.eventsRisk': 'HIGH POTENTIAL',
    'product.eventsBack': 'TAIS identifies market inefficiencies, forms a clear investment thesis and opens a short participation window.',
    'product.more': 'LEARN MORE',
    'trust.regulation': 'KYRGYZ REPUBLIC REGULATION',
    'trust.regulationText': 'NAVA — authorized state body for virtual assets',
    'trust.license': 'VASP LICENSE',
    'trust.licenseText': 'Kyrgyz Republic · No. [insert]',
    'trust.standards': 'REGULATORY COMPLIANCE',
    'trust.standardsText': 'AML · KYC · CFT',
    'trust.support': '24/7 SUPPORT',
    'trust.supportText': 'Personal support at every stage',
    'lang.label': 'Language',
  },
  ky: {
    'nav.products': 'ПРОДУКТТАР',
    'nav.how': 'КАНТИП ИШТЕЙТ',
    'nav.fees': 'КОМИССИЯЛАР',
    'nav.custody': 'САКТОО',
    'nav.tiers': 'ДЕҢГЭЭЛДЕР',
    'nav.compliance': 'КОМПЛАЕНС',
    'nav.about': 'БИЗ ЖӨНҮНДӨ',
    'nav.login': 'КИРҮҮ',
    'nav.open': 'ЭСЕП АЧУУ',
    'hero.eyebrow': 'ИНТЕЛЛЕКТ. СТРАТЕГИЯЛАР.',
    'hero.eyebrowResult': 'НАТЫЙЖА.',
    'hero.capital': 'КАПИТАЛ.',
    'hero.intellect': 'ИНТЕЛЛЕКТ.',
    'hero.opportunities': 'МҮМКҮНЧҮЛҮКТӨР.',
    'hero.description': 'Trigonum Broker — капиталыңызды өстүрүү жана коргоо үчүн инвестициялык чечимдер.',
    'hero.more': 'КӨБҮРӨӨК БИЛҮҮ',
    'adv.reliability': 'КР ФКЖ ЛИЦЕНЗИЯСЫ',
    'adv.reliabilityText': 'Виртуалдык активдер · маалымат жөнгө салуучунун реестринде',
    'adv.diversification': 'AML · KYC · CFT',
    'adv.diversificationText': 'Кардарды идентификациялоо жана каражаттын булагын текшерүү',
    'adv.result': 'ӨЗҮНЧӨ САКТОО ЭСЕБИ',
    'adv.resultText': 'Реквизиттер сизге бекитилген жана келишим боюнча ачылат',
    'adv.liquidity': 'ЖӨНГӨ САЛУУЧУГА ОТЧЁТ',
    'adv.liquidityText': 'Кыргызстан жана Россиянын формасындагы көчүрмө кабинеттен',
    'value.transparency': 'АЧЫК-АЙКЫНДУУЛУК',
    'value.transparencyText': 'Толук маалымат жана капиталды көзөмөлдөө',
    'value.client': 'КАРДАРГА БАГЫТТАЛУУ',
    'value.clientText': 'Жеке мамиле жана жекече чечимдер',
    'value.tech': 'ТЕХНОЛОГИЯЛУУЛУК',
    'value.techText': 'Интеллектуалдык системалар ар бир чечимди колдойт',
    'value.global': 'ГЛОБАЛДЫК МҮМКҮНЧҮЛҮКТӨР',
    'value.globalText': 'Дүйнө жүзүндөгү инструменттерге кеңири жеткиликтүүлүк',
    'products.title': 'БИЗДИН ПРОДУКТТАР',
    'product.earnText': 'Жогорку ликвиддүүлүк менен капиталдын туруктуу кирешелүүлүгү.',
    'product.earnRate': 'жылдык максаттуу киреше',
    'product.earnRisk': 'ТӨМӨН ТОБОКЕЛДИК',
    'product.earnBack': 'Капитал туруктуу чен менен жайгаштырылып, киреше үзгүлтүксүз эсептелет жана каражатка жеткиликтүүлүк ийкемдүү бойдон калат.',
    'product.strategiesText': 'Ар кандай рыноктук шарттар үчүн активдүү башкарылган стратегиялар.',
    'product.strategiesRate': 'максаттуу киреше',
    'product.strategiesRisk': 'ОРТО ТОБОКЕЛДИК',
    'product.strategiesBack': 'Trigonum соода стратегияларын башкарат, ал эми сиз ачык шарттар жана көзөмөлдөнгөн тобокелдик менен натыйжага катышасыз.',
    'product.eventsText': 'Жогорку потенциалы бар убактысы чектелген мүмкүнчүлүктөр.',
    'product.eventsRate': 'максаттуу киреше',
    'product.eventsRisk': 'ЖОГОРКУ ПОТЕНЦИАЛ',
    'product.eventsBack': 'TAIS рыноктук натыйжасыздыктарды табат, түшүнүктүү инвестициялык гипотеза түзөт жана катышуу үчүн кыска терезе ачат.',
    'product.more': 'ТОЛУГУРААК',
    'trust.regulation': 'КРДЕГИ ЖӨНГӨ САЛУУ',
    'trust.regulationText': 'ВАУА — виртуалдык активдер чөйрөсүндөгү ыйгарым укуктуу мамлекеттик орган',
    'trust.license': 'VASP ЛИЦЕНЗИЯСЫ',
    'trust.licenseText': 'Кыргыз Республикасы · № [көрсөтүү]',
    'trust.standards': 'ТАЛАПТАРГА ШАЙКЕШТИК',
    'trust.standardsText': 'AML · KYC · ПОД/ФТ',
    'trust.support': '24/7 КОЛДОО',
    'trust.supportText': 'Ар бир этапта жеке колдоо',
    'lang.label': 'Тил',
  },
}

type I18nContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('trigonum-language')
    return stored === 'en' || stored === 'ky' || stored === 'ru' ? stored : 'ru'
  })

  const setLanguage = (next: Language) => {
    setLanguageState(next)
    localStorage.setItem('trigonum-language', next)
  }

  useEffect(() => {
    document.documentElement.lang = language === 'ky' ? 'ky' : language
  }, [language])

  const value = useMemo<I18nContextValue>(() => ({
    language,
    setLanguage,
    t: (key) => dictionaries[language][key] ?? dictionaries.ru[key] ?? key,
  }), [language])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n must be used inside I18nProvider')
  return value
}
