/**
 * Discovery → quote wiring.
 *
 * The simulator used to ask what hurts and how fast you want results, then jump
 * straight to a package. Two things a real Sundae deal turns on were never
 * asked:
 *
 *   1. HOW THE BUSINESS IS RUN. A franchisor, a hotel F&B group and a cloud
 *      kitchen buy different concept pathways and are billed on different
 *      per-object overlays. Asking after a package is chosen means the quote is
 *      already wrong.
 *   2. WHAT WE WOULD BE CONNECTING TO. Price book v1.7 section 7 charges
 *      implementation ONCE at the highest class in the selection. With nothing
 *      asked about systems, every quote fell back to "scoped at contract" and
 *      the buyer never saw the one-time number.
 *
 * This module turns those two answers into the things the quote needs, and
 * nothing else — it recommends, it does not silently add paid items.
 */

import { conceptSkus, implementationClasses } from '../data/pricing';
import type { ConceptSkuId, ImplementationClassId } from '../data/pricing';

export type OperatingModelId =
  | 'single_brand'
  | 'multi_brand'
  | 'franchise'
  | 'hotel_fb'
  | 'cloud_kitchen'
  | 'catering'
  | 'production';

export type TechStackId =
  | 'pos_standard'
  | 'pos_multiple'
  | 'accounting'
  | 'payroll_hr'
  | 'inventory_supply'
  | 'delivery_reservations'
  | 'custom_legacy'
  | 'not_sure';

/**
 * Operating model → the concept pathway that prices it. Only models with a
 * published v1.7 concept SKU map to one; `single_brand` and `multi_brand` are
 * served by the Core packages themselves and deliberately map to nothing.
 */
const CONCEPT_FOR_MODEL: Partial<Record<OperatingModelId, ConceptSkuId>> = {
  franchise: 'concept_franchise',
  hotel_fb: 'concept_hotel_fb',
  cloud_kitchen: 'concept_cloud_kitchen',
  catering: 'concept_catering',
  production: 'concept_production',
};

/**
 * The per-object overlay each model carries (price book v1.7 sections 5.3, 8).
 * Charged only while the object is active, and never discountable — surfaced so
 * a hotel group sees revenue-centre billing before signature, not after.
 */
export interface ObjectOverlay {
  model: OperatingModelId;
  object: string;
  includedPerLocation: number;
  ratePerObject: number;
}

const OVERLAYS: Partial<Record<OperatingModelId, ObjectOverlay>> = {
  hotel_fb: {
    model: 'hotel_fb',
    object: 'revenue centre',
    includedPerLocation: 5,
    ratePerObject: 75,
  },
  cloud_kitchen: {
    model: 'cloud_kitchen',
    object: 'virtual brand',
    includedPerLocation: 3,
    ratePerObject: 45,
  },
  production: {
    model: 'production',
    object: 'external production site',
    includedPerLocation: 5,
    ratePerObject: 15,
  },
};

export function recommendedConceptSkus(models: OperatingModelId[]): ConceptSkuId[] {
  const out: ConceptSkuId[] = [];
  for (const m of models) {
    const id = CONCEPT_FOR_MODEL[m];
    if (id && conceptSkus[id] && !out.includes(id)) out.push(id);
  }
  return out;
}

export function objectOverlaysFor(models: OperatingModelId[]): ObjectOverlay[] {
  return models.map((m) => OVERLAYS[m]).filter((o): o is ObjectOverlay => Boolean(o));
}

// ═══════════════════════════════════════════════════════════════════════════
// IMPLEMENTATION CLASS
// ═══════════════════════════════════════════════════════════════════════════

export interface ImplementationEstimate {
  classId: ImplementationClassId;
  fee: number;
  /** True when v1.7 publishes this as a floor rather than a fixed fee. */
  isFloor: boolean;
  /** Plain-language reasons, shown to the buyer so the number is not a mystery. */
  drivers: string[];
  /** True when the visitor said "not sure" and we are showing an indicative class. */
  isIndicative: boolean;
}

/**
 * Resolve the implementation class from what the operator actually runs.
 *
 * The ladder escalates on INTEGRATION COMPLEXITY and payroll exposure, not on
 * estate size — a 40-site group on one standard POS launches more cheaply than
 * a 6-site group with a legacy on-premise system and payroll in scope. Every
 * step up is justified to the buyer through `drivers`.
 */
export function resolveImplementationClass(
  stack: TechStackId[],
  models: OperatingModelId[],
  options: { crewPayrollSelected?: boolean } = {},
): ImplementationEstimate {
  const has = (id: TechStackId) => stack.includes(id);
  const drivers: string[] = [];
  let rank = 0; // self_service

  if (stack.length === 0 || (stack.length === 1 && has('not_sure'))) {
    return {
      classId: 'class_b',
      fee: implementationClasses.class_b.fee,
      isFloor: implementationClasses.class_b.isFloor,
      drivers: ['Indicative standard launch until we know which systems are in scope'],
      isIndicative: true,
    };
  }

  if (has('pos_standard')) {
    rank = Math.max(rank, 1);
    drivers.push('Pre-built POS connector');
  }

  // A second data domain is the difference between a connector and a launch.
  const domains = (['accounting', 'payroll_hr', 'inventory_supply', 'delivery_reservations'] as const).filter(has);
  if (domains.length > 0) {
    rank = Math.max(rank, 2);
    drivers.push(`${domains.length} further system${domains.length > 1 ? 's' : ''} to connect`);
  }

  if (has('pos_multiple')) {
    rank = Math.max(rank, 3);
    drivers.push('More than one POS to reconcile into one standard');
  }

  // Multi-concept work has to be sequenced, which is Class C by definition.
  const conceptModels = models.filter((m) => m !== 'single_brand');
  if (conceptModels.length >= 2) {
    rank = Math.max(rank, 3);
    drivers.push('Multiple operating models to sequence');
  }

  if (has('custom_legacy')) {
    rank = Math.max(rank, 3);
    drivers.push('Custom, legacy or on-premise source needing bespoke integration');
  }

  // Payroll is statutory: it validates against country packs before go-live.
  if (options.crewPayrollSelected || has('payroll_hr')) {
    if (options.crewPayrollSelected) {
      rank = Math.max(rank, 4);
      drivers.push('Payroll in scope — statutory validation before go-live');
    }
  }

  const order: ImplementationClassId[] = ['self_service', 'class_a', 'class_b', 'class_c', 'class_d'];
  const classId = order[Math.min(rank, order.length - 1)];
  const cls = implementationClasses[classId];
  return {
    classId,
    fee: cls.fee,
    isFloor: cls.isFloor,
    drivers,
    isIndicative: false,
  };
}
