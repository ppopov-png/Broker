// @ts-nocheck
import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, FileText, X } from 'lucide-react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, getDay, parse, startOfWeek } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useNavigate, useSearchParams } from 'react-router-dom'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './portfolio-v2.css'
import './portfolio-polish.css'
import './portfolio-reports.css'
import './portfolio-reports-polish.css'
import './portfolio-interactions.css'

const localizer = dateFnsLocalizer({ format, parse, startOfWeek: date => startOfWeek(date, { weekStartsOn: 1 }), getDay, locales: { ru } })
const tones = { violet: '#b65cff', blue: '#4e9dff', amber: '#ffbb35', green: '#5adc58' }
const strategies = [
  { id: 'orion', name: 'Orion Capital Strategy', team: 'Orion Capital', value: '60 250,00', profit: '+10 250,00', yield: '+20,45%', report: '13 авг 2026', tone: 'violet', data: [54, 56, 55, 58, 60, 62] },
  { id: 'alpha', name: 'Alpha Quant Strategy', team: 'Alpha Quant', value: '28 900,00', profit: '+4 900,00', yield: '+20,39%', report: '20 авг 2026', tone: 'blue', data: [25, 26, 26, 27, 28, 29] },
  { id: 'delta', name: 'Delta Diversified Strategy', team: 'Delta Partners', value: '18 750,00', profit: '+750,00', yield: '+4,17%', report: '27 авг 2026', tone: 'amber', data: [18, 18.3, 18, 18.5, 18.6, 18.75] },
  { id: 'beta', name: 'Beta Income Strategy', team: 'Beta Income', value: '8 500,00', profit: '+500,00', yield: '+6,25%', report: '13 авг 2026', tone: 'green', data: [8, 8.1, 8.2, 8.3, 8.4, 8.5] },
]
const allStrategies = { id: 'all', name: 'Все стратегии', value: '116 400,00', tone: 'violet', data: [105, 108, 107, 111, 113, 116] }
const createEvent = (day, title, kind, strategy, amount, detail) => ({ title, start: new Date(2026, 7, day, 10), end: new Date(2026, 7, day, 11), kind, strategy, amount, detail, contract: `BRK-${strategy.id.toUpperCase()}-2026` })
const downloadText = (filename, content) => { const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' })); link.download = filename; link.click(); URL.revokeObjectURL(link.href) }

export function InvestorPortfolioV2() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') === 'reports' ? 'reports' : searchParams.get('tab') === 'income' ? 'income' : 'strategies')
  const selectTab = next => { setTab(next); setSearchParams(next === 'strategies' ? {} : { tab: next }) }
  return <main className="p2">
    <header className="p2-page-head"><div><p>МОИ ВЛОЖЕНИЯ</p><h2>Портфель</h2><span>Инвестиции, результаты и календарь выплат.</span></div><small>Обновлено сегодня, 10:15 (UTC+3)</small></header>
    <div className="p2-metrics"><Metric title="ТЕКУЩАЯ СТОИМОСТЬ" value="116 400,00 USDT" sub="+16 400,00 (+16,40%)"/><Metric title="ВЛОЖЕНО" value="100 000,00 USDT" sub="4 активные стратегии"/><Metric title="ДОСТУПНО К ВЫВОДУ" value="4 230,00 USDT" sub="Свободный баланс"/></div>
    <nav className="p2-tabs">{[['strategies', 'Стратегии'], ['income', 'Доходы и выплаты'], ['reports', 'Отчётность']].map(([id, label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => selectTab(id)}>{label}</button>)}</nav>
    {tab === 'strategies' ? <Strategies/> : tab === 'income' ? <Income/> : <Reports/>}
  </main>
}

function Metric({ title, value, sub }) { return <div><p>{title}</p><b>{value}</b><span className={sub.startsWith('+') ? 'green' : ''}>{sub}</span></div> }

function Strategies() {
  const [selected, setSelected] = useState(strategies[0])
  const [period, setPeriod] = useState('Квартал')
  const [opened, setOpened] = useState(null)
  const navigate = useNavigate()
  const color = tones[selected.tone]
  const values = selected.data
  const range = Math.max(...values) - Math.min(...values) || 1
  const points = values.map((value, index) => `${index * 20},${92 - (value - Math.min(...values)) / range * 64}`).join(' ')
  return <>
    <section className="p2-work">
      <div className="p2-chart" style={{ '--accent': color }}>
        <div className="p2-chart-head"><div><p>ДИНАМИКА СРЕДСТВ</p><b>{selected.value} USDT</b><span>{selected.name} · {period.toLowerCase()}</span></div><div className="p2-period"><button className={period === 'Квартал' ? 'on' : ''} onClick={() => setPeriod('Квартал')}>Квартал</button><button className={period === 'Год' ? 'on' : ''} onClick={() => setPeriod('Год')}>Год</button></div></div>
        <div className="p2-filter"><button className={selected.id === 'all' ? 'on' : ''} onClick={() => setSelected(allStrategies)}>Все стратегии</button>{strategies.map(strategy => <button key={strategy.id} className={selected.id === strategy.id ? 'on' : ''} onClick={() => setSelected(strategy)}>{strategy.name.replace(' Strategy', '')}</button>)}</div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none"><defs><linearGradient id="p2g" x1="0" x2="0" y1="0" y2="1"><stop stopColor={color} stopOpacity=".36"/><stop offset="1" stopColor={color} stopOpacity="0"/></linearGradient></defs><polyline points={`0,100 ${points} 100,100`} fill="url(#p2g)"/><polyline points={points} fill="none" stroke={color} strokeWidth="1"/></svg>
      </div>
      <aside className="p2-list"><div className="p2-list-title"><p>АКТИВНЫЕ СТРАТЕГИИ</p><button onClick={() => navigate('/investor/offers')}>Открыть маркет <ArrowUpRight/></button></div>{strategies.map(strategy => <article key={strategy.id} style={{ '--row-tone': tones[strategy.tone] }} className={selected.id === strategy.id ? 'sel' : ''} onClick={() => setSelected(strategy)}><i style={{ background: tones[strategy.tone] }}/><div><b>{strategy.name}</b><span>{strategy.team} · отчёт {strategy.report}</span></div><strong>{strategy.value}<small>USDT</small></strong><em>{strategy.profit}<small>{strategy.yield}</small></em><button aria-label={`Открыть ${strategy.name}`} onClick={event => { event.stopPropagation(); setOpened(strategy) }}><ArrowUpRight/></button></article>)}</aside>
    </section>
    {opened && <StrategyPage strategy={opened} close={() => setOpened(null)}/>}</>
}

function StrategyPage({ strategy, close, initial = 'description' }) {
  const [view, setView] = useState(initial)
  const tone = tones[strategy.tone]
  return <div className="p2-modal"><button className="modal-backdrop" aria-label="Закрыть" onClick={close}/><section><button className="x" aria-label="Закрыть" onClick={close}><X/></button><div className="p2-cover" style={{ '--accent': tone }}><span>{strategy.team}</span><i/></div><div className="p2-detail"><p>{view === 'description' ? 'СТРАТЕГИЯ' : 'ДОГОВОР ИНВЕСТИРОВАНИЯ'}</p><h2>{view === 'description' ? strategy.name : `BRK-${strategy.id.toUpperCase()}-2026`}</h2>{view === 'description' ? <><h3>Описание стратегии</h3><span>Диверсифицированная инвестиционная стратегия с регулярной отчётностью, прозрачным распределением результата и правилами досрочного вывода.</span><Details strategy={strategy}/><button onClick={() => setView('contract')}>Открыть договор инвестирования <FileText/></button></> : <><h3>Условия участия</h3><span>Договор фиксирует порядок расчётов, срок участия, комиссию, график отчётов и порядок вывода средств.</span><Details strategy={strategy} contract/><button onClick={() => setView('description')}><ArrowLeft/> К описанию стратегии</button></>}</div></section></div>
}

function Details({ strategy, contract }) { return <div className="p2-detail-grid"><b>{contract ? 'Номер договора' : 'Текущая стоимость'}</b><strong>{contract ? `BRK-${strategy.id.toUpperCase()}-2026` : `${strategy.value} USDT`}</strong><b>{contract ? 'Статус' : 'Результат'}</b><strong className="green">{contract ? 'Подписан' : `${strategy.profit} · ${strategy.yield}`}</strong><b>Следующий отчёт</b><strong>{strategy.report}</strong></div> }

function CalendarToolbar({ label, onNavigate }) { return <div className="p2-calendar-toolbar"><button aria-label="Предыдущий месяц" onClick={() => onNavigate('PREV')}><ChevronLeft/></button><strong>{label}</strong><button aria-label="Следующий месяц" onClick={() => onNavigate('NEXT')}><ChevronRight/></button></div> }

function Income() {
  const [filter, setFilter] = useState('Все')
  const [selected, setSelected] = useState(null)
  const [date, setDate] = useState(new Date(2026, 7, 1))
  const [opened, setOpened] = useState(null)
  const [contract, setContract] = useState(null)
  const [googleOpen, setGoogleOpen] = useState(false)
  const events = useMemo(() => [createEvent(3, 'Проверка периода', 'Отчёты', strategies[3], 'Без действий', 'Проверка завершения инвестиционного периода.'), createEvent(6, 'Пополнение escrow', 'Переводы', strategies[0], '+5 000 USDT', 'Залог направлен на обеспечение комиссии.'), createEvent(9, 'Ежемесячный отчёт', 'Отчёты', strategies[1], 'Опубликован', 'Отчёт за июль готов к просмотру.'), createEvent(13, 'Еженедельный отчёт', 'Отчёты', strategies[0], 'Ожидается', 'Отчёт с результатом и PnL за неделю.'), createEvent(17, 'Начисление дохода', 'Выплаты', strategies[0], '+860 USDT', 'Прибыль отражена в инвестиционном результате.'), createEvent(20, 'Выплата дохода', 'Выплаты', strategies[3], '+420 USDT', 'Доход поступит на свободный баланс.'), createEvent(22, 'Отчёт по комиссии', 'Отчёты', strategies[2], 'Ожидается', 'Подготовлен отчёт о комиссии за расчётный период.'), createEvent(27, 'Окно вывода', 'Переводы', strategies[2], 'Разрешён перевод', 'Можно подать запрос на частичный вывод.'), createEvent(29, 'Перевод на баланс', 'Переводы', strategies[3], '+420 USDT', 'Выплата переведена на свободный баланс.')], [])
  const visible = events.filter(item => filter === 'Все' || item.kind === filter)
  return <section className="p2-income"><header><div><p>КАЛЕНДАРЬ СОБЫТИЙ</p><h3>Доходы, отчёты и разрешённые переводы</h3></div><button className="p2-google" onClick={() => setGoogleOpen(true)}><CalendarDays/> Подключить Google Calendar</button></header><div className="p2-calendar"><Calendar localizer={localizer} culture="ru" date={date} onNavigate={setDate} events={visible} startAccessor="start" endAccessor="end" views={['month']} toolbar components={{ toolbar: CalendarToolbar }} onSelectEvent={setSelected} eventPropGetter={item => ({ className: `p2-event event-${item.kind}` })}/><aside><div className="p2-event-filter">{['Все', 'Отчёты', 'Выплаты', 'Переводы'].map(item => <button key={item} className={filter === item ? 'on' : ''} onClick={() => { setFilter(item); setSelected(null) }}>{item}</button>)}</div>{selected ? <article className="p2-event-detail"><p>{selected.kind}</p><h3>{selected.title}</h3><span>{selected.detail}</span><b>Стратегия <strong>{selected.strategy.name}</strong></b><b>Договор <strong>{selected.contract}</strong></b><b>Результат <strong className="green">{selected.amount}</strong></b><button onClick={() => setOpened(selected.strategy)}>Открыть стратегию <ArrowUpRight/></button><button onClick={() => setContract(selected.strategy)}>Открыть договор <FileText/></button></article> : <article className="p2-nearest"><p>БЛИЖАЙШИЕ СОБЫТИЯ</p>{visible.slice(0, 5).map(item => <button key={item.title} onClick={() => setSelected(item)}><time>{format(item.start, 'd MMM', { locale: ru })}</time><span>{item.title}</span><ArrowUpRight/></button>)}</article>}</aside></div>{opened && <StrategyPage strategy={opened} close={() => setOpened(null)}/>} {contract && <StrategyPage strategy={contract} initial="contract" close={() => setContract(null)}/>} {googleOpen && <GoogleConnect close={() => setGoogleOpen(false)}/>}</section>
}

function Reports() {
  const [opened, setOpened] = useState(null)
  return <section className="portfolio-reports"><header><div><p>ОТЧЁТНОСТЬ ПО СТРАТЕГИЯМ</p><h3>Результаты и движение средств</h3><span>Каждый отчёт объединяет результат стратегии, договор, выплаты и обеспечение.</span></div><small>Отчётный период · июль 2026</small></header><div className="report-cards">{strategies.map(strategy => <button key={strategy.id} className="report-card" style={{ '--report-tone': tones[strategy.tone] }} onClick={() => setOpened(strategy)}><div className="report-card-top"><span>{strategy.team}</span><FileText/></div><h4>{strategy.name}</h4><p>Отчёт за июль 2026</p><strong>{strategy.value} <small>USDT</small></strong><div className="report-result"><b className="green">{strategy.profit}</b><span>{strategy.yield} за всё время</span></div><footer><span>Договор BRK-{strategy.id.toUpperCase()}-2026</span><ArrowUpRight/></footer></button>)}</div>{opened && <ReportPage strategy={opened} close={() => setOpened(null)}/>}</section>
}

function ReportPage({ strategy, close }) {
  const tone = tones[strategy.tone]
  const [period, setPeriod] = useState('Месяц')
  const [notice, setNotice] = useState('')
  const [action, setAction] = useState('')
  const result = { 'Месяц': strategy.profit, 'Квартал': strategy.id === 'orion' ? '+3 140,00' : '+1 250,00', 'Год': strategy.id === 'orion' ? '+7 820,00' : '+2 910,00', 'Всё время': strategy.profit }[period]
  const periodYield = { 'Месяц': '+1,24%', 'Квартал': '+4,67%', 'Год': '+12,18%', 'Всё время': strategy.yield }[period]
  const periods = strategy.id === 'delta' ? ['+120,00', '+210,00', '+180,00', '+240,00'] : ['+1 400,00', '+1 850,00', '+1 620,00', strategy.profit]
  const navigate = useNavigate()
  return <div className="report-modal"><button className="modal-backdrop" aria-label="Закрыть" onClick={close}/><section style={{ '--accent': tone }}><button className="x" aria-label="Закрыть" onClick={close}><X/></button><header><div><p>ОТЧЁТ ПО СТРАТЕГИИ</p><h2>{strategy.name}</h2><span>{strategy.team} · июль 2026</span></div><div><p>ДОГОВОР</p><b>BRK-{strategy.id.toUpperCase()}-2026</b><span>Подписан · действует</span></div></header><div className="report-hero"><div><p>ТЕКУЩАЯ СТОИМОСТЬ</p><strong>{strategy.value} <small>USDT</small></strong><span>На 31 июля 2026</span></div><div><div className="result-label"><p>РЕЗУЛЬТАТ ЗА</p><select value={period} onChange={event => setPeriod(event.target.value)}><option>Месяц</option><option>Квартал</option><option>Год</option><option>Всё время</option></select></div><strong className="green">{result} <small>USDT</small></strong><span>{periodYield} за выбранный период</span></div></div><div className="report-columns"><section><p>ДВИЖЕНИЕ СРЕДСТВ</p><div className="report-rows"><b>Стартовый баланс <strong>{strategy.value} USDT</strong></b><b>Начисленный доход <strong className="green">{result} USDT</strong></b><b>Выплачено <strong>0,00 USDT</strong></b><b>Доступно к выводу <strong>0,00 USDT</strong></b></div><p className="report-subtitle">ДОХОД ПО НЕДЕЛЯМ</p><div className="report-periods">{periods.map((value, index) => <span key={index}><i style={{ height: `${35 + index * 15}%` }}/><b>{value}</b><small>{['1–7', '8–14', '15–21', '22–31'][index]} июл</small></span>)}</div></section><section><p>УСЛОВИЯ И ОБЕСПЕЧЕНИЕ</p><div className="report-rows"><b>Срок договора <strong>12 месяцев</strong></b><b>Комиссия стратегии <strong>20% от прибыли</strong></b><b>Escrow-залог <strong>достаточный</strong></b><b>Покрытие комиссии <strong className="green">{strategy.id === 'delta' ? '122%' : '146%'}</strong></b></div><div className="report-note"><FileText/><span>Полная версия договора и выписка по расчётам приложены к отчёту.</span></div></section></div><div className="report-actions"><div><p>ДЕЙСТВИЯ ПО ИНВЕСТИЦИИ</p><span>{notice || 'Действия не изменяют условия договора без вашего подтверждения.'}</span></div><button onClick={() => setAction('terminate')}>Подать заявление на досрочное прекращение</button><button onClick={() => setAction('withdraw')}>Вывести свободные деньги</button><button onClick={() => navigate(`/investor/messages?team=${encodeURIComponent(strategy.team)}&offer=${encodeURIComponent(strategy.name)}`)}>Написать тимлиду</button></div><footer><button onClick={() => downloadText(`report-${strategy.id}-2026-07.txt`, `${strategy.name}\nПериод: ${period}\nРезультат: ${result} USDT\nДоговор: BRK-${strategy.id.toUpperCase()}-2026`)}>Скачать PDF <FileText/></button><button onClick={close}>Закрыть отчёт</button></footer>{action && <ReportActionFlow kind={action} strategy={strategy} close={() => setAction('')} done={setNotice}/>}</section></div>
}

function ReportActionFlow({ kind, strategy, close, done }) { const [step, setStep] = useState(0); const [amount, setAmount] = useState(''); const termination = kind === 'terminate'; return <div className="report-action-flow"><button className="modal-backdrop" onClick={close}/><section><button className="x" onClick={close}><X/></button><p>{termination ? 'ДОСРОЧНОЕ ПРЕКРАЩЕНИЕ' : 'ВЫВОД СВОБОДНЫХ СРЕДСТВ'}</p><h3>{termination ? 'Подать заявление' : 'Создать запрос на вывод'}</h3>{step === 0 ? <>{termination ? <label>Причина заявления<textarea placeholder="Опишите причину или оставьте комментарий для тимлида"/></label> : <label>Сумма, USDT<input value={amount} onChange={event => setAmount(event.target.value)} placeholder="0,00"/><small>Доступно 0,00 USDT по этой стратегии</small></label>}<button disabled={!termination && !Number(amount)} onClick={() => setStep(1)}>Продолжить</button></> : <><span>{termination ? `Заявление по ${strategy.name} будет направлено тимлиду и появится в истории.` : `Запрос на ${amount} USDT будет создан после подтверждения.`}</span><button onClick={() => { done(termination ? 'Заявление отправлено тимлиду.' : 'Запрос на вывод создан.'); close() }}>Подтвердить</button></>}</section></div> }

function GoogleConnect({ close }) { const [connected, setConnected] = useState(false); return <div className="report-action-flow"><button className="modal-backdrop" onClick={close}/><section><button className="x" onClick={close}><X/></button><p>ИНТЕГРАЦИЯ КАЛЕНДАРЯ</p><h3>{connected ? 'Календарь подключён' : 'Подключить Google Calendar'}</h3><span>{connected ? 'События портфеля будут синхронизированы с выбранным календарём.' : 'Подтвердите подключение, чтобы добавить отчёты, выплаты и окна вывода в календарь.'}</span><button onClick={() => connected ? close() : setConnected(true)}>{connected ? 'Готово' : 'Подтвердить подключение'}</button></section></div> }
