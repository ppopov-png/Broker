// Recharts' formatter types are narrower than its runtime values in this version.
// @ts-nocheck
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, FileText, Info } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import './investor-overview.css'
import './overview-layout.css'

const chart = [
  { date: '7 июл', value: 100000 }, { date: '10 июл', value: 102400 }, { date: '14 июл', value: 105100 },
  { date: '18 июл', value: 103700 }, { date: '21 июл', value: 101900 }, { date: '24 июл', value: 106200 },
  { date: '26 июл', value: 109200 }, { date: '28 июл', value: 105400 }, { date: '1 авг', value: 111100 },
  { date: '3 авг', value: 110700 }, { date: '6 авг', value: 116400 },
]

const positions = [
  ['◈', 'Orion Capital Strategy', 'Активна', '60 250,00', '+10 250,00', '+20,45%', '164%', '13 авг 2026', 'Через 7 дней', 'ok'],
  ['⌁', 'Alpha Quant Strategy', 'Активна', '28 900,00', '+4 900,00', '+20,39%', '146%', '13 авг 2026', 'Через 7 дней', 'ok'],
  ['△', 'Delta Diversified Strategy', 'Предупреждение', '18 750,00', '+750,00', '+4,17%', '122%', '20 авг 2026', 'Через 14 дней', 'warn'],
  ['≡', 'Beta Income Strategy', 'Активна', '8 500,00', '+500,00', '+6,25%', '134%', '13 авг 2026', 'Через 7 дней', 'ok'],
] as const

export function InvestorOverview() {
  const [period, setPeriod] = useState('30д')
  const [active, setActive] = useState('Orion Capital Strategy')
  const navigate = useNavigate()
  return <main className="overview">
    <section className="overview-content">
      <h1>Добро пожаловать, Инвестор</h1>
      <div className="metrics">
        <Metric label="ТЕКУЩАЯ СТОИМОСТЬ" value="116 400,00" detail="+16 400,00 (+16,40%)" />
        <Metric label="ВСЕГО ИНВЕСТИРОВАНО" value="100 000,00" note="Капитал в работе" />
        <Metric label="ОБЩИЙ PNL (ВСЁ ВРЕМЯ)" value="+16 400,00" detail="+16,40%" />
        <Metric label="ДОСТУПНО К ВЫВОДУ" value="4 230,00" note="Свободный баланс" />
      </div>
      <section className="overview-grid">
      <section className="chart-section">
        <div className="chart-head"><div><p className="section-label">ДИНАМИКА СТОИМОСТИ ПОРТФЕЛЯ <Info size={15} /></p><div className="chart-value">116 400,00 <small>USDT</small><em>+16,40%</em><span>за {period === '30д' ? '30' : period === '90д' ? '90' : '365'} дней</span></div></div><div className="periods">{['7д', '30д', '90д', 'Год'].map(item => <button key={item} onClick={() => setPeriod(item)} className={period === item ? 'selected' : ''}>{item}</button>)}</div></div>
        <div className="graph"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart} margin={{ top: 18, right: 8, bottom: 0, left: 0 }}><defs><linearGradient id="portfolio-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#0faeff" stopOpacity={.23}/><stop offset="100%" stopColor="#0faeff" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="date" axisLine={{ stroke: 'rgba(255,255,255,.13)' }} tickLine={false} tick={{ fill: '#9296ab', fontSize: 12 }} interval={1}/><YAxis hide domain={['dataMin - 900', 'dataMax + 600']}/><Tooltip contentStyle={{ background: '#0b1633', border: '1px solid rgba(54,185,255,.35)', borderRadius: 9 }} labelStyle={{ color: '#a7acbe' }} formatter={(value: number) => [`${value.toLocaleString('ru-RU')} USDT`, 'Стоимость']}/><Area type="monotone" dataKey="value" stroke="#22bfff" strokeWidth={2} fill="url(#portfolio-fill)" activeDot={{ r: 5, stroke: '#ddf8ff', strokeWidth: 2, fill: '#20bcff' }} /></AreaChart></ResponsiveContainer></div>
      </section>
      <section className="overview-events">
        <div><p className="section-label">СОБЫТИЯ</p><h2>Ближайшее</h2></div>
        <Event title="Еженедельный отчёт" meta="Orion Capital Strategy" value="13 авг · через 7 дней" />
        <Event title="Выплата дохода" meta="Beta Income Strategy" value="20 авг · +420,00 USDT" positive />
        <Event title="Окно вывода" meta="Delta Diversified Strategy" value="27 авг · разрешён перевод" />
        <div className="overview-actions"><a href="/investor/offers">Маркет стратегий <ArrowUpRight size={15}/></a><a href="/investor/funds">Управление средствами <ArrowUpRight size={15}/></a></div>
      </section>
      </section>
      <section className="positions"><div className="positions-title"><h2>СТРАТЕГИИ В ПОРТФЕЛЕ</h2><span>4 активные стратегии</span></div><div className="position-head"><span>СТРАТЕГИЯ</span><span>ТЕКУЩАЯ СТОИМОСТЬ</span><span>РЕЗУЛЬТАТ</span><span>ПОКРЫТИЕ</span><span>ПОСЛЕДНИЙ ОТЧЁТ</span><span></span></div>{positions.map(([mark, name, status, current, pnl, percent, coverage, report, subtitle, state]) => <article className={`position ${active === name ? 'current' : ''}`} key={name} tabIndex={0} role="button" onClick={() => setActive(name)} onKeyDown={(event) => { if (event.key === 'Enter') setActive(name) }}><div className="strategy"><i>{mark}</i><span><b>{name}</b><small className={`state ${state}`}><em />{state === 'warn' ? 'Наблюдаем: запас покрытия снижен' : 'Работает нормально'}</small></span></div><span>{current} <small>USDT</small></span><span className="profit">{pnl} <small>USDT</small><br/>{percent}</span><strong className={state === 'warn' ? 'coverage-warn' : ''}>{coverage}<small>{state === 'warn' ? 'Наблюдаем' : 'Норма'}</small></strong><span className="report"><b>{report}</b><button onClick={(event) => { event.stopPropagation(); navigate('/investor/portfolio?tab=reports') }}>Последний отчёт</button></span><span className="open-detail">↗</span></article>)}<footer>Показаны все стратегии (4) <Info size={15}/></footer></section>
    </section>
  </main>
}

function Metric({ label, value, detail, note }: {label:string;value:string;detail?:string;note?:string}) { return <div className="metric"><p>{label}</p><b>{value} <small>USDT</small></b>{detail ? <em>{detail}</em> : <span>{note}</span>}</div> }
function Event({ title, meta, value, positive }: {title:string;meta:string;value:string;positive?:boolean}) { return <div className="event"><i/><div><b>{title}</b><span>{meta}</span><em className={positive ? 'positive' : ''}>{value}</em></div></div> }
