/**
 * Перечень документов из приложения №1.1 к Регламенту.
 * Это единый источник данных для регистрации и экрана загрузки досье.
 */

export type ClientType = 'individual' | 'company'
export type Jurisdiction = 'KG' | 'RU' | 'AE' | 'TR' | 'OTHER'

export const JURISDICTIONS: { id: Jurisdiction; label: string; short: string }[] = [
  { id: 'KG', label: 'Кыргызская Республика', short: 'Кыргызстан' },
  { id: 'RU', label: 'Российская Федерация', short: 'Россия' },
  { id: 'AE', label: 'Объединённые Арабские Эмираты', short: 'ОАЭ' },
  { id: 'TR', label: 'Турецкая Республика', short: 'Турция' },
  { id: 'OTHER', label: 'Другая страна', short: 'Другая страна' },
]

export type DocumentForm = 'original' | 'notarized' | 'translated' | 'apostilled'

export const DOCUMENT_FORMS: Record<DocumentForm, { label: string; hint: string }> = {
  original: {
    label: 'Оригинал или нотариально заверенная копия',
    hint: 'Документ должен быть действителен на дату предъявления. При представлении копии оригинал предъявляется для ознакомления и сверки.',
  },
  notarized: {
    label: 'Нотариально заверенная копия',
    hint: 'Копия документа должна быть заверена нотариально.',
  },
  translated: {
    label: 'Переведённая, прошитая и нотариально заверенная копия',
    hint: 'Документ на иностранном языке представляется с переводом на государственный или официальный язык, прошитым и нотариально заверенным.',
  },
  apostilled: {
    label: 'Апостиль / легализация и нотариально заверенный перевод',
    hint: 'Документы иностранных государственных органов, подтверждающие статус юридического лица-нерезидента, легализуются (апостилируются), кроме предусмотренных международными договорами случаев.',
  },
}

export interface RequiredDocument {
  id: string
  title: string
  note?: string
  form: DocumentForm
  optional?: boolean
  condition?: string
  maxAgeMonths?: number
  multiple?: boolean
}

export const FORM_RULES: string[] = [
  'Все документы представляются в подлиннике, действительном на дату предъявления, либо в нотариально заверенной копии.',
  'Если к верификации относится только часть документа, может быть представлена нотариально заверенная выписка из него.',
  'При представлении копий оригиналы предъявляются Оператору обмена для ознакомления и сверки.',
  'Документы, составленные полностью или частично на иностранном языке, представляются с переводом на государственный или официальный язык, прошитым и нотариально заверенным.',
  'Документы иностранных государственных органов, подтверждающие статус юридического лица-нерезидента, принимаются с обязательной легализацией (апостилем), кроме случаев, предусмотренных международными договорами Кыргызской Республики.',
]

const SOURCE_OF_FUNDS: RequiredDocument = {
  id: 'sof',
  title: 'Документы, подтверждающие источник происхождения денежных средств (ИПДС)',
  form: 'original',
  multiple: true,
}

const BANK_AGREEMENT: RequiredDocument = {
  id: 'bank-agreement',
  title: 'Договор о банковском обслуживании',
  note: 'С указанием банковских счетов, с которых планируется пополнение брокерского счёта.',
  form: 'original',
  multiple: true,
}

const INDIVIDUAL_KG: RequiredDocument[] = [
  { id: 'form', title: 'Анкета физического лица', form: 'original' },
  { id: 'id-card', title: 'Идентификационная карта — паспорт гражданина Кыргызской Республики (ID-карта)', form: 'original' },
  SOURCE_OF_FUNDS,
  BANK_AGREEMENT,
]

const INDIVIDUAL_FOREIGN: RequiredDocument[] = [
  { id: 'form', title: 'Анкета физического лица', form: 'original' },
  { id: 'passport', title: 'Копия паспорта', form: 'notarized' },
  {
    id: 'residence',
    title: 'Верификация для нерезидента — подтверждение адреса проживания',
    note: 'Выписка со счёта, договор аренды, счёт за коммунальные услуги или иной документ, подтверждающий адрес проживания.',
    form: 'original',
    multiple: true,
  },
  SOURCE_OF_FUNDS,
  BANK_AGREEMENT,
]

const COMPANY_FORM: RequiredDocument = {
  id: 'company-form',
  title: 'Анкета юридического лица',
  note: 'Подписывается лицом, имеющим право подписи и право открытия/ведения брокерского счёта, и заверяется печатью юридического лица. Обязательно отражаются бенефициарные владельцы с долей 5% и более, включая цепочки владения через юридические лица.',
  form: 'original',
}

const UBO_SCHEME: RequiredDocument = {
  id: 'ubo-scheme',
  title: 'Схема бенефициарного владения юридическим лицом',
  note: 'Заверяется печатью юридического лица.',
  form: 'original',
}

const SIGNATURE_CARD: RequiredDocument = {
  id: 'signature-card',
  title: 'Карточка образцов подписей (КОП)',
  note: 'При удалённой идентификации подпись подписанта/подписантов должна быть нотариально заверена.',
  form: 'notarized',
  multiple: true,
}

const UBO_RESIDENCE: RequiredDocument = {
  id: 'ubo-residence',
  title: 'Верификация бенефициарных владельцев с долей 25% и более и генерального директора',
  note: 'Документ, подтверждающий пребывание/адрес: выписка со счёта, договор аренды, счёт за коммунальные услуги или иной документ, подтверждающий адрес нахождения.',
  form: 'original',
  multiple: true,
}

const OFFICE_LEASE: RequiredDocument = {
  id: 'office-lease',
  title: 'Договор аренды офиса / помещения',
  note: 'Действующий на момент подачи документов.',
  form: 'original',
  maxAgeMonths: 6,
}

const COMPANY_KG: RequiredDocument[] = [
  COMPANY_FORM,
  UBO_SCHEME,
  SIGNATURE_CARD,
  { id: 'incorporation-decision', title: 'Решение бенефициара-участника (участников) о создании либо перерегистрации юридического лица', form: 'original', multiple: true },
  { id: 'charter', title: 'Устав', form: 'original' },
  { id: 'founding-agreement', title: 'Учредительный договор', form: 'original', optional: true, condition: 'При наличии' },
  { id: 'registration-certificate', title: 'Свидетельство о регистрации юридического лица / приказ', form: 'original' },
  { id: 'charter-amendments', title: 'Изменения (дополнения) в учредительные документы', note: 'Решения, протоколы и иные документы.', form: 'original', optional: true, condition: 'Если изменения вносились', multiple: true },
  { id: 'tax-registration', title: 'Документ, подтверждающий постановку на учёт в налоговом органе', form: 'original' },
  { id: 'financials', title: 'Финансовая отчётность за последний год и/или квартал', note: 'Аудированная — при наличии; с отметкой налогового органа о принятии.', form: 'original', multiple: true },
  { id: 'authority', title: 'Документы, подтверждающие полномочия лиц с правом открытия и ведения счёта и правом подписи', note: 'Решения, приказы, доверенности и другие документы, заверенные печатью юридического лица.', form: 'original', multiple: true },
  { id: 'shareholders-register', title: 'Реестр акционеров', form: 'original', optional: true, condition: 'При наличии' },
  { id: 'nonresident-status', title: 'Документ, подтверждающий статус юридического лица-нерезидента', note: 'Выписка из реестра.', form: 'apostilled', maxAgeMonths: 6, optional: true, condition: 'Если применимо к юридическому лицу-нерезиденту' },
  { id: 'director-passport', title: 'Паспорта руководителя и бенефициарных владельцев — учредителей / участников / акционеров', form: 'original', multiple: true },
  { id: 'licenses', title: 'Лицензии', form: 'original', optional: true, condition: 'При наличии', multiple: true },
  { ...UBO_RESIDENCE, optional: true, condition: 'Для нерезидентов — бенефициарных владельцев с долей 25% и более и генерального директора' },
  OFFICE_LEASE,
  SOURCE_OF_FUNDS,
  BANK_AGREEMENT,
]

const COMPANY_RU: RequiredDocument[] = [
  COMPANY_FORM,
  UBO_SCHEME,
  SIGNATURE_CARD,
  { id: 'incorporation-decision', title: 'Решение бенефициара-участника (участников) о создании либо перерегистрации юридического лица', form: 'notarized', multiple: true },
  { id: 'charter', title: 'Устав', form: 'notarized' },
  { id: 'founding-agreement', title: 'Учредительный договор', form: 'notarized', optional: true, condition: 'При наличии' },
  { id: 'registration-certificate', title: 'Свидетельство о регистрации / лист записи о создании', form: 'notarized' },
  { id: 'charter-amendments', title: 'Изменения (дополнения) в учредительные документы', note: 'Решения, протоколы и иные документы.', form: 'notarized', optional: true, condition: 'Если изменения вносились', multiple: true },
  { id: 'tax-registration', title: 'Документ, подтверждающий постановку на учёт в налоговом органе', form: 'notarized' },
  { id: 'financials', title: 'Финансовая отчётность за последний год и/или квартал', note: 'Аудированная — при наличии; с отметкой налогового органа о принятии.', form: 'original', multiple: true },
  { id: 'authority', title: 'Документы, подтверждающие полномочия лиц с правом открытия и ведения брокерского счёта и правом подписи', form: 'notarized', multiple: true },
  { id: 'shareholders-register', title: 'Реестр акционеров', form: 'notarized', optional: true, condition: 'При наличии' },
  { id: 'egrul', title: 'Выписка из ЕГРЮЛ', note: 'Заверенная гербовой печатью выдавшего органа либо нотариально.', form: 'notarized', maxAgeMonths: 6 },
  { id: 'director-passport', title: 'Паспорта руководителя и бенефициарных владельцев — учредителей / участников / акционеров', form: 'notarized', multiple: true },
  { id: 'licenses', title: 'Лицензии', form: 'notarized', optional: true, condition: 'При наличии', multiple: true },
  UBO_RESIDENCE,
  OFFICE_LEASE,
  SOURCE_OF_FUNDS,
  BANK_AGREEMENT,
]

const COMPANY_AE: RequiredDocument[] = [
  COMPANY_FORM,
  UBO_SCHEME,
  { id: 'accession', title: 'Договор / заявление на присоединение', form: 'original' },
  SIGNATURE_CARD,
  { id: 'shareholder-resolution', title: 'Shareholder’s Resolution', form: 'translated', optional: true, condition: 'При наличии', multiple: true },
  { id: 'articles-of-association', title: 'Articles of Association', form: 'translated' },
  { id: 'memorandum-of-association', title: 'Memorandum of Association', form: 'translated' },
  { id: 'registration-certificate', title: 'Certificate of Incorporation / Registration', form: 'apostilled' },
  { id: 'tax-registration', title: 'Tax ID / Tax Certificate', form: 'translated', optional: true, condition: 'При наличии' },
  { id: 'financials', title: 'Financial Statements — annual and/or quarterly', note: 'Аудированная отчётность — при наличии.', form: 'translated', multiple: true },
  { id: 'incumbency-directors', title: 'Certificate of Incumbency / List of Directors / Extract of Directors', form: 'translated' },
  { id: 'share-certificate-register', title: 'Share Certificate / Register', form: 'translated', multiple: true },
  { id: 'good-standing', title: 'Certificate of Good Standing (или Summary of Registration Certificate)', note: 'Оригинал, легализованный для Кыргызской Республики, с заверенным переводом.', form: 'apostilled', maxAgeMonths: 6 },
  { id: 'director-passport', title: 'Паспорта директора и UBO', note: 'Для документа на иностранном языке требуется прошитый и нотариально заверенный перевод.', form: 'translated', multiple: true },
  { id: 'licenses', title: 'Business License', form: 'translated', multiple: true },
  UBO_RESIDENCE,
  OFFICE_LEASE,
  SOURCE_OF_FUNDS,
  BANK_AGREEMENT,
]

const COMPANY_TR: RequiredDocument[] = [
  COMPANY_FORM,
  UBO_SCHEME,
  SIGNATURE_CARD,
  { id: 'incorporation-decision', title: 'Решение бенефициара-участника (участников) о создании либо перерегистрации юридического лица', form: 'apostilled', optional: true, condition: 'При наличии', multiple: true },
  { id: 'gazete-kurulus', title: 'Gazete (Kurulus)', form: 'translated' },
  { id: 'founding-agreement', title: 'Учредительный договор', form: 'translated', optional: true, condition: 'При наличии' },
  { id: 'trade-registry', title: 'Выписка из Торгового реестра Турции с датой (Turkiye Ticaret Sicil Gazetesi)', form: 'apostilled', maxAgeMonths: 6 },
  { id: 'tax-registration', title: 'Свидетельство о постановке на учёт в налоговом органе (Vergi Levhasi)', form: 'translated' },
  { id: 'financials', title: 'Финансовая отчётность за последний год и/или квартал', note: 'Аудированная — при наличии; с отметкой налогового органа о принятии.', form: 'original', multiple: true },
  { id: 'imza-sirkuleri', title: 'Imza Sirkuleri — уполномоченные лица', form: 'translated', multiple: true },
  { id: 'ortaklik-belgesi', title: 'Ortaklik Belgesi — выписка из реестра акционеров', form: 'translated' },
  { id: 'licenses', title: 'Лицензии', form: 'translated', optional: true, condition: 'При наличии', multiple: true },
  UBO_RESIDENCE,
  OFFICE_LEASE,
  SOURCE_OF_FUNDS,
  BANK_AGREEMENT,
]

const COMPANY_OTHER: RequiredDocument[] = [
  COMPANY_FORM,
  UBO_SCHEME,
  SIGNATURE_CARD,
  { id: 'incorporation-decision', title: 'Решение о создании / перерегистрации юридического лица', form: 'apostilled', multiple: true },
  { id: 'charter', title: 'Устав / Articles of Association', form: 'apostilled' },
  { id: 'founding-agreement', title: 'Учредительный договор / Memorandum of Association', form: 'apostilled', optional: true, condition: 'При наличии' },
  { id: 'registration-certificate', title: 'Свидетельство / Certificate of Incorporation', form: 'apostilled' },
  { id: 'tax-registration', title: 'Документ о налоговой регистрации', form: 'translated' },
  { id: 'financials', title: 'Финансовая отчётность', form: 'translated', multiple: true },
  { id: 'authority', title: 'Документы о полномочиях подписантов / директоров', form: 'translated', multiple: true },
  { id: 'shareholders-register', title: 'Реестр акционеров / участников', form: 'translated', multiple: true },
  { id: 'registry-extract', title: 'Актуальная выписка из реестра страны регистрации', form: 'apostilled', maxAgeMonths: 6 },
  { id: 'director-passport', title: 'Паспорта директора и бенефициарных владельцев', form: 'translated', multiple: true },
  { id: 'licenses', title: 'Лицензии', form: 'translated', optional: true, condition: 'При наличии', multiple: true },
  UBO_RESIDENCE,
  OFFICE_LEASE,
  SOURCE_OF_FUNDS,
  BANK_AGREEMENT,
]

const COMPANY_BY_JURISDICTION: Record<Jurisdiction, RequiredDocument[]> = {
  KG: COMPANY_KG,
  RU: COMPANY_RU,
  AE: COMPANY_AE,
  TR: COMPANY_TR,
  OTHER: COMPANY_OTHER,
}

export interface ClientProfile {
  clientType: ClientType
  jurisdiction: Jurisdiction
}

export function documentChecklist({ clientType, jurisdiction }: ClientProfile): RequiredDocument[] {
  if (clientType === 'individual') return jurisdiction === 'KG' ? INDIVIDUAL_KG : INDIVIDUAL_FOREIGN
  return COMPANY_BY_JURISDICTION[jurisdiction] ?? COMPANY_OTHER
}

export function mandatoryCount(items: RequiredDocument[]): number {
  return items.filter((item) => !item.optional).length
}

export function jurisdictionLabel(jurisdiction: Jurisdiction): string {
  return JURISDICTIONS.find((item) => item.id === jurisdiction)?.label ?? jurisdiction
}
