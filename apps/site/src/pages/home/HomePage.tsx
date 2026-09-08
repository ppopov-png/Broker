import { Header } from '../../widgets/Header'
import { ComplianceSection } from '../../sections/ComplianceSection'
import { CustodySection } from '../../sections/CustodySection'
import { FaqSection } from '../../sections/FaqSection'
import { FeesSection } from '../../sections/FeesSection'
import { FinalCta } from '../../sections/FinalCta'
import { HeroSection } from '../../sections/HeroSection'
import { HowItWorksSection } from '../../sections/HowItWorksSection'
import { OpenAccountSection } from '../../sections/OpenAccountSection'
import { ProductsSection } from '../../sections/ProductsSection'
import { ResultsSection } from '../../sections/ResultsSection'
import { SiteFooter } from '../../sections/SiteFooter'
import { StatsStrip } from '../../sections/StatsStrip'
import { TiersSection } from '../../sections/TiersSection'

/**
 * Порядок блоков — это порядок возражений: что вы предлагаете → почему это
 * вообще работает → чем докажете → сколько возьмёте → где лежат мои деньги →
 * кому вы подотчётны → что будет дальше → а если у меня вопрос → как начать.
 *
 * Хранение и комплаенс стоят подряд: оба отвечают на «не потеряю ли я
 * деньги», и разнесённые по странице они читались как два разных разговора.
 * Калькулятор внутри FAQ — последний шаг перед действием: он превращает
 * «интересно» в конкретную сумму, и сразу за ним идёт «как начать».
 * Обоснование — docs/landing-structure.md.
 */
export function HomePage() {
  return (
    <div className="broker-site">
      <Header />
      <main>
        <HeroSection />
        <StatsStrip />
        <ProductsSection />
        <HowItWorksSection />
        <ResultsSection />
        <FeesSection />
        <CustodySection />
        <ComplianceSection />
        <TiersSection />
        <FaqSection />
        <OpenAccountSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  )
}
