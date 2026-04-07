import { LEGAL, getMarketingUrl } from '../config/legal';
import { useLocale } from '../contexts/LocaleContext';

export function SiteFooter() {
  const { messages, locale } = useLocale();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: messages.footer.privacy, href: getMarketingUrl('/privacy', locale) },
    { label: messages.footer.terms, href: getMarketingUrl('/terms', locale) },
    { label: messages.footer.contact, href: getMarketingUrl('/contact', locale) },
    { label: messages.footer.demo, href: getMarketingUrl('/demo', locale) },
  ];

  return (
    <footer className="border-t border-white/10 bg-sundae-dark/50 mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-sundae-muted">
            &copy; {currentYear} {LEGAL.legalName}
          </p>

          {/* Links */}
          <nav className="flex items-center gap-6">
            {footerLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-sundae-muted hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
