import { onboardingUrl } from '../lib/appLinks'
import { GoalCalculator } from './GoalCalculator'

const steps=[
 ['01','Регистрация','около 5 минут','Укажите имя, адрес электронной почты и пароль, затем подтвердите адрес электронной почты.'],
 ['02','Идентификация','около 10 минут','Предоставьте документ, удостоверяющий личность, и пройдите проверку личности.'],
 ['03','Анкета и документы','около 10 минут','Заполните предусмотренные анкеты и подпишите необходимые соглашения в личном кабинете.'],
 ['04','Комплаенс-проверка','до 1 рабочего дня','После отправки документов заявка проходит предусмотренные проверки.'],
]

export function OpenAccountSection(){
 return (
  <>
   <section className="account-steps-section" id="open">
    <div className="account-steps-content">
      <h2>ОТКРЫТИЕ СЧЁТА</h2>
      <ol>
       {steps.map(([index,title,time,text])=>(
        <li key={index}><span>{index}</span><div><h3>{title}</h3><b>{time}</b><p>{text}</p></div></li>
       ))}
      </ol>
      <a href={onboardingUrl()}>Начать оформление</a>
    </div>
    <div className="account-steps-art" aria-hidden="true"><span/><span/><span/></div>
   </section>

   <section className="calculator-section" id="calculator">
    <header>
      <h2>Ориентир<br/>для капитала</h2>
      <p>Укажите целевую сумму, срок инвестирования и выберите стратегию. Мы покажем, какой капитал понадобится с учётом ожидаемой доходности.</p>
    </header>
    <GoalCalculator />
   </section>
  </>
 )
}
