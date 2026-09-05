import {
  ChevronDown,
  ChevronRight,
  Clock,
  Headphones,
  Mail,
  MessageCircle,
  Paperclip,
  Search,
  Send,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { tierInk, tierSoft } from '../../../shared/lib/InvestorStatus'
import { useInvestorStatus } from '../../../shared/lib/useInvestorStatus'
import { Card } from '../../../shared/ui/Card'
import { Pill } from '../../../shared/ui/Pill'
import { PrimaryButton } from '../../../shared/ui/buttons'

const TICKETS_KEY = 'trigonum-broker-tickets-v1'

type TicketStatus = 'open' | 'progress' | 'closed'

interface TicketMessage {
  from: 'client' | 'support'
  author: string
  text: string
  at: string
}

interface Ticket {
  id: string
  subject: string
  category: string
  status: TicketStatus
  updatedAt: string
  messages: TicketMessage[]
}

const categories = [
  'Пополнение и вывод',
  'Инвестиции и продукты',
  'Events',
  'Документы и отчётность',
  'Доступ и безопасность',
  'Другое',
]

const seedTickets: Ticket[] = [
  {
    id: 'TR-4821',
    subject: 'Не пришло пополнение USDT',
    category: 'Пополнение и вывод',
    status: 'closed',
    updatedAt: '28.08.2026',
    messages: [
      { from: 'client', author: 'Вы', text: 'Отправил 25 000 USDT по TRC20 два часа назад, на счёте пусто.', at: '28.08.2026, 11:04' },
      { from: 'support', author: 'Мурат, поддержка', text: 'Транзакция найдена, ей не хватало подтверждений сети. Средства зачислены, проверьте баланс.', at: '28.08.2026, 11:31' },
      { from: 'client', author: 'Вы', text: 'Вижу, спасибо.', at: '28.08.2026, 11:40' },
    ],
  },
  {
    id: 'TR-4990',
    subject: 'Справка о доходах за 2025 год',
    category: 'Документы и отчётность',
    status: 'progress',
    updatedAt: 'вчера',
    messages: [
      { from: 'client', author: 'Вы', text: 'Нужна справка о доходах за 2025 год для налоговой.', at: '03.09.2026, 15:22' },
      { from: 'support', author: 'Алия, отчётность', text: 'Готовим документ, будет в разделе «Документы» в течение рабочего дня.', at: '03.09.2026, 16:05' },
    ],
  },
]

interface Article {
  question: string
  answer: string
  category: string
}

const articles: Article[] = [
  {
    question: 'Сколько занимает зачисление пополнения?',
    answer: 'Карта и криптовалюта — от нескольких минут до часа. Банковский перевод — 1–2 рабочих дня. Если прошло больше, откройте обращение с хешем транзакции.',
    category: 'Пополнение и вывод',
  },
  {
    question: 'Как быстро обрабатывается вывод средств?',
    answer: 'Заявки до дневного лимита вашего уровня уходят в тот же рабочий день. Вывод на реквизиты, добавленные меньше суток назад, ждёт окончания холда.',
    category: 'Пополнение и вывод',
  },
  {
    question: 'Что такое Events?',
    answer: 'Событийные сделки с ограниченным окном входа: капитал резервируется на срок сделки и возвращается с результатом после её закрытия.',
    category: 'Events',
  },
  {
    question: 'Можно ли досрочно выйти из контракта?',
    answer: 'Да, по продуктам без гарантии тела — в любой рабочий день. По Earn с фиксированным сроком досрочный выход снижает ставку до базовой.',
    category: 'Инвестиции и продукты',
  },
  {
    question: 'Как считается уровень инвестора?',
    answer: 'Баллы начисляются за размещённый капитал, срок размещения, участие в Events, стаж и квалифицированные рекомендации. Разбор — на странице уровня.',
    category: 'Инвестиции и продукты',
  },
  {
    question: 'Как изменить способ вывода средств?',
    answer: 'Реквизиты добавляются в разделе «Безопасность». Новые становятся доступны через 24 часа — это защита от вывода при угоне аккаунта.',
    category: 'Доступ и безопасность',
  },
  {
    question: 'Где взять отчёт для налоговой?',
    answer: 'Раздел «Документы» — там же годовые выписки и подтверждения операций. Если нужна форма в особом формате, напишите в поддержку.',
    category: 'Документы и отчётность',
  },
]

const statusMeta: Record<TicketStatus, { label: string; tone: 'success' | 'info' | 'neutral' }> = {
  open: { label: 'Открыто', tone: 'info' },
  progress: { label: 'В работе', tone: 'info' },
  closed: { label: 'Решено', tone: 'success' },
}

/** Приоритет поддержки — часть привилегий уровня. */
const tierSla: Record<string, { channel: string; first: string }> = {
  Member: { channel: 'Общая очередь', first: '~2 часа' },
  Silver: { channel: 'Общая очередь', first: '~1 час' },
  Gold: { channel: 'Приоритетная очередь', first: '~15 минут' },
  Diamond: { channel: 'Персональный менеджер', first: '~5 минут' },
  Black: { channel: 'Прямая линия с инвесткомитетом', first: 'сразу' },
}

function loadTickets(): Ticket[] {
  try {
    const raw = window.localStorage.getItem(TICKETS_KEY)
    return raw ? (JSON.parse(raw) as Ticket[]) : seedTickets
  } catch {
    return seedTickets
  }
}

export function SupportPage() {
  const { status } = useInvestorStatus()
  const ink = tierInk[status.tier]
  const soft = tierSoft[status.tier]
  const sla = tierSla[status.tier] ?? tierSla.Member
  const hasManager = status.tier === 'Diamond' || status.tier === 'Black'

  const [tickets, setTickets] = useState<Ticket[]>(loadTickets)
  const [openTicket, setOpenTicket] = useState<string | null>(null)
  const [reply, setReply] = useState('')

  const [category, setCategory] = useState(categories[0])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState<string | null>(null)

  const [query, setQuery] = useState('')
  const [openArticle, setOpenArticle] = useState<string | null>(articles[0].question)

  const persist = (next: Ticket[]) => {
    setTickets(next)
    window.localStorage.setItem(TICKETS_KEY, JSON.stringify(next))
  }

  const submitTicket = () => {
    if (!subject.trim() || !message.trim()) return
    const now = new Date()
    const ticket: Ticket = {
      id: `TR-${5000 + tickets.length + 1}`,
      subject: subject.trim(),
      category,
      status: 'open',
      updatedAt: 'только что',
      messages: [
        {
          from: 'client',
          author: 'Вы',
          text: message.trim(),
          at: now.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        },
      ],
    }
    persist([ticket, ...tickets])
    setOpenTicket(ticket.id)
    setSubject('')
    setMessage('')
    setSent(ticket.id)
    window.setTimeout(() => setSent(null), 4000)
  }

  const sendReply = (ticketId: string) => {
    if (!reply.trim()) return
    persist(
      tickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              status: 'open',
              updatedAt: 'только что',
              messages: [
                ...ticket.messages,
                {
                  from: 'client' as const,
                  author: 'Вы',
                  text: reply.trim(),
                  at: new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
                },
              ],
            }
          : ticket,
      ),
    )
    setReply('')
  }

  const foundArticles = query.trim()
    ? articles.filter((article) =>
        `${article.question} ${article.answer} ${article.category}`.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : articles

  return (
    <div className="pb-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--trigonum-ink)]">Поддержка</h1>
        <p className="mt-1 text-sm text-[var(--trigonum-muted)]">
          {sla.channel} · первый ответ {sla.first} — по уровню {status.tier}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <ChannelCard
              icon={<MessageCircle size={17} />}
              title="Онлайн-чат"
              detail={`Ответ ${sla.first}`}
              badge="Сейчас на связи"
              accent={ink}
              soft={soft}
            />
            <ChannelCard
              icon={<Headphones size={17} />}
              title={hasManager ? 'Дарья Ковалёва' : 'Персональный менеджер'}
              detail={hasManager ? 'Ваш менеджер · GMT+6' : `Откроется на Diamond`}
              badge={hasManager ? 'Прямая линия' : undefined}
              muted={!hasManager}
              accent={ink}
              soft={soft}
            />
            <ChannelCard
              icon={<Mail size={17} />}
              title="support@trigonum.broker"
              detail="Ответ в течение дня"
              accent={ink}
              soft={soft}
            />
          </div>

          <Card
            title="Мои обращения"
            action={<span className="text-xs text-[var(--trigonum-muted)]">{tickets.length} всего</span>}
          >
            {tickets.length === 0 ? (
              <p className="text-sm text-[var(--trigonum-muted)]">Обращений пока нет.</p>
            ) : (
              <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
                {tickets.map((ticket) => {
                  const expanded = openTicket === ticket.id
                  return (
                    <div key={ticket.id} className="py-3 first:pt-0 last:pb-0">
                      <button
                        type="button"
                        onClick={() => setOpenTicket(expanded ? null : ticket.id)}
                        className="flex w-full items-center gap-3 text-left"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[var(--trigonum-ink)]">{ticket.subject}</p>
                          <p className="mt-0.5 text-xs text-[var(--trigonum-muted)]">
                            <span className="tabular-nums">{ticket.id}</span> · {ticket.category} · {ticket.updatedAt}
                          </p>
                        </div>
                        <Pill tone={statusMeta[ticket.status].tone}>{statusMeta[ticket.status].label}</Pill>
                        <ChevronDown
                          size={16}
                          className={`shrink-0 text-[var(--trigonum-muted)] transition ${expanded ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {expanded && (
                        <div className="mt-3 flex flex-col gap-3">
                          {ticket.messages.map((entry, index) => (
                            <div
                              key={index}
                              className={`max-w-[85%] rounded-xl px-3.5 py-2.5 ${
                                entry.from === 'client'
                                  ? 'self-end bg-[var(--trigonum-ink)] text-white'
                                  : 'self-start border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)]'
                              }`}
                            >
                              <p
                                className={`text-[11px] font-semibold ${
                                  entry.from === 'client' ? 'text-white/55' : 'text-[var(--trigonum-muted)]'
                                }`}
                              >
                                {entry.author} · {entry.at}
                              </p>
                              <p
                                className={`mt-1 text-sm ${
                                  entry.from === 'client' ? 'text-white' : 'text-[var(--trigonum-text)]'
                                }`}
                              >
                                {entry.text}
                              </p>
                            </div>
                          ))}

                          <div className="flex items-center gap-2">
                            <input
                              value={reply}
                              onChange={(event) => setReply(event.target.value)}
                              onKeyDown={(event) => event.key === 'Enter' && sendReply(ticket.id)}
                              placeholder="Написать в обращение"
                              className="min-w-0 flex-1 rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--trigonum-ink)]"
                            />
                            <button
                              type="button"
                              onClick={() => sendReply(ticket.id)}
                              disabled={!reply.trim()}
                              className="shrink-0 rounded-lg bg-[var(--trigonum-ink)] p-2.5 text-white transition hover:brightness-125 disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label="Отправить"
                            >
                              <Send size={15} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          <Card
            title="База знаний"
            action={
              <div className="relative">
                <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--trigonum-muted)]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Поиск"
                  className="w-44 rounded-lg border border-[var(--trigonum-border)] py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[var(--trigonum-ink)]"
                />
              </div>
            }
          >
            {foundArticles.length === 0 ? (
              <p className="text-sm text-[var(--trigonum-muted)]">
                Ничего не нашлось по запросу «{query}». Опишите вопрос в обращении — ответим.
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
                {foundArticles.map((article) => {
                  const expanded = openArticle === article.question
                  return (
                    <div key={article.question} className="py-3 first:pt-0 last:pb-0">
                      <button
                        type="button"
                        onClick={() => setOpenArticle(expanded ? null : article.question)}
                        className="flex w-full items-center gap-3 text-left"
                      >
                        <span className="min-w-0 flex-1 text-sm font-semibold text-[var(--trigonum-ink)]">
                          {article.question}
                        </span>
                        <ChevronDown
                          size={16}
                          className={`shrink-0 text-[var(--trigonum-muted)] transition ${expanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {expanded && (
                        <div className="mt-2">
                          <p className="text-sm leading-relaxed text-[var(--trigonum-muted)]">{article.answer}</p>
                          <span className="mt-2 inline-block text-xs font-semibold" style={{ color: ink }}>
                            {article.category}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card title="Новое обращение">
            <div className="flex flex-col gap-4">
              <label className="text-sm">
                <span className="mb-1.5 block font-medium text-[var(--trigonum-text)]">Категория</span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-lg border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] px-3 py-2.5 text-sm text-[var(--trigonum-ink)] outline-none focus:border-[var(--trigonum-ink)]"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <span className="mb-1.5 block font-medium text-[var(--trigonum-text)]">Тема</span>
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Коротко о проблеме"
                  className="w-full rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--trigonum-ink)]"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1.5 block font-medium text-[var(--trigonum-text)]">Сообщение</span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={5}
                  placeholder="Что случилось, когда и какие суммы затронуты"
                  className="w-full resize-y rounded-lg border border-[var(--trigonum-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--trigonum-ink)]"
                />
              </label>

              <p className="flex items-center gap-1.5 text-xs text-[var(--trigonum-muted)]">
                <Paperclip size={12} />
                Номер счёта и уровень подставим автоматически
              </p>

              <PrimaryButton type="button" onClick={submitTicket} disabled={!subject.trim() || !message.trim()}>
                Отправить обращение
              </PrimaryButton>

              {sent && (
                <div className="rounded-xl px-3.5 py-3" style={{ background: soft }}>
                  <p className="text-sm font-semibold" style={{ color: ink }}>
                    Обращение {sent} создано
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--trigonum-muted)]">Первый ответ {sla.first}</p>
                </div>
              )}
            </div>
          </Card>

          <Card title="Статус сервисов">
            <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
              <ServiceRow label="Пополнения" state="ok" />
              <ServiceRow label="Выводы" state="ok" />
              <ServiceRow label="Events" state="ok" />
              <ServiceRow label="Банковские переводы" state="slow" note="Дольше обычного" />
            </div>
          </Card>

          <Card title="Может пригодиться">
            <div className="flex flex-col divide-y divide-[var(--trigonum-border)]">
              <QuickLink to="/documents" label="Документы и выписки" />
              <QuickLink to="/levels" label="Лимиты и комиссии по уровню" />
              <QuickLink to="/security" label="Реквизиты для вывода" />
              <QuickLink to="/transactions" label="История операций" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ChannelCard({
  icon,
  title,
  detail,
  badge,
  accent,
  soft,
  muted = false,
}: {
  icon: ReactNode
  title: string
  detail: string
  badge?: string
  accent: string
  soft: string
  muted?: boolean
}) {
  return (
    <div
      className={`rounded-[var(--trigonum-radius-lg)] border border-[var(--trigonum-border)] bg-[var(--trigonum-surface)] p-4 shadow-[var(--trigonum-shadow-card)] ${
        muted ? 'opacity-60' : ''
      }`}
    >
      <span
        className="grid size-9 place-items-center rounded-xl"
        style={{ background: soft, color: accent }}
      >
        {icon}
      </span>
      <p className="mt-3 truncate text-sm font-semibold text-[var(--trigonum-ink)]">{title}</p>
      <p className="mt-0.5 text-xs text-[var(--trigonum-muted)]">{detail}</p>
      {badge && (
        <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--trigonum-success)]">
          <span className="size-1.5 rounded-full bg-[var(--trigonum-success)]" />
          {badge}
        </span>
      )}
    </div>
  )
}

function ServiceRow({ label, state, note }: { label: string; state: 'ok' | 'slow'; note?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
      <span className="text-sm text-[var(--trigonum-text)]">{label}</span>
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
          state === 'ok' ? 'text-[var(--trigonum-success)]' : 'text-[var(--trigonum-warning)]'
        }`}
      >
        {state === 'slow' && <Clock size={12} />}
        <span className={`size-1.5 rounded-full ${state === 'ok' ? 'bg-[var(--trigonum-success)]' : 'bg-[var(--trigonum-warning)]'}`} />
        {note ?? 'Работает'}
      </span>
    </div>
  )
}

function QuickLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-3 py-2.5 text-sm text-[var(--trigonum-text)] transition first:pt-0 last:pb-0 hover:text-[var(--trigonum-blue)]"
    >
      {label}
      <ChevronRight size={14} className="shrink-0 text-[var(--trigonum-muted)]" />
    </Link>
  )
}
