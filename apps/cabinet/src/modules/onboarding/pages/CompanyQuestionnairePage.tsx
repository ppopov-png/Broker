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

type BeneficialOwner = { id: string; name: string; ownership: string; ownerType: 'individual' | 'company' }
type CompanyQuestionnaire = { legalName: string; jurisdiction: string; signatoryName: string; signatoryAuthority: string; beneficialOwners: BeneficialOwner[]; submittedAt: string }

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
  const [signatoryName, setSignatoryName] = useState('')
  const [signatoryAuthority, setSignatoryAuthority] = useState('')
  const [beneficialOwners, setBeneficialOwners] = useState<BeneficialOwner[]>([{ id: 'owner-1', name: '', ownership: '', ownerType: 'individual' }])
  const [submitting, setSubmitting] = useState(false)

  if (!allowed) return null

  const updateOwner = (id: string, patch: Partial<BeneficialOwner>) => setBeneficialOwners((current) => current.map((owner) => owner.id === id ? { ...owner, ...patch } : owner))
  const addOwner = () => setBeneficialOwners((current) => [...current, { id: `owner-${Date.now()}-${current.length}`, name: '', ownership: '', ownerType: 'individual' }])

  const submit = async () => {
    const owners = beneficialOwners.filter((owner) => owner.name.trim() || owner.ownership.trim())
    if (!signatoryName.trim() || !signatoryAuthority.trim()) { toast('error', 'Укажите подписанта и основание его полномочий'); return }
    if (owners.length === 0 || owners.some((owner) => !owner.name.trim() || !owner.ownership.trim() || Number(owner.ownership) < 5)) { toast('error', 'Укажите всех бенефициарных владельцев с долей 5% и более'); return }
    setSubmitting(true)
    try {
      saveQuestionnaire({ legalName: session?.accountName ?? 'Юридическое лицо', jurisdiction: profile.jurisdiction, signatoryName: signatoryName.trim(), signatoryAuthority: signatoryAuthority.trim(), beneficialOwners: owners, submittedAt: new Date().toISOString() })
      markOnboardingState('SELF_CERT_COMPLETED')
      markOnboardingState('AGREEMENTS_ACCEPTED')
      notifyOnboardingChanged()
      navigate(ONBOARDING_ROUTES.documents)
    } finally { setSubmitting(false) }
  }

  return <div className="pb-10">
    <PageHeader back={<BackToStatus />} title="Анкета юридического лица" description="Заполняем сведения, прямо следующие из перечня документов: уполномоченный подписант и бенефициарные владельцы с долей 5% и более. Остальные поля добавляются только по утверждённой форме анкеты." />
    <div className="flex flex-col gap-5">
      <Card title="Компания" action={<Building2 size={17} className="text-[var(--trigonum-blue)]" />}><div className="grid gap-3 sm:grid-cols-2"><Info label="Наименование" value={session?.accountName ?? 'Юридическое лицо'} /><Info label="Юрисдикция" value={profile.jurisdiction} /></div></Card>
      <Card title="Лицо с правом подписи"><div className="grid gap-4 sm:grid-cols-2"><Field label="ФИО подписанта"><input value={signatoryName} onChange={(event) => setSignatoryName(event.target.value)} className={inputClass} /></Field><Field label="Должность / основание полномочий"><input value={signatoryAuthority} onChange={(event) => setSignatoryAuthority(event.target.value)} className={inputClass} /></Field></div><p className="mt-3 text-xs leading-relaxed text-[var(--trigonum-muted)]">Анкета подписывается лицом, имеющим право подписи и право открытия/ведения брокерского счёта.</p></Card>
      <Card title="Бенефициарные владельцы от 5%"><p className="mb-4 text-xs leading-relaxed text-[var(--trigonum-muted)]">Укажите каждого владельца с долей 5% и более. Если владельцем является юридическое лицо, отметьте это; цепочка владения подтверждается отдельной схемой в досье.</p><div className="space-y-3">{beneficialOwners.map((owner,index)=><div key={owner.id} className="grid gap-3 rounded-xl border border-[var(--trigonum-border)] p-4 sm:grid-cols-[1fr_140px_160px_auto]"><Field label={`Владелец ${index+1}`}><input value={owner.name} onChange={(event)=>updateOwner(owner.id,{name:event.target.value})} className={inputClass}/></Field><Field label="Доля, %"><input type="number" min="5" max="100" step="0.01" value={owner.ownership} onChange={(event)=>updateOwner(owner.id,{ownership:event.target.value})} className={inputClass}/></Field><Field label="Тип владельца"><select value={owner.ownerType} onChange={(event)=>updateOwner(owner.id,{ownerType:event.target.value as BeneficialOwner['ownerType']})} className={inputClass}><option value="individual">Физическое лицо</option><option value="company">Юридическое лицо</option></select></Field><button type="button" aria-label="Удалить владельца" onClick={()=>setBeneficialOwners((current)=>current.filter((item)=>item.id!==owner.id))} className="mt-6 inline-flex size-10 items-center justify-center rounded-lg border border-[var(--trigonum-border)] text-[var(--trigonum-danger)]"><Trash2 size={15}/></button></div>)}</div><button type="button" onClick={addOwner} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--trigonum-blue)]"><Plus size={15}/>Добавить владельца</button></Card>
      <div className="flex justify-end"><PrimaryButton disabled={submitting} onClick={()=>void submit()}>{submitting?'Сохраняем':'Сохранить анкету и перейти к досье'}</PrimaryButton></div>
    </div>
  </div>
}

const inputClass='mt-1 w-full rounded-lg border border-[var(--trigonum-border)] bg-white px-3 py-2.5 text-sm text-[var(--trigonum-ink)] outline-none focus:border-[var(--trigonum-ink)]'
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="block text-xs font-semibold text-[var(--trigonum-ink)]">{label}{children}</label>}
function Info({label,value}:{label:string;value:string}){return <div><p className="text-xs text-[var(--trigonum-muted)]">{label}</p><p className="mt-1 text-sm font-semibold text-[var(--trigonum-ink)]">{value}</p></div>}
