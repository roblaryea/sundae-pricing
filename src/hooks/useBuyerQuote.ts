import { useConfiguration } from './useConfiguration';
import { useLivePricingCatalog } from '../data/livePricing';
import { useLocale } from '../contexts/LocaleContext';
import { getBuyerCopy } from '../lib/buyerCopy';
import { calculateBasketQuote } from '../lib/basketQuote';
import type { PricingIntent } from '../lib/pricingIntent';

export function useBuyerQuote() {
  const state = useConfiguration();
  const live = useLivePricingCatalog();
  const config: PricingIntent = {
    v: 2, layer: state.layer ?? 'core', corePackage: state.corePackage, locations: state.locations,
    addOns: state.layer === 'crew' ? [] : state.addOns,
    watchtowerModules: state.layer === 'crew' ? [] : state.watchtowerModules as PricingIntent['watchtowerModules'],
    crewSkus: state.layer === 'core' || state.layer === null ? [] : state.crewSkus,
    crossIntelligence: state.layer === 'crew' ? 'none' : state.crossIntelligence,
    billingCycle: state.billingCycle, operatingModels: state.operatingModels,
    employees: state.employees ?? null, payrollCountry: state.payrollCountry ?? '',
  };
  return { state, config, quote: calculateBasketQuote(config), live };
}
export function useBuyerFormatting() {
  const { locale, messages } = useLocale();
  return { locale, messages, copy: getBuyerCopy(locale), money: (n: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: n % 1 ? 2 : 0 }).format(n) };
}
