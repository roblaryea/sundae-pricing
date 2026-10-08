import { LEGACY_BILLING_CYCLES } from '../data/pricing';
import { parsePricingIntent } from './pricingIntent';
import type { PricingIntent } from './pricingIntent';
import type { ROIInputs } from '../hooks/useROICalculation';
import type { TechStackId } from './discoveryEngine';

const techStackIds: readonly TechStackId[] = ['pos_standard','pos_multiple','accounting','payroll_hr','inventory_supply','delivery_reservations','custom_legacy','not_sure'];
const roiBounds = {
  monthlyRevenue: [75000,500000], laborPercent: [20,40], foodCostPercent: [20,40],
  marketingSpend: [0,10000], reservationNoShowRate: [0,50], deliveryRevenuePct: [0,100],
  replaceableSystemsSpend: [0,100000000], manualReportingHoursPerWeek: [0,1000000], loadedHourlyRate: [0,1000000],
} as const;

/** Browser storage is untrusted. Restore known planning fields without accepting stale UI state. */
export function restorePricingPreferences(saved: unknown): { techStack?: TechStackId[]; roiInputs?: Partial<ROIInputs> } {
  if (!saved || typeof saved !== 'object') return {};
  const x = saved as Record<string, unknown>;
  const result: ReturnType<typeof restorePricingPreferences> = {};
  if (Array.isArray(x.techStack) && x.techStack.every((id) => techStackIds.includes(id))) {
    result.techStack = [...new Set(x.techStack)] as TechStackId[];
  }
  if (x.roiInputs && typeof x.roiInputs === 'object') {
    const inputs = x.roiInputs as Record<string, unknown>;
    const roiInputs: Partial<ROIInputs> = {};
    for (const key of Object.keys(roiBounds) as (keyof typeof roiBounds)[]) {
      const value = inputs[key];
      const [min,max] = roiBounds[key];
      if (typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max) roiInputs[key] = value;
    }
    if (typeof inputs.hasReviewData === 'boolean') roiInputs.hasReviewData = inputs.hasReviewData;
    result.roiInputs = roiInputs;
  }
  return result;
}

/** Validate browser storage just like imported links; old IDs cannot reach the calculator. */
export function restorePricingSelection(saved: unknown): Partial<PricingIntent> {
  if (!saved || typeof saved !== 'object') return {};
  const x = saved as Record<string, unknown>;
  const cycle = typeof x.billingCycle === 'string' && x.billingCycle in LEGACY_BILLING_CYCLES
    ? LEGACY_BILLING_CYCLES[x.billingCycle] : x.billingCycle ?? 'monthly';
  const layer = x.layer ?? 'core';
  const intent = parsePricingIntent({
    v: 2, layer, corePackage: x.corePackage ?? 'core_foundation', locations: x.locations ?? 1,
    addOns: x.addOns ?? [], watchtowerModules: x.watchtowerModules ?? [],
    crewSkus: x.crewSkus ?? (layer === 'core' ? [] : ['crew_operations','crew_scheduling','crew_tna','crew_payroll']),
    crossIntelligence: x.crossIntelligence ?? 'none', billingCycle: cycle,
    operatingModels: x.operatingModels ?? [], employees: x.employees ?? null,
    payrollCountry: x.payrollCountry ?? '',
  });
  if (!intent) return {};
  const { v: _version, ...selection } = intent;
  void _version;
  return selection;
}
