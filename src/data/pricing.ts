// ═══════════════════════════════════════════════════════════════════════════
// SUNDAE PRICING DATA — PRICING SITE MIRROR (PRICE BOOK v1.7)
// ═══════════════════════════════════════════════════════════════════════════
// UPDATED: 2026-08-10 — cutover to approved price book v1.7.
//   • Report Lite/Plus/Pro, Core Lite and Core Pro are RETIRED. They are not
//     offered anywhere in this app. Their ids survive ONLY in
//     `RETIRED_CATALOG_IDS` so an existing subscription can still be read and
//     labelled; nothing may quote or sell them.
//   • Core is sold as four PACKAGES (Foundation / Margin / Growth /
//     Performance) priced as a FIRST-UNIT anchor plus MARGINAL per-unit bands.
//   • The eleven Core DOMAIN modules are PACKAGE COMPONENTS. They are never
//     offered a la carte and carry no price of their own.
//   • Foresight & Action is its own banded layer, not a domain module.
//   • Implementation is charged ONCE, at the highest class in the selection —
//     replacing the retired per-module setup-fee ladder.
//
// ── MARGINAL BAND MECHANIC (read this before touching any price) ───────────
// Bands are MARGINAL. Reaching a band does NOT reprice earlier units.
//   5 Core Foundation locations = 1195 + 4 × 175 = $1,895 total ($379 each).
// A banded SKU therefore has NO "included locations" and no flat per-location
// rate. Copy such as "base (covers 3) + $X/loc beyond 3" is the RETIRED v5.1
// mechanic and is factually wrong under v1.7 — never reintroduce it.
//
// PREVIOUS: 2026-05-28 (Foresight module), 2026-02-26 (v5.1).
import type { FullyLocalizedPricingLocale, PricingLocale } from '../lib/locales';
import { generatedAddOnDisplay, generatedTierDisplay } from '../lib/generatedPricingLocalePacks';

// ── Retired catalog ids ────────────────────────────────────────────────────
// Read-only compatibility aliases. Present so an existing subscription record
// can be recognised and labelled; NEVER offered, priced, or advertised.
export const RETIRED_CATALOG_IDS = [
  'report_lite',
  'report_plus',
  'report_pro',
  'core_lite',
  'core_pro',
] as const;
export type RetiredCatalogId = (typeof RETIRED_CATALOG_IDS)[number];

export function isRetiredCatalogId(id: string): id is RetiredCatalogId {
  return (RETIRED_CATALOG_IDS as readonly string[]).includes(id);
}

// ── v1.7 catalog ids ───────────────────────────────────────────────────────
export type CorePackageId =
  | 'core_foundation'
  | 'core_margin'
  | 'core_growth'
  | 'core_performance';

// The eleven Core DOMAIN modules. These are PACKAGE COMPONENTS — every Core
// package includes all of them. They are never sold separately, so they carry
// no `orgLicensePrice` / `perLocationPrice` / `setupFee` of their own.
export type ModuleId =
  | 'labor'
  | 'inventory'
  | 'purchasing'
  | 'marketing'
  | 'reservations'
  | 'profit'
  | 'revenue'
  | 'delivery'
  | 'guest'
  | 'pulse'
  | 'guest_crm';

export type ConceptSkuId =
  | 'concept_franchise'
  | 'concept_hotel_fb'
  | 'concept_cloud_kitchen'
  | 'concept_catering'
  | 'concept_production'
  | 'concept_rental_commissary';

export type ImplementationClassId = 'self_service' | 'class_a' | 'class_b' | 'class_c' | 'class_d';

// 6 Crew workforce SKUs. Kept separate from the Core domain modules because
// Crew SKUs carry per-employee caps, dependencies on other Crew SKUs, and a
// hard location cap on `crew_lite`.
export type CrewSkuId = 'crew_lite' | 'crew_scheduling' | 'crew_operations' | 'crew_tna' | 'crew_payroll' | 'crew_people_intelligence';
export type CrewBundleId = 'crew_schedule_time_bundle' | 'crew_suite_bundle' | 'crew_complete_bundle';
export type CrossIntelligenceTier = 'base' | 'pro';
export type WatchtowerId = 'competitive' | 'events' | 'trends' | 'bundle';
export type ClientType = 'independent' | 'growth' | 'multi-site' | 'enterprise' | 'franchise';
/**
 * Commitment term AND payment timing, because the concession is priced on both.
 *
 * v1.7 had one axis — monthly / annual / two-year — so "annual" could not
 * distinguish a customer paying quarterly from one paying twelve months up
 * front, though the cash position and therefore the discount differ. v1.8
 * prices the pair, and the two-year offer carries a 24-month price lock, which
 * is a contractual commitment on our side rather than a further discount.
 */
export type BillingCycle =
  | 'monthly'
  | 'annual_quarterly'
  | 'annual_upfront'
  | 'two_year_upfront';

/** Terms that existed before payment timing was priced, and what they became. */
export const LEGACY_BILLING_CYCLES: Record<string, BillingCycle> = {
  annual: 'annual_upfront',
  two_year: 'two_year_upfront',
};

// ── Marginal band primitives ───────────────────────────────────────────────

export interface MarginalBand {
  /** First unit (1-indexed) this band prices. */
  fromUnit: number;
  /** Last unit this band prices. `null` = terminal band. */
  toUnit: number | null;
  /** Marginal price for EACH unit that falls inside this band. */
  pricePerUnit: number;
  /** Display label, e.g. "Units 2–10". */
  label: string;
}

export interface BandedSku {
  id: string;
  name: string;
  /** Anchor price for unit #1. */
  firstUnitPrice: number;
  /** Marginal bands covering unit #2 upward. */
  marginalBands: MarginalBand[];
}

// ═══════════════════════════════════════════════════════════════════════════
// PRICING CHANGELOG
// ═══════════════════════════════════════════════════════════════════════════

export interface PricingChange {
  id: string;
  date: string;
  summary: string;
  sectionsTouched: string[];
  notes: string;
}

export const pricingChangelog: PricingChange[] = [
  {
    id: 'update-2026-01-01',
    date: '2026-01-01',
    summary: 'Complete pricing update to match canonical pricing sheet v2',
    sectionsTouched: [
      'Report tiers',
      'Core tiers',
      'Modules',
      'Watchtower',
      'Features comparison',
      'Add-ons'
    ],
    notes: 'Updated all pricing values, feature entitlements, AI credits, benchmarking details, historical access, and support SLAs to match sundae_pricing_card_v2.md. Added comprehensive feature comparison tables and FAQ content.'
  },
  {
    id: 'update-2026-02-17-v4.3',
    date: '2026-02-17',
    summary: 'Complete pricing update to match sundae_final_pricing_v4.3.md',
    sectionsTouched: [
      'Report tiers',
      'Core tiers',
      'Modules',
      'Watchtower',
      'Module bundles',
      'Discounts',
      'Setup fees',
      'AI credits',
      'Users model',
      'Data refresh',
      'Enterprise eligibility',
      'Trial policy'
    ],
    notes: 'v4.3: Updated all tier pricing. AI credits 10x increase. Added Pulse module. Added 6 module bundles. Changed discount model to non-stacking volume/billing (max 15%). Added setup fees. Changed watchtower bundle from $720 to $699 (~18% savings). Updated users model and data refresh terminology.'
  },
  {
    id: 'update-2026-02-26-v5.1',
    date: '2026-02-26',
    summary: 'Complete pricing update to match sundae_final_pricing_v5.1.md',
    sectionsTouched: [
      'Report tiers',
      'Core tiers',
      'Modules',
      'Module bundles',
      'Watchtower',
      'Discounts',
      'AI credits',
      'Seat caps',
      'Intelligence pricing',
      'Connector setup tiers',
      'Terminology'
    ],
    notes: 'v5.1: Updated Report Plus to $79, Report Pro to $159, Core Lite to $279, Core Pro to $449. Tier-aware module pricing (Core Lite vs Core Pro). Tier-aware bundle pricing. Updated seat caps with max additional limits. Introduced "Sundae Intelligence" branding ($79 unlock, $399 Intelligence Pro). Replaced "data retention" with "historical access". Added connector setup tiers. Reduced baseIncludesLocations from 5 to 3 for modules. Updated volume discount thresholds.'
  },
  {
    id: 'update-2026-08-10-v1.7',
    date: '2026-08-10',
    summary: 'Cutover to approved price book v1.7',
    sectionsTouched: [
      'Report tiers (retired)',
      'Core tiers (retired, replaced by Core packages)',
      'Core packages',
      'Core domain modules',
      'Foresight & Action',
      'Concept SKUs',
      'Implementation classes',
      'Crew SKUs and bundles',
      'Volume ladder',
      'Billing-cycle discounts'
    ],
    notes:
      'v1.7: Retired Report Lite/Plus/Pro, Core Lite and Core Pro — they are no longer offered anywhere. ' +
      'Core is now four packages (Foundation $1,195 / Margin $1,650 / Growth $1,925 / Performance $2,980) priced as a ' +
      'first-unit anchor plus MARGINAL bands for units 2-10 / 11-25 / 26-50 / 51+. The retired "base covers 3 locations, ' +
      'then $X per extra location" mechanic is gone: banded SKUs have no included locations and no flat per-location rate. ' +
      'The eleven Core domain modules became package components with no standalone price, and the per-module setup-fee ' +
      'ladder ($299/$399/$499/$599) was replaced by implementation classes charged once at the highest class in the ' +
      'selection ($0 self-service / $1,500 A / $2,500 B / $7,500 C / from $12,500 D). Foresight & Action became its own ' +
      'banded layer ($495 first unit, then 65/55/45/35). Crew bundles repriced (Schedule & Time $249 added, Crew ' +
      'Operating $499, Crew Complete $699). Volume ladder is now 0% under 50, 2.5% at 50-99, 5% at 100-199, 7% at ' +
      '200-249, Enterprise-only at 250+. Volume and billing-cycle discounts are mutually exclusive: the larger applies. ' +
      'Early-adopter concessions share the 15% calculated-discount cap.'
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// CORE DOMAIN MODULES — the eleven package components
// ═══════════════════════════════════════════════════════════════════════════
// These eleven are the Core domain catalogue. They are NOT sold separately;
// each package grants the outcome set declared in PACKAGE_DOMAIN_GRANTS.

export const CORE_DOMAIN_MODULE_IDS = [
  'labor',
  'inventory',
  'purchasing',
  'marketing',
  'reservations',
  'profit',
  'revenue',
  'delivery',
  'guest',
  'pulse',
  'guest_crm',
] as const satisfies readonly ModuleId[];

/**
 * Which domains each Core package actually grants — price book v1.7 section
 * 3.1, mirroring CANONICAL_PACKAGE_MODULES in the backend.
 *
 * Every package used to point at CORE_DOMAIN_MODULE_IDS, so all four granted
 * all eleven domains and differed ONLY by price, credits and seats. That made
 * the ladder irrational — nobody would pay $2,980 for Performance when
 * Foundation gave the same coverage at $1,195 — and it fed the ROI model, which
 * credited savings from every domain regardless of package. A Core Foundation
 * buyer was shown roughly ten times the savings their package can deliver.
 *
 * Foundation and Growth deliberately receive the governed labour and cost
 * SIGNAL needed to compute profit without the full Inventory and Purchasing
 * experience. That signal-versus-experience boundary is the ladder.
 *
 * Site ids differ slightly from the backend's: `revenue` here is the backend's
 * `revenue_assurance`, and `guest` is `guest_experience`. `foresight` is sold
 * as the separate Foresight & Action expansion rather than a domain, so it does
 * not appear in this list.
 */
export const PACKAGE_DOMAIN_GRANTS = {
  core_foundation: ['labor', 'profit', 'revenue', 'pulse'],
  core_margin: ['labor', 'inventory', 'profit', 'revenue', 'pulse', 'purchasing'],
  core_growth: [
    'labor',
    'profit',
    'revenue',
    'pulse',
    'marketing',
    'reservations',
    'guest',
    'guest_crm',
  ],
  core_performance: [...CORE_DOMAIN_MODULE_IDS],
} as const satisfies Record<CorePackageId, readonly ModuleId[]>;

// ═══════════════════════════════════════════════════════════════════════════
// CORE PACKAGES (price book v1.7)
// ═══════════════════════════════════════════════════════════════════════════
// FIRST-UNIT anchor, then MARGINAL bands. Bands never reprice earlier units:
//   5 Core Foundation locations = 1195 + 4 × 175 = $1,895 ($379 each).
// There is no "included locations" allowance and no flat per-location rate.
//
// The published band table stops at unit 100. The terminal band below is
// modelled as open-ended (51+) so the 100-249 self-serve volume bands remain
// quotable; see the note in `remaining` if a 101+ band is published later.

function band(fromUnit: number, toUnit: number | null, pricePerUnit: number): MarginalBand {
  return {
    fromUnit,
    toUnit,
    pricePerUnit,
    label: toUnit === null ? `Units ${fromUnit}+` : `Units ${fromUnit}–${toUnit}`,
  };
}

export interface CorePackage extends BandedSku {
  id: CorePackageId;
  tagline: string;
  /**
   * BASE monthly AI credit wallet. This is NOT the customer's wallet — the
   * included allowance scales with every licensed location. Use
   * `calculateAiCredits()`; rendering this field raw understates a 10-location
   * Core Foundation wallet by 20,000 credits.
   */
  aiCreditWallet: number;
  /**
   * Credits added per LICENSED LOCATION, including the first. Price book v1.7
   * section 8.1; matches `billing_service.ts` (`base + perLocation * locations`)
   * and the note in `pricing_engine.ts` that credits "scale with EVERY licensed
   * location, not additional-after-first".
   */
  aiCreditsPerLocation: number;
  /** Active-intelligence seats included before per-location scaling. */
  seatsIncluded: number;
  /** One further seat per this many licensed locations. */
  seatsPerLocations: number;
  /** Unused BASE credits that roll over for one month (25% of base). */
  creditRolloverCap: number;
  /** The domains this package actually grants — see PACKAGE_DOMAIN_GRANTS. */
  includesDomainModules: readonly ModuleId[];
  /**
   * What the buyer GETS, in outcome language. Price book v1.7 section 3.1 is
   * explicit that a prospect should never hear "signal but not experience"
   * withholding language, so the cards state the delivered outcome rather than
   * a module count out of eleven.
   */
  includedOutcome: string;
  bestFor: string;
  /**
   * Implementation class for this SKU, or `null` when v1.7 does not publish
   * one. v1.7 publishes the LADDER ($0 / $1,500 / $2,500 / $7,500 / from
   * $12,500) but not a per-SKU assignment, so every Core package is `null`:
   * the quote states that implementation is scoped at contract and charged
   * once at the highest class, rather than inventing a fee. See
   * `resolveImplementationFee`.
   */
  implementationClass: ImplementationClassId | null;
}

export const corePackages: Record<CorePackageId, CorePackage> = {
  core_foundation: {
    id: 'core_foundation',
    name: 'Core Foundation',
    tagline: 'The whole business, one decision layer',
    firstUnitPrice: 1195,
    marginalBands: [band(2, 10, 175), band(11, 25, 150), band(26, 50, 125), band(51, 100, 115), band(101, 150, 110), band(151, 250, 105), band(251, null, 100)],
    aiCreditWallet: 14000,
    aiCreditsPerLocation: 2800,
    seatsIncluded: 4,
    seatsPerLocations: 5,
    creditRolloverCap: 3500,
    includesDomainModules: PACKAGE_DOMAIN_GRANTS.core_foundation,
    includedOutcome:
      'Connected revenue intelligence, the Recovery workspace and ledger, real-time Pulse, and the labour and cost signals that calculate profit',
    bestFor: 'Operators starting on the Core decision layer',
    implementationClass: null,
  },
  core_margin: {
    id: 'core_margin',
    name: 'Core Margin',
    tagline: 'Protect the margin you already earn',
    firstUnitPrice: 1650,
    marginalBands: [band(2, 10, 245), band(11, 25, 210), band(26, 50, 175), band(51, 100, 165), band(101, 150, 155), band(151, 250, 145), band(251, null, 140)],
    aiCreditWallet: 16000,
    aiCreditsPerLocation: 3200,
    seatsIncluded: 5,
    seatsPerLocations: 4,
    creditRolloverCap: 4000,
    includesDomainModules: PACKAGE_DOMAIN_GRANTS.core_margin,
    includedOutcome:
      'Everything in Foundation, plus the full buying, inventory, waste and recipe cost-control experience',
    bestFor: 'Operators whose priority is cost and leakage control',
    implementationClass: null,
  },
  core_growth: {
    id: 'core_growth',
    name: 'Core Growth',
    tagline: 'Grow the top line without losing the bottom',
    firstUnitPrice: 1925,
    marginalBands: [band(2, 10, 260), band(11, 25, 225), band(26, 50, 190), band(51, 100, 180), band(101, 150, 170), band(151, 250, 160), band(251, null, 150)],
    aiCreditWallet: 18000,
    aiCreditsPerLocation: 3600,
    seatsIncluded: 6,
    seatsPerLocations: 3,
    creditRolloverCap: 4500,
    includesDomainModules: PACKAGE_DOMAIN_GRANTS.core_growth,
    includedOutcome:
      'Everything in Foundation, plus guest behaviour, CRM, reservations, campaigns and reputation, with access to add Watchtower',
    bestFor: 'Operators in expansion who need demand and channel signal',
    implementationClass: null,
  },
  core_performance: {
    id: 'core_performance',
    name: 'Core Performance',
    tagline: 'Run the portfolio on one performance standard',
    firstUnitPrice: 2980,
    marginalBands: [band(2, 10, 409), band(11, 25, 348), band(26, 50, 290), band(51, 100, 275), band(101, 150, 255), band(151, 250, 245), band(251, null, 230)],
    aiCreditWallet: 24000,
    aiCreditsPerLocation: 4800,
    seatsIncluded: 8,
    seatsPerLocations: 2,
    creditRolloverCap: 6000,
    includesDomainModules: PACKAGE_DOMAIN_GRANTS.core_performance,
    includedOutcome:
      'The complete Core estate — every outcome domain, ready to extend with Foresight & Action',
    bestFor: 'Multi-brand and multi-region portfolios',
    implementationClass: null,
  },
};

export const CORE_PACKAGE_IDS = Object.keys(corePackages) as CorePackageId[];

// ═══════════════════════════════════════════════════════════════════════════
// PACKAGE SHAPE — which side of the business a package works
// ═══════════════════════════════════════════════════════════════════════════

/**
 * The four Core packages are NOT four rungs of one ladder, and presenting them
 * as one misleads the buyer in a way that costs them capability.
 *
 * Core Growth has a $1,925 first-unit anchor and does not include the
 * Inventory or Purchasing modules that Margin has — it trades them for
 * Marketing, Reservations, Guest and Guest CRM. So a buyer who "upgrades" from
 * Margin to Growth LOSES the ability to manage food cost and supplier pricing,
 * and the ROI model correctly shows their modelled savings FALL as they pay
 * more (-$615/mo at one location, -$12,317/mo at twenty), because inventory and
 * purchasing carry two of the best-evidenced savings rates in the model.
 *
 * Nothing here changes what a package grants — price book v1.7 section 3.1 is
 * untouched. This is the vocabulary the UI needs so it can present Margin and
 * Growth as a FORK rather than as steps, which is the only description of the
 * catalogue that is actually true.
 */
export const COST_SIDE_DOMAINS = ['inventory', 'purchasing'] as const;
export const DEMAND_SIDE_DOMAINS = ['marketing', 'reservations', 'guest', 'guest_crm'] as const;

export type PackageShape = 'entry' | 'cost_side' | 'demand_side' | 'both_sides';

/**
 * Derived from the grants rather than hand-declared, so a package cannot claim
 * a shape its module list does not support.
 */
export function packageShape(id: CorePackageId): PackageShape {
  const granted = new Set(PACKAGE_DOMAIN_GRANTS[id] as readonly string[]);
  const cost = COST_SIDE_DOMAINS.some((d) => granted.has(d));
  const demand = DEMAND_SIDE_DOMAINS.some((d) => granted.has(d));
  if (cost && demand) return 'both_sides';
  if (cost) return 'cost_side';
  if (demand) return 'demand_side';
  return 'entry';
}

/**
 * Domains a rival package grants that this one does not — what the buyer would
 * GIVE UP by choosing it. Empty for the package that grants everything.
 */
export function domainsGivenUp(id: CorePackageId): readonly string[] {
  const granted = new Set(PACKAGE_DOMAIN_GRANTS[id] as readonly string[]);
  const elsewhere = new Set<string>();
  for (const other of Object.keys(PACKAGE_DOMAIN_GRANTS) as CorePackageId[]) {
    if (other === id) continue;
    for (const d of PACKAGE_DOMAIN_GRANTS[other] as readonly string[]) {
      if (!granted.has(d)) elsewhere.add(d);
    }
  }
  return [...elsewhere];
}



// ═══════════════════════════════════════════════════════════════════════════
// FORESIGHT & ACTION (price book v1.7)
// ═══════════════════════════════════════════════════════════════════════════
// The predictive-planning + actuation layer. Its own banded SKU — NOT one of
// the eleven Core domain modules and no longer an a-la-carte analytics module.

export const foresightAction: BandedSku & {
  tagline: string;
  description: string;
  features: string[];
  /** Not published under v1.7 — scoped at contract. See `CorePackage`. */
  implementationClass: ImplementationClassId | null;
} = {
  id: 'foresight_action',
  name: 'Foresight & Action',
  tagline: 'Plan forward, then act on the plan',
  firstUnitPrice: 495,
  marginalBands: [band(2, 10, 65), band(11, 25, 55), band(26, 50, 45), band(51, null, 35)],
  implementationClass: null,
  description:
    'Predictive planning plus the action layer: demand and revenue forecasting, scenario modelling, sensitivity analysis, decision replay, and approve-in-the-loop actuation.',
  features: [
    'Demand and revenue forecasting with confidence bands',
    'Scenario modeler + sandbox',
    'Sensitivity analysis across assumptions',
    'P&L Forecast (revenue / labor / COGS / prime cost / margin / EBIT)',
    'Budget intake and planning integration',
    'Decision Replay (operator actions vs outcomes)',
    'Cross-module cascade effects (labor ↔ inventory ↔ purchasing)',
    'AI-generated Morning Brief + Briefing Coach',
    'Forecast accuracy tracking and correction loop',
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// CONCEPT SKUs (price book v1.7)
// ═══════════════════════════════════════════════════════════════════════════
// Flat monthly concept extensions. v1.7 publishes a single price per concept;
// no per-unit band is published, so none is modelled here.

export interface ConceptSku extends BandedSku {
  id: ConceptSkuId;
  /**
   * DEPRECATED as a price. Concept pathways price on a MARGINAL curve exactly
   * like the Core packages — this field is the first-unit anchor only, kept for
   * callers that render a headline.
   *
   * It used to be the whole price, and the picker told buyers "Flat monthly —
   * not per location". At 25 locations that understated Production &
   * Commissary by $2,055/mo and Hotel F&B by $1,845/mo, while asserting the
   * mechanic that made it wrong. Use `calculateBandedTotal(concept, units)`.
   */
  monthlyPrice: number;
  description: string;
  /** Not published under v1.7 — scoped at contract. See `CorePackage`. */
  implementationClass: ImplementationClassId | null;
}

export const conceptSkus: Record<ConceptSkuId, ConceptSku> = {
  concept_franchise: {
    id: 'concept_franchise',
    name: 'Franchise',
    firstUnitPrice: 595,
    marginalBands: [band(2, 10, 75), band(11, 25, 65), band(26, 50, 55), band(51, null, 45)],
    monthlyPrice: 595,
    description: 'Franchisor / franchisee split reporting, royalty visibility, and network health.',
    implementationClass: null,
  },
  concept_hotel_fb: {
    id: 'concept_hotel_fb',
    name: 'Hotel F&B',
    firstUnitPrice: 395,
    marginalBands: [band(2, 10, 85), band(11, 25, 72), band(26, 50, 60), band(51, null, 48)],
    monthlyPrice: 395,
    description: 'Outlet-level F&B economics inside a hotel P&L, including banqueting and in-room.',
    implementationClass: null,
  },
  concept_cloud_kitchen: {
    id: 'concept_cloud_kitchen',
    name: 'Cloud Kitchen',
    firstUnitPrice: 395,
    marginalBands: [band(2, 10, 69), band(11, 25, 59), band(26, 50, 49), band(51, null, 39)],
    monthlyPrice: 395,
    description: 'Virtual-brand and delivery-only economics across shared kitchen capacity.',
    implementationClass: null,
  },
  concept_catering: {
    id: 'concept_catering',
    name: 'Catering',
    firstUnitPrice: 349,
    marginalBands: [band(2, 10, 69), band(11, 25, 59), band(26, 50, 59), band(51, null, 49)],
    monthlyPrice: 349,
    description: 'Event and contract catering: quote-to-actual margin, event costing, and pipeline.',
    implementationClass: null,
  },
  concept_production: {
    id: 'concept_production',
    name: 'Production',
    firstUnitPrice: 595,
    marginalBands: [band(2, 10, 95), band(11, 25, 80), band(26, 50, 65), band(51, null, 50)],
    monthlyPrice: 595,
    description: 'Central production and commissary output: yield, batch cost, and transfer pricing.',
    implementationClass: null,
  },
  concept_rental_commissary: {
    id: 'concept_rental_commissary',
    name: 'Rental Commissary',
    firstUnitPrice: 395,
    marginalBands: [band(2, 10, 75), band(11, 25, 65), band(26, 50, 55), band(51, null, 45)],
    monthlyPrice: 395,
    description: 'Commissary space let to third parties: tenant utilisation, billing, and recovery.',
    implementationClass: null,
  },
};

export const CONCEPT_SKU_IDS = Object.keys(conceptSkus) as ConceptSkuId[];

// ═══════════════════════════════════════════════════════════════════════════
// IMPLEMENTATION CLASSES (price book v1.7)
// ═══════════════════════════════════════════════════════════════════════════
// Replaces the retired per-module setup-fee ladder. Implementation is charged
// ONCE per engagement, at the HIGHEST class present in the selection — never
// summed per SKU.

export interface ImplementationClass {
  id: ImplementationClassId;
  name: string;
  /** One-time fee. */
  fee: number;
  /** True when the published fee is a floor ("from $12,500"). */
  isFloor: boolean;
  /** Ordering rank — the highest rank in a selection is the one charged. */
  rank: number;
}

/**
 * Watchtower requires Core Growth or above. `allowsWatchtower` is FALSE on
 * Foundation and Margin in the backend's pricing_master, but the simulator had
 * no gate at all — in the data model, the UI or the engine — so a Core
 * Foundation buyer could add Watchtower and be quoted for something their
 * package does not grant.
 */
export const WATCHTOWER_MIN_PACKAGE: CorePackageId = 'core_growth';

const WATCHTOWER_ALLOWED: readonly CorePackageId[] = ['core_growth', 'core_performance'];

export function packageAllowsWatchtower(id: CorePackageId): boolean {
  return WATCHTOWER_ALLOWED.includes(id);
}

export const implementationClasses: Record<ImplementationClassId, ImplementationClass> = {
  self_service: { id: 'self_service', name: 'Self-service', fee: 0, isFloor: false, rank: 0 },
  class_a: { id: 'class_a', name: 'Class A', fee: 1500, isFloor: false, rank: 1 },
  class_b: { id: 'class_b', name: 'Class B', fee: 2500, isFloor: false, rank: 2 },
  class_c: { id: 'class_c', name: 'Class C', fee: 7500, isFloor: false, rank: 3 },
  class_d: { id: 'class_d', name: 'Class D', fee: 12500, isFloor: true, rank: 4 },
};

export const IMPLEMENTATION_CLASS_ORDER: ImplementationClassId[] = [
  'self_service',
  'class_a',
  'class_b',
  'class_c',
  'class_d',
];

// ═══════════════════════════════════════════════════════════════════════════
// ENTERPRISE (custom, quoted)
// ═══════════════════════════════════════════════════════════════════════════
// v1.7 keeps Enterprise as the quoted path (mandatory from 250 units, where
// there is no self-serve band).

export const coreTiers = {
  enterprise: {
    id: 'core-enterprise',
    name: 'Enterprise',
    tagline: 'Custom Solutions',
    basePrice: 'Custom',
    additionalLocationPrice: 'Volume-based',
    aiCredits: { base: 50000, perLocation: 5000 },
    aiSeats: 'Unlimited',
    benchmarkMetrics: '30+',
    benchmarkRadius: 'Custom geography',
    visuals: 200,
    dataInput: 'Real-time POS API',
    historicalAccess: 'Custom (typically 5+ years)',
    refresh: 'Real-time',
    support: 'Dedicated CSM (24/7 available, 15min SLA)',
    rolloverPolicy: 'N/A (unlimited)',
    customDashboards: 'Unlimited',
    customKPIs: 'Unlimited',
    predictiveDays: 'Custom horizon',
    posIntegrations: 'Unlimited + custom',
    multiPOS: true,
    salesAnalyticsIncluded: true,
    historicalData: 'Custom',
    intelligenceAccess: { available: true, unlockFee: 0 },
    pulseAccess: { available: true, unlockFee: 0 },
    apiAccess: true,
    modulesAllowed: true,
    watchtowerAllowed: true,
    aiPackages: true,
    setupFeesWaived: true,
    features: [
      'Everything in Core Performance PLUS:',
      'Dedicated CSM',
      '24/7 support available',
      '15-minute SLA (critical)',
      'Unlimited AI credits & seats',
      'Custom data refresh schedules',
      'Custom ML models',
      'Dedicated AI resources',
      'Private peer groups',
      'Proprietary benchmarks',
      'Multi-brand management',
      'Regional aggregation',
      'Executive dashboards',
      'Full CRUD API access',
      'Custom integrations included',
      'Dedicated endpoints',
      'White-label reporting',
      'Custom onboarding program',
      'Quarterly executive reviews',
      'Archival options'
    ],
    limitations: [],
    bestFor: '250+ locations (no self-serve band) OR enterprise features required (Dedicated CSM, 24/7, SSO, SLAs, security/compliance), Multi-brand portfolios',
    note: 'Enterprise pricing is scope-based. It is mandatory from 250 locations, where the self-serve volume ladder ends, and available earlier when enterprise requirements apply (SSO, SLAs, security/compliance, dedicated CSM, custom ML, white-label, custom integrations).'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// CORE DOMAIN MODULES — descriptors only, NO prices
// ═══════════════════════════════════════════════════════════════════════════
// Under price book v1.7 these eleven are PACKAGE COMPONENTS. Packages grant
// different outcome sets and none is offered a la carte, so the
// commercial fields (orgLicensePrice / perLocationPrice /
// baseIncludesLocations / setupFee / pricingByTier) have been REMOVED rather
// than zeroed — a missing field cannot be accidentally summed into a quote.
//
// Internal keys are LEGACY and preserved for call-site stability; `backendId`
// carries the canonical backend key.

export interface CoreDomainModule {
  id: ModuleId;
  name: string;
  icon: string;
  backendId: string;
  description: string;
  features: string[];
  roiPotential: string;
  /** Always true — sold only as a component of a Core package. */
  packageComponent: true;
  note?: string;
  /** Domain modules whose data this one reads. Informational, not a purchase gate. */
  dataDependencies?: ModuleId[];
}

export const modules: Record<ModuleId, CoreDomainModule> = {
  labor: {
    id: 'labor',
    name: 'Labor Intelligence',
    icon: 'users',
    backendId: 'labor',
    packageComponent: true,
    description: 'Labor cost %, sales per labor hour, actual vs scheduled variance, overtime analysis, break compliance, benchmarking, predictive staffing, demand-based scheduling, shift performance, server rankings',
    features: [
      'Labor cost % by location/day part',
      'Sales per labor hour tracking',
      'Actual vs scheduled variance',
      'Overtime pattern analysis',
      'Break compliance tracking',
      'Labor productivity benchmarking',
      'Predictive staffing recommendations',
      'Demand-based scheduling',
      'Shift performance analysis',
      'Server productivity rankings',
      'Monthly Labor Analytics Report'
    ],
    roiPotential: '1-3% labor cost reduction'
  },

  inventory: {
    id: 'inventory',
    name: 'Inventory Connect',
    icon: 'package',
    backendId: 'inventory',
    packageComponent: true,
    description: 'COGS tracking, recipe costing, theoretical vs actual variance, menu engineering, waste tracking, menu item profitability, price optimization, portion cost, inventory turnover, supplier performance',
    features: [
      'COGS tracking by category',
      'Recipe costing & management',
      'Theoretical vs actual variance',
      'Menu engineering analysis',
      'Waste tracking & cost calculation',
      'Menu item profitability ranking',
      'Price optimization recommendations',
      'Portion cost analysis',
      'Inventory turnover ratios',
      'Supplier performance scoring',
      'Monthly Inventory Analytics Report'
    ],
    roiPotential: '0.5-2% food cost reduction'
  },

  purchasing: {
    id: 'purchasing',
    name: 'Purchasing Analytics',
    icon: 'cart',
    backendId: 'purchasing',
    packageComponent: true,
    description: 'Spend analysis by supplier, price variance alerts, supplier performance, contract compliance, consolidation opportunities, volume discount analysis, order frequency optimization, delivery cost, contract renewal alerts',
    features: [
      'Spend analysis by supplier',
      'Price variance alerts',
      'Supplier performance tracking',
      'Contract compliance monitoring',
      'Consolidation opportunities',
      'Volume discount analysis',
      'Order frequency optimization',
      'Delivery cost analysis',
      'Contract renewal alerts',
      'Monthly Purchasing Analytics Report'
    ],
    roiPotential: '2-5% purchasing savings'
  },

  marketing: {
    id: 'marketing',
    name: 'Marketing Performance',
    icon: 'megaphone',
    backendId: 'marketing',
    packageComponent: true,
    description: 'Meta/Facebook Ads, Google Ads integration, campaign performance, multi-touch attribution, CAC, channel ROI by location, budget allocation, new vs returning customers, lifetime value estimation',
    features: [
      'Meta/Facebook Ads integration',
      'Google Ads integration',
      'Campaign performance tracking',
      'Multi-touch attribution',
      'Customer acquisition cost (CAC)',
      'Channel ROI by location',
      'Budget allocation recommendations',
      'New vs returning customer tracking',
      'Lifetime value estimation',
      'Monthly Marketing Analytics Report'
    ],
    roiPotential: '10-20% marketing efficiency improvement'
  },

  reservations: {
    id: 'reservations',
    name: 'Reservations Intelligence',
    icon: 'calendar',
    backendId: 'reservations',
    packageComponent: true,
    description: 'Booked vs actual, no-show rate tracking, booking channel attribution, table utilization, revenue per reservation, optimal booking pace, cancellation pattern analysis',
    features: [
      'Covers booked vs actual',
      'No-show rate tracking',
      'Booking channel attribution',
      'Table utilization analysis',
      'Revenue per reservation',
      'Optimal booking pace',
      'Cancellation pattern analysis',
      'Monthly Reservations Report'
    ],
    roiPotential: '5-10% table utilization improvement',
    note: 'Covers standalone reservation systems (OpenTable, Resy, SevenRooms) as well as POS-based reservations.'
  },

  profit: {
    id: 'profit',
    name: 'Profit Intelligence',
    icon: 'profit',
    backendId: 'profit',
    packageComponent: true,
    dataDependencies: ['labor', 'inventory'],
    description: 'See true unit economics. Complete P&L visibility, profit margin analysis, cost allocation, break-even analysis, and profitability forecasting by location.',
    features: [
      'True unit economics per location',
      'Complete P&L visibility',
      'Profit margin analysis by daypart',
      'Cost allocation tracking',
      'Break-even analysis',
      'Profitability forecasting',
      'Location-level profit ranking',
      'Monthly Profit Analytics Report'
    ],
    roiPotential: 'See true unit economics'
  },

  revenue: {
    // Internal key kept as `revenue`; backend canonical key is `revenue_assurance`.
    id: 'revenue',
    name: 'Revenue Assurance',
    icon: 'revenue',
    backendId: 'revenue_assurance',
    packageComponent: true,
    description: 'Identify and quantify revenue loss from voids, comps, discounts, theft patterns, and transaction anomalies before they impact your bottom line.',
    features: [
      'Revenue leakage detection',
      'Void pattern analysis',
      'Comp and discount tracking',
      'Theft pattern identification',
      'Transaction anomaly alerts',
      'Employee behavior analysis',
      'Shrinkage quantification',
      'Monthly Revenue Assurance Report'
    ],
    roiPotential: 'Identify and track revenue leakage'
  },

  delivery: {
    id: 'delivery',
    name: 'Delivery Economics',
    icon: 'delivery',
    backendId: 'delivery',
    packageComponent: true,
    description: 'True delivery profitability. Platform-by-platform margin analysis, delivery vs dine-in comparison, commission impact, and channel optimization insights.',
    features: [
      'True delivery profitability',
      'Platform-by-platform margin analysis',
      'Delivery vs dine-in comparison',
      'Commission impact tracking',
      'Driver efficiency metrics',
      'Peak delivery time optimization',
      'Channel mix optimization',
      'Monthly Delivery Economics Report'
    ],
    roiPotential: 'True delivery profitability'
  },

  guest: {
    // Internal key kept as `guest`; backend canonical key is `guest_experience`.
    id: 'guest',
    name: 'Guest Experience',
    icon: 'guest',
    backendId: 'guest_experience',
    packageComponent: true,
    description: 'Why customers leave. Aggregate review sentiment, rating trends, guest feedback patterns, and experience correlation to identify what drives satisfaction.',
    features: [
      'Aggregate review sentiment',
      'Rating trend analysis',
      'Guest feedback patterns',
      'Experience-revenue correlation',
      'Service speed impact',
      'Menu item satisfaction',
      'Repeat visit indicators',
      'Monthly Guest Experience Report'
    ],
    roiPotential: 'Why customers leave'
  },

  pulse: {
    id: 'pulse',
    name: 'Pulse',
    icon: 'pulse',
    backendId: 'pulse',
    packageComponent: true,
    description: 'Real-time operational pulse. Live monitoring, instant alerts, cross-system correlation, and proactive anomaly detection across all your operations.',
    features: [
      'Real-time operational monitoring',
      'Instant anomaly alerts',
      'Cross-system data correlation',
      'Proactive issue detection',
      'Live performance dashboards',
      'Threshold-based notifications',
      'Multi-system health monitoring',
      'Monthly Pulse Analytics Report'
    ],
    roiPotential: 'Real-time operational awareness'
  },

  guest_crm: {
    id: 'guest_crm',
    name: 'Guest CRM Intelligence',
    icon: 'guest',
    backendId: 'guest_crm',
    packageComponent: true,
    description: 'Who your guests are and what brings them back. Segmentation, visit cadence, lifetime value, win-back candidates, and campaign-ready audiences.',
    features: [
      'Guest segmentation and cohorts',
      'Visit cadence and recency analysis',
      'Lifetime value modelling',
      'Churn and win-back candidates',
      'Campaign-ready audience export',
      'Loyalty programme performance',
      'Monthly Guest CRM Report'
    ],
    roiPotential: 'Turn one-time guests into regulars'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// CREW WORKFORCE SKUs (added 2026-05-28)
// ═══════════════════════════════════════════════════════════════════════════
// Six SKUs matching `sundae-backend/config/pricing_master.ts` MODULE_PRICING
// (the Crew portion, sortOrder 11–16). Crew is sold as a separate product
// family from the analytics modules — it can be bought standalone or attached
// alongside analytics. Crew SKUs carry per-employee caps, dependencies on
// other Crew SKUs, and a hard location cap on `crew_lite`.
//
// Source of truth: backend pricing master (reviewed). To detect drift run
// `npm run sync:backend-pricing`.
//
// SKUs and their dependencies:
//   • crew_lite (sortOrder 11)              — entry, hard-cap 5 locations, mutually exclusive with full Crew SKUs
//   • crew_scheduling (12)                  — standalone, no deps
//   • crew_operations (13)                  — no deps
//   • crew_tna (14)                         — depends on crew_scheduling OR crew_operations (Operations entitlement includes Scheduling)
//   • crew_payroll (15)                     — depends on crew_operations (employee records + pay rates)
//   • crew_people_intelligence (16)         — depends on crew_operations

// Crew prices on a MARGINAL CURVE, exactly like Core.
//
// This comment previously asserted that "v1.7 gives Crew no marginal bands and
// no per-location component", and the quote charged the first-unit anchor no
// matter how many locations were configured. Price book v1.7 section 4.1
// publishes a full band table for every Crew SKU — Crew Manage $399 then
// 79/71/63/55, Crew Time $99 then 19/17/15/13, and so on — so a ten-location
// Manage + Time selection was quoted $498 against a real $1,380, and at a
// hundred locations $498 against $8,050. Crew was being given away.
//
// What v1.7 DID retire is the v1.6 "base covers 3 locations, then $X per extra
// location" allowance: bands are marginal and nothing is bundled into the
// anchor. That is why `perLocationPrice` and `baseIncludesLocations` stay
// deleted while `marginalBands` is added.
//
// The per-module setup-fee ladder ($199/$299/$399/$499) is likewise gone.
// Implementation is a single charge at the HIGHEST `implementationClass` in
// the selection (see `implementationClasses` + `resolveImplementationFee`).
// v1.7 publishes the ladder but does NOT publish a per-SKU class assignment,
// so every SKU whose class is not derivable carries `implementationClass:
// null` — the quote then says implementation is scoped at contract instead of
// inventing a number. `crew_lite` is the one safe assignment: it has always
// been $0 self-serve onboarding, which is exactly the published $0
// self-service class.
export const crewSkus = {
  crew_lite: {
    id: 'crew_lite',
    name: 'Crew Starter',
    icon: 'sparkles',
    backendId: 'crew_lite',
    firstUnitPrice: 99,
    marginalBands: [band(2, 5, 19)],
    orgLicensePrice: 99,
    implementationClass: 'self_service' as ImplementationClassId | null,
    implementationIncludes: 'Self-serve onboarding',
    sortOrder: 11,
    prerequisites: [] as CrewSkuId[],
    mutuallyExclusiveWith: ['crew_scheduling', 'crew_operations', 'crew_tna', 'crew_payroll', 'crew_people_intelligence'] as CrewSkuId[],
    caps: {
      maxLocations: 5,
      maxEmployeesPerLocation: 15,
      perEmployeeOverageUsd: 1,
      hardLocationCap: true,
    },
    description: 'SMB entry. Basic scheduling, employee self-service, manual document upload, and time-off requests. Hard-capped at 5 locations and mutually exclusive with the full Crew SKUs.',
    features: [
      'Basic scheduling (single view mode)',
      'People / Teams / Departments / Restaurants management',
      'Manual document upload (no OCR)',
      'Basic time-off (request + approve, no accrual engine)',
      'Employee self-service /me/*',
      'Org settings + RBAC basics',
      'Hard cap: 5 locations max',
      'Soft cap: 15 employees per location ($1/employee overage above)',
    ],
    roiPotential: 'Lowest-friction Crew entry for 1–5 location operators',
    tier: 'Entry',
    isNew: true,
  },
  crew_scheduling: {
    id: 'crew_scheduling',
    name: 'Crew Schedule',
    icon: 'calendar-days',
    backendId: 'crew_scheduling',
    firstUnitPrice: 179,
    marginalBands: [band(2, 10, 39), band(11, 25, 35), band(26, 50, 31), band(51, 100, 29), band(101, 150, 27), band(151, 250, 26), band(251, null, 25)],
    orgLicensePrice: 179,
    implementationClass: null as ImplementationClassId | null,
    implementationIncludes: 'Initial schedule template setup',
    sortOrder: 12,
    prerequisites: [] as CrewSkuId[],
    caps: {
      maxLocations: null,
      maxEmployeesPerLocation: 15,
      perEmployeeOverageUsd: 1,
      hardLocationCap: false,
    },
    description: 'Schedule the workforce. View modes, AddEditShift drawer, eligibility-checked AssignToShift, AI Builder Sheet, headcount chart, swaps, offers, availability, marketplace, and staff mobile schedule views.',
    features: [
      'Four view modes (Overview / By Person / By Shift / By Role)',
      'Four-tab AddEditShift drawer with eligibility checks',
      'AssignToShift with eligibility validation',
      'AI Builder Sheet (auto-generate schedules)',
      'Headcount chart and Insights footer',
      'Shift swaps, offers, marketplace',
      'Availability management',
      'Mobile staff schedule view',
      'Soft cap: 15 employees per location ($1/employee overage)',
    ],
    roiPotential: 'Depth-5 scheduling reference (4,307 LOC across 10 components)',
    tier: 'Workforce',
    isNew: true,
  },
  crew_operations: {
    id: 'crew_operations',
    name: 'Crew Manage',
    icon: 'users',
    backendId: 'crew_operations',
    firstUnitPrice: 399,
    marginalBands: [band(2, 10, 79), band(11, 25, 71), band(26, 50, 63), band(51, 100, 59), band(101, 150, 56), band(151, 250, 53), band(251, null, 50)],
    orgLicensePrice: 399,
    implementationClass: null as ImplementationClassId | null,
    implementationIncludes: 'HR operations + credentials + assets setup',
    sortOrder: 13,
    prerequisites: [] as CrewSkuId[],
    caps: {
      maxLocations: null,
      maxEmployeesPerLocation: 15,
      perEmployeeOverageUsd: 2,
      hardLocationCap: false,
    },
    description: 'Deep workforce operations. Includes Crew Schedule and adds HR operations, credentials, assets, attestations, helpdesk, disciplinary, e-sign, onboarding/offboarding, workflows, and partner sync imports.',
    features: [
      'Crew Schedule entitlement included',
      'HR operations + employee records',
      'Credentials and certifications tracking',
      'Assets and inventory assignment',
      'Attestations and acknowledgements',
      'Ask-HR helpdesk',
      'Disciplinary tracking + e-sign',
      'Onboarding / offboarding workflows',
      'OCR document inbox + partner sync imports',
      'Soft cap: 15 employees per location ($2/employee overage)',
    ],
    roiPotential: 'Workforce operations + Ask-HR',
    tier: 'Workforce',
    isNew: true,
  },
  crew_tna: {
    id: 'crew_tna',
    name: 'Crew Time',
    icon: 'clock',
    backendId: 'crew_tna',
    firstUnitPrice: 99,
    marginalBands: [band(2, 10, 19), band(11, 25, 17), band(26, 50, 15), band(51, 100, 14), band(101, 150, 13), band(151, 250, 13), band(251, null, 12)],
    orgLicensePrice: 99,
    implementationClass: null as ImplementationClassId | null,
    implementationIncludes: 'T&A clock-in configuration + geofencing setup',
    sortOrder: 14,
    // Scheduling is the cheaper recommended dep ($179 entry), but
    // Operations ($399) also satisfies — Operations entitlement includes
    // Scheduling capabilities. Cascade + auto-attach logic in
    // useConfiguration.toggleCrewSku honors the OR semantics.
    prerequisites: ['crew_scheduling'] as CrewSkuId[],
    prerequisiteAlternatives: ['crew_operations'] as CrewSkuId[],
    prerequisiteMessage: 'Requires Crew Schedule or Crew Manage',
    caps: {
      maxLocations: null,
      maxEmployeesPerLocation: 15,
      perEmployeeOverageUsd: 1,
      hardLocationCap: false,
    },
    description: 'PWA clock-in, geofencing, WebAuthn, break attestation, anomaly detection, attendance review, and payroll readiness.',
    features: [
      'PWA clock-in / clock-out (no native app required)',
      'Geofencing with location-aware enforcement',
      'WebAuthn-secured punches',
      'Break attestation and exception detection',
      'Anomaly review queue',
      'Attendance approval workflow',
      'Payroll readiness pre-check',
      'Open punches dashboard',
      'Soft cap: 15 employees per location ($1/employee overage)',
    ],
    roiPotential: 'Eliminate buddy-punching, capture true labor hours',
    tier: 'Workforce',
    isNew: true,
  },
  crew_payroll: {
    id: 'crew_payroll',
    name: 'Crew Pay',
    icon: 'wallet',
    backendId: 'crew_payroll',
    firstUnitPrice: 129,
    marginalBands: [band(2, 10, 29), band(11, 25, 26), band(26, 50, 23), band(51, 100, 22), band(101, 150, 20), band(151, 250, 19), band(251, null, 18)],
    orgLicensePrice: 129,
    implementationClass: null as ImplementationClassId | null,
    implementationIncludes: 'Country pack activation + statutory export configuration',
    sortOrder: 15,
    prerequisites: ['crew_operations'] as CrewSkuId[],
    prerequisiteMessage: 'Requires Crew Manage',
    caps: {
      maxLocations: null,
      maxEmployeesPerLocation: 15,
      perEmployeeOverageUsd: 2,
      hardLocationCap: false,
    },
    description: 'Native Sundae payroll suite supporting 36 countries, with statutory outputs, payslips, year-end forms, and employee self-service. Integrations remain available when an operator chooses to retain another provider.',
    features: [
      'Native Sundae payroll calculation engine',
      'Country packs across 36 supported markets',
      'Statutory export framework (WPS / NACHA / EFT / RTI / SEPA pattern)',
      'Year-end form generation per jurisdiction',
      'BIK ledger + AI-explained cycle preview',
      'Provider integrations (Bayzat / Personio / Pento / Gusto)',
      'Premium document imports + statutory ID validation',
      'Employee payroll self-service portal',
      'Soft cap: 15 employees per location ($2/employee overage)',
    ],
    roiPotential: 'Readiness + statutory exports + multi-region coverage',
    tier: 'Workforce',
    isNew: true,
  },
  crew_people_intelligence: {
    id: 'crew_people_intelligence',
    name: 'Crew People',
    icon: 'brain',
    backendId: 'crew_people_intelligence',
    firstUnitPrice: 249,
    marginalBands: [band(2, 10, 39), band(11, 25, 35), band(26, 50, 31), band(51, 100, 29), band(101, 150, 27), band(151, 250, 26), band(251, null, 25)],
    orgLicensePrice: 249,
    implementationClass: null as ImplementationClassId | null,
    implementationIncludes: 'Performance / talent / comp data ingestion',
    sortOrder: 16,
    prerequisites: ['crew_operations'] as CrewSkuId[],
    prerequisiteMessage: 'Requires Crew Manage',
    caps: {
      maxLocations: null,
      maxEmployeesPerLocation: 15,
      perEmployeeOverageUsd: 1.5,
      hardLocationCap: false,
    },
    description: 'Workforce intelligence layer: performance, talent, benefits, comp, recruiting, skills, surveys, and training analytics.',
    features: [
      'Performance review cycles + 360 feedback',
      'Talent and succession planning',
      'Benefits administration + enrollment',
      'Compensation analytics and band review',
      'Recruiting pipeline and ATS integrations',
      'Skills matrix and gap analysis',
      'Engagement surveys + sentiment trends',
      'Training plans + completion tracking',
      'Soft cap: 15 employees per location ($1.50/employee overage)',
    ],
    roiPotential: 'Workforce decisioning with operational signal',
    tier: 'Intelligence',
    isNew: true,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// CREW BUNDLES (price book v1.7)
// ═══════════════════════════════════════════════════════════════════════════
// Three auto-applied bundles. v1.7 publishes each bundle as a NAMED NET price
// — NOT a percentage off the component sum:
//   Schedule & Time $249 · Crew Operating $499 · Crew Complete $699.
// `discountPercent` was therefore deleted: nothing may derive a bundle price
// by discounting components, and no surface may advertise "20% off". Where a
// saving is shown it is DERIVED at render time as (component sum − net
// price), never used as an input to the price.
//
// No per-location adder and no setup fee: v1.7 publishes neither for bundles,
// and both belonged to the retired "base covers 3, then $X per extra" ladder.
// Implementation follows the same class rule as the individual SKUs.

export interface CrewBundle extends BandedSku {
  /** Price book v1.7 section 4.1 — Crew prices on a marginal curve. */
  id: CrewBundleId;
  name: string;
  skus: CrewSkuId[];
  /** The published NET monthly price. Never derived from the component sum. */
  basePrice: number;
  description: string;
  /** Not published under v1.7 — scoped at contract. */
  implementationClass: ImplementationClassId | null;
}

export const crewBundles: Record<CrewBundleId, CrewBundle> = {
  crew_schedule_time_bundle: {
    id: 'crew_schedule_time_bundle',
    name: 'Schedule & Time',
    skus: ['crew_scheduling', 'crew_tna'],
    firstUnitPrice: 249,
    marginalBands: [band(2, 10, 49), band(11, 25, 45), band(26, 50, 41), band(51, 100, 39), band(101, 150, 36), band(151, 250, 34), band(251, null, 33)],
    basePrice: 249,
    description: 'Crew Schedule + Crew Time bundled. Keep your existing HR or payroll while Sundae runs scheduling, attendance, and payroll-ready time data.',
    implementationClass: null,
  },
  crew_suite_bundle: {
    id: 'crew_suite_bundle',
    name: 'Crew Operating',
    skus: ['crew_operations', 'crew_tna', 'crew_payroll'],
    firstUnitPrice: 499,
    marginalBands: [band(2, 10, 99), band(11, 25, 89), band(26, 50, 79), band(51, 100, 74), band(101, 150, 70), band(151, 250, 66), band(251, null, 63)],
    basePrice: 499,
    description: 'Crew Manage + Crew Time + Crew Pay bundled. Acquisition-friendly bundle for operators replacing or augmenting an existing HR/payroll stack.',
    implementationClass: null,
  },
  crew_complete_bundle: {
    id: 'crew_complete_bundle',
    name: 'Crew Complete',
    skus: ['crew_operations', 'crew_tna', 'crew_payroll', 'crew_people_intelligence'],
    firstUnitPrice: 699,
    marginalBands: [band(2, 10, 129), band(11, 25, 115), band(26, 50, 102), band(51, 100, 96), band(101, 150, 90), band(151, 250, 86), band(251, null, 82)],
    basePrice: 699,
    description: 'Crew Manage + Crew Time + Crew Pay + Crew People bundled. Full workforce stack with the intelligence layer on top.',
    implementationClass: null,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// WATCHTOWER (Add-ons for Core tier only)
// ═══════════════════════════════════════════════════════════════════════════

export const watchtower = {
  competitive: {
    id: 'competitive',
    name: 'Competitive Intelligence',
    icon: 'search',
    basePrice: 549,
    perLocationPrice: 69,
    includedLocations: 1,
    description: 'Track 10 competitors per location, daily menu/pricing monitoring, pricing change alerts, photo/dish tracking, promotion monitoring, review sentiment, rating trends, competitor review comparison, social media monitoring, engagement metrics, competitive positioning, real-time alerts',
    features: [
      'Track 10 competitors per location',
      'Daily menu/pricing monitoring per location',
      'Pricing change alerts (location-specific)',
      'Photo/dish presentation tracking',
      'Promotion and special monitoring',
      'Review sentiment analysis (per location)',
      'Rating trend tracking',
      'Competitor review comparison',
      'Social media monitoring per location',
      'Engagement metrics tracking',
      'Competitive positioning analysis',
      'Real-time competitor change alerts'
    ],
    valueProposition: 'Prevent market share loss, optimize pricing strategy'
  },

  events: {
    id: 'events',
    name: 'Event & Calendar Signals',
    icon: 'calendar',
    basePrice: 249,
    perLocationPrice: 39,
    includedLocations: 1,
    description: 'Local event calendar, concert & entertainment tracking, conference & convention schedules, festival & holiday monitoring, local sports schedules, game day impact, weather correlation, temperature sensitivity, traffic patterns, tourism season tracking, cruise ship arrivals, convention center activity',
    features: [
      'Local event calendar (per location)',
      'Concert & entertainment tracking',
      'Conference & convention schedules',
      'Festival & holiday monitoring',
      'Local sports team schedules',
      'Game day impact analysis',
      'Weather correlation (location-specific)',
      'Temperature sensitivity analysis',
      'Traffic pattern correlation',
      'Tourism season tracking',
      'Cruise ship arrivals (if applicable)',
      'Convention center activity'
    ],
    valueProposition: 'Optimize staffing and inventory for demand spikes'
  },

  trends: {
    id: 'trends',
    name: 'Market Trends',
    icon: 'trending-up',
    basePrice: 299,
    perLocationPrice: 29,
    includedLocations: 1,
    description: 'Google Trends integration (national + local), cuisine search demand, menu item popularity, category trends, demographic shifts, income level changes, local economic indicators, tourism indicators, real estate development, long-term demand forecasting, market saturation, competitive density',
    features: [
      'Google Trends integration (national + local)',
      'Cuisine search demand tracking',
      'Menu item popularity trends',
      'Category trend analysis',
      'Demographic shifts (location-specific)',
      'Income level changes',
      'Local economic indicators',
      'Tourism indicators',
      'Real estate development tracking',
      'Long-term demand forecasting',
      'Market saturation analysis',
      'Competitive density tracking'
    ],
    valueProposition: 'Stay ahead of market shifts, inform strategic decisions'
  },

  bundle: {
    id: 'bundle',
    name: 'Full Watchtower Bundle',
    icon: 'castle',
    basePrice: 899,
    perLocationPrice: 109,
    includedLocations: 1,
    individualBaseTotal: 1097,
    individualPerLocTotal: 137,
    baseSavings: 198,
    perLocSavings: 28,
    savingsPercent: 18,
    savingsNote: 'approximately 18%',
    description: 'Complete market intelligence suite',
    includes: ['competitive', 'events', 'trends'],
    // Internal feature keys. Localized user-facing copy lives in localizedAddOnDisplay.
    features: [
      'competitive_suite',
      'events_suite',
      'trends_suite',
      'unified_dashboard',
      'cross_module_insights',
      'monthly_intelligence_report',
    ],
    valueProposition: 'Full market intelligence at ~18% discount'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// DISCOUNT RULES (price book v1.7)
// ═══════════════════════════════════════════════════════════════════════════
// Volume ladder: 0% under 50 · 2.5% 50-99 · 5% 100-199 · 7% 200-249 ·
// 250+ Enterprise only (no self-serve band).
// Billing cycle: annual 10% · 2-year 15%.
// Volume and billing-cycle discounts are mutually exclusive: the larger applies.

export interface VolumeDiscountTier {
  min: number;
  max: number | null;
  /** `null` = no self-serve discount is published; the deal must be quoted. */
  percent: number | null;
  enterpriseOnly: boolean;
  label: string;
}

export const volumeDiscounts: { tiers: VolumeDiscountTier[] } = {
  tiers: [
    { min: 1, max: 49, percent: 0, enterpriseOnly: false, label: 'Standard pricing' },
    { min: 50, max: 99, percent: 2.5, enterpriseOnly: false, label: '2.5% volume discount' },
    { min: 100, max: 199, percent: 5, enterpriseOnly: false, label: '5% volume discount' },
    { min: 200, max: 249, percent: 7, enterpriseOnly: false, label: '7% volume discount' },
    { min: 250, max: null, percent: null, enterpriseOnly: true, label: 'Enterprise only — custom pricing required' }
  ]
};

export const billingDiscounts: Record<BillingCycle, number> = {
  monthly: 0,
  annual_quarterly: 5,
  annual_upfront: 12,
  two_year_upfront: 20,
};

/** How each term is described to the buyer, and what it commits us to. */
export const billingTerms: Record<
  BillingCycle,
  { label: string; timing: string; discountPercent: number; priceLockMonths: number | null }
> = {
  monthly: { label: 'Monthly', timing: 'Rolling', discountPercent: 0, priceLockMonths: null },
  annual_quarterly: {
    label: 'Annual',
    timing: 'Paid quarterly',
    discountPercent: 5,
    priceLockMonths: null,
  },
  annual_upfront: {
    label: 'Annual',
    timing: 'Paid upfront',
    discountPercent: 12,
    priceLockMonths: null,
  },
  two_year_upfront: {
    label: '2 years',
    timing: 'Paid upfront',
    discountPercent: 20,
    // The lock is the reason this term is worth more than its extra 8%: the
    // published curve cannot move under a customer who has committed for two
    // years, so it must be stated wherever the discount is.
    priceLockMonths: 24,
  },
};

export const DISCOUNT_RULES = {
  /**
   * Volume and billing cycle are MUTUALLY EXCLUSIVE under price book v1.7
   * section 2.1 — the buyer gets whichever is larger, never the sum. This said
   * `true` and the engine added the two, leaning on the 15% cap to hide the
   * difference; a 240-location group on annual billing was quoted 15% against a
   * real 10%, promising $2,092/mo of discount the billing system would not
   * honour. The early-adopter concession is a separate grant and does stack,
   * inside the same ceiling.
   */
  stackingAllowed: false,
  /**
   * Combined ceiling across EVERY calculated discount — volume, billing cycle
   * and the early-adopter programme rate. Nothing published may be applied on
   * top of this cap.
   *
   * Raised 15 -> 20 with price book v1.8, because the two-year upfront term is
   * itself 20%. Left at 15 the cap would have silently clamped the largest
   * published term to less than its headline: the buyer selects "20%, with a
   * 24-month price lock" and is quoted 15%. A ceiling below a published rate
   * does not restrain a discount, it breaks a promise.
   */
  maxDiscountPercent: 20,
  note: 'The larger of volume or billing-cycle discount applies; early-adopter concessions share the 20% calculated-discount cap'
};

/** The unit count at and above which only Enterprise (quoted) pricing applies. */
export const ENTERPRISE_ONLY_FROM_UNITS = 250;

// ═══════════════════════════════════════════════════════════════════════════
// CLIENT TYPE RULES (aligned to the v1.7 volume ladder)
// ═══════════════════════════════════════════════════════════════════════════

export const CLIENT_TYPE_RULES: Record<ClientType, {
  locationRange: [number, number | null];
  discountTier: number;
  pricingModel: 'standard' | 'growth' | 'enterprise';
  features: string[];
}> = {
  'independent': {
    locationRange: [1, 49],
    discountTier: 0,
    pricingModel: 'standard',
    features: ['Standard pricing', 'Self-service onboarding']
  },
  'growth': {
    locationRange: [50, 99],
    discountTier: 2.5,
    pricingModel: 'growth',
    features: ['2.5% volume discount']
  },
  'multi-site': {
    locationRange: [100, 249],
    discountTier: 5,
    pricingModel: 'growth',
    features: ['5% volume discount from 100 locations', '7% from 200 locations']
  },
  'enterprise': {
    locationRange: [250, null],
    discountTier: 0,
    pricingModel: 'enterprise',
    features: ['Custom Enterprise pricing', 'Dedicated CSM', 'Custom SLA']
  },
  'franchise': {
    locationRange: [1, null],
    discountTier: 0,
    pricingModel: 'enterprise',
    features: ['Franchise-specific pricing', 'Multi-entity support', 'Franchisee portal']
  }
};

export function detectClientType(locations: number, isFranchise = false): ClientType {
  if (isFranchise) return 'franchise';
  if (locations < 50) return 'independent';
  if (locations < 100) return 'growth';
  if (locations < ENTERPRISE_ONLY_FROM_UNITS) return 'multi-site';
  return 'enterprise';
}

export function getVolumeDiscountTier(locations: number): VolumeDiscountTier | undefined {
  return volumeDiscounts.tiers.find(
    t => locations >= t.min && (t.max === null || locations <= t.max)
  );
}

/**
 * Self-serve volume discount for a unit count. Returns 0 in the Enterprise-only
 * band — there is no published self-serve discount there, the deal is quoted.
 * Use `getVolumeDiscountTier(...).enterpriseOnly` to detect that case.
 */
export function getVolumeDiscount(locations: number): number {
  return getVolumeDiscountTier(locations)?.percent ?? 0;
}

/** True when the unit count is past the self-serve ladder and must be quoted. */
export function requiresEnterpriseQuote(locations: number): boolean {
  return locations >= ENTERPRISE_ONLY_FROM_UNITS;
}

// ═══════════════════════════════════════════════════════════════════════════
// EARLY ADOPTER PROGRAM (kept for backward compatibility)
// ═══════════════════════════════════════════════════════════════════════════

// The early-adopter rate is a CALCULATED discount, so under v1.7 it sits
// inside the combined calculated-discount cap (`DISCOUNT_RULES
// .maxDiscountPercent`, 15%) alongside volume and billing cycle — it does NOT
// stack on top of the capped remainder. `discountPercent` below is the
// programme's nominal rate; the engine clamps the combined total, so the
// realised discount can never exceed the published cap. Only a hand-negotiated
// discount (`ClientProfile.customDiscountPercent`) sits outside the ladder,
// because it is a contract term rather than a published rate.
export const EARLY_ADOPTER_TERMS = {
  /** Nominal programme rate. Realised discount is capped — see above. */
  discountPercent: 20,
  priceLockMonths: 24,
  extendedTrialDays: 30,
  bonusCredits: 500,
  features: [
    `Founding member discount, up to the ${DISCOUNT_RULES.maxDiscountPercent}% combined discount cap`,
    '24-month price lock guarantee',
    '30-day extended trial (vs 14-day standard)',
    '500 bonus AI credits',
    'Early access to new features',
    'Founding member badge'
  ]
};

// ═══════════════════════════════════════════════════════════════════════════
// ENTERPRISE PRICING
// ═══════════════════════════════════════════════════════════════════════════

export const enterprisePricing = {
  /**
   * v1.7: Enterprise is MANDATORY from 250 units — the self-serve volume
   * ladder has no band there. Below 250 it is available on request when
   * enterprise requirements apply.
   */
  minLocations: ENTERPRISE_ONLY_FROM_UNITS,

  eligibilityTriggers: [
    '250+ locations (no self-serve band)',
    'Custom integration requirements',
    'SSO/SAML requirements',
    'Custom SLA requirements',
    'Security / compliance review'
  ],

  eligibilityNote:
    'Below 250 locations, operators may take standard package pricing with the published volume discount OR request custom Enterprise pricing. At 250+ locations pricing is quoted.',
};

// ═══════════════════════════════════════════════════════════════════════════
// WATCHTOWER ENTERPRISE TIERS (For backward compatibility)
// ═══════════════════════════════════════════════════════════════════════════

export const watchtowerEnterprise = {
  description: 'Volume pricing for large chains',
  tiers: [
    {
      name: 'Enterprise Standard',
      locationRange: [30, 50],
      bundlePrice: 2500,
      perModulePricing: {
        competitive: 1500,
        events: 800,
        trends: 600
      }
    },
    {
      name: 'Enterprise Plus',
      locationRange: [51, 100],
      bundlePrice: 4000,
      perModulePricing: {
        competitive: 2400,
        events: 1200,
        trends: 900
      }
    },
    {
      name: 'Enterprise Custom',
      locationRange: [101, null] as [number, null],
      bundlePrice: null,
      perModulePricing: null,
      note: 'Contact sales for custom enterprise pricing'
    }
  ]
};

// ═══════════════════════════════════════════════════════════════════════════
// AI CREDIT SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

export const aiCreditActions: Record<string, number> = {
  VIEW_SUMMARY: 5,
  CHAT: 8,
  INSIGHTS_WIDGET: 10,
  DOC_EXTRACT_TEXT: 12,
  INSIGHTS_CHAT: 12,
  DOC_EXTRACT_OCR: 18,
  DATA_ANALYSIS: 20,
  SQL_GENERATION: 15,
  INTELLIGENCE_QUERY: 25,
  REPORT_GENERATION: 35,
};

export const aiCreditRollover = {
  capPercent: 25,
  durationMonths: 1,
  purchasedCreditsExpire: false,
  usageOrder: ['Rollover', 'Monthly', 'Purchased'],
};

// ═══════════════════════════════════════════════════════════════════════════
// SUNDAE INTELLIGENCE (replaces Chat with Data)
// ═══════════════════════════════════════════════════════════════════════════

export const sundaeIntelligence = {
  // The retired Report Pro "$79 unlock" is gone with the Report layer.
  // Sundae Intelligence ships with every Core package.
  intelligencePro: {
    id: 'intelligence_pro',
    name: 'Intelligence Pro',
    monthlyFee: 399,
    availability: 'core_only',
    description: 'Advanced Sundae Intelligence for Core packages — premium AI analysis, unlimited intelligence queries, priority processing',
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// AI PACKAGES (Core tiers only)
// ═══════════════════════════════════════════════════════════════════════════

export const aiPackages = {
  ai_plus: {
    id: 'ai_plus',
    name: 'AI Plus',
    monthlyFee: 399,
    dailyCap: 500,
    overflow: 'credit_wallet',
    availability: 'core_only',
  },
  ai_pro: {
    id: 'ai_pro',
    name: 'AI Pro',
    monthlyFee: 599,
    dailyCap: 1000,
    overflow: 'credit_wallet',
    availability: 'core_only',
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// CROSS-INTELLIGENCE CORRELATION ENGINE
// Auto-unlocking premium layer that surfaces correlations across modules
// Base: Free when 3+ modules active | Pro: $199/mo + $19/loc
// ═══════════════════════════════════════════════════════════════════════════

export const crossIntelligence = {
  base: {
    id: 'cross_intelligence_base',
    name: 'Cross-Intelligence',
    tier: 'base' as CrossIntelligenceTier,
    monthlyFee: 0,
    perLocationPrice: 0,
    setupFee: 0,
    availability: 'core_only',
    autoEnableThreshold: 3, // auto-enabled when 3+ modules are active
    description: 'Automatic cross-module correlation insights — surfaces hidden connections between your data sources',
    features: [
      'Basic correlation alerts',
      'Marketing Impact Timeline (30-day lookback)',
      'Cause & Effect Cards',
      'What Changed weekly digest',
    ],
  },
  pro: {
    id: 'cross_intelligence_pro',
    name: 'Cross-Intelligence Pro',
    tier: 'pro' as CrossIntelligenceTier,
    monthlyFee: 199,
    perLocationPrice: 19,
    includedLocations: 1, // 1 location included in base, additional from #2
    setupFee: 0,
    availability: 'core_only',
    autoEnableThreshold: 3,
    description: 'Full correlation engine with advanced attribution, cannibalization detection, and real-time campaign monitoring',
    // Internal feature keys. Localized user-facing copy lives in localizedAddOnDisplay.
    features: [
      'base_included',
      'correlation_matrix',
      'revenue_attribution_waterfall',
      'spend_efficiency_radar',
      'campaign_pulse_monitor',
      'cannibalization_detector',
      'unlimited_timeline_lookback',
      'custom_alert_rules',
      'correlation_api_access',
      'priority_processing',
    ],
    components: [
      { name: 'marketing_impact_timeline', tier: 'base', description: 'Overlay marketing spend on revenue timeline to see delayed effects' },
      { name: 'cause_effect_cards', tier: 'base', description: 'Auto-generated cards explaining why metrics changed' },
      { name: 'correlation_matrix', tier: 'pro', description: 'Full NxN matrix showing strength of connections between all data sources' },
      { name: 'revenue_attribution_waterfall', tier: 'pro', description: 'Attribute revenue changes to specific operational or marketing actions' },
      { name: 'spend_efficiency_radar', tier: 'pro', description: 'Multi-axis radar comparing ROI across marketing, labor, inventory spend' },
      { name: 'campaign_pulse_monitor', tier: 'pro', description: 'Real-time campaign performance with correlation to sales and operations' },
      { name: 'cannibalization_detector', tier: 'pro', description: 'Detect when promotions or new items steal sales from existing products' },
      { name: 'what_changed_engine', tier: 'base', description: 'Automatic root cause analysis for metric movements' },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// CONNECTOR SETUP TIERS
// ═══════════════════════════════════════════════════════════════════════════

export const connectorSetupTiers = {
  plug_and_play: {
    id: 'plug_and_play',
    name: 'Plug & Play',
    setupFeeRange: [299, 499] as [number, number],
    maintenanceFee: 0,
    description: 'Pre-built connectors for common POS/platforms (e.g., Toast, Square, Clover)',
  },
  api_build: {
    id: 'api_build',
    name: 'API Build',
    setupFeeRange: [1499, 2499] as [number, number],
    maintenanceFee: 149,
    description: 'Custom API integration build for systems with available APIs',
  },
  custom_connection: {
    id: 'custom_connection',
    name: 'Custom Connection',
    setupFeeRange: [3999, 7499] as [number, number],
    maintenanceFee: 199,
    description: 'Fully custom integration for proprietary or legacy systems',
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// TRIAL POLICY
// ═══════════════════════════════════════════════════════════════════════════

export const trialPolicy = {
  core_foundation: { days: 14, cardRequired: true },
  core_margin: { days: 14, cardRequired: true },
  core_growth: { days: 14, cardRequired: true },
  core_performance: { days: 14, cardRequired: true },
  foresight_action: { days: 7, cardRequired: true },
  concepts: { days: 7, cardRequired: true },
  watchtower: { days: 7, cardRequired: true },
  cross_intelligence_pro: { days: 14, cardRequired: true },
};

// ═══════════════════════════════════════════════════════════════════════════
// BREAK-EVEN POINTS (For backward compatibility)
// ═══════════════════════════════════════════════════════════════════════════

export const BREAK_EVEN_POINTS = {
  sundaeVsTenzo: { locations: 3, description: 'Sundae becomes cheaper than Tenzo' },
  enterprise: { locations: ENTERPRISE_ONLY_FROM_UNITS, description: 'Enterprise-only — no self-serve band' }
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPETITOR PRICING (For backward compatibility)
// ═══════════════════════════════════════════════════════════════════════════

export const competitorPricing = {
  tenzo: {
    name: 'Tenzo',
    setupFeePerModulePerLocation: 350,
    modules: {
      sales: 75,
      labor: 75,
      inventory: 75
    },
    limitations: [
      'No AI-powered insights',
      'No peer benchmarking',
      'No predictive analytics',
      'Setup fees required ($350/module/location)'
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PRICING FOOTER
// ═══════════════════════════════════════════════════════════════════════════

export const pricingFooter = {
  effectiveDate: 'August 10, 2026',
  priceBookVersion: 'v1.7',
  currency: 'USD',
  taxNote: 'Taxes (VAT/GST) not included unless stated',
  changeNotice: 'Subject to change with 30-day notice',
  supportHours: 'M-F 8am-8pm UTC+4',
  locationPricingNote:
    'Unit #1 is the anchor price. Units from #2 are priced with MARGINAL bands — reaching a band does not reprice earlier units, and no locations are "included" in the anchor.',
  bundleRoundingNote: 'Bundle prices rounded to nearest whole dollar'
};

// ═══════════════════════════════════════════════════════════════════════════
// LOCALIZED DISPLAY HELPERS
// These keep canonical pricing math/data intact while exposing translated UI copy.
// ═══════════════════════════════════════════════════════════════════════════

export type { PricingLocale } from '../lib/locales';

type TierDisplayCopy = {
  name: string;
  tagline: string;
  bestFor: string;
  features: string[];
};

// Only the Enterprise card still has hand-localized tier copy. The Report
// layer and Core Lite / Core Pro were retired with price book v1.7, so their
// translated marketing copy has been removed rather than left dormant.
//
// Core PACKAGE names (Core Foundation / Margin / Growth / Performance) are
// product proper nouns and are not translated. Their taglines and `bestFor`
// currently render from the English catalog for every locale — see the
// pricing-site i18n backlog.
const localizedTierDisplay: Record<FullyLocalizedPricingLocale, {
  core: { enterprise: TierDisplayCopy };
}> = {
  en: {
    core: {
      enterprise: {
        name: 'Enterprise',
        tagline: 'Custom Solutions',
        bestFor: '250+ locations OR enterprise features required (Dedicated CSM, 24/7, SSO, SLAs, security/compliance), Multi-brand portfolios',
        features: [
          'Everything in Core Performance PLUS:',
          'Dedicated CSM',
          '24/7 support available',
          '15-minute SLA (critical)',
          'Unlimited AI credits & seats',
        ],
      },
    },
  },
  ar: {
    core: {
      enterprise: {
        name: 'Enterprise',
        tagline: 'حلول مخصصة',
        bestFor: '250+ موقعاً أو متطلبات مؤسسية مطلوبة (مدير نجاح مخصص، دعم 24/7، SSO، اتفاقيات مستوى الخدمة، الأمن/الامتثال)، محافظ متعددة العلامات',
        features: [
          'كل ما في Core Performance مع:',
          'مدير نجاح عملاء مخصص',
          'دعم متاح 24/7',
          'اتفاقية مستوى خدمة 15 دقيقة (حرج)',
          'أرصدة ومقاعد ذكاء اصطناعي غير محدودة',
        ],
      },
    },
  },
  fr: {
    core: {
      enterprise: {
        name: 'Enterprise',
        tagline: 'Solutions sur mesure',
        bestFor: '250+ sites ou exigences enterprise requises (CSM dedie, 24/7, SSO, SLA, securite/conformite), portefeuilles multi-marques',
        features: [
          'Tout ce qui est dans Core Performance PLUS :',
          'Customer Success Manager dedie',
          'Support disponible 24/7',
          'SLA 15 minutes (critique)',
          'Credits et sieges IA illimites',
        ],
      },
    },
  },
  es: {
    core: {
      enterprise: {
        name: 'Enterprise',
        tagline: 'Soluciones personalizadas',
        bestFor: '250+ locales o requisitos enterprise necesarios (CSM dedicado, 24/7, SSO, SLA, seguridad/compliance), portafolios multimarcas',
        features: [
          'Todo lo de Core Performance MAS:',
          'Customer Success Manager dedicado',
          'Soporte disponible 24/7',
          'SLA de 15 minutos (critico)',
          'Creditos y asientos de IA ilimitados',
        ],
      },
    },
  },
};

/**
 * The offered catalog: the four v1.7 Core packages plus the quoted Enterprise
 * card. Retired Report / Core Lite / Core Pro tiers are NOT returned — nothing
 * downstream can render them by accident.
 */
export function getLocalizedTierCatalog(locale: PricingLocale = 'en') {
  const handwritten = localizedTierDisplay[locale as FullyLocalizedPricingLocale];
  const generated = generatedTierDisplay[locale as keyof typeof generatedTierDisplay] as unknown as
    | { core?: { enterprise?: TierDisplayCopy } }
    | undefined;
  const enterpriseCopy =
    handwritten?.core.enterprise ??
    generated?.core?.enterprise ??
    localizedTierDisplay.en.core.enterprise;

  return {
    corePackages: CORE_PACKAGE_IDS.map((id) => corePackages[id]),
    coreEnterprise: {
      ...coreTiers.enterprise,
      ...enterpriseCopy,
      features: [...enterpriseCopy.features],
    },
  };
}

type AddOnDisplayCopy = {
  watchtower: Record<keyof typeof watchtower, string[]>;
  crossIntelligence: Record<keyof typeof crossIntelligence, string[]>;
};

const localizedAddOnDisplay: Record<FullyLocalizedPricingLocale, AddOnDisplayCopy> = {
  en: {
    watchtower: {
      competitive: [
        'Track 10 competitors per location',
        'Daily menu/pricing monitoring per location',
        'Pricing change alerts (location-specific)',
      ],
      events: [
        'Local event calendar (per location)',
        'Concert & entertainment tracking',
        'Conference & convention schedules',
      ],
      trends: [
        'Google Trends integration (national + local)',
        'Cuisine search demand tracking',
        'Menu item popularity trends',
      ],
      bundle: [
        'All Competitive Intelligence features',
        'All Event & Calendar features',
        'All Market Trends features',
      ],
    },
    crossIntelligence: {
      base: [
        'Basic correlation alerts',
        'Marketing Impact Timeline (30-day lookback)',
        'Cause & Effect Cards',
        'What Changed weekly digest',
      ],
      pro: [
        'Everything in Cross-Intelligence Base',
        'Full Correlation Matrix',
        'Revenue Attribution Waterfall',
        'Spend Efficiency Radar',
        'Campaign Pulse Monitor',
        'Cannibalization Detector',
      ],
    },
  },
  ar: {
    watchtower: {
      competitive: [
        'تتبع 10 منافسين لكل موقع',
        'مراقبة يومية للقوائم/الأسعار لكل موقع',
        'تنبيهات تغيّر الأسعار (حسب الموقع)',
      ],
      events: [
        'تقويم الفعاليات المحلية (لكل موقع)',
        'تتبع الحفلات والترفيه',
        'جداول المؤتمرات والاتفاقيات',
      ],
      trends: [
        'تكامل Google Trends (وطني ومحلي)',
        'تتبع طلب البحث على الأطباق',
        'اتجاهات شعبية عناصر القائمة',
      ],
      bundle: [
        'جميع ميزات الذكاء التنافسي',
        'جميع ميزات الفعاليات والتقويم',
        'جميع ميزات اتجاهات السوق',
      ],
    },
    crossIntelligence: {
      base: [
        'تنبيهات ترابط أساسية',
        'الخط الزمني لتأثير التسويق (نظرة 30 يوماً)',
        'بطاقات السبب والنتيجة',
        'ملخص أسبوعي لما تغيّر',
      ],
      pro: [
        'كل ما في Cross-Intelligence',
        'مصفوفة ترابط كاملة',
        'شلال إسناد الإيرادات',
        'رادار كفاءة الإنفاق',
        'مراقبة نبض الحملات',
        'كاشف الإزاحة',
      ],
    },
  },
  fr: {
    watchtower: {
      competitive: [
        'Suivre 10 concurrents par site',
        'Surveillance quotidienne des menus/prix par site',
        'Alertes de changement de prix (specifiques au site)',
      ],
      events: [
        'Calendrier des evenements locaux (par site)',
        'Suivi des concerts et loisirs',
        'Calendriers conferences et conventions',
      ],
      trends: [
        'Integration Google Trends (nationale + locale)',
        'Suivi de la demande de recherche cuisine',
        'Tendances de popularite des plats',
      ],
      bundle: [
        'Toutes les fonctionnalites d intelligence concurrentielle',
        'Toutes les fonctionnalites Evenements et calendrier',
        'Toutes les fonctionnalites Tendances de marche',
      ],
    },
    crossIntelligence: {
      base: [
        'Alertes de correlation de base',
        'Chronologie de l impact marketing (historique 30 jours)',
        'Cartes cause et effet',
        'Resume hebdomadaire des changements',
      ],
      pro: [
        'Tout ce qui est inclus dans Cross-Intelligence',
        'Matrice de correlation complete',
        'Cascade d attribution des revenus',
        'Radar d efficacite des depenses',
        'Suivi en direct des campagnes',
        'Detecteur de cannibalisation',
      ],
    },
  },
  es: {
    watchtower: {
      competitive: [
        'Seguir 10 competidores por local',
        'Monitoreo diario de menus/precios por local',
        'Alertas de cambios de precio (por local)',
      ],
      events: [
        'Calendario de eventos local (por local)',
        'Seguimiento de conciertos y espectaculos',
        'Calendarios de conferencias y convenciones',
      ],
      trends: [
        'Integracion con Google Trends (nacional + local)',
        'Seguimiento de demanda de busqueda de cocina',
        'Tendencias de popularidad de elementos del menu',
      ],
      bundle: [
        'Todas las funciones de inteligencia competitiva',
        'Todas las funciones de eventos y calendario',
        'Todas las funciones de Tendencias de mercado',
      ],
    },
    crossIntelligence: {
      base: [
        'Alertas basicas de correlacion',
        'Linea de tiempo del impacto de marketing (historial de 30 dias)',
        'Tarjetas de causa y efecto',
        'Resumen semanal de cambios',
      ],
      pro: [
        'Todo lo incluido en Cross-Intelligence',
        'Matriz de correlacion completa',
        'Cascada de atribucion de ingresos',
        'Radar de eficiencia del gasto',
        'Monitor de pulso de campanas',
        'Detector de canibalizacion',
      ],
    },
  },
};

export function getLocalizedAddOnDisplay(locale: PricingLocale = 'en') {
  return (
    localizedAddOnDisplay[locale as FullyLocalizedPricingLocale] ??
    generatedAddOnDisplay[locale as keyof typeof generatedAddOnDisplay] ??
    localizedAddOnDisplay.en
  );
}
