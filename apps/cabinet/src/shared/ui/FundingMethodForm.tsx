import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import type { FundingMethod } from '../mock/types'
import { PrimaryButton } from './buttons'

const cryptoCurrencies = ['USDT', 'USDC', 'BTC'] as const
const cryptoNetworks = ['TRC20', 'ERC20', 'Bitcoin Network'] as const

const requisites = [
  { label: 'Банк-получатель', value: 'JSC "Halyk Bank"' },
  { label: 'Номер счёта', value: 'KZ00 1234 5678 9012 3456' },
  { label: 'SWIFT', value: 'HALYKZKA' },
  { label: 'Назначение платежа', value: 'TRG-AK-7734' },
]

function SuccessPanel({ text }: { text: string }) {
  return (
    <div className="rounded-xl bg-[color-mix(in_srgb,var(--trigonum-success)_10%,white)] p-4 text-sm font-medium text-[var(--trigonum-success)]">
      {text}
    </div>
  )
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-[var(--trigonum-muted)]">{label}</p>
        <p className="truncate text-sm font-semibold text-[var(--trigonum-ink)]">{value}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard?.writeText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }}
        className="grid size-8 shrink-0 place-items-center rounded-md text-[var(--trigonum-blue)] hover:bg-[var(--trigonum-bg)]"
        aria-label="Скопировать"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  )
}

export function FundingMethodForm({ method, mode }: { method: FundingMethod; mode: 'deposit' | 'withdraw' }) {
  const [submitted, setSubmitted] = useState(false)
  const [currency, setCurrency] = useState<(typeof cryptoCurrencies)[number]>('USDT')
  const [network, setNetwork] = useState<(typeof cryptoNetworks)[number]>('TRC20')

  if (method.id === 'transfer' && mode === 'deposit') {
    return (
      <div className="flex flex-col gap-3">
        {requisites.map((r) => (
          <CopyRow key={r.label} {...r} />
        ))}
        <p className="text-xs text-[var(--trigonum-muted)]">
          Переведите средства по реквизитам, указав назначение платежа. Зачисление обычно занимает 1–2 рабочих дня.
        </p>
      </div>
    )
  }

  if (submitted) {
    return (
      <SuccessPanel
        text={
          mode === 'deposit'
            ? 'Заявка на пополнение создана. Мы уведомим вас по email о зачислении.'
            : 'Заявка на вывод создана и передана в обработку.'
        }
      />
    )
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        setSubmitted(true)
      }}
    >
      <label className="text-sm">
        <span className="mb-1 block font-medium text-[var(--trigonum-text)]">Сумма</span>
        <div className="flex gap-2">
          <input required type="number" min={1} placeholder="0" className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm" />
          <span className="grid shrink-0 place-items-center rounded-lg border border-[var(--trigonum-border)] px-3 text-sm text-[var(--trigonum-muted)]">
            {method.id === 'crypto' ? currency : 'USD'}
          </span>
        </div>
      </label>

      {method.id === 'crypto' && (
        <>
          <div className="text-sm">
            <span className="mb-1 block font-medium text-[var(--trigonum-text)]">Валюта</span>
            <div className="flex gap-2">
              {cryptoCurrencies.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    currency === c
                      ? 'border-[var(--trigonum-blue)] bg-[color-mix(in_srgb,var(--trigonum-blue)_8%,white)] text-[var(--trigonum-blue)]'
                      : 'border-[var(--trigonum-border)] text-[var(--trigonum-text)]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="text-sm">
            <span className="mb-1 block font-medium text-[var(--trigonum-text)]">Сеть</span>
            <div className="flex flex-wrap gap-2">
              {cryptoNetworks.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNetwork(n)}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    network === n
                      ? 'border-[var(--trigonum-blue)] bg-[color-mix(in_srgb,var(--trigonum-blue)_8%,white)] text-[var(--trigonum-blue)]'
                      : 'border-[var(--trigonum-border)] text-[var(--trigonum-text)]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          {mode === 'withdraw' && (
            <label className="text-sm">
              <span className="mb-1 block font-medium text-[var(--trigonum-text)]">Адрес кошелька</span>
              <input required placeholder="Вставьте адрес" className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm" />
            </label>
          )}
        </>
      )}

      {method.id === 'card' && mode === 'deposit' && (
        <>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-[var(--trigonum-text)]">Номер карты</span>
            <input required placeholder="0000 0000 0000 0000" className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-[var(--trigonum-text)]">Срок действия</span>
              <input required placeholder="MM/YY" className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm" />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-[var(--trigonum-text)]">CVV</span>
              <input required placeholder="123" className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm" />
            </label>
          </div>
        </>
      )}

      {method.id === 'card' && mode === 'withdraw' && (
        <label className="text-sm">
          <span className="mb-1 block font-medium text-[var(--trigonum-text)]">Карта для вывода</span>
          <select className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm" defaultValue="4587">
            <option value="4587">Visa •••• 4587</option>
          </select>
        </label>
      )}

      {method.id === 'transfer' && mode === 'withdraw' && (
        <>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-[var(--trigonum-text)]">Банк-получатель</span>
            <input required placeholder="Название банка" className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-[var(--trigonum-text)]">Номер счёта / IBAN</span>
            <input required placeholder="KZ00 0000 0000 0000 0000" className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm" />
          </label>
        </>
      )}

      <label className="flex items-start gap-2 text-xs text-[var(--trigonum-muted)]">
        <input required type="checkbox" className="mt-0.5" />
        {mode === 'deposit' ? 'Я подтверждаю, что средства принадлежат мне' : 'Я подтверждаю реквизиты вывода'}
      </label>

      <PrimaryButton type="submit" className="mt-1 w-full">
        {method.cta}
      </PrimaryButton>
    </form>
  )
}
