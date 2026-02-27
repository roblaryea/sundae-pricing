// ═══════════════════════════════════════════════════════════════════════════
// SUNDAE PRICING ENGINE — All calculation logic (v5.1)
// ═══════════════════════════════════════════════════════════════════════════

import {
  reportTiers, coreTiers, modules, moduleBundles,
  CLIENT_TYPE_RULES, EARLY_ADOPTER_TERMS, enterprisePricing,
  billingDiscounts, DISCOUNT_RULES, setupFeeDiscounts,
  crossIntelligence, completeIntelligenceWithCrossIntel
} from '../data/pricing';
import type { ReportTier, CoreTier, ModuleId, BundleId, ClientType, BillingCycle, CrossIntelligenceTier } from '../data/pricing';
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
  billingCycle?: BillingCycle;
}

export interface Configuration {
  layer: 'report' | 'core';
  tier: string;
  locations: number;
  modules: ModuleId[];
  watchtower: string[];
  clientProfile: ClientProfile;
  crossIntelligence?: CrossIntelligenceTier;
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
    aiSeats: t.aiSeats as number
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════

export function calculateModulePrice(moduleId: ModuleId, locations: number, tier?: 'core_lite' | 'core_pro'): number {
  const m = modules[moduleId];
  const extraLocs = Math.max(0, locations - m.baseIncludesLocations);
  const tierPricing = tier && m.pricingByTier?.[tier];
  const orgPrice = tierPricing?.orgLicensePrice ?? m.orgLicensePrice;
  const perLocPrice = tierPricing?.perLocationPrice ?? m.perLocationPrice;
  return orgPrice + (extraLocs * perLocPrice);
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
// BUNDLE CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════

export function calculateBundlePrice(bundleId: BundleId, locations: number, tier?: 'core_lite' | 'core_pro'): number {
  const b = moduleBundles[bundleId];
  const tierPricing = tier && b.pricingByTier?.[tier];
  const basePrice = tierPricing?.basePrice ?? b.basePrice;
  const perLocPrice = tierPricing?.perLocationPrice ?? b.perLocationPrice;
  const extraLocs = Math.max(0, locations - 3); // bundles include 3 locations
  return basePrice + (extraLocs * perLocPrice);
}

// ═══════════════════════════════════════════════════════════════════════════
// UNLOCK FEES (Report Pro only)
// ═══════════════════════════════════════════════════════════════════════════

export interface UnlockFees {
  intelligence: number;
  pulseAccess: number;
  total: number;
}

export function calculateUnlockFees(
  layer: 'report' | 'core',
  tier: string,
  selections: { intelligence?: boolean; pulse?: boolean }
): UnlockFees {
  let intelligence = 0;
  let pulseAccess = 0;

  if (layer === 'report' && tier === 'pro') {
    // Report Pro has unlock fees for Sundae Intelligence and Pulse
    if (selections.intelligence) {
      const tierData = reportTiers.pro;
      const intel = tierData.intelligenceAccess;
      if (intel && typeof intel === 'object' && 'unlockFee' in intel) {
        intelligence = intel.unlockFee;
      }
    }
    if (selections.pulse) {
      const tierData = reportTiers.pro;
      const pulse = tierData.pulseAccess;
      if (pulse && typeof pulse === 'object' && 'unlockFee' in pulse) {
        pulseAccess = pulse.unlockFee;
      }
    }
  }
  // Core tiers: unlock fees are 0 (included)

  return { intelligence, pulseAccess, total: intelligence + pulseAccess };
}

// ═══════════════════════════════════════════════════════════════════════════
// SETUP FEE CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface SetupFeeResult {
  items: { name: string; fee: number }[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
}

export function calculateSetupFees(
  selectedModules: ModuleId[],
  options: {
    isBundle?: BundleId;
    isEnterprise?: boolean;
    isAnnualPrepay?: boolean;
    pulseIntegrationOverlap?: { laborSameSystem?: boolean; inventorySameSystem?: boolean };
  } = {}
): SetupFeeResult {
  // Enterprise: setup fees waived
  if (options.isEnterprise) {
    return { items: [], subtotal: 0, discountPercent: 100, discountAmount: 0, total: 0 };
  }

  const items: { name: string; fee: number }[] = [];

  if (options.isBundle) {
    // Bundle has a fixed setup fee
    const bundle = moduleBundles[options.isBundle];
    items.push({ name: `${bundle.name} setup`, fee: bundle.setupFee });
  } else {
    // Individual module setup fees
    for (const id of selectedModules) {
      const m = modules[id];
      let fee = m.setupFee;

      // Pulse integration credit rule
      if (id === 'pulse' && options.pulseIntegrationOverlap) {
        const creditRules = (m as any).integrationCreditRules;
        if (creditRules) {
          let credit = 0;
          if (options.pulseIntegrationOverlap.laborSameSystem && selectedModules.includes('labor')) {
            credit += creditRules.laborSameSystem; // $299
          }
          if (options.pulseIntegrationOverlap.inventorySameSystem && selectedModules.includes('inventory')) {
            credit += creditRules.inventorySameSystem; // $499
          }
          credit = Math.min(credit, creditRules.maxCredit); // cap at $399
          fee = Math.max(0, fee - credit);
        }
      }

      items.push({ name: `${m.name} setup`, fee });
    }
  }

  const subtotal = items.reduce((sum, i) => sum + i.fee, 0);

  // Determine discount
  let discountPercent = 0;

  if (options.isBundle === 'complete_intelligence') {
    discountPercent = setupFeeDiscounts.completeIntelligencePercent; // 50%
  } else if (selectedModules.length >= 3 && !options.isBundle) {
    discountPercent = setupFeeDiscounts.threeOrMoreModulesPercent; // 20%
  }

  // Annual prepay discount on setup (non-stacking with module count discount — take best)
  if (options.isAnnualPrepay) {
    discountPercent = Math.max(discountPercent, setupFeeDiscounts.annualPrepayPercent); // 25%
  }

  const discountAmount = Math.round(subtotal * discountPercent / 100);
  const total = subtotal - discountAmount;

  return { items, subtotal, discountPercent, discountAmount, total };
}

// ═══════════════════════════════════════════════════════════════════════════
// PREREQUISITE VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

export interface PrerequisiteError {
  moduleId: string;
  moduleName: string;
  missingPrerequisites: string[];
  message: string;
}

export function validatePrerequisites(
  selectedModules: ModuleId[]
): PrerequisiteError[] {
  const errors: PrerequisiteError[] = [];

  for (const id of selectedModules) {
    const m = modules[id];
    if (m.prerequisites && m.prerequisites.length > 0) {
      const missing = m.prerequisites.filter(
        (prereq: string) => !selectedModules.includes(prereq as ModuleId)
      );
      if (missing.length > 0) {
        errors.push({
          moduleId: id,
          moduleName: m.name,
          missingPrerequisites: missing,
          message: (m as any).prerequisiteMessage || `Requires: ${missing.join(', ')}`
        });
      }
    }
  }

  return errors;
}

// ═══════════════════════════════════════════════════════════════════════════
// CROSS-INTELLIGENCE CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════

export function isCrossIntelligenceEligible(activeModuleCount: number): boolean {
  return activeModuleCount >= crossIntelligence.base.autoEnableThreshold;
}

export function calculateCrossIntelligencePrice(
  tier: CrossIntelligenceTier,
  locations: number
): number {
  if (tier === 'base') return 0;
  const pro = crossIntelligence.pro;
  const additionalLocs = Math.max(0, locations - pro.includedLocations);
  return pro.monthlyFee + (additionalLocs * pro.perLocationPrice);
}

// ═══════════════════════════════════════════════════════════════════════════
// FULL SCENARIO CALCULATION (one-time + monthly)
// ═══════════════════════════════════════════════════════════════════════════

export interface ScenarioInput {
  layer: 'report' | 'core';
  tier: string;
  locations: number;
  modules: ModuleId[];
  bundle?: BundleId;
  watchtower: string[];
  intelligence?: boolean;
  pulse?: boolean;
  aiPackage?: 'ai_plus' | 'ai_pro';
  crossIntelligence?: CrossIntelligenceTier;
  billingCycle?: BillingCycle;
  isEnterprise?: boolean;
  isAnnualPrepay?: boolean;
  pulseIntegrationOverlap?: { laborSameSystem?: boolean; inventorySameSystem?: boolean };
}

export interface ScenarioResult {
  monthly: {
    tierPrice: number;
    modulePrice: number;
    watchtowerPrice: number;
    unlockFees: number;
    aiPackagePrice: number;
    crossIntelligencePrice: number;
    subtotal: number;
    discountAmount: number;
    total: number;
  };
  oneTime: {
    setupFees: number;
  };
  perLocation: number;
  aiCredits: number;
  crossIntelligenceEligible: boolean;
  prerequisiteErrors: PrerequisiteError[];
}

export function calculateScenario(input: ScenarioInput): ScenarioResult {
  // Determine the module tier key for tier-aware pricing
  const moduleTier = input.layer === 'core'
    ? (`core_${input.tier}` as 'core_lite' | 'core_pro')
    : undefined;

  // Tier price
  let tierPrice = 0;
  let aiCredits = 0;
  if (input.layer === 'report') {
    const r = calculateReportPrice(input.tier as ReportTier, input.locations);
    tierPrice = r.price;
    aiCredits = r.aiCredits;
  } else {
    const c = calculateCorePrice(input.tier as CoreTier, input.locations);
    tierPrice = c.price;
    aiCredits = c.aiCredits;
  }

  // Module price
  let modulePrice = 0;
  if (input.bundle) {
    modulePrice = calculateBundlePrice(input.bundle, input.locations, moduleTier);
  } else {
    for (const id of input.modules) {
      modulePrice += calculateModulePrice(id, input.locations, moduleTier);
    }
  }

  // Pulse module price when selected via pulse flag (not already in modules list)
  if (input.pulse && !input.modules.includes('pulse' as ModuleId) && !input.bundle) {
    modulePrice += calculateModulePrice('pulse' as ModuleId, input.locations, moduleTier);
  }

  // Watchtower price
  let watchtowerPrice = 0;
  if (input.watchtower.length > 0) {
    watchtowerPrice = calculateWatchtowerPrice(input.watchtower, input.locations).price;
  }

  // Unlock fees
  const unlocks = calculateUnlockFees(input.layer, input.tier, {
    intelligence: input.intelligence,
    pulse: input.pulse
  });

  // AI package
  let aiPackagePrice = 0;
  if (input.aiPackage === 'ai_plus') aiPackagePrice = 399;
  if (input.aiPackage === 'ai_pro') aiPackagePrice = 599;

  // Cross-Intelligence
  const activeModuleCount = input.bundle
    ? moduleBundles[input.bundle].modules.length
    : input.modules.length + (input.pulse && !input.modules.includes('pulse' as ModuleId) ? 1 : 0);
  const crossIntelEligible = input.layer === 'core' && isCrossIntelligenceEligible(activeModuleCount);
  let crossIntelligencePrice = 0;
  if (crossIntelEligible && input.crossIntelligence === 'pro') {
    // Check for Complete Intelligence + Cross-Intel bundle discount
    if (input.bundle === 'complete_intelligence') {
      const tierKey = moduleTier === 'core_lite' ? 'core_lite' : 'core_pro';
      const bundlePricing = completeIntelligenceWithCrossIntel.pricingByTier[tierKey];
      const regularBundlePrice = calculateBundlePrice(input.bundle, input.locations, moduleTier);
      const regularCrossIntelPrice = calculateCrossIntelligencePrice('pro', input.locations);
      // Bundle discount: use pre-calculated bundle price minus what we'd charge separately
      crossIntelligencePrice = (bundlePricing.basePrice + Math.max(0, input.locations - 3) * bundlePricing.perLocationPrice) - regularBundlePrice;
      crossIntelligencePrice = Math.max(0, crossIntelligencePrice);
      // If the combined bundle is cheaper, use the savings
      if (crossIntelligencePrice > regularCrossIntelPrice) {
        crossIntelligencePrice = regularCrossIntelPrice;
      }
    } else {
      crossIntelligencePrice = calculateCrossIntelligencePrice('pro', input.locations);
    }
  }

  const subtotal = tierPrice + modulePrice + watchtowerPrice + unlocks.total + aiPackagePrice + crossIntelligencePrice;

  // Apply discounts
  const volumePct = input.locations >= 100 ? 7 : input.locations >= 30 ? 5 : 0;
  const billingPct = input.billingCycle ? billingDiscounts[input.billingCycle] : 0;
  const bestDiscount = Math.min(Math.max(volumePct, billingPct), DISCOUNT_RULES.maxDiscountPercent);
  const discountAmount = Math.round(subtotal * bestDiscount / 100);
  const monthlyTotal = subtotal - discountAmount;

  // Setup fees
  const modulesForSetup = input.bundle
    ? moduleBundles[input.bundle].modules as ModuleId[]
    : input.modules;
  const pulseInSelection = modulesForSetup.includes('pulse') || input.pulse;
  const allModulesForSetup = pulseInSelection && !modulesForSetup.includes('pulse')
    ? [...modulesForSetup, 'pulse' as ModuleId]
    : modulesForSetup;

  const setup = calculateSetupFees(
    input.bundle ? [] : allModulesForSetup,
    {
      isBundle: input.bundle,
      isEnterprise: input.isEnterprise,
      isAnnualPrepay: input.isAnnualPrepay,
      pulseIntegrationOverlap: input.pulseIntegrationOverlap
    }
  );

  // Prerequisites
  const prerequisiteErrors = validatePrerequisites(
    input.bundle ? moduleBundles[input.bundle].modules as ModuleId[] : input.modules
  );

  return {
    monthly: {
      tierPrice,
      modulePrice,
      watchtowerPrice,
      unlockFees: unlocks.total,
      aiPackagePrice,
      crossIntelligencePrice,
      subtotal,
      discountAmount,
      total: monthlyTotal
    },
    oneTime: {
      setupFees: setup.total
    },
    perLocation: input.locations > 0 ? Math.round(monthlyTotal / input.locations) : 0,
    aiCredits,
    crossIntelligenceEligible: crossIntelEligible,
    prerequisiteErrors
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DISCOUNT APPLICATION
// v5.1: Volume OR Billing — choose one, not both. Max 15%.
// Volume: 30-99 locs = 5%, 100-200 = 7%, 201+ = Enterprise custom.
// ═══════════════════════════════════════════════════════════════════════════

export function applyDiscounts(
  subtotal: number,
  profile: ClientProfile
): { total: number; discounts: DiscountLine[] } {
  let running = subtotal;
  const discounts: DiscountLine[] = [];

  // v5.1 non-stacking discount model: choose the best between volume and billing
  const billingPct = profile.billingCycle ? billingDiscounts[profile.billingCycle] : 0;

  // Client type discount (maps to volume discount tiers in v5.1)
  const rules = CLIENT_TYPE_RULES[profile.type];
  const clientTypePct = rules?.discountTier ?? 0;

  // Per v5.1: volume OR billing, whichever is larger, capped at 15%
  const bestStandardDiscount = Math.min(
    Math.max(clientTypePct, billingPct),
    DISCOUNT_RULES.maxDiscountPercent
  );

  if (bestStandardDiscount > 0 && rules.pricingModel !== 'enterprise') {
    const amt = running * (bestStandardDiscount / 100);
    running -= amt;
    const label = clientTypePct >= billingPct
      ? `Volume discount (${clientTypePct}%)`
      : `Billing discount (${billingPct}%)`;
    discounts.push({
      name: label,
      amount: -amt,
      percent: bestStandardDiscount
    });
  }

  // Early adopter (legacy — kept for backward compat, does NOT stack with v4.3 discounts)
  if (profile.isEarlyAdopter) {
    const amt = running * (EARLY_ADOPTER_TERMS.discountPercent / 100);
    running -= amt;
    discounts.push({
      name: 'Early Adopter discount',
      amount: -amt,
      percent: EARLY_ADOPTER_TERMS.discountPercent
    });
  }

  // Custom negotiated (stacks on remainder)
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

  // Determine the module tier key for tier-aware pricing
  const moduleTier = config.layer === 'core'
    ? (`core_${config.tier}` as 'core_lite' | 'core_pro')
    : undefined;

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

  // Modules (only for Core tier)
  if (config.layer === 'core') {
    const baseIncl = 3;
    config.modules.forEach(id => {
      const price = calculateModulePrice(id, config.locations, moduleTier);
      const tierPricing = moduleTier && modules[id].pricingByTier?.[moduleTier];
      const perLocPrice = tierPricing?.perLocationPrice ?? modules[id].perLocationPrice;
      breakdown.push({
        item: modules[id].name,
        price,
        note: config.locations > baseIncl ? `Base + ${config.locations - baseIncl} extra @ $${perLocPrice}` : `Base (incl ${baseIncl} loc)`
      });
    });
  }

  // Watchtower (only for Core tier)
  if (config.layer === 'core' && config.watchtower.length > 0) {
    const wt = calculateWatchtowerPrice(config.watchtower, config.locations);
    breakdown.push({
      item: wt.isBundle ? 'Watchtower Bundle' : 'Watchtower',
      price: wt.price,
      note: wt.isBundle && wt.savings > 0 ? `Saves $${Math.round(wt.savings)}/mo (~18%)` : undefined
    });
  }

  // Cross-Intelligence (only for Core tier with 3+ modules)
  if (config.layer === 'core' && config.crossIntelligence) {
    const eligible = isCrossIntelligenceEligible(config.modules.length);
    if (eligible && config.crossIntelligence === 'pro') {
      const ciPrice = calculateCrossIntelligencePrice('pro', config.locations);
      breakdown.push({
        item: 'Cross-Intelligence Pro',
        price: ciPrice,
        note: `$199/mo + $19/loc from #2 (${config.locations} loc)`
      });
    } else if (eligible) {
      breakdown.push({
        item: 'Cross-Intelligence',
        price: 0,
        note: 'Included with 3+ modules'
      });
    }
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
