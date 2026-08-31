import { BadgeCheck, FileBadge2, Headphones, ShieldCheck } from 'lucide-react'

export function TrustStrip() {
  return (
    <section className="trust-strip" id="compliance">
      <article><div className="seal"><ShieldCheck /></div><div><h3>РЕГУЛИРУЕМЫЙ БРОКЕР</h3><p>Работаем в соответствии<br />с применимыми требованиями</p></div></article>
      <article><FileBadge2 /><div><h3>ЛИЦЕНЗИРОВАНИЕ</h3><p>Инвестиционная деятельность<br />в рамках лицензируемой модели</p></div></article>
      <article className="standards"><BadgeCheck /><div><h3>СООТВЕТСТВИЕ МЕЖДУНАРОДНЫМ СТАНДАРТАМ</h3><div className="standard-labels"><b>AML</b><b>KYC</b><b>SECURITY</b></div></div></article>
      <article><Headphones /><div><h3>ПОДДЕРЖКА 24/7</h3><p>Персональная поддержка<br />на каждом этапе</p></div></article>
    </section>
  )
}
