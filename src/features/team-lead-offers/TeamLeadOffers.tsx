import { useState } from 'react'
import { ArrowLeft, ArrowUpRight, Check, ChevronDown, FileText, Plus, Save, ShieldCheck, SlidersHorizontal, Users, X } from 'lucide-react'
import './team-lead-offers.css'

type Status = 'published' | 'draft' | 'archive'
type Offer = { id: string; title: string; subtitle: string; status: Status; min: string; term: string; investorShare: string; leadFee: string; platformFee: string; escrow: string; coverage: string; report: string; withdrawal: string; applications: number; investors: number; tone: string }

const initialOffers: Offer[] = [
  { id: 'orion', title: 'Orion Capital Strategy', subtitle: 'Сбалансированная мультифакторная стратегия', status: 'published', min: '10 000', term: '12 месяцев', investorShare: '80', leadFee: '15', platformFee: '5', escrow: '3 500', coverage: '150', report: 'Ежемесячно', withdrawal: 'Раз в квартал', applications: 3, investors: 7, tone: 'violet' },
  { id: 'alpha', title: 'Alpha Quant Strategy', subtitle: 'Алгоритмический подход с контролем риска', status: 'published', min: '5 000', term: '6 месяцев', investorShare: '82', leadFee: '13', platformFee: '5', escrow: '2 000', coverage: '150', report: 'Ежемесячно', withdrawal: 'Раз в месяц', applications: 1, investors: 4, tone: 'blue' },
  { id: 'delta', title: 'Delta Diversified Strategy', subtitle: 'Диверсифицированный портфель рыночных идей', status: 'draft', min: '15 000', term: '12 месяцев', investorShare: '78', leadFee: '17', platformFee: '5', escrow: '4 500', coverage: '150', report: 'Ежемесячно', withdrawal: 'Раз в квартал', applications: 0, investors: 0, tone: 'amber' },
]

const emptyOffer: Offer = { id: '', title: '', subtitle: '', status: 'draft', min: '10 000', term: '12 месяцев', investorShare: '80', leadFee: '15', platformFee: '5', escrow: '3 500', coverage: '150', report: 'Ежемесячно', withdrawal: 'Раз в квартал', applications: 0, investors: 0, tone: 'violet' }
const statusLabel: Record<Status, string> = { published: 'Опубликовано', draft: 'Черновики', archive: 'Архив' }

export function TeamLeadOffers() {
  const [offers, setOffers] = useState(initialOffers)
  const [tab, setTab] = useState<Status>('published')
  const [editing, setEditing] = useState<Offer | null>(null)
  const [opened, setOpened] = useState<Offer | null>(null)
  const [notice, setNotice] = useState('')
  const filtered = offers.filter(offer => offer.status === tab)

  const saveOffer = (publish: boolean) => {
    if (!editing) return
    const next = { ...editing, id: editing.id || `offer-${Date.now()}`, status: publish ? 'published' as Status : 'draft' as Status }
    setOffers(current => current.some(offer => offer.id === next.id) ? current.map(offer => offer.id === next.id ? next : offer) : [next, ...current])
    setEditing(null)
    setTab(next.status)
    setNotice(publish ? 'Предложение опубликовано и доступно инвесторам' : 'Черновик сохранён')
  }

  return <main className="tl-offers">
    <header className="tl-offers-head">
      <div><p>ПРОДУКТЫ ДЛЯ ИНВЕСТОРОВ</p><h2>Предложения</h2><span>Создавайте условия, принимайте заявки и ведите договоры в контексте стратегии.</span></div>
      <button className="tl-primary" onClick={() => setEditing({ ...emptyOffer })}><Plus size={17} /> Создать предложение</button>
    </header>

    {editing ? <OfferEditor value={editing} onChange={setEditing} onClose={() => setEditing(null)} onSave={saveOffer} /> : <>
      <nav className="tl-offer-tabs">{(Object.keys(statusLabel) as Status[]).map(key => <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{statusLabel[key]} <em>{offers.filter(offer => offer.status === key).length}</em></button>)}</nav>
      <section className="tl-offer-summary"><span><FileText /><b>{offers.filter(offer => offer.status === 'published').length}</b> активных предложений</span><span><Users /><b>{offers.reduce((sum, offer) => sum + offer.investors, 0)}</b> инвесторов участвуют</span><button onClick={() => { setTab('published'); setNotice('В разделе «Инвестиции» будет показана связка инвестор → стратегия') }}>Открыть инвестиции <ArrowUpRight size={15} /></button></section>
      <section className="tl-offer-grid">{filtered.map(offer => <OfferCard key={offer.id} offer={offer} onOpen={() => setOpened(offer)} onEdit={() => setEditing({ ...offer })} />)}{filtered.length === 0 && <div className="tl-offer-empty"><FileText /><b>Здесь пока нет предложений</b><span>Создайте новое предложение или верните его из архива.</span></div>}</section>
    </>}
    {opened && <OfferDetails offer={opened} close={() => setOpened(null)} onEdit={() => { setOpened(null); setEditing({ ...opened }) }} />}
    {notice && <div className="tl-offer-toast"><Check size={16} /> {notice}<button onClick={() => setNotice('')}><X size={15} /></button></div>}
  </main>
}

function OfferCard({ offer, onOpen, onEdit }: { offer: Offer; onOpen: () => void; onEdit: () => void }) {
  return <article className={`tl-offer-card ${offer.tone}`}>
    <div className="tl-offer-art"><span>{offer.status === 'published' ? 'Открыт набор' : offer.status === 'draft' ? 'Черновик' : 'Архив'}</span><i /></div>
    <div className="tl-offer-card-body"><p>{offer.subtitle}</p><h3>{offer.title}</h3><div className="tl-offer-terms"><span>От <b>{offer.min} USDT</b></span><span>Срок <b>{offer.term}</b></span><span>Доля инвестора <b>{offer.investorShare}%</b></span></div><div className="tl-offer-meta"><span><Users size={14} /> {offer.investors} инвесторов</span><span className={offer.applications ? 'new' : ''}>{offer.applications ? `${offer.applications} новые заявки` : 'Заявок нет'}</span></div><footer><button onClick={onEdit}>Редактировать</button><button aria-label="Открыть предложение" onClick={onOpen}><ArrowUpRight size={18} /></button></footer></div>
  </article>
}

function OfferEditor({ value, onChange, onClose, onSave }: { value: Offer; onChange: (offer: Offer) => void; onClose: () => void; onSave: (publish: boolean) => void }) {
  const set = (key: keyof Offer, next: string) => onChange({ ...value, [key]: next })
  const distribution = Number(value.investorShare) + Number(value.leadFee) + Number(value.platformFee)
  const publishable = Boolean(value.title.trim() && value.subtitle.trim() && distribution === 100)
  return <section className="tl-editor">
    <header><button className="tl-back" onClick={onClose}><ArrowLeft size={16} /> К предложениям</button><div><p>НОВОЕ ПРЕДЛОЖЕНИЕ</p><h3>{value.id ? 'Редактирование условий' : 'Условия для инвесторов'}</h3></div></header>
    <div className="tl-editor-layout"><div className="tl-editor-form">
      <FormGroup title="Позиционирование" icon={<SlidersHorizontal />}><label>Название<input value={value.title} onChange={event => set('title', event.target.value)} placeholder="Например, Orion Capital Strategy" /></label><label>Краткое описание<textarea value={value.subtitle} onChange={event => set('subtitle', event.target.value)} placeholder="Какую инвестиционную идею получает инвестор" /></label></FormGroup>
      <FormGroup title="Базовые условия" icon={<FileText />}><div className="tl-fields"><label>Минимальная сумма, USDT<input value={value.min} onChange={event => set('min', event.target.value)} /></label><SelectField label="Срок договора" value={value.term} onChange={next => set('term', next)} options={['3 месяца', '6 месяцев', '12 месяцев', 'Без срока']} /><SelectField label="Отчётность" value={value.report} onChange={next => set('report', next)} options={['Еженедельно', 'Ежемесячно', 'Ежеквартально']} /><SelectField label="Порядок вывода" value={value.withdrawal} onChange={next => set('withdrawal', next)} options={['Раз в месяц', 'Раз в квартал', 'По завершении срока']} /></div></FormGroup>
      <FormGroup title="Распределение положительного результата" icon={<Users />}><div className="tl-fields triple"><label>Инвестору, %<input value={value.investorShare} inputMode="numeric" onChange={event => set('investorShare', event.target.value)} /></label><label>Тимлиду, %<input value={value.leadFee} inputMode="numeric" onChange={event => set('leadFee', event.target.value)} /></label><label>Платформе, %<input value={value.platformFee} inputMode="numeric" onChange={event => set('platformFee', event.target.value)} /></label></div><small className={distribution === 100 ? 'valid' : 'invalid'}>{distribution === 100 ? '✓ Распределение составляет 100%.' : `Сейчас ${distribution}%. Доли должны составлять 100%.`}</small><p className="tl-form-hint">Вознаграждение рассчитывается только с нового положительного результата выше High-Water Mark.</p></FormGroup>
      <FormGroup title="Escrow и обеспечение комиссии" icon={<ShieldCheck />}><div className="tl-fields"><label>Стартовый escrow, USDT<input value={value.escrow} onChange={event => set('escrow', event.target.value)} /></label><label>Требуемое покрытие, %<input value={value.coverage} inputMode="numeric" onChange={event => set('coverage', event.target.value)} /></label></div><p className="tl-form-hint">Требуемый escrow: max(стартовый escrow, начисленное вознаграждение × {Number(value.coverage || 0) / 100}). Инвестиционный капитал хранится отдельно.</p></FormGroup>
      <footer><button className="tl-quiet" onClick={() => onSave(false)}><Save size={16} /> Сохранить черновик</button><button className="tl-primary" disabled={!publishable} onClick={() => onSave(true)}>Опубликовать <ArrowUpRight size={16} /></button></footer>
    </div><OfferPreview offer={value} /></div>
  </section>
}

function FormGroup({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) { return <section className="tl-form-group"><h4>{icon} {title}</h4>{children}</section> }
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (next: string) => void; options: string[] }) { return <label>{label}<span className="tl-select"><select value={value} onChange={event => onChange(event.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select><ChevronDown size={15} /></span></label> }

function OfferPreview({ offer }: { offer: Offer }) { return <aside className={`tl-preview ${offer.tone}`}><p>ПРЕДПРОСМОТР ДЛЯ ИНВЕСТОРА</p><div className="tl-preview-art"><span>{offer.title || 'Название стратегии'}</span><i /></div><h4>{offer.title || 'Название стратегии'}</h4><small>{offer.subtitle || 'Краткое описание появится здесь.'}</small><div><span>Минимальная сумма<b>{offer.min} USDT</b></span><span>Срок<b>{offer.term}</b></span><span>Отчётность<b>{offer.report}</b></span></div><footer><b>{offer.investorShare}%</b><span>доля инвестора от положительного результата</span></footer><em>Условия и риски инвестирования будут доступны до подачи заявки.</em></aside> }

function OfferDetails({ offer, close, onEdit }: { offer: Offer; close: () => void; onEdit: () => void }) { return <div className="tl-offer-modal"><button className="tl-modal-backdrop" onClick={close} aria-label="Закрыть" /><section><button className="tl-modal-close" onClick={close}><X /></button><div className={`tl-detail-cover ${offer.tone}`}><span>{offer.title}</span></div><div className="tl-detail-body"><p>ПРЕДЛОЖЕНИЕ И УСЛОВИЯ ДОГОВОРА</p><h3>{offer.title}</h3><small>{offer.subtitle}</small><div className="tl-detail-grid"><span>Минимальная сумма<b>{offer.min} USDT</b></span><span>Срок<b>{offer.term}</b></span><span>Распределение<b>{offer.investorShare}% / {offer.leadFee}% / {offer.platformFee}%</b></span><span>Escrow<b>{offer.escrow} USDT · покрытие {offer.coverage}%</b></span><span>Отчётность<b>{offer.report}</b></span><span>Вывод<b>{offer.withdrawal}</b></span></div><button className="tl-primary" onClick={onEdit}>Редактировать условия <ArrowUpRight size={16} /></button></div></section></div> }
