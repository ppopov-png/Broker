import { useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowUpRight, CheckCheck, ChevronLeft, MoreHorizontal, Paperclip, Search, Send, Smile, X } from 'lucide-react'
import './investor-messages.css'

type Thread = { id:string; name:string; initials:string; preview:string; time:string; online?:boolean; unread?:number; color:string; strategy:string }
type Message = { id:number; text:string; mine?:boolean; time:string; attachment?:string }

const baseThreads: Thread[] = [
  { id:'orion', name:'Orion Capital', initials:'OC', preview:'Готовы уточнить условия участия', time:'10:15', online:true, color:'violet', strategy:'Orion Capital Strategy' },
  { id:'alpha', name:'Alpha Quant', initials:'AQ', preview:'Ежемесячный отчёт опубликован', time:'Вчера', unread:2, color:'blue', strategy:'Alpha Quant Strategy' },
  { id:'support', name:'Поддержка Trigonum', initials:'T', preview:'Поможем с кошельками и договорами', time:'Пн', color:'green', strategy:'Поддержка' },
  { id:'beta', name:'Beta Income', initials:'BI', preview:'Окно вывода откроется 20 августа', time:'Пн', color:'amber', strategy:'Beta Income Strategy' },
]

const seed = (offer:string):Message[] => [
  { id:1, text:`Здравствуйте! Готовы ответить на вопросы по стратегии «${offer}» и условиям участия.`, time:'10:08' },
  { id:2, text:'Спасибо. Хочу уточнить порядок вывода и следующий отчёт.', mine:true, time:'10:11' },
  { id:3, text:'Следующий отчёт будет опубликован 13 августа. Для вывода действует порядок, указанный в договоре.', time:'10:15' },
]

export function InvestorMessages() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const requestedTeam = params.get('team') || 'Orion Capital'
  const requestedOffer = params.get('offer') || 'Orion Capital Strategy'
  const initial = baseThreads.some(thread => thread.name === requestedTeam) ? baseThreads.find(thread => thread.name === requestedTeam)!.id : 'incoming'
  const [active, setActive] = useState(initial)
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState(`Здравствуйте! Хочу уточнить условия по стратегии «${requestedOffer}».`)
  const [messages, setMessages] = useState<Record<string, Message[]>>({ incoming: seed(requestedOffer), orion: seed('Orion Capital Strategy'), alpha: [{ id:1, text:'Ежемесячный отчёт за июль опубликован и доступен в портфеле.', time:'Вчера' }], support: [{ id:1, text:'Здравствуйте! Чем можем помочь?', time:'Пн' }], beta: [{ id:1, text:'Напоминаем: окно вывода откроется 20 августа.', time:'Пн' }] })
  const fileRef = useRef<HTMLInputElement>(null)
  const threads = useMemo(() => active === 'incoming' ? [{ id:'incoming', name:requestedTeam, initials:requestedTeam.slice(0,2).toUpperCase(), preview:`Вопрос по «${requestedOffer}»`, time:'сейчас', online:true, color:'violet', strategy:requestedOffer }, ...baseThreads] : baseThreads, [active, requestedOffer, requestedTeam])
  const visible = threads.filter(thread => `${thread.name} ${thread.preview}`.toLowerCase().includes(query.toLowerCase()))
  const current = threads.find(thread => thread.id === active) || threads[0]
  const currentMessages = messages[active] || []
  const send = () => { const text = draft.trim(); if (!text) return; setMessages(items => ({ ...items, [active]: [...(items[active] || []), { id:Date.now(), text, mine:true, time:new Date().toLocaleTimeString('ru-RU', { hour:'2-digit', minute:'2-digit' }) }] })); setDraft('') }
  const attach = (event:React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; setMessages(items => ({ ...items, [active]: [...(items[active] || []), { id:Date.now(), text:'Прикреплён файл', attachment:file.name, mine:true, time:new Date().toLocaleTimeString('ru-RU', { hour:'2-digit', minute:'2-digit' }) }] })); event.target.value = '' }
  return <main className="telegram">
    <aside className="tg-sidebar"><div className="tg-sidebar-head"><div><p>СООБЩЕНИЯ</p><h2>Диалоги</h2></div><button title="Новый диалог" onClick={() => { setActive('support'); setDraft('Здравствуйте! Нужна помощь.') }}>✎</button></div><label className="tg-search"><Search size={16}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Поиск"/>{query && <button onClick={() => setQuery('')}><X size={13}/></button>}</label><div className="tg-threads">{visible.map(thread => <button key={thread.id} className={`tg-thread ${active === thread.id ? 'active' : ''}`} onClick={() => { setActive(thread.id); setDraft('') }}><span className={`tg-avatar ${thread.color}`}>{thread.initials}</span><div><header><b>{thread.name}</b><time>{thread.time}</time></header><p>{thread.preview}</p></div>{thread.unread && <i>{thread.unread}</i>}</button>)}</div></aside>
    <section className="tg-chat"><header className="tg-chat-head"><div><button className="tg-back" onClick={() => setActive('support')}><ChevronLeft/></button><span className={`tg-avatar ${current.color}`}>{current.initials}</span><div><b>{current.name}</b><small>{current.online ? 'в сети · ответит в рабочее время' : current.strategy}</small></div></div><div><button title="Открыть стратегию" onClick={() => navigate(current.id === 'support' ? '/investor/funds' : '/investor/offers')}><ArrowUpRight/></button><button title="Действия диалога" onClick={() => setDraft('Спасибо! Нужна дополнительная информация по условиям.') }><MoreHorizontal/></button></div></header><div className="tg-context"><b>{current.strategy}</b><span>{current.id === 'support' ? 'Поддержка поможет с кошельками, договорами, входом и работой приложения.' : 'Диалог по стратегии: можно обсудить условия, отчёты, сроки и порядок вывода.'}</span></div><div className="tg-messages"><div className="tg-date">Сегодня</div>{currentMessages.map(message => <div key={message.id} className={`tg-bubble ${message.mine ? 'mine' : ''}`}>{message.attachment && <div className="tg-attachment"><Paperclip/><span>{message.attachment}</span></div>}<p>{message.text}</p><time>{message.time}{message.mine && <CheckCheck size={14}/>}</time></div>)}</div><footer className="tg-composer"><input ref={fileRef} type="file" hidden onChange={attach}/><button title="Прикрепить файл" onClick={() => fileRef.current?.click()}><Paperclip/></button><button title="Добавить эмодзи" onClick={() => setDraft(value => `${value} 🙂`)}><Smile/></button><textarea value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send() } }} placeholder="Напишите сообщение…"/><button className="tg-send" title="Отправить" disabled={!draft.trim()} onClick={send}><Send/></button></footer></section>
  </main>
}
