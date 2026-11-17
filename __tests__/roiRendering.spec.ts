import { describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { calculateBasketQuote } from '../src/lib/basketQuote';
import { ROISimulator } from '../src/components/PricingDisplay/ROISimulator';
import { applyLiveCatalogValues } from '../src/data/livePricing';
import catalog from './fixtures/published-v1.8.2.json';
import setupPolicy from './fixtures/roi-implementation-policy.json';

const state = vi.hoisted(() => ({
  layer: 'both' as 'core' | 'both', corePackage: 'core_foundation' as const, locations: 1,
  watchtowerModules: [], crewSkus: ['crew_operations', 'crew_scheduling', 'crew_tna', 'crew_payroll'],
  roiInputs: { monthlyRevenue: 200000, laborPercent: 30, foodCostPercent: 30 },
  setROIInputs: () => {}, goToStep: () => {}, goToPrevStep: () => {},
}));
vi.mock('../src/contexts/LocaleContext', () => ({ useLocale: () => ({ locale: 'en' }) }));
vi.mock('../src/hooks/useConfiguration', () => ({ useConfiguration: () => state }));
vi.mock('../src/hooks/useBuyerQuote', () => ({ useBuyerQuote: () => ({ quote: calculateBasketQuote({
  v: 2, ...state, addOns: [], crossIntelligence: 'none', billingCycle: 'monthly',
  operatingModels: [], employees: null, payrollCountry: '', crewSkus: state.crewSkus as never,
}) }) }));

function card(html: string, id: string) {
  return html.match(new RegExp(`data-testid="${id}"[^>]*>([\\s\\S]*?)</(?:div|dd)>`))?.[1].replace(/<[^>]*>|<!-- -->/g, '');
}
describe('rendered full-plan ROI results', () => {
  it('explains which initial fee is recovered from the after-subscription monthly benefit', () => {
    applyLiveCatalogValues({ ...catalog, ...setupPolicy } as never);
    state.layer = 'core';
    try {
      const html = renderToStaticMarkup(createElement(ROISimulator));
      expect(card(html, 'roi-payback')).toBe('250 days');
      expect(card(html, 'roi-monthly-net')).toBe('+$305');
      expect(html).toContain('Your estimated $305 monthly benefit, after all subscription costs, recovers the $2,500 implementation fee in approximately 250 days.');
    } finally { state.layer = 'both'; }
  });
  it('cannot advertise payback alongside a negative full-plan net benefit', () => {
    applyLiveCatalogValues({ ...catalog, ...setupPolicy } as never);
    const html = renderToStaticMarkup(createElement(ROISimulator));
    expect(card(html, 'roi-monthly-funding')).toBe('$1,500');
    expect(card(html, 'roi-monthly-net')).toBe('-$194');
    expect(card(html, 'roi-payback')).toBe('Not at these inputs');
    expect(card(html, 'roi-implementation')).toBe('$7,500');
    expect(card(html, 'roi-first-year-net')).toBe('-$9,828');
    expect(html).toContain('Implementation cost recovery');
    expect(html).not.toContain('Estimated economic payback');
    expect(html).not.toContain('data-testid="roi-recovery-explanation"');
    expect(html).toContain('costs include your full plan');
    expect(html).toContain('Upfront cash payments');
  });
});
