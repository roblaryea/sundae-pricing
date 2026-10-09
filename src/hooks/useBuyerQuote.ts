import { recommendedConceptSkus } from '../lib/discoveryEngine';
import { getBuyerJourneyCopy } from '../lib/buyerJourneyCopy';
import { useConfiguration } from './useConfiguration';
import { useLivePricingCatalog } from '../data/livePricing';
import { useLocale } from '../contexts/LocaleContext';
import { getBuyerCopy } from '../lib/buyerCopy';
import { calculateBasketQuote } from '../lib/basketQuote';
import type { PricingIntent } from '../lib/pricingIntent';
import { buyerReviewCopy } from '../lib/buyerReviewCopy';

export function useBuyerQuote() {
  const state = useConfiguration();
  const live = useLivePricingCatalog();
  const config: PricingIntent = {
    v: 2, layer: state.layer ?? 'core', corePackage: state.corePackage, locations: state.locations,
    addOns: state.layer === 'crew' ? [] : [...new Set([...state.addOns, ...recommendedConceptSkus(state.operatingModels)])],
    watchtowerModules: state.layer === 'crew' ? [] : state.watchtowerModules as PricingIntent['watchtowerModules'],
    crewSkus: state.layer === 'core' || state.layer === null ? [] : state.crewSkus,
    crossIntelligence: state.layer === 'crew' ? 'none' : state.crossIntelligence,
    billingCycle: state.billingCycle, operatingModels: state.operatingModels,
    employees: state.employees ?? null, payrollCountry: state.payrollCountry ?? '',
  };
  const quote = calculateBasketQuote(config);
  if(live.catalog && !live.policyCoverage?.implementation) quote.implementation = { ...quote.implementation, requiresScoping: true };
  return { state, config, quote, live };
}
export function useBuyerFormatting() {
  const { locale, messages } = useLocale();
  return { locale, messages, copy: getBuyerCopy(locale), journey: getBuyerJourneyCopy(locale), reviewCopy: buyerReviewCopy[locale], money: (n: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: n % 1 ? 2 : 0 }).format(n), cardMoney: (n: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n) };
}
