import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { calculateRoiEconomics, DAYS_PER_MODEL_MONTH } from '../src/lib/roiEconomics';
import { getRoiEconomicsCopy } from '../src/lib/roiEconomicsCopy';
import { supportedLocales } from '../src/lib/locales';
vi.mock('../src/contexts/LocaleContext', () => ({ useLocale: () => ({ locale: 'en' }) }));
import { useROICalculation, generateROIDescription, calculateCostAvoidance } from '../src/hooks/useROICalculation';
import type { ROICalculation, ROIInputs } from '../src/hooks/useROICalculation';
import { calculateBasketQuote } from '../src/lib/basketQuote';
import { applyLiveCatalogValues } from '../src/data/livePricing';
import { corePackages } from '../src/data/pricing';
import type { PricingIntent } from '../src/lib/pricingIntent';
import fixture from './fixtures/published-v1.8.2.json';

const base: PricingIntent = { v: 2, layer: 'core', corePackage: 'core_foundation', locations: 1, addOns: [], watchtowerModules: [], crewSkus: [], crossIntelligence: 'none', billingCycle: 'monthly', operatingModels: [], employees: null, payrollCountry: '' };
const inputs: ROIInputs = { monthlyRevenue: 200_000, laborPercent: 30, foodCostPercent: 30 };
function model(config = base, values = inputs, setup: number | null = 2500) {
  const quote = calculateBasketQuote(config);
  function Probe() {
    const result = useROICalculation({ layer: config.layer === 'crew' ? null : 'core', corePackage: config.corePackage, locations: config.locations, activeDomains: [...corePackages[config.corePackage].includesDomainModules], watchtowerModules: config.watchtowerModules }, values, quote.monthly, setup);
    return createElement('pre', null, Buffer.from(JSON.stringify(result)).toString('base64'));
  }
  const html = renderToStaticMarkup(createElement(Probe));
  const result: ROICalculation = JSON.parse(Buffer.from(html.replace(/<[^>]+>/g, ''), 'base64').toString());
  return { result, quote };
}

describe('economic payback and net benefit', () => {
  it('uses one full-plan cost: a profitable Core cannot make a loss-making bundle pay back', () => {
    applyLiveCatalogValues(fixture as never);
    const core = model();
    const bundle = model({ ...base, layer: 'both', crewSkus: ['crew_operations', 'crew_scheduling', 'crew_tna', 'crew_payroll'] });
    expect(core.result.monthlyFunding).toBe(1500);
    expect(core.quote.monthly).toBe(1195);
    expect(core.result.monthlyNetBenefit).toBe(305);
    expect(core.result.paybackDays).toBe(250);
    expect(bundle.quote.monthly).toBe(1694);
    expect(bundle.result.monthlyFunding).toBe(1500);
    expect(bundle.result.monthlyNetBenefit).toBe(-194);
    expect(bundle.result.paysBack).toBe(false);
    expect(bundle.result.paybackDays).toBeNull();
    expect(generateROIDescription(bundle.result)).toContain('does not pay for itself');
  });
  it('annual upfront changes monthly expense but payback remains explicitly economic', () => {
    const { result, quote } = model({ ...base, billingCycle: 'annual_upfront' });
    expect(quote.monthly).toBeCloseTo(1051.6);
    expect(result.monthlyNetBenefit).toBe(448.4);
    expect(result.paybackDays).toBe(170);
    expect(result.firstYearNetBenefit).toBe(2880.8);
    expect(result.paybackDays).not.toBe(Math.ceil((quote.paymentAmount + 2500) / 1500 * DAYS_PER_MODEL_MONTH));
  });
  it('reports gross benefit/cost separately from true net ROI percentage', () => {
    const r = calculateRoiEconomics(1500, 1000, 2500);
    expect(r.benefitCostMultiple).toBe(1.5);
    expect(r.roiPercent).toBe(50);
    expect(r.monthlyNetBenefit).toBe(500);
    expect(r.firstYearNetBenefit).toBe(3500);
  });
  it.each([0, -1, -500])('has no finite payback with monthly net %s', (net) => {
    const r = calculateRoiEconomics(1000 + net, 1000, 100);
    expect(r.paysBack).toBe(false);
    expect(r.paybackDays).toBeNull();
  });
  it('uses the fee supplied by the basket and does not invent a 14-day result', () => {
    expect(calculateRoiEconomics(2000, 1000, 100).paybackDays).toBe(4);
    expect(calculateRoiEconomics(2000, 1000, 0).paybackDays).toBe(0);
    expect(calculateRoiEconomics(2000, 1000, 7500).paybackDays).toBe(229);
    const unknown = calculateRoiEconomics(2000, 1000, null);
    expect(unknown.paybackDays).toBeNull();
    expect(unknown.firstYearNetBenefit).toBeNull();
  });
  it('does not describe rounded 1.0x as profitable when it is a loss', () => {
    const { result } = model(base, { ...inputs, monthlyRevenue: 100_000, replaceableSystemsSpend: 444 });
    expect(result.roi).toBe(1);
    expect(result.monthlyNetBenefit).toBe(-1);
    expect(generateROIDescription(result)).toContain('does not pay for itself');
  });
  it('keeps cents consistent between monthly, annual and net figures', () => {
    const { result } = model(base, { ...inputs, monthlyRevenue: 100_000, replaceableSystemsSpend: 445.25 });
    expect(result.monthlyFunding).toBe(1195.25);
    expect(result.annualFunding).toBe(14343);
    expect(result.monthlyNetBenefit).toBe(.25);
    expect(result.annualNetBenefit).toBe(3);
  });
  it('treats time capacity as noncash and ignores nonfinite optional input', () => {
    expect(calculateCostAvoidance({ replaceableSystemsSpend: Infinity, manualReportingHoursPerWeek: NaN, loadedHourlyRate: 50 })).toEqual({ replaceableSystemsSavings: 0, capacityValue: 0, capacityFte: 0 });
    const { result } = model(base, { ...inputs, manualReportingHoursPerWeek: 40, loadedHourlyRate: 50 });
    expect(result.monthlyFunding).toBe(1500);
    expect(result.capacityValue).toBeGreaterThan(8000);
  });
  it('does not turn explicit zero labour and food spend into a typical spend assumption', () => {
    const { result } = model(base, { ...inputs, laborPercent: 0, foodCostPercent: 0 });
    expect(result.breakdowns.labor).toBe(0);
  });
  it('does not credit Core benefits to a Crew-only configuration', () => {
    const { result } = model({ ...base, layer: 'crew', crewSkus: ['crew_scheduling'] });
    expect(result.monthlySavings).toBe(0);
  });
  it('reconciles displayed lines and scales their ranges at every tested estate size', () => {
    for (const locations of [1, 2, 3, 5, 10, 20, 50, 100, 200]) {
      for (const corePackage of Object.keys(corePackages) as PricingIntent['corePackage'][]) {
        const { result } = model({ ...base, corePackage, locations });
        const lines = result.savingsLines.filter(line => line.isCountedInTotal);
        expect(lines.reduce((sum, line) => sum + line.amount, 0)).toBe(result.monthlySavings);
        for (const line of lines) {
          expect(line.amount).toBeGreaterThanOrEqual(line.rangeMin);
          expect(line.amount).toBeLessThanOrEqual(line.rangeMax);
        }
      }
    }
  });
  it.each(supportedLocales)('explains the economic/full-plan basis in %s', locale => {
    const copy = getRoiEconomicsCopy(locale);
    expect(Object.values(copy)).toHaveLength(9);
    for (const token of ['{net}', '{fee}', '{days}']) expect(copy.recoveryExplanation).toContain(token);
    for (const value of Object.values(copy)) expect(value.length).toBeGreaterThan(0);
    if (locale !== 'en') for (const key of Object.keys(copy) as (keyof typeof copy)[]) expect(copy[key]).not.toBe(getRoiEconomicsCopy('en')[key]);
  });
});
