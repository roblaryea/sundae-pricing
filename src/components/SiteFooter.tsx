export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: 'Privacy', href: 'https://sundae.io/privacy' },
    { label: 'Terms', href: 'https://sundae.io/terms' },
    { label: 'Contact', href: 'https://sundae.io/contact' },
    { label: 'Demo', href: 'https://sundae.io/demo' },
  ];

  return (
    <footer className="border-t border-white/10 bg-sundae-dark/50 mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-sundae-muted">
            © {currentYear} Sundae
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
