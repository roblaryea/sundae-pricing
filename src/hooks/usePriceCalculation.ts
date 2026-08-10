// Price calculation hook for the Sundae pricing configurator (price book v1.7)
// Uses the centralized pricing engine for all calculations.

import { useMemo } from 'react';
import { calculateFullPrice, calculateTenzoPrice, calculateBandedTotal } from '../lib/pricingEngine';
import type { PriceResult, ClientProfile, AddOnId } from '../lib/pricingEngine';
import type { CorePackageId, CrossIntelligenceTier } from '../data/pricing';
import { corePackages, CORE_PACKAGE_IDS } from '../data/pricing';
import type { Configuration as EngineConfig } from '../lib/pricingEngine';
import type { PriceBreakdown, PriceCalculation, CrossIntelligenceSelection } from '../types/configuration';
import { useLivePricingCatalog } from '../data/livePricing';
import { useLocale } from '../contexts/LocaleContext';
import { localizeBreakdownLabel, localizeDiscountName, type PricingLocale } from '../lib/pricingI18n';

// Re-export for backward compatibility
export type { PriceBreakdown, PriceCalculation };

function toEngineConfig(
  corePackage: CorePackageId,
  locations: number,
  addOns: AddOnId[],
  watchtowerModules: string[],
  clientProfile?: ClientProfile,
  crossIntelligence?: CrossIntelligenceSelection,
): EngineConfig {
  const ciTier: CrossIntelligenceTier | undefined =
    crossIntelligence === 'pro' ? 'pro' : crossIntelligence === 'base' ? 'base' : undefined;

  return {
    layer: 'core',
    corePackage,
    locations: Math.max(1, locations),
    addOns,
    watchtower: watchtowerModules,
    crossIntelligence: ciTier,
    clientProfile: clientProfile || {
      type: 'independent',
      isEarlyAdopter: false,
      isFranchise: false,
      brandCount: 1,
    },
  };
}

export function usePriceCalculation(
  // 'crew' is accepted on the type level for caller compatibility but the
  // engine treats it as a no-op: Crew pricing is computed in CrewBuilder +
  // CrewSummaryBody, not by this Core engine.
  layer: 'core' | 'crew' | null,
  corePackage: CorePackageId,
  locations: number,
  addOns: AddOnId[] = [],
  watchtowerModules: string[] = [],
  clientProfile?: ClientProfile,
  crossIntelligence?: CrossIntelligenceSelection,
): PriceCalculation {
  const livePricing = useLivePricingCatalog();
  const { locale } = useLocale();
  const livePricingVersion = livePricing.version;

  return useMemo(() => {
    void livePricingVersion;
    void layer;
    const config = toEngineConfig(
      corePackage,
      locations,
      addOns,
      watchtowerModules,
      clientProfile,
      crossIntelligence,
    );
    const result: PriceResult = calculateFullPrice(config);

    const breakdown: PriceBreakdown[] = result.breakdown.map((item) => {
      let category: PriceBreakdown['category'] = 'base';

      if (item.item.includes('Cross-Intelligence')) {
        category = 'cross_intelligence';
      } else if (item.item.includes('Watchtower')) {
        category = 'watchtower';
      } else if (!item.item.startsWith('Core ')) {
        category = 'addon';
      }

      return {
        item: localizeBreakdownLabel(item.item, locale as PricingLocale),
        price: item.price,
        perLocation: item.price / Math.max(1, locations),
        category,
        note: item.note,
      };
    });

    const discounts = result.discountsApplied.map((discount) => ({
      ...discount,
      name: localizeDiscountName(discount.name, locale as PricingLocale),
    }));

    // Tenzo prices per module per location; every Core package ships the
    // eleven domain modules, so compare against all eleven.
    const tenzoComparison = calculateTenzoPrice(locations, 11);

    return {
      total: result.total,
      perLocation: result.perLocation,
      breakdown,
      annualTotal: result.annualTotal,
      annualPerLocation: result.annualTotal / Math.max(1, locations),
      aiCredits: result.aiCreditsTotal,
      subtotal: result.subtotal,
      discounts,
      requiresEnterpriseQuote: result.requiresEnterpriseQuote,
      implementation: result.implementation,
      savings: {
        tenzo: tenzoComparison,
      },
    };
  }, [
    layer,
    corePackage,
    locations,
    addOns,
    watchtowerModules,
    clientProfile,
    crossIntelligence,
    livePricingVersion,
    locale,
  ]);
}

/**
 * Cheapest Core package at a given unit count. Because bands are marginal and
 * every package uses the same band boundaries, the cheapest package is
 * Foundation at every scale — this helper recomputes rather than assuming, so
 * a future band change can flip the answer without silently lying.
 */
export function suggestOptimalCorePackage(locations: number): CorePackageId {
  return CORE_PACKAGE_IDS.reduce((cheapest, id) =>
    calculateBandedTotal(corePackages[id], locations) <
    calculateBandedTotal(corePackages[cheapest], locations)
      ? id
      : cheapest,
  );
}
