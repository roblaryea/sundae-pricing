import { useConfiguration } from '../hooks/useConfiguration';
import { Globe2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Brand/Logo';
import { ThemeToggle } from './shared/ThemeToggle';
import { getMarketingUrl } from '../config/legal';
import { localeNames, supportedLocales, useLocale, type PricingLocale } from '../contexts/LocaleContext';
import { generatedAuxiliaryLocalePacks } from '../lib/generatedAuxiliaryLocalePacks';
import { siteNavLabels, siteNavLinks } from '../lib/siteNavLabels';

export function SiteHeader() {
  const { locale, setLocale, messages } = useLocale();
  const location = useLocation();
  const isSimulator = location.pathname === '/simulator';
  const languageLabel =
    locale === 'ar' ? 'اللغة' :
    locale === 'fr' ? 'Langue' :
    locale === 'es' ? 'Idioma' :
    generatedAuxiliaryLocalePacks.supportCopy[locale as keyof typeof generatedAuxiliaryLocalePacks.supportCopy]?.languageLabel ??
    'Language';

  return (
    <header className="sticky top-0 z-50 py-4 md:py-6 px-4 md:px-8 border-b border-white/[0.08]">
      {/* Blur + tint live on this layer, not on <header>. `backdrop-filter`
          makes an element a containing block for its `position: fixed`
          descendants, and is the documented cause of sticky headers detaching
          and drifting during momentum scroll on iOS Safari. */}
      <div aria-hidden className="absolute inset-0 bg-sundae-dark/80 backdrop-blur-md" />
      <div className="relative max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Logo */}
        <div className="min-w-0">
          <a href={getMarketingUrl('/', locale)} className="block">
            <Logo size="md" />
          </a>
          <p className="text-xs md:text-sm text-sundae-muted mt-1 hidden sm:block">
            {isSimulator ? messages.header.simulator : messages.header.platform}
          </p>
        </div>
        
        {/* Centre: marketing-site navigation (room for it from lg up; mobile
            gets the same destinations in the footer). */}
        <nav aria-label={messages.header.platform} className="hidden lg:flex items-center gap-6 flex-shrink-0">
          {siteNavLinks.map((link) => (
            <a
              key={link.key}
              href={getMarketingUrl(link.path, locale)}
              className="text-sm text-sundae-muted hover:text-white transition-colors"
            >
              {siteNavLabels[locale][link.key]}
            </a>
          ))}
        </nav>

        {/* Right: Navigation + Theme Toggle */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {/* Pricing Link (shown on simulator page) */}
          {isSimulator && (
            <Link
              to="/"
              className="text-sm md:text-base text-sundae-muted hover:text-white transition-colors"
            >
              {messages.header.pricing}
            </Link>
          )}
          
          {/* Get Instant Quote (shown on pricing page only) */}
          {!isSimulator && (
            <Link
              to="/simulator"
              onClick={() => useConfiguration.getState().setCurrentStep(0)}
              className="max-w-24 sm:max-w-none text-center leading-tight px-3 py-1.5 md:px-4 md:py-2 bg-gradient-primary text-white text-xs md:text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              {messages.header.instantQuote}
            </Link>
          )}
          
          {/* Book Demo CTA */}
          <a
            href={getMarketingUrl('/demo', locale)}
            className="hidden sm:inline-flex px-3 py-1.5 md:px-4 md:py-2 border border-white/20 text-white text-xs md:text-sm font-medium rounded-lg hover:bg-white/5 transition-colors"
          >
            {messages.header.bookDemo}
          </a>

          <label className="relative inline-flex items-center">
            <span className="sr-only">{languageLabel}</span>
            <Globe2 size={16} aria-hidden className="pointer-events-none absolute left-2.5 text-sundae-muted sm:hidden" />
            <select
              value={locale}
              onChange={(event) => setLocale(event.target.value as PricingLocale)}
              className="h-9 w-9 sm:h-auto sm:w-auto appearance-none sm:appearance-auto rounded-lg border border-white/15 bg-sundae-surface px-2 py-1.5 text-xs text-transparent sm:text-sundae-muted outline-none focus-visible:ring-2 focus-visible:ring-sundae-accent transition-colors"
              aria-label={languageLabel}
            >
              {supportedLocales.map((item) => (
                <option key={item} value={item} className="text-sundae-text">
                  {localeNames[item]}
                </option>
              ))}
            </select>
          </label>
          
          {/* Theme toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
