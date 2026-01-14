// Tier availability rules - defines which features are available for each tier

export interface TierFeatures {
  modules: boolean;
  watchtower: boolean;
  skipToStep?: number; // If set, skip to this step after locations
}

// Define which features are available for each layer+tier combination
export const TIER_AVAILABILITY: Record<string, TierFeatures> = {
  // Report tiers - no modules or watchtower
  'report-lite': {
    modules: false,
    watchtower: false,
    skipToStep: 6 // Skip to ROI Calculator (step 6)
  },
  'report-plus': {
    modules: false,
    watchtower: false,
    skipToStep: 6
  },
  'report-pro': {
    modules: false,
    watchtower: false,
    skipToStep: 6
  },
  'report-enterprise': {
    modules: false,
    watchtower: false,
    skipToStep: 6
  },
  
  // Core tiers - full features
  'core-lite': {
    modules: true,
    watchtower: true
  },
  'core-pro': {
    modules: true,
    watchtower: true
  },
  'core-enterprise': {
    modules: true,
    watchtower: true
  }
};

/**
 * Get feature availability for a specific layer+tier combination
 */
export function getTierFeatures(layer: string | null, tier: string): TierFeatures {
  const key = `${layer}-${tier}`;
  return TIER_AVAILABILITY[key] || {
    modules: true,
    watchtower: true
  };
}

/**
 * Check if modules are available for the current tier
 */
export function canAccessModules(layer: string | null, tier: string): boolean {
  return getTierFeatures(layer, tier).modules;
}

/**
 * Check if watchtower is available for the current tier
 */
export function canAccessWatchtower(layer: string | null, tier: string): boolean {
  return getTierFeatures(layer, tier).watchtower;
}

/**
 * Get the step to skip to after locations (if any)
 */
export function getSkipToStep(layer: string | null, tier: string): number | undefined {
  return getTierFeatures(layer, tier).skipToStep;
}

/**
 * Check if a specific step should be shown for the current tier
 */
export function shouldShowStep(step: number, layer: string | null, tier: string): boolean {
  const features = getTierFeatures(layer, tier);
  
  // Step 4 = Modules, Step 5 = Watchtower
  if (step === 4) return features.modules;
  if (step === 5) return features.watchtower;
  
  // All other steps are always shown
  return true;
}
