import { ChevronDown } from 'lucide-react'

function MiniMark() {
  return (
    <svg viewBox="0 0 62 62" aria-hidden="true" className="brand-mark">
      <defs>
        <linearGradient id="logoGradient" x1="8" y1="9" x2="54" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#095BF4" />
          <stop offset="0.58" stopColor="#00A9E8" />
          <stop offset="1" stopColor="#22C873" />
        </linearGradient>
      </defs>
      <path d="M31 5 56 49H44L31 27 18 49H6L31 5Z" fill="url(#logoGradient)" />
      <path d="m17 50 14-9 14 9H17Z" fill="#0B2C68" opacity=".92" />
      <path d="M31 27v14" stroke="white" strokeWidth="2" opacity=".85" />
    </svg>
  )
}

export function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Trigonum Broker">
        <MiniMark />
        <span className="brand-name">TRIGONUM</span>
        <span className="brand-divider" />
        <span className="brand-product">BROKER</span>
      </a>

      <nav className="main-nav" aria-label="Основная навигация">
        <a href="#products">ПРОДУКТЫ <ChevronDown size={14} /></a>
        <a href="#how">КАК ЭТО РАБОТАЕТ</a>
        <a href="#business">ДЛЯ БИЗНЕСА</a>
        <a href="#private">ДЛЯ ЧАСТНЫХ ЛИЦ</a>
        <a href="#compliance">КОМПЛАЕНС</a>
        <a href="#about">О НАС</a>
        <a href="#faq">FAQ</a>
      </nav>

      <div className="header-actions">
        <a className="button button-secondary compact" href="#login">ВОЙТИ</a>
        <a className="button button-primary compact" href="#open-account">ОТКРЫТЬ СЧЁТ</a>
      </div>
    </header>
  )
}
