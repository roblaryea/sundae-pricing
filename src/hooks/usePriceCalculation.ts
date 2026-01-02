// Price calculation hook for Sundae pricing configurator
// Uses the centralized pricing engine for all calculations

import { useMemo } from 'react';
import { calculateFullPrice, calculateTenzoPrice } from '../lib/pricingEngine';
import type { PriceResult, ClientProfile } from '../lib/pricingEngine';
import type { ModuleId } from '../data/pricing';
import type { Configuration as EngineConfig } from '../lib/pricingEngine';
import type { PriceBreakdown, PriceCalculation } from '../types/configuration';

// Re-export for backward compatibility
export type { PriceBreakdown, PriceCalculation };

// Convert old configuration format to new engine format
function convertToEngineConfig(
  layer: 'report' | 'core' | null,
  tier: string,
  locations: number,
  modules: string[],
  watchtowerModules: string[],
  clientProfile?: ClientProfile
): EngineConfig {
  return {
    layer: layer || 'report',
    tier,
    locations: Math.max(1, locations),
    modules: modules as ModuleId[],
    watchtower: watchtowerModules,
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
  clientProfile?: ClientProfile
): PriceCalculation {
  return useMemo(() => {
    // Use centralized pricing engine
    const config = convertToEngineConfig(layer, tier, locations, modules, watchtowerModules, clientProfile);
    const result: PriceResult = calculateFullPrice(config);
    
    // Convert breakdown to old format
    const breakdown: PriceBreakdown[] = result.breakdown.map(item => {
      let category: 'base' | 'module' | 'watchtower' = 'base';
      
      if (item.item.includes('Intelligence') || item.item.includes('Connect') || item.item.includes('Analytics') || item.item.includes('Performance')) {
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
  }, [layer, tier, locations, modules, watchtowerModules, clientProfile]);
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
    // Individual prices: $199 + $99 + $149 = $447
    // Bundle price: $349
    // Savings: $98
    return 98;
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
  // Core Lite: $169 + (n-1) * $54
  // Core Pro: $319 + (n-1) * $49
  // Solve: 169 + (n-1)*54 = 319 + (n-1)*49
  // 169 + 54n - 54 = 319 + 49n - 49
  // 115 + 54n = 270 + 49n
  // 5n = 155
  // n = 31 (break-even), cheaper at 32+
  return 31;
}
