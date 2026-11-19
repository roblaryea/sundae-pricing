import { rememberPricingStepForReturn } from '../lib/pricingNavigationHistory';
import { useEffect, useRef, useState } from 'react';
import { Globe2, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useConfiguration } from '../hooks/useConfiguration';
import { Logo } from './Brand/Logo';
import { ThemeToggle } from './shared/ThemeToggle';
import { getMarketingUrl } from '../config/legal';
import { localeNames, supportedLocales, useLocale, type PricingLocale } from '../contexts/LocaleContext';
import { siteAccessibilityCopy } from '../lib/siteAccessibilityCopy';
import { siteNavLabels, siteNavLinks } from '../lib/siteNavLabels';
import { useBuyerFormatting } from '../hooks/useBuyerQuote';
import { trackPricingEvent } from '../lib/analytics';
import { focusLocationInput } from '../lib/locationInput';

export function SiteHeader() {
  const { locale, setLocale, messages } = useLocale();
  const location = useLocation();
  const locationsConfirmed = useConfiguration(state => state.locationsConfirmed);
  const navigate = useNavigate();
  const { copy, reviewCopy } = useBuyerFormatting();
  const isSimulator = location.pathname === '/simulator';
  const chromeCopy = siteAccessibilityCopy[locale];
  const labels = siteNavLabels[locale];
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const measure = () => document.documentElement.style.setProperty('--pricing-header-height', `${headerRef.current?.getBoundingClientRect().height ?? 0}px`);
    measure();
    const observer = new ResizeObserver(measure);
    if (headerRef.current) observer.observe(headerRef.current);
    return () => { observer.disconnect(); document.documentElement.style.removeProperty('--pricing-header-height'); };
  }, []);

  // Native modal focus management includes Escape and return to the opener.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!menuOpen) { dialog.close(); return; }
    dialog.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const desktop = window.matchMedia('(min-width: 1280px)');
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      document.body.style.overflow = overflow;
      desktop.removeEventListener('change', closeOnDesktop);
      dialog.close();
    };
  }, [menuOpen]);

  const navLinks = (mobile = false) => siteNavLinks.map((link) => {
    const className = mobile
      ? 'block border-b border-sundae-muted/20 py-4 text-xl font-medium text-sundae-text hover:text-sundae-accent transition-colors'
      : 'text-sm font-medium text-sundae-muted hover:text-sundae-text transition-colors whitespace-nowrap';
    return 'pricing' in link ? (
      <Link key={link.key} to="/" aria-current={location.pathname === '/' ? 'page' : undefined} className={className} onClick={() => setMenuOpen(false)}>
        {labels[link.key]}
      </Link>
    ) : (
      <a key={link.key} href={getMarketingUrl(link.path, locale)} className={className} onClick={() => setMenuOpen(false)}>
        {labels[link.key]}
      </a>
    );
  });

  const languageControl = (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{chromeCopy.language}</span>
      <Globe2 size={16} aria-hidden className="pointer-events-none absolute start-2.5 text-sundae-muted" />
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as PricingLocale)}
        className="h-10 w-28 appearance-none rounded-lg border border-sundae-muted/25 bg-sundae-dark ps-8 pe-2 text-xs text-sundae-text outline-none focus-visible:ring-2 focus-visible:ring-sundae-accent"
        aria-label={chromeCopy.language}
      >
        {supportedLocales.map((item) => <option key={item} value={item}>{localeNames[item]}</option>)}
      </select>
    </label>
  );

  return (
    <header ref={headerRef} onClickCapture={rememberPricingStepForReturn} className="sticky top-0 z-50 border-b border-sundae-muted/20">
      {/* Keep backdrop-filter off the header containing the mobile dialog. */}
      <div aria-hidden className="absolute inset-0 bg-sundae-dark/95 backdrop-blur-md" />
      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href={getMarketingUrl('/', locale)} aria-label={chromeCopy.home} className="shrink-0"><Logo size="md" /></a>
        <nav aria-label={labels.openMenu} data-site-navigation="desktop" className="hidden xl:flex items-center gap-5">{navLinks()}</nav>
        <div className="hidden xl:flex items-center gap-3">
          {languageControl}
          <ThemeToggle />
          <a href={getMarketingUrl('/sign-in', locale)} className="rounded-xl border border-sundae-muted/25 px-4 py-3 text-sm text-sundae-text hover:bg-sundae-surface-hover transition-colors whitespace-nowrap">{labels.signIn}</a>
          <a href={getMarketingUrl('/demo', locale)} className="inline-flex rounded-xl bg-gradient-primary px-4 py-3 text-sm font-semibold text-white whitespace-nowrap">{labels.bookDemo}</a>
        </div>
        <button type="button" onClick={() => setMenuOpen(true)} aria-label={labels.openMenu} aria-expanded={menuOpen} aria-controls="pricing-site-menu" className="xl:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg text-sundae-text hover:bg-sundae-surface-hover focus-visible:outline-2 focus-visible:outline-sundae-accent"><Menu aria-hidden size={23} /></button>
      </div>

      {/* Calculator controls are secondary to the shared global navigation. */}
      <div data-pricing-utilities className="relative border-t border-sundae-muted/15">
        <div className="mx-auto flex min-h-12 max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
          <span className="hidden md:block text-xs text-sundae-muted">{isSimulator ? messages.header.simulator : labels.pricing}</span>
          <div className="flex w-full md:w-auto items-center justify-between gap-4">
            <button type="button" className="start-over" onClick={() => { useConfiguration.getState().reset(); trackPricingEvent('start_over'); navigate('/', { replace: true }); }}>{reviewCopy.startOver}</button>
            {isSimulator ? (
              <Link to="/" className="text-sm text-sundae-muted hover:text-sundae-text">{labels.pricing}</Link>
            ) : (
              <Link to={location.pathname === '/' && !locationsConfirmed ? '/#buyer-locations' : '/simulator'} onClick={(event) => { useConfiguration.getState().recordLocationActivity(); const state = useConfiguration.getState(); if (location.pathname === '/' && !state.locationsConfirmed) { event.preventDefault(); focusLocationInput(); return; } if (!state.layer) state.setLayer('core'); state.setCurrentStep(state.layer !== 'core' && state.layer !== null && state.crewSkus.length === 0 ? 0 : 2); trackPricingEvent('header_review_clicked'); }} className="rounded-lg border border-sundae-muted/25 px-3 py-2 text-center text-xs font-semibold text-sundae-text hover:bg-sundae-surface-hover">{copy.reviewCta}</Link>
            )}
          </div>
        </div>
      </div>

      <dialog ref={dialogRef} id="pricing-site-menu" aria-label={labels.openMenu} onCancel={() => setMenuOpen(false)} onClose={() => setMenuOpen(false)} className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none border-0 bg-sundae-dark p-0 text-sundae-text backdrop:bg-black/50">
        <div className="flex min-h-full flex-col px-6 pb-6">
          <div className="flex h-20 shrink-0 items-center justify-between border-b border-sundae-muted/20">
            <a href={getMarketingUrl('/', locale)} aria-label={chromeCopy.home}><Logo size="md" /></a>
            <button type="button" autoFocus onClick={() => setMenuOpen(false)} aria-label={labels.closeMenu} className="inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-sundae-surface-hover"><X aria-hidden size={24} /></button>
          </div>
          <nav aria-label={labels.openMenu} data-site-navigation="mobile" className="py-5">{navLinks(true)}</nav>
          <a href={getMarketingUrl('/about', locale)} className="py-3 text-sm text-sundae-muted hover:text-sundae-text">{labels.about}</a>
          <div className="mt-auto border-t border-sundae-muted/20 pt-6">
            <div className="mb-5 flex items-center gap-4">{languageControl}<ThemeToggle /></div>
            <div className="grid grid-cols-2 gap-3">
              <a href={getMarketingUrl('/sign-in', locale)} className="rounded-xl border border-sundae-muted/25 px-3 py-3 text-center text-sm font-medium">{labels.signIn}</a>
              <a href={getMarketingUrl('/demo', locale)} className="rounded-xl bg-gradient-primary px-3 py-3 text-center text-sm font-semibold text-white">{labels.bookDemo}</a>
            </div>
          </div>
        </div>
      </dialog>
    </header>
  );
}
