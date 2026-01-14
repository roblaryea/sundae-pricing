import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Brand/Logo';
import { ThemeToggle } from './shared/ThemeToggle';

export function SiteHeader() {
  const location = useLocation();
  const isSimulator = location.pathname === '/simulator';

  return (
    <header className="sticky top-0 z-50 py-4 md:py-6 px-4 md:px-8 border-b border-white/10 bg-sundae-dark/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Logo */}
        <div className="min-w-0">
          <a href="https://sundae.io" className="block">
            <Logo size="lg" />
          </a>
          <p className="text-xs md:text-sm text-sundae-muted mt-1 hidden sm:block">
            {isSimulator ? 'Pricing Simulator' : 'Decision Intelligence Platform'}
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
              Pricing
            </Link>
          )}
          
          {/* Get Instant Quote (shown on pricing page only) */}
          {!isSimulator && (
            <Link
              to="/simulator"
              className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-primary text-white text-xs md:text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Get Instant Quote
            </Link>
          )}
          
          {/* Book Demo CTA */}
          <a
            href="https://sundae.io/demo"
            className="px-3 py-1.5 md:px-4 md:py-2 border border-white/20 text-white text-xs md:text-sm font-medium rounded-lg hover:bg-white/5 transition-colors"
          >
            Book Demo
          </a>
          
          {/* Theme toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
