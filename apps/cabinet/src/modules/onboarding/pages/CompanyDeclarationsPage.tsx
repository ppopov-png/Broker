import { Building2, Info } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitSelfCertification } from '../../../shared/lib/onboarding/api'
import { ONBOARDING_ROUTES, notifyOnboardingChanged, useOnboardingStepGuard } from '../../../shared/lib/onboarding/useOnboarding'
import { Card } from '../../../shared/ui/Card'
import { PageHeader } from '../../../shared/ui/PageHeader'
import { useToast } from '../../../shared/ui/Toast'
import { PrimaryButton } from '../../../shared/ui/buttons'
import { BackToStatus } from '../ui/BackToStatus'

/**
 * Для юрлица персональные формулировки «вы / ваши родственники» неприменимы.
 * Здесь декларации относятся к компании, руководителю, подписантам и UBO.
 * Перечень корпоративных документов при этом остаётся отдельным следующим шагом.
 */
export function CompanyDeclarationsPage() {
  const { allowed } = useOnboardingStepGuard('IDENTITY_VERIFIED')
  const navigate = useNavigate()
  const toast = useToast()
  const [isPep, setIsPep] = useState<boolean | undefined>()
  const [pepDetails, setPepDetails] = useState('')
  const [isSanctioned, setIsSanctioned] = useState<boolean | undefined>()
  const [sanctionsDetails, setSanctionsDetails] = useState('')
  const [sanctionedJurisdiction, setSanctionedJurisdiction] = useState<boolean | undefined>()
  const [jurisdictionCountry, setJurisdictionCountry] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!allowed) return null

  const submit = async () => {
    if (isPep === undefined || isSanctioned === undefined || sanctionedJurisdiction === undefined) {
      toast('error', 'Ответьте на все обязательные вопросы')
      return
    }
    if (isPep && !pepDetails.trim()) {
      toast('error', 'Укажите связанных PEP')
      return
    }
    if (isSanctioned && !sanctionsDetails.trim()) {
      toast('error', 'Опишите санкционную связь')
      return
    }
    if (sanctionedJurisdiction && !jurisdictionCountry.trim()) {
      toast('error', 'Укажите юрисдикцию')
      return
    }

    setSubmitting(true)
    try {
      await submitSelfCertification({
        isPep,
        pepDetails: isPep ? pepDetails.trim() : undefined,
        isSanctioned,
        sanctionsDetails: isSanctioned ? sanctionsDetails.trim() : undefined,
        sanctionedJurisdiction,
        jurisdictionCountry: sanctionedJurisdiction ? jurisdictionCountry.trim() : undefined,
        // Техническое значение прототипного контракта. Категория клиента в бою
        // должна приходить из серверной классификации, а не определяться фронтом.
        investorClassification: 'INSTITUTIONAL',
      })
      notifyOnboardingChanged()
      navigate(ONBOARDING_ROUTES.agreements)
    } catch {
      toast('error', 'Не удалось сохранить декларации')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="pb-10">
      <PageHeader
        back={<BackToStatus />}
        title="Декларации юридического лица"
        description="Уточняем сведения о компании и связанных лицах перед подписанием соглашений и загрузкой корпоративного досье."
      />

      <div className="flex flex-col gap-5">
        <Card title="Кого охватывают декларации" action={<Building2 size={17} className="text-[var(--trigonum-blue)]" />}>
          <p className="text-sm leading-relaxed text-[var(--trigonum-text)]">
            Компания, руководитель, лица с правом подписи и бенефициарные владельцы. Сведения о структуре владения и подтверждающие документы будут приложены в корпоративном досье.
          </p>
        </Card>

        <Card title="Публичные должностные лица" action={<Info size={16} className="text-[var(--trigonum-muted)]" />}>
          <YesNo label="Есть ли среди руководителей, подписантов или бенефициарных владельцев PEP?" value={isPep} onChange={setIsPep} />
          {isPep && <TextArea className="mt-4" label="Укажите лицо, статус, должность и период" value={pepDetails} onChange={setPepDetails} />}
        </Card>

        <Card title="Санкционные ограничения">
          <YesNo label="Связаны ли компания, руководители, подписанты или бенефициарные владельцы с санкционными ограничениями?" value={isSanctioned} onChange={setIsSanctioned} />
          {isSanctioned && <TextArea className="mt-4" label="Опишите связь" value={sanctionsDetails} onChange={setSanctionsDetails} />}
          <div className="mt-5 border-t border-[var(--trigonum-border)] pt-5">
            <YesNo label="Есть ли связь с санкционной юрисдикцией?" value={sanctionedJurisdiction} onChange={setSanctionedJurisdiction} />
            {sanctionedJurisdiction && (
              <label className="mt-4 block text-sm font-medium text-[var(--trigonum-text)]">
                Юрисдикция
                <input value={jurisdictionCountry} onChange={(event) => setJurisdictionCountry(event.target.value)} className="mt-1 w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 outline-none" />
              </label>
            )}
          </div>
        </Card>

        <div className="flex justify-end">
          <PrimaryButton disabled={submitting} onClick={() => void submit()}>
            {submitting ? 'Сохраняем…' : 'Сохранить и продолжить'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}

function YesNo({ label, value, onChange }: { label: string; value: boolean | undefined; onChange: (value: boolean) => void }) {
  return (
    <div>
      <p className="text-sm font-medium text-[var(--trigonum-text)]">{label}</p>
      <div className="mt-2 flex gap-2">
        {[{ value: true, label: 'Да' }, { value: false, label: 'Нет' }].map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold ${value === option.value ? 'border-[var(--trigonum-ink)] bg-[var(--trigonum-ink)] text-white' : 'border-[var(--trigonum-border)] text-[var(--trigonum-text)]'}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function TextArea({ label, value, onChange, className = '' }: { label: string; value: string; onChange: (value: string) => void; className?: string }) {
  return (
    <label className={`block text-sm font-medium text-[var(--trigonum-text)] ${className}`}>
      {label}
      <textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 outline-none" />
    </label>
  )
}
