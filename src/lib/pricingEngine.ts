// ═══════════════════════════════════════════════════════════════════════════
// SUNDAE PRICING ENGINE — All calculation logic
// ═══════════════════════════════════════════════════════════════════════════

import {
  reportTiers, coreTiers, modules,
  CLIENT_TYPE_RULES, EARLY_ADOPTER_TERMS, enterprisePricing
} from '../data/pricing';
import type { ReportTier, CoreTier, ModuleId, ClientType } from '../data/pricing';
import { calculateWatchtowerPrice as calcWatchtowerPrice, type WatchtowerModuleId } from './watchtowerEngine';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ClientProfile {
  type: ClientType;
  isEarlyAdopter: boolean;
  isFranchise: boolean;
  brandCount: number;
  customDiscountPercent?: number;
}

export interface Configuration {
  layer: 'report' | 'core';
  tier: string;
  locations: number;
  modules: ModuleId[];
  watchtower: string[];
  clientProfile: ClientProfile;
}

export interface PriceBreakdown {
  item: string;
  price: number;
  note?: string;
}

export interface DiscountLine {
  name: string;
  amount: number;
  percent: number;
}

export interface PriceResult {
  subtotal: number;
  discountsApplied: DiscountLine[];
  total: number;
  perLocation: number;
  annualTotal: number;
  aiCreditsTotal: number;
  aiSeatsTotal: number;
  breakdown: PriceBreakdown[];
}

// ═══════════════════════════════════════════════════════════════════════════
// TIER CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════

export function calculateReportPrice(tier: ReportTier, locations: number) {
  const t = reportTiers[tier];
  const additionalLocs = Math.max(0, locations - 1);
  return {
    price: t.basePrice + (additionalLocs * t.additionalLocationPrice),
    aiCredits: t.aiCredits.base + (additionalLocs * t.aiCredits.perLocation),
    aiSeats: t.aiSeats
  };
}

export function calculateCorePrice(tier: CoreTier, locations: number) {
  const t = coreTiers[tier];
  const additionalLocs = Math.max(0, locations - 1);
  return {
    price: t.basePrice + (additionalLocs * t.additionalLocationPrice),
    aiCredits: t.aiCredits.base + (additionalLocs * t.aiCredits.perLocation),
    aiSeats: t.aiSeats
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════

export function calculateModulePrice(moduleId: ModuleId, locations: number): number {
  const m = modules[moduleId];
  const extraLocs = Math.max(0, locations - m.includedLocations);
  return m.orgLicensePrice + (extraLocs * m.perLocationPrice);
}

// ═══════════════════════════════════════════════════════════════════════════
// WATCHTOWER CALCULATIONS (Uses new base + per-location model)
// ═══════════════════════════════════════════════════════════════════════════

export function calculateWatchtowerPrice(
  selected: string[], 
  locations: number
): { price: number; savings: number; isBundle: boolean } {
  if (selected.length === 0) {
    return { price: 0, savings: 0, isBundle: false };
  }
  
  const result = calcWatchtowerPrice(selected as WatchtowerModuleId[], locations);
  return { 
    price: result.total, 
    savings: result.bundleSavings,
    isBundle: result.isBundle 
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DISCOUNT APPLICATION
// Order: 1) Client type  2) Early adopter  3) Custom negotiated
// ═══════════════════════════════════════════════════════════════════════════

export function applyDiscounts(
  subtotal: number,
  profile: ClientProfile
): { total: number; discounts: DiscountLine[] } {
  let running = subtotal;
  const discounts: DiscountLine[] = [];
  
  // 1. Client type discount (NOT for enterprise — they use volume pricing)
  const rules = CLIENT_TYPE_RULES[profile.type];
  if (rules?.discountTier > 0 && rules.pricingModel !== 'enterprise') {
    const amt = running * (rules.discountTier / 100);
    running -= amt;
    discounts.push({ 
      name: `${profile.type.charAt(0).toUpperCase() + profile.type.slice(1)} discount`, 
      amount: -amt, 
      percent: rules.discountTier 
    });
  }
  
  // 2. Early adopter (stacks on remainder)
  if (profile.isEarlyAdopter) {
    const amt = running * (EARLY_ADOPTER_TERMS.discountPercent / 100);
    running -= amt;
    discounts.push({ 
      name: 'Early Adopter discount', 
      amount: -amt, 
      percent: EARLY_ADOPTER_TERMS.discountPercent 
    });
  }
  
  // 3. Custom negotiated (stacks on remainder)
  if (profile.customDiscountPercent && profile.customDiscountPercent > 0) {
    const amt = running * (profile.customDiscountPercent / 100);
    running -= amt;
    discounts.push({ 
      name: 'Negotiated discount', 
      amount: -amt, 
      percent: profile.customDiscountPercent 
    });
  }
  
  return { total: Math.round(running * 100) / 100, discounts };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CALCULATION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

export function calculateFullPrice(config: Configuration): PriceResult {
  const breakdown: PriceBreakdown[] = [];
  let aiCredits = 0, aiSeats = 0;
  
  // Base tier
  if (config.layer === 'report') {
    const r = calculateReportPrice(config.tier as ReportTier, config.locations);
    breakdown.push({ 
      item: `${reportTiers[config.tier as ReportTier].name} (${config.locations} loc)`, 
      price: r.price 
    });
    aiCredits += r.aiCredits;
    aiSeats += r.aiSeats;
  } else {
    const c = calculateCorePrice(config.tier as CoreTier, config.locations);
    breakdown.push({ 
      item: `${coreTiers[config.tier as CoreTier].name} (${config.locations} loc)`, 
      price: c.price,
      note: 'Includes full sales analytics'
    });
    aiCredits += c.aiCredits;
    aiSeats += c.aiSeats;
  }
  
  // Modules
  config.modules.forEach(id => {
    const price = calculateModulePrice(id, config.locations);
    breakdown.push({
      item: modules[id].name,
      price,
      note: config.locations > 5 ? `Org + ${config.locations - 5} extra @ $${modules[id].perLocationPrice}` : 'Org license (≤5 loc)'
    });
  });
  
  // Watchtower
  if (config.watchtower.length > 0) {
    const wt = calculateWatchtowerPrice(config.watchtower, config.locations);
    breakdown.push({
      item: wt.isBundle ? 'Watchtower Bundle' : 'Watchtower',
      price: wt.price,
      note: wt.isBundle && wt.savings > 0 ? `Saves $${Math.round(wt.savings)}/mo (15%)` : undefined
    });
  }
  
  const subtotal = breakdown.reduce((sum, b) => sum + b.price, 0);
  const { total, discounts } = applyDiscounts(subtotal, config.clientProfile);
  
  // Early adopter bonus credits
  if (config.clientProfile.isEarlyAdopter) {
    aiCredits += EARLY_ADOPTER_TERMS.bonusCredits;
  }
  
  return {
    subtotal,
    discountsApplied: discounts,
    total,
    perLocation: Math.round((total / config.locations) * 100) / 100,
    annualTotal: Math.round(total * 12 * 100) / 100,
    aiCreditsTotal: aiCredits,
    aiSeatsTotal: aiSeats,
    breakdown
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ENTERPRISE CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════

export function calculateEnterpriseVolume(locations: number): number | 'Custom' {
  const tier = enterprisePricing.volumeDiscount.tiers.find(
    t => locations >= t.min && (t.max === null || locations <= t.max)
  );
  return tier && typeof tier.monthly === 'number' ? tier.monthly : 'Custom';
}

export function calculateEnterpriseOrg(locations: number): number {
  const { baseFee, perLocationTiers } = enterprisePricing.orgLicense;
  let total = baseFee;
  let remaining = locations;
  
  for (const tier of perLocationTiers) {
    if (remaining <= 0) break;
    const tierEnd = tier.max ?? Infinity;
    const tierSize = tierEnd - tier.min + 1;
    const locsInTier = Math.min(remaining, tierSize);
    total += locsInTier * tier.price;
    remaining -= locsInTier;
  }
  
  return total;
}

export function recommendEnterpriseModel(locations: number, brandCount: number): 'volume' | 'org' {
  if (brandCount > 1) return 'org';
  const vol = calculateEnterpriseVolume(locations);
  const org = calculateEnterpriseOrg(locations);
  if (vol === 'Custom') return 'org';
  return org < vol ? 'org' : 'volume';
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPETITOR COMPARISON
// ═══════════════════════════════════════════════════════════════════════════

export function calculateTenzoPrice(locations: number, moduleCount: number) {
  const monthly = locations * moduleCount * 75;
  const setup = locations * moduleCount * 350;
  return { monthly, setup, firstYear: (monthly * 12) + setup };
}
