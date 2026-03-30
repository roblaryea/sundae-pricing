import { useEffect, useState } from 'react';
import { coreTiers, moduleBundles, modules, reportTiers, watchtower } from './pricing';

type LiveCatalogTier = {
  id: string;
  basePrice?: number | null;
  perLocationPrice?: number | null;
  aiCreditsBase?: number | null;
  aiCreditsPerLocation?: number | null;
  aiSeatsIncluded?: number | null;
};

type LiveCatalogModule = {
  id: string;
  orgLicense?: number | null;
  perLocationPrice?: number | null;
  baseIncludesLocations?: number | null;
  setupFee?: number | null;
  dependencies?: string[] | null;
  pricingByTier?: Record<
    string,
    {
      orgLicense?: number | null;
      perLocationPrice?: number | null;
      baseIncludesLocations?: number | null;
    }
  > | null;
};

type LiveCatalogWatchtower = {
  id: string;
  basePrice?: number | null;
  perLocationPrice?: number | null;
  baseIncludesLocations?: number | null;
};

type LiveCatalogBundle = {
  id: string;
  moduleIds?: string[] | null;
  discountPercent?: number | null;
};

type LiveCatalogResponse = {
  tiers?: LiveCatalogTier[];
  modules?: LiveCatalogModule[];
  watchtower?: LiveCatalogWatchtower[];
  bundles?: LiveCatalogBundle[];
};

type LivePricingStatus = 'idle' | 'loading' | 'ready' | 'error' | 'disabled';

interface LivePricingState {
  status: LivePricingStatus;
  version: number;
  error: string | null;
}

type MutableTier = {
  basePrice: number | string;
  additionalLocationPrice: number | string;
  aiCredits: {
    base: number;
    perLocation: number;
  };
  aiSeats: number | string;
};

const DEFAULT_BASE_URL =
  import.meta.env.VITE_PRICING_CATALOG_URL ||
  import.meta.env.VITE_APP_URL ||
  '';

let livePricingState: LivePricingState = {
  status: DEFAULT_BASE_URL ? 'idle' : 'disabled',
  version: 0,
  error: null,
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

function resolveCatalogUrl() {
  if (!DEFAULT_BASE_URL) return null;
  return `${DEFAULT_BASE_URL.replace(/\/+$/, '')}/api/pricing/catalog/active`;
}

function applyLiveTierValues(tiers: LiveCatalogTier[] | undefined) {
  if (!tiers?.length) return;

  const byId = new Map(tiers.map((tier) => [tier.id, tier]));
  const patchTier = (tier: MutableTier, live: LiveCatalogTier | undefined) => {
    if (!live) return;
    if (typeof live.basePrice === 'number') tier.basePrice = live.basePrice;
    if (typeof live.perLocationPrice === 'number') tier.additionalLocationPrice = live.perLocationPrice;
    if (typeof live.aiCreditsBase === 'number') tier.aiCredits.base = live.aiCreditsBase;
    if (typeof live.aiCreditsPerLocation === 'number') tier.aiCredits.perLocation = live.aiCreditsPerLocation;
    if (typeof live.aiSeatsIncluded === 'number') tier.aiSeats = live.aiSeatsIncluded;
  };

  patchTier(reportTiers.lite as MutableTier, byId.get('report_lite'));
  patchTier(reportTiers.plus as MutableTier, byId.get('report_plus'));
  patchTier(reportTiers.pro as MutableTier, byId.get('report_pro'));
  patchTier(coreTiers.lite as MutableTier, byId.get('core_lite'));
  patchTier(coreTiers.pro as MutableTier, byId.get('core_pro'));
}

function applyLiveModuleValues(liveModules: LiveCatalogModule[] | undefined) {
  if (!liveModules?.length) return;

  const byId = new Map(liveModules.map((module) => [module.id, module]));

  for (const [moduleId, moduleConfig] of Object.entries(modules)) {
    const liveModule = byId.get(moduleId);
    if (!liveModule) continue;

    if (typeof liveModule.orgLicense === 'number') {
      moduleConfig.orgLicensePrice = liveModule.orgLicense;
    }
    if (typeof liveModule.perLocationPrice === 'number') {
      moduleConfig.perLocationPrice = liveModule.perLocationPrice;
    }
    if (typeof liveModule.baseIncludesLocations === 'number') {
      moduleConfig.baseIncludesLocations = liveModule.baseIncludesLocations;
    }
    if (typeof liveModule.setupFee === 'number') {
      moduleConfig.setupFee = liveModule.setupFee;
    }
    if (Array.isArray(liveModule.dependencies)) {
      moduleConfig.prerequisites = [...liveModule.dependencies];
    }
    if (liveModule.pricingByTier) {
      const nextPricingByTier = {} as NonNullable<typeof moduleConfig.pricingByTier>;

      for (const [tierKey, tierPricing] of Object.entries(liveModule.pricingByTier)) {
        nextPricingByTier[tierKey as keyof typeof nextPricingByTier] = {
          orgLicensePrice:
            typeof tierPricing.orgLicense === 'number'
              ? tierPricing.orgLicense
              : moduleConfig.orgLicensePrice,
          perLocationPrice:
            typeof tierPricing.perLocationPrice === 'number'
              ? tierPricing.perLocationPrice
              : moduleConfig.perLocationPrice,
        };
      }

      if (Object.keys(nextPricingByTier).length > 0) {
        moduleConfig.pricingByTier = nextPricingByTier;
      }
    }
  }
}

function recalculateModuleBundleValues(liveBundles: LiveCatalogBundle[] | undefined) {
  const bundleMap = new Map((liveBundles || []).map((bundle) => [bundle.id, bundle]));

  for (const bundle of Object.values(moduleBundles)) {
    const liveBundle = bundleMap.get(bundle.id);
    const bundleModuleIds = Array.isArray(liveBundle?.moduleIds) && liveBundle.moduleIds.length > 0
      ? liveBundle.moduleIds
      : bundle.modules;

    const moduleConfigs = bundleModuleIds
      .map((moduleId) => modules[moduleId as keyof typeof modules])
      .filter(Boolean);
    if (moduleConfigs.length === 0) continue;

    bundle.modules = [...bundleModuleIds] as typeof bundle.modules;

    const baseModuleTotal = moduleConfigs.reduce((sum, moduleConfig) => sum + moduleConfig.orgLicensePrice, 0);
    const perLocationModuleTotal = moduleConfigs.reduce(
      (sum, moduleConfig) => sum + moduleConfig.perLocationPrice,
      0
    );

    const liveDiscountRatio =
      typeof liveBundle?.discountPercent === 'number'
        ? Math.max(0, liveBundle.discountPercent / 100)
        : null;
    const baseDiscountRatio =
      liveDiscountRatio ??
      (baseModuleTotal > 0 ? Math.max(0, 1 - bundle.basePrice / baseModuleTotal) : 0);
    const perLocationDiscountRatio =
      liveDiscountRatio ??
      (perLocationModuleTotal > 0
        ? Math.max(0, 1 - bundle.perLocationPrice / perLocationModuleTotal)
        : 0);

    bundle.basePrice = Math.round(baseModuleTotal * (1 - baseDiscountRatio));
    bundle.perLocationPrice = Math.round(perLocationModuleTotal * (1 - perLocationDiscountRatio));

    for (const [tierKey, tierPricing] of Object.entries(bundle.pricingByTier)) {
      const tierModuleTotal = moduleConfigs.reduce((sum, moduleConfig) => {
        const liveTierPricing = moduleConfig.pricingByTier?.[tierKey as keyof typeof moduleConfig.pricingByTier];
        return sum + (liveTierPricing?.orgLicensePrice ?? moduleConfig.orgLicensePrice);
      }, 0);

      const tierPerLocationTotal = moduleConfigs.reduce((sum, moduleConfig) => {
        const liveTierPricing = moduleConfig.pricingByTier?.[tierKey as keyof typeof moduleConfig.pricingByTier];
        return sum + (liveTierPricing?.perLocationPrice ?? moduleConfig.perLocationPrice);
      }, 0);

      tierPricing.basePrice = Math.round(tierModuleTotal * (1 - baseDiscountRatio));
      tierPricing.perLocationPrice = Math.round(
        tierPerLocationTotal * (1 - perLocationDiscountRatio)
      );
    }
  }
}

function applyLiveWatchtowerValues(liveWatchtower: LiveCatalogWatchtower[] | undefined) {
  if (!liveWatchtower?.length) return;

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
  applyLiveTierValues(data.tiers);
  applyLiveModuleValues(data.modules);
  recalculateModuleBundleValues(data.bundles);
  applyLiveWatchtowerValues(data.watchtower);

  livePricingState = {
    status: 'ready',
    version: livePricingState.version + 1,
    error: null,
  };
  emit();
}

export async function hydrateLivePricingCatalog(force = false): Promise<void> {
  if (livePricingState.status === 'disabled') return;
  if (!force && livePricingState.status === 'ready') return;
  if (hydrationPromise && !force) return hydrationPromise;

  const url = resolveCatalogUrl();
  if (!url) {
    setState({ status: 'disabled', error: null });
    return;
  }

  hydrationPromise = (async () => {
    setState({ status: 'loading', error: null });

    try {
      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        setState({
          status: 'error',
          error: `Live catalog request failed with ${response.status}`,
        });
        return;
      }

      const data: LiveCatalogResponse = await response.json();
      applyLiveCatalogValues(data);
    } catch (error) {
      setState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to load live catalog',
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
