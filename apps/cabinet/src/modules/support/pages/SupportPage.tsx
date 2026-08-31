import { ChevronDown, Headphones, Mail, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { Card } from '../../../shared/ui/Card'
import { IconTile } from '../../../shared/ui/IconTile'
import { PrimaryButton } from '../../../shared/ui/buttons'

const faq = [
  { q: 'Сколько занимает зачисление пополнения?', a: 'Банковская карта и криптовалюта — обычно от нескольких минут до часа. Банковский перевод — 1–2 рабочих дня.' },
  { q: 'Как быстро обрабатывается вывод средств?', a: 'Стандартный срок обработки заявки на вывод — до 24 часов в рабочие дни.' },
  { q: 'Что такое Events?', a: 'Events — ограниченные по времени инвестиционные возможности, которые выявляет AI-система TAIS на основе рыночных аномалий.' },
  { q: 'Как изменить способ вывода средств?', a: 'В разделе «Вывести» выберите другой способ и заполните необходимые данные — ограничений на смену метода нет.' },
]

export function SupportPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(faq[0].q)
  const [sent, setSent] = useState(false)

  return (
    <div className="pb-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--trigonum-ink)]">Поддержка</h1>
        <p className="mt-1 text-sm text-[var(--trigonum-muted)]">Мы на связи 24/7 — среднее время ответа 2 минуты</p>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card className="flex items-center gap-3">
          <IconTile icon={<MessageCircle size={18} />} tone="blue" size={42} />
          <div>
            <p className="text-sm font-semibold text-[var(--trigonum-ink)]">Онлайн-чат</p>
            <p className="text-xs text-[var(--trigonum-muted)]">Ответ за ~2 минуты</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <IconTile icon={<Mail size={18} />} tone="violet" size={42} />
          <div>
            <p className="text-sm font-semibold text-[var(--trigonum-ink)]">support@trigonum.broker</p>
            <p className="text-xs text-[var(--trigonum-muted)]">Ответ в течение дня</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <IconTile icon={<Headphones size={18} />} tone="green" size={42} />
          <div>
            <p className="text-sm font-semibold text-[var(--trigonum-ink)]">Персональный менеджер</p>
            <p className="text-xs text-[var(--trigonum-muted)]">Для крупных счетов</p>
          </div>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr] lg:items-start">
        <Card title="Частые вопросы">
          <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
            {faq.map((item) => (
              <div key={item.q} className="py-3">
                <button
                  type="button"
                  onClick={() => setOpenFaq((cur) => (cur === item.q ? null : item.q))}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <span className="text-sm font-semibold text-[var(--trigonum-ink)]">{item.q}</span>
                  <ChevronDown size={16} className={`shrink-0 text-[var(--trigonum-muted)] transition-transform ${openFaq === item.q ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === item.q && <p className="mt-2 text-sm text-[var(--trigonum-muted)]">{item.a}</p>}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Создать обращение">
          {sent ? (
            <div className="rounded-xl bg-[color-mix(in_srgb,var(--trigonum-success)_10%,white)] p-4 text-sm font-medium text-[var(--trigonum-success)]">
              Обращение отправлено. Мы ответим на указанный email.
            </div>
          ) : (
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault()
                setSent(true)
              }}
            >
              <label className="text-sm">
                <span className="mb-1 block font-medium text-[var(--trigonum-text)]">Тема</span>
                <input required placeholder="Опишите тему обращения" className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm" />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-[var(--trigonum-text)]">Сообщение</span>
                <textarea required rows={4} placeholder="Опишите ваш вопрос" className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm" />
              </label>
              <PrimaryButton type="submit">Отправить обращение</PrimaryButton>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
