import { ExternalLink } from 'lucide-react'

const REGULATOR_URL='https://fsa.gov.kg/category/%D0%B4%D0%B5%D1%8F%D1%82%D0%B5%D0%BB%D1%8C%D0%BD%D0%BE%D1%81%D1%82%D1%8C/%D0%B2%D0%B8%D1%80%D1%82%D1%83%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B5-%D0%B0%D0%BA%D1%82%D0%B8%D0%B2%D1%8B/'

const points=[
  ['01','Правовая основа','Лицензия ФСА КР','Сведения о лицензии и деятельности с виртуальными активами доступны в открытом реестре регулятора.'],
  ['02','ПРОВЕРКА КЛИЕНТА','AML · KYC · ПОД/ФТ','Идентификация клиента, проверка источника средств и предусмотренный финансовый мониторинг.'],
  ['03','ПРОЗРАЧНОСТЬ','Отчётность','В личном кабинете формируются выписки и документы по операциям в предусмотренном формате.'],
  ['04','БЕЗОПАСНОСТЬ','Контроль доступа','Критические операции подтверждаются предусмотренными методами аутентификации и внутреннего контроля.'],
]

export function ComplianceSection(){
 return (
  <section className="compliance-figma" id="compliance">
   <h2>РЕГУЛИРОВАНИЕ И КОМПЛАЕНС</h2>
   <div className="compliance-figma-layout">
    <div className="compliance-visual">
      <div className="compliance-grid-art" />
      <p>Контроль на каждом<br/>этапе процесса</p>
    </div>
    <div className="compliance-list">
      {points.map(([index,kicker,title,text],i)=>(
       <article key={index}>
        <span>{index}</span>
        <div><small>{kicker}</small><h3>{title}</h3><p>{text}</p>
        {i===0 && <a href={REGULATOR_URL} target="_blank" rel="noreferrer">Открыть реестр <ExternalLink size={14}/></a>}
        </div>
       </article>
      ))}
    </div>
   </div>
  </section>
 )
}
