import { Link } from 'react-router-dom';
import { LEGAL, getMarketingUrl } from '../config/legal';
import { useLocale } from '../contexts/LocaleContext';
import { Logo } from './Brand/Logo';

// Footer chrome intentionally mirrors the marketing site's footer structure
// (brand lockup + tagline + social + link nav + legal bar) so pricing.sundae.io
// reads as the same site, not a separate product. Uses only existing localized
// strings (messages.header.* / messages.footer.*) - no new i18n keys.
export function SiteFooter() {
  const { messages, locale } = useLocale();
  const currentYear = new Date().getFullYear();

  const links = [
    { label: messages.header.pricing, kind: 'route' as const, to: '/' },
    { label: messages.header.simulator, kind: 'route' as const, to: '/simulator' },
    { label: messages.footer.demo, kind: 'external' as const, href: getMarketingUrl('/demo', locale) },
    { label: messages.footer.contact, kind: 'external' as const, href: getMarketingUrl('/contact', locale) },
    { label: messages.footer.privacy, kind: 'external' as const, href: getMarketingUrl('/privacy', locale) },
    { label: messages.footer.terms, kind: 'external' as const, href: getMarketingUrl('/terms', locale) },
  ];

  const linkClass = 'text-sm text-sundae-muted hover:text-white transition-colors';

  return (
    <footer className="border-t border-white/[0.08] bg-sundae-dark mt-16" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 lg:py-14">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          {/* Brand */}
          <div className="max-w-sm">
            <a
              href={getMarketingUrl('/', locale)}
              aria-label="Sundae - Return to homepage"
              className="inline-block transition-opacity hover:opacity-80"
            >
              <Logo size="md" />
            </a>
            <p className="text-sm text-sundae-muted mt-4 leading-relaxed">
              {messages.header.platform}
            </p>
            {/* Social */}
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://x.com/sundae_io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sundae-muted hover:text-white transition-colors"
                aria-label="Follow Sundae on X (formerly Twitter)"
              >
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/managewithsundae"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sundae-muted hover:text-white transition-colors"
                aria-label="Follow Sundae on LinkedIn"
              >
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@Sundae_io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sundae-muted hover:text-white transition-colors"
                aria-label="Subscribe to Sundae on YouTube"
              >
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-10 gap-y-2.5">
            {links.map((link) =>
              link.kind === 'route' ? (
                <Link key={link.to} to={link.to} className={linkClass}>
                  {link.label}
                </Link>
              ) : (
                <a key={link.href} href={link.href} className={linkClass}>
                  {link.label}
                </a>
              ),
            )}
          </nav>
        </div>

        {/* Legal bar */}
        <div className="border-t border-white/[0.08] mt-10 pt-6">
          <p className="text-sm text-sundae-muted text-center md:text-left">
            &copy; {currentYear} {LEGAL.legalName}
          </p>
        </div>
      </div>
    </footer>
  );
}
