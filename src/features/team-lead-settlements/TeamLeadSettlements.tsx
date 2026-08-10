import { useState } from 'react'
import { ArrowUpRight, Check, CircleAlert, FileCheck2, RefreshCw, ShieldCheck, WalletCards, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { TeamStructureModal } from '../team-structure/TeamStructureModal'
import './team-lead-settlements.css'
import './team-lead-exception-modal.css'
import './team-lead-contract-timeline.css'
import './team-lead-contract-card-compact.css'

type Tab = 'contracts' | 'distributions' | 'exceptions'
type Requirement = { label: string; value: string; state: 'done' | 'waiting' | 'attention' }
type ContractControl = {
  id: string; investor: string; strategy: string; team: string; contract: string; period: string; capital: string; result: string; investorResult: string; companyProfit: string; decision: string; next: string; timeline: { close: string; report: string; decision: string; execution: string }; tone: string; summary: string; requirements: Requirement[]
}

const contracts: ContractControl[] = [
  {
    id: 'orlov-orion', investor: 'Павел Орлов', strategy: 'Orion Capital Strategy', team: 'Команда Orion Capital', contract: 'BRK-OR-2026-014', period: 'Август 2026', capital: '60 250 USDT', result: '+3 615 USDT', investorResult: '+2 892 USDT', companyProfit: '723 USDT', decision: 'Реинвестировать', next: 'Автоматическое зачисление в следующий период', timeline: { close: '31 авг', report: '1 сен', decision: 'Подписано', execution: '2 сен' }, tone: 'violet', summary: 'Условия договора выполнены. Дополнительное соглашение подписано.', requirements: [
      { label: 'Расчёт результата', value: 'Сформирован автоматически', state: 'done' },
      { label: 'Условия escrow', value: 'Покрытие 164%', state: 'done' },
      { label: 'Решение инвестора', value: 'Реинвестирование подтверждено', state: 'done' },
      { label: 'Исполнение', value: 'Зачисление после закрытия периода', state: 'waiting' },
    ],
  },
  {
    id: 'sokolova-orion', investor: 'Анна Соколова', strategy: 'Orion Capital Strategy', team: 'Команда Orion Capital', contract: 'BRK-OR-2026-018', period: 'Август 2026', capital: '25 000 USDT', result: '+1 500 USDT', investorResult: '+1 200 USDT', companyProfit: '300 USDT', decision: 'Вывести прибыль', next: 'Автоматическая выплата на Основной USDT · TRC-20', timeline: { close: '31 авг', report: '1 сен', decision: 'Подтверждено', execution: '2 сен' }, tone: 'blue', summary: 'Условия договора выполнены. Выплата будет создана автоматически после закрытия периода.', requirements: [
      { label: 'Расчёт результата', value: 'Сформирован автоматически', state: 'done' },
      { label: 'Условия escrow', value: 'Покрытие 164%', state: 'done' },
      { label: 'Решение инвестора', value: 'Вывод прибыли выбран', state: 'done' },
      { label: 'Исполнение', value: 'Выплата запланирована', state: 'waiting' },
    ],
  },
  {
    id: 'belova-alpha', investor: 'Мария Белова', strategy: 'Alpha Quant Strategy', team: 'Команда Alpha Quant', contract: 'BRK-AQ-2026-009', period: 'Август 2026', capital: '28 900 USDT', result: '+1 329 USDT', investorResult: '+1 090 USDT', companyProfit: '239 USDT', decision: 'Ожидается выбор', next: 'Инвестору отправлено уведомление о результате', timeline: { close: '31 авг', report: '1 сен', decision: 'до 20 авг', execution: 'После выбора' }, tone: 'cyan', summary: 'Расчёт готов. Для исполнения инвестор должен выбрать вывод или реинвестирование.', requirements: [
      { label: 'Расчёт результата', value: 'Сформирован автоматически', state: 'done' },
      { label: 'Условия escrow', value: 'Покрытие 146%', state: 'done' },
      { label: 'Решение инвестора', value: 'Ожидается до 20 августа', state: 'waiting' },
      { label: 'Исполнение', value: 'Будет запущено после выбора', state: 'waiting' },
    ],
  },
  {
    id: 'lebedev-orion', investor: 'Иван Лебедев', strategy: 'Orion Capital Strategy', team: 'Команда Orion Capital', contract: 'BRK-OR-2026-019', period: 'Август 2026', capital: '12 000 USDT', result: '+720 USDT', investorResult: '+576 USDT', companyProfit: '144 USDT', decision: 'Реинвестировать', next: 'Ожидается подпись доп. соглашения', timeline: { close: '31 авг', report: '1 сен', decision: 'до 20 авг', execution: 'После подписи' }, tone: 'amber', summary: 'Для автоматического реинвестирования не хватает подписи инвестора.', requirements: [
      { label: 'Расчёт результата', value: 'Сформирован автоматически', state: 'done' },
      { label: 'Условия escrow', value: 'Покрытие 164%', state: 'done' },
      { label: 'Решение инвестора', value: 'Реинвестирование выбрано', state: 'done' },
      { label: 'Дополнительное соглашение', value: 'Ожидается подпись', state: 'attention' },
    ],
  },
]

const distributions = [
  { period: 'Июль 2026', investor: 'Павел Орлов', contract: 'BRK-OR-2026-014', operation: 'Реинвестирование результата', amount: '+2 150 USDT', destination: 'Следующий период Orion', fee: '405 USDT' },
  { period: 'Июль 2026', investor: 'Мария Белова', contract: 'BRK-AQ-2026-009', operation: 'Выплата результата', amount: '+912 USDT', destination: 'Основной USDT · TRC-20', fee: '171 USDT' },
  { period: 'Июнь 2026', investor: 'Алексей Петров', contract: 'BRK-DD-2026-021', operation: 'Выплата результата', amount: '+366 USDT', destination: 'Основной USDT · ERC-20', fee: '68 USDT' },
]

type ExceptionCase = {
  id: string; kind: 'escrow' | 'agreement' | 'termination' | 'early-withdrawal'; title: string; subtitle: string; action: string; message: string; investor?: string; contract?: string; strategy?: string; requested?: string; maximum?: string
}

const exceptionSeed: ExceptionCase[] = [
  { id: 'escrow', kind: 'escrow', title: 'Недостаточное покрытие escrow', subtitle: 'Delta Diversified Strategy · 96% при требовании 100%', action: 'Рассмотреть', message: 'Заявка на пополнение escrow создана', contract: 'BRK-DD-2026-021', strategy: 'Delta Diversified Strategy' },
  { id: 'sign', kind: 'agreement', title: 'Не подписано соглашение о реинвестировании', subtitle: 'Иван Лебедев · договор BRK-OR-2026-019', action: 'Рассмотреть', message: 'Напоминание инвестору отправлено', investor: 'Иван Лебедев', contract: 'BRK-OR-2026-019', strategy: 'Orion Capital Strategy' },
  { id: 'termination', kind: 'termination', title: 'Подано заявление на досрочное расторжение', subtitle: 'Анна Соколова · договор BRK-OR-2026-018 · 5 августа 2026', action: 'Открыть заявление', message: 'Заявление на расторжение рассмотрено', investor: 'Анна Соколова', contract: 'BRK-OR-2026-018', strategy: 'Orion Capital Strategy', requested: 'Расторгнуть договор после расчёта текущего периода' },
  { id: 'early-withdrawal', kind: 'early-withdrawal', title: 'Ранний запрос выплаты', subtitle: 'Алексей Петров · договор BRK-DD-2026-021 · до 18 750 USDT', action: 'Рассмотреть запрос', message: 'Решение по ранней выплате сохранено', investor: 'Алексей Петров', contract: 'BRK-DD-2026-021', strategy: 'Delta Diversified Strategy', requested: '8 000 USDT', maximum: '18 750 USDT' },
]

export function TeamLeadSettlements() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('contracts')
  const [opened, setOpened] = useState<ContractControl | null>(null)
  const [exceptions, setExceptions] = useState(exceptionSeed)
  const [openedException, setOpenedException] = useState<ExceptionCase | null>(null)
  const [openedTeam, setOpenedTeam] = useState<{ team: string; strategy: string; contractId?: string } | null>(null)
  const [teamOverrides, setTeamOverrides] = useState<Record<string, string>>({})
  const [toast, setToast] = useState('')
  const resolveException = (id: string, message: string) => { setExceptions(items => items.filter(item => item.id !== id)); setToast(message) }
  const displayedContracts = contracts.map(item => ({ ...item, team: teamOverrides[item.id] ?? item.team }))

  return <main className="tl-settlements">
    <header className="tl-settlements-head"><div><p>АВТОМАТИЧЕСКИЕ РАСЧЁТЫ</p><h2>Расчёты</h2><span>Контроль исполнения обязательств по договорам. Стандартные операции Broker выполняет автоматически.</span></div><aside><span><WalletCards /> Прибыль компании</span><b>1 406 USDT</b><small>начислена по закрывающимся периодам</small></aside></header>
    <nav className="tl-settlement-tabs"><button className={tab === 'contracts' ? 'active' : ''} onClick={() => setTab('contracts')}>Исполнение договоров</button><button className={tab === 'distributions' ? 'active' : ''} onClick={() => setTab('distributions')}>Распределения</button><button className={tab === 'exceptions' ? 'active' : ''} onClick={() => setTab('exceptions')}>Исключения {exceptions.length > 0 && <em>{exceptions.length}</em>}</button></nav>
    {tab === 'contracts' && <Contracts items={displayedContracts} onOpen={setOpened} onTeam={(item) => setOpenedTeam({ team: item.team, strategy: item.strategy, contractId: item.id })} onReports={(item) => navigate(`/team-lead/reports?investor=${encodeURIComponent(item.investor)}&strategy=${encodeURIComponent(item.strategy)}`)} />}
    {tab === 'distributions' && <Distributions />}
    {tab === 'exceptions' && <Exceptions items={exceptions} onOpen={setOpenedException} />}
    {opened && <ContractDetail contract={opened} close={() => setOpened(null)} onTeam={() => setOpenedTeam({ team: opened.team, strategy: opened.strategy, contractId: opened.id })} onReports={() => navigate(`/team-lead/reports?investor=${encodeURIComponent(opened.investor)}&strategy=${encodeURIComponent(opened.strategy)}`)} />}
    {openedException && <ExceptionDetail item={openedException} close={() => setOpenedException(null)} onResolve={(message) => { resolveException(openedException.id, message); setOpenedException(null) }} />}
    {openedTeam && <TeamStructureModal team={openedTeam.team} strategy={openedTeam.strategy} onClose={() => setOpenedTeam(null)} onAssignTeam={(team) => { if (openedTeam.contractId) setTeamOverrides(current => ({ ...current, [openedTeam.contractId!]: team })); setOpened(null); setOpenedTeam(current => current ? { ...current, team } : null); setToast(`Команда назначена: ${team}`) }} />}
    {toast && <div className="tl-settlement-toast"><Check size={16} /> {toast}<button onClick={() => setToast('')}><X size={14} /></button></div>}
  </main>
}

function Contracts({ items, onOpen, onTeam, onReports }: { items: ContractControl[]; onOpen: (contract: ContractControl) => void; onTeam: (contract: ContractControl) => void; onReports: (contract: ContractControl) => void }) { return <section className="tl-cycles"><header><div><p>ТЕКУЩИЙ РАСЧЁТНЫЙ ПЕРИОД</p><h3>Исполнение обязательств по договорам</h3></div><span><RefreshCw size={13} /> Данные обновляются автоматически</span></header><div className="tl-cycle-grid">{items.map(item => {
  const needsAttention = item.requirements.some(requirement => requirement.state === 'attention')
  const waiting = item.requirements.some(requirement => requirement.state === 'waiting')
  return <article className={`tl-cycle-card ${item.tone}`} key={item.id}><header><div><p>{item.period} · {item.contract}</p><h4>{item.investor}</h4><small>{item.strategy} · {item.team}</small></div><button onClick={() => onOpen(item)} aria-label={`Открыть договор ${item.contract}`}><ArrowUpRight size={17} /></button></header><div className="tl-cycle-performance"><span>Статус договора<b>{needsAttention ? 'Нужно действие' : waiting ? 'В процессе' : 'Условия выполнены'}</b></span><i /><span>Результат периода<b>{item.result}</b></span><em>{needsAttention ? 'Есть исключение' : item.summary}</em></div><strong>{item.investorResult}</strong><small>результат инвестора по договору</small><button className="tl-team-link" onClick={() => onTeam(item)}>Команда компании · {item.team}</button><div className="tl-cycle-split"><span>Капитал<b>{item.capital}</b></span><span>Решение<b>{item.decision}</b></span><span>Компании<b>{item.companyProfit}</b></span></div><div className="tl-contract-dates"><span><b>Закрытие</b>{item.timeline.close}</span><span><b>Отчёт</b>{item.timeline.report}</span><span><b>Исполнение</b>{item.timeline.execution}</span></div><footer><span><FileCheck2 size={14} /> {item.next}</span><div><button onClick={() => onReports(item)}>Отчётность</button><button onClick={() => onOpen(item)}>Проверить условия</button></div></footer></article>
})}</div></section> }

function Distributions() { return <section className="tl-distributions"><header><div><p>ЗАВЕРШЁННЫЕ ОПЕРАЦИИ</p><h3>Автоматические распределения</h3></div><span>Создаются Broker после соблюдения всех условий договора</span></header><div className="tl-distribution-list"><div className="tl-distribution-row labels"><span>ИНВЕСТОР И ДОГОВОР</span><span>ОПЕРАЦИЯ</span><span>СУММА</span><span>НАЗНАЧЕНИЕ</span><span>КОМПАНИИ</span><span>СТАТУС</span></div>{distributions.map(row => <article className="tl-distribution-row" key={`${row.period}-${row.investor}`}><span><b>{row.investor}</b><small>{row.contract} · {row.period}</small></span><span>{row.operation}</span><b className="green">{row.amount}</b><span>{row.destination}</span><span>{row.fee}</span><em>Исполнено</em></article>)}</div></section> }

function Exceptions({ items, onOpen }: { items: ExceptionCase[]; onOpen: (item: ExceptionCase) => void }) { return <section className="tl-exceptions"><header><p>ТОЛЬКО НЕСТАНДАРТНЫЕ СЦЕНАРИИ</p><h3>Требуют согласования или действия</h3><span>Обычные выплаты, отчёты и реинвестирование выполняются автоматически и здесь не показываются.</span></header>{items.map(item => <article key={item.id}><i><CircleAlert /></i><div><b>{item.title}</b><span>{item.subtitle}</span></div><button onClick={() => onOpen(item)}>{item.action} <ArrowUpRight size={15} /></button></article>)}{!items.length && <div className="tl-exception-clear"><ShieldCheck /> Все процессы идут по стандартному сценарию</div>}</section> }

function ExceptionDetail({ item, close, onResolve }: { item: ExceptionCase; close: () => void; onResolve: (message: string) => void }) {
  const [amount, setAmount] = useState(item.requested?.replace(/[^0-9]/g, ' ')?.trim() ?? '')
  const isTermination = item.kind === 'termination'
  const isWithdrawal = item.kind === 'early-withdrawal'
  const title = isTermination ? 'Заявление на расторжение' : isWithdrawal ? 'Ранний запрос выплаты' : item.title
  return <div className="tl-exception-modal"><button className="tl-cycle-backdrop" onClick={close} aria-label="Закрыть" /><section><button className="tl-cycle-close" onClick={close}><X /></button><header><p>ИСКЛЮЧЕНИЕ ПО ДОГОВОРУ</p><h3>{title}</h3><span>{item.investor ? `${item.investor} · ` : ''}{item.contract} · {item.strategy}</span></header>
    <div className="tl-exception-context"><span>Запрос инвестора</span><b>{item.requested ?? item.subtitle}</b>{isTermination && <small>При одобрении договор будет переведён в статус «завершение». Broker сформирует финальный расчёт после закрытия позиции и подготовит выплату по условиям договора.</small>}{isWithdrawal && <small>Тимлид может разрешить сумму в пределах условий договора. Операция будет создана Broker только после одобрения.</small>}</div>
    {isWithdrawal && <label className="tl-amount-input"><span>Разрешить к выводу, USDT</span><input inputMode="decimal" value={amount} onChange={event => setAmount(event.target.value.replace(/[^0-9 ]/g, ''))} /><small>Максимально по договору: {item.maximum}</small></label>}
    {item.kind === 'escrow' && <div className="tl-exception-context"><span>Действие</span><b>Создать запрос на пополнение 650 USDT</b><small>После подтверждения средства будут направлены на escrow-счёт договора.</small></div>}
    {item.kind === 'agreement' && <div className="tl-exception-context"><span>Действие</span><b>Повторно отправить соглашение на подпись</b><small>До подписи реинвестирование не будет исполнено.</small></div>}
    <footer className="tl-exception-actions">{isTermination ? <><button className="danger" onClick={() => onResolve('Расторжение договора одобрено — Broker начал финальный расчёт')}><Check size={15} /> Одобрить расторжение</button><button onClick={() => onResolve('Заявление на расторжение отклонено')}>Отклонить</button></> : isWithdrawal ? <><button className="primary" disabled={!amount} onClick={() => onResolve(`Разрешён ранний вывод ${amount} USDT`)}><Check size={15} /> Разрешить выплату</button><button onClick={() => onResolve('Ранний запрос выплаты отклонён')}>Не разрешать</button></> : <><button className="primary" onClick={() => onResolve(item.message)}><Check size={15} /> Подтвердить действие</button><button onClick={close}>Закрыть</button></>}</footer>
  </section></div>
}

function ContractDetail({ contract, close, onTeam, onReports }: { contract: ContractControl; close: () => void; onTeam: () => void; onReports: () => void }) { return <div className="tl-cycle-modal"><button className="tl-cycle-backdrop" onClick={close} aria-label="Закрыть" /><section><button className="tl-cycle-close" onClick={close}><X /></button><header><p>ИСПОЛНЕНИЕ ДОГОВОРА</p><h3>{contract.investor}</h3><span>{contract.contract} · {contract.strategy}</span><button className="tl-trading-team" onClick={onTeam}>Торговая команда компании: {contract.team}</button></header><div className="tl-cycle-detail-result"><span>Результат инвестора за период</span><b>{contract.investorResult}</b><small>{contract.period} · общий результат стратегии {contract.result}</small></div><div className="tl-contract-timeline"><span><b>Закрытие периода</b>{contract.timeline.close}</span><span><b>Автоотчёт</b>{contract.timeline.report}</span><span><b>Решение инвестора</b>{contract.timeline.decision}</span><span><b>Исполнение</b>{contract.timeline.execution}</span></div><div className="tl-decision-list">{contract.requirements.map(requirement => <article key={requirement.label}><div><b>{requirement.label}</b><small>{requirement.value}</small></div><span className={requirement.state === 'done' ? 'reinvest' : requirement.state === 'attention' ? 'withdraw' : ''}>{requirement.state === 'done' ? 'Выполнено' : requirement.state === 'attention' ? 'Требует действия' : 'Ожидается'}</span></article>)}</div><section className="tl-fee-row"><span>Решение инвестора<b>{contract.decision}</b><small>{contract.next}</small></span><span>Прибыль компании<b>{contract.companyProfit}</b><small>Начисляется компании автоматически после исполнения условий договора.</small></span></section><footer><button onClick={onReports}><FileCheck2 size={15} /> Открыть отчётность</button><button onClick={close}>Закрыть</button></footer></section></div> }
