import { Header } from '../../widgets/Header'
import { HeroSection } from '../../sections/HeroSection'
import { ProductsSection } from '../../sections/ProductsSection'
import { TrustStrip } from '../../sections/TrustStrip'
import { ValueStrip } from '../../sections/ValueStrip'

export function HomePage() {
  return (
    <div className="broker-site">
      <Header />
      <main>
        <HeroSection />
        <ValueStrip />
        <ProductsSection />
      </main>
      <TrustStrip />
    </div>
  )
}
