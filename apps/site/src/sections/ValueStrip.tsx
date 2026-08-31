import { Globe2, LockKeyhole, ShieldCheck, UsersRound } from 'lucide-react'

const items = [
  { icon: ShieldCheck, title: 'ПРОЗРАЧНОСТЬ', text: 'Полная информация и контроль над капиталом' },
  { icon: UsersRound, title: 'КЛИЕНТООРИЕНТИРОВАННОСТЬ', text: 'Индивидуальный подход и персональные решения' },
  { icon: LockKeyhole, title: 'ТЕХНОЛОГИЧНОСТЬ', text: 'Интеллектуальные системы поддерживают каждое решение' },
  { icon: Globe2, title: 'ГЛОБАЛЬНЫЕ ВОЗМОЖНОСТИ', text: 'Широкий доступ к инструментам по всему миру' },
]

export function ValueStrip() {
  return <section className="value-strip" id="how">{items.map(({ icon: Icon, title, text }) => <article className="value-item" key={title}><Icon /><div><h3>{title}</h3><p>{text}</p></div></article>)}</section>
}
