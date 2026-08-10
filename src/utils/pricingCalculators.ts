// Pricing calculation utilities — dynamic, never hardcoded.
// All values sourced from pricing.ts / pricingEngine.ts.
//
// The former Core Lite ⇄ Core Pro break-even helpers were removed with price
// book v1.7: those two tiers are retired, and the four Core packages are not
// substitutes for one another at scale — they differ in scope, not in a
// crossover point. `calculateBandedTotal` is the only correct way to compare
// two packages at a given unit count.

import { corePackages, CORE_PACKAGE_IDS } from '../data/pricing';
import type { CorePackageId } from '../data/pricing';
import { calculateBandedTotal, marginalRateForNextUnit } from '../lib/pricingEngine';

export interface CorePackageQuote {
  id: CorePackageId;
  name: string;
  /** Total monthly price at this unit count (anchor + marginal bands). */
  total: number;
  /** Derived AVERAGE per unit — never a rate card. */
  averagePerUnit: number;
  /** What the NEXT unit would cost at this scale. */
  nextUnitPrice: number | null;
}

/** Price every Core package at a given unit count, cheapest first. */
export function quoteAllCorePackages(locations: number): CorePackageQuote[] {
  const units = Math.max(1, Math.floor(locations));
  return CORE_PACKAGE_IDS.map((id) => {
    const pkg = corePackages[id];
    const total = calculateBandedTotal(pkg, units);
    return {
      id,
      name: pkg.name,
      total,
      averagePerUnit: Math.round((total / units) * 100) / 100,
      nextUnitPrice: marginalRateForNextUnit(pkg, units),
    };
  }).sort((a, b) => a.total - b.total);
}

/**
 * Human-readable explanation of the marginal-band mechanic at the visitor's
 * current scale. Replaces the retired "Core Pro gets cheaper at N locations"
 * message, which described a crossover that no longer exists.
 */
export function getMarginalBandMessage(
  packageId: CorePackageId,
  locations: number,
): string | null {
  const units = Math.max(1, Math.floor(locations));
  if (units < 2) return null;

  const pkg = corePackages[packageId];
  const total = calculateBandedTotal(pkg, units);
  const average = Math.round(total / units);
  const nextUnit = marginalRateForNextUnit(pkg, units);

  const base = `At ${units} locations, ${pkg.name} totals $${total.toLocaleString()}/mo — an average of $${average.toLocaleString()} per location.`;
  return nextUnit === null
    ? base
    : `${base} Your next location is priced at $${nextUnit.toLocaleString()}, and adding it does not reprice the locations you already have.`;
}
