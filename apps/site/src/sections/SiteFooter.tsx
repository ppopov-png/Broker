import { useI18n } from '../i18n/I18nProvider'
import { landingContent } from '../content/landingOfficial'

export function SiteFooter() {
  const { language } = useI18n()
  const { footer } = landingContent(language)

  return (
    <footer className="site-footer" id="about">
      <p className="footer-risk">{footer.risk}</p>
      <nav className="footer-docs" aria-label="Документы">
        {footer.docs.map((doc) => <a key={doc} href="#docs">{doc}</a>)}
      </nav>
      <p className="footer-rights">{footer.rights}</p>
    </footer>
  )
}
