import { Building2, Pencil, Save, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useBrokerAccount } from '../../../shared/lib/AccountContext'
import { Card } from '../../../shared/ui/Card'
import { Pill } from '../../../shared/ui/Pill'
import { OutlineButton, PrimaryButton } from '../../../shared/ui/buttons'

const individualInitialFields = {
  firstName: 'Артём',
  lastName: 'Дробков',
  email: 'artem.drobkov@example.com',
  phone: '+7 (700) 123-45-67',
  birthDate: '14.06.1990',
  citizenship: 'Республика Казахстан',
  country: 'Казахстан',
  address: 'г. Алматы, ул. Абая, 15',
}

export function ProfilePage() {
  const { activeAccount } = useBrokerAccount()
  const [editing, setEditing] = useState(false)
  const [fields, setFields] = useState(individualInitialFields)

  useEffect(() => setEditing(false), [activeAccount.id])

  if (activeAccount.type === 'company' && activeAccount.company) {
    const company = activeAccount.company
    return (
      <div className="pb-10">
        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">Корпоративный аккаунт</p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--trigonum-ink)]">{activeAccount.name}</h1>
          <p className="mt-1 text-sm text-[var(--trigonum-muted)]">Данные юридического лица и статус корпоративной верификации</p>
        </header>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr] lg:items-start">
          <Card title="Данные компании">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-[var(--trigonum-border)] bg-[var(--trigonum-bg)] px-3 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--trigonum-muted)]">{label}</p>
                  <p className="mt-1 text-sm font-bold text-[var(--trigonum-ink)]">{value}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex flex-col gap-5">
            <Card title="Статус верификации">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-violet-50 text-violet-700"><Building2 size={20} /></span>
                <div>
                  <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{activeAccount.name}</p>
                  <p className="text-xs text-[var(--trigonum-muted)]">Аккаунт с {activeAccount.verificationDate}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-lg bg-[var(--trigonum-bg)] px-3 py-2.5">
                <span className="text-sm text-[var(--trigonum-text)]">KYB</span>
                <Pill tone="success">Пройден</Pill>
              </div>
            </Card>

            <Card title="Тип аккаунта">
              <p className="text-sm font-semibold text-[var(--trigonum-text)]">Юридическое лицо</p>
              <p className="mt-1 text-xs text-[var(--trigonum-muted)]">Капитал, реквизиты, документы и операции этого аккаунта ведутся отдельно от личного счёта Артёма.</p>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-10">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--trigonum-blue)]">Личный аккаунт</p>
        <h1 className="mt-1 text-2xl font-bold text-[var(--trigonum-ink)]">Профиль</h1>
        <p className="mt-1 text-sm text-[var(--trigonum-muted)]">Личные данные и статус верификации</p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr] lg:items-start">
        <Card
          title="Личные данные"
          action={editing ? <PrimaryButton className="px-3 py-1.5 text-xs" onClick={() => setEditing(false)}><Save size={14} /> Сохранить</PrimaryButton> : <OutlineButton className="px-3 py-1.5 text-xs" onClick={() => setEditing(true)}><Pencil size={14} /> Редактировать</OutlineButton>}
        >
          <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); setEditing(false) }}>
            {([
              ['firstName', 'Имя'], ['lastName', 'Фамилия'], ['email', 'Email'], ['phone', 'Телефон'], ['birthDate', 'Дата рождения'], ['citizenship', 'Гражданство'], ['country', 'Страна проживания'], ['address', 'Адрес'],
            ] as const).map(([key, label]) => (
              <label key={key} className="text-sm">
                <span className="mb-1 block font-medium text-[var(--trigonum-text)]">{label}</span>
                <input disabled={!editing} value={fields[key]} onChange={(e) => setFields((f) => ({ ...f, [key]: e.target.value }))} className="w-full rounded-lg border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] px-3 py-2.5 text-sm disabled:bg-[var(--trigonum-bg)] disabled:text-[var(--trigonum-muted)]" />
              </label>
            ))}
          </form>
        </Card>

        <div className="flex flex-col gap-5">
          <Card title="Статус верификации">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-[color-mix(in_srgb,var(--trigonum-blue)_14%,white)] text-[var(--trigonum-blue)]"><UserRound size={20} /></span>
              <div>
                <p className="text-sm font-semibold text-[var(--trigonum-ink)]">{activeAccount.name}</p>
                <p className="text-xs text-[var(--trigonum-muted)]">Клиент с {activeAccount.verificationDate}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-[var(--trigonum-bg)] px-3 py-2.5"><span className="text-sm text-[var(--trigonum-text)]">KYC</span><Pill tone="success">Пройден</Pill></div>
          </Card>

          <Card title="Тип аккаунта">
            <p className="text-sm text-[var(--trigonum-text)]">Физическое лицо</p>
            <p className="mt-1 text-xs text-[var(--trigonum-muted)]">Личный баланс и операции Артёма не смешиваются с корпоративным аккаунтом.</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
