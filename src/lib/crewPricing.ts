// Crew quote computation — single source of truth for the multi-select
// Crew path. Reused by CrewBuilder (live price card), CrewSummaryBody
// (final quote summary), and the PDF generator (downloadable / emailable
// quote). Centralizing here means a pricing/dep tweak only touches one
// file instead of three.
//
// ── PRICE BOOK v1.7 ────────────────────────────────────────────────────────
// Crew is priced as a FLAT monthly price per SKU (Starter $99, Schedule $179,
// Manage $399, Time $99, Pay $129, People $249) and per bundle (Schedule &
// Time $249, Crew Operating $499, Crew Complete $699). There is:
//   • no per-location adder and no "included locations" allowance — the
//     retired "base covers 3, then $X per extra location" mechanic is gone,
//     so location count no longer moves the Crew price at all;
//   • no per-SKU setup fee to sum. Implementation is charged ONCE at the
//     HIGHEST implementation class in the selection.
// Bundle prices are NAMED NET prices, never a percentage off the components.
// Any saving shown is DERIVED here as (component sum − net price); it is
// never an input to the price.
//
// A published net bundle price is a CEILING, not a label that only fires on an
// exact set match. If a bundle delivers everything the visitor asked for, the
// visitor can simply buy that bundle, so no selection may ever be quoted above
// it. Quoting by exact-set-equality broke that: Manage+Pay ($528),
// Manage+Time+People ($747) and Manage+Pay+People ($777) are all reachable in
// the builder and were each quoted ABOVE the very bundle that covers them
// (Crew Operating $499 / Crew Complete $699) — a sales-blocking overcharge on
// the printed quote and the emailed PDF. `cheapestPlan` therefore prices the
// cheapest legal way to DELIVER the selection, choosing freely between
// individual SKUs and any combination of published bundles.

import { crewSkus, crewBundles, type CrewBundle } from '../data/pricing';
import { resolveImplementationFee, type ImplementationResult } from './pricingEngine';
import type { CrewSkuId, CrewBundleId } from '../types/configuration';

export interface CrewQuoteLine {
  id: CrewSkuId | CrewBundleId;
  label: string;
  /** Flat published monthly price for this line. */
  monthly: number;
}

export interface CrewQuote {
  selectedSkus: CrewSkuId[];
  /**
   * Set when ONE published bundle is the cheapest way to deliver the whole
   * selection — which includes, but is no longer limited to, an exact set
   * match. Consumers (CrewBuilder, CrewSummaryBody, the PDF, the mailto body)
   * rely on `lines[0]` being that bundle line whenever this is non-null.
   */
  detectedBundleId: CrewBundleId | null;
  lines: CrewQuoteLine[];
  monthly: number;
  annual: number;
  /** ONE implementation charge for the whole stack — never a per-SKU sum. */
  implementation: ImplementationResult;
  /** Derived: component sum − the quoted price. Display only, never an input. */
  bundleSavingsMonthly: number;
  /**
   * Employees per location included before overage — ONE allowance for the
   * whole stack, never the sum of each component's allowance. Every Crew SKU
   * publishes the same 15/location soft cap, so a Manage+Time+Pay buyer is
   * entitled to 15 per location, NOT 45; anything that added them up would
   * hand a bundle buyer three times the headroom the price book grants.
   * `null` when nothing is selected. The per-employee overage RATE is
   * deliberately absent: it is published per SKU, and collapsing three
   * different rates into one stack rate would be inventing a price.
   */
  employeeAllowancePerLocation: number | null;
  /** Whether the visitor is on the Lite SMB path (caps locations at 5). */
  isLiteOnly: boolean;
  /**
   * Location count. Retained because `crew_lite` carries a hard 5-location
   * ENTITLEMENT cap and the quote shows the footprint — it does NOT affect
   * the Crew price under v1.7.
   */
  locations: number;
}

/**
 * What buying `skus` actually entitles you to. Crew Manage carries the Crew
 * Schedule entitlement, and the bundle definitions omit Schedule for exactly
 * that reason — so a bundle listing Manage still covers a visitor who has the
 * Schedule tile ticked (the builder auto-ticks it at $0 next to Manage).
 * Without this expansion every Manage-based bundle would look like it fails to
 * cover the very selection the builder produces.
 */
function entitlementsOf(skus: readonly CrewSkuId[]): Set<CrewSkuId> {
  const granted = new Set<CrewSkuId>(skus);
  if (granted.has('crew_operations')) granted.add('crew_scheduling');
  return granted;
}

/**
 * Standalone monthly for one SKU in the context of a selection. Schedule bills
 * $0 while Manage is in the set — it stays a visible line so the quote matches
 * the builder tile's "selected · included" state, but it must never be summed.
 */
function standalonePrice(id: CrewSkuId, selection: ReadonlySet<CrewSkuId>): number {
  return id === 'crew_scheduling' && selection.has('crew_operations')
    ? 0
    : crewSkus[id].orgLicensePrice;
}

interface CrewPlan {
  /** Published bundles bought outright, at their net list price. */
  bundleIds: CrewBundleId[];
  /** Selected SKUs no chosen bundle covers, billed individually. */
  standalone: CrewSkuId[];
  monthly: number;
}

/**
 * The cheapest legal way to deliver the selection.
 *
 * Exhaustive over every combination of published bundles (2^3 = 8 today) plus
 * the individually-billed remainder. Exhaustive rather than "find the one
 * bundle whose SKU list is equal / is a superset" because the two together are
 * what makes the ceiling airtight: a partial-cover plan (a bundle plus a
 * leftover SKU) can beat both the raw component sum and any single covering
 * bundle, and a greedy search would miss it. With three bundles the search is
 * eight iterations — cheap enough to be certain instead of clever.
 *
 * A bundle that covers nothing in the selection can never win: every bundle
 * costs more than $0, so dropping it always yields a strictly cheaper plan.
 * That is why there is no explicit "don't upsell" guard here.
 */
function cheapestPlan(selectedSkus: CrewSkuId[]): CrewPlan {
  const selection = new Set(selectedSkus);
  const bundleIds = Object.keys(crewBundles) as CrewBundleId[];
  let best: CrewPlan | null = null;

  for (let mask = 0; mask < 1 << bundleIds.length; mask += 1) {
    const chosen = bundleIds.filter((_, index) => mask & (1 << index));
    const covered = new Set<CrewSkuId>();
    for (const bundleId of chosen) {
      for (const sku of entitlementsOf(crewBundles[bundleId].skus)) covered.add(sku);
    }
    const standalone = selectedSkus.filter((id) => !covered.has(id));
    const monthly =
      chosen.reduce((sum, id) => sum + crewBundles[id].basePrice, 0) +
      standalone.reduce((sum, id) => sum + standalonePrice(id, selection), 0);

    // Tie-break toward the fewest bundles so an equal-priced quote shows what
    // the visitor actually configured rather than a product they never picked.
    const wins =
      best === null ||
      monthly < best.monthly ||
      (monthly === best.monthly && chosen.length < best.bundleIds.length);
    if (wins) best = { bundleIds: chosen, standalone, monthly };
  }

  // mask 0 always runs, so `best` is assigned on the first iteration.
  return best as CrewPlan;
}

interface LineOptions {
  /** Force the SKU to render at $0 (e.g. Scheduling alongside Operations). */
  includedFree?: boolean;
}

function lineForSku(id: CrewSkuId, opts: LineOptions = {}): CrewQuoteLine {
  const sku = crewSkus[id];
  return {
    id,
    label: sku.name,
    monthly: opts.includedFree ? 0 : sku.orgLicensePrice,
  };
}

export function computeCrewQuote(selectedSkus: CrewSkuId[], locations: number): CrewQuote {
  const isLiteOnly = selectedSkus.length === 1 && selectedSkus[0] === 'crew_lite';
  // Lite cap: 5 locations max. Defensive — useConfiguration also clamps.
  const effectiveLocations = isLiteOnly ? Math.min(locations, 5) : locations;
  const selection = new Set(selectedSkus);

  const plan = cheapestPlan(selectedSkus);

  // Bundle lines first, then whatever the bundles don't cover. A SKU a bundle
  // covers gets NO line of its own — it is already inside the net price, and a
  // second line would read as a second charge.
  const lines: CrewQuoteLine[] = [
    ...plan.bundleIds.map((id) => ({
      id,
      label: crewBundles[id].name,
      monthly: crewBundles[id].basePrice,
    })),
    ...plan.standalone.map((id) =>
      lineForSku(id, { includedFree: standalonePrice(id, selection) === 0 }),
    ),
  ];
  const monthly = plan.monthly;

  // Savings are DERIVED for display: what the same delivery would have cost
  // billed SKU-by-SKU, minus what we actually quote. The net bundle price is
  // the published figure — it is never this sum minus a discount, and this
  // number is never subtracted from `monthly`, or the net price would take a
  // second bundle discount on top of itself.
  const componentSum = selectedSkus.reduce((sum, id) => sum + standalonePrice(id, selection), 0);

  // The whole selection sits inside a single published bundle: consumers show
  // its name as the headline and the "net bundle price" badge. A plan that
  // mixes a bundle with leftover SKUs is not one named product, so it stays
  // null and the UI falls back to the "N SKUs selected" headline.
  const detectedBundleId =
    plan.bundleIds.length === 1 && plan.standalone.length === 0 ? plan.bundleIds[0] : null;

  return {
    selectedSkus,
    detectedBundleId,
    lines,
    monthly,
    annual: monthly * 12,
    // Charged ONCE at the highest class in the selection. Never summed — and
    // the bundle's own class counts, since a bundle is what gets implemented.
    implementation: resolveImplementationFee([
      ...plan.bundleIds.map((id) => crewBundles[id].implementationClass),
      ...plan.standalone.map((id) => crewSkus[id].implementationClass),
    ]),
    bundleSavingsMonthly: Math.max(0, componentSum - monthly),
    employeeAllowancePerLocation: selectedSkus.length
      ? Math.min(...selectedSkus.map((id) => crewSkus[id].caps.maxEmployeesPerLocation))
      : null,
    isLiteOnly,
    locations: effectiveLocations,
  };
}

/**
 * What a bundle saves against the sum of its component SKUs, DERIVED from the
 * published net bundle price. Never used as an input to a price — v1.7 bundles
 * are named net prices, not a percentage off components.
 */
export function crewBundleSavings(bundle: CrewBundle): number {
  const componentSum = bundle.skus.reduce((sum, id) => sum + crewSkus[id].orgLicensePrice, 0);
  return Math.max(0, componentSum - bundle.basePrice);
}

// One-click preset SKU sets used by CrewBuilder's "Quick presets" row.
export const CREW_PRESETS: Array<{
  id: 'lite' | 'operating_suite' | 'complete_suite';
  label: string;
  description: string;
  skus: CrewSkuId[];
}> = [
  {
    id: 'lite',
    label: 'Crew Starter',
    description: 'SMB entry · 1–5 locations · basic scheduling + self-service',
    skus: ['crew_lite'],
  },
  {
    id: 'operating_suite',
    label: 'Crew Operating',
    description: `Manage + Time + Pay · net $${crewBundles.crew_suite_bundle.basePrice}/mo`,
    // Scheduling is included with Operations entitlement (priced at $0
    // in the UI / line items). Bundle detection normalizes this away
    // so the canonical bundle definition still matches.
    skus: ['crew_operations', 'crew_scheduling', 'crew_tna', 'crew_payroll'],
  },
  {
    id: 'complete_suite',
    label: 'Crew Complete',
    description: `Operating + People · net $${crewBundles.crew_complete_bundle.basePrice}/mo`,
    skus: ['crew_operations', 'crew_scheduling', 'crew_tna', 'crew_payroll', 'crew_people_intelligence'],
  },
];

// All individual SKUs (sortOrder matches backend pricing_master).
export const CREW_SKU_LIST: CrewSkuId[] = [
  'crew_scheduling',
  'crew_operations',
  'crew_tna',
  'crew_payroll',
  'crew_people_intelligence',
];
