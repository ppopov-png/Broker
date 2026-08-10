import { useMemo, useState } from 'react'
import { ArrowUpRight, Check, FileText, Landmark, MessageCircle, Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { TeamStructureModal } from '../team-structure/TeamStructureModal'
import { readOfferApplications, updateOfferApplication } from '../../shared/offer-applications'
import './team-lead-investments.css'
import './team-lead-investments-team.css'
import './team-lead-investments-grid.css'

type InvestmentStatus = 'active' | 'awaiting' | 'completed'
type Investment = { id: string; investor: string; initials: string; strategy: string; team: string; contract: string; capital: string; result: string; yield: string; status: InvestmentStatus; date: string; next: string; escrow: string; tone: string }
type Application = { id: string; investor: string; initials: string; strategy: string; amount: string; date: string; note: string; unread: boolean; sourceId?: string; wallet?: string }

const seedInvestments: Investment[] = [
  { id: 'inv-orion-pavel', investor: 'Павел Орлов', initials: 'ПО', strategy: 'Orion Capital Strategy', team: 'Orion Capital', contract: 'BRK-OR-2026-014', capital: '60 250', result: '+10 250', yield: '+20,45%', status: 'active', date: '09 июн 2026', next: 'Отчёт · 13 авг 2026', escrow: '7 500 USDT · 164%', tone: 'violet' },
  { id: 'inv-alpha-maria', investor: 'Мария Белова', initials: 'МБ', strategy: 'Alpha Quant Strategy', team: 'Alpha Quant', contract: 'BRK-AQ-2026-009', capital: '28 900', result: '+4 900', yield: '+20,39%', status: 'active', date: '18 июн 2026', next: 'Выплата · 20 авг 2026', escrow: '3 000 USDT · 146%', tone: 'blue' },
  { id: 'inv-delta-alexey', investor: 'Алексей Петров', initials: 'АП', strategy: 'Delta Diversified Strategy', team: 'Delta Partners', contract: 'BRK-DD-2026-021', capital: '18 750', result: '+750', yield: '+4,17%', status: 'active', date: '02 июл 2026', next: 'Окно вывода · 27 авг 2026', escrow: '2 000 USDT · 122%', tone: 'amber' },
  { id: 'inv-beta-elena', investor: 'Елена Крылова', initials: 'ЕК', strategy: 'Beta Income Strategy', team: 'Beta Income', contract: 'BRK-BI-2026-005', capital: '8 500', result: '+500', yield: '+6,25%', status: 'awaiting', date: '05 авг 2026', next: 'Ожидает подтверждения средств', escrow: '1 100 USDT · 150%', tone: 'green' },
]

const seedApplications: Application[] = [
  { id: 'app-1', investor: 'Анна Соколова', initials: 'АС', strategy: 'Orion Capital Strategy', amount: '25 000', date: 'Сегодня, 10:42', note: 'Готова рассмотреть стандартные условия договора.', unread: true },
  { id: 'app-2', investor: 'Дмитрий Волков', initials: 'ДВ', strategy: 'Alpha Quant Strategy', amount: '12 000', date: 'Вчера, 16:18', note: 'Просит уточнить порядок досрочного прекращения.', unread: true },
  { id: 'app-3', investor: 'Ольга Миронова', initials: 'ОМ', strategy: 'Delta Diversified Strategy', amount: '18 000', date: '5 авг, 13:02', note: 'Заявка принята, условия ещё не согласованы.', unread: false },
]

const statusLabel: Record<InvestmentStatus, string> = { active: 'Активные', awaiting: 'Ожидают активации', completed: 'Завершённые' }

export function TeamLeadInvestments() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState(() => [...seedApplications, ...readOfferApplications().filter(item => item.status === 'review' || item.status === 'clarification').map(item => ({ id: `client-${item.id}`, sourceId: item.id, investor: item.investor, initials: item.initials, strategy: item.offerName, amount: item.amount, date: item.createdAt, note: item.note || `Источник средств: ${item.wallet}`, unread: true, wallet: item.wallet }))])
  const [investments, setInvestments] = useState(seedInvestments)
  const [tab, setTab] = useState<InvestmentStatus>('active')
  const [query, setQuery] = useState('')
  const [opened, setOpened] = useState<Investment | null>(null)
  const [openedTeam, setOpenedTeam] = useState<Investment | null>(null)
  const [toast, setToast] = useState('')
  const shown = useMemo(() => investments.filter(item => item.status === tab && `${item.investor} ${item.strategy} ${item.contract}`.toLowerCase().includes(query.toLowerCase())), [investments, query, tab])
  const unread = applications.filter(application => application.unread).length

  const approve = (application: Application) => {
    if (application.sourceId) updateOfferApplication(application.sourceId, { status: 'contract_ready', contract: `BRK-${application.sourceId.slice(-6).toUpperCase()}-2026`, decisionNote: 'Тимлид одобрил заявку. Индивидуальный договор готов к подписанию.' })
    setApplications(current => current.filter(item => item.id !== application.id))
    setInvestments(current => [{ id: `inv-${application.id}`, investor: application.investor, initials: application.initials, strategy: application.strategy, team: application.strategy.replace(' Strategy', ''), contract: `BRK-${application.id.toUpperCase()}-2026`, capital: application.amount, result: '—', yield: '—', status: 'awaiting', date: '06 авг 2026', next: 'Договор готов к подписанию', escrow: 'Рассчитывается после подписания', tone: 'violet' }, ...current])
    setTab('awaiting')
    setToast(`Договор для «${application.investor}» подготовлен`)
  }
  const decline = (application: Application) => { if (application.sourceId) updateOfferApplication(application.sourceId, { status: 'declined', decisionNote: 'Заявка отклонена: условия участия пока не могут быть согласованы.' }); setApplications(current => current.filter(item => item.id !== application.id)); setToast(`Заявка «${application.investor}» отклонена`) }
  const clarify = (application: Application) => { if (application.sourceId) updateOfferApplication(application.sourceId, { status: 'clarification', decisionNote: 'Пожалуйста, уточните удобный порядок досрочного прекращения и пополнения.' }); setApplications(current => current.filter(item => item.id !== application.id)); navigate(`/team-lead/messages?investor=${encodeURIComponent(application.investor)}&offer=${encodeURIComponent(application.strategy)}`) }

  return <main className="tl-investments">
    <header className="tl-investments-head"><div><p>СВЯЗКИ ИНВЕСТОР → СТРАТЕГИЯ</p><h2>Инвестиции</h2><span>Договоры, движение средств и результат по каждому участию.</span></div><button onClick={() => navigate('/team-lead/messages')}><MessageCircle size={16} /> Открыть сообщения</button></header>

    <section className="tl-applications"><div className="tl-section-head"><div><p>ВХОДЯЩИЕ ЗАЯВКИ {unread > 0 && <em>{unread} новых</em>}</p><h3>Ожидают вашего решения</h3></div><span>{applications.length} всего</span></div><div className="tl-applications-grid">{applications.map(application => <article className={application.unread ? 'unread' : ''} key={application.id}><span className="tl-person">{application.initials}</span><div><b>{application.investor}</b><small>{application.strategy} · {application.amount} USDT{application.wallet ? ` · ${application.wallet}` : ''}</small><p>{application.note}</p></div><time>{application.date}</time><footer><button onClick={() => decline(application)}>Отклонить</button><button onClick={() => clarify(application)}>Уточнить</button><button className="approve" onClick={() => approve(application)}><Check size={14} /> Подготовить договор</button></footer></article>)}{!applications.length && <div className="tl-no-applications"><Check /> Новых заявок нет</div>}</div></section>

    <section className="tl-investment-list"><header><div><p>СОВЕРШЁННЫЕ ВЗАИМОДЕЙСТВИЯ</p><h3>Инвестиции и договоры</h3></div><label><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Инвестор, стратегия или договор" /></label></header><nav>{(Object.keys(statusLabel) as InvestmentStatus[]).map(status => <button className={tab === status ? 'active' : ''} key={status} onClick={() => setTab(status)}>{statusLabel[status]} <em>{investments.filter(item => item.status === status).length}</em></button>)}</nav><div className="tl-investment-table"><div className="tl-investment-row tl-investment-labels"><span>ИНВЕСТОР И СТРАТЕГИЯ</span><span>ДОГОВОР</span><span>КАПИТАЛ</span><span>РЕЗУЛЬТАТ</span><span>СОБЫТИЕ</span></div>{shown.map(item => <button className={`tl-investment-row ${item.tone}`} key={item.id} onClick={() => setOpened(item)}><span className="tl-inv-main"><i>{item.initials}</i><b>{item.investor}<small>{item.strategy}</small></b></span><span><b>{item.contract}</b><small>{item.date}</small></span><strong>{item.capital} <small>USDT</small></strong><em className={item.result === '—' ? 'neutral' : ''}>{item.result} <small>{item.yield}</small></em><span className="tl-next"><b>{item.next}</b><ArrowUpRight size={15} /></span></button>)}{!shown.length && <div className="tl-investment-empty">По этому фильтру инвестиций не найдено.</div>}</div></section>
    {opened && <InvestmentDetail investment={opened} onClose={() => setOpened(null)} onTeam={() => setOpenedTeam(opened)} onMessage={() => navigate('/team-lead/messages')} onReports={() => navigate(`/team-lead/reports?investor=${encodeURIComponent(opened.investor)}`)} />}
    {openedTeam && <TeamStructureModal team={openedTeam.team} strategy={openedTeam.strategy} onClose={() => setOpenedTeam(null)} onAssignTeam={(team) => { setInvestments(current => current.map(item => item.id === openedTeam.id ? { ...item, team } : item)); setOpened(current => current?.id === openedTeam.id ? { ...current, team } : current); setOpenedTeam(current => current ? { ...current, team } : null); setToast(`Команда назначена: ${team}`) }} />}
    {toast && <div className="tl-investment-toast"><Check size={16} /> {toast}<button onClick={() => setToast('')}><X size={14} /></button></div>}
  </main>
}

function InvestmentDetail({ investment, onClose, onTeam, onMessage, onReports }: { investment: Investment; onClose: () => void; onTeam: () => void; onMessage: () => void; onReports: () => void }) { return <div className="tl-investment-modal"><button className="tl-investment-backdrop" onClick={onClose} aria-label="Закрыть" /><section><button className="tl-investment-close" onClick={onClose}><X /></button><header><p>ИНВЕСТИЦИЯ</p><h3>{investment.investor}</h3><span>{investment.strategy}</span><button className="tl-investment-team-link" onClick={onTeam}>Торговая команда компании: Команда {investment.team}</button></header><div className="tl-investment-detail-grid"><div><span>Договор</span><b>{investment.contract}</b><button>Открыть договор <FileText size={14} /></button></div><div><span>Текущая стоимость</span><b>{investment.capital} USDT</b><small>Внесено {investment.date}</small></div><div><span>Результат</span><b className="green">{investment.result} USDT</b><small className="green">{investment.yield}</small></div><div><span>Escrow</span><b>{investment.escrow}</b><small>Отдельно от инвестиционного капитала</small></div></div><section className="tl-detail-timeline"><p>БЛИЖАЙШЕЕ СОБЫТИЕ</p><b>{investment.next}</b><span>Все расчёты, отчёты и изменения условий фиксируются в истории инвестиции.</span></section><footer><button onClick={onMessage}><MessageCircle size={16} /> Написать инвестору</button><button onClick={onReports}><FileText size={16} /> Посмотреть отчёты</button><button><Landmark size={16} /> Открыть расчёты</button></footer></section></div> }
