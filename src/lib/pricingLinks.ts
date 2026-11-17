import { getMarketingUrl } from '../config/legal';
import { encodePricingIntent, type PricingIntent } from './pricingIntent';
export function demoUrl(config: PricingIntent, locale: Parameters<typeof getMarketingUrl>[1]) {
  const url = new URL(getMarketingUrl('/demo',locale));
  url.searchParams.set('cfg',encodePricingIntent(config));
  url.searchParams.set('source','pricing-configurator');
  return url.toString();
}

/** New buyers request onboarding; existing-account sign-in is a separate path. */
export function accessRequestUrl(config: PricingIntent, locale: Parameters<typeof getMarketingUrl>[1]) {
  const url = new URL(getMarketingUrl('/get-started', locale && ['az', 'ru', 'pap'].includes(locale) ? 'en' : locale));
  url.searchParams.set('cfg', encodePricingIntent(config));
  url.searchParams.set('source', 'pricing-configurator');
  return url.toString();
}
