/**
 * Перечень документов приложения №1.1 к Регламенту о порядке осуществления
 * деятельности на рынке ценных бумаг и срочном рынке, а также деятельности
 * по сделкам с виртуальными активами.
 *
 * Данными, а не разметкой: состав зависит от типа клиента и юрисдикции, и
 * захардкоженный список пришлось бы держать в четырёх местах — на экране
 * досье, в подсказке до регистрации, в проверке готовности заявки и в
 * регламенте №6. Здесь он один.
 *
 * Требование к форме (`form`) — не украшение: приложение отклоняет документ
 * не только по составу, но и по тому, оригинал это, нотариальная копия,
 * перевод или апостиль. Поэтому форма живёт рядом с самим пунктом.
 */

export type ClientType = 'individual' | 'company'

/** Юрисдикция клиента. Для физлица различаются только КР и всё остальное. */
export type Jurisdiction = 'KG' | 'RU' | 'AE' | 'TR' | 'OTHER'

export const JURISDICTIONS: { id: Jurisdiction; label: string; short: string }[] = [
  { id: 'KG', label: 'Кыргызская Республика', short: 'Кыргызстан' },
  { id: 'RU', label: 'Российская Федерация', short: 'Россия' },
  { id: 'AE', label: 'Объединённые Арабские Эмираты', short: 'ОАЭ' },
  { id: 'TR', label: 'Турецкая Республика', short: 'Турция' },
  { id: 'OTHER', label: 'Другая страна', short: 'Другая страна' },
]

/** Форма представления документа. Порядок — по возрастанию строгости. */
export type DocumentForm = 'original' | 'notarized' | 'translated' | 'apostilled'

export const DOCUMENT_FORMS: Record<DocumentForm, { label: string; hint: string }> = {
  original: {
    label: 'Оригинал или нотариальная копия',
    hint: 'Документ действителен на дату подачи. При подаче копии оригинал предъявляется для сверки.',
  },
  notarized: {
    label: 'Нотариально заверенная копия',
    hint: 'Копия принимается только с отметкой нотариуса.',
  },
  translated: {
    label: 'Перевод, прошитый и заверенный нотариально',
    hint: 'Документ на иностранном языке подаётся с переводом на государственный или официальный язык.',
  },
  apostilled: {
    label: 'Апостиль или легализация плюс нотариальный перевод',
    hint: 'Документы иностранных государственных органов принимаются легализованными. Без апостиля — только если это предусмотрено международным договором с участием Кыргызской Республики.',
  },
}

export interface RequiredDocument {
  id: string
  title: string
  /** Что именно принимается. Показывается под названием. */
  note?: string
  form: DocumentForm
  /** «При наличии» — заявку можно отправить без него. */
  optional?: boolean
  /** Предельный возраст документа на дату подачи, месяцев. */
  maxAgeMonths?: number
}

/* --- Общие требования к форме -------------------------------------------- */

/** Правила, которые действуют поверх любого пункта перечня. */
export const FORM_RULES: string[] = [
  'Документы подаются в подлиннике, действительном на дату предъявления, либо в нотариально заверенных копиях.',
  'Если к верификации относится только часть документа, принимается нотариально заверенная выписка из него.',
  'При подаче копий оригиналы предъявляются оператору обмена для ознакомления и сверки.',
  'Документы на иностранном языке подаются с переводом на государственный или официальный язык, прошитым и заверенным нотариально.',
  'Документы иностранных государственных органов, подтверждающие статус юридических лиц-нерезидентов, принимаются с апостилем, кроме случаев, предусмотренных международными договорами с участием Кыргызской Республики.',
]

/* --- Физические лица ------------------------------------------------------ */

const SOURCE_OF_FUNDS: RequiredDocument = {
  id: 'sof',
  title: 'Документы, подтверждающие источник происхождения денежных средств (ИПДС)',
  note: 'Выписка по счёту, налоговая декларация, трудовой договор, договор продажи актива или отчётность за последние три месяца.',
  form: 'original',
}

const BANK_AGREEMENT: RequiredDocument = {
  id: 'bank-agreement',
  title: 'Договор о банковском обслуживании',
  note: 'С указанием банковских счетов, из которых планируется пополнение брокерского счёта.',
  form: 'original',
}

/** Подтверждение пребывания на территории государства — только для нерезидентов. */
const RESIDENCE_PROOF: RequiredDocument = {
  id: 'residence',
  title: 'Верификация для нерезидентов',
  note: 'Документ, подтверждающий пребывание на территории государства: выписка со счёта, договор аренды, счёт за коммунальные услуги или иной документ с адресом проживания.',
  form: 'original',
}

const INDIVIDUAL_KG: RequiredDocument[] = [
  { id: 'form', title: 'Анкета физического лица', form: 'original' },
  {
    id: 'id-card',
    title: 'Идентификационная карта — паспорт гражданина Кыргызской Республики',
    note: 'ID-карта, действительная на дату подачи.',
    form: 'original',
  },
  SOURCE_OF_FUNDS,
  BANK_AGREEMENT,
]

const INDIVIDUAL_FOREIGN: RequiredDocument[] = [
  { id: 'form', title: 'Анкета физического лица', form: 'original' },
  { id: 'passport', title: 'Копия паспорта', form: 'notarized' },
  RESIDENCE_PROOF,
  SOURCE_OF_FUNDS,
  BANK_AGREEMENT,
]

/* --- Юридические лица ----------------------------------------------------- */

/**
 * Позиции, одинаковые для всех юрисдикций. Различается только форма
 * представления, поэтому она передаётся аргументом, а не дублируется списком.
 */
function companyCommon(form: DocumentForm): RequiredDocument[] {
  return [
    {
      id: 'company-form',
      title: 'Анкета юридического лица',
      note: 'Подписана лицом с правом подписи и правом открытия и ведения брокерского счёта, заверена печатью. Бенефициарные владельцы с долей 5% и более отражаются обязательно, в том числе когда владелец — юридическое лицо.',
      form: 'original',
    },
    {
      id: 'ubo-scheme',
      title: 'Схема бенефициарного владения юридическим лицом',
      note: 'Заверена печатью юридического лица.',
      form: 'original',
    },
    {
      id: 'signature-card',
      title: 'Карточка образцов подписей (КОП)',
      note: 'Для удалённой идентификации подпись подписанта заверяется нотариально.',
      form: 'notarized',
    },
    {
      id: 'incorporation-decision',
      title: 'Решение бенефициара-участника (участников) о создании либо перерегистрации юридического лица',
      form,
    },
    { id: 'charter', title: 'Устав', form },
    { id: 'founding-agreement', title: 'Учредительный договор', form, optional: true },
    { id: 'registration-certificate', title: 'Свидетельство о регистрации юридического лица либо приказ', form },
    {
      id: 'charter-amendments',
      title: 'Изменения и дополнения в учредительные документы',
      note: 'Решение, протокол и иные документы, которыми вносились изменения.',
      form,
      optional: true,
    },
    { id: 'tax-registration', title: 'Документ о постановке на учёт в налоговом органе', form },
    {
      id: 'financials',
      title: 'Финансовая отчётность',
      note: 'За последний год (аудированная при наличии) и/или за квартал с отметкой налогового органа о принятии.',
      form: 'original',
    },
    {
      id: 'authority',
      title: 'Документы, подтверждающие полномочия лиц с правом открытия и ведения счёта',
      note: 'Решения, приказы, доверенности с правом подписи на всех необходимых документах, заверенные печатью юридического лица.',
      form,
    },
    { id: 'shareholders-register', title: 'Реестр акционеров', form, optional: true },
  ]
}

const UBO_RESIDENCE: RequiredDocument = {
  id: 'ubo-residence',
  title: 'Верификация для нерезидентов — бенефициарные владельцы с долей 25% и более и генеральный директор',
  note: 'Документ, подтверждающий пребывание на территории государства: выписка со счёта, договор аренды, счёт за коммунальные услуги или иной документ с адресом нахождения.',
  form: 'original',
}

const OFFICE_LEASE: RequiredDocument = {
  id: 'office-lease',
  title: 'Договор аренды офиса или помещения',
  note: 'Действующий на момент подачи документов.',
  form: 'original',
  maxAgeMonths: 6,
}

/** Позиции, замыкающие перечень в любой юрисдикции. */
function companyTail(form: DocumentForm): RequiredDocument[] {
  return [
    {
      id: 'director-passport',
      title: 'Паспорт руководителя и бенефициарных владельцев',
      note: 'Учредителей, участников или акционеров.',
      form,
    },
    { id: 'licenses', title: 'Лицензии', form, optional: true },
    UBO_RESIDENCE,
    OFFICE_LEASE,
    SOURCE_OF_FUNDS,
    BANK_AGREEMENT,
  ]
}

const COMPANY_KG: RequiredDocument[] = [
  ...companyCommon('original'),
  {
    id: 'nonresident-status',
    title: 'Документ, подтверждающий статус юридических лиц-нерезидентов',
    note: 'Выписка из реестра.',
    form: 'apostilled',
    maxAgeMonths: 6,
  },
  ...companyTail('original'),
]

const COMPANY_RU: RequiredDocument[] = [
  ...companyCommon('notarized'),
  {
    id: 'egrul',
    title: 'Выписка из ЕГРЮЛ',
    note: 'Заверенная гербовой печатью выдавшего органа либо нотариально.',
    form: 'notarized',
    maxAgeMonths: 6,
  },
  ...companyTail('notarized'),
]

/**
 * ОАЭ и Турция перечислены в приложении отдельными списками в местной
 * терминологии, поэтому собираются поштучно, а не из общих блоков: нумерация
 * позиций должна совпадать с приложением, иначе комплаенсу нечем сверяться.
 */
const COMPANY_AE: RequiredDocument[] = [
  {
    id: 'company-form',
    title: 'Анкета юридического лица',
    note: 'Подписана лицом с правом подписи и правом открытия и ведения брокерского счёта, заверена печатью. Бенефициарные владельцы с долей 5% и более отражаются обязательно.',
    form: 'original',
  },
  { id: 'ubo-scheme', title: 'Схема бенефициарного владения юридическим лицом', form: 'original' },
  { id: 'accession', title: 'Договор либо заявление на присоединение', form: 'translated' },
  {
    id: 'signature-card',
    title: 'Карточка образцов подписей (КОП)',
    note: 'Для удалённой идентификации подпись подписанта заверяется нотариально.',
    form: 'notarized',
  },
  { id: 'registration-certificate', title: 'Certificate of Incorporation', note: 'Свидетельство о регистрации.', form: 'translated' },
  { id: 'charter', title: 'Articles of Association', note: 'Устав компании.', form: 'translated' },
  { id: 'founding-agreement', title: 'Memorandum of Association', note: 'Учредительный договор.', form: 'translated' },
  {
    id: 'charter-amendments',
    title: 'Изменения и дополнения в учредительные документы',
    form: 'translated',
    optional: true,
  },
  { id: 'tax-registration', title: 'Tax ID / Tax Certificate', form: 'translated', optional: true },
  {
    id: 'financials',
    title: 'Финансовая отчётность',
    note: 'За последний год (аудированная при наличии) и/или за квартал с отметкой налогового органа о принятии.',
    form: 'original',
  },
  {
    id: 'authority',
    title: 'Документы, подтверждающие полномочия лиц с правом открытия и ведения счёта',
    form: 'translated',
  },
  { id: 'extract-of-directors', title: 'Extract of Directors', note: 'Выписка о директорах компании.', form: 'translated' },
  {
    id: 'registry-extract',
    title: 'Выписка из торгового реестра',
    note: 'Оригинал, легализованный для Кыргызской Республики, с нотариально заверенным переводом.',
    form: 'apostilled',
    maxAgeMonths: 6,
  },
  { id: 'director-passport', title: 'Passport of Director and UBO', note: 'Паспорт директора и бенефициарных владельцев.', form: 'translated' },
  { id: 'licenses', title: 'Business License', form: 'translated' },
  UBO_RESIDENCE,
  OFFICE_LEASE,
  SOURCE_OF_FUNDS,
  BANK_AGREEMENT,
]

const COMPANY_TR: RequiredDocument[] = [
  {
    id: 'company-form',
    title: 'Анкета юридического лица',
    note: 'Подписана лицом с правом подписи и правом открытия и ведения брокерского счёта, заверена печатью. Бенефициарные владельцы с долей 5% и более отражаются обязательно.',
    form: 'original',
  },
  { id: 'ubo-scheme', title: 'Схема бенефициарного владения юридическим лицом', form: 'original' },
  {
    id: 'signature-card',
    title: 'Карточка образцов подписей (КОП)',
    note: 'Для удалённой идентификации подпись подписанта заверяется нотариально.',
    form: 'notarized',
  },
  {
    id: 'incorporation-decision',
    title: 'Решение бенефициара-участника (участников) о создании либо перерегистрации юридического лица',
    form: 'translated',
  },
  { id: 'charter', title: 'Устав', form: 'translated' },
  { id: 'founding-agreement', title: 'Учредительный договор', form: 'translated', optional: true },
  {
    id: 'trade-registry',
    title: 'Выписка из Торгового реестра Турции',
    note: 'Апостилированная, переведённая, прошитая и нотариально заверенная копия.',
    form: 'apostilled',
    maxAgeMonths: 6,
  },
  { id: 'tax-registration', title: 'Свидетельство о постановке на учёт в налоговом органе', form: 'translated' },
  {
    id: 'financials',
    title: 'Финансовая отчётность',
    note: 'За последний год (аудированная при наличии) и/или за квартал с отметкой налогового органа о принятии.',
    form: 'original',
  },
  {
    id: 'authority',
    title: 'Документы, подтверждающие полномочия уполномоченных лиц',
    form: 'translated',
  },
  { id: 'shareholders-register', title: 'Выписка из реестра акционеров', form: 'translated', optional: true },
  { id: 'licenses', title: 'Лицензии', form: 'translated', optional: true },
  UBO_RESIDENCE,
  OFFICE_LEASE,
  SOURCE_OF_FUNDS,
  BANK_AGREEMENT,
]

/** «Документы для иных стран нерезидентов аналогичны вышеуказанным». */
const COMPANY_OTHER: RequiredDocument[] = [
  ...companyCommon('apostilled'),
  {
    id: 'registry-extract',
    title: 'Выписка из торгового реестра страны регистрации',
    note: 'Подтверждает статус юридического лица-нерезидента.',
    form: 'apostilled',
    maxAgeMonths: 6,
  },
  ...companyTail('apostilled'),
]

const COMPANY_BY_JURISDICTION: Record<Jurisdiction, RequiredDocument[]> = {
  KG: COMPANY_KG,
  RU: COMPANY_RU,
  AE: COMPANY_AE,
  TR: COMPANY_TR,
  OTHER: COMPANY_OTHER,
}

/* --- Публичное API -------------------------------------------------------- */

export interface ClientProfile {
  clientType: ClientType
  jurisdiction: Jurisdiction
}

/**
 * Перечень документов для типа клиента и юрисдикции. Для физлица различие
 * ровно одно — гражданин Кыргызской Республики или нет, поэтому остальные
 * юрисдикции сводятся к перечню для иностранного гражданина.
 */
export function documentChecklist({ clientType, jurisdiction }: ClientProfile): RequiredDocument[] {
  if (clientType === 'individual') return jurisdiction === 'KG' ? INDIVIDUAL_KG : INDIVIDUAL_FOREIGN
  return COMPANY_BY_JURISDICTION[jurisdiction] ?? COMPANY_OTHER
}

/** Сколько документов обязательно к подаче — «при наличии» не считаем. */
export function mandatoryCount(items: RequiredDocument[]): number {
  return items.filter((item) => !item.optional).length
}

export function jurisdictionLabel(jurisdiction: Jurisdiction): string {
  return JURISDICTIONS.find((item) => item.id === jurisdiction)?.label ?? jurisdiction
}
