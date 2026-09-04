import {
  BadgeCheck,
  Bell,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  Copy,
  Globe2,
  Info,
  KeyRound,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  Smartphone,
  UserRound,
  Users,
  WalletCards,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useBrokerAccount } from '../../../shared/lib/AccountContext'
import { formatCurrency } from '../../../shared/lib/format'
import { useFunding } from '../../../shared/lib/FundingContext'
import { calculateInvestorStatus, INVESTOR_TIERS, tierAccent, tierMetallic } from '../../../shared/lib/InvestorStatus'

const PROFILE_STORAGE_KEY = 'trigonum-broker-profile-v5'
const CONTRACTS_STORAGE_KEY = 'trigonum-broker-invest-contracts-v1'

type ProfileFields = {
  firstName: string
  lastName: string
  email: string
  phone: string
  birthDate: string
  citizenship: string
  country: string
  address: string
}

type Preferences = {
  events: boolean
  payouts: boolean
  money: boolean
  products: boolean
  email: boolean
  push: boolean
  telegram: boolean
}

type StoredContract = { amount?: number; termMonths?: number }

const initialFields: ProfileFields = {
  firstName: 'Артём',
  lastName: 'Дробков',
  email: 'artem.drobkov@example.com',
  phone: '+7 (700) 123-45-67',
  birthDate: '14.06.1990',
  citizenship: 'Республика Казахстан',
  country: 'Казахстан',
  address: 'г. Алматы, ул. Абая, 15',
}

const initialPreferences: Preferences = {
  events: true,
  payouts: true,
  money: true,
  products: true,
  email: true,
  push: true,
  telegram: false,
}

function loadProfile(): { fields: ProfileFields; preferences: Preferences } {
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!raw) return { fields: initialFields, preferences: initialPreferences }
    const parsed = JSON.parse(raw) as { fields?: Partial<ProfileFields>; preferences?: Partial<Preferences> }
    return {
      fields: { ...initialFields, ...parsed.fields },
      preferences: { ...initialPreferences, ...parsed.preferences },
    }
  } catch {
    return { fields: initialFields, preferences: initialPreferences }
  }
}

function loadContracts(): StoredContract[] {
  try {
    const raw = window.localStorage.getItem(CONTRACTS_STORAGE_KEY)
    return raw ? JSON.parse(raw) as StoredContract[] : [
      { amount: 14_000, termMonths: 12 },
      { amount: 12_000, termMonths: 6 },
      { amount: 5_000, termMonths: 12 },
    ]
  } catch {
    return []
  }
}

export function ProfilePage() {
  const { activeAccount } = useBrokerAccount()
  const { getAccountState } = useFunding()
  const state = getAccountState(activeAccount.id)
  const stored = useMemo(loadProfile, [])
  const [fields, setFields] = useState<ProfileFields>(stored.fields)
  const [draftFields, setDraftFields] = useState<ProfileFields>(stored.fields)
  const [preferences, setPreferences] = useState<Preferences>(stored.preferences)
  const [editOpen, setEditOpen] = useState(false)
  const [tierOpen, setTierOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setEditOpen(false)
    setTierOpen(false)
  }, [activeAccount.id])

  const contracts = useMemo(loadContracts, [state.brokerBalance])
  const invested = contracts.reduce((sum, contract) => sum + Number(contract.amount || 0), 0)
  const longTermCapital = contracts
    .filter((contract) => Number(contract.termMonths || 0) >= 12)
    .reduce((sum, contract) => sum + Number(contract.amount || 0), 0)
  const qualifiedCapital = invested + state.lockedEvents
  const totalRelationship = state.brokerBalance + invested + state.lockedEvents
  const investorStatus = calculateInvestorStatus({
    qualifiedCapital,
    longTermCapital,
    completedEvents: 21,
    activeEvents: 3,
    tenureMonths: 11,
    qualifiedReferrals: 4,
  })
  const accent = tierAccent[investorStatus.tier]
  const metallic = tierMetallic[investorStatus.tier]

  const saveProfile = () => {
    setFields(draftFields)
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({ fields: draftFields, preferences }))
    setEditOpen(false)
  }

  const togglePreference = (key: keyof Preferences) => {
    const next = { ...preferences, [key]: !preferences[key] }
    setPreferences(next)
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({ fields, preferences: next }))
  }

  if (activeAccount.type === 'company' && activeAccount.company) return <CompanyProfile />

  return (
    <div className="pb-10">
      <section className="relative overflow-hidden rounded-[24px] border border-[#292b38] bg-[linear-gradient(145deg,#101116_0%,#171922_48%,#232632_100%)] text-white shadow-[0_24px_70px_rgb(8_27_58/18%)]">
        <div className="pointer-events-none absolute -right-24 -top-40 size-[480px] rounded-full bg-[radial-gradient(circle,rgb(255_255_255/7%)_0%,transparent_68%)]" />
        <div className="pointer-events-none absolute bottom-[-190px] right-[24%] size-[360px] rounded-full" style={{ background: `radial-gradient(circle,${accent}20 0%,transparent 70%)` }} />
        <div className="relative grid gap-8 p-8 xl:grid-cols-[1.05fr_.95fr] xl:items-center">
          <div className="flex min-w-0 items-center gap-5">
            <div className="relative shrink-0">
              <div className="grid size-[84px] place-items-center rounded-full border border-white/10 bg-white/[.055] text-[25px] font-semibold tracking-[-.03em] text-white shadow-[inset_0_1px_0_rgb(255_255_255/7%)]">{activeAccount.initials}</div>
              <span className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full border-[4px] border-[#171922] bg-[#2d9a58]"><Check size={13} strokeWidth={3} /></span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/38">Private client · {activeAccount.accountNumber}</p>
              <h1 className="mt-2 truncate text-[35px] font-medium leading-none tracking-[-.04em]">{activeAccount.name}</h1>
              <p className="mt-2.5 text-sm text-white/42">Клиент с {activeAccount.verificationDate} · KYC подтверждён</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <QuietChip label="KYC verified" />
                <QuietChip label="2FA active" />
                <QuietChip label="Withdrawal protected" />
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[1.05fr_.95fr]">
            <button type="button" onClick={() => setTierOpen(true)} className="group relative overflow-hidden rounded-[20px] border border-white/10 p-[1px] text-left shadow-[0_16px_38px_rgb(0_0_0/20%)]">
              <div className="absolute inset-0" style={{ background: metallic }} />
              <div className="relative min-h-[142px] rounded-[19px] bg-[linear-gradient(180deg,rgb(255_255_255/13%),rgb(255_255_255/4%))] p-5 backdrop-blur-[12px]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[.18em] text-black/45">Investor tier</p>
                    <p className="mt-2 text-[25px] font-semibold tracking-[-.03em] text-[#1c1e25]">{investorStatus.tier}</p>
                  </div>
                  <Info size={16} className="text-black/40 transition group-hover:text-black/70" />
                </div>
                <div className="mt-6 h-px bg-black/12" />
                <div className="mt-3 flex items-center justify-between gap-3 text-[10px] font-semibold text-black/45"><span>{investorStatus.score} pts</span><span>{investorStatus.nextTier ? `${investorStatus.pointsToNext} до ${investorStatus.nextTier}` : 'Highest tier'}</span></div>
              </div>
            </button>
            <div className="grid grid-cols-2 gap-3">
              <DarkMetric label="Invested" value={formatCurrency(invested)} />
              <DarkMetric label="Events" value={formatCurrency(state.lockedEvents)} />
              <DarkMetric label="Total capital" value={formatCurrency(totalRelationship)} />
              <DarkMetric label="Completed" value="21 Events" />
            </div>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.18fr_.82fr]">
        <div className="space-y-5">
          <LuxuryCard title="Личные данные" subtitle="Основная информация владельца аккаунта" action={<button type="button" onClick={() => { setDraftFields(fields); setEditOpen(true) }} className="inline-flex items-center gap-2 rounded-lg border border-[#dedfe6] bg-white px-3 py-2 text-xs font-semibold text-[#30323b] transition hover:border-[#aeb1bd]"><Pencil size={14} />Редактировать</button>}>
            <div className="divide-y divide-[#ececf1]">
              <ProfileRow icon={<UserRound size={16} />} label="ФИО" value={`${fields.firstName} ${fields.lastName}`} />
              <ProfileRow icon={<Mail size={16} />} label="Email" value={fields.email} />
              <ProfileRow icon={<Phone size={16} />} label="Телефон" value={fields.phone} />
              <ProfileRow icon={<CalendarDays size={16} />} label="Дата рождения" value={fields.birthDate} />
              <ProfileRow icon={<Globe2 size={16} />} label="Гражданство" value={fields.citizenship} />
              <ProfileRow icon={<MapPin size={16} />} label="Адрес" value={`${fields.country} · ${fields.address}`} />
            </div>
          </LuxuryCard>

          <LuxuryCard title="Реферальная программа" subtitle="Прямые рекомендации и вознаграждения">
            <div className="grid gap-4 lg:grid-cols-[1.08fr_.92fr]">
              <div className="relative overflow-hidden rounded-[18px] border border-[#2a2c34] bg-[linear-gradient(145deg,#15171c,#20232b)] p-5 text-white">
                <div className="absolute -right-20 -top-24 size-64 rounded-full bg-[radial-gradient(circle,rgb(205_166_74/12%),transparent_70%)]" />
                <div className="relative">
                  <p className="text-[9px] font-semibold uppercase tracking-[.17em] text-white/35">Referral code</p>
                  <p className="mt-2 text-[25px] font-medium tracking-[.08em]">ARTEM-7K4P</p>
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5">
                    <span className="min-w-0 flex-1 truncate text-xs text-white/42">trigonum.ae/ref/ARTEM-7K4P</span>
                    <button type="button" onClick={() => { navigator.clipboard?.writeText('https://trigonum.ae/ref/ARTEM-7K4P'); setCopied(true) }} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#1d1f26]"><Copy size={13} />{copied ? 'Скопировано' : 'Копировать'}</button>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <ReferralMetric label="Available" value="$340" accent />
                    <ReferralMetric label="Pending" value="$180" />
                    <ReferralMetric label="Paid" value="$720" />
                  </div>
                </div>
              </div>
              <div className="rounded-[18px] border border-[#e5e5ea] bg-[#fbfbfc] p-4">
                <div className="flex items-center justify-between gap-3"><p className="text-[10px] font-semibold uppercase tracking-[.13em] text-[#8a8d97]">Network</p><span className="text-xs font-semibold text-[#33353d]">$84k active capital</span></div>
                <div className="mt-4 space-y-4">
                  <ReferralLine label="Приглашено" value="8" width={100} />
                  <ReferralLine label="Прошли KYC" value="6" width={75} />
                  <ReferralLine label="Инвестируют" value="4" width={50} />
                  <ReferralLine label="Активны" value="3" width={38} />
                </div>
              </div>
            </div>
          </LuxuryCard>

          <LuxuryCard title="Уведомления" subtitle="Каналы и события, о которых стоит сообщать">
            <div className="grid gap-2 sm:grid-cols-2">
              <PreferenceRow label="Новые Events" detail="Новые инвестиционные возможности" on={preferences.events} onClick={() => togglePreference('events')} />
              <PreferenceRow label="Выплаты" detail="Начисления и расчёты" on={preferences.payouts} onClick={() => togglePreference('payouts')} />
              <PreferenceRow label="Движение средств" detail="Пополнения и выводы" on={preferences.money} onClick={() => togglePreference('money')} />
              <PreferenceRow label="Новые продукты" detail="Earn и Strategies" on={preferences.products} onClick={() => togglePreference('products')} />
            </div>
            <div className="mt-5 border-t border-[#ececf1] pt-4">
              <p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#8a8d97]">Каналы</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Channel label="Email" on={preferences.email} onClick={() => togglePreference('email')} />
                <Channel label="Push" on={preferences.push} onClick={() => togglePreference('push')} />
                <Channel label="Telegram" on={preferences.telegram} onClick={() => togglePreference('telegram')} />
              </div>
            </div>
          </LuxuryCard>
        </div>

        <div className="space-y-5">
          <LuxuryCard title="Верификация" subtitle="Identity & Compliance">
            <div className="space-y-2">
              <StatusRow icon={<BadgeCheck size={16} />} label="KYC" detail="Identity verified" status="Verified" />
              <StatusRow icon={<ShieldCheck size={16} />} label="AML screening" detail="No restrictions" status="Passed" />
              <StatusRow icon={<WalletCards size={16} />} label="Source of funds" detail="Documents accepted" status="Verified" />
              <StatusRow icon={<UserRound size={16} />} label="Investor questionnaire" detail="Profile completed" status="Completed" />
            </div>
          </LuxuryCard>

          <LuxuryCard title="Безопасность" subtitle="Защита доступа и операций">
            <div className="rounded-[16px] border border-[#e4e4e8] bg-[linear-gradient(145deg,#f9f9fa,#f1f1f4)] p-4">
              <div className="flex items-center justify-between gap-3"><div><p className="text-[9px] font-semibold uppercase tracking-[.15em] text-[#8a8d97]">Protection level</p><p className="mt-1 text-lg font-semibold text-[#24262d]">Высокий</p></div><div className="flex items-end gap-1">{[1,2,3,4,5].map((bar) => <span key={bar} className="w-1.5 rounded-sm bg-[#25272e]" style={{ height: 6 + bar * 3 }} />)}</div></div>
            </div>
            <div className="mt-3 space-y-2">
              <SecurityRow icon={<ShieldCheck size={16} />} label="2FA" value="Включено" />
              <SecurityRow icon={<KeyRound size={16} />} label="Passkey" value="2 устройства" />
              <SecurityRow icon={<BadgeCheck size={16} />} label="Подтверждение вывода" value="Включено" />
              <SecurityRow icon={<Smartphone size={16} />} label="Активные сессии" value="2" arrow />
            </div>
            <Link to="/security" className="mt-4 flex items-center justify-between rounded-xl border border-[#e4e4e8] px-3 py-2.5 text-xs font-semibold text-[#30323b] transition hover:bg-[#f8f8fa]"><span>Управление безопасностью</span><ChevronRight size={14} /></Link>
          </LuxuryCard>

          <LuxuryCard title="Аккаунт" subtitle="Служебная информация">
            <div className="space-y-2.5 text-sm">
              <MetaRow label="Тип" value="Физическое лицо" />
              <MetaRow label="Номер счёта" value={activeAccount.accountNumber} />
              <MetaRow label="Дата верификации" value={activeAccount.verificationDate} />
              <MetaRow label="Юрисдикция" value="Кыргызская Республика" />
            </div>
          </LuxuryCard>
        </div>
      </div>

      {editOpen && <ModalShell eyebrow="Profile settings" title="Редактировать данные" onClose={() => setEditOpen(false)}><div className="grid gap-3 sm:grid-cols-2">{([
        ['firstName','Имя'],['lastName','Фамилия'],['email','Email'],['phone','Телефон'],['birthDate','Дата рождения'],['citizenship','Гражданство'],['country','Страна проживания'],['address','Адрес'],
      ] as const).map(([key,label]) => <label key={key} className={key === 'address' ? 'sm:col-span-2' : ''}><span className="text-[9px] font-semibold uppercase tracking-[.13em] text-[#868993]">{label}</span><input value={draftFields[key]} onChange={(event) => setDraftFields((current) => ({ ...current, [key]: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-[#dedfe6] bg-white px-3 py-2.5 text-sm font-medium text-[#24262d] outline-none focus:border-[#9498a6]" /></label>)}</div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setEditOpen(false)} className="rounded-xl border border-[#dedfe6] px-4 py-2.5 text-sm font-medium text-[#666a75]">Отмена</button><button type="button" onClick={saveProfile} className="inline-flex items-center gap-2 rounded-xl bg-[#191b21] px-4 py-2.5 text-sm font-semibold text-white"><Save size={15} />Сохранить</button></div></ModalShell>}

      {tierOpen && <ModalShell eyebrow="Investor status" title="Уровень инвестора" onClose={() => setTierOpen(false)} wide>
        <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
          <div className="overflow-hidden rounded-[20px] border border-[#d7d8dc] p-[1px]" style={{ background: metallic }}><div className="rounded-[19px] bg-white/28 p-5 backdrop-blur"><p className="text-[9px] font-bold uppercase tracking-[.17em] text-black/42">Current tier</p><p className="mt-2 text-[32px] font-semibold tracking-[-.04em] text-[#1b1d22]">{investorStatus.tier}</p><p className="mt-1 text-xs text-black/45">{investorStatus.score} points</p><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-black/10"><div className="h-full rounded-full bg-[#202228]" style={{ width: `${investorStatus.progress}%` }} /></div><p className="mt-2 text-[10px] text-black/45">{investorStatus.nextTier ? `${investorStatus.pointsToNext} points до ${investorStatus.nextTier}` : 'Максимальный уровень'}</p></div></div>
          <div><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#858893]">Формирование статуса</p><div className="mt-3 space-y-2"><ScoreLine label="Капитал в инвестициях" points={investorStatus.breakdown.capital} /><ScoreLine label="Долгосрочный капитал" points={investorStatus.breakdown.longTerm} /><ScoreLine label="Участие в Events" points={investorStatus.breakdown.events} /><ScoreLine label="Срок отношений" points={investorStatus.breakdown.tenure} /><ScoreLine label="Реферальная программа" points={investorStatus.breakdown.referrals} /></div></div>
        </div>
        <div className="mt-5 border-t border-[#ececf1] pt-5"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#858893]">Уровни</p><div className="mt-3 grid gap-2 sm:grid-cols-5">{INVESTOR_TIERS.map((item) => <TierCard key={item.tier} tier={item.tier} threshold={item.threshold} active={item.tier === investorStatus.tier} />)}</div></div>
        <p className="mt-4 rounded-xl bg-[#f6f6f7] p-3.5 text-xs leading-[1.55] text-[#6f727d]">Уровень зависит от капитала, реально размещённого в продуктах Trigonum, продолжительности отношений, участия в Events и квалифицированных прямых рекомендаций. Свободный остаток на счёте имеет минимальный вес.</p>
      </ModalShell>}
    </div>
  )
}

function CompanyProfile() {
  const { activeAccount } = useBrokerAccount()
  if (!activeAccount.company) return null
  const company = activeAccount.company
  return <div className="pb-10"><section className="rounded-[24px] bg-[linear-gradient(145deg,#111218,#22242d)] p-8 text-white"><div className="flex items-center gap-4"><span className="grid size-16 place-items-center rounded-full border border-white/10 bg-white/5"><Building2 size={26} /></span><div><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-white/38">Corporate account</p><h1 className="mt-2 text-3xl font-medium">{activeAccount.name}</h1><p className="mt-1 text-sm text-white/45">{activeAccount.accountNumber} · KYB verified</p></div></div></section><div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_.75fr]"><LuxuryCard title="Данные компании" subtitle="Юридическая информация"><div className="divide-y divide-[#ececf1]">{[['Наименование',company.legalName],['Регистрационный номер',company.registrationNumber],['ИНН / налоговый номер',company.taxId],['Юрисдикция',company.jurisdiction],['Юридический адрес',company.address],['Директор',company.director],['Бенефициар',company.beneficialOwner],['Email',company.email],['Телефон',company.phone]].map(([label,value]) => <ProfileRow key={label} icon={<Building2 size={15} />} label={label} value={value} />)}</div></LuxuryCard><LuxuryCard title="Compliance" subtitle="Корпоративная проверка"><div className="space-y-2"><StatusRow icon={<Building2 size={16} />} label="KYB" detail="Company verified" status="Verified" /><StatusRow icon={<ShieldCheck size={16} />} label="AML" detail="No restrictions" status="Passed" /><StatusRow icon={<UserRound size={16} />} label="Beneficial owner" detail="Ownership confirmed" status="Verified" /></div></LuxuryCard></div></div>
}

function LuxuryCard({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) { return <section className="rounded-[20px] border border-[#e3e4e8] bg-white p-5 shadow-[0_12px_38px_rgb(8_27_58/5%)]"><div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-[15px] font-semibold text-[#22242b]">{title}</h2>{subtitle && <p className="mt-1 text-xs text-[#8a8d97]">{subtitle}</p>}</div>{action}</div>{children}</section> }
function QuietChip({ label }: { label: string }) { return <span className="rounded-full border border-white/10 bg-white/[.035] px-2.5 py-1 text-[10px] font-medium text-white/48">{label}</span> }
function DarkMetric({ label, value }: { label: string; value: string }) { return <div className="rounded-[16px] border border-white/8 bg-white/[.035] p-3.5"><p className="text-[8px] font-semibold uppercase tracking-[.15em] text-white/30">{label}</p><p className="mt-2 text-[15px] font-semibold text-white/88">{value}</p></div> }
function ProfileRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) { return <div className="grid gap-3 py-3.5 sm:grid-cols-[190px_1fr] sm:items-center"><div className="flex items-center gap-2.5 text-[#7f828c]"><span className="grid size-8 place-items-center rounded-lg bg-[#f3f3f5] text-[#5d606a]">{icon}</span><span className="text-xs font-medium">{label}</span></div><p className="text-sm font-semibold text-[#272930] sm:text-right">{value}</p></div> }
function StatusRow({ icon, label, detail, status }: { icon: ReactNode; label: string; detail: string; status: string }) { return <div className="flex items-center gap-3 rounded-xl border border-[#e7e7eb] px-3 py-3"><span className="grid size-9 place-items-center rounded-lg bg-[#f3f4f3] text-[#39433c]">{icon}</span><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-[#2c2e35]">{label}</p><p className="mt-0.5 text-[10px] text-[#92959f]">{detail}</p></div><span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#2f8050]"><span className="size-1.5 rounded-full bg-[#3b9c60]" />{status}</span></div> }
function SecurityRow({ icon, label, value, arrow = false }: { icon: ReactNode; label: string; value: string; arrow?: boolean }) { return <div className="flex items-center gap-3 rounded-xl border border-[#e7e7eb] px-3 py-3"><span className="grid size-8 place-items-center rounded-lg bg-[#f4f4f6] text-[#5a5d66]">{icon}</span><span className="flex-1 text-xs font-semibold text-[#30323a]">{label}</span><span className="text-[11px] font-medium text-[#777b85]">{value}</span>{arrow && <ChevronRight size={13} className="text-[#a3a6af]" />}</div> }
function MetaRow({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-4 border-b border-[#ececf1] py-2.5 last:border-0"><span className="text-xs text-[#8a8d97]">{label}</span><span className="text-right text-xs font-semibold text-[#30323a]">{value}</span></div> }
function ReferralMetric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) { return <div><p className="text-[8px] font-semibold uppercase tracking-[.14em] text-white/30">{label}</p><p className="mt-1.5 text-[15px] font-semibold" style={{ color: accent ? '#d7b86a' : 'rgba(255,255,255,.82)' }}>{value}</p></div> }
function ReferralLine({ label, value, width }: { label: string; value: string; width: number }) { return <div><div className="flex items-center justify-between gap-3"><span className="text-xs text-[#656872]">{label}</span><b className="text-xs text-[#2b2d34]">{value}</b></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#e7e7eb]"><div className="h-full rounded-full bg-[#4d5059]" style={{ width: `${width}%` }} /></div></div> }
function PreferenceRow({ label, detail, on, onClick }: { label: string; detail: string; on: boolean; onClick: () => void }) { return <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-xl border border-[#e7e7eb] px-3 py-3 text-left transition hover:bg-[#fafafa]"><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-[#30323a]">{label}</p><p className="mt-0.5 text-[10px] text-[#91949e]">{detail}</p></div><span className={`relative h-[20px] w-[36px] rounded-full transition ${on ? 'bg-[#26282f]' : 'bg-[#d9dae0]'}`}><span className="absolute top-[3px] size-3.5 rounded-full bg-white shadow-sm transition-all" style={{ left: on ? 19 : 3 }} /></span></button> }
function Channel({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) { return <button type="button" onClick={onClick} className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${on ? 'border-[#2d2f35] bg-[#2d2f35] text-white' : 'border-[#dfe0e5] bg-white text-[#7d808a]'}`}>{label}</button> }
function ScoreLine({ label, points }: { label: string; points: number }) { return <div className="flex items-center justify-between gap-3 rounded-xl border border-[#e7e7eb] px-3 py-2.5"><span className="text-xs text-[#666a74]">{label}</span><b className="text-xs tabular-nums text-[#282a31]">+{points}</b></div> }
function TierCard({ tier, threshold, active }: { tier: keyof typeof tierMetallic; threshold: number; active: boolean }) { return <div className={`rounded-xl border p-3 ${active ? 'border-[#8d8f98] shadow-sm' : 'border-[#e2e3e7]'}`}><div className="h-8 rounded-lg border border-black/5" style={{ background: tierMetallic[tier] }} /><p className="mt-2 text-xs font-semibold text-[#292b32]">{tier}</p><p className="mt-0.5 text-[10px] text-[#8c8f98]">от {threshold} pts</p></div> }
function ModalShell({ title, eyebrow, onClose, children, wide = false }: { title: string; eyebrow: string; onClose: () => void; children: ReactNode; wide?: boolean }) { useEffect(() => { const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; const key = (event: KeyboardEvent) => event.key === 'Escape' && onClose(); window.addEventListener('keydown', key); return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', key) } }, [onClose]); return <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[rgb(11_12_16/52%)] p-6 backdrop-blur-[3px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><div className={`my-auto max-h-[90vh] w-full overflow-auto rounded-[20px] border border-[#dedfe3] bg-white shadow-[0_30px_80px_rgb(0_0_0/28%)] ${wide ? 'max-w-[820px]' : 'max-w-[620px]'}`}><div className="flex items-start justify-between gap-4 border-b border-[#ececf0] px-6 py-5"><div><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#9a9ca5]">{eyebrow}</p><h2 className="mt-1.5 text-xl font-semibold text-[#202228]">{title}</h2></div><button type="button" onClick={onClose} className="rounded-lg border border-[#e2e3e7] p-2 text-[#747781] hover:bg-[#f7f7f8]"><X size={16} /></button></div><div className="p-6">{children}</div></div></div> }
