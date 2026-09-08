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
 * Порядок блоков отвечает на возражения в том порядке, в котором они
 * возникают: кто вы → кому подотчётны → где мои деньги → как заберу →
 * сколько возьмёте → сколько заработаю. Обоснование — docs/landing-structure.md.
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
        <TiersSection />
        <OpenAccountSection />
        <ComplianceSection />
        <FaqSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  )
}
