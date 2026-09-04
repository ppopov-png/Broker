import {
  BadgeCheck,
  Bell,
  Building2,
  CheckCircle2,
  Copy,
  Info,
  KeyRound,
  Mail,
  Pencil,
  Save,
  ShieldCheck,
  Smartphone,
  UserRound,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useBrokerAccount } from '../../../shared/lib/AccountContext'
import { formatCurrency } from '../../../shared/lib/format'
import { useFunding } from '../../../shared/lib/FundingContext'
import { calculateInvestorStatus, INVESTOR_TIERS, tierAccent } from '../../../shared/lib/InvestorStatus'

const PROFILE_STORAGE_KEY = 'trigonum-broker-profile-v3'
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
  const [editing, setEditing] = useState(false)
  const [fields, setFields] = useState<ProfileFields>(stored.fields)
  const [preferences, setPreferences] = useState<Preferences>(stored.preferences)
  const [tierOpen, setTierOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => setEditing(false), [activeAccount.id])

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

  const saveProfile = () => {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({ fields, preferences }))
    setEditing(false)
  }

  const updatePreference = (key: keyof Preferences) => {
    const next = { ...preferences, [key]: !preferences[key] }
    setPreferences(next)
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({ fields, preferences: next }))
  }

  if (activeAccount.type === 'company' && activeAccount.company) {
    const company = activeAccount.company
    return (
      <div className="pb-10">
        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-violet-700">Корпоративный аккаунт</p>
          <h1 className="mt-1 text-2xl font-bold text-[#25254f]">Профиль</h1>
          <p className="mt-1 text-sm text-[#71719b]">Данные юридического лица и настройки корпоративного аккаунта.</p>
        </header>
        <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
          <Section title="Данные компании">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Юридическое наименование', company.legalName],
                ['Регистрационный номер', company.registrationNumber],
                ['ИНН / налоговый номер', company.taxId],
                ['Юрисдикция', company.jurisdiction],
                ['Юридический адрес', company.address],
                ['Директор', company.director],
                ['Бенефициарный владелец', company.beneficialOwner],
                ['Корпоративный email', company.email],
                ['Телефон', company.phone],
                ['Номер счёта Broker', activeAccount.accountNumber],
              ].map(([label, value]) => <InfoTile key={label} label={label} value={value} />)}
            </div>
          </Section>
          <Section title="Верификация">
            <StatusLine label="KYB" value="Пройден" />
            <StatusLine label="AML screening" value="Пройден" />
            <StatusLine label="Бенефициар" value="Подтверждён" />
          </Section>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#5a5ac4]">Личный аккаунт · {activeAccount.accountNumber}</p>
          <h1 className="mt-1 text-2xl font-bold text-[#25254f]">Профиль</h1>
          <p className="mt-1 text-sm text-[#71719b]">Личные данные, инвестиционный профиль, безопасность и уведомления.</p>
        </div>
        <button
          type="button"
          onClick={() => setTierOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-[#e4e4f0] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#3a3a63] shadow-[0_6px_20px_rgb(8_27_58/6%)] hover:border-[#d3d3e6]"
        >
          <span className="size-2.5 rounded-full" style={{ background: investorAccent, boxShadow: `0 0 0 3px ${investorAccent}1f` }} />
          Статус инвестора
          <Info size={15} className="text-[#71719b]" />
        </button>
      </header>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <div className="space-y-5">
          <Section
            title="Личные данные"
            subtitle="Основная информация владельца аккаунта"
            action={editing ? (
              <button type="button" onClick={saveProfile} className="inline-flex items-center gap-1.5 rounded-lg bg-[#25254f] px-3 py-2 text-xs font-bold text-white"><Save size={14} />Сохранить</button>
            ) : (
              <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#e4e4f0] px-3 py-2 text-xs font-bold text-[#5a5ac4]"><Pencil size={14} />Редактировать</button>
            )}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                ['firstName', 'Имя'],
                ['lastName', 'Фамилия'],
                ['email', 'Email'],
                ['phone', 'Телефон'],
                ['birthDate', 'Дата рождения'],
                ['citizenship', 'Гражданство'],
                ['country', 'Страна проживания'],
                ['address', 'Адрес'],
              ] as const).map(([key, label]) => (
                <label key={key}>
                  <span className="text-[10px] font-bold uppercase tracking-[.08em] text-[#71719b]">{label}</span>
                  <input
                    value={fields[key]}
                    disabled={!editing}
                    onChange={(event) => setFields((current: ProfileFields) => ({ ...current, [key]: event.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-[#e4e4f0] bg-white px-3 py-2.5 text-sm font-semibold text-[#25254f] outline-none disabled:bg-[#f5f5fa] disabled:text-[#71719b]"
                  />
                </label>
              ))}
            </div>
          </Section>

          <Section title="Инвестиционный профиль" subtitle="Используется для персонализации доступных продуктов">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoTile label="Risk profile" value="Умеренный" />
              <InfoTile label="Investment horizon" value="1–3 года" />
              <InfoTile label="Primary objective" value="Рост капитала" />
              <InfoTile label="Liquidity preference" value="Средняя" />
              <InfoTile label="Experience" value="Advanced" />
              <InfoTile label="Investor type" value="Private investor" />
            </div>
            <button type="button" className="mt-4 rounded-xl border border-[#e4e4f0] bg-white px-3.5 py-2.5 text-xs font-bold text-[#5a5ac4]">Обновить инвестиционный профиль</button>
          </Section>

          <Section title="Уведомления" subtitle="Какие события Trigonum должен вам сообщать">
            <div className="grid gap-2 sm:grid-cols-2">
              <Preference label="Новые Events" icon={<Bell size={16} />} on={preferences.events} onClick={() => updatePreference('events')} />
              <Preference label="Выплаты" icon={<CheckCircle2 size={16} />} on={preferences.payouts} onClick={() => updatePreference('payouts')} />
              <Preference label="Окончание договоров" icon={<BadgeCheck size={16} />} on={preferences.contracts} onClick={() => updatePreference('contracts')} />
              <Preference label="Движение средств" icon={<Smartphone size={16} />} on={preferences.money} onClick={() => updatePreference('money')} />
              <Preference label="Новые продукты" icon={<Mail size={16} />} on={preferences.products} onClick={() => updatePreference('products')} />
              <Preference label="Маркетинговые материалы" icon={<Mail size={16} />} on={preferences.marketing} onClick={() => updatePreference('marketing')} />
            </div>
            <div className="mt-4 border-t border-[#e4e4f0] pt-4">
              <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[.08em] text-[#71719b]">Каналы</p>
              <div className="flex flex-wrap gap-2">
                <Channel label="Email" on={preferences.email} onClick={() => updatePreference('email')} />
                <Channel label="Push" on={preferences.push} onClick={() => updatePreference('push')} />
                <Channel label="Telegram" on={preferences.telegram} onClick={() => updatePreference('telegram')} />
              </div>
            </div>
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="Верификация" subtitle="Статусы проверки аккаунта">
            <div className="flex items-center gap-3 rounded-xl bg-[#f5f5fa] p-3.5">
              <span className="grid size-11 place-items-center rounded-full bg-[#eeeef8] text-[#5a5ac4]"><UserRound size={20} /></span>
              <div>
                <p className="text-sm font-bold text-[#25254f]">{activeAccount.name}</p>
                <p className="mt-0.5 text-xs text-[#71719b]">Клиент с {activeAccount.verificationDate}</p>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <StatusLine label="KYC" value="Verified" />
              <StatusLine label="AML screening" value="Passed" />
              <StatusLine label="Investor questionnaire" value="Completed" />
              <StatusLine label="Source of funds" value="Verified" />
            </div>
          </Section>

          <Section title="Безопасность" subtitle="Критические настройки управления капиталом">
            <SecurityRow icon={<ShieldCheck size={17} />} label="2FA" value="Включено" />
            <SecurityRow icon={<KeyRound size={17} />} label="Passkey" value="Включено" />
            <SecurityRow icon={<BadgeCheck size={17} />} label="Подтверждение вывода" value="Включено" />
            <SecurityRow icon={<Smartphone size={17} />} label="Активные сессии" value="2" />
            <button type="button" className="mt-3 w-full rounded-xl border border-[#e4e4f0] bg-white px-3 py-2.5 text-xs font-bold text-[#5a5ac4]">Перейти в безопасность</button>
          </Section>

          <Section title="Реферальная программа" subtitle="Прямая рекомендация без многоуровневой структуры">
            <div className="rounded-xl bg-[linear-gradient(145deg,#25254f,#17172f)] p-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[.1em] text-white/50">Ваш код</p>
              <p className="mt-1.5 text-xl font-bold tracking-[.06em]">ARTEM-7K4P</p>
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2">
                <span className="min-w-0 flex-1 truncate text-[11px] text-white/60">trigonum.ae/ref/ARTEM-7K4P</span>
                <button type="button" onClick={() => { navigator.clipboard?.writeText('https://trigonum.ae/ref/ARTEM-7K4P'); setCopied(true) }} className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1.5 text-[11px] font-bold text-[#25254f]"><Copy size={12} />{copied ? 'Готово' : 'Копировать'}</button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <InfoTile label="Инвестируют" value="4" />
              <InfoTile label="Rewards" value="$1,240" />
            </div>
            <button type="button" className="mt-3 w-full rounded-xl border border-[#e4e4f0] bg-white px-3 py-2.5 text-xs font-bold text-[#5a5ac4]">Подробнее о реферальной программе</button>
          </Section>
        </div>
      </div>

      {tierOpen && (
        <TierModal
          onClose={() => setTierOpen(false)}
          status={investorStatus}
          qualifiedCapital={invested + state.lockedEvents}
          longTermCapital={longTermCapital}
        />
      )}
    </div>
  )
}

function TierModal({ onClose, status, qualifiedCapital, longTermCapital }: { onClose: () => void; status: ReturnType<typeof calculateInvestorStatus>; qualifiedCapital: number; longTermCapital: number }) {
  const accent = tierAccent[status.tier]
  useEffect(() => {
    const handler = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[rgb(8_27_58/48%)] p-6 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className="max-h-[90vh] w-full max-w-[640px] overflow-auto rounded-[20px] bg-white shadow-[0_28px_70px_rgb(8_27_58/30%)]">
        <div className="relative overflow-hidden bg-[linear-gradient(150deg,#17172f,#25254f)] px-6 py-5 text-white">
          <div className="absolute -right-16 -top-20 size-60 rounded-full opacity-40" style={{ background: `radial-gradient(circle,${accent}88,transparent 70%)` }} />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-white/50">Investor status</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="size-3 rounded-full" style={{ background: accent, boxShadow: `0 0 0 5px ${accent}22` }} />
                <h2 className="text-[26px] font-bold">{status.tier}</h2>
              </div>
              <p className="mt-2 text-sm text-white/60">{status.score} points{status.nextTier ? ` · ${status.pointsToNext} до ${status.nextTier}` : ' · максимальный уровень'}</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg border border-white/20 p-2 text-white"><X size={16} /></button>
          </div>
          <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-white/12"><div className="h-full rounded-full" style={{ width: `${status.progress}%`, background: accent }} /></div>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <h3 className="text-sm font-bold text-[#25254f]">Как формируется уровень</h3>
            <p className="mt-1 text-xs leading-[1.5] text-[#71719b]">Уровень отражает глубину отношений с Trigonum: работающий капитал, срок инвестирования, участие в Events, длительность отношений и квалифицированные рекомендации.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <StatusFactor label="Капитал в инвестициях" value={`+${status.breakdown.capital} pts`} hint={`Qualified capital ${formatCurrency(qualifiedCapital)}`} />
            <StatusFactor label="Долгосрочный капитал" value={`+${status.breakdown.longTerm} pts`} hint={`${formatCurrency(longTermCapital)} в продуктах 12+ мес.`} />
            <StatusFactor label="Events" value={`+${status.breakdown.events} pts`} hint="Завершённые и активные Events" />
            <StatusFactor label="Срок отношений" value={`+${status.breakdown.tenure} pts`} hint="11 месяцев непрерывной активности" />
            <StatusFactor label="Рефералы" value={`+${status.breakdown.referrals} pts`} hint="Только квалифицированные инвесторы" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#25254f]">Уровни Investor Club</h3>
            <div className="mt-3 overflow-hidden rounded-xl border border-[#e4e4f0]">
              {INVESTOR_TIERS.map((tier) => (
                <div key={tier.tier} className={`flex items-center justify-between gap-3 border-b border-[#e4e4f0] px-3.5 py-3 last:border-b-0 ${tier.tier === status.tier ? 'bg-[#f7f7fc]' : 'bg-white'}`}>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#25254f]"><span className="size-2.5 rounded-full" style={{ background: tierAccent[tier.tier] }} />{tier.tier}</span>
                  <span className="text-xs font-bold tabular-nums text-[#71719b]">от {tier.threshold} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#cdcdf0] bg-[#eeeef8] p-4">
            <p className="text-xs font-bold text-[#5a5ac4]">Что даёт статус</p>
            <p className="mt-1.5 text-xs leading-[1.5] text-[#3a3a63]">Уровень влияет на доступ к отдельным продуктам, лимиты участия в Events, приоритет обслуживания и условия реферальной программы. Он не меняет доходность уже оформленного договора.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) {
  return <section className="rounded-[18px] border border-[#e4e4f0] bg-white p-5 shadow-[0_8px_30px_rgb(8_27_58/7%)]"><div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="text-[15px] font-semibold text-[#25254f]">{title}</h2>{subtitle && <p className="mt-1 text-xs text-[#71719b]">{subtitle}</p>}</div>{action}</div>{children}</section>
}
function InfoTile({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-[#e4e4f0] bg-[#f8f8fc] px-3.5 py-3"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[#71719b]">{label}</p><p className="mt-1.5 text-sm font-bold text-[#25254f]">{value}</p></div> }
function StatusLine({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-3 rounded-xl border border-[#e4e4f0] px-3.5 py-3"><span className="text-sm text-[#3a3a63]">{label}</span><span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2e9e4f]"><BadgeCheck size={14} />{value}</span></div> }
function SecurityRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) { return <div className="flex items-center gap-3 border-b border-[#e4e4f0] py-3 last:border-b-0"><span className="grid size-9 place-items-center rounded-lg bg-[#f5f5fa] text-[#5a5ac4]">{icon}</span><span className="flex-1 text-sm font-semibold text-[#25254f]">{label}</span><span className="text-xs font-bold text-[#2e9e4f]">{value}</span></div> }
function Preference({ label, icon, on, onClick }: { label: string; icon: ReactNode; on: boolean; onClick: () => void }) { return <button type="button" onClick={onClick} className="flex items-center gap-3 rounded-xl border border-[#e4e4f0] px-3.5 py-3 text-left"><span className="grid size-9 place-items-center rounded-lg bg-[#f5f5fa] text-[#5a5ac4]">{icon}</span><span className="flex-1 text-sm font-semibold text-[#25254f]">{label}</span><span className="relative h-[22px] w-[38px] rounded-full" style={{ background: on ? '#5a5ac4' : '#d3d3e6' }}><span className="absolute top-[3px] size-4 rounded-full bg-white transition-all" style={{ left: on ? 19 : 3 }} /></span></button> }
function Channel({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) { return <button type="button" onClick={onClick} className={`rounded-lg border px-3 py-2 text-xs font-bold ${on ? 'border-[#5a5ac4] bg-[#eeeef8] text-[#5a5ac4]' : 'border-[#e4e4f0] bg-white text-[#71719b]'}`}>{label}</button> }
function StatusFactor({ label, value, hint }: { label: string; value: string; hint: string }) { return <div className="rounded-xl border border-[#e4e4f0] p-3.5"><div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold text-[#3a3a63]">{label}</span><b className="text-xs text-[#25254f]">{value}</b></div><p className="mt-1.5 text-[11px] leading-[1.4] text-[#71719b]">{hint}</p></div> }
