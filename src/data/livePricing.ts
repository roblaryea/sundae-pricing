import { useEffect, useState } from 'react';
import { conceptSkus, corePackages, foresightAction, watchtower, crewSkus, crewBundles,
  billingDiscounts, billingTerms, volumeDiscounts, DISCOUNT_RULES, crossIntelligence, implementationClasses, IMPLEMENTATION_CLASS_ORDER, isRetiredCatalogId } from './pricing';
import type { BandedSku, ModuleId } from './pricing';
import { trackPricingEvent } from '../lib/analytics';

interface CatalogRule { ruleKey: string; ruleValue: Record<string, unknown> }
interface CatalogRow {
  id: string;
  firstUnitPrice?: number | null;
  monthlyPrice?: number | null;
  basePrice?: number | null;
  orgLicense?: number;
  perLocationPrice?: number;
  baseIncludesLocations?: number;
  locationBands?: [number, number][];
  marginalBands?: { fromUnit?: number | null; toUnit?: number | null; pricePerUnit?: number | null }[] | null;
  aiCreditWallet?: number;
  aiCreditsBase?: number;
  aiCreditsPerLocation?: number;
  aiSeatsIncluded?: number;
  includedModuleIds?: string[];
  allowsWatchtower?: boolean;
  isActive?: boolean;
  isHidden?: boolean;
  isSellableToCustomer?: boolean;
  rules?: CatalogRule[];
  pricingByTier?: Record<string, number>;
  setupFee?: number | null;
}
export interface CatalogVersion {
  id: string; versionName: string; effectiveDate: string; isAuthoritative: boolean;
  volumeDiscountTiers?: { minLocations: number; maxLocations: number | null; discountPercent: number }[];
  maxCombinedDiscountPercent?: number;
}
export interface LiveCatalogResponse {
  version?: CatalogVersion;
  tiers?: CatalogRow[]; modules?: CatalogRow[]; bundles?: CatalogRow[];
  corePackages?: CatalogRow[]; foresightAction?: CatalogRow | null;
  concepts?: CatalogRow[]; watchtower?: CatalogRow[];
  addons?: CatalogRow[];
  implementationClasses?: Partial<Record<typeof IMPLEMENTATION_CLASS_ORDER[number], { fee: number; isFloor: boolean }>>;
  discounts?: { effectiveFrom?: string; effectiveUntil?: string | null; priority?: number; billingCycle: string; paymentSchedule: string; discountPercent: string | number; isActive: boolean }[];
}
const CONCEPT_KEYS: Record<string, string> = {
  concept_franchise: 'franchise_intelligence', concept_hotel_fb: 'hotel_fb_analytics',
  concept_cloud_kitchen: 'cloud_kitchen', concept_catering: 'crew_catering',
  concept_production: 'crew_production', concept_rental_commissary: 'rental_commissary',
};
// An omitted optional policy must never retain a previous catalogue's values.
// These offline reference values remain explicit until the API publishes the
// corresponding policy; policyCoverage reports that boundary to consumers.
const referencePolicies = structuredClone({ volume:volumeDiscounts.tiers, ceiling:DISCOUNT_RULES.maxDiscountPercent,
  cross:crossIntelligence.pro, implementation:implementationClasses, watchtowerBundle:watchtower.bundle,
  packages:Object.fromEntries(Object.entries(corePackages).map(([id,p])=>[id,{seatsPerLocations:p.seatsPerLocations,creditRolloverCap:p.creditRolloverCap}])) });
const publicRow = (r: CatalogRow) => !isRetiredCatalogId(r.id) && r.isActive !== false && r.isHidden !== true && r.isSellableToCustomer !== false;
type LivePricingStatus = 'idle' | 'loading' | 'ready' | 'error' | 'disabled';

export interface LivePricingState {
  status: LivePricingStatus;
  version: number;
  error: string | null;
  required: boolean;
  catalog?: CatalogVersion;
  policyCoverage?: { implementation: boolean; volume: boolean; ceiling: boolean; watchtowerBundle: boolean; crossIntelligence: boolean };
}

const ENV_BASE_URL =
  import.meta.env?.VITE_PRICING_CATALOG_URL ||
  import.meta.env?.VITE_APP_URL ||
  '';
const ENV_REQUIRE_LIVE_PRICING = import.meta.env?.VITE_REQUIRE_LIVE_PRICING;

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function isLocalHostname(hostname: string) {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.local')
  );
}

function supportsSameOriginCatalog(hostname: string) {
  return (
    hostname === 'sundae.io' ||
    hostname.endsWith('.sundae.io') ||
    hostname.endsWith('.vercel.app')
  );
}

function resolveBooleanEnv(value: string | undefined): boolean | null {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
}

export function isLivePricingRequired(options?: {
  envRequireLivePricing?: string;
  hostname?: string;
}) {
  const envRequirement = resolveBooleanEnv(options?.envRequireLivePricing ?? ENV_REQUIRE_LIVE_PRICING);
  if (envRequirement !== null) {
    return envRequirement;
  }

  const runtimeHostname = options?.hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '');
  if (!runtimeHostname || isLocalHostname(runtimeHostname)) {
    return false;
  }

  return supportsSameOriginCatalog(runtimeHostname);
}

export function resolvePricingCatalogBaseUrl(options?: {
  envBaseUrl?: string;
  hostname?: string;
  origin?: string;
}) {
  const envBaseUrl = options?.envBaseUrl ?? ENV_BASE_URL;
  if (envBaseUrl) {
    return trimTrailingSlash(envBaseUrl);
  }

  const runtimeHostname = options?.hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '');
  const runtimeOrigin = options?.origin ?? (typeof window !== 'undefined' ? window.location.origin : '');
  if (!runtimeHostname || !runtimeOrigin || isLocalHostname(runtimeHostname)) {
    return '';
  }

  if (!supportsSameOriginCatalog(runtimeHostname)) {
    return '';
  }

  return trimTrailingSlash(runtimeOrigin);
}

export function resolvePricingCatalogUrl(options?: {
  envBaseUrl?: string;
  hostname?: string;
  origin?: string;
}) {
  const baseUrl = resolvePricingCatalogBaseUrl(options);
  return baseUrl ? `${baseUrl}/api/pricing/catalog/active` : null;
}

function buildLiveCatalogRequestUrl(url: string) {
  const requestUrl = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  requestUrl.searchParams.set('_ts', Date.now().toString());
  return requestUrl.toString();
}

export function normalizeLiveCatalogResponse(data: LiveCatalogResponse) {
  const modules = (data.modules ?? []).filter(publicRow);
  return {
    addons: (data.addons ?? []).filter(publicRow),
    corePackages: data.tiers
      ? data.tiers.filter(publicRow).filter((r) => `core_${r.id}` in corePackages).map((r) => ({ ...r, id: `core_${r.id}` }))
      : (data.corePackages ?? []).filter(publicRow),
    foresightAction: modules.find((r) => r.id === 'foresight') ?? data.foresightAction ?? null,
    concepts: data.modules ? Object.entries(CONCEPT_KEYS).flatMap(([id, key]) => {
      const row = modules.find((r) => r.id === key);
      return row ? [{ ...row, id }] : [];
    }) : data.concepts ?? [],
    crew: modules.filter((r) => r.id in crewSkus),
    bundles: data.bundles ?? [],
    watchtower: (data.watchtower ?? []).filter(publicRow),
  };
}

/** Validate the entire response before mutating any runtime SKU. */
export function catalogCurve(row: CatalogRow): Pick<BandedSku, 'firstUnitPrice' | 'marginalBands'> {
  const cap = row.rules?.find((r) => r.ruleKey === 'outlet_caps')?.ruleValue.maxLocations;
  const finiteCap = typeof cap === 'number' && Number.isInteger(cap) && cap > 0 ? cap : null;
  const anchor = row.firstUnitPrice ?? row.locationBands?.[0]?.[1];
  if (!Number.isFinite(anchor) || anchor! < 0) throw new Error(`Missing price curve: ${row.id}`);
  const marginalBands = row.locationBands
    ? row.locationBands.slice(1).map(([upper, rate], i, all) => ({
      fromUnit: i === 0 ? 2 : all[i - 1][0] + 1,
      toUnit: i === all.length - 1 && finiteCap === null ? null : upper,
      pricePerUnit: rate,
      label: i === all.length - 1 && finiteCap === null ? `Units ${i === 0 ? 2 : all[i - 1][0] + 1}+` : `Units ${i === 0 ? 2 : all[i - 1][0] + 1}–${upper}`,
    }))
    : (row.marginalBands ?? []).map((b) => ({ fromUnit: b.fromUnit!, toUnit: b.toUnit ?? null, pricePerUnit: b.pricePerUnit!, label: `Units ${b.fromUnit}–${b.toUnit ?? '+'}` }));
  let next = 2;
  if (!marginalBands.length) throw new Error(`Missing bands: ${row.id}`);
  marginalBands.forEach((b, i) => {
    if (b.fromUnit !== next || !Number.isInteger(b.fromUnit) || !Number.isFinite(b.pricePerUnit) || b.pricePerUnit < 0 ||
      (b.toUnit === null ? i !== marginalBands.length - 1 : !Number.isInteger(b.toUnit) || b.toUnit < b.fromUnit)) {
      throw new Error(`Invalid price bands: ${row.id}`);
    }
    next = (b.toUnit ?? next) + 1;
  });
  if (marginalBands.at(-1)?.toUnit !== finiteCap) throw new Error(`Incomplete price bands: ${row.id}`);
  return { firstUnitPrice: anchor!, marginalBands };
}

function currentDiscount(data: LiveCatalogResponse, cycle: string, timing: string) {
  const now = Date.now();
  return data.discounts?.filter(r => r.isActive && r.billingCycle === cycle && r.paymentSchedule === timing &&
    (!r.effectiveFrom || Date.parse(r.effectiveFrom) <= now) && (!r.effectiveUntil || Date.parse(r.effectiveUntil) > now))
    .sort((a,b) => (b.priority ?? 0) - (a.priority ?? 0))[0];
}
export function validatePublishedCatalog(data: LiveCatalogResponse) {
  if (!data.version?.isAuthoritative || !data.version.id || !data.version.versionName || !Number.isFinite(Date.parse(data.version.effectiveDate))) {
    throw new Error('Authoritative catalogue version is missing');
  }
  if (Date.parse(data.version.effectiveDate) > Date.now()) throw new Error('Catalogue is not effective yet');
  const normalized = normalizeLiveCatalogResponse(data);
  const groups = [
    [Object.keys(corePackages), normalized.corePackages], [Object.keys(conceptSkus), normalized.concepts],
    [Object.keys(crewSkus), normalized.crew], [Object.keys(crewBundles), normalized.bundles],
  ] as const;
  for (const [ids, rows] of groups) for (const id of ids) {
    const row = rows.find((r) => r.id === id);
    if (!row) throw new Error(`Missing published offer: ${id}`);
    catalogCurve(row);
  }
  if (!normalized.foresightAction) throw new Error('Missing Foresight pricing');
  catalogCurve(normalized.foresightAction);
  for (const r of normalized.corePackages) {
    const allowedDomains = ['labor','inventory','purchasing','marketing','reservations','profit','revenue_assurance','delivery','guest_experience','pulse','guest_crm','foresight'];
    if (r.includedModuleIds?.some((v) => !allowedDomains.includes(v))) throw new Error(`Unsupported package grant: ${r.id}`);
    if (!r.includedModuleIds?.length || typeof r.aiCreditsBase !== 'number' || typeof r.aiCreditsPerLocation !== 'number' || typeof r.aiSeatsIncluded !== 'number') throw new Error(`Missing package grants: ${r.id}`);
  }
  for (const r of normalized.crew) {
    const caps = r.rules?.find((rule) => rule.ruleKey === 'outlet_caps')?.ruleValue;
    if (!caps || typeof caps.maxEmployeesPerLocation !== 'number' || typeof caps.perEmployeeOverageUsd !== 'number') throw new Error(`Missing workforce allowance: ${r.id}`);
  }
  for (const id of ['competitive', 'events', 'trends']) {
    const row = normalized.watchtower.find((r) => r.id === id);
    if (!row || !Number.isFinite(row.basePrice) || row.basePrice! < 0 || !Number.isFinite(row.perLocationPrice) || row.perLocationPrice! < 0 || !Number.isInteger(row.baseIncludesLocations) || row.baseIncludesLocations! < 0) throw new Error(`Missing Watchtower pricing: ${id}`);
  }
  const bundle = normalized.watchtower.find(r=>r.id==='bundle');
  if(bundle && (!Number.isFinite(bundle.basePrice) || bundle.basePrice! < 0 || !Number.isFinite(bundle.perLocationPrice) || bundle.perLocationPrice! < 0 || !Number.isInteger(bundle.baseIncludesLocations) || bundle.baseIncludesLocations! < 0)) throw new Error('Invalid published Watchtower bundle');
  for (const [cycle, timing] of [['annual', 'quarterly'], ['annual', 'upfront'], ['2year', 'upfront']]) {
    const d = currentDiscount(data,cycle,timing);
    if (!d || !Number.isFinite(Number(d.discountPercent)) || Number(d.discountPercent) < 0 || Number(d.discountPercent) >= 100) throw new Error('Invalid published commitment policy');
  }
  if (data.version.volumeDiscountTiers) {
    let next = 1;
    for (const tier of data.version.volumeDiscountTiers) {
      if (tier.minLocations !== next || (tier.maxLocations !== null && (!Number.isInteger(tier.maxLocations) || tier.maxLocations < next)) || !Number.isFinite(tier.discountPercent) || tier.discountPercent < 0 || tier.discountPercent >= 100) throw new Error('Invalid published volume policy');
      next = (tier.maxLocations ?? 10000) + 1;
    }
  }
  const cap = data.version.maxCombinedDiscountPercent;
  if (cap !== undefined && (!Number.isFinite(cap) || cap < 0 || cap >= 100)) throw new Error('Invalid published discount ceiling');
  if (data.implementationClasses) for (const id of IMPLEMENTATION_CLASS_ORDER) {
    const cls = data.implementationClasses[id];
    if (!cls || !Number.isFinite(cls.fee) || cls.fee < 0 || typeof cls.isFloor !== 'boolean') throw new Error('Invalid published setup policy');
  }
  const cross = normalized.addons.find(r => r.id === 'cross_intelligence_pro');
  if (cross && (!cross.pricingByTier || ['foundation','margin','growth','performance'].some(id=>!Number.isFinite(cross.pricingByTier?.[id]) || cross.pricingByTier![id]<0) || !Number.isFinite(cross.perLocationPrice) || cross.perLocationPrice! < 0 || !Number.isInteger(cross.baseIncludesLocations))) throw new Error('Invalid published Cross-Intelligence pricing');
  return normalized;
}

const initialCatalogUrl = resolvePricingCatalogUrl();
const initialLivePricingRequired = isLivePricingRequired();

let livePricingState: LivePricingState = {
  status: initialCatalogUrl ? 'idle' : initialLivePricingRequired ? 'error' : 'disabled',
  version: 0,
  error: initialCatalogUrl || !initialLivePricingRequired
    ? null
    : 'Published pricing catalog is required for hosted pricing environments.',
  required: initialLivePricingRequired,
};

let hydrationPromise: Promise<void> | null = null;
const subscribers = new Set<() => void>();

function emit() {
  for (const subscriber of subscribers) {
    subscriber();
  }
}

function setState(patch: Partial<LivePricingState>) {
  livePricingState = { ...livePricingState, ...patch };
  emit();
}

export function applyLiveCatalogValues(data: LiveCatalogResponse) {
  const n = validatePublishedCatalog(data);
  volumeDiscounts.tiers = structuredClone(referencePolicies.volume);
  DISCOUNT_RULES.maxDiscountPercent = referencePolicies.ceiling;
  Object.assign(crossIntelligence.pro, structuredClone(referencePolicies.cross));
  Object.assign(watchtower.bundle, referencePolicies.watchtowerBundle);
  for(const id of IMPLEMENTATION_CLASS_ORDER) Object.assign(implementationClasses[id],referencePolicies.implementation[id]);
  for (const [skus, rows] of [[corePackages, n.corePackages], [conceptSkus, n.concepts], [crewSkus, n.crew], [crewBundles, n.bundles]] as const) {
    for (const [id, sku] of Object.entries(skus)) Object.assign(sku, catalogCurve(rows.find((r) => r.id === id)!));
  }
  Object.assign(foresightAction, catalogCurve(n.foresightAction!));
  for (const r of n.corePackages) {
    const pkg = corePackages[r.id as keyof typeof corePackages];
    pkg.allowsWatchtower = r.allowsWatchtower;
    Object.assign(pkg, referencePolicies.packages[r.id]);
    pkg.aiCreditWallet = r.aiCreditsBase!;
    pkg.aiCreditsPerLocation = r.aiCreditsPerLocation!;
    pkg.seatsIncluded = r.aiSeatsIncluded!;
    const rule = (key: string) => r.rules?.find((v) => v.ruleKey === key)?.ruleValue.value;
    const divisor = rule('ai_seats_unit_divisor');
    const rollover = rule('credit_rollover_cap');
    if (typeof divisor === 'number' && divisor > 0) pkg.seatsPerLocations = divisor;
    if (typeof rollover === 'number') pkg.creditRolloverCap = rollover;
    const aliases: Record<string, string> = { revenue_assurance: 'revenue', guest_experience: 'guest' };
    const domains = r.includedModuleIds!.filter((v) => v !== 'foresight').map((v) => aliases[v] ?? v);
    pkg.includesDomainModules = domains as ModuleId[];
    pkg.includesForesight = r.includedModuleIds!.includes('foresight');
  }
  for (const r of n.crew) {
    const caps = r.rules!.find((v) => v.ruleKey === 'outlet_caps')!.ruleValue;
    const sku = crewSkus[r.id as keyof typeof crewSkus];
    sku.caps.maxEmployeesPerLocation = caps.maxEmployeesPerLocation as number;
    sku.caps.perEmployeeOverageUsd = caps.perEmployeeOverageUsd as number;
    sku.caps.maxLocations = caps.maxLocations as number | null;
  }
  for (const r of n.watchtower) {
    if (r.id === 'competitive' || r.id === 'events' || r.id === 'trends' || r.id === 'bundle') Object.assign(watchtower[r.id], { basePrice: r.basePrice, perLocationPrice: r.perLocationPrice, includedLocations: r.baseIncludesLocations });
  }
  const termKeys = { 'annual_quarterly': ['annual','quarterly'], 'annual_upfront': ['annual','upfront'], 'two_year_upfront': ['2year','upfront'] } as const;
  for (const [key, [cycle, timing]] of Object.entries(termKeys)) {
    const k = key as keyof typeof termKeys;
    billingDiscounts[k] = Number(currentDiscount(data,cycle,timing)!.discountPercent);
    billingTerms[k].discountPercent = billingDiscounts[k];
  }
  const cross = n.addons.find(r=>r.id === 'cross_intelligence_pro');
  if(cross) Object.assign(crossIntelligence.pro, { monthlyFee: cross.pricingByTier!.foundation, pricingByPackage: cross.pricingByTier, perLocationPrice: cross.perLocationPrice, includedLocations: cross.baseIncludesLocations });
  const volume = data.version!.volumeDiscountTiers;
  if(volume) volumeDiscounts.tiers = [...volume.filter(t=>t.minLocations < 250).map(t=>({ min:t.minLocations, max:Math.min(t.maxLocations ?? 249,249), percent:t.discountPercent, enterpriseOnly:false, label:'' })), {min:250,max:null,percent:null,enterpriseOnly:true,label:''}];
  if(data.version!.maxCombinedDiscountPercent !== undefined) DISCOUNT_RULES.maxDiscountPercent = data.version!.maxCombinedDiscountPercent;
  if(data.implementationClasses) for(const id of IMPLEMENTATION_CLASS_ORDER) Object.assign(implementationClasses[id], data.implementationClasses[id]);
  setState({ policyCoverage: {implementation:Boolean(data.implementationClasses),volume:Boolean(volume),ceiling:data.version!.maxCombinedDiscountPercent !== undefined,watchtowerBundle:n.watchtower.some(r=>r.id==='bundle'),crossIntelligence:Boolean(cross)}, status: 'ready' , version: livePricingState.version + 1, error: null, catalog: data.version });
}

export async function hydrateLivePricingCatalog(force = false): Promise<void> {
  const url = resolvePricingCatalogUrl();
  const required = isLivePricingRequired();
  if (!url) {
    const nextStatus = required ? 'error' : 'disabled';
    const nextError = required
      ? 'Published pricing catalog is required for hosted pricing environments.'
      : null;
    if (
      livePricingState.status !== nextStatus ||
      livePricingState.error !== nextError ||
      livePricingState.required !== required
    ) {
      setState({ status: nextStatus, error: nextError, required });
    }
    return;
  }
  if (!force && livePricingState.status === 'ready') return;
  if (hydrationPromise) return hydrationPromise;

  hydrationPromise = (async () => {
    if (livePricingState.status !== 'ready') setState({ status: 'loading', error: null, required });

    try {
      const response = await fetch(buildLiveCatalogRequestUrl(url), {
        cache: 'no-store',
        signal: AbortSignal.timeout(15000),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        trackPricingEvent('catalogue_failed', { status: response.status });
        setState({
          status: 'error',
          error: `Live catalog request failed with ${response.status}`,
          required,
        });
        return;
      }

      const data: LiveCatalogResponse = await response.json();
      applyLiveCatalogValues(data);
    } catch (error) {
      trackPricingEvent('catalogue_failed');
      setState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to load live catalog',
        required,
      });
    } finally {
      hydrationPromise = null;
    }
  })();

  return hydrationPromise;
}

export function getLivePricingState(): LivePricingState {
  return livePricingState;
}

let refreshTimer: ReturnType<typeof setInterval> | undefined;
const refreshVisible = () => { if (document.visibilityState === 'visible') void hydrateLivePricingCatalog(true); };
export function useLivePricingCatalog(): LivePricingState {
  const [state, setStateLocal] = useState<LivePricingState>(livePricingState);

  useEffect(() => {
    const sync = () => setStateLocal({ ...livePricingState });
    subscribers.add(sync);
    if (subscribers.size === 1) {
      refreshTimer = setInterval(refreshVisible, 60_000);
      document.addEventListener('visibilitychange', refreshVisible);
      window.addEventListener('focus', refreshVisible);
    }
    sync();
    void hydrateLivePricingCatalog();

    return () => {
      subscribers.delete(sync);
      if (!subscribers.size) {
        clearInterval(refreshTimer);
        document.removeEventListener('visibilitychange', refreshVisible);
        window.removeEventListener('focus', refreshVisible);
      }
    };
  }, []);

  return state;
}
