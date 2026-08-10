import { useEffect, useState } from 'react';
// ── Live catalog overlay (price book v1.7) ────────────────────────────────
// The published catalog can only patch NUMERIC values on SKUs this app still
// offers. Under v1.7 that means: the four Core packages (first-unit anchor +
// marginal bands + AI credit wallet), Foresight & Action, the concept SKUs,
// and Watchtower. It deliberately can no longer patch the retired
// report_lite / report_plus / report_pro / core_lite / core_pro ids, nor the
// per-module prices that v1.7 removed — those SKUs are not sold, so a live
// value for them would have nothing to price.
import {
  conceptSkus,
  corePackages,
  foresightAction,
  watchtower,
  isRetiredCatalogId,
} from './pricing';
import type { BandedSku, ConceptSkuId, CorePackageId, MarginalBand } from './pricing';

type LiveCatalogBand = {
  fromUnit?: number | null;
  toUnit?: number | null;
  pricePerUnit?: number | null;
};

type LiveCatalogPackage = {
  id: string;
  firstUnitPrice?: number | null;
  marginalBands?: LiveCatalogBand[] | null;
  aiCreditWallet?: number | null;
};

type LiveCatalogConcept = {
  id: string;
  monthlyPrice?: number | null;
};

type LiveCatalogWatchtower = {
  id: string;
  basePrice?: number | null;
  perLocationPrice?: number | null;
  baseIncludesLocations?: number | null;
};

type LiveCatalogResponse = {
  corePackages?: LiveCatalogPackage[];
  foresightAction?: LiveCatalogPackage | null;
  concepts?: LiveCatalogConcept[];
  watchtower?: LiveCatalogWatchtower[];
};

type LivePricingStatus = 'idle' | 'loading' | 'ready' | 'error' | 'disabled';

export interface LivePricingState {
  status: LivePricingStatus;
  version: number;
  error: string | null;
  required: boolean;
}

const ENV_BASE_URL =
  import.meta.env.VITE_PRICING_CATALOG_URL ||
  import.meta.env.VITE_APP_URL ||
  '';
const ENV_REQUIRE_LIVE_PRICING = import.meta.env.VITE_REQUIRE_LIVE_PRICING;

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

export function normalizeLiveCatalogResponse(data: LiveCatalogResponse): {
  corePackages: LiveCatalogPackage[];
  foresightAction: LiveCatalogPackage | null;
  concepts: LiveCatalogConcept[];
  watchtower: LiveCatalogWatchtower[];
} {
  // Retired ids are dropped at the door: nothing downstream should be able to
  // resurrect a Report tier or Core Lite/Pro by publishing a price for it.
  const corePackageRows = (data.corePackages ?? []).filter((row) => !isRetiredCatalogId(row.id));

  return {
    corePackages: corePackageRows,
    foresightAction: data.foresightAction ?? null,
    concepts: data.concepts ?? [],
    watchtower: data.watchtower ?? [],
  };
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

function applyLiveBands(sku: BandedSku, live: LiveCatalogPackage | null | undefined) {
  if (!live) return;
  if (typeof live.firstUnitPrice === 'number') {
    sku.firstUnitPrice = live.firstUnitPrice;
  }
  if (Array.isArray(live.marginalBands) && live.marginalBands.length > 0) {
    const bands: MarginalBand[] = [];
    for (const row of live.marginalBands) {
      if (typeof row.fromUnit !== 'number' || typeof row.pricePerUnit !== 'number') continue;
      const toUnit = typeof row.toUnit === 'number' ? row.toUnit : null;
      bands.push({
        fromUnit: row.fromUnit,
        toUnit,
        pricePerUnit: row.pricePerUnit,
        label: toUnit === null ? `Units ${row.fromUnit}+` : `Units ${row.fromUnit}\u2013${toUnit}`,
      });
    }
    if (bands.length > 0) {
      sku.marginalBands = bands;
    }
  }
}

function applyLiveCorePackages(rows: LiveCatalogPackage[]) {
  if (!rows.length) return;
  const byId = new Map(rows.map((row) => [row.id, row]));

  for (const packageId of Object.keys(corePackages) as CorePackageId[]) {
    const live = byId.get(packageId);
    if (!live) continue;
    const pkg = corePackages[packageId];
    applyLiveBands(pkg, live);
    if (typeof live.aiCreditWallet === 'number') {
      pkg.aiCreditWallet = live.aiCreditWallet;
    }
  }
}

function applyLiveForesightAction(live: LiveCatalogPackage | null) {
  applyLiveBands(foresightAction, live);
}

function applyLiveConcepts(rows: LiveCatalogConcept[]) {
  if (!rows.length) return;
  const byId = new Map(rows.map((row) => [row.id, row]));

  for (const conceptId of Object.keys(conceptSkus) as ConceptSkuId[]) {
    const live = byId.get(conceptId);
    if (live && typeof live.monthlyPrice === 'number') {
      conceptSkus[conceptId].monthlyPrice = live.monthlyPrice;
    }
  }
}

function applyLiveWatchtowerValues(liveWatchtower: LiveCatalogWatchtower[]) {
  if (!liveWatchtower.length) return;

  const byId = new Map(liveWatchtower.map((item) => [item.id, item]));

  for (const [watchtowerId, watchtowerConfig] of Object.entries(watchtower)) {
    const liveItem = byId.get(watchtowerId);
    if (!liveItem || 'includes' in watchtowerConfig) continue;

    if (typeof liveItem.basePrice === 'number') {
      watchtowerConfig.basePrice = liveItem.basePrice;
    }
    if (typeof liveItem.perLocationPrice === 'number') {
      watchtowerConfig.perLocationPrice = liveItem.perLocationPrice;
    }
    if (typeof liveItem.baseIncludesLocations === 'number') {
      watchtowerConfig.includedLocations = liveItem.baseIncludesLocations;
    }
  }
}

function applyLiveCatalogValues(data: LiveCatalogResponse) {
  const normalized = normalizeLiveCatalogResponse(data);
  applyLiveCorePackages(normalized.corePackages);
  applyLiveForesightAction(normalized.foresightAction);
  applyLiveConcepts(normalized.concepts);
  applyLiveWatchtowerValues(normalized.watchtower);

  livePricingState = {
    status: 'ready',
    version: livePricingState.version + 1,
    error: null,
    required: livePricingState.required,
  };
  emit();
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
  if (hydrationPromise && !force) return hydrationPromise;

  hydrationPromise = (async () => {
    setState({ status: 'loading', error: null, required });

    try {
      const response = await fetch(buildLiveCatalogRequestUrl(url), {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
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

export function useLivePricingCatalog(): LivePricingState {
  const [state, setStateLocal] = useState<LivePricingState>(livePricingState);

  useEffect(() => {
    const sync = () => setStateLocal({ ...livePricingState });
    subscribers.add(sync);
    sync();
    void hydrateLivePricingCatalog();

    return () => {
      subscribers.delete(sync);
    };
  }, []);

  return state;
}
