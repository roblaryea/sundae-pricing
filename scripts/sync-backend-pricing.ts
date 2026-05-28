#!/usr/bin/env tsx
/**
 * Pricing Drift Audit — sundae-backend → pricing-site reconciliation.
 *
 * Compares the canonical `MODULE_PRICING` catalog from
 * `../../../sundae-backend/config/pricing_master.ts` against the local
 * `src/data/pricing.ts` `modules` dict, and reports drift WITHOUT silently
 * mutating the local file. This is the safe-first step on the path to making
 * the pricing-site fully dynamic — humans review the diff before any
 * commercial pricing change ships.
 *
 * Run modes:
 *   tsx scripts/sync-backend-pricing.ts          (drift report; exit 1 on drift)
 *   tsx scripts/sync-backend-pricing.ts --json   (machine-readable report)
 *   tsx scripts/sync-backend-pricing.ts --fix    (NOT YET IMPLEMENTED — emits warning)
 *
 * Behaviour:
 *  - Resolves backend pricing_master at the sibling path.
 *  - Imports MODULE_PRICING via dynamic import (TS-native via tsx).
 *  - For each pricing-site module, finds the canonical backend entry via
 *    `backendId` (added 2026-05-28). Compares: orgLicense, perLocationPrice,
 *    setupFee, baseIncludesLocations, pricingByTier.core_lite.
 *  - Flags backend modules with no pricing-site representation (we'd need
 *    to add a new module entry).
 *  - Flags pricing-site modules with no backend representation (drift in
 *    pricing-site that backend has dropped).
 *
 * Exit codes: 0 = clean, 1 = drift detected, 2 = backend repo not found.
 */

import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { modules as localModules, crewSkus as localCrewSkus } from '../src/data/pricing';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BACKEND_PRICING_PATH = resolve(
  __dirname,
  '..',
  '..',
  '..',
  'sundae-backend',
  'config',
  'pricing_master.ts'
);

interface BackendModule {
  id: string;
  name: string;
  orgLicense: number;
  perLocationPrice: number;
  setupFee: number;
  baseIncludesLocations: number;
  pricingByTier?: { core_lite?: { orgLicense?: number; perLocationPrice?: number } };
  category?: string;
}

interface LocalModule {
  id: string;
  name: string;
  backendId?: string;
  orgLicensePrice: number;
  perLocationPrice: number;
  setupFee: number;
  baseIncludesLocations: number;
  pricingByTier?: {
    core_pro?: { orgLicensePrice?: number; perLocationPrice?: number };
    core_lite?: { orgLicensePrice?: number; perLocationPrice?: number };
  };
}

interface DriftFinding {
  severity: 'P0' | 'P1';
  category: 'missing_backend' | 'missing_local' | 'price_mismatch' | 'name_mismatch';
  localId: string | null;
  backendId: string | null;
  field?: string;
  localValue?: unknown;
  backendValue?: unknown;
  message: string;
}

async function loadBackendPricing(): Promise<Record<string, BackendModule> | null> {
  if (!existsSync(BACKEND_PRICING_PATH)) {
    console.error(`✗ Backend pricing master not found at: ${BACKEND_PRICING_PATH}`);
    console.error('  Ensure sundae-backend is checked out as a sibling repo, then re-run.');
    return null;
  }
  const moduleUrl = pathToFileURL(BACKEND_PRICING_PATH).href;
  const backend = (await import(moduleUrl)) as { MODULE_PRICING: Record<string, BackendModule> };
  return backend.MODULE_PRICING;
}

function compareModule(local: LocalModule, backend: BackendModule, findings: DriftFinding[]): void {
  const fields: Array<[keyof LocalModule | 'core_lite.orgLicensePrice' | 'core_lite.perLocationPrice', unknown, unknown]> = [
    ['orgLicensePrice', local.orgLicensePrice, backend.orgLicense],
    ['perLocationPrice', local.perLocationPrice, backend.perLocationPrice],
    ['setupFee', local.setupFee, backend.setupFee],
    ['baseIncludesLocations', local.baseIncludesLocations, backend.baseIncludesLocations],
  ];

  if (backend.pricingByTier?.core_lite) {
    fields.push([
      'core_lite.orgLicensePrice',
      local.pricingByTier?.core_lite?.orgLicensePrice,
      backend.pricingByTier.core_lite.orgLicense,
    ]);
    fields.push([
      'core_lite.perLocationPrice',
      local.pricingByTier?.core_lite?.perLocationPrice,
      backend.pricingByTier.core_lite.perLocationPrice,
    ]);
  }

  for (const [field, localValue, backendValue] of fields) {
    if (localValue !== backendValue) {
      findings.push({
        severity: 'P0',
        category: 'price_mismatch',
        localId: local.id,
        backendId: backend.id,
        field: String(field),
        localValue,
        backendValue,
        message: `Module ${local.id} (backend: ${backend.id}) field ${String(field)} drift — local: ${String(localValue)}, backend: ${String(backendValue)}.`,
      });
    }
  }

  if (local.name !== backend.name) {
    findings.push({
      severity: 'P1',
      category: 'name_mismatch',
      localId: local.id,
      backendId: backend.id,
      field: 'name',
      localValue: local.name,
      backendValue: backend.name,
      message: `Module ${local.id} display name drift — local: "${local.name}", backend canonical: "${backend.name}". (P1: display labels can intentionally diverge for marketing reasons.)`,
    });
  }
}

async function main(): Promise<void> {
  const args = new Set(process.argv.slice(2));
  const jsonMode = args.has('--json');
  const fixMode = args.has('--fix');

  if (fixMode) {
    console.error('✗ --fix not implemented. The pricing-site `modules` dict carries display copy and ROI text that');
    console.error('  do not exist in the backend catalog; an automated fix would clobber those. Update');
    console.error('  src/data/pricing.ts by hand, then re-run this script to confirm clean.');
    process.exit(2);
  }

  const backendModules = await loadBackendPricing();
  if (!backendModules) {
    process.exit(2);
  }

  const findings: DriftFinding[] = [];
  const backendKeys = Object.keys(backendModules);
  const matchedBackendKeys = new Set<string>();

  // Walk both local catalogues — analytics modules + Crew workforce SKUs —
  // and check each against the backend MODULE_PRICING entry pointed at by
  // `backendId`. Drift detection treats both catalogues identically.
  const allLocal: Array<[string, LocalModule, 'module' | 'crew_sku']> = [
    ...Object.entries(localModules as Record<string, LocalModule>).map(
      ([k, v]) => [k, v, 'module'] as [string, LocalModule, 'module' | 'crew_sku']
    ),
    ...Object.entries(localCrewSkus as Record<string, LocalModule>).map(
      ([k, v]) => [k, v, 'crew_sku'] as [string, LocalModule, 'module' | 'crew_sku']
    ),
  ];

  for (const [localKey, local, kind] of allLocal) {
    const backendId = local.backendId;
    if (!backendId) {
      findings.push({
        severity: 'P0',
        category: 'missing_backend',
        localId: localKey,
        backendId: null,
        message: `Local ${kind} ${localKey} has no \`backendId\` field. Add backendId to map this entry to a backend MODULE_PRICING key.`,
      });
      continue;
    }
    const backend = backendModules[backendId];
    if (!backend) {
      findings.push({
        severity: 'P0',
        category: 'missing_backend',
        localId: localKey,
        backendId,
        message: `Local ${kind} ${localKey} maps to backendId "${backendId}" but no such entry exists in backend MODULE_PRICING. Either backend has dropped the module or the backendId is wrong.`,
      });
      continue;
    }
    matchedBackendKeys.add(backendId);
    compareModule(local, backend, findings);
  }

  // Backend modules with no pricing-site representation. Any unmatched
  // backend key after walking both `modules` and `crewSkus` is genuine drift
  // — the pricing-site is missing a SKU that backend sells.
  for (const backendKey of backendKeys) {
    if (matchedBackendKeys.has(backendKey)) continue;
    findings.push({
      severity: 'P0',
      category: 'missing_local',
      localId: null,
      backendId: backendKey,
      message: `Backend module "${backendKey}" has no pricing-site entry. Add a module to src/data/pricing.ts (analytics) or crewSkus (workforce) with backendId: "${backendKey}".`,
    });
  }

  const counts = {
    p0: findings.filter((f) => f.severity === 'P0').length,
    p1: findings.filter((f) => f.severity === 'P1').length,
    local_modules: Object.keys(localModules).length,
    local_crew_skus: Object.keys(localCrewSkus).length,
    backend: backendKeys.length,
  };

  if (jsonMode) {
    console.log(JSON.stringify({ counts, findings }, null, 2));
  } else {
    console.log(`\n── Backend Pricing Drift Audit ──`);
    console.log(`  Local analytics modules:       ${counts.local_modules}`);
    console.log(`  Local Crew SKUs:               ${counts.local_crew_skus}`);
    console.log(`  Backend MODULE_PRICING SKUs:   ${counts.backend}`);
    console.log(`  P0 findings (price mismatch):  ${counts.p0}`);
    console.log(`  P1 findings (name/display):    ${counts.p1}`);
    if (findings.length === 0) {
      console.log(`\n  ✓ Pricing-site is in sync with backend MODULE_PRICING.\n`);
    } else {
      console.log(`\nFindings:`);
      for (const f of findings) {
        const marker = f.severity === 'P0' ? '✗' : '⚠';
        console.log(`  ${marker} [${f.severity}] ${f.message}`);
      }
      console.log('');
    }
  }

  process.exit(counts.p0 > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('✗ sync-backend-pricing crashed:', err);
  process.exit(2);
});
