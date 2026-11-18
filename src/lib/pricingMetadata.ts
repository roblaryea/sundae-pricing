import { supportedLocales, type PricingLocale } from './locales';
import { getBuyerCopy } from './buyerCopy';
export const PRICING_ORIGIN = 'https://pricing.sundae.io';
export const SOCIAL_IMAGE = 'https://www.sundae.io/logos/og-operations.png';
export function pricingLocaleUrl(locale: PricingLocale) { return `${PRICING_ORIGIN}/${locale === 'en' ? '' : `?lang=${locale}`}`; }
export function getPricingMetadata(locale: PricingLocale, simulator = false) {
  const copy = getBuyerCopy(locale);
  return {
    title: locale === 'en' ? simulator ? 'Sundae Pricing Simulator | Core + Crew' : 'Sundae Pricing | Core and Crew for Hospitality and Food-Service' : `${simulator ? copy.review : copy.title} | Sundae Core + Crew`,
    description: `${copy.subtitle} ${copy.exclusions}. ${copy.intentNote}`,
    canonical: pricingLocaleUrl(locale),
    robots: simulator ? 'noindex,follow' : 'index,follow',
    alternates: supportedLocales.map(lang => ({ lang, href: pricingLocaleUrl(lang) })),
  };
}
