import '@fontsource/golos-text/400.css'
import '@fontsource/golos-text/600.css'
import '@fontsource/golos-text/700.css'
import './styles/index.css'
import './styles/interactions.css'
import './styles/localization.css'
import './styles/brand-fix.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app/App'
import { I18nProvider } from './i18n/I18nProvider'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </I18nProvider>
  </StrictMode>,
)
