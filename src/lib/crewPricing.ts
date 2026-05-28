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

function detectBundle(skus: CrewSkuId[]): CrewBundleId | null {
  for (const [bundleId, bundle] of Object.entries(crewBundles)) {
    if (sameSet(skus, bundle.skus as CrewSkuId[])) {
      return bundleId as CrewBundleId;
    }
  }
  return null;
}

function lineForSku(id: CrewSkuId, locations: number): CrewQuoteLine {
  const sku = crewSkus[id];
  const includedLocations = sku.baseIncludesLocations;
  const billableExtras = Math.max(0, locations - includedLocations);
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
    // Savings vs sum of standalone SKUs at this location count.
    const standaloneMonthly = selectedSkus
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

  // No bundle — sum the individual SKUs.
  const lines = selectedSkus.map((id) => lineForSku(id, effectiveLocations));
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
    skus: ['crew_operations', 'crew_tna', 'crew_payroll'],
  },
  {
    id: 'complete_suite',
    label: 'Complete Suite',
    description: 'Operating Suite + People Intelligence · 20% bundle discount',
    skus: ['crew_operations', 'crew_tna', 'crew_payroll', 'crew_people_intelligence'],
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
