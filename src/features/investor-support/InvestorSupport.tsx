import { useState } from 'react'
import { ChevronDown, Copy, Headphones, Mail, MessageCircle, Send, Ticket, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './investor-support.css'

const faq = [
  ['Как пополнить инвестицию?', 'Откройте «Средства», выберите кошелёк и нажмите «Пополнить». Для escrow используйте одноимённый счёт в разделе средств.'],
  ['Почему вывод недоступен?', 'Капитал в активном договоре нельзя вывести до прекращения договора. Свободный баланс доступен сразу.'],
  ['Где найти договор и отчёт?', 'Все документы и отчётность по стратегии доступны в «Портфеле» → «Отчётность».'],
  ['Как связаться с тимлидом?', 'Откройте стратегию в Маркете или Портфеле и нажмите «Написать тимлиду».'],
]

export function InvestorSupport() {
  const [open, setOpen] = useState(0); const [ticket, setTicket] = useState(false); const [text, setText] = useState(''); const [sent, setSent] = useState(''); const navigate = useNavigate()
  const email = 'support@trigonum.io'; const copy = async () => { try { await navigator.clipboard.writeText(email); setSent('Email скопирован') } catch { setSent(email) } }
  return <main className="support-page"><header><div><p>ПОДДЕРЖКА TRIGONUM</p><h2>Как можем помочь?</h2><span>Ответы по инвестициям, договорам, кошелькам и работе сервиса.</span></div><Headphones/></header><div className="support-grid"><section className="support-faq"><p>ЧАСТЫЕ ВОПРОСЫ</p>{faq.map(([question, answer], index) => <article key={question} className={open === index ? 'open' : ''}><button onClick={() => setOpen(open === index ? -1 : index)}><b>{question}</b><ChevronDown/></button>{open === index && <span>{answer}</span>}</article>)}</section><aside><section className="support-contact"><p>НЕ НАШЛИ ОТВЕТ?</p><h3>Напишите нам</h3><button className="support-email" onClick={copy}><Mail/><span>{email}<small>Нажмите, чтобы скопировать</small></span><Copy/></button><button className="support-primary" onClick={() => setTicket(true)}><Ticket/> Создать обращение</button><button className="support-text" onClick={() => navigate('/investor/messages?team=Поддержка') }><MessageCircle/> Открыть чат поддержки</button></section><section className="support-status"><i/><div><b>Сервис работает штатно</b><span>Нет известных проблем с кошельками и расчётами.</span></div></section></aside></div>{sent && <div className="support-toast">{sent}<button onClick={() => setSent('')}><X/></button></div>}{ticket && <div className="support-modal"><button className="modal-backdrop" onClick={() => setTicket(false)}/><section><button className="x" onClick={() => setTicket(false)}><X/></button><p>ОБРАЩЕНИЕ В ПОДДЕРЖКУ</p><h3>Опишите вопрос</h3><textarea value={text} onChange={event => setText(event.target.value)} placeholder="Например: не получается добавить кошелёк…"/><button disabled={!text.trim()} onClick={() => { setTicket(false); setText(''); setSent('Обращение №BR-2048 создано. Ответ придёт в чат.') }}><Send/> Отправить обращение</button></section></div>}</main>
}
