import {
  Activity,
  AtSign,
  BadgeCheck,
  Bell,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
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
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Users,
  WalletCards,
  X,
  Zap,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts'
import { Link } from 'react-router-dom'
import { useBrokerAccount } from '../../../shared/lib/AccountContext'
import { formatCurrency } from '../../../shared/lib/format'
import { useFunding } from '../../../shared/lib/FundingContext'
import { calculateInvestorStatus, INVESTOR_TIERS, tierAccent } from '../../../shared/lib/InvestorStatus'

const PROFILE_STORAGE_KEY = 'trigonum-broker-profile-v4'
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
  contracts: boolean
  money: boolean
  products: boolean
  marketing: boolean
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
  contracts: true,
  money: true,
  products: true,
  marketing: false,
  email: true,
  push: true,
  telegram: false,
}

const riskData = [
  { axis: 'Риск', value: 58 },
  { axis: 'Горизонт', value: 78 },
  { axis: 'Ликвидность', value: 65 },
  { axis: 'Опыт', value: 86 },
  { axis: 'Доходность', value: 72 },
]

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
    return raw
      ? JSON.parse(raw) as StoredContract[]
      : [
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

  const investorStatus = calculateInvestorStatus({
    qualifiedCapital: invested + state.lockedEvents,
    longTermCapital,
    completedEvents: 21,
    activeEvents: 3,
    tenureMonths: 11,
    qualifiedReferrals: 4,
  })
  const investorAccent = tierAccent[investorStatus.tier]
  const qualifiedCapital = invested + state.lockedEvents
  const totalRelationship = state.brokerBalance + invested + state.lockedEvents
  const profileCompleteness = 92

  const saveProfile = () => {
    setFields(draftFields)
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({ fields: draftFields, preferences }))
    setEditOpen(false)
  }

  const updatePreference = (key: keyof Preferences) => {
    const next = { ...preferences, [key]: !preferences[key] }
    setPreferences(next)
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({ fields, preferences: next }))
  }

  if (activeAccount.type === 'company' && activeAccount.company) {
    return <CompanyProfile />
  }

  return (
    <div className="pb-10">
      <section className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,#15152f_0%,#25254f_56%,#34346d_100%)] text-white shadow-[0_18px_50px_rgb(8_27_58/18%)]">
        <div className="h-[3px] bg-[linear-gradient(90deg,#92f222_0%,#12ccff_45%,#af47ff_100%)]" />
        <div className="pointer-events-none absolute -right-24 -top-32 size-[420px] rounded-full bg-[radial-gradient(circle,rgb(117_117_255/34%)_0%,transparent_66%)]" />
        <div className="pointer-events-none absolute bottom-[-150px] left-[24%] size-[360px] rounded-full bg-[radial-gradient(circle,rgb(18_204_255/13%)_0%,transparent_70%)]" />
        <svg className="pointer-events-none absolute right-0 top-0 h-full w-[44%] opacity-40" viewBox="0 0 480 240" preserveAspectRatio="none" aria-hidden="true">
          <path d="M60 240 L250 34 L440 240" fill="none" stroke="rgb(255 255 255 / 10%)" />
          <path d="M145 240 L250 112 L355 240" fill="none" stroke="rgb(146 242 34 / 18%)" />
          <path d="M250 34 L250 240" fill="none" stroke="rgb(18 204 255 / 16%)" />
        </svg>

        <div className="relative grid gap-7 p-7 xl:grid-cols-[1.1fr_.9fr] xl:items-center">
          <div className="flex min-w-0 flex-wrap items-center gap-5">
            <div className="relative shrink-0">
              <div className="grid size-[88px] place-items-center rounded-[26px] border border-white/15 bg-white/10 text-[26px] font-bold shadow-[inset_0_1px_0_rgb(255_255_255/12%)] backdrop-blur">{activeAccount.initials}</div>
              <span className="absolute -bottom-1.5 -right-1.5 grid size-8 place-items-center rounded-xl border-[3px] border-[#22224b] bg-[#92f222] text-[#15152f]"><Check size={15} strokeWidth={3} /></span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/12 bg-white/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.13em] text-white/60">Private account</span>
                <button type="button" onClick={() => setTierOpen(true)} className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em]" style={{ color: investorAccent, borderColor: `${investorAccent}55`, background: `${investorAccent}14` }}>
                  <span className="size-1.5 rounded-full" style={{ background: investorAccent }} />
                  Investor status
                  <Info size={12} />
                </button>
              </div>
              <h1 className="mt-3 truncate text-[34px] font-semibold leading-none tracking-[-.035em]">{activeAccount.name}</h1>
              <p className="mt-2 text-sm text-white/55">{activeAccount.accountNumber} · клиент с {activeAccount.verificationDate}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <HeroChip icon={<BadgeCheck size={13} />} label="KYC verified" />
                <HeroChip icon={<ShieldCheck size={13} />} label="2FA protected" />
                <HeroChip icon={<Activity size={13} />} label="Active investor" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-2">
            <HeroMetric label="Qualified capital" value={formatCurrency(qualifiedCapital)} accent="#92f222" />
            <HeroMetric label="Total relationship" value={formatCurrency(totalRelationship)} accent="#12ccff" />
            <HeroMetric label="Активных продуктов" value={`${contracts.length + 3}`} accent="#af47ff" />
            <HeroMetric label="Events completed" value="21" accent="#7575ff" />
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <div className="space-y-5">
          <SectionShell>
            <SectionHead icon={<UserRound size={18} />} title="Личная информация" subtitle="Данные владельца аккаунта" tone="indigo" action={<button type="button" onClick={() => { setDraftFields(fields); setEditOpen(true) }} className="inline-flex items-center gap-1.5 rounded-xl border border-[#dedff0] bg-white px-3 py-2 text-xs font-bold text-[#5a5ac4] transition hover:border-[#5a5ac4] hover:bg-[#f7f7fc]"><Pencil size={14} />Редактировать</button>} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <IdentityTile icon={<UserRound size={18} />} label="Имя" value={`${fields.firstName} ${fields.lastName}`} tone="indigo" span />
              <IdentityTile icon={<AtSign size={18} />} label="Email" value={fields.email} tone="cyan" />
              <IdentityTile icon={<Phone size={18} />} label="Телефон" value={fields.phone} tone="violet" />
              <IdentityTile icon={<CalendarDays size={18} />} label="Дата рождения" value={fields.birthDate} tone="blue" />
              <IdentityTile icon={<Globe2 size={18} />} label="Гражданство" value={fields.citizenship} tone="green" />
              <IdentityTile icon={<MapPin size={18} />} label="Страна проживания" value={fields.country} tone="cyan" />
              <IdentityTile icon={<MapPin size={18} />} label="Адрес" value={fields.address} tone="violet" span />
            </div>
          </SectionShell>

          <SectionShell>
            <SectionHead icon={<Target size={18} />} title="Инвестиционный паспорт" subtitle="Профиль риска и предпочтений для персонализации продуктов" tone="violet" action={<button type="button" className="rounded-xl border border-[#dedff0] bg-white px-3 py-2 text-xs font-bold text-[#5a5ac4] transition hover:bg-[#f7f7fc]">Обновить профиль</button>} />
            <div className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
              <div className="relative min-h-[270px] overflow-hidden rounded-2xl bg-[linear-gradient(145deg,#f7f5ff,#eef7ff)] p-4">
                <div className="absolute -right-12 -top-12 size-40 rounded-full bg-[radial-gradient(circle,rgb(175_71_255/14%),transparent_68%)]" />
                <p className="relative text-[10px] font-bold uppercase tracking-[.1em] text-[#71719b]">Investor profile map</p>
                <div className="relative mt-1 h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={riskData} outerRadius="72%">
                      <PolarGrid stroke="#d9d9ec" />
                      <PolarAngleAxis dataKey="axis" tick={{ fill: '#71719b', fontSize: 10, fontWeight: 600 }} />
                      <Radar dataKey="value" stroke="#5a5ac4" fill="#7575ff" fillOpacity={0.22} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <PersonaCard icon={<Activity size={18} />} label="Risk profile" value="Умеренный" meta="Balanced risk" accent="#5a5ac4" progress={58} />
                <PersonaCard icon={<CalendarDays size={18} />} label="Investment horizon" value="1–3 года" meta="Среднесрочный" accent="#12ccff" progress={78} />
                <PersonaCard icon={<TrendingUp size={18} />} label="Primary objective" value="Рост капитала" meta="Growth focus" accent="#92f222" progress={72} />
                <PersonaCard icon={<WalletCards size={18} />} label="Liquidity" value="Средняя" meta="Balanced access" accent="#af47ff" progress={65} />
                <PersonaCard icon={<Sparkles size={18} />} label="Experience" value="Advanced" meta="Опытный инвестор" accent="#7575ff" progress={86} />
                <PersonaCard icon={<UserRound size={18} />} label="Investor type" value="Private" meta="Физическое лицо" accent="#3f3f8a" progress={100} />
              </div>
            </div>
          </SectionShell>

          <SectionShell>
            <SectionHead icon={<Users size={18} />} title="Referral Program" subtitle="Прямая рекомендация инвесторов без многоуровневой структуры" tone="cyan" />
            <div className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
              <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(145deg,#25254f,#161638)] p-5 text-white">
                <div className="absolute -right-16 -top-20 size-56 rounded-full bg-[radial-gradient(circle,rgb(175_71_255/35%),transparent_68%)]" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[.12em] text-white/45">Ваш referral code</p>
                      <p className="mt-2 text-[26px] font-bold tracking-[.08em]">ARTEM-7K4P</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[10px] font-bold text-[#92f222]">10% fee share</span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/6 px-3 py-2.5">
                    <span className="min-w-0 flex-1 truncate text-xs text-white/55">trigonum.ae/ref/ARTEM-7K4P</span>
                    <button type="button" onClick={() => { navigator.clipboard?.writeText('https://trigonum.ae/ref/ARTEM-7K4P'); setCopied(true) }} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#25254f]"><Copy size={13} />{copied ? 'Готово' : 'Копировать'}</button>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <DarkMetric label="Pending" value="$180" />
                    <DarkMetric label="Available" value="$340" accent="#92f222" />
                    <DarkMetric label="Paid" value="$720" />
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-[#e4e4f0] bg-[#fafafd] p-4">
                <div className="flex items-center justify-between"><p className="text-[11px] font-bold uppercase tracking-[.08em] text-[#71719b]">Referral funnel</p><b className="text-sm text-[#25254f]">$84k capital</b></div>
                <div className="mt-4 space-y-3">
                  <FunnelBar label="Приглашено" value={8} max={8} color="#5a5ac4" />
                  <FunnelBar label="Прошли KYC" value={6} max={8} color="#7575ff" />
                  <FunnelBar label="Стали инвесторами" value={4} max={8} color="#12ccff" />
                  <FunnelBar label="Активны сейчас" value={3} max={8} color="#92f222" />
                </div>
              </div>
            </div>
          </SectionShell>
        </div>

        <div className="space-y-5">
          <SectionShell>
            <SectionHead icon={<BadgeCheck size={18} />} title="Верификация" subtitle="Compliance status" tone="green" />
            <div className="grid grid-cols-2 gap-2.5">
              <ComplianceCard icon={<UserRound size={17} />} label="KYC" value="Verified" color="#2e9e4f" />
              <ComplianceCard icon={<ShieldCheck size={17} />} label="AML" value="Passed" color="#12a8c8" />
              <ComplianceCard icon={<CheckCircle2 size={17} />} label="Questionnaire" value="Completed" color="#5a5ac4" />
              <ComplianceCard icon={<WalletCards size={17} />} label="Source of funds" value="Verified" color="#8321d6" />
            </div>
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#e4e4f0] bg-[#fafafd] p-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#eeeef8] text-[#5a5ac4]"><UserRound size={18} /></span>
              <div className="min-w-0"><p className="truncate text-sm font-bold text-[#25254f]">{activeAccount.name}</p><p className="mt-0.5 text-[11px] text-[#71719b]">Последняя проверка · 12 Aug 2026</p></div>
            </div>
          </SectionShell>

          <SectionShell>
            <SectionHead icon={<ShieldCheck size={18} />} title="Security Center" subtitle="Защита аккаунта и капитала" tone="indigo" />
            <div className="flex items-center gap-4 rounded-2xl bg-[linear-gradient(145deg,#f5f5fa,#eef1ff)] p-4">
              <div className="relative grid size-[92px] shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#5a5ac4 0 ${profileCompleteness}%, #dedff0 ${profileCompleteness}% 100%)` }}>
                <div className="grid size-[72px] place-items-center rounded-full bg-white"><div className="text-center"><b className="block text-[21px] leading-none text-[#25254f]">{profileCompleteness}</b><span className="mt-1 block text-[9px] font-bold uppercase tracking-[.08em] text-[#71719b]">security</span></div></div>
              </div>
              <div><p className="text-[15px] font-bold text-[#25254f]">Высокий уровень защиты</p><p className="mt-1 text-xs leading-[1.45] text-[#71719b]">Ключевые механизмы подтверждения операций активны.</p><Link to="/security" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#5a5ac4]">Настроить <ChevronRight size={13} /></Link></div>
            </div>
            <div className="mt-3 space-y-2">
              <SecurityControl icon={<ShieldCheck size={16} />} label="2FA" detail="Authenticator" enabled />
              <SecurityControl icon={<KeyRound size={16} />} label="Passkey" detail="2 устройства" enabled />
              <SecurityControl icon={<BadgeCheck size={16} />} label="Withdrawal protection" detail="Подтверждение вывода" enabled />
              <SecurityControl icon={<Smartphone size={16} />} label="Active sessions" detail="2 сессии" enabled={false} />
            </div>
          </SectionShell>

          <SectionShell>
            <SectionHead icon={<Bell size={18} />} title="Notification Center" subtitle="События и каналы связи" tone="cyan" />
            <div className="grid gap-2">
              <PreferenceRow label="Новые Events" text="Новые инвестиционные ситуации TAIS" on={preferences.events} onClick={() => updatePreference('events')} color="#af47ff" />
              <PreferenceRow label="Выплаты" text="Начисления и завершение расчётов" on={preferences.payouts} onClick={() => updatePreference('payouts')} color="#92f222" />
              <PreferenceRow label="Движение средств" text="Пополнения и выводы" on={preferences.money} onClick={() => updatePreference('money')} color="#12ccff" />
              <PreferenceRow label="Новые продукты" text="Earn и Strategies" on={preferences.products} onClick={() => updatePreference('products')} color="#5a5ac4" />
            </div>
            <div className="mt-4 border-t border-[#e4e4f0] pt-4">
              <p className="text-[10px] font-bold uppercase tracking-[.09em] text-[#71719b]">Каналы</p>
              <div className="mt-2.5 grid grid-cols-3 gap-2">
                <ChannelCard icon={<Mail size={16} />} label="Email" on={preferences.email} onClick={() => updatePreference('email')} />
                <ChannelCard icon={<Smartphone size={16} />} label="Push" on={preferences.push} onClick={() => updatePreference('push')} />
                <ChannelCard icon={<Zap size={16} />} label="Telegram" on={preferences.telegram} onClick={() => updatePreference('telegram')} />
              </div>
            </div>
          </SectionShell>
        </div>
      </div>

      {editOpen && (
        <ModalShell title="Редактировать личные данные" eyebrow="Profile settings" onClose={() => setEditOpen(false)}>
          <div className="grid gap-3 sm:grid-cols-2">
            {([
              ['firstName', 'Имя'], ['lastName', 'Фамилия'], ['email', 'Email'], ['phone', 'Телефон'],
              ['birthDate', 'Дата рождения'], ['citizenship', 'Гражданство'], ['country', 'Страна проживания'], ['address', 'Адрес'],
            ] as const).map(([key, label]) => (
              <label key={key} className={key === 'address' ? 'sm:col-span-2' : ''}>
                <span className="text-[10px] font-bold uppercase tracking-[.08em] text-[#71719b]">{label}</span>
                <input value={draftFields[key]} onChange={(event) => setDraftFields((current) => ({ ...current, [key]: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-[#dedff0] bg-white px-3 py-2.5 text-sm font-semibold text-[#25254f] outline-none transition focus:border-[#5a5ac4] focus:ring-4 focus:ring-[#5a5ac4]/10" />
              </label>
            ))}
          </div>
          <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setEditOpen(false)} className="rounded-xl border border-[#e4e4f0] px-4 py-2.5 text-sm font-semibold text-[#71719b]">Отмена</button><button type="button" onClick={saveProfile} className="inline-flex items-center gap-2 rounded-xl bg-[#25254f] px-4 py-2.5 text-sm font-bold text-white"><Save size={15} />Сохранить</button></div>
        </ModalShell>
      )}

      {tierOpen && (
        <ModalShell title="Система статусов инвестора" eyebrow="Investor status" onClose={() => setTierOpen(false)} wide>
          <div className="grid gap-4 lg:grid-cols-[.85fr_1.15fr]">
            <div className="rounded-2xl bg-[linear-gradient(145deg,#25254f,#161638)] p-5 text-white">
              <div className="flex items-center justify-between gap-3"><p className="text-[10px] font-bold uppercase tracking-[.11em] text-white/45">Текущий score</p><span className="size-3 rounded-full" style={{ background: investorAccent, boxShadow: `0 0 16px ${investorAccent}` }} /></div>
              <p className="mt-2 text-[38px] font-semibold leading-none">{investorStatus.score}</p>
              <p className="mt-2 text-sm text-white/55">{investorStatus.nextTier ? `${investorStatus.pointsToNext} points до следующего уровня` : 'Максимальный уровень'}</p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full" style={{ width: `${investorStatus.progress}%`, background: `linear-gradient(90deg,#92f222,${investorAccent})` }} /></div>
              <div className="mt-4 grid grid-cols-2 gap-2"><PopupMetric label="Qualified capital" value={formatCurrency(qualifiedCapital)} /><PopupMetric label="Long-term" value={formatCurrency(longTermCapital)} /><PopupMetric label="Events" value="21 completed" /><PopupMetric label="Referrals" value="4 qualified" /></div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.08em] text-[#71719b]">Как формируется score</p>
              <div className="mt-3 space-y-2.5"><ScoreRow label="Капитал в инвестициях" points={investorStatus.breakdown.capital} color="#5a5ac4" /><ScoreRow label="Долгосрочный капитал" points={investorStatus.breakdown.longTerm} color="#12ccff" /><ScoreRow label="Events" points={investorStatus.breakdown.events} color="#af47ff" /><ScoreRow label="Срок отношений" points={investorStatus.breakdown.tenure} color="#92f222" /><ScoreRow label="Реферальная программа" points={investorStatus.breakdown.referrals} color="#7575ff" /></div>
            </div>
          </div>
          <div className="mt-5 border-t border-[#e4e4f0] pt-5"><p className="text-[11px] font-bold uppercase tracking-[.08em] text-[#71719b]">Уровни Investor Club</p><div className="mt-3 grid gap-2 sm:grid-cols-5">{INVESTOR_TIERS.map((item) => { const accent = tierAccent[item.tier]; const active = item.tier === investorStatus.tier; return <div key={item.tier} className={`rounded-xl border p-3 ${active ? 'bg-[#f7f7fc]' : 'bg-white'}`} style={{ borderColor: active ? accent : '#e4e4f0' }}><span className="block size-2.5 rounded-full" style={{ background: accent }} /><b className="mt-2 block text-sm text-[#25254f]">{item.tier}</b><span className="mt-1 block text-[11px] text-[#71719b]">от {item.threshold} pts</span></div> })}</div></div>
          <p className="mt-4 rounded-xl bg-[#f5f5fa] p-3.5 text-xs leading-[1.55] text-[#71719b]">Статус зависит от реального капитала в продуктах Trigonum, продолжительности отношений, участия в Events и квалифицированных прямых рекомендаций. Свободные деньги на счёте почти не влияют на уровень.</p>
        </ModalShell>
      )}
    </div>
  )
}

function CompanyProfile() {
  const { activeAccount } = useBrokerAccount()
  if (!activeAccount.company) return null
  const company = activeAccount.company
  return <div className="pb-10"><section className="overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,#1a1838,#30275a)] p-7 text-white"><div className="flex flex-wrap items-center gap-4"><span className="grid size-16 place-items-center rounded-2xl border border-white/15 bg-white/10"><Building2 size={28} /></span><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-white/50">Corporate account</p><h1 className="mt-2 text-3xl font-semibold">{activeAccount.name}</h1><p className="mt-1 text-sm text-white/55">{activeAccount.accountNumber} · KYB verified</p></div></div></section><div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_.7fr]"><SectionShell><SectionHead icon={<Building2 size={18} />} title="Данные компании" subtitle="Юридическая и контактная информация" tone="violet" /><div className="grid gap-3 sm:grid-cols-2">{[['Наименование',company.legalName],['Регистрационный номер',company.registrationNumber],['ИНН / налоговый номер',company.taxId],['Юрисдикция',company.jurisdiction],['Юридический адрес',company.address],['Директор',company.director],['Бенефициар',company.beneficialOwner],['Email',company.email],['Телефон',company.phone],['Broker account',activeAccount.accountNumber]].map(([label,value]) => <div key={label} className="rounded-xl border border-[#e4e4f0] bg-[#fafafd] p-3.5"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[#71719b]">{label}</p><p className="mt-1.5 text-sm font-bold text-[#25254f]">{value}</p></div>)}</div></SectionShell><SectionShell><SectionHead icon={<BadgeCheck size={18} />} title="Compliance" subtitle="Корпоративная проверка" tone="green" /><div className="space-y-2"><ComplianceCard icon={<Building2 size={17} />} label="KYB" value="Verified" color="#2e9e4f" /><ComplianceCard icon={<ShieldCheck size={17} />} label="AML" value="Passed" color="#12a8c8" /><ComplianceCard icon={<UserRound size={17} />} label="Beneficial owner" value="Verified" color="#5a5ac4" /></div></SectionShell></div></div>
}

function SectionShell({ children }: { children: ReactNode }) { return <section className="rounded-[20px] border border-[#e4e4f0] bg-white p-5 shadow-[0_10px_34px_rgb(8_27_58/7%)]">{children}</section> }

function SectionHead({ icon, title, subtitle, tone, action }: { icon: ReactNode; title: string; subtitle: string; tone: 'indigo' | 'violet' | 'cyan' | 'green'; action?: ReactNode }) {
  const tones = { indigo: 'bg-[#eeeef8] text-[#5a5ac4]', violet: 'bg-[#f4e9ff] text-[#8321d6]', cyan: 'bg-[#e8f8ff] text-[#0b7fa6]', green: 'bg-[#eef7f1] text-[#2e9e4f]' }
  return <div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div className="flex items-start gap-3"><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>{icon}</span><div><h2 className="text-[16px] font-bold text-[#25254f]">{title}</h2><p className="mt-1 text-xs text-[#71719b]">{subtitle}</p></div></div>{action}</div>
}

function HeroChip({ icon, label }: { icon: ReactNode; label: string }) { return <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/7 px-2.5 py-1.5 text-[10px] font-semibold text-white/65">{icon}{label}</span> }
function HeroMetric({ label, value, accent }: { label: string; value: string; accent: string }) { return <div className="rounded-2xl border border-white/10 bg-white/7 p-3.5 backdrop-blur"><span className="block h-1 w-8 rounded-full" style={{ background: accent }} /><p className="mt-3 text-[9px] font-bold uppercase tracking-[.1em] text-white/42">{label}</p><p className="mt-1.5 text-[18px] font-bold tabular-nums text-white">{value}</p></div> }

const identityTones = {
  indigo: ['#eeeef8','#5a5ac4'], cyan: ['#e8f8ff','#0b7fa6'], violet: ['#f4e9ff','#8321d6'], blue: ['#edf2ff','#4967c8'], green: ['#eef7f1','#2e9e4f'],
} as const
function IdentityTile({ icon, label, value, tone, span = false }: { icon: ReactNode; label: string; value: string; tone: keyof typeof identityTones; span?: boolean }) {
  const [bg, color] = identityTones[tone]
  return <div className={`group rounded-2xl border border-[#e8e8f2] bg-[#fafafd] p-3.5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_8px_22px_rgb(8_27_58/8%)] ${span ? 'sm:col-span-2' : ''}`}><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl" style={{ background: bg, color }}>{icon}</span><div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[.09em] text-[#8a8aa7]">{label}</p><p className="mt-1.5 break-words text-sm font-bold leading-[1.35] text-[#25254f]">{value}</p></div></div></div>
}

function PersonaCard({ icon, label, value, meta, accent, progress }: { icon: ReactNode; label: string; value: string; meta: string; accent: string; progress: number }) { return <div className="rounded-2xl border border-[#e4e4f0] bg-white p-3.5"><div className="flex items-start justify-between gap-2"><span className="grid size-9 place-items-center rounded-xl" style={{ background: `${accent}16`, color: accent }}>{icon}</span><span className="text-[10px] font-bold tabular-nums" style={{ color: accent }}>{progress}%</span></div><p className="mt-3 text-[9px] font-bold uppercase tracking-[.08em] text-[#8a8aa7]">{label}</p><p className="mt-1 text-sm font-bold text-[#25254f]">{value}</p><p className="mt-0.5 text-[11px] text-[#71719b]">{meta}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eeeef8]"><div className="h-full rounded-full" style={{ width: `${progress}%`, background: accent }} /></div></div> }

function ComplianceCard({ icon, label, value, color }: { icon: ReactNode; label: string; value: string; color: string }) { return <div className="rounded-2xl border border-[#e4e4f0] bg-white p-3"><div className="flex items-start justify-between gap-2"><span className="grid size-8 place-items-center rounded-xl" style={{ color, background: `${color}13` }}>{icon}</span><BadgeCheck size={14} style={{ color }} /></div><p className="mt-3 text-[10px] font-bold uppercase tracking-[.08em] text-[#71719b]">{label}</p><p className="mt-1 text-[13px] font-bold" style={{ color }}>{value}</p></div> }
function SecurityControl({ icon, label, detail, enabled }: { icon: ReactNode; label: string; detail: string; enabled: boolean }) { return <div className="flex items-center gap-3 rounded-xl border border-[#e4e4f0] px-3 py-2.5"><span className="grid size-8 place-items-center rounded-lg bg-[#eeeef8] text-[#5a5ac4]">{icon}</span><div className="min-w-0 flex-1"><p className="text-xs font-bold text-[#25254f]">{label}</p><p className="mt-0.5 text-[10px] text-[#71719b]">{detail}</p></div>{enabled ? <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2e9e4f]"><Check size={12} />On</span> : <ChevronRight size={14} className="text-[#b0b0c8]" />}</div> }

function PreferenceRow({ label, text, on, onClick, color }: { label: string; text: string; on: boolean; onClick: () => void; color: string }) { return <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-xl border border-[#e4e4f0] bg-white p-3 text-left transition hover:bg-[#fafafd]"><span className="size-2.5 shrink-0 rounded-full" style={{ background: color }} /><span className="min-w-0 flex-1"><b className="block text-xs text-[#25254f]">{label}</b><span className="mt-0.5 block text-[10px] text-[#71719b]">{text}</span></span><span className="relative h-[22px] w-[38px] shrink-0 rounded-full transition" style={{ background: on ? color : '#d3d3e6' }}><span className="absolute top-[3px] size-4 rounded-full bg-white shadow-sm transition-all" style={{ left: on ? 19 : 3 }} /></span></button> }
function ChannelCard({ icon, label, on, onClick }: { icon: ReactNode; label: string; on: boolean; onClick: () => void }) { return <button type="button" onClick={onClick} className={`rounded-xl border p-3 text-left transition ${on ? 'border-[#cdcdf0] bg-[#eeeef8] text-[#5a5ac4]' : 'border-[#e4e4f0] bg-white text-[#71719b]'}`}><div className="flex items-center justify-between gap-2">{icon}<span className={`size-2 rounded-full ${on ? 'bg-[#5a5ac4]' : 'bg-[#d3d3e6]'}`} /></div><b className="mt-2 block text-[11px]">{label}</b></button> }

function DarkMetric({ label, value, accent = '#fff' }: { label: string; value: string; accent?: string }) { return <div className="rounded-xl border border-white/10 bg-white/6 p-2.5"><span className="text-[9px] font-bold uppercase tracking-[.08em] text-white/40">{label}</span><b className="mt-1 block text-[14px] tabular-nums" style={{ color: accent }}>{value}</b></div> }
function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) { return <div><div className="flex items-center justify-between"><span className="text-xs font-semibold text-[#3a3a63]">{label}</span><b className="text-xs tabular-nums text-[#25254f]">{value}</b></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#e9e9f2]"><div className="h-full rounded-full" style={{ width: `${value / max * 100}%`, background: color }} /></div></div> }

function ModalShell({ title, eyebrow, onClose, children, wide = false }: { title: string; eyebrow: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => { const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; const key = (event: KeyboardEvent) => event.key === 'Escape' && onClose(); window.addEventListener('keydown', key); return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', key) } }, [onClose])
  return <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[rgb(8_27_58/48%)] p-6 backdrop-blur-[3px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><div className={`my-auto max-h-[90vh] w-full overflow-auto rounded-[20px] bg-white shadow-[0_28px_70px_rgb(8_27_58/35%)] ${wide ? 'max-w-[820px]' : 'max-w-[620px]'}`}><div className="relative overflow-hidden bg-[linear-gradient(145deg,#25254f,#161638)] px-6 py-5 text-white"><div className="absolute -right-14 -top-16 size-52 rounded-full bg-[radial-gradient(circle,rgb(117_117_255/38%),transparent_68%)]" /><div className="relative flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#7575ff]">{eyebrow}</p><h2 className="mt-2 text-xl font-bold">{title}</h2></div><button type="button" onClick={onClose} className="rounded-xl border border-white/15 bg-white/5 p-2 text-white transition hover:bg-white/10"><X size={16} /></button></div></div><div className="p-6">{children}</div></div></div>
}

function PopupMetric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white/10 bg-white/6 p-2.5"><p className="text-[9px] font-bold uppercase tracking-[.08em] text-white/40">{label}</p><p className="mt-1 text-[12px] font-bold text-white">{value}</p></div> }
function ScoreRow({ label, points, color }: { label: string; points: number; color: string }) { return <div className="rounded-xl border border-[#e4e4f0] bg-[#fafafd] p-3"><div className="flex items-center justify-between gap-3"><span className="inline-flex items-center gap-2 text-xs font-semibold text-[#3a3a63]"><span className="size-2 rounded-full" style={{ background: color }} />{label}</span><b className="text-xs tabular-nums text-[#25254f]">+{points}</b></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e9e9f2]"><div className="h-full rounded-full" style={{ width: `${Math.min(100, points / 4)}%`, background: color }} /></div></div> }
