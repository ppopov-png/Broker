import { Laptop, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { Card } from '../../../shared/ui/Card'
import { OutlineButton, PrimaryButton } from '../../../shared/ui/buttons'
import { Switch } from '../../../shared/ui/Switch'

const sessions = [
  { id: 's1', device: 'Chrome · Windows', location: 'Алматы, Казахстан', current: true, icon: Laptop },
  { id: 's2', device: 'Trigonum App · iPhone 15', location: 'Алматы, Казахстан', current: false, icon: Smartphone },
]

export function SecurityPage() {
  const [twoFa, setTwoFa] = useState(true)
  const [sessionList, setSessionList] = useState(sessions)
  const [passwordSaved, setPasswordSaved] = useState(false)

  return (
    <div className="pb-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--trigonum-ink)]">Безопасность</h1>
        <p className="mt-1 text-sm text-[var(--trigonum-muted)]">Управляйте защитой аккаунта и активными сессиями</p>
      </header>

      <div className="flex flex-col gap-5">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--trigonum-ink)]">Двухфакторная аутентификация</p>
              <p className="mt-1 text-xs text-[var(--trigonum-muted)]">Дополнительная защита входа с помощью кода из приложения-аутентификатора</p>
            </div>
            <Switch checked={twoFa} onChange={setTwoFa} label="2FA" />
          </div>
        </Card>

        <Card title="Смена пароля">
          <form
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault()
              setPasswordSaved(true)
              setTimeout(() => setPasswordSaved(false), 2000)
            }}
          >
            <label className="text-sm">
              <span className="mb-1 block font-medium text-[var(--trigonum-text)]">Текущий пароль</span>
              <input required type="password" className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm" />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-[var(--trigonum-text)]">Новый пароль</span>
              <input required type="password" className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm" />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-[var(--trigonum-text)]">Подтверждение</span>
              <input required type="password" className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm" />
            </label>
            <div className="sm:col-span-3">
              <PrimaryButton type="submit">Обновить пароль</PrimaryButton>
              {passwordSaved && <span className="ml-3 text-sm font-medium text-[var(--trigonum-success)]">Пароль обновлён</span>}
            </div>
          </form>
        </Card>

        <Card title="Активные сессии">
          <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
            {sessionList.map((s) => (
              <div key={s.id} className="flex items-center gap-3 py-3">
                <s.icon size={18} className="text-[var(--trigonum-muted)]" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--trigonum-ink)]">
                    {s.device} {s.current && <span className="text-xs font-medium text-[var(--trigonum-success)]">· текущая сессия</span>}
                  </p>
                  <p className="text-xs text-[var(--trigonum-muted)]">{s.location}</p>
                </div>
                {!s.current && (
                  <OutlineButton className="px-3 py-1.5 text-xs" onClick={() => setSessionList((list) => list.filter((x) => x.id !== s.id))}>
                    Завершить
                  </OutlineButton>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
