// ═══════════════════════════════════════════════════════════════════════════
// SUNDAE PRICING ENGINE — price book v1.7
// ═══════════════════════════════════════════════════════════════════════════
// Core is priced as a FIRST-UNIT anchor plus MARGINAL bands. Bands never
// reprice earlier units:
//   5 Core Foundation locations = 1195 + 4 × 175 = $1,895 total ($379 each).
//
// Consequences the rest of the app depends on:
//   • There is NO flat per-location rate for a banded SKU. `perLocation` is a
//     derived AVERAGE (total ÷ units) and must be labelled as such.
//   • There is NO "included locations" allowance. Unit #1 is the anchor.
//   • There is no per-module setup-fee ladder. Implementation is charged ONCE
//     at the highest class in the selection (see `resolveImplementationFee`).

import {
  corePackages,
  coreTiers,
  conceptSkus,
  foresightAction,
  implementationClasses,
  CLIENT_TYPE_RULES,
  EARLY_ADOPTER_TERMS,
  billingDiscounts,
  DISCOUNT_RULES,
  crossIntelligence,
  getVolumeDiscount,
  requiresEnterpriseQuote,
} from '../data/pricing';
import type {
  BandedSku,
  MarginalBand,
  CorePackageId,
  ConceptSkuId,
  ImplementationClassId,
  ClientType,
  BillingCycle,
  CrossIntelligenceTier,
} from '../data/pricing';
import { calculateWatchtowerPrice as calcWatchtowerPrice, type WatchtowerModuleId } from './watchtowerEngine';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Everything sellable alongside a Core package. */
export type AddOnId = 'foresight_action' | ConceptSkuId;

export interface ClientProfile {
  type: ClientType;
  isEarlyAdopter: boolean;
  isFranchise: boolean;
  brandCount: number;
  customDiscountPercent?: number;
  billingCycle?: BillingCycle;
}

export interface Configuration {
  layer: 'core';
  corePackage: CorePackageId;
  locations: number;
  addOns: AddOnId[];
  watchtower: string[];
  clientProfile: ClientProfile;
  crossIntelligence?: CrossIntelligenceTier;
}

export interface PriceBreakdown {
  item: string;
  price: number;
  note?: string;
}

export interface DiscountLine {
  name: string;
  amount: number;
  percent: number;
}

export interface PriceResult {
  subtotal: number;
  discountsApplied: DiscountLine[];
  total: number;
  /** Derived AVERAGE per unit (total ÷ units) — never a per-location rate card. */
  perLocation: number;
  annualTotal: number;
  aiCreditsTotal: number;
  breakdown: PriceBreakdown[];
  /** True past the self-serve volume ladder (250+ units) — the deal is quoted. */
  requiresEnterpriseQuote: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// MARGINAL BAND MATH
// ═══════════════════════════════════════════════════════════════════════════

export interface BandLine {
  band: MarginalBand;
  /** How many units fall inside this band at the requested unit count. */
  units: number;
  subtotal: number;
}

/**
 * Units priced by one band at a given total unit count.
 * A band covers [fromUnit, toUnit]; `toUnit === null` is terminal.
 */
function unitsInBand(band: MarginalBand, units: number): number {
  if (units < band.fromUnit) return 0;
  const upper = band.toUnit === null ? units : Math.min(units, band.toUnit);
  return Math.max(0, upper - band.fromUnit + 1);
}

/**
 * Per-band breakdown for a banded SKU. Unit #1 is the anchor and is NOT part
 * of any band, so it is not represented here.
 */
export function calculateBandLines(sku: BandedSku, units: number): BandLine[] {
  const safeUnits = Math.max(0, Math.floor(units));
  return sku.marginalBands
    .map((band) => {
      const bandUnits = unitsInBand(band, safeUnits);
      return { band, units: bandUnits, subtotal: bandUnits * band.pricePerUnit };
    })
    .filter((line) => line.units > 0);
}

/**
 * Total monthly price for a banded SKU: the first-unit anchor plus the
 * marginal cost of every unit from #2 upward. MARGINAL — reaching a band does
 * not reprice earlier units.
 */
export function calculateBandedTotal(sku: BandedSku, units: number): number {
  const safeUnits = Math.max(0, Math.floor(units));
  if (safeUnits <= 0) return 0;
  return (
    sku.firstUnitPrice +
    calculateBandLines(sku, safeUnits).reduce((sum, line) => sum + line.subtotal, 0)
  );
}

/**
 * The marginal rate the NEXT unit would be charged at. Useful for "your next
 * location costs $X" copy — never for multiplying out a total.
 */
export function marginalRateForNextUnit(sku: BandedSku, currentUnits: number): number | null {
  const nextUnit = Math.max(1, Math.floor(currentUnits)) + 1;
  const band = sku.marginalBands.find(
    (b) => nextUnit >= b.fromUnit && (b.toUnit === null || nextUnit <= b.toUnit),
  );
  return band?.pricePerUnit ?? null;
}

// ═══════════════════════════════════════════════════════════════════════════
// CORE PACKAGE / ADD-ON CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════

export function calculateCorePackagePrice(packageId: CorePackageId, locations: number): number {
  return calculateBandedTotal(corePackages[packageId], locations);
}

export function calculateForesightActionPrice(locations: number): number {
  return calculateBandedTotal(foresightAction, locations);
}

/** Concept SKUs are published as a flat monthly price with no per-unit band. */
export function calculateConceptPrice(conceptId: ConceptSkuId): number {
  return conceptSkus[conceptId].monthlyPrice;
}

export function isConceptId(id: string): id is ConceptSkuId {
  return Object.prototype.hasOwnProperty.call(conceptSkus, id);
}

export function calculateAddOnsPrice(addOns: AddOnId[], locations: number): number {
  return addOns.reduce((sum, id) => {
    if (id === 'foresight_action') return sum + calculateForesightActionPrice(locations);
    return sum + calculateConceptPrice(id);
  }, 0);
}

// ═══════════════════════════════════════════════════════════════════════════
// IMPLEMENTATION (charged ONCE, at the highest class in the selection)
// ═══════════════════════════════════════════════════════════════════════════

export interface ImplementationResult {
  classId: ImplementationClassId;
  name: string;
  fee: number;
  /** True when the published fee is a floor ("from $12,500"). */
  isFloor: boolean;
}

/**
 * Implementation is a single line, never a per-SKU sum. Give it every class in
 * the selection and it returns the highest one.
 */
export function resolveImplementationFee(classIds: ImplementationClassId[]): ImplementationResult {
  const winner = classIds
    .map((id) => implementationClasses[id])
    .filter(Boolean)
    .reduce(
      (highest, candidate) => (candidate.rank > highest.rank ? candidate : highest),
      implementationClasses.self_service,
    );

  return { classId: winner.id, name: winner.name, fee: winner.fee, isFloor: winner.isFloor };
}

// ═══════════════════════════════════════════════════════════════════════════
// WATCHTOWER
// ═══════════════════════════════════════════════════════════════════════════

export function calculateWatchtowerPrice(
  selected: string[],
  locations: number,
): { price: number; savings: number; isBundle: boolean } {
  if (selected.length === 0) {
    return { price: 0, savings: 0, isBundle: false };
  }

  const result = calcWatchtowerPrice(selected as WatchtowerModuleId[], locations);
  return { price: result.total, savings: result.bundleSavings, isBundle: result.isBundle };
}

// ═══════════════════════════════════════════════════════════════════════════
// CROSS-INTELLIGENCE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * v1.7: every Core package ships all eleven domain modules, so the correlation
 * engine's "3+ active domains" condition is satisfied by any Core package.
 */
export function isCrossIntelligenceEligible(hasCorePackage: boolean): boolean {
  return hasCorePackage;
}

export function calculateCrossIntelligencePrice(
  tier: CrossIntelligenceTier,
  locations: number,
): number {
  if (tier === 'base') return 0;
  const pro = crossIntelligence.pro;
  const additionalLocs = Math.max(0, locations - pro.includedLocations);
  return pro.monthlyFee + additionalLocs * pro.perLocationPrice;
}

// ═══════════════════════════════════════════════════════════════════════════
// DISCOUNTS
// v1.7: volume AND billing-cycle discounts combine, capped at 15% in total.
// ═══════════════════════════════════════════════════════════════════════════

export interface CombinedDiscount {
  volumePercent: number;
  billingPercent: number;
  /** volume + billing, clamped to the combined cap. */
  totalPercent: number;
  capped: boolean;
}

export function calculateCombinedDiscount(
  locations: number,
  billingCycle?: BillingCycle,
): CombinedDiscount {
  const volumePercent = getVolumeDiscount(locations);
  const billingPercent = billingCycle ? billingDiscounts[billingCycle] : 0;
  const raw = volumePercent + billingPercent;
  const totalPercent = Math.min(raw, DISCOUNT_RULES.maxDiscountPercent);
  return { volumePercent, billingPercent, totalPercent, capped: raw > totalPercent };
}

export function applyDiscounts(
  subtotal: number,
  profile: ClientProfile,
  locations: number,
): { total: number; discounts: DiscountLine[] } {
  let running = subtotal;
  const discounts: DiscountLine[] = [];

  const combined = calculateCombinedDiscount(locations, profile.billingCycle);
  const rules = CLIENT_TYPE_RULES[profile.type];

  if (combined.totalPercent > 0 && rules?.pricingModel !== 'enterprise') {
    const amt = running * (combined.totalPercent / 100);
    running -= amt;
    const parts: string[] = [];
    if (combined.volumePercent > 0) parts.push(`volume ${combined.volumePercent}%`);
    if (combined.billingPercent > 0) parts.push(`billing ${combined.billingPercent}%`);
    discounts.push({
      name: combined.capped
        ? `Volume + billing discount (${parts.join(' + ')}, capped at ${DISCOUNT_RULES.maxDiscountPercent}%)`
        : `Volume + billing discount (${parts.join(' + ')})`,
      amount: -amt,
      percent: combined.totalPercent,
    });
  }

  // Early adopter (legacy programme — stacks on the remainder, not on the
  // v1.7 volume/billing cap).
  if (profile.isEarlyAdopter) {
    const amt = running * (EARLY_ADOPTER_TERMS.discountPercent / 100);
    running -= amt;
    discounts.push({
      name: 'Early Adopter discount',
      amount: -amt,
      percent: EARLY_ADOPTER_TERMS.discountPercent,
    });
  }

  // Custom negotiated (stacks on remainder)
  if (profile.customDiscountPercent && profile.customDiscountPercent > 0) {
    const amt = running * (profile.customDiscountPercent / 100);
    running -= amt;
    discounts.push({
      name: 'Negotiated discount',
      amount: -amt,
      percent: profile.customDiscountPercent,
    });
  }

  return { total: Math.round(running * 100) / 100, discounts };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CALCULATION
// ═══════════════════════════════════════════════════════════════════════════

export function calculateFullPrice(config: Configuration): PriceResult {
  const breakdown: PriceBreakdown[] = [];
  const locations = Math.max(1, Math.floor(config.locations));
  const pkg = corePackages[config.corePackage];

  // Core package — first-unit anchor + marginal bands.
  const packagePrice = calculateBandedTotal(pkg, locations);
  const bandLines = calculateBandLines(pkg, locations);
  breakdown.push({
    item: `${pkg.name} (${locations} ${locations === 1 ? 'location' : 'locations'})`,
    price: packagePrice,
    note:
      locations === 1
        ? `First unit $${pkg.firstUnitPrice.toLocaleString()}`
        : `First unit $${pkg.firstUnitPrice.toLocaleString()} + ${bandLines
            .map((l) => `${l.units} @ $${l.band.pricePerUnit}`)
            .join(' + ')}`,
  });

  let aiCredits = pkg.aiCreditWallet;

  // Add-ons
  for (const addOnId of config.addOns) {
    if (addOnId === 'foresight_action') {
      const price = calculateForesightActionPrice(locations);
      const lines = calculateBandLines(foresightAction, locations);
      breakdown.push({
        item: foresightAction.name,
        price,
        note:
          locations === 1
            ? `First unit $${foresightAction.firstUnitPrice}`
            : `First unit $${foresightAction.firstUnitPrice} + ${lines
                .map((l) => `${l.units} @ $${l.band.pricePerUnit}`)
                .join(' + ')}`,
      });
      continue;
    }
    const concept = conceptSkus[addOnId];
    breakdown.push({ item: concept.name, price: concept.monthlyPrice, note: 'Flat monthly' });
  }

  // Watchtower
  if (config.watchtower.length > 0) {
    const wt = calculateWatchtowerPrice(config.watchtower, locations);
    breakdown.push({
      item: wt.isBundle ? 'Watchtower Bundle' : 'Watchtower',
      price: wt.price,
      note: wt.isBundle && wt.savings > 0 ? `Saves $${Math.round(wt.savings)}/mo (~18%)` : undefined,
    });
  }

  // Cross-Intelligence
  if (config.crossIntelligence) {
    if (config.crossIntelligence === 'pro') {
      breakdown.push({
        item: 'Cross-Intelligence Pro',
        price: calculateCrossIntelligencePrice('pro', locations),
        note: `$${crossIntelligence.pro.monthlyFee}/mo + $${crossIntelligence.pro.perLocationPrice}/loc from #2`,
      });
    } else {
      breakdown.push({
        item: 'Cross-Intelligence',
        price: 0,
        note: 'Included with every Core package',
      });
    }
  }

  const subtotal = breakdown.reduce((sum, b) => sum + b.price, 0);
  const { total, discounts } = applyDiscounts(subtotal, config.clientProfile, locations);

  if (config.clientProfile.isEarlyAdopter) {
    aiCredits += EARLY_ADOPTER_TERMS.bonusCredits;
  }

  return {
    subtotal,
    discountsApplied: discounts,
    total,
    perLocation: Math.round((total / locations) * 100) / 100,
    annualTotal: Math.round(total * 12 * 100) / 100,
    aiCreditsTotal: aiCredits,
    breakdown,
    requiresEnterpriseQuote: requiresEnterpriseQuote(locations),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ENTERPRISE
// ═══════════════════════════════════════════════════════════════════════════
// v1.7 publishes no self-serve numbers at or above 250 units, so the engine
// deliberately refuses to compute one. `coreTiers.enterprise` carries the
// qualitative card copy; the price is quoted.

export function enterpriseQuoteRequired(locations: number): boolean {
  return requiresEnterpriseQuote(locations);
}

export const enterpriseCardCopy = coreTiers.enterprise;

// ═══════════════════════════════════════════════════════════════════════════
// COMPETITOR COMPARISON
// ═══════════════════════════════════════════════════════════════════════════

export function calculateTenzoPrice(locations: number, moduleCount: number) {
  const monthly = locations * moduleCount * 75;
  const setup = locations * moduleCount * 350;
  return { monthly, setup, firstYear: monthly * 12 + setup };
}
