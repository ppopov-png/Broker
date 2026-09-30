import { Header } from '../../widgets/Header'
import { FloatingLiveEarningsTicker } from '../../widgets/LiveEarningsTicker'
import { ComplianceSection } from '../../sections/ComplianceSection'
import { CustodySection } from '../../sections/CustodySection'
import { FaqSection } from '../../sections/FaqSection'
import { FeesSection } from '../../sections/FeesSection'
import { HeroSection } from '../../sections/HeroSection'
import { HowItWorksSection } from '../../sections/HowItWorksSection'
import { OpenAccountSection } from '../../sections/OpenAccountSection'
import { ProductMatcherSection } from '../../sections/ProductMatcherSection'
import { ProductsSection } from '../../sections/ProductsSection'
import { ResultsSection } from '../../sections/ResultsSection'
import { SiteFooter } from '../../sections/SiteFooter'
import { StatsStrip } from '../../sections/StatsStrip'
import { TiersSection } from '../../sections/TiersSection'
import { WhyTrigonumSection } from '../../sections/WhyTrigonumSection'
import '../../styles/figma.css'
import '../../styles/mobile-figma-exact.css'
import '../../styles/figma-final.css'
import '../../styles/landing-v2.css'

export function HomePage() {
  return (
    <div className="broker-site v2-broker-site">
      <Header />
      <FloatingLiveEarningsTicker />
      <main>
        <HeroSection />
        <StatsStrip />
        <WhyTrigonumSection />
        <ProductsSection />
        <ProductMatcherSection />
        <HowItWorksSection />
        <ResultsSection />
        <FeesSection />
        <CustodySection />
        <ComplianceSection />
        <TiersSection />
        <OpenAccountSection />
        <FaqSection />
      </main>
      <SiteFooter />
    </div>
  )
}
