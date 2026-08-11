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
  IMPLEMENTATION_CLASS_ORDER,
  CLIENT_TYPE_RULES,
  EARLY_ADOPTER_TERMS,
  billingDiscounts,
  DISCOUNT_RULES,
  crossIntelligence,
  getVolumeDiscount,
  packageAllowsWatchtower,
  requiresEnterpriseQuote,
} from '../data/pricing';
import type {
  BandedSku,
  MarginalBand,
  CorePackage,
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
  /** English text, kept for the PDF and for callers with no locale. */
  name: string;
  /** Stable key so a localised surface can render this line in-language. */
  key?: DiscountKey;
  /** True when the published combined cap clipped this line. */
  capped?: boolean;
  amount: number;
  percent: number;
}

/**
 * Included AI credits for a package at a given estate size.
 *
 * Price book v1.7 section 8.1. The included allowance scales with EVERY
 * licensed location, including the first — the same rule the backend applies in
 * `billing_service.ts` (`base + perLocation * activeLocations`) and documents in
 * `pricing_engine.ts` ("credits scale with EVERY licensed location, not
 * additional-after-first").
 *
 * The simulator previously rendered `pkg.aiCreditWallet` raw, so an 8-location
 * Core Foundation buyer was shown 14,000 credits against a real 36,400 — the
 * card printed "8 locations · $2,420/mo" directly above it, so it had the unit
 * count and still quoted the base.
 */
export function calculateAiCredits(pkg: CorePackage, locations: number): number {
  const units = Math.max(1, Math.floor(locations));
  return pkg.aiCreditWallet + pkg.aiCreditsPerLocation * units;
}

/**
 * Active-intelligence seats: `seatsIncluded + ceil(units / seatsPerLocations)`.
 * Price book v1.7 section 8.1.
 */
export function calculateIntelligenceSeats(pkg: CorePackage, locations: number): number {
  const units = Math.max(1, Math.floor(locations));
  return pkg.seatsIncluded + Math.ceil(units / pkg.seatsPerLocations);
}

export interface PriceResult {
  subtotal: number;
  discountsApplied: DiscountLine[];
  total: number;
  /** Derived AVERAGE per unit (total ÷ units) — never a per-location rate card. */
  perLocation: number;
  annualTotal: number;
  /** Included monthly credits at THIS estate size — base plus per-location. */
  aiCreditsTotal: number;
  /** Base wallet alone, for the "of which rolls over" line. */
  aiCreditsBase: number;
  /** Unused base credits that roll over for one month. */
  aiCreditsRolloverCap: number;
  /** Active-intelligence seats included at this estate size. */
  intelligenceSeats: number;
  breakdown: PriceBreakdown[];
  /** True past the self-serve volume ladder (250+ units) — the deal is quoted. */
  requiresEnterpriseQuote: boolean;
  /**
   * ONE implementation charge for the whole selection, resolved at the highest
   * class present. Never a sum, and never part of `subtotal`/`total` (those are
   * recurring monthly figures).
   */
  implementation: ImplementationResult;
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
  /** Highest PUBLISHED class in the selection, or null when none is known. */
  classId: ImplementationClassId | null;
  name: string;
  fee: number;
  /** True when the published fee is a floor ("from $12,500"). */
  isFloor: boolean;
  /**
   * True when at least one selected SKU has no published v1.7 implementation
   * class. The quote must then say implementation is scoped at contract
   * instead of printing `fee` as if it were the answer.
   */
  requiresScoping: boolean;
}

/**
 * Implementation is a single line, never a per-SKU sum. Give it every class in
 * the selection and it returns the HIGHEST one.
 *
 * A `null` entry means "this SKU's class is not published under v1.7". Those
 * do not lower the resolved class — they raise `requiresScoping`, so the
 * caller renders "scoped at contract" rather than inventing a fee.
 */
export function resolveImplementationFee(
  classIds: (ImplementationClassId | null | undefined)[],
): ImplementationResult {
  const known = classIds
    .filter((id): id is ImplementationClassId => Boolean(id && implementationClasses[id]))
    .map((id) => implementationClasses[id]);

  const requiresScoping = classIds.some((id) => !id || !implementationClasses[id as ImplementationClassId]);

  if (known.length === 0) {
    return {
      classId: requiresScoping ? null : 'self_service',
      name: requiresScoping ? 'Scoped at contract' : implementationClasses.self_service.name,
      fee: requiresScoping ? 0 : implementationClasses.self_service.fee,
      isFloor: false,
      requiresScoping,
    };
  }

  const winner = known.reduce(
    (highest, candidate) => (candidate.rank > highest.rank ? candidate : highest),
    implementationClasses.self_service,
  );

  return {
    classId: winner.id,
    name: winner.name,
    fee: winner.fee,
    isFloor: winner.isFloor,
    requiresScoping,
  };
}

/** The published ladder, for "charged once at the highest class" copy. */
export const implementationLadder = IMPLEMENTATION_CLASS_ORDER.map(
  (id) => implementationClasses[id],
);

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
// v1.7: EVERY calculated discount combines into ONE percentage, capped at 15%.
// That includes the early-adopter programme rate — applying it after the cap
// (as v5.1 did) produced a 32% effective discount and breached the published
// ceiling. Only a hand-negotiated contract term sits outside the ladder.
// ═══════════════════════════════════════════════════════════════════════════

export type DiscountKey =
  | 'volume'
  | 'term'
  | 'earlyAdopter'
  | 'volumeNotApplied'
  | 'termNotApplied';

export interface CombinedDiscount {
  volumePercent: number;
  billingPercent: number;
  earlyAdopterPercent: number;
  /** volume + billing + early adopter, clamped to the combined cap. */
  /** The concession that actually applied; zero for the term that lost. */
  appliedVolumePercent: number;
  appliedBillingPercent: number;
  totalPercent: number;
  capped: boolean;
}

export function calculateCombinedDiscount(
  locations: number,
  billingCycle?: BillingCycle,
  isEarlyAdopter = false,
): CombinedDiscount {
  const volumePercent = getVolumeDiscount(locations);
  const billingPercent = billingCycle ? billingDiscounts[billingCycle] : 0;
  const earlyAdopterPercent = isEarlyAdopter ? EARLY_ADOPTER_TERMS.discountPercent : 0;

  // Volume and billing cycle are MUTUALLY EXCLUSIVE — the buyer gets whichever
  // is larger, never both. This used to ADD them and lean on the 15% cap to
  // hide the difference, which quoted a discount the billing system will not
  // honour: a 240-location group on annual billing was promised 15% against a
  // real 10%, or $2,092/mo of discount that does not exist. The cap is a
  // ceiling, not the rule.
  const commitmentPercent = Math.max(volumePercent, billingPercent);

  // The early-adopter concession is a separate grant rather than a commitment
  // term, so it stacks — but inside the same published ceiling.
  const raw = commitmentPercent + earlyAdopterPercent;
  const totalPercent = Math.min(raw, DISCOUNT_RULES.maxDiscountPercent);
  return {
    volumePercent,
    billingPercent,
    earlyAdopterPercent,
    /** The one that actually applied. Zero for the term that lost. */
    appliedVolumePercent: commitmentPercent === volumePercent ? volumePercent : 0,
    appliedBillingPercent:
      commitmentPercent === volumePercent && volumePercent >= billingPercent ? 0 : billingPercent,
    totalPercent,
    capped: raw > totalPercent,
  };
}

export function applyDiscounts(
  subtotal: number,
  profile: ClientProfile,
  locations: number,
): { total: number; discounts: DiscountLine[] } {
  let running = subtotal;
  const discounts: DiscountLine[] = [];

  const combined = calculateCombinedDiscount(
    locations,
    profile.billingCycle,
    profile.isEarlyAdopter,
  );
  const rules = CLIENT_TYPE_RULES[profile.type];

  if (combined.totalPercent > 0 && rules?.pricingModel !== 'enterprise') {
    const amt = running * (combined.totalPercent / 100);
    running -= amt;

    // ITEMISED, so the line items reconcile to the number the buyer sees. A
    // single "Combined discount" line meant a reader could not check the total
    // against its parts, and could not tell WHICH concession they had been
    // given — the two are negotiated separately.
    // Labels carry a STABLE KEY alongside the English text so the summary can
    // localise them. The engine has no locale, and emitting only English here
    // is why the discount lines stayed English on a translated quote.
    const applied: Array<{ label: string; key: DiscountKey; percent: number }> = [];
    if (combined.appliedVolumePercent > 0) {
      applied.push({
        label: `Volume (${locations} locations)`,
        key: 'volume',
        percent: combined.appliedVolumePercent,
      });
    }
    if (combined.appliedBillingPercent > 0) {
      applied.push({ label: 'Commitment term', key: 'term', percent: combined.appliedBillingPercent });
    }
    if (combined.earlyAdopterPercent > 0) {
      applied.push({ label: 'Early adopter', key: 'earlyAdopter', percent: combined.earlyAdopterPercent });
    }

    // Split the money across the applied concessions in proportion to their
    // rates, so the parts sum EXACTLY to the amount charged even after the cap
    // bites. Rounding is absorbed by the last line rather than left to drift.
    const rateSum = applied.reduce((t, a) => t + a.percent, 0) || 1;
    let assigned = 0;
    applied.forEach((a, i) => {
      const isLast = i === applied.length - 1;
      const share = isLast ? amt - assigned : Math.round(amt * (a.percent / rateSum) * 100) / 100;
      assigned += share;
      discounts.push({
        name: combined.capped && isLast
          ? `${a.label} — ${a.percent}% (capped at ${DISCOUNT_RULES.maxDiscountPercent}% combined)`
          : `${a.label} — ${a.percent}%`,
        key: a.key,
        capped: combined.capped && isLast,
        amount: -share,
        percent: a.percent,
      });
    });

    // The term that lost the exclusive choice is stated, not silently dropped,
    // so a buyer can see the trade rather than wonder where it went.
    if (combined.volumePercent > 0 && combined.appliedVolumePercent === 0) {
      discounts.push({
        name: `Volume ${combined.volumePercent}% not applied — commitment term is larger`,
        key: 'volumeNotApplied',
        amount: 0,
        percent: combined.volumePercent,
      });
    } else if (combined.billingPercent > 0 && combined.appliedBillingPercent === 0) {
      discounts.push({
        name: `Commitment term ${combined.billingPercent}% not applied — volume is larger`,
        key: 'termNotApplied',
        amount: 0,
        percent: combined.billingPercent,
      });
    }
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

  let aiCredits = calculateAiCredits(pkg, locations);

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
    // Concept pathways price on a MARGINAL curve, exactly like the Core
    // packages. This used to push `concept.monthlyPrice` with the note "Flat
    // monthly", which at 25 locations understated Production & Commissary by
    // $2,055/mo — and asserted the very mechanic that made it wrong.
    const concept = conceptSkus[addOnId];
    const conceptPrice = calculateBandedTotal(concept, locations);
    const conceptLines = calculateBandLines(concept, locations);
    breakdown.push({
      item: concept.name,
      price: conceptPrice,
      note:
        locations === 1
          ? `First unit $${concept.firstUnitPrice.toLocaleString()}`
          : `First unit $${concept.firstUnitPrice.toLocaleString()} + ${conceptLines
              .map((l) => `${l.units} @ $${l.band.pricePerUnit}`)
              .join(' + ')}`,
    });
  }

  // Watchtower requires Core Growth or above. Without this the engine happily
  // priced Watchtower onto a Core Foundation quote — selling an entitlement the
  // package does not grant.
  if (config.watchtower.length > 0 && !packageAllowsWatchtower(config.corePackage)) {
    breakdown.push({
      item: 'Watchtower',
      price: 0,
      note: 'Requires Core Growth or above — not included at this package',
    });
  }
  if (config.watchtower.length > 0 && packageAllowsWatchtower(config.corePackage)) {
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
    aiCreditsBase: pkg.aiCreditWallet,
    aiCreditsRolloverCap: pkg.creditRolloverCap,
    intelligenceSeats: calculateIntelligenceSeats(pkg, locations),
    breakdown,
    requiresEnterpriseQuote: requiresEnterpriseQuote(locations),
    implementation: resolveCoreImplementation(config),
  };
}

/**
 * The single implementation charge for a Core configuration. Collects the
 * implementation class of every selected SKU and resolves the HIGHEST — the
 * per-module setup-fee ladder that used to be summed here is retired.
 */
export function resolveCoreImplementation(config: Configuration): ImplementationResult {
  const classIds: (ImplementationClassId | null)[] = [
    corePackages[config.corePackage].implementationClass,
    ...config.addOns.map((id) =>
      id === 'foresight_action'
        ? foresightAction.implementationClass
        : conceptSkus[id].implementationClass,
    ),
  ];
  return resolveImplementationFee(classIds);
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

/**
 * How many modules Tenzo actually sells.
 *
 * `src/data/competitorPricing.ts` (verified against tenzo.io/pricing, last
 * checked 2026-01-01) lists sales, labor and inventory as available and
 * marketing, purchasing, reservations and watchtower as NOT available.
 */
export const TENZO_SELLABLE_MODULES = 3;

/**
 * Tenzo's price for a like-for-like purchase.
 *
 * This was called with `moduleCount = 11` — Sundae's domain count — which
 * invoiced Tenzo for eight modules they do not sell and inflated them 3.7x
 * ($6,600/mo against a real $1,800 at eight locations). The resulting "save 43%
 * vs Tenzo" badge was an artefact of pricing a configuration the competitor
 * cannot supply.
 *
 * The honest comparison is not price at equal module count — it is that Sundae
 * covers eleven domains and Tenzo covers three. Clamping here means no caller
 * can reproduce the inflated figure.
 */
export function calculateTenzoPrice(locations: number, moduleCount: number) {
  const billable = Math.min(Math.max(0, moduleCount), TENZO_SELLABLE_MODULES);
  const monthly = locations * billable * 75;
  const setup = locations * billable * 350;
  return { monthly, setup, firstYear: monthly * 12 + setup, modulesPriced: billable };
}
