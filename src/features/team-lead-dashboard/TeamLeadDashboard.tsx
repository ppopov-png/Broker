import { useState } from 'react'
import { ArrowUpRight, BellRing, Check, CircleAlert, Landmark, UsersRound } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useNavigate } from 'react-router-dom'
import './team-lead-dashboard.css'
import './team-lead-dashboard-light.css'

const alerts = [
  { title: 'Запрос на досрочное расторжение', detail: 'Павел Орлов · Orion Capital Strategy', action: 'Открыть решение', tone: 'violet' },
  { title: 'Выбор по результату периода', detail: 'Мария Белова · Alpha Quant Strategy', action: 'Проверить расчёт', tone: 'blue' },
  { title: 'Недостаточное покрытие escrow', detail: 'Delta Diversified · покрытие 96%', action: 'Пополнить залог', tone: 'amber' },
]

const investments = [
  { investor: 'Павел Орлов', strategy: 'Orion Capital Strategy', team: 'Trading Team A', capital: '60 250 USDT', result: '+2 892 USDT', date: '31 авг · решение по периоду', color: 'violet' },
  { investor: 'Мария Белова', strategy: 'Alpha Quant Strategy', team: 'Scalping Team B', capital: '28 900 USDT', result: '+1 090 USDT', date: '20 авг · выбор инвестора', color: 'blue' },
  { investor: 'Алексей Минин', strategy: 'Delta Diversified Strategy', team: 'Arbitrage Team C', capital: '18 750 USDT', result: '+750 USDT', date: '27 авг · окно вывода', color: 'amber' },
]

const teams = [
  { name: 'Trading Team A', share: 67, investments: 3, capital: '97 250 USDT', result: '+8 010 USDT', color: 'violet' },
  { name: 'Scalping Team B', share: 20, investments: 1, capital: '28 900 USDT', result: '+1 090 USDT', color: 'blue' },
  { name: 'Arbitrage Team C', share: 13, investments: 1, capital: '18 750 USDT', result: '+750 USDT', color: 'amber' },
]

const chartData = {
  month: [{ label: '1 авг', invested: 128400, investors: 8920, company: 1120 }, { label: '8 авг', invested: 132100, investors: 9410, company: 1190 }, { label: '15 авг', invested: 136800, investors: 10280, company: 1285 }, { label: '22 авг', invested: 141700, investors: 11060, company: 1370 }, { label: '31 авг', invested: 144900, investors: 11710, company: 1454 }],
  quarter: [{ label: 'I кв.', invested: 83000, investors: 4100, company: 520 }, { label: 'II кв.', invested: 106000, investors: 6750, company: 840 }, { label: 'III кв.', invested: 128400, investors: 8920, company: 1120 }, { label: 'IV кв.', invested: 144900, investors: 11710, company: 1454 }],
  year: [{ label: '2023', invested: 55000, investors: 2200, company: 310 }, { label: '2024', invested: 76000, investors: 4950, company: 640 }, { label: '2025', invested: 108000, investors: 8360, company: 1060 }, { label: '2026', invested: 144900, investors: 11710, company: 1454 }],
}

export function TeamLeadDashboard() {
  const routerNavigate = useNavigate()
  const navigate = (to: string) => routerNavigate(to === '/team-lead/offers' ? '/team-lead/investments' : to)
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('quarter')
  const data = chartData[period]
  return <main className="tl-dashboard"><header className="tl-dashboard-head"><div><p>УПРАВЛЕНИЕ ИНВЕСТИЦИЯМИ</p><h2>Добро пожаловать, Алексей</h2><span>Сводка договоров, капитала и решений, которые требуют внимания.</span></div><button onClick={() => navigate('/team-lead/offers')}><BellRing size={15} /> 2 новые заявки <ArrowUpRight size={14} /></button></header>
    <section className="tl-dashboard-summary"><Metric title="Капитал в работе" value="144 900 USDT" note="5 активных инвестиций"/><Metric title="Результат инвесторов" value="+11 710 USDT" note="за IV квартал" green/><Metric title="Доход компании" value="1 454 USDT" note="за IV квартал" green/><Metric title="Ожидает решения" value="3 сценария" note="выплата, договор, escrow" purple/></section>
    <section className="tl-dashboard-top"><section className="tl-finance-chart"><header><div><p>ФИНАНСОВАЯ КАРТИНА</p><h3>Вложения и результат</h3><span>Все действующие договоры</span></div><div className="tl-period-switch">{([['month','Месяц'],['quarter','Квартал'],['year','Год']] as const).map(([id,label]) => <button key={id} className={period === id ? 'active' : ''} onClick={() => setPeriod(id)}>{label}</button>)}</div></header><div className="tl-chart-legend"><span><i className="capital"/>Вложенный капитал</span><span><i className="investors"/>Прибыль инвесторов</span><span><i className="company"/>Доход компании</span></div><ResponsiveContainer width="100%" height={282} minWidth={0}><AreaChart data={data} margin={{ top: 18, right: 4, left: -13, bottom: 0 }}><defs><linearGradient id="tl-capital" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b867ff" stopOpacity=".26"/><stop offset="1" stopColor="#b867ff" stopOpacity="0"/></linearGradient></defs><CartesianGrid vertical={false} stroke="rgba(173,124,255,.12)" strokeDasharray="3 5"/><XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill:'#8f9db4',fontSize:10 }}/><YAxis yAxisId="capital" tickLine={false} axisLine={false} tick={{ fill:'#8f9db4',fontSize:10 }} tickFormatter={value => `${Math.round(value / 1000)}k`}/><YAxis yAxisId="profit" orientation="right" tickLine={false} axisLine={false} tick={{ fill:'#8f9db4',fontSize:10 }} tickFormatter={value => `${Math.round(value / 1000)}k`}/><Tooltip contentStyle={{ background:'#0b1430',border:'1px solid rgba(184,103,255,.5)',borderRadius:12,fontSize:11 }}/><Area yAxisId="capital" type="monotone" dataKey="invested" name="Вложенный капитал" stroke="#b867ff" strokeWidth={2.5} fill="url(#tl-capital)" dot={false}/><Area yAxisId="profit" type="monotone" dataKey="investors" name="Прибыль инвесторов" stroke="#4fa2ff" strokeWidth={2.2} fill="none" dot={false}/><Area yAxisId="profit" type="monotone" dataKey="company" name="Доход компании" stroke="#55e867" strokeWidth={2.2} fill="none" dot={false}/></AreaChart></ResponsiveContainer></section>
      <section className="tl-control"><header><div><p>НА КОНТРОЛЕ</p><h3>Нужны решения</h3></div><button onClick={() => navigate('/team-lead/settlements')}>Все расчёты <ArrowUpRight size={14}/></button></header>{alerts.map(item => <button className={`tl-control-row ${item.tone}`} key={item.title} onClick={() => navigate('/team-lead/settlements')}><i><CircleAlert size={16}/></i><span><b>{item.title}</b><small>{item.detail}</small></span><em>{item.action}<ArrowUpRight size={13}/></em></button>)}<footer><Check size={15}/><span>9 договоров исполняются автоматически и не требуют действий.</span></footer></section></section>
    <section className="tl-dashboard-bottom"><section className="tl-active-investments"><header><div><p>АКТИВНЫЕ ИНВЕСТИЦИИ</p><h3>Инвестор → стратегия → команда</h3></div><button onClick={() => navigate('/team-lead/investments')}>Все инвестиции <ArrowUpRight size={14}/></button></header>{investments.map(item => <button className={`tl-investment-row ${item.color}`} key={item.investor} onClick={() => navigate('/team-lead/investments')}><span className="tl-investment-main"><b>{item.investor}</b><small>{item.strategy} · {item.team}</small></span><span><small>Капитал</small><b>{item.capital}</b></span><span><small>Результат периода</small><b className="positive">{item.result}</b></span><span className="tl-date"><small>{item.date}</small><ArrowUpRight size={15}/></span></button>)}</section>
      <section className="tl-team-distribution"><header><div><p>РАСПРЕДЕЛЕНИЕ ПО КОМАНДАМ</p><h3>Капитал и исполнение</h3></div><button onClick={() => navigate('/team-lead/investments')}>Команды <UsersRound size={14}/></button></header>{teams.map(item => <button className={`tl-team-row ${item.color}`} key={item.name} onClick={() => navigate('/team-lead/investments')}><span><b>{item.name}</b><small>{item.investments} инвестиции · {item.capital}</small></span><em><i style={{ width:`${item.share}%` }}/></em><strong>{item.share}%</strong><b className="positive">{item.result}</b></button>)}<footer><Landmark size={15}/><span>67% размещено в Trading Team A — стоит распределить следующий капитал в другие команды.</span></footer></section></section>
  </main>
}

function Metric({ title, value, note, green, purple }: { title: string; value: string; note: string; green?: boolean; purple?: boolean }) { return <article><span>{title}</span><b className={green ? 'green' : purple ? 'purple' : ''}>{value}</b><small>{note}</small></article> }
