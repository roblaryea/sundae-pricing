import { describe, expect, it } from 'vitest';
import { accessRequestUrl } from '../src/lib/pricingLinks';
import { decodePricingIntent, type PricingIntent } from '../src/lib/pricingIntent';
const config: PricingIntent = { v: 2, layer: 'both', corePackage: 'core_growth', locations: 4, addOns: [], watchtowerModules: [], crewSkus: ['crew_operations'], crossIntelligence: 'none', billingCycle: 'annual_upfront', operatingModels: [], employees: 80, payrollCountry: 'AE' };
describe('new-customer handoff', () => {
  it('opens access requests, preserving the selected package, workforce and term', () => {
    const url = new URL(accessRequestUrl(config, 'fr'));
    expect(url.pathname).toBe('/fr/get-started');
    expect(url.searchParams.get('source')).toBe('pricing-configurator');
    expect(decodePricingIntent(url.searchParams.get('cfg')!)).toMatchObject({ layer:'both', corePackage:'core_growth', locations:4, employees:80, payrollCountry:'AE', billingCycle:'annual_upfront' });
    expect(url.searchParams.has('returnUrl')).toBe(false);
  });
  it('does not invent unsupported marketing locale routes', () => {
    expect(new URL(accessRequestUrl(config, 'ru')).pathname).toBe('/get-started');
  });
});
