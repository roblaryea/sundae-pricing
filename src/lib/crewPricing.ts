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
  /** Auto-detected when the SKU set matches a canonical bundle exactly. */
  detectedBundleId: CrewBundleId | null;
  lines: CrewQuoteLine[];
  monthly: number;
  annual: number;
  /** ONE implementation charge for the whole stack — never a per-SKU sum. */
  implementation: ImplementationResult;
  /** Derived: component sum − the bundle's published net price. */
  bundleSavingsMonthly: number;
  /** Whether the visitor is on the Lite SMB path (caps locations at 5). */
  isLiteOnly: boolean;
  /**
   * Location count. Retained because `crew_lite` carries a hard 5-location
   * ENTITLEMENT cap and the quote shows the footprint — it does NOT affect
   * the Crew price under v1.7.
   */
  locations: number;
}

function sameSet(a: CrewSkuId[], b: CrewSkuId[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((id) => setB.has(id));
}

// Bundle definitions don't list `crew_scheduling` because Operations
// already includes it. The UI keeps Scheduling visible in the selection
// set when Operations is present (so the tile reads as "auto-included
// at $0"), so detection normalizes by stripping Scheduling when
// Operations is in the set before matching.
function detectBundle(skus: CrewSkuId[]): CrewBundleId | null {
  const normalized = skus.includes('crew_operations')
    ? skus.filter((s) => s !== 'crew_scheduling')
    : skus;
  for (const [bundleId, bundle] of Object.entries(crewBundles)) {
    if (sameSet(normalized, bundle.skus as CrewSkuId[])) {
      return bundleId as CrewBundleId;
    }
  }
  return null;
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
  const detectedBundleId = detectBundle(selectedSkus);

  if (detectedBundleId) {
    const bundle = crewBundles[detectedBundleId];
    const bundleMonthly = bundle.basePrice;
    // Savings vs the sum of the standalone SKUs. Strip Scheduling from the
    // standalone calc when Operations is present so the comparison isn't
    // inflated by a line that is already $0. DERIVED only — the bundle price
    // above is the published net figure, not a discount off this sum.
    const hasOps = selectedSkus.includes('crew_operations');
    const standaloneMonthly = selectedSkus
      .filter((id) => !(id === 'crew_scheduling' && hasOps))
      .map((id) => lineForSku(id).monthly)
      .reduce((sum, m) => sum + m, 0);
    return {
      selectedSkus,
      detectedBundleId,
      lines: [{ id: detectedBundleId, label: bundle.name, monthly: bundleMonthly }],
      monthly: bundleMonthly,
      annual: bundleMonthly * 12,
      implementation: resolveImplementationFee([bundle.implementationClass]),
      bundleSavingsMonthly: Math.max(0, standaloneMonthly - bundleMonthly),
      isLiteOnly: false,
      locations: effectiveLocations,
    };
  }

  // No bundle — sum the individual SKUs. Scheduling is rendered at $0
  // when Operations is in the set (Operations entitlement includes
  // Scheduling), but stays visible as a line so the UI matches the
  // Scheduling tile's "selected at $0" state.
  const hasOperations = selectedSkus.includes('crew_operations');
  const lines = selectedSkus.map((id) =>
    lineForSku(id, { includedFree: id === 'crew_scheduling' && hasOperations }),
  );
  const monthly = lines.reduce((sum, line) => sum + line.monthly, 0);

  return {
    selectedSkus,
    detectedBundleId: null,
    lines,
    monthly,
    annual: monthly * 12,
    // Charged ONCE at the highest class in the selection. Never summed.
    implementation: resolveImplementationFee(
      selectedSkus.map((id) => crewSkus[id].implementationClass),
    ),
    bundleSavingsMonthly: 0,
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
