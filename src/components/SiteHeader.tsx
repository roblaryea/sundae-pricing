import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Brand/Logo';
import { ThemeToggle } from './shared/ThemeToggle';
import { LEGAL } from '../config/legal';
import { localeNames, supportedLocales, useLocale, type PricingLocale } from '../contexts/LocaleContext';

export function SiteHeader() {
  const { locale, setLocale, messages } = useLocale();
  const location = useLocation();
  const isSimulator = location.pathname === '/simulator';

  return (
    <header className="sticky top-0 z-50 py-4 md:py-6 px-4 md:px-8 border-b border-white/10 bg-sundae-dark/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Logo */}
        <div className="min-w-0">
          <a href={LEGAL.website} className="block">
            <Logo size="lg" />
          </a>
          <p className="text-xs md:text-sm text-sundae-muted mt-1 hidden sm:block">
            {isSimulator ? messages.header.simulator : messages.header.platform}
          </p>
        </div>
        
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
              className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-primary text-white text-xs md:text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              {messages.header.instantQuote}
            </Link>
          )}
          
          {/* Book Demo CTA */}
          <a
            href={LEGAL.demoUrl}
            className="px-3 py-1.5 md:px-4 md:py-2 border border-white/20 text-white text-xs md:text-sm font-medium rounded-lg hover:bg-white/5 transition-colors"
          >
            {messages.header.bookDemo}
          </a>

          <label className="hidden sm:inline-flex items-center">
            <span className="sr-only">Language</span>
            <select
              value={locale}
              onChange={(event) => setLocale(event.target.value as PricingLocale)}
              className="rounded-lg border border-white/15 bg-sundae-surface px-2 py-1.5 text-xs text-sundae-muted outline-none transition-colors hover:text-white"
              aria-label="Language"
            >
              {supportedLocales.map((item) => (
                <option key={item} value={item}>
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
