// Crew quote computation — single source of truth for the multi-select
// Crew path. Reused by CrewBuilder (live price card), CrewSummaryBody
// (final quote summary), and the PDF generator (downloadable / emailable
// quote). Centralizing here means a pricing/dep tweak only touches one
// file instead of three.

import { crewSkus, crewBundles } from '../data/pricing';
import type { CrewSkuId, CrewBundleId } from '../types/configuration';

export interface CrewQuoteLine {
  id: CrewSkuId | CrewBundleId;
  label: string;
  orgLicense: number;
  perLoc: number;
  includedLocations: number;
  billableExtras: number;
  monthly: number;
  setupFee: number;
}

export interface CrewQuote {
  selectedSkus: CrewSkuId[];
  /** Auto-detected when the SKU set matches a canonical bundle exactly. */
  detectedBundleId: CrewBundleId | null;
  lines: CrewQuoteLine[];
  monthly: number;
  annual: number;
  setupFee: number;
  /** Monthly $ saved when the bundle is detected (vs sum of standalone SKUs). */
  bundleSavingsMonthly: number;
  /** Whether the visitor is on the Lite SMB path (caps locations at 5). */
  isLiteOnly: boolean;
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

function lineForSku(id: CrewSkuId, locations: number, opts: LineOptions = {}): CrewQuoteLine {
  const sku = crewSkus[id];
  const includedLocations = sku.baseIncludesLocations;
  const billableExtras = Math.max(0, locations - includedLocations);

  if (opts.includedFree) {
    return {
      id,
      label: sku.name,
      orgLicense: 0,
      perLoc: 0,
      includedLocations,
      billableExtras: 0,
      monthly: 0,
      // Setup is also $0 when Scheduling rides along — Operations covers
      // the scheduling setup as part of its own activation.
      setupFee: 0,
    };
  }

  const monthly = sku.orgLicensePrice + sku.perLocationPrice * billableExtras;
  return {
    id,
    label: sku.name,
    orgLicense: sku.orgLicensePrice,
    perLoc: sku.perLocationPrice,
    includedLocations,
    billableExtras,
    monthly,
    setupFee: sku.setupFee ?? 0,
  };
}

export function computeCrewQuote(selectedSkus: CrewSkuId[], locations: number): CrewQuote {
  const isLiteOnly = selectedSkus.length === 1 && selectedSkus[0] === 'crew_lite';
  // Lite cap: 5 locations max. Defensive — useConfiguration also clamps.
  const effectiveLocations = isLiteOnly ? Math.min(locations, 5) : locations;
  const detectedBundleId = detectBundle(selectedSkus);

  if (detectedBundleId) {
    const bundle = crewBundles[detectedBundleId];
    const includedLocations = 3;
    const billableExtras = Math.max(0, effectiveLocations - includedLocations);
    const bundleMonthly = bundle.basePrice + bundle.perLocationPrice * billableExtras;
    // Savings vs sum of standalone SKUs at this location count. Strip
    // Scheduling from the standalone calc when Operations is present
    // so the savings comparison isn't inflated by a line that's
    // already $0.
    const hasOps = selectedSkus.includes('crew_operations');
    const standaloneMonthly = selectedSkus
      .filter((id) => !(id === 'crew_scheduling' && hasOps))
      .map((id) => lineForSku(id, effectiveLocations).monthly)
      .reduce((sum, m) => sum + m, 0);
    return {
      selectedSkus,
      detectedBundleId,
      lines: [
        {
          id: detectedBundleId,
          label: bundle.name,
          orgLicense: bundle.basePrice,
          perLoc: bundle.perLocationPrice,
          includedLocations,
          billableExtras,
          monthly: bundleMonthly,
          setupFee: bundle.setupFee,
        },
      ],
      monthly: bundleMonthly,
      annual: bundleMonthly * 12,
      setupFee: bundle.setupFee,
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
    lineForSku(id, effectiveLocations, {
      includedFree: id === 'crew_scheduling' && hasOperations,
    }),
  );
  const monthly = lines.reduce((sum, line) => sum + line.monthly, 0);
  const setupFee = lines.reduce((sum, line) => sum + line.setupFee, 0);

  return {
    selectedSkus,
    detectedBundleId: null,
    lines,
    monthly,
    annual: monthly * 12,
    setupFee,
    bundleSavingsMonthly: 0,
    isLiteOnly,
    locations: effectiveLocations,
  };
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
    label: 'Crew Lite',
    description: 'SMB entry · 1–5 locations · basic scheduling + self-service',
    skus: ['crew_lite'],
  },
  {
    id: 'operating_suite',
    label: 'Operating Suite',
    description: 'Operations + T&A + Payroll · 20% bundle discount',
    // Scheduling is included with Operations entitlement (priced at $0
    // in the UI / line items). Bundle detection normalizes this away
    // so the canonical bundle definition still matches.
    skus: ['crew_operations', 'crew_scheduling', 'crew_tna', 'crew_payroll'],
  },
  {
    id: 'complete_suite',
    label: 'Complete Suite',
    description: 'Operating Suite + People Intelligence · 20% bundle discount',
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
