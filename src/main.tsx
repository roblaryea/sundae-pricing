import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext'
import { LocaleProvider } from './contexts/LocaleContext'
import { hydrateLivePricingCatalog } from './data/livePricing'
import { initAnalyticsIfConsented } from './lib/analytics'

// Start the existing validated request before route chunks and React effects.
void hydrateLivePricingCatalog()

// Only initialize analytics if user has already consented
initAnalyticsIfConsented()

// Listen for future consent grants
window.addEventListener('sundae_consent_change', (e) => {
  if ((e as CustomEvent).detail === 'accepted') {
    initAnalyticsIfConsented()
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocaleProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </LocaleProvider>
  </StrictMode>,
)
