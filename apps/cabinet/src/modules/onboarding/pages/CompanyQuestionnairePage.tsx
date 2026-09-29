import { Building2, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ONBOARDING_STORE_KEY, markOnboardingState, readClientProfile } from '@trigonum/shared'
import { useSession } from '../../../shared/lib/session'
import { ONBOARDING_ROUTES, notifyOnboardingChanged, useOnboardingStepGuard } from '../../../shared/lib/onboarding/useOnboarding'
import { Card } from '../../../shared/ui/Card'
import { PageHeader } from '../../../shared/ui/PageHeader'
import { PrimaryButton } from '../../../shared/ui/buttons'
import { useToast } from '../../../shared/ui/Toast'
import { BackToStatus } from '../ui/BackToStatus'

type BeneficialOwner = {
  id: string
  name: string
  ownership: string
  ownerType: 'individual' | 'company'
  citizenship: string
  taxResidency: string
  birthDate: string
  controlBasis: string
}

type CompanyQuestionnaire = {
  legalName: string
  shortName: string
  jurisdiction: string
  legalForm: string
  registrationNumber: string
  registrationDate: string
  taxId: string
  kpp: string
  legalAddress: string
  actualAddress: string
  website: string
  phone: string
  contactEmail: string
  mainActivity: string
  activityCode: string
  employeesCount: string
  annualRevenue: string
  signatoryName: string
  signatoryPosition: string
  signatoryAuthority: string
  signatoryTaxResidency: string
  beneficialOwners: BeneficialOwner[]
  bankName: string
  bankCountry: string
  bankAccount: string
  bicSwift: string
  plannedFundingSources: string
  fundingCurrencies: string
  expectedMonthlyTurnover: string
  expectedTransactionsCount: string
  fundsPurpose: string
  regulatedActivity: string
  licensesInfo: string
  otherCountries: string
  taxClassification: string
  taxResidencies: string
  fatcaStatus: string
  pepStatus: string
  pepDetails: string
  sanctionsStatus: string
  sanctionsDetails: string
  russianBankTransfer: string
  currencyControlStatus: string
  unk: string
  currencyControlComment: string
  submittedAt: string
}

const emptyOwner = (): BeneficialOwner => ({
  id: `owner-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name: '',
  ownership: '',
  ownerType: 'individual',
  citizenship: '',
  taxResidency: '',
  birthDate: '',
  controlBasis: '',
})

function saveQuestionnaire(payload: CompanyQuestionnaire) {
  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORE_KEY)
    const store = raw ? JSON.parse(raw) as Record<string, unknown> : {}
    store.companyQuestionnaire = payload
    window.localStorage.setItem(ONBOARDING_STORE_KEY, JSON.stringify(store))
  } catch {}
}

export function CompanyQuestionnairePage() {
  const { allowed } = useOnboardingStepGuard('IDENTITY_VERIFIED')
  const session = useSession()
  const profile = useMemo(() => readClientProfile(), [])
  const navigate = useNavigate()
  const toast = useToast()

  const [company, setCompany] = useState({
    shortName: '',
    legalForm: '',
    registrationNumber: '',
    registrationDate: '',
    taxId: '',
    kpp: '',
    legalAddress: '',
    actualAddress: '',
    website: '',
    phone: '',
    contactEmail: '',
    mainActivity: '',
    activityCode: '',
    employeesCount: '',
    annualRevenue: '',
    regulatedActivity: 'no',
    licensesInfo: '',
    otherCountries: '',
    taxClassification: '',
    taxResidencies: '',
    fatcaStatus: '',
    pepStatus: 'no',
    pepDetails: '',
    sanctionsStatus: 'no',
    sanctionsDetails: '',
  })

  const [signatory, setSignatory] = useState({
    name: '',
    position: '',
    authority: '',
    taxResidency: '',
  })

  const [banking, setBanking] = useState({
    bankName: '',
    bankCountry: '',
    bankAccount: '',
    bicSwift: '',
    plannedFundingSources: '',
    fundingCurrencies: 'RUB',
    expectedMonthlyTurnover: '',
    expectedTransactionsCount: '',
    fundsPurpose: '',
    russianBankTransfer: 'yes',
    currencyControlStatus: 'checking',
    unk: '',
    currencyControlComment: '',
  })

  const [beneficialOwners, setBeneficialOwners] = useState<BeneficialOwner[]>([emptyOwner()])
  const [submitting, setSubmitting] = useState(false)

  if (!allowed) return null

  const patchCompany = (patch: Partial<typeof company>) => setCompany((current) => ({ ...current, ...patch }))
  const patchSignatory = (patch: Partial<typeof signatory>) => setSignatory((current) => ({ ...current, ...patch }))
  const patchBanking = (patch: Partial<typeof banking>) => setBanking((current) => ({ ...current, ...patch }))
  const updateOwner = (id: string, patch: Partial<BeneficialOwner>) =>
    setBeneficialOwners((current) => current.map((owner) => owner.id === id ? { ...owner, ...patch } : owner))

  const submit = async () => {
    const owners = beneficialOwners.filter((owner) => owner.name.trim() || owner.ownership.trim())

    const requiredCompany = [
      company.legalForm,
      company.registrationNumber,
      company.registrationDate,
      company.taxId,
      company.legalAddress,
      company.actualAddress,
      company.mainActivity,
      company.contactEmail,
      company.phone,
      company.taxClassification,
      company.taxResidencies,
      company.fatcaStatus,
    ]
    if (requiredCompany.some((value) => !value.trim())) {
      toast('error', 'Заполните обязательные сведения о компании')
      return
    }

    if (company.pepStatus === 'yes' && !company.pepDetails.trim()) {
      toast('error', 'Укажите сведения о PEP: лицо, должность/связь, страна и период')
      return
    }

    if (company.sanctionsStatus === 'yes' && !company.sanctionsDetails.trim()) {
      toast('error', 'Укажите сведения о санкционной связи: лицо/организация, страна, список или основание')
      return
    }

    if (!signatory.name.trim() || !signatory.position.trim() || !signatory.authority.trim() || !signatory.taxResidency.trim()) {
      toast('error', 'Заполните сведения об уполномоченном подписанте')
      return
    }

    if (
      owners.length === 0 ||
      owners.some((owner) =>
        !owner.name.trim() ||
        !owner.ownership.trim() ||
        Number(owner.ownership) < 5 ||
        !owner.controlBasis.trim() ||
        (owner.ownerType === 'individual' && (!owner.citizenship.trim() || !owner.taxResidency.trim()))
      )
    ) {
      toast('error', 'Заполните сведения обо всех владельцах с долей 5% и более и основаниях контроля')
      return
    }

    const isRussianCompany = profile.jurisdiction === 'RU'
    if (isRussianCompany && (!banking.russianBankTransfer.trim() || !banking.currencyControlStatus.trim())) {
      toast('error', 'Заполните сведения по валютному контролю РФ')
      return
    }

    if (!banking.bankName.trim() || !banking.bankCountry.trim() || !banking.bankAccount.trim() || !banking.fundsPurpose.trim()) {
      toast('error', 'Заполните банковские реквизиты и цель использования счёта')
      return
    }

    setSubmitting(true)
    try {
      saveQuestionnaire({
        legalName: session?.accountName ?? 'Юридическое лицо',
        shortName: company.shortName.trim(),
        jurisdiction: profile.jurisdiction,
        legalForm: company.legalForm.trim(),
        registrationNumber: company.registrationNumber.trim(),
        registrationDate: company.registrationDate,
        taxId: company.taxId.trim(),
        kpp: company.kpp.trim(),
        legalAddress: company.legalAddress.trim(),
        actualAddress: company.actualAddress.trim(),
        website: company.website.trim(),
        phone: company.phone.trim(),
        contactEmail: company.contactEmail.trim(),
        mainActivity: company.mainActivity.trim(),
        activityCode: company.activityCode.trim(),
        employeesCount: company.employeesCount.trim(),
        annualRevenue: company.annualRevenue.trim(),
        signatoryName: signatory.name.trim(),
        signatoryPosition: signatory.position.trim(),
        signatoryAuthority: signatory.authority.trim(),
        signatoryTaxResidency: signatory.taxResidency.trim(),
        beneficialOwners: owners,
        bankName: banking.bankName.trim(),
        bankCountry: banking.bankCountry.trim(),
        bankAccount: banking.bankAccount.trim(),
        bicSwift: banking.bicSwift.trim(),
        plannedFundingSources: banking.plannedFundingSources.trim(),
        fundingCurrencies: banking.fundingCurrencies.trim(),
        expectedMonthlyTurnover: banking.expectedMonthlyTurnover.trim(),
        expectedTransactionsCount: banking.expectedTransactionsCount.trim(),
        fundsPurpose: banking.fundsPurpose.trim(),
        regulatedActivity: company.regulatedActivity,
        licensesInfo: company.licensesInfo.trim(),
        otherCountries: company.otherCountries.trim(),
        taxClassification: company.taxClassification,
        taxResidencies: company.taxResidencies.trim(),
        fatcaStatus: company.fatcaStatus,
        pepStatus: company.pepStatus,
        pepDetails: company.pepDetails.trim(),
        sanctionsStatus: company.sanctionsStatus,
        sanctionsDetails: company.sanctionsDetails.trim(),
        russianBankTransfer: banking.russianBankTransfer,
        currencyControlStatus: banking.currencyControlStatus,
        unk: banking.unk.trim(),
        currencyControlComment: banking.currencyControlComment.trim(),
        submittedAt: new Date().toISOString(),
      })
      markOnboardingState('SELF_CERT_COMPLETED')
      markOnboardingState('AGREEMENTS_ACCEPTED')
      notifyOnboardingChanged()
      navigate(ONBOARDING_ROUTES.documents)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="pb-10">
      <PageHeader
        back={<BackToStatus />}
        title="Анкета юридического лица"
        description="Собираем сведения о компании, структуре владения, подписанте, банковских реквизитах и предполагаемом использовании счёта. Данные должны совпадать с корпоративным досье."
      />

      <div className="flex flex-col gap-5">
        <Card title="Регистрационные сведения" action={<Building2 size={17} className="text-[var(--trigonum-blue)]" />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Info label="Полное наименование" value={session?.accountName ?? 'Юридическое лицо'} />
            <Info label="Юрисдикция регистрации" value={profile.jurisdiction} />
            <Field label="Сокращённое наименование"><input value={company.shortName} onChange={(e) => patchCompany({ shortName: e.target.value })} className={inputClass} /></Field>
            <Field label="Организационно-правовая форма *"><input value={company.legalForm} onChange={(e) => patchCompany({ legalForm: e.target.value })} className={inputClass} placeholder="ООО / АО / иное" /></Field>
            <Field label="ОГРН / регистрационный номер *"><input value={company.registrationNumber} onChange={(e) => patchCompany({ registrationNumber: e.target.value })} className={inputClass} /></Field>
            <Field label="Дата регистрации *"><input type="date" value={company.registrationDate} onChange={(e) => patchCompany({ registrationDate: e.target.value })} className={inputClass} /></Field>
            <Field label="ИНН / налоговый номер *"><input value={company.taxId} onChange={(e) => patchCompany({ taxId: e.target.value })} className={inputClass} /></Field>
            <Field label="КПП"><input value={company.kpp} onChange={(e) => patchCompany({ kpp: e.target.value })} className={inputClass} /></Field>
          </div>
        </Card>

        <Card title="Адреса и контакты">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Юридический адрес *"><input value={company.legalAddress} onChange={(e) => patchCompany({ legalAddress: e.target.value })} className={inputClass} /></Field>
            <Field label="Фактический адрес *"><input value={company.actualAddress} onChange={(e) => patchCompany({ actualAddress: e.target.value })} className={inputClass} /></Field>
            <Field label="Корпоративный email *"><input type="email" value={company.contactEmail} onChange={(e) => patchCompany({ contactEmail: e.target.value })} className={inputClass} /></Field>
            <Field label="Телефон *"><input value={company.phone} onChange={(e) => patchCompany({ phone: e.target.value })} className={inputClass} /></Field>
            <Field label="Сайт"><input value={company.website} onChange={(e) => patchCompany({ website: e.target.value })} className={inputClass} placeholder="https://" /></Field>
            <Field label="Страны основной деятельности"><input value={company.otherCountries} onChange={(e) => patchCompany({ otherCountries: e.target.value })} className={inputClass} placeholder="Россия, Казахстан, ОАЭ…" /></Field>
          </div>
        </Card>

        <Card title="Деятельность компании">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Основной вид деятельности *"><input value={company.mainActivity} onChange={(e) => patchCompany({ mainActivity: e.target.value })} className={inputClass} /></Field>
            <Field label="ОКВЭД / отраслевой код"><input value={company.activityCode} onChange={(e) => patchCompany({ activityCode: e.target.value })} className={inputClass} /></Field>
            <Field label="Количество сотрудников"><input type="number" min="0" value={company.employeesCount} onChange={(e) => patchCompany({ employeesCount: e.target.value })} className={inputClass} /></Field>
            <Field label="Годовая выручка"><input value={company.annualRevenue} onChange={(e) => patchCompany({ annualRevenue: e.target.value })} className={inputClass} placeholder="Сумма и валюта" /></Field>
            <Field label="Регулируемая / лицензируемая деятельность">
              <select value={company.regulatedActivity} onChange={(e) => patchCompany({ regulatedActivity: e.target.value })} className={inputClass}>
                <option value="no">Нет</option>
                <option value="yes">Да</option>
              </select>
            </Field>
            <Field label="Лицензии и разрешения"><input value={company.licensesInfo} onChange={(e) => patchCompany({ licensesInfo: e.target.value })} className={inputClass} placeholder="Номер, орган, срок действия" /></Field>
          </div>
        </Card>

        <Card title="Налоговая и международная классификация">
          <p className="mb-4 text-xs leading-relaxed text-[var(--trigonum-muted)]">
            Эти сведения используются для определения налогового статуса компании и применимых требований международного обмена налоговой информацией.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Классификация компании *">
              <select value={company.taxClassification} onChange={(e) => patchCompany({ taxClassification: e.target.value })} className={inputClass}>
                <option value="">Выберите</option>
                <option value="financial_institution">Финансовая организация</option>
                <option value="active_nfe">Активная нефинансовая организация (Active NFE/NFFE)</option>
                <option value="passive_nfe">Пассивная нефинансовая организация (Passive NFE/NFFE)</option>
                <option value="other">Иная / требуется уточнение</option>
              </select>
            </Field>
            <Field label="Налоговые резидентства компании *">
              <input value={company.taxResidencies} onChange={(e) => patchCompany({ taxResidencies: e.target.value })} className={inputClass} placeholder="Россия; при наличии — другие страны" />
            </Field>
            <Field label="FATCA / CRS статус *">
              <select value={company.fatcaStatus} onChange={(e) => patchCompany({ fatcaStatus: e.target.value })} className={inputClass}>
                <option value="">Выберите</option>
                <option value="no_us">Нет налоговых обязательств США / обычный CRS-профиль</option>
                <option value="us_person">Компания является US Person / имеет налоговые обязательства США</option>
                <option value="giin">Финансовая организация с GIIN</option>
                <option value="needs_review">Требуется уточнение налогового статуса</option>
              </select>
            </Field>
          </div>
        </Card>

        <Card title="PEP и санкционные связи">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Есть ли PEP среди руководителей, подписантов или бенефициаров? *">
              <select value={company.pepStatus} onChange={(e) => patchCompany({ pepStatus: e.target.value })} className={inputClass}>
                <option value="no">Нет</option>
                <option value="yes">Да</option>
              </select>
            </Field>
            <Field label="Есть ли санкционные связи или ограничения? *">
              <select value={company.sanctionsStatus} onChange={(e) => patchCompany({ sanctionsStatus: e.target.value })} className={inputClass}>
                <option value="no">Нет</option>
                <option value="yes">Да</option>
              </select>
            </Field>
          </div>
          {company.pepStatus === 'yes' && (
            <Field label="Подробности по PEP *">
              <textarea rows={3} value={company.pepDetails} onChange={(e) => patchCompany({ pepDetails: e.target.value })} className={inputClass} placeholder="Кто именно, должность или связь, страна, период исполнения публичной функции" />
            </Field>
          )}
          {company.sanctionsStatus === 'yes' && (
            <Field label="Подробности по санкционной связи *">
              <textarea rows={3} value={company.sanctionsDetails} onChange={(e) => patchCompany({ sanctionsDetails: e.target.value })} className={inputClass} placeholder="Лицо или организация, страна, санкционный список / основание ограничения, характер связи" />
            </Field>
          )}
        </Card>

        <Card title="Лицо с правом подписи">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ФИО подписанта *"><input value={signatory.name} onChange={(e) => patchSignatory({ name: e.target.value })} className={inputClass} /></Field>
            <Field label="Должность *"><input value={signatory.position} onChange={(e) => patchSignatory({ position: e.target.value })} className={inputClass} /></Field>
            <Field label="Основание полномочий *"><input value={signatory.authority} onChange={(e) => patchSignatory({ authority: e.target.value })} className={inputClass} placeholder="Устав / решение / доверенность" /></Field>
            <Field label="Налоговое резидентство подписанта *"><input value={signatory.taxResidency} onChange={(e) => patchSignatory({ taxResidency: e.target.value })} className={inputClass} /></Field>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[var(--trigonum-muted)]">
            Паспорт и документ о полномочиях проверяются отдельным шагом. Здесь фиксируем сведения, которые должны совпадать с загруженными документами.
          </p>
        </Card>

        <Card title="Структура владения и контроль">
          <p className="mb-4 text-xs leading-relaxed text-[var(--trigonum-muted)]">
            Укажите каждого прямого или косвенного владельца с долей 5% и более. Для юридического лица-владельца добавьте его отдельной строкой и раскройте цепочку до конечных физических лиц. Если контроль осуществляется не только через долю, укажите основание.
          </p>

          <div className="space-y-3">
            {beneficialOwners.map((owner, index) => (
              <div key={owner.id} className="rounded-xl border border-[var(--trigonum-border)] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--trigonum-ink)]">Владелец / контролирующее лицо {index + 1}</p>
                  <button type="button" aria-label="Удалить владельца" onClick={() => setBeneficialOwners((current) => current.filter((item) => item.id !== owner.id))} className="inline-flex size-9 items-center justify-center rounded-lg border border-[var(--trigonum-border)] text-[var(--trigonum-danger)]"><Trash2 size={15} /></button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="ФИО / наименование *"><input value={owner.name} onChange={(e) => updateOwner(owner.id, { name: e.target.value })} className={inputClass} /></Field>
                  <Field label="Тип владельца *">
                    <select value={owner.ownerType} onChange={(e) => updateOwner(owner.id, { ownerType: e.target.value as BeneficialOwner['ownerType'] })} className={inputClass}>
                      <option value="individual">Физическое лицо</option>
                      <option value="company">Юридическое лицо</option>
                    </select>
                  </Field>
                  <Field label="Прямая / косвенная доля, % *"><input type="number" min="5" max="100" step="0.01" value={owner.ownership} onChange={(e) => updateOwner(owner.id, { ownership: e.target.value })} className={inputClass} /></Field>
                  {owner.ownerType === 'individual' && <>
                    <Field label="Гражданство *"><input value={owner.citizenship} onChange={(e) => updateOwner(owner.id, { citizenship: e.target.value })} className={inputClass} /></Field>
                    <Field label="Налоговое резидентство *"><input value={owner.taxResidency} onChange={(e) => updateOwner(owner.id, { taxResidency: e.target.value })} className={inputClass} /></Field>
                    <Field label="Дата рождения"><input type="date" value={owner.birthDate} onChange={(e) => updateOwner(owner.id, { birthDate: e.target.value })} className={inputClass} /></Field>
                  </>}
                  <Field label="Основание владения / контроля *"><input value={owner.controlBasis} onChange={(e) => updateOwner(owner.id, { controlBasis: e.target.value })} className={inputClass} placeholder="Доля, договор, право назначения, иной контроль" /></Field>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={() => setBeneficialOwners((current) => [...current, emptyOwner()])} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--trigonum-blue)]">
            <Plus size={15} /> Добавить владельца / контролирующее лицо
          </button>
        </Card>

        <Card title="Банковские реквизиты и планируемые операции">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Банк отправителя *"><input value={banking.bankName} onChange={(e) => patchBanking({ bankName: e.target.value })} className={inputClass} /></Field>
            <Field label="Страна банка *"><input value={banking.bankCountry} onChange={(e) => patchBanking({ bankCountry: e.target.value })} className={inputClass} /></Field>
            <Field label="Номер счёта / IBAN *"><input value={banking.bankAccount} onChange={(e) => patchBanking({ bankAccount: e.target.value })} className={inputClass} /></Field>
            <Field label="БИК / SWIFT"><input value={banking.bicSwift} onChange={(e) => patchBanking({ bicSwift: e.target.value })} className={inputClass} /></Field>
            <Field label="Источники будущих пополнений"><input value={banking.plannedFundingSources} onChange={(e) => patchBanking({ plannedFundingSources: e.target.value })} className={inputClass} placeholder="Банковский счёт компании, USDT/USDC…" /></Field>
            <Field label="Планируемые валюты"><input value={banking.fundingCurrencies} onChange={(e) => patchBanking({ fundingCurrencies: e.target.value })} className={inputClass} placeholder="RUB, USD, USDT…" /></Field>
            <Field label="Ожидаемый месячный оборот по счёту"><input value={banking.expectedMonthlyTurnover} onChange={(e) => patchBanking({ expectedMonthlyTurnover: e.target.value })} className={inputClass} placeholder="Сумма и валюта" /></Field>
            <Field label="Ожидаемое число операций в месяц"><input type="number" min="0" value={banking.expectedTransactionsCount} onChange={(e) => patchBanking({ expectedTransactionsCount: e.target.value })} className={inputClass} /></Field>
          </div>
          <Field label="Цель открытия и использования счёта *">
            <textarea rows={3} value={banking.fundsPurpose} onChange={(e) => patchBanking({ fundsPurpose: e.target.value })} className={inputClass} placeholder="Например: размещение временно свободной ликвидности, диверсификация, инвестиционное управление" />
          </Field>
        </Card>

        {profile.jurisdiction === 'RU' && (
          <Card title="Валютный контроль РФ">
            <p className="mb-4 text-xs leading-relaxed text-[var(--trigonum-muted)]">
              Укажите сведения со стороны обслуживающего банка. Мы не определяем за банк необходимость постановки договора на учёт — фиксируем фактический статус, который сообщил банк клиента.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Расчёт с Trigonum Broker планируется напрямую с российского банковского счёта? *">
                <select value={banking.russianBankTransfer} onChange={(e) => patchBanking({ russianBankTransfer: e.target.value })} className={inputClass}>
                  <option value="yes">Да</option>
                  <option value="no">Нет</option>
                  <option value="unknown">Пока не определено</option>
                </select>
              </Field>
              <Field label="Статус постановки договора на учёт / УНК *">
                <select value={banking.currencyControlStatus} onChange={(e) => patchBanking({ currencyControlStatus: e.target.value })} className={inputClass}>
                  <option value="checking">Уточняется в банке</option>
                  <option value="required">Требуется постановка на учёт / УНК</option>
                  <option value="not_required">Банк подтвердил, что не требуется</option>
                  <option value="registered">Договор поставлен на учёт</option>
                </select>
              </Field>
              <Field label="УНК / номер постановки на учёт">
                <input value={banking.unk} onChange={(e) => patchBanking({ unk: e.target.value })} className={inputClass} placeholder="Если уже присвоен" />
              </Field>
              <Field label="Комментарий банка / валютного контроля">
                <textarea rows={3} value={banking.currencyControlComment} onChange={(e) => patchBanking({ currencyControlComment: e.target.value })} className={inputClass} placeholder="Например: договор передан на проверку, ожидается ответ банка" />
              </Field>
            </div>
          </Card>
        )}

        <div className="flex justify-end">
          <PrimaryButton disabled={submitting} onClick={() => void submit()}>
            {submitting ? 'Сохраняем' : 'Сохранить анкету и перейти к досье'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}

const inputClass = 'mt-1 w-full rounded-lg border border-[var(--trigonum-border)] bg-white px-3 py-2.5 text-sm text-[var(--trigonum-ink)] outline-none focus:border-[var(--trigonum-ink)]'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-[var(--trigonum-ink)]">{label}{children}</label>
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-[var(--trigonum-muted)]">{label}</p><p className="mt-1 text-sm font-semibold text-[var(--trigonum-ink)]">{value}</p></div>
}
