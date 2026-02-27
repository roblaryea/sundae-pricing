// Price calculation hook for Sundae pricing configurator
// Uses the centralized pricing engine for all calculations

import { useMemo } from 'react';
import { calculateFullPrice, calculateTenzoPrice } from '../lib/pricingEngine';
import type { PriceResult, ClientProfile } from '../lib/pricingEngine';
import type { ModuleId, CrossIntelligenceTier } from '../data/pricing';
import type { Configuration as EngineConfig } from '../lib/pricingEngine';
import type { PriceBreakdown, PriceCalculation, CrossIntelligenceSelection } from '../types/configuration';

// Re-export for backward compatibility
export type { PriceBreakdown, PriceCalculation };

// Convert old configuration format to new engine format
function convertToEngineConfig(
  layer: 'report' | 'core' | null,
  tier: string,
  locations: number,
  modules: string[],
  watchtowerModules: string[],
  clientProfile?: ClientProfile,
  crossIntelligence?: CrossIntelligenceSelection
): EngineConfig {
  // Map crossIntelligence selection to engine tier
  const ciTier: CrossIntelligenceTier | undefined =
    crossIntelligence === 'pro' ? 'pro' :
    crossIntelligence === 'base' ? 'base' :
    undefined;

  return {
    layer: layer || 'report',
    tier,
    locations: Math.max(1, locations),
    modules: modules as ModuleId[],
    watchtower: watchtowerModules,
    crossIntelligence: ciTier,
    clientProfile: clientProfile || {
      type: 'independent',
      isEarlyAdopter: false,
      isFranchise: false,
      brandCount: 1
    }
  };
}

export function usePriceCalculation(
  layer: 'report' | 'core' | null,
  tier: string,
  locations: number,
  modules: string[] = [],
  watchtowerModules: string[] = [],
  clientProfile?: ClientProfile,
  crossIntelligence?: CrossIntelligenceSelection
): PriceCalculation {
  return useMemo(() => {
    // Use centralized pricing engine
    const config = convertToEngineConfig(layer, tier, locations, modules, watchtowerModules, clientProfile, crossIntelligence);
    const result: PriceResult = calculateFullPrice(config);
    
    // Convert breakdown to old format
    const breakdown: PriceBreakdown[] = result.breakdown.map(item => {
      let category: 'base' | 'module' | 'watchtower' | 'cross_intelligence' = 'base';

      if (item.item.includes('Cross-Intelligence')) {
        category = 'cross_intelligence';
      } else if (item.item.includes('Intelligence') || item.item.includes('Connect') || item.item.includes('Analytics') || item.item.includes('Performance')) {
        category = 'module';
      } else if (item.item.includes('Watchtower')) {
        category = 'watchtower';
      }
      
      return {
        item: item.item,
        price: item.price,
        perLocation: item.price / locations,
        category,
        note: item.note
      };
    });
    
    // Calculate Tenzo comparison
    const tenzoComparison = calculateTenzoPrice(locations, modules.length || 1);
    
    return {
      total: result.total,
      perLocation: result.perLocation,
      breakdown,
      annualTotal: result.annualTotal,
      annualPerLocation: result.annualTotal / locations,
      aiCredits: result.aiCreditsTotal,
      aiSeats: result.aiSeatsTotal,
      subtotal: result.subtotal,
      discounts: result.discountsApplied,
      savings: {
        tenzo: tenzoComparison
      }
    };
  }, [layer, tier, locations, modules, watchtowerModules, clientProfile, crossIntelligence]);
}

// Helper to check if a configuration includes specific module combinations
export function hasModuleCombo(modules: string[], combo: string[]): boolean {
  return combo.every(module => modules.includes(module));
}

// Get bundle savings if user selects individual watchtower modules
export function getWatchtowerBundleSavings(selectedModules: string[]): number {
  const bundleModules = ['competitive', 'events', 'trends'];
  const hasAllBundleModules = bundleModules.every(module => 
    selectedModules.includes(module)
  );
  
  if (hasAllBundleModules && !selectedModules.includes('bundle')) {
    // Individual base prices: $549 + $249 + $299 = $1,097
    // Bundle base price: $899
    // Base savings: $198
    return 198;
  }
  
  return 0;
}

// Suggest optimal tier based on location count
export function suggestOptimalTier(locations: number, layer: 'report' | 'core'): string {
  if (layer === 'report') {
    if (locations === 1) return 'lite';
    if (locations <= 3) return 'plus';
    return 'pro';
  }
  
  if (layer === 'core') {
    if (locations <= 5) return 'lite';
    const crossover = calculateCoreProCrossoverPoint();
    if (locations >= crossover + 1) return 'pro'; // Pro becomes cheaper at crossover + 1
    return 'lite';
  }
  
  return 'lite';
}

// Calculate crossover point where Core Pro becomes cheaper than Core Lite
export function calculateCoreProCrossoverPoint(): number {
  // Core Lite: $279 + (n-1) * $79
  // Core Pro: $449 + (n-1) * $89
  // Core Pro has both higher base and higher per-location in v5.1,
  // so there is no crossover — Core Pro is always more expensive.
  // Core Pro's value is in features/capabilities, not cost savings at scale.
  // Return a high number so tier suggestion defaults to 'lite' for cost optimization.
  return Number.MAX_SAFE_INTEGER;
}
