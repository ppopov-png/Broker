import {
  BadgeCheck,
  Building2,
  Check,
  Copy,
  Crown,
  Gift,
  History,
  Pencil,
  Save,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useBrokerAccount } from '../../../shared/lib/AccountContext'
import { formatCurrency } from '../../../shared/lib/format'
import { useFunding } from '../../../shared/lib/FundingContext'
import { calculateInvestorStatus, tierAccent, type InvestorTier } from '../../../shared/lib/InvestorStatus'

const PROFILE_STORAGE_KEY = 'trigonum-broker-profile-v2'
const CONTRACTS_STORAGE_KEY = 'trigonum-broker-invest-contracts-v1'

const initialFields = {
  firstName: 'Артём',
  lastName: 'Дробков',
  email: 'artem.drobkov@example.com',
  phone: '+7 (700) 123-45-67',
  birthDate: '14.06.1990',
  citizenship: 'Республика Казахстан',
  country: 'Казахстан',
  address: 'г. Алматы, ул. Абая, 15',
}

const initialPreferences = {
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

type StoredContract = {
  id: string
  productName: string
  amount: number
  termMonths: number
  opened: string
  ends: string | null
  guaranteed: boolean
}

const initialContracts: StoredContract[] = [
  { id: 'CTR-2451', productName: 'Earn', amount: 14_000, termMonths: 12, opened: '2026-01-15', ends: '2027-01-15', guaranteed: true },
  { id: 'CTR-2478', productName: 'Strategy «Balanced Growth»', amount: 12_000, termMonths: 6, opened: '2026-05-12', ends: '2026-11-12', guaranteed: false },
  { id: 'CTR-2490', productName: 'Strategy «Alpha Momentum»', amount: 5_000, termMonths: 12, opened: '2025-12-01', ends: '2026-12-01', guaranteed: false },
]

function loadContracts() {
  try {
    const raw = window.localStorage.getItem(CONTRACTS_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredContract[]) : initialContracts
  } catch {
    return initialContracts
  }
}

function loadProfile() {
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!raw) return { fields: initialFields, preferences: initialPreferences }
    const parsed = JSON.parse(raw)
    return {
      fields: { ...initialFields, ...(parsed.fields ?? {}) },
      preferences: { ...initialPreferences, ...(parsed.preferences ?? {}) },
    }
  } catch {
    return { fields: initialFields, preferences: initialPreferences }
  }
}

function tierGradient(tier: InvestorTier) {
  if (tier === 'Gold') return 'linear-gradient(135deg,#12122e 0%,#25254f 52%,#6d5725 100%)'
  if (tier === 'Silver') return 'linear-gradient(135deg,#17172f 0%,#34354d 60%,#7f8797 100%)'
  if (tier === 'Platinum') return 'linear-gradient(135deg,#101225 0%,#323a52 52%,#839ab8 100%)'
  if (tier === 'Black') return 'linear-gradient(135deg,#05050a 0%,#14141d 62%,#25254f 100%)'
  return 'linear-gradient(135deg,#17172f 0%,#25254f 72%,#5a5ac4 100%)'
}

export function ProfilePage() {
  const { activeAccount } = useBrokerAccount()
  const { getAccountState } = useFunding()
  const state = getAccountState(activeAccount.id)
  const stored = useMemo(loadProfile, [])
  const [editing, setEditing] = useState(false)
  const [fields, setFields] = useState(stored.fields)
  const [preferences, setPreferences] = useState(stored.preferences)
  const [copied, setCopied] = useState(false)
  const contracts = useMemo(loadContracts, [state.brokerBalance])

  useEffect(() => setEditing(false), [activeAccount.id])

  const saveProfile = () => {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({ fields, preferences }))
    setEditing(false)
  }

  if (activeAccount.type === 'company' && activeAccount.company) {
    const company = activeAccount.company
    return (
      <div className="pb-10">
        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">Корпоративный аккаунт</p>
          <h1 className="mt-1 text-2xl font-bold text-[#25254f]">{activeAccount.name}</h1>
          <p className="mt-1 text-sm text-[#71719b]">Данные юридического лица и статус корпоративной верификации</p>
        </header>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr] lg:items-start">
          <Section title="Данные компании">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ['Юридическое наименование', company.legalName], ['Регистрационный номер', company.registrationNumber], ['ИНН / налоговый номер', company.taxId], ['Юрисдикция', company.jurisdiction], ['Юридический адрес', company.address], ['Директор', company.director], ['Бенефициарный владелец', company.beneficialOwner], ['Корпоративный email', company.email], ['Телефон', company.phone], ['Номер счёта Broker', activeAccount.accountNumber],
              ].map(([label, value]) => <InfoTile key={label} label={label} value={value} />)}
            </div>
          </Section>
          <Section title="Статус верификации"><StatusLine label="KYB" value="Пройден" /><StatusLine label="AML screening" value="Пройден" /><StatusLine label="Бенефициар" value="Подтверждён" /></Section>
        </div>
      </div>
    )
  }

  const invested = contracts.reduce((sum, contract) => sum + Number(contract.amount || 0), 0)
  const longTermCapital = contracts.filter((contract) => Number(contract.termMonths || 0) >= 12).reduce((sum, contract) => sum + Number(contract.amount || 0), 0)
  const qualifiedCapital = invested + state.lockedEvents
  const freeCapital = Math.max(0, state.brokerBalance - state.lockedEvents - state.pendingSettlement)
  const totalRelationship = state.brokerBalance + invested + state.lockedEvents
  const completedEvents = 21
  const activeEvents = 3
  const qualifiedReferrals = 4
  const status = calculateInvestorStatus({ qualifiedCapital, longTermCapital, completedEvents, activeEvents, tenureMonths: 11, qualifiedReferrals })
  const accent = tierAccent[status.tier]

  const referralLink = 'https://trigonum.ae/ref/ARTEM-7K4P'
  const breakdown = [
    { label: 'Капитал в инвестициях', value: status.breakdown.capital, max: Math.max(status.breakdown.capital, 450) },
    { label: 'Долгосрочный капитал', value: status.breakdown.longTerm, max: 200 },
    { label: 'Events', value: status.breakdown.events, max: 120 },
    { label: 'Срок отношений', value: status.breakdown.tenure, max: 100 },
    { label: 'Реферальная программа', value: status.breakdown.referrals, max: 90 },
  ]

  return (
    <div className="pb-10">
      <section className="overflow-hidden rounded-[20px] shadow-[0_12px_38px_rgb(8_27_58/12%)]" style={{ background: tierGradient(status.tier) }}>
        <div className="h-[3px] bg-[linear-gradient(90deg,#92f222,#12ccff,#af47ff)]" />
        <div className="relative overflow-hidden px-7 py-7 text-white">
          <div className="absolute -right-20 -top-24 size-[360px] rounded-full opacity-40" style={{ background: `radial-gradient(circle,${accent}66 0%,transparent 70%)` }} />
          <div className="absolute bottom-[-120px] right-[24%] size-[280px] rounded-full bg-[radial-gradient(circle,rgb(117_117_255/20%)_0%,transparent_70%)]" />
          <div className="relative grid gap-7 xl:grid-cols-[1.2fr_.8fr] xl:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2.5"><span className="rounded-full border border-white/18 bg-white/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-white/72">Trigonum Investor Club</span><span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold" style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}55` }}><Crown size={13} />{status.tier.toUpperCase()}</span></div>
              <h1 className="mt-4 text-[38px] font-semibold leading-none tracking-[-.035em]">{activeAccount.name}</h1>
              <p className="mt-2.5 text-sm text-white/62">Investor since October 2025 · {activeAccount.accountNumber}</p>
              <div className="mt-6 max-w-[620px]">
                <div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-white/55">Investor Score</p><p className="mt-1 text-[24px] font-bold tabular-nums">{status.score} <span className="text-sm font-medium text-white/45">pts</span></p></div>{status.nextTier && <p className="text-right text-xs text-white/60">ещё <b className="text-white">{status.pointsToNext}</b> до {status.nextTier}</p>}</div>
                <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/12"><div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${status.progress}%`, background: `linear-gradient(90deg,#92f222,${accent})` }} /></div>
                <div className="mt-2 flex justify-between text-[10px] font-semibold uppercase tracking-[.08em] text-white/42"><span>{status.tier}</span><span>{status.nextTier ?? 'Top tier'}</span></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <HeroMetric label="Qualified Capital" value={formatCurrency(qualifiedCapital)} />
              <HeroMetric label="Total relationship" value={formatCurrency(totalRelationship)} />
              <HeroMetric label="Active products" value={`${contracts.length + activeEvents}`} />
              <HeroMetric label="Events completed" value={`${completedEvents}`} />
            </div>
          </div>
        </div>
      </section>

      <nav className="mt-5 flex flex-wrap gap-2">
        {['Overview', 'Investor Status', 'Referral Program', 'Personal Information', 'Investment Profile', 'Preferences'].map((label, index) => <a key={label} href={`#profile-${index}`} className={`rounded-xl border px-3.5 py-2 text-[12px] font-semibold ${index === 0 ? 'border-[#25254f] bg-[#25254f] text-white' : 'border-[#e4e4f0] bg-white text-[#3a3a63] hover:border-[#5a5ac4]'}`}>{label}</a>)}
      </nav>

      <section id="profile-0" className="mt-5 grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <Section title="Ваш капитал в Trigonum" subtitle="Структура отношений, используемая в Investor Status">
          <div className="grid gap-3 sm:grid-cols-2"><CapitalRow label="Earn & Strategies" value={invested} color="#5a5ac4" /><CapitalRow label="Events" value={state.lockedEvents} color="#af47ff" /><CapitalRow label="Свободный капитал" value={freeCapital} color="#92f222" /><CapitalRow label="Pending settlement" value={state.pendingSettlement} color="#12ccff" /></div>
          <div className="mt-4 flex items-center justify-between border-t border-[#e4e4f0] pt-4"><div><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[#71719b]">Qualified Capital</p><p className="mt-1 text-xs text-[#71719b]">Инвестиции и активный Event-капитал</p></div><b className="text-xl tabular-nums text-[#25254f]">{formatCurrency(qualifiedCapital)}</b></div>
        </Section>
        <Section title="Events reputation" subtitle="Участие в инвестиционных ситуациях TAIS">
          <div className="grid grid-cols-2 gap-3"><InfoTile label="Участий" value="24" /><InfoTile label="Завершено" value="21" /><InfoTile label="Активных" value="3" /><InfoTile label="Размещено сейчас" value={formatCurrency(state.lockedEvents)} /></div>
          <div className="mt-3 rounded-xl bg-[#f5f5fa] p-3.5"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[#71719b]">Результат завершённых Events</p><p className="mt-1.5 text-xl font-bold tabular-nums text-[#2e9e4f]">+{formatCurrency(1840)}</p><p className="mt-1 text-xs text-[#71719b]">18 позиций с TAIS · 6 обратных позиций</p></div>
        </Section>
      </section>

      <section id="profile-1" className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Section title="Как формируется статус" subtitle={`${status.tier} · ${status.score} points`}>
          <div className="space-y-4">{breakdown.map((item) => <div key={item.label}><div className="flex items-center justify-between gap-3"><span className="text-[13px] font-semibold text-[#3a3a63]">{item.label}</span><b className="text-[13px] tabular-nums text-[#25254f]">+{item.value}</b></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eeeef8]"><div className="h-full rounded-full bg-[#5a5ac4]" style={{ width: `${Math.min(100, item.value / item.max * 100)}%` }} /></div></div>)}</div>
        </Section>
        <Section title={status.nextTier ? `Как получить ${status.nextTier}` : 'Максимальный статус'} subtitle={status.nextTier ? `${status.pointsToNext} points до следующего уровня` : 'Вы на максимальном уровне'}>
          <div className="space-y-2.5"><PathCard points="+170" title="+$25,000 долгосрочного капитала" text="Капитал в продуктах сроком 12 месяцев" /><PathCard points="+45" title="Завершить ещё 3 Events" text="Учитывается реальное участие, а не просмотр" /><PathCard points="+30" title="6 месяцев непрерывной активности" text="Стабильные отношения с Trigonum" /><PathCard points="+25" title="1 квалифицированный реферал" text="Инвестор прошёл KYC и разместил капитал" /></div>
        </Section>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
        <Section title="Привилегии Investor Club" subtitle={`Текущий уровень: ${status.tier}`}>
          <div className="grid gap-2.5 sm:grid-cols-2"><Privilege active title="Все стандартные продукты" text="Earn, Strategies и Events" /><Privilege active title="Расширенный Event allocation" text="Повышенный доступный объём участия" /><Privilege active title="Early product access" text="Ранний доступ к новым стратегиям" /><Privilege active={status.tier === 'Gold' || status.tier === 'Platinum' || status.tier === 'Black'} title="Priority support" text="Приоритетная очередь клиентского сервиса" /><Privilege active={status.tier === 'Platinum' || status.tier === 'Black'} title="Private strategies" text="Доступ с уровня Platinum" /><Privilege active={status.tier === 'Black'} title="Personal investment manager" text="Индивидуальное сопровождение Black" /></div>
        </Section>
        <Section title="Relationship timeline" subtitle="История отношений с Trigonum">
          <div className="relative ml-2 border-l border-[#d3d3e6] pl-5"><Timeline date="04 сентября 2026" title={`Текущий статус ${status.tier}`} text={`Investor Score достиг ${status.score} points`} /><Timeline date="21 августа 2026" title="Qualified Capital превысил $50,000" text="Учтены инвестиционные продукты и Events" /><Timeline date="12 августа 2026" title="Оформлен Alpha Momentum" text="Договор CTR-2490" /><Timeline date="03 июля 2026" title="10-й завершённый Event" text="Мильстоун активности Events" /><Timeline date="15 октября 2025" title="Начало отношений с Trigonum" text="Открыт инвестиционный аккаунт" last /></div>
        </Section>
      </section>

      <section id="profile-2" className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
        <Section title="Referral Program" subtitle="Только прямые приглашения — без многоуровневой структуры">
          <div className="rounded-2xl bg-[linear-gradient(145deg,#25254f,#17172f)] p-5 text-white"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-white/50">Ваш referral code</p><p className="mt-2 text-[25px] font-bold tracking-[.05em]">ARTEM-7K4P</p></div><span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-[#92f222]">Gold · 10% referral fee share</span></div><div className="mt-4 flex items-center gap-2 rounded-xl border border-white/12 bg-white/6 px-3 py-2.5"><span className="min-w-0 flex-1 truncate text-xs text-white/65">{referralLink}</span><button type="button" onClick={() => { navigator.clipboard?.writeText(referralLink); setCopied(true) }} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-[#25254f]"><Copy size={13} />{copied ? 'Скопировано' : 'Копировать'}</button></div></div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><InfoTile label="Приглашено" value="8" /><InfoTile label="Прошли KYC" value="6" /><InfoTile label="Инвестируют" value="4" /><InfoTile label="Активный капитал" value="$84,000" /></div>
        </Section>
        <Section title="Referral rewards" subtitle="Вознаграждение из комиссии Trigonum, не из капитала инвестора">
          <div className="grid grid-cols-3 gap-2.5"><Reward label="Pending" value="$180" /><Reward label="Available" value="$340" green /><Reward label="Paid" value="$720" /></div>
          <div className="mt-4 space-y-2.5"><Funnel number="8" label="Приглашений" /><Funnel number="6" label="Регистрация + KYC" /><Funnel number="4" label="Стали инвесторами" /><Funnel number="3" label="Активны сейчас" /></div>
        </Section>
      </section>

      <section id="profile-3" className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <Section title="Личные данные" subtitle="Данные владельца инвестиционного аккаунта" action={editing ? <button type="button" onClick={saveProfile} className="inline-flex items-center gap-1.5 rounded-lg bg-[#25254f] px-3 py-2 text-xs font-bold text-white"><Save size={14} />Сохранить</button> : <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#e4e4f0] px-3 py-2 text-xs font-bold text-[#5a5ac4]"><Pencil size={14} />Редактировать</button>}>
          <div className="grid gap-3 sm:grid-cols-2">{([
            ['firstName','Имя'],['lastName','Фамилия'],['email','Email'],['phone','Телефон'],['birthDate','Дата рождения'],['citizenship','Гражданство'],['country','Страна проживания'],['address','Адрес'],
          ] as const).map(([key,label]) => <label key={key}><span className="text-[10px] font-bold uppercase tracking-[.08em] text-[#71719b]">{label}</span><input value={fields[key]} disabled={!editing} onChange={(event) => setFields((current) => ({ ...current, [key]: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-[#e4e4f0] bg-white px-3 py-2.5 text-sm font-semibold text-[#25254f] outline-none disabled:bg-[#f5f5fa] disabled:text-[#71719b]" /></label>)}</div>
        </Section>
        <Section title="Identity & Compliance" subtitle="Статусы проверки аккаунта"><StatusLine label="KYC" value="Verified" /><StatusLine label="AML screening" value="Passed" /><StatusLine label="Investor questionnaire" value="Completed" /><StatusLine label="Source of funds" value="Verified" /><StatusLine label="Последняя проверка" value="12 Aug 2026" neutral /></Section>
      </section>

      <section id="profile-4" className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Section title="Инвестиционный профиль" subtitle="Используется для персонализации доступных продуктов"><div className="grid gap-3 sm:grid-cols-2"><InfoTile label="Risk profile" value="Умеренный" /><InfoTile label="Investment horizon" value="1–3 года" /><InfoTile label="Primary objective" value="Рост капитала" /><InfoTile label="Liquidity preference" value="Средняя" /><InfoTile label="Experience" value="Advanced" /><InfoTile label="Investor type" value="Private investor" /></div><button type="button" className="mt-4 rounded-xl border border-[#e4e4f0] bg-white px-3.5 py-2.5 text-xs font-bold text-[#5a5ac4]">Обновить инвестиционный профиль</button></Section>
        <Section title="Безопасность аккаунта" subtitle="Критические настройки управления капиталом"><StatusLine label="2FA" value="Enabled" /><StatusLine label="Passkey" value="Enabled" /><StatusLine label="Withdrawal confirmation" value="Enabled" /><StatusLine label="Whitelisted addresses" value={`${state.sources.length}`} neutral /><StatusLine label="Active sessions" value="2" neutral /><StatusLine label="Last login" value="Helsinki · Chrome" neutral /></Section>
      </section>

      <section id="profile-5" className="mt-4 grid gap-4 xl:grid-cols-[1fr_.8fr]">
        <Section title="Уведомления" subtitle="Что сообщать вам о движении капитала и возможностях"><div className="space-y-2">{[
          ['events','Новые Events'],['payouts','Выплаты и начисления'],['contracts','Окончание договоров'],['money','Движение средств'],['products','Новые инвестиционные продукты'],['marketing','Маркетинговые материалы'],
        ].map(([key,label]) => <Preference key={key} label={label} checked={preferences[key as keyof typeof preferences]} onChange={() => { const next = { ...preferences, [key]: !preferences[key as keyof typeof preferences] }; setPreferences(next); window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({ fields, preferences: next })) }} />)}</div></Section>
        <Section title="Каналы связи" subtitle="Где получать уведомления"><div className="space-y-2">{[['email','Email'],['push','Push'],['telegram','Telegram']].map(([key,label]) => <Preference key={key} label={label} checked={preferences[key as keyof typeof preferences]} onChange={() => { const next = { ...preferences, [key]: !preferences[key as keyof typeof preferences] }; setPreferences(next); window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({ fields, preferences: next })) }} />)}</div><div className="mt-4 rounded-xl border border-[#e4e4f0] bg-[#f5f5fa] p-3.5"><p className="text-xs font-bold text-[#25254f]">Priority Support · Gold</p><p className="mt-1 text-xs leading-[1.5] text-[#71719b]">Ваши обращения получают приоритетную маршрутизацию клиентской команды Trigonum.</p></div></Section>
      </section>
    </div>
  )
}

function Section({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <div className="rounded-[18px] border border-[#e4e4f0] bg-white px-6 py-5 shadow-[0_8px_30px_rgb(8_27_58/8%)]"><div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-[15px] font-semibold text-[#25254f]">{title}</h2>{subtitle && <p className="mt-1 text-xs text-[#71719b]">{subtitle}</p>}</div>{action}</div>{children}</div>
}
function HeroMetric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white/12 bg-white/7 px-4 py-3.5"><p className="text-[9px] font-bold uppercase tracking-[.1em] text-white/46">{label}</p><p className="mt-1.5 text-[18px] font-bold tabular-nums text-white">{value}</p></div> }
function InfoTile({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-[#e4e4f0] bg-[#f7f7fc] px-3.5 py-3"><p className="text-[9px] font-bold uppercase tracking-[.08em] text-[#71719b]">{label}</p><p className="mt-1.5 text-[14px] font-bold text-[#25254f]">{value}</p></div> }
function CapitalRow({ label, value, color }: { label: string; value: number; color: string }) { return <div className="flex items-center justify-between rounded-xl border border-[#e4e4f0] px-3.5 py-3"><span className="flex items-center gap-2 text-[13px] font-semibold text-[#3a3a63]"><span className="size-2.5 rounded-full" style={{ background: color }} />{label}</span><b className="text-[14px] tabular-nums text-[#25254f]">{formatCurrency(value)}</b></div> }
function PathCard({ points, title, text }: { points: string; title: string; text: string }) { return <div className="flex items-start gap-3 rounded-xl border border-[#e4e4f0] px-3.5 py-3"><span className="rounded-lg bg-[#eeeef8] px-2 py-1 text-[11px] font-bold text-[#5a5ac4]">{points}</span><div><p className="text-[13px] font-bold text-[#25254f]">{title}</p><p className="mt-0.5 text-[11px] text-[#71719b]">{text}</p></div></div> }
function Privilege({ active, title, text }: { active: boolean; title: string; text: string }) { return <div className={`rounded-xl border p-3.5 ${active ? 'border-[#d8ecdf] bg-[#eef7f1]' : 'border-[#e4e4f0] bg-[#f7f7fc]'}`}><div className="flex items-start gap-2.5"><span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${active ? 'bg-[#2e9e4f] text-white' : 'bg-[#d3d3e6] text-white'}`}>{active ? <Check size={13} /> : <Star size={12} />}</span><div><p className={`text-[13px] font-bold ${active ? 'text-[#25254f]' : 'text-[#71719b]'}`}>{title}</p><p className="mt-0.5 text-[11px] leading-[1.4] text-[#71719b]">{text}</p></div></div></div> }
function Timeline({ date, title, text, last = false }: { date: string; title: string; text: string; last?: boolean }) { return <div className={last ? 'relative' : 'relative pb-5'}><span className="absolute -left-[27px] top-1 size-3 rounded-full border-[3px] border-white bg-[#5a5ac4] shadow-[0_0_0_1px_#5a5ac4]" /><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[#71719b]">{date}</p><p className="mt-1 text-[13px] font-bold text-[#25254f]">{title}</p><p className="mt-0.5 text-[11px] text-[#71719b]">{text}</p></div> }
function Reward({ label, value, green = false }: { label: string; value: string; green?: boolean }) { return <div className="rounded-xl bg-[#f5f5fa] px-3 py-3"><p className="text-[9px] font-bold uppercase tracking-[.08em] text-[#71719b]">{label}</p><p className={`mt-1.5 text-[17px] font-bold tabular-nums ${green ? 'text-[#2e9e4f]' : 'text-[#25254f]'}`}>{value}</p></div> }
function Funnel({ number, label }: { number: string; label: string }) { return <div className="flex items-center gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#eeeef8] text-[12px] font-bold text-[#5a5ac4]">{number}</span><span className="text-[13px] font-semibold text-[#3a3a63]">{label}</span><span className="ml-auto h-px w-10 bg-[#e4e4f0]" /></div> }
function StatusLine({ label, value, neutral = false }: { label: string; value: string; neutral?: boolean }) { return <div className="flex items-center justify-between gap-3 border-b border-[#e4e4f0] py-2.5 last:border-0"><span className="text-[13px] text-[#3a3a63]">{label}</span><span className={`inline-flex items-center gap-1.5 text-[12px] font-bold ${neutral ? 'text-[#71719b]' : 'text-[#2e9e4f]'}`}>{!neutral && <BadgeCheck size={14} />}{value}</span></div> }
function Preference({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) { return <button type="button" onClick={onChange} className="flex w-full items-center justify-between rounded-xl border border-[#e4e4f0] px-3.5 py-3 text-left"><span className="text-[13px] font-semibold text-[#3a3a63]">{label}</span><span className={`relative h-[22px] w-[38px] rounded-full transition ${checked ? 'bg-[#5a5ac4]' : 'bg-[#d3d3e6]'}`}><span className={`absolute top-[3px] size-4 rounded-full bg-white transition-all ${checked ? 'left-[19px]' : 'left-[3px]'}`} /></span></button> }
