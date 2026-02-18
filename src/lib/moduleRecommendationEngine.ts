/**
 * MODULE RECOMMENDATION ENGINE
 * 
 * Deterministic answer → module preselection mapping
 * Single source of truth for onboarding quiz → module recommendations
 */

import type { ModuleId } from '../data/pricing';

// Pain point to module mapping
export const PAIN_TO_MODULES: Record<string, {
  primary: ModuleId[];
  secondary: ModuleId[];
  rationale: string;
}> = {
  labor_costs: {
    primary: ['labor'],
    secondary: [],
    rationale: 'Labor Intelligence helps you optimize staffing and reduce labor costs by 1-3%'
  },
  food_waste: {
    primary: ['inventory'],
    secondary: ['purchasing'],
    rationale: 'Inventory Connect tracks food costs and reduces waste by 0.5-2%'
  },
  supplier_prices: {
    primary: ['purchasing'],
    secondary: ['inventory'],
    rationale: 'Purchasing Analytics finds savings of 2-5% through better supplier management'
  },
  revenue_leakage: {
    primary: ['revenue'],
    secondary: ['profit'],
    rationale: 'Revenue Assurance catches 1-2% leakage from voids, comps, and discounts'
  },
  delivery_profitability: {
    primary: ['delivery'],
    secondary: ['profit'],
    rationale: 'Delivery Economics shows true profitability by platform and channel'
  },
  table_utilization: {
    primary: ['reservations'],
    secondary: [],
    rationale: 'Reservations Intelligence improves table utilization by 5-10%'
  },
  marketing_roi: {
    primary: ['marketing'],
    secondary: [],
    rationale: 'Marketing Performance improves marketing efficiency by 10-20%'
  },
  guest_complaints: {
    primary: ['guest'],
    secondary: [],
    rationale: 'Guest Experience reveals why customers leave and ratings drop'
  },
  profit_visibility: {
    primary: ['profit'],
    secondary: ['revenue'],
    rationale: 'Profit Intelligence shows true unit economics for each location'
  },
  competition: {
    primary: ['marketing', 'guest'],
    secondary: [],
    rationale: 'Marketing + Guest Experience help you stay ahead of competition'
  }
};

// Appetite modifiers
export const APPETITE_MODIFIERS: Record<string, {
  maxModules: number;
  label: string;
}> = {
  exploring: {
    maxModules: 2,
    label: 'Just exploring'
  },
  ready: {
    maxModules: 3,
    label: 'Ready to improve'
  },
  urgent: {
    maxModules: 4,
    label: 'Need results fast'
  }
};

// Location tier influence
export const LOCATION_TIERS: Record<string, {
  locationCount: number;
  profitBoost: boolean;
  description: string;
}> = {
  solo: { locationCount: 1, profitBoost: false, description: '1 location' },
  small: { locationCount: 3, profitBoost: false, description: '2-5 locations' },
  growing: { locationCount: 8, profitBoost: true, description: '6-10 locations' },
  enterprise: { locationCount: 25, profitBoost: true, description: '10+ locations' }
};

export interface ModuleRecommendation {
  moduleId: ModuleId;
  priority: number; // 1 = highest
  rationale: string;
  fromPain: string; // which pain point triggered this
}

export interface RecommendationResult {
  recommended: ModuleRecommendation[];
  capped: boolean; // whether we hit the cap
  maxAllowed: number;
  totalMatched: number;
  editNote: string;
}

/**
 * Calculate recommended modules based on quiz answers
 */
export function calculateModuleRecommendations(
  selectedPains: string[], // Array of pain point IDs (up to 3)
  locationTier: string,    // 'solo' | 'small' | 'growing' | 'enterprise'
  appetite: string         // 'exploring' | 'ready' | 'urgent'
): RecommendationResult {
  const moduleScores: Record<ModuleId, { score: number; rationales: string[]; fromPains: string[] }> = {
    labor: { score: 0, rationales: [], fromPains: [] },
    inventory: { score: 0, rationales: [], fromPains: [] },
    purchasing: { score: 0, rationales: [], fromPains: [] },
    marketing: { score: 0, rationales: [], fromPains: [] },
    reservations: { score: 0, rationales: [], fromPains: [] },
    profit: { score: 0, rationales: [], fromPains: [] },
    revenue: { score: 0, rationales: [], fromPains: [] },
    delivery: { score: 0, rationales: [], fromPains: [] },
    guest: { score: 0, rationales: [], fromPains: [] },
    pulse: { score: 0, rationales: [], fromPains: [] }
  };

  // Score modules based on selected pain points
  selectedPains.forEach((painId, index) => {
    const mapping = PAIN_TO_MODULES[painId];
    if (!mapping) return;

    // Primary modules get higher score (decreasing by selection order)
    const primaryScore = 10 - index * 2; // 10, 8, 6 for 1st, 2nd, 3rd pain
    mapping.primary.forEach(moduleId => {
      moduleScores[moduleId].score += primaryScore;
      moduleScores[moduleId].rationales.push(mapping.rationale);
      moduleScores[moduleId].fromPains.push(painId);
    });

    // Secondary modules get lower score
    const secondaryScore = 3 - index;
    mapping.secondary.forEach(moduleId => {
      moduleScores[moduleId].score += secondaryScore;
      moduleScores[moduleId].fromPains.push(painId);
    });
  });

  // Location tier boost for Profit Intelligence
  const tierInfo = LOCATION_TIERS[locationTier] || LOCATION_TIERS.small;
  if (tierInfo.profitBoost && moduleScores.profit.score > 0) {
    moduleScores.profit.score += 2;
    moduleScores.profit.rationales.push('Larger portfolios benefit more from unit economics visibility');
  }

  // Get max modules from appetite
  const appetiteInfo = APPETITE_MODIFIERS[appetite] || APPETITE_MODIFIERS.ready;
  const maxModules = appetiteInfo.maxModules;

  // Sort by score and take top N
  const sortedModules = Object.entries(moduleScores)
    .filter(([, data]) => data.score > 0)
    .sort((a, b) => b[1].score - a[1].score)
    .map(([moduleId, data], index) => ({
      moduleId: moduleId as ModuleId,
      priority: index + 1,
      rationale: data.rationales[0] || `Recommended based on your priorities`,
      fromPain: data.fromPains[0] || 'general'
    }));

  const totalMatched = sortedModules.length;
  const capped = totalMatched > maxModules;
  const recommended = sortedModules.slice(0, maxModules);

  return {
    recommended,
    capped,
    maxAllowed: maxModules,
    totalMatched,
    editNote: 'You can edit your module selections anytime in the configurator'
  };
}

/**
 * Get module IDs array for use in configuration
 */
export function getRecommendedModuleIds(result: RecommendationResult): string[] {
  return result.recommended.map(r => r.moduleId);
}

/**
 * Get human-readable summary of recommendations
 */
export function getRecommendationSummary(result: RecommendationResult): string {
  const count = result.recommended.length;
  if (count === 0) return 'No specific modules recommended yet';
  if (count === 1) return `1 module recommended: ${result.recommended[0].moduleId}`;
  return `${count} modules recommended based on your priorities`;
}
