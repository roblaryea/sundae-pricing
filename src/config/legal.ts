// Centralized legal entity constants — single source of truth
// All customer-facing legal references should import from here.

export const LEGAL = {
  legalName: 'Sundae Technologies Inc.',
  brandName: 'Sundae',
  jurisdiction: 'Delaware, United States',
  governingLaw: 'State of Delaware, United States',
  registeredAgent: 'Firstbase Agent LLC',
  addressLines: [
    '1007 N Orange St, 4th Floor',
    'Suite 1382',
    'Wilmington, DE 19801',
    'United States',
  ],
  /** Approved customer-facing domains operated by Sundae Technologies Inc. */
  operatingDomains: [
    'sundae.io',
    'sundaetech.ai',
    'sundaetech.io',
    'sundaetechnologies.com',
  ],
  /** Primary domain used for links and email */
  primaryDomain: 'sundae.io',
  supportEmail: 'sales@sundae.io',
  website: 'https://sundae.io',
  demoUrl: 'https://sundae.io/demo',
  contactUrl: 'https://sundae.io/contact',
  privacyUrl: 'https://sundae.io/privacy',
  termsUrl: 'https://sundae.io/terms',
  signUpUrl: 'https://sundae.io/sign-in',
} as const;

export type MarketingLocale = 'en' | 'ar' | 'fr' | 'es';

function localizeMarketingPath(pathname: string, locale: MarketingLocale): string {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (locale === 'en') return normalizedPath;
  return normalizedPath === '/' ? `/${locale}` : `/${locale}${normalizedPath}`;
}

export function getMarketingUrl(pathname: string, locale: MarketingLocale = 'en'): string {
  const base = new URL(LEGAL.website);
  base.pathname = localizeMarketingPath(pathname, locale);
  base.search = '';
  base.hash = '';
  return base.toString();
}
