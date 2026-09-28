import { useI18n } from '../i18n/I18nProvider'
import { landingContent } from '../content/landingOfficial'
import { cabinetUrl, onboardingUrl } from '../lib/appLinks'

export function SiteFooter() {
  const { language } = useI18n()
  const { footer } = landingContent(language)

  return (
    <footer className="site-footer" id="about">
      <div className="footer-cta">
        <p>МАРШРУТ НАЧИНАЕТСЯ<br />С ОДНОГО РЕШЕНИЯ —</p>
        <h2>СДЕЛАЙТЕ ПЕРВЫЙ ШАГ</h2>
        <span>
          Регистрация занимает несколько минут. После предоставления необходимых документов
          заявка проходит комплаенс-проверку. Средства принимаются только после открытия счёта.
        </span>
        <div className="footer-actions">
          <a className="button button-primary" href={onboardingUrl()}>Открыть счёт</a>
          <a className="button button-secondary" href={cabinetUrl()}>Войти в кабинет</a>
        </div>
      </div>

      <div className="footer-legal">
        <p className="footer-rights">{footer.rights}</p>
        <p className="footer-risk">{footer.risk}</p>
        <nav className="footer-docs" aria-label="Документы">
          {footer.docs.map((doc) => <a key={doc} href="#docs">{doc}</a>)}
        </nav>
      </div>
    </footer>
  )
}
