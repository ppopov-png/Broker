import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'

export type Language = 'ru' | 'en' | 'ky'

type Dictionary = Record<string, string>

const dictionaries: Record<Language, Dictionary> = {
  ru: {
    'nav.products': 'ПРОДУКТЫ',
    'nav.how': 'ИНВЕСТПРОЦЕСС',
    'nav.results': 'РЕЗУЛЬТАТЫ',
    'nav.fees': 'КОМИССИИ',
    'nav.custody': 'ХРАНЕНИЕ',
    'nav.tiers': 'УРОВНИ',
    'nav.compliance': 'КОМПЛАЕНС',
    'nav.about': 'О НАС',
    'nav.login': 'ВОЙТИ',
    'nav.open': 'ОТКРЫТЬ СЧЁТ',
    'hero.eyebrow': 'ИНВЕСТИЦИОННЫЕ РЕШЕНИЯ.',
    'hero.eyebrowResult': 'КОНТРОЛЬ РИСКА.',
    'hero.capital': 'КАПИТАЛ.',
    'hero.intellect': 'АНАЛИТИКА.',
    'hero.opportunities': 'УПРАВЛЕНИЕ.',
    'hero.description': 'Trigonum Broker — платформа для размещения и управления инвестиционным капиталом в соответствии с условиями выбранных продуктов.',
    'hero.more': 'ИЗУЧИТЬ ПРОДУКТЫ',
    'adv.reliability': 'ЛИЦЕНЗИЯ ФСА КР',
    'adv.reliabilityText': 'Сведения о деятельности с виртуальными активами доступны в реестре регулятора',
    'adv.diversification': 'AML · KYC · ПОД/ФТ',
    'adv.diversificationText': 'Идентификация клиента, проверка источника средств и предусмотренные процедуры финансового мониторинга',
    'adv.result': 'ОТДЕЛЬНЫЙ СЧЁТ ХРАНЕНИЯ',
    'adv.resultText': 'Реквизиты счёта закрепляются за клиентом и предоставляются на основании договора',
    'adv.liquidity': 'РЕГУЛЯТОРНАЯ ОТЧЁТНОСТЬ',
    'adv.liquidityText': 'Выписки и документы формируются в кабинете в предусмотренном формате',
    'value.transparency': 'ПРОЗРАЧНОСТЬ',
    'value.transparencyText': 'Раскрытие условий продуктов, операций и применимых комиссий',
    'value.client': 'ИНДИВИДУАЛЬНОЕ ОБСЛУЖИВАНИЕ',
    'value.clientText': 'Условия доступа и сопровождения с учётом статуса клиента',
    'value.tech': 'ТЕХНОЛОГИЧЕСКАЯ ИНФРАСТРУКТУРА',
    'value.techText': 'Аналитические и автоматизированные системы используются в инвестиционном процессе',
    'value.global': 'ДОСТУП К РЫНКАМ',
    'value.globalText': 'Использование предусмотренного продуктами набора рыночных инструментов',
    'products.title': 'ИНВЕСТИЦИОННЫЕ ПРОДУКТЫ',
    'product.earnText': 'Размещение капитала по фиксированной ставке с установленными условиями ликвидности.',
    'product.earnRate': 'целевая ставка годовых',
    'product.earnRisk': 'НИЗКИЙ УРОВЕНЬ РИСКА',
    'product.earnBack': 'Условия продукта предусматривают фиксированную ставку, регулярное начисление дохода и установленный порядок возврата основной суммы.',
    'product.strategiesText': 'Управляемые инвестиционные стратегии с различными профилями риска.',
    'product.strategiesRate': 'целевая доходность',
    'product.strategiesRisk': 'УМЕРЕННЫЙ УРОВЕНЬ РИСКА',
    'product.strategiesBack': 'Капитал управляется в соответствии с параметрами выбранной стратегии, установленным сроком и правилами контроля риска.',
    'product.eventsText': 'Ограниченные по сроку инвестиционные идеи, сформированные на основе рыночного анализа.',
    'product.eventsRate': 'целевая доходность',
    'product.eventsRisk': 'ПОВЫШЕННЫЙ УРОВЕНЬ РИСКА',
    'product.eventsBack': 'TAIS используется для выявления и анализа рыночных событий и неэффективностей; условия каждой инвестиционной идеи раскрываются до начала участия.',
    'product.more': 'УСЛОВИЯ ПРОДУКТА',
    'trust.regulation': 'РЕГУЛИРОВАНИЕ В КР',
    'trust.regulationText': 'Деятельность осуществляется в соответствии с применимыми требованиями Кыргызской Республики',
    'trust.license': 'ЛИЦЕНЗИЯ VASP',
    'trust.licenseText': 'Кыргызская Республика · сведения в реестре регулятора',
    'trust.standards': 'КОМПЛАЕНС-ПРОЦЕДУРЫ',
    'trust.standardsText': 'AML · KYC · ПОД/ФТ',
    'trust.support': 'КЛИЕНТСКАЯ ПОДДЕРЖКА',
    'trust.supportText': 'Сопровождение клиентов по вопросам счёта, документов и продуктов',
    'lang.label': 'Язык',
  },
  en: {
    'nav.products': 'PRODUCTS',
    'nav.how': 'PROCESS',
    'nav.results': 'RESULTS',
    'nav.fees': 'FEES',
    'nav.custody': 'CUSTODY',
    'nav.tiers': 'TIERS',
    'nav.compliance': 'COMPLIANCE',
    'nav.about': 'ABOUT US',
    'nav.login': 'LOG IN',
    'nav.open': 'OPEN ACCOUNT',
    'hero.eyebrow': 'INVESTMENT SOLUTIONS.',
    'hero.eyebrowResult': 'RISK CONTROL.',
    'hero.capital': 'CAPITAL.',
    'hero.intellect': 'ANALYTICS.',
    'hero.opportunities': 'MANAGEMENT.',
    'hero.description': 'Trigonum Broker is a platform for deploying and managing investment capital in accordance with the terms of the selected products.',
    'hero.more': 'VIEW PRODUCTS',
    'adv.reliability': 'FSA LICENCE',
    'adv.reliabilityText': 'Information on virtual-asset activities is available in the regulator’s register',
    'adv.diversification': 'AML · KYC · CFT',
    'adv.diversificationText': 'Client identification, source-of-funds checks and applicable financial-monitoring procedures',
    'adv.result': 'SEPARATE CUSTODY ACCOUNT',
    'adv.resultText': 'Account details are assigned to the client and provided under the applicable agreement',
    'adv.liquidity': 'REGULATORY REPORTING',
    'adv.liquidityText': 'Statements and documents are generated in the cabinet in the prescribed format',
    'value.transparency': 'TRANSPARENCY',
    'value.transparencyText': 'Disclosure of product terms, transactions and applicable fees',
    'value.client': 'CLIENT SERVICE',
    'value.clientText': 'Access and support conditions reflecting the client’s service tier',
    'value.tech': 'TECHNOLOGY INFRASTRUCTURE',
    'value.techText': 'Analytical and automated systems are incorporated into the investment process',
    'value.global': 'MARKET ACCESS',
    'value.globalText': 'Use of the market instruments permitted by the relevant products',
    'products.title': 'INVESTMENT PRODUCTS',
    'product.earnText': 'Capital placement at a fixed rate with defined liquidity terms.',
    'product.earnRate': 'target annual rate',
    'product.earnRisk': 'LOW RISK',
    'product.earnBack': 'The product provides for a fixed rate, regular income accrual and a defined procedure for returning principal.',
    'product.strategiesText': 'Managed investment strategies with different risk profiles.',
    'product.strategiesRate': 'target return',
    'product.strategiesRisk': 'MODERATE RISK',
    'product.strategiesBack': 'Capital is managed in accordance with the selected strategy, its stated term and applicable risk-control rules.',
    'product.eventsText': 'Time-limited investment ideas based on market analysis.',
    'product.eventsRate': 'target return',
    'product.eventsRisk': 'ELEVATED RISK',
    'product.eventsBack': 'TAIS is used to identify and assess market events and inefficiencies; the terms of each investment idea are disclosed before participation begins.',
    'product.more': 'PRODUCT TERMS',
    'trust.regulation': 'KYRGYZ REPUBLIC REGULATION',
    'trust.regulationText': 'Activities are conducted in accordance with applicable requirements of the Kyrgyz Republic',
    'trust.license': 'VASP LICENCE',
    'trust.licenseText': 'Kyrgyz Republic · information available in the regulator’s register',
    'trust.standards': 'COMPLIANCE PROCEDURES',
    'trust.standardsText': 'AML · KYC · CFT',
    'trust.support': 'CLIENT SUPPORT',
    'trust.supportText': 'Support on account, documentation and product matters',
    'lang.label': 'Language',
  },
  ky: {
    'nav.products': 'ПРОДУКТТАР',
    'nav.how': 'ИНВЕСТПРОЦЕСС',
    'nav.results': 'НАТЫЙЖАЛАР',
    'nav.fees': 'КОМИССИЯЛАР',
    'nav.custody': 'САКТОО',
    'nav.tiers': 'ДЕҢГЭЭЛДЕР',
    'nav.compliance': 'КОМПЛАЕНС',
    'nav.about': 'БИЗ ЖӨНҮНДӨ',
    'nav.login': 'КИРҮҮ',
    'nav.open': 'ЭСЕП АЧУУ',
    'hero.eyebrow': 'ИНВЕСТИЦИЯЛЫК ЧЕЧИМДЕР.',
    'hero.eyebrowResult': 'ТОБОКЕЛДИКТИ КӨЗӨМӨЛДӨӨ.',
    'hero.capital': 'КАПИТАЛ.',
    'hero.intellect': 'АНАЛИТИКА.',
    'hero.opportunities': 'БАШКАРУУ.',
    'hero.description': 'Trigonum Broker — тандалган продукттардын шарттарына ылайык инвестициялык капиталды жайгаштыруу жана башкаруу платформасы.',
    'hero.more': 'ПРОДУКТТАРДЫ КӨРҮҮ',
    'adv.reliability': 'КР ФКЖ ЛИЦЕНЗИЯСЫ',
    'adv.reliabilityText': 'Виртуалдык активдер боюнча ишмердик жөнүндө маалымат жөнгө салуучунун реестринде жеткиликтүү',
    'adv.diversification': 'AML · KYC · CFT',
    'adv.diversificationText': 'Кардарды идентификациялоо, каражаттын булагын текшерүү жана каралган финансылык мониторинг жол-жоболору',
    'adv.result': 'ӨЗҮНЧӨ САКТОО ЭСЕБИ',
    'adv.resultText': 'Эсептин реквизиттери кардарга бекитилет жана келишимдин негизинде берилет',
    'adv.liquidity': 'ЖӨНГӨ САЛУУЧУ ОТЧЁТТУУЛУК',
    'adv.liquidityText': 'Көчүрмөлөр жана документтер кабинетте каралган форматта түзүлөт',
    'value.transparency': 'АЧЫК-АЙКЫНДУУЛУК',
    'value.transparencyText': 'Продукт шарттарын, операцияларды жана колдонулуучу комиссияларды ачык көрсөтүү',
    'value.client': 'КАРДАРЛЫК ТЕЙЛӨӨ',
    'value.clientText': 'Кардардын деңгээлине жараша жеткиликтүүлүк жана коштоо шарттары',
    'value.tech': 'ТЕХНОЛОГИЯЛЫК ИНФРАСТРУКТУРА',
    'value.techText': 'Аналитикалык жана автоматташтырылган системалар инвестициялык процессте колдонулат',
    'value.global': 'РЫНОКТОРГО ЖЕТҮҮ',
    'value.globalText': 'Тиешелүү продукттарда каралган рыноктук инструменттерди колдонуу',
    'products.title': 'ИНВЕСТИЦИЯЛЫК ПРОДУКТТАР',
    'product.earnText': 'Белгиленген ликвиддүүлүк шарттары менен туруктуу чен боюнча капиталды жайгаштыруу.',
    'product.earnRate': 'максаттуу жылдык чен',
    'product.earnRisk': 'ТӨМӨН ТОБОКЕЛДИК',
    'product.earnBack': 'Продукт туруктуу ченди, кирешени үзгүлтүксүз эсептөөнү жана негизги сумманы кайтаруунун белгиленген тартибин карайт.',
    'product.strategiesText': 'Ар кандай тобокелдик профилдери бар башкарылуучу инвестициялык стратегиялар.',
    'product.strategiesRate': 'максаттуу киреше',
    'product.strategiesRisk': 'ОРТО ТОБОКЕЛДИК',
    'product.strategiesBack': 'Капитал тандалган стратегиянын параметрлерине, белгиленген мөөнөткө жана тобокелдикти көзөмөлдөө эрежелерине ылайык башкарылат.',
    'product.eventsText': 'Рыноктук талдоого негизделген мөөнөтү чектелген инвестициялык идеялар.',
    'product.eventsRate': 'максаттуу киреше',
    'product.eventsRisk': 'ЖОГОРУЛАТЫЛГАН ТОБОКЕЛДИК',
    'product.eventsBack': 'TAIS рыноктук окуяларды жана натыйжасыздыктарды аныктоо жана баалоо үчүн колдонулат; ар бир инвестициялык идеянын шарттары катышуу башталганга чейин ачылат.',
    'product.more': 'ПРОДУКТТУН ШАРТТАРЫ',
    'trust.regulation': 'КРДЕГИ ЖӨНГӨ САЛУУ',
    'trust.regulationText': 'Ишмердик Кыргыз Республикасынын колдонулуучу талаптарына ылайык жүргүзүлөт',
    'trust.license': 'VASP ЛИЦЕНЗИЯСЫ',
    'trust.licenseText': 'Кыргыз Республикасы · маалымат жөнгө салуучунун реестринде жеткиликтүү',
    'trust.standards': 'КОМПЛАЕНС ЖОЛ-ЖОБОЛОРУ',
    'trust.standardsText': 'AML · KYC · CFT',
    'trust.support': 'КАРДАРЛЫК КОЛДОО',
    'trust.supportText': 'Эсеп, документтер жана продукттар боюнча коштоо',
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
