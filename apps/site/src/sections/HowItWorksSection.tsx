import resultXs from '../shared/ui/result-bg-xs 1.png'
import resultS from '../shared/ui/result-bg-s 1.png'
import resultM from '../shared/ui/result-bg-m 1.png'
import resultL from '../shared/ui/result-bg-l 1.png'

const RESULT_CARDS = [
  {
    index: '01',
    title: 'Командная торговля',
    text: 'Идеи оценивают аналитики и риск-специалисты, ключевые решения принимает инвесткомитет.',
  },
  {
    index: '02',
    title: 'Алгоритмическая торговля',
    text: 'Модели анализируют рынок и помогают исполнять одобренные решения по заданным правилам.',
  },
  {
    index: '03',
    title: 'ИИ-система TAIS',
    text: 'Аналитическая система сопоставляет рыночные данные и новости, помогая команде проверять гипотезы.',
  },
  {
    index: '04',
    title: 'Ваша ликвидность',
    text: 'Средства инвесторов обеспечивают объём для одобренных операций и диверсификации.',
  },
]

export function HowItWorksSection() {
  return (
    <section className="how-section result-process" id="how">
      <header className="section-head result-process-head">
        <h2>КАК ФОРМИРУЕТСЯ<br />ИНВЕСТИЦИОННЫЙ РЕЗУЛЬТАТ</h2>
        <p>Результат формируется за счёт сочетания профессионального управления, алгоритмических методов, аналитической системы TAIS и доступной ликвидности.</p>
      </header>

      <div className="result-process-visual" aria-hidden="true">
        <picture className="result-process-picture">
          <source media="(max-width: 480px)" srcSet={resultXs} />
          <source media="(max-width: 768px)" srcSet={resultS} />
          <source media="(max-width: 1280px)" srcSet={resultM} />
          <img src={resultL} alt="" />
        </picture>
      </div>

      <div className="result-process-cards">
        {RESULT_CARDS.map((card) => (
          <article key={card.index}>
            <span>{card.index}</span>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
