// ═══════════════════════════════════════════════════════════════════════════
// WATCHTOWER PRICING ENGINE
// ═══════════════════════════════════════════════════════════════════════════
// Calculates Watchtower pricing with base + per-location model

import { watchtower, watchtowerEnterprise } from '../data/pricing';

export type WatchtowerModuleId = 'competitive' | 'events' | 'trends' | 'bundle';

export interface WatchtowerPriceResult {
  modules: {
    id: WatchtowerModuleId;
    name: string;
    basePrice: number;
    locationPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  isBundle: boolean;
  bundleSavings: number;
  total: number;
  perLocation: number;
  isEnterprise: boolean;
  enterpriseTier?: string;
}

/**
 * Calculate Watchtower pricing based on selected modules and location count
 */
export function calculateWatchtowerPrice(
  selectedModules: WatchtowerModuleId[],
  locations: number
): WatchtowerPriceResult {
  
  // Check for enterprise pricing (30+ locations)
  if (locations >= 30) {
    return calculateEnterpriseWatchtower(selectedModules, locations);
  }
  
  const additionalLocations = Math.max(0, locations - 1);
  
  // Check if bundle is selected or all individual modules are selected
  const hasBundle = selectedModules.includes('bundle');
  const hasAllIndividual = ['competitive', 'events', 'trends'].every(
    m => selectedModules.includes(m as WatchtowerModuleId)
  );
  const useBundle = hasBundle || hasAllIndividual;
  
  if (useBundle) {
    // Bundle pricing
    const bundleData = watchtower.bundle;
    const basePrice = bundleData.basePrice;
    const locationPrice = additionalLocations * bundleData.perLocationPrice;
    const total = basePrice + locationPrice;
    
    // Calculate what individual would have cost
    const individualBase = watchtower.competitive.basePrice + 
                          watchtower.events.basePrice + 
                          watchtower.trends.basePrice;
    const individualPerLoc = (watchtower.competitive.perLocationPrice + 
                             watchtower.events.perLocationPrice + 
                             watchtower.trends.perLocationPrice) * additionalLocations;
    const individualTotal = individualBase + individualPerLoc;
    
    return {
      modules: [{
        id: 'bundle',
        name: bundleData.name,
        basePrice: bundleData.basePrice,
        locationPrice: locationPrice,
        totalPrice: total
      }],
      subtotal: individualTotal,
      isBundle: true,
      bundleSavings: individualTotal - total,
      total,
      perLocation: locations > 0 ? Math.round(total / locations) : 0,
      isEnterprise: false
    };
  }
  
  // Individual module pricing
  const modules = selectedModules
    .filter(id => id !== 'bundle' && watchtower[id])
    .map(id => {
      const moduleData = watchtower[id];
      const basePrice = moduleData.basePrice;
      const locationPrice = additionalLocations * moduleData.perLocationPrice;
      return {
        id: id as WatchtowerModuleId,
        name: moduleData.name,
        basePrice,
        locationPrice,
        totalPrice: basePrice + locationPrice
      };
    });
  
  const total = modules.reduce((sum, m) => sum + m.totalPrice, 0);
  
  // Check if buying all individual would be cheaper as bundle
  const allIndividualIds: WatchtowerModuleId[] = ['competitive', 'events', 'trends'];
  const hasAllThree = allIndividualIds.every(id => selectedModules.includes(id));
  
  let bundleSavings = 0;
  if (hasAllThree) {
    const bundleTotal = watchtower.bundle.basePrice + 
                       (additionalLocations * watchtower.bundle.perLocationPrice);
    bundleSavings = total - bundleTotal;
  }
  
  return {
    modules,
    subtotal: total,
    isBundle: false,
    bundleSavings,
    total,
    perLocation: locations > 0 ? Math.round(total / locations) : 0,
    isEnterprise: false
  };
}

/**
 * Enterprise Watchtower pricing (30+ locations)
 */
function calculateEnterpriseWatchtower(
  selectedModules: WatchtowerModuleId[],
  locations: number
): WatchtowerPriceResult {
  
  // Find applicable enterprise tier
  const tier = watchtowerEnterprise.tiers.find(t => 
    locations >= t.locationRange[0] && 
    (t.locationRange[1] === null || locations <= t.locationRange[1])
  );
  
  if (!tier || tier.bundlePrice === null) {
    // Custom pricing needed
    return {
      modules: [],
      subtotal: 0,
      isBundle: false,
      bundleSavings: 0,
      total: 0,
      perLocation: 0,
      isEnterprise: true,
      enterpriseTier: 'Custom - Contact Sales'
    };
  }
  
  const hasBundle = selectedModules.includes('bundle');
  const hasAllIndividual = ['competitive', 'events', 'trends'].every(
    m => selectedModules.includes(m as WatchtowerModuleId)
  );
  
  if (hasBundle || hasAllIndividual) {
    return {
      modules: [{
        id: 'bundle',
        name: 'Enterprise Watchtower Bundle',
        basePrice: tier.bundlePrice,
        locationPrice: 0,
        totalPrice: tier.bundlePrice
      }],
      subtotal: tier.bundlePrice,
      isBundle: true,
      bundleSavings: 0,  // Enterprise is already discounted
      total: tier.bundlePrice,
      perLocation: Math.round(tier.bundlePrice / locations),
      isEnterprise: true,
      enterpriseTier: tier.name
    };
  }
  
  // Individual enterprise module pricing
  const modules = selectedModules
    .filter((id): id is 'competitive' | 'events' | 'trends' => 
      id !== 'bundle' && tier.perModulePricing?.[id as 'competitive' | 'events' | 'trends'] !== undefined
    )
    .map(id => ({
      id: id as WatchtowerModuleId,
      name: watchtower[id].name,
      basePrice: tier.perModulePricing![id],
      locationPrice: 0,
      totalPrice: tier.perModulePricing![id]
    }));
  
  const total = modules.reduce((sum, m) => sum + m.totalPrice, 0);
  
  return {
    modules,
    subtotal: total,
    isBundle: false,
    bundleSavings: (tier.bundlePrice || 0) - total,  // Savings if they bundled
    total,
    perLocation: Math.round(total / locations),
    isEnterprise: true,
    enterpriseTier: tier.name
  };
}

/**
 * Get Watchtower pricing examples for UI display
 */
export function getWatchtowerPricingExamples(): {
  locations: number;
  competitive: number;
  events: number;
  trends: number;
  bundle: number;
  perLocation: number;
}[] {
  return [1, 3, 5, 10, 20, 30].map(locations => {
    const addl = Math.max(0, locations - 1);
    
    // Enterprise flat pricing for 30+
    if (locations >= 30) {
      const tier = watchtowerEnterprise.tiers[0];  // 30-50 tier
      return {
        locations,
        competitive: tier.perModulePricing!.competitive,
        events: tier.perModulePricing!.events,
        trends: tier.perModulePricing!.trends,
        bundle: tier.bundlePrice || 0,
        perLocation: tier.bundlePrice ? Math.round(tier.bundlePrice / locations) : 0
      };
    }
    
    return {
      locations,
      competitive: watchtower.competitive.basePrice + (addl * watchtower.competitive.perLocationPrice),
      events: watchtower.events.basePrice + (addl * watchtower.events.perLocationPrice),
      trends: watchtower.trends.basePrice + (addl * watchtower.trends.perLocationPrice),
      bundle: watchtower.bundle.basePrice + (addl * watchtower.bundle.perLocationPrice),
      perLocation: Math.round((watchtower.bundle.basePrice + (addl * watchtower.bundle.perLocationPrice)) / locations)
    };
  });
}
