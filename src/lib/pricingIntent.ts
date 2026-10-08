/** Pricing intent contract v2. Shared verbatim with website + app receivers.
 * URL data describes a selection; it never grants entitlements or fixes a price.
 */
export const INTENT_PACKAGES = ['core_foundation','core_margin','core_growth','core_performance'] as const;
export const INTENT_CREW = ['crew_lite','crew_scheduling','crew_operations','crew_tna','crew_payroll','crew_people_intelligence'] as const;
export const INTENT_ADDONS = ['foresight_action','concept_franchise','concept_hotel_fb','concept_cloud_kitchen','concept_catering','concept_production','concept_rental_commissary'] as const;
export const INTENT_TERMS = ['monthly','annual_quarterly','annual_upfront','two_year_upfront'] as const;
export const INTENT_MODELS = ['single_brand','multi_brand','franchise','hotel_fb','cloud_kitchen','catering','production'] as const;
export interface PricingIntent {
  v: 2;
  layer: 'core' | 'crew' | 'both';
  corePackage: typeof INTENT_PACKAGES[number];
  locations: number;
  addOns: typeof INTENT_ADDONS[number][];
  watchtowerModules: ('competitive' | 'events' | 'trends' | 'bundle')[];
  crewSkus: typeof INTENT_CREW[number][];
  crossIntelligence: 'none' | 'base' | 'pro';
  billingCycle: typeof INTENT_TERMS[number];
  operatingModels: typeof INTENT_MODELS[number][];
  employees: number | null;
  payrollCountry: string;
  catalogue?: { id: string; versionName: string };
}
export function normalizeCrewSelection(ids: PricingIntent['crewSkus']): PricingIntent['crewSkus'] {
  if (ids.includes('crew_lite')) return ['crew_lite'];
  const s = new Set(ids);
  if (s.has('crew_payroll') || s.has('crew_people_intelligence')) s.add('crew_operations');
  if (s.has('crew_operations') || s.has('crew_tna')) s.add('crew_scheduling');
  return [...s];
}
export function normalizeWatchtowerSelection(ids: readonly string[]): PricingIntent['watchtowerModules'] {
  const individual = ['competitive','events','trends'] as const;
  if (ids.includes('bundle') || individual.every(id => ids.includes(id))) return ['bundle'];
  return individual.filter(id => ids.includes(id));
}
const validList = <T extends string>(value: unknown, allowed: readonly T[]): value is T[] =>
  Array.isArray(value) && value.length <= allowed.length && value.every((v) => allowed.includes(v)) && new Set(value).size === value.length;
export function parsePricingIntent(value: unknown): PricingIntent | null {
  if (!value || typeof value !== 'object') return null;
  const x = value as Record<string, unknown>;
  // Accept the previous *package* transport. Retired tier/module links are invalid.
  if (x.v !== 2 && !(x.v === 1 && x.corePackage)) return null;
  if (!['core','crew','both'].includes(x.layer as string) || !INTENT_PACKAGES.includes(x.corePackage as PricingIntent['corePackage']) ||
    !Number.isInteger(x.locations) || (x.locations as number) < 1 || (x.locations as number) > 10000) return null;
  const addOns = x.addOns ?? [];
  const crew = x.crewSkus ?? [];
  const wt = x.watchtowerModules ?? (x.watchtower === true ? ['bundle'] : []);
  const models = x.operatingModels ?? [];
  const cycle = x.billingCycle ?? 'monthly';
  const ci = x.crossIntelligence ?? 'none';
  if (!validList(addOns, INTENT_ADDONS) || !validList(crew, INTENT_CREW) || !validList(wt, ['competitive','events','trends','bundle'] as const) ||
    !validList(models, INTENT_MODELS) || !INTENT_TERMS.includes(cycle as PricingIntent['billingCycle']) || !['none','base','pro'].includes(ci as string)) return null;
  if (wt.includes('bundle') && wt.length !== 1) return null;
  if (wt.length && !['core_growth','core_performance'].includes(x.corePackage as string)) return null;
  if (crew.includes('crew_lite') && (crew.length !== 1 || (x.locations as number) > 5)) return null;
  const employees = x.employees ?? null;
  if (employees !== null && (!Number.isInteger(employees) || (employees as number) < 0 || (employees as number) > 1000000)) return null;
  const payrollCountry = x.payrollCountry ?? '';
  if (typeof payrollCountry !== 'string' || !/^(|[A-Z]{2})$/.test(payrollCountry)) return null;
  if (x.layer === 'crew' && (addOns.length || wt.length || ci !== 'none')) return null;
  if (x.layer !== 'core' && crew.length === 0) return null;
  const catalogue = x.catalogue as PricingIntent['catalogue'];
  if (catalogue && (typeof catalogue.id !== 'string' || catalogue.id.length > 100 || typeof catalogue.versionName !== 'string' || catalogue.versionName.length > 40)) return null;
  return {
    v: 2, layer: x.layer as PricingIntent['layer'], corePackage: x.corePackage as PricingIntent['corePackage'], locations: x.locations as number,
    addOns, crewSkus: x.layer === 'core' ? [] : normalizeCrewSelection(crew), watchtowerModules: normalizeWatchtowerSelection(wt),
    billingCycle: cycle as PricingIntent['billingCycle'], crossIntelligence: ci as PricingIntent['crossIntelligence'], operatingModels: models,
    employees: employees as number | null, payrollCountry,
  };
}
export function encodePricingIntent(intent: PricingIntent): string {
  // Customer URLs carry only validated selection fields. Catalogue revisions,
  // internal IDs and unknown properties are never copied into a handoff.
  const publicIntent = parsePricingIntent(intent);
  if (!publicIntent) throw new Error('Invalid pricing selection');
  const bytes = new TextEncoder().encode(JSON.stringify(publicIntent));
  return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join('')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/, '');
}
export function decodePricingIntent(raw: string): PricingIntent | null {
  if (raw.length > 6000 || !/^[A-Za-z0-9_-]+$/.test(raw)) return null;
  try {
    const bytes = Uint8Array.from(atob(raw.replace(/-/g,'+').replace(/_/g,'/')), (c) => c.charCodeAt(0));
    return parsePricingIntent(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)));
  } catch { return null; }
}
