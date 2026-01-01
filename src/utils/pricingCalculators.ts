// Pricing calculation utilities - dynamic, never hardcoded
// All values sourced from pricing.ts

import { coreTiers } from '../data/pricing';

/**
 * Calculate the break-even point between Core Lite and Core Pro
 * Returns the number of locations where the two tiers cost the same
 */
export function calculateCoreProBreakEven(): number {
  const liteBase = coreTiers.lite.basePrice as number;
  const litePerLoc = coreTiers.lite.additionalLocationPrice as number;
  const proBase = coreTiers.pro.basePrice as number;
  const proPerLoc = coreTiers.pro.additionalLocationPrice as number;

  // If Pro's per-location isn't cheaper, no break-even exists
  if (litePerLoc <= proPerLoc) {
    return Infinity;
  }

  // Solve: liteBase + (n-1)*litePerLoc = proBase + (n-1)*proPerLoc
  // Rearrange: (n-1)*(litePerLoc - proPerLoc) = proBase - liteBase
  // n = ((proBase - liteBase) / (litePerLoc - proPerLoc)) + 1

  const breakEven = ((proBase - liteBase) / (litePerLoc - proPerLoc)) + 1;
  
  return Math.ceil(breakEven);
}

/**
 * Get a human-readable message about Core Pro pricing advantage
 */
export function getCoreProAdvantageMessage(): string | null {
  const breakEven = calculateCoreProBreakEven();
  
  if (breakEven === Infinity) {
    return null; // Pro is never cheaper
  }

  const cheaperAt = breakEven + 1;
  
  return `Core Pro becomes cheaper per location than Core Lite at ${cheaperAt}+ locations (break-even at ${breakEven}) due to its lower per-location pricing ($${coreTiers.pro.additionalLocationPrice} vs $${coreTiers.lite.additionalLocationPrice}).`;
}

/**
 * Calculate total monthly cost for a tier
 */
export function calculateTierCost(
  basePrice: number,
  perLocationPrice: number,
  locations: number
): number {
  if (locations <= 0) return 0;
  if (locations === 1) return basePrice;
  return basePrice + (perLocationPrice * (locations - 1));
}

/**
 * Get the recommended tier based on location count
 */
export function getRecommendedCoreTier(locations: number): 'lite' | 'pro' {
  const breakEven = calculateCoreProBreakEven();
  
  if (locations >= breakEven + 1) {
    return 'pro'; // Pro is cheaper
  }
  
  return 'lite';
}
