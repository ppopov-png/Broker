import { Info } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSelfCertification, submitSelfCertification } from '../../../shared/lib/onboarding/api'
import {
  ApiError,
  type AccreditationDetails,
  type InvestorClassification,
  type SelfCertification,
} from '../../../shared/lib/onboarding/types'
import {
  ONBOARDING_ROUTES,
  notifyOnboardingChanged,
  useOnboardingStepGuard,
} from '../../../shared/lib/onboarding/useOnboarding'
import { Card } from '../../../shared/ui/Card'
import { CenteredSpinner, PageHeader } from '../../../shared/ui/PageHeader'
import { useToast } from '../../../shared/ui/Toast'
import { PrimaryButton } from '../../../shared/ui/buttons'
import { BackToStatus } from '../ui/BackToStatus'

type Errors = Partial<Record<'pepDetails' | 'sanctionsDetails' | 'jurisdictionCountry' | 'accreditation', string>>

const emptyAccreditation: AccreditationDetails = {
  netWorth: '',
  annualIncome: '',
  professionalExperience: '',
  portfolioValue: '',
}

const PEP_HINT = `Публичное должностное лицо (PEP) — человек, занимающий или занимавший значимую государственную должность:
· главы государств и правительств
· министры и высокопоставленные чиновники
· судьи высших инстанций
· высшее военное руководство
· руководители государственных компаний

Членов семьи и близких деловых партнёров такого лица тоже считают PEP.`

const SANCTIONS_HINT = `Мы проверяем клиентов по санкционным спискам ООН, ЕС, OFAC и других регуляторов.
Связь с санкционными юрисдикциями или лицами нужно задекларировать — это не всегда означает отказ, но должно быть раскрыто.`

const CLASSIFICATION_HINT = `Классификация определяет, какие инвестиционные продукты вам доступны.
Профессиональные и институциональные инвесторы соответствуют порогам по капиталу, доходу или опыту работы на рынке.
Указанные данные проверяются при рассмотрении заявки.`

export function SelfCertificationPage() {
  const { allowed } = useOnboardingStepGuard('IDENTITY_VERIFIED')
  const navigate = useNavigate()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Errors>({})

  const [isPep, setIsPep] = useState<boolean | undefined>(undefined)
  const [pepDetails, setPepDetails] = useState('')
  const [isSanctioned, setIsSanctioned] = useState<boolean | undefined>(undefined)
  const [sanctionsDetails, setSanctionsDetails] = useState('')
  const [sanctionedJurisdiction, setSanctionedJurisdiction] = useState<boolean | undefined>(undefined)
  const [jurisdictionCountry, setJurisdictionCountry] = useState('')
  const [classification, setClassification] = useState<InvestorClassification>('RETAIL')
  const [accreditation, setAccreditation] = useState<AccreditationDetails>(emptyAccreditation)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const existing = await getSelfCertification()
        if (cancelled) return
        setIsPep(existing.isPep)
        setPepDetails(existing.pepDetails ?? '')
        setIsSanctioned(existing.isSanctioned)
        setSanctionsDetails(existing.sanctionsDetails ?? '')
        setSanctionedJurisdiction(existing.sanctionedJurisdiction)
        setJurisdictionCountry(existing.jurisdictionCountry ?? '')
        setClassification(existing.investorClassification)
        setAccreditation(existing.accreditationDetails ?? emptyAccreditation)
      } catch (error) {
        // 404 на первом заходе — штатный сценарий, ошибку не показываем.
        if (!cancelled && !(error instanceof ApiError && error.status === 404)) {
          toast('error', 'Не удалось загрузить сохранённые данные')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [toast])

  const needsAccreditation = classification !== 'RETAIL'

  const submit = async () => {
    // Условные поля проверяем, только когда они видимы.
    const next: Errors = {}
    if (isPep && !pepDetails.trim()) next.pepDetails = 'Опишите статус PEP'
    if (isSanctioned && !sanctionsDetails.trim()) next.sanctionsDetails = 'Опишите связь с санкциями'
    if (sanctionedJurisdiction && !jurisdictionCountry.trim()) next.jurisdictionCountry = 'Укажите юрисдикцию'
    if (needsAccreditation && Object.values(accreditation).some((value) => !value.trim())) {
      next.accreditation = 'Заполните все поля аккредитации'
    }
    if (isPep === undefined || isSanctioned === undefined || sanctionedJurisdiction === undefined) {
      toast('error', 'Ответьте на все обязательные вопросы')
      setErrors(next)
      return
    }

    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    try {
      const payload: SelfCertification = {
        isPep,
        // Поля отправляем только когда соответствующий ответ «да».
        pepDetails: isPep ? pepDetails.trim() : undefined,
        isSanctioned,
        sanctionsDetails: isSanctioned ? sanctionsDetails.trim() : undefined,
        sanctionedJurisdiction,
        jurisdictionCountry: sanctionedJurisdiction ? jurisdictionCountry.trim() : undefined,
        investorClassification: classification,
        accreditationDetails: needsAccreditation ? accreditation : undefined,
      }
      await submitSelfCertification(payload)
      notifyOnboardingChanged()
      toast('success', 'Самосертификация отправлена')
      navigate(ONBOARDING_ROUTES.agreements)
    } catch {
      toast('error', 'Не удалось отправить форму. Попробуйте ещё раз')
    } finally {
      setSubmitting(false)
    }
  }

  if (!allowed) return null

  return (
    <div className="pb-10">
      <PageHeader
        back={<BackToStatus />}
        title="Самосертификация"
        description="Обязательные декларации перед открытием счёта. Данные проверяются комплаенсом при рассмотрении заявки."
      />

      {loading ? (
        <CenteredSpinner label="Загружаем форму" />
      ) : (
        <div className="flex flex-col gap-5">
          <Card title="Публичные должностные лица" action={<Hint text={PEP_HINT} />}>
            <YesNo
              label="Являетесь ли вы публичным должностным лицом (PEP)?"
              value={isPep}
              onChange={setIsPep}
            />
            {isPep && (
              <Field
                label="Опишите ваш статус PEP"
                helper="Укажите роль, занимаемую должность и период"
                error={errors.pepDetails}
                className="mt-4"
              >
                <textarea
                  value={pepDetails}
                  onChange={(event) => setPepDetails(event.target.value)}
                  rows={3}
                  className={inputClass(Boolean(errors.pepDetails))}
                />
              </Field>
            )}
          </Card>

          <Card title="Санкционные ограничения" action={<Hint text={SANCTIONS_HINT} />}>
            <YesNo
              label="Распространяются ли на вас санкционные ограничения?"
              value={isSanctioned}
              onChange={setIsSanctioned}
            />
            {isSanctioned && (
              <Field
                label="Опишите связь с санкциями"
                error={errors.sanctionsDetails}
                className="mt-4"
              >
                <textarea
                  value={sanctionsDetails}
                  onChange={(event) => setSanctionsDetails(event.target.value)}
                  rows={3}
                  className={inputClass(Boolean(errors.sanctionsDetails))}
                />
              </Field>
            )}

            <div className="mt-5 border-t border-[var(--trigonum-border)] pt-5">
              <YesNo
                label="Связаны ли вы с санкционной юрисдикцией?"
                value={sanctionedJurisdiction}
                onChange={setSanctionedJurisdiction}
              />
              {sanctionedJurisdiction && (
                <Field label="Юрисдикция" error={errors.jurisdictionCountry} className="mt-4">
                  <input
                    value={jurisdictionCountry}
                    maxLength={100}
                    onChange={(event) => setJurisdictionCountry(event.target.value)}
                    className={inputClass(Boolean(errors.jurisdictionCountry))}
                  />
                </Field>
              )}
            </div>
          </Card>

          <Card title="Категория инвестора" action={<Hint text={CLASSIFICATION_HINT} />}>
            <Field label="Категория">
              <select
                value={classification}
                onChange={(event) => setClassification(event.target.value as InvestorClassification)}
                className={inputClass(false)}
              >
                <option value="RETAIL">Розничный инвестор</option>
                <option value="PROFESSIONAL">Профессиональный инвестор</option>
                <option value="INSTITUTIONAL">Институциональный инвестор</option>
              </select>
            </Field>

            {needsAccreditation && (
              <div className="mt-5 rounded-xl border border-[var(--trigonum-border)] bg-[var(--trigonum-bg)] p-4">
                <p className="text-sm font-semibold text-[var(--trigonum-ink)]">Данные для оценки аккредитации</p>
                <p className="mt-0.5 text-xs text-[var(--trigonum-muted)]">
                  Укажите финансовые показатели — они подтверждают выбранную категорию
                </p>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Собственный капитал" helper="Активы за вычетом обязательств">
                    <input
                      value={accreditation.netWorth}
                      onChange={(event) => setAccreditation((current) => ({ ...current, netWorth: event.target.value }))}
                      className={inputClass(false)}
                    />
                  </Field>
                  <Field label="Годовой доход" helper="За последний завершённый год">
                    <input
                      value={accreditation.annualIncome}
                      onChange={(event) =>
                        setAccreditation((current) => ({ ...current, annualIncome: event.target.value }))
                      }
                      className={inputClass(false)}
                    />
                  </Field>
                  <Field label="Стоимость портфеля" helper="Текущая оценка вложений">
                    <input
                      value={accreditation.portfolioValue}
                      onChange={(event) =>
                        setAccreditation((current) => ({ ...current, portfolioValue: event.target.value }))
                      }
                      className={inputClass(false)}
                    />
                  </Field>
                  <Field
                    label="Профессиональный опыт в финансах"
                    helper="Должности, компании, срок работы"
                    className="sm:col-span-2"
                  >
                    <textarea
                      value={accreditation.professionalExperience}
                      onChange={(event) =>
                        setAccreditation((current) => ({ ...current, professionalExperience: event.target.value }))
                      }
                      rows={2}
                      className={inputClass(false)}
                    />
                  </Field>
                </div>

                {errors.accreditation && (
                  <p className="mt-3 text-xs font-medium text-[var(--trigonum-danger)]">{errors.accreditation}</p>
                )}
              </div>
            )}
          </Card>

          <div className="flex justify-end">
            <PrimaryButton type="button" disabled={submitting} onClick={() => void submit()}>
              {submitting ? 'Отправляем…' : 'Отправить и продолжить'}
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  )
}

function inputClass(invalid: boolean) {
  return `w-full rounded-lg border px-3 py-2.5 text-sm text-[var(--trigonum-ink)] outline-none transition ${
    invalid ? 'border-[var(--trigonum-danger)]' : 'border-[var(--trigonum-border)] focus:border-[var(--trigonum-ink)]'
  }`
}

function Field({
  label,
  helper,
  error,
  className = '',
  children,
}: {
  label: string
  helper?: string
  error?: string
  className?: string
  children: ReactNode
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block font-medium text-[var(--trigonum-text)]">{label}</span>
      {children}
      {helper && !error && <span className="mt-1 block text-xs text-[var(--trigonum-muted)]">{helper}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-[var(--trigonum-danger)]">{error}</span>}
    </label>
  )
}

/** Явный выбор: пока пользователь не ответил, значение undefined, а не «нет». */
function YesNo({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean | undefined
  onChange: (value: boolean) => void
}) {
  return (
    <div>
      <p className="text-sm font-medium text-[var(--trigonum-text)]">{label}</p>
      <div className="mt-2 flex gap-2">
        {[
          { key: true, text: 'Да' },
          { key: false, text: 'Нет' },
        ].map((option) => (
          <button
            key={option.text}
            type="button"
            onClick={() => onChange(option.key)}
            aria-pressed={value === option.key}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
              value === option.key
                ? 'border-[var(--trigonum-ink)] bg-[var(--trigonum-ink)] text-white'
                : 'border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] text-[var(--trigonum-text)] hover:border-[var(--trigonum-muted)]'
            }`}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  )
}

function Hint({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        onBlur={() => setOpen(false)}
        className="grid size-7 place-items-center rounded-lg text-[var(--trigonum-muted)] transition hover:bg-[var(--trigonum-bg)]"
        aria-label="Пояснение"
      >
        <Info size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-20 w-[min(320px,80vw)] whitespace-pre-line rounded-xl border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] p-3.5 text-xs leading-relaxed text-[var(--trigonum-text)] shadow-[0_16px_40px_rgb(8_27_58/16%)]">
          {text}
        </div>
      )}
    </div>
  )
}
