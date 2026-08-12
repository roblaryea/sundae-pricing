import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { recommendCorePackage } from '../src/lib/moduleRecommendationEngine';
import { calculateCostAvoidance, SAVINGS_ASSUMPTIONS } from '../src/hooks/useROICalculation';

describe('commercial package recommendation', () => {
  it('carries the discovery recommendation onto the tier screen', () => {
    const tierSource = readFileSync(
      new URL('../src/components/ConfigBuilder/TierSelector.tsx', import.meta.url),
      'utf8',
    );
    expect(tierSource).toMatch(/recommendedPackage\s*=\s*corePackage\s*\?\?/);
    expect(tierSource).toMatch(/pkg\.id\s*===\s*recommendedPackage/);
  });

  it('routes food and supplier priorities to Core Margin regardless of estate size', () => {
    expect(recommendCorePackage(['labor_costs', 'food_waste', 'supplier_prices']).packageId)
      .toBe('core_margin');
  });

  it('treats Margin and Growth as a fork, joining them only in Performance', () => {
    expect(recommendCorePackage(['food_waste']).packageId).toBe('core_margin');
    expect(recommendCorePackage(['marketing_roi']).packageId).toBe('core_growth');
    expect(recommendCorePackage(['food_waste', 'marketing_roi']).packageId)
      .toBe('core_performance');
  });

  it('uses Performance for a domain that neither middle package grants', () => {
    expect(recommendCorePackage(['delivery_profitability']).packageId)
      .toBe('core_performance');
  });
});

describe('defensible funding case', () => {
  it('carries the value case onto the final decision screen', () => {
    const summarySource = readFileSync(
      new URL('../src/components/Summary/ConfigSummary.tsx', import.meta.url),
      'utf8',
    );
    expect(summarySource).toMatch(/useROICalculation\(/);
    expect(summarySource).toMatch(/summaryRoi\.monthlyFunding/);
    expect(summarySource).toMatch(/Buyer-entered replaceable systems only/);
    expect(summarySource).toMatch(/capacityFte/);
    expect(summarySource).toMatch(/monthlyFunding\s*-\s*coreOnlyPricing\.total/);
  });

  it('counts only buyer-confirmed replaceable software as cash avoidance', () => {
    const result = calculateCostAvoidance({
      replaceableSystemsSpend: 2_400,
      manualReportingHoursPerWeek: 20,
      loadedHourlyRate: 50,
    });
    expect(result.replaceableSystemsSavings).toBe(2_400);
    expect(result.capacityValue).toBeCloseTo(4_333.33, 1);
    expect(result.capacityFte).toBe(0.5);
  });

  it('never turns negative inputs into a saving', () => {
    expect(calculateCostAvoidance({
      replaceableSystemsSpend: -100,
      manualReportingHoursPerWeek: -10,
      loadedHourlyRate: -50,
    })).toEqual({ replaceableSystemsSavings: 0, capacityValue: 0, capacityFte: 0 });
  });

  it('does not add a second generic Profit Intelligence uplift', () => {
    expect(SAVINGS_ASSUMPTIONS.profit.midPct).toBe(0);
    expect(SAVINGS_ASSUMPTIONS.profit.tooltip).toMatch(/avoid double counting/i);
  });

  it('expresses labour, food and purchasing assumptions on their published cost bases', () => {
    expect(SAVINGS_ASSUMPTIONS.labor).toMatchObject({ minPct: 0.01, maxPct: 0.03 });
    expect(SAVINGS_ASSUMPTIONS.inventory).toMatchObject({ minPct: 0.005, maxPct: 0.02 });
    expect(SAVINGS_ASSUMPTIONS.purchasing).toMatchObject({ minPct: 0.02, maxPct: 0.05 });
  });
});
