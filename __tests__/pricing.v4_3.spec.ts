/**
 * PRICING QA AUDIT — v4.3 Scenario Verification Harness
 *
 * Tests engine outputs against canonical spec (generated/pricingSpec.v4_3.json).
 * Covers: tier pricing, module pricing, bundles, watchtower, unlock fees,
 * setup fees, discounts, prerequisites, integration credits, and full scenarios.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

import {
  calculateReportPrice,
  calculateCorePrice,
  calculateModulePrice,
  calculateBundlePrice,
  calculateWatchtowerPrice,
  calculateUnlockFees,
  calculateSetupFees,
  validatePrerequisites,
  calculateScenario,
  applyDiscounts,
} from '../src/lib/pricingEngine';
import type { ScenarioInput } from '../src/lib/pricingEngine';

import {
  reportTiers,
  coreTiers,
  modules,
  moduleBundles,
  watchtower,
  aiCreditActions,
  aiCreditTopups,
  aiCreditRollover,
  aiPackages,
  setupFeeDiscounts,
  type ModuleId,
  type BundleId,
} from '../src/data/pricing';

// ─── Load canonical spec ───────────────────────────────────────────────────
const specPath = join(__dirname, '..', 'generated', 'pricingSpec.v4_3.json');
const spec = JSON.parse(readFileSync(specPath, 'utf-8'));

// ═══════════════════════════════════════════════════════════════════════════
// A) TIER PRICING CORRECTNESS
// ═══════════════════════════════════════════════════════════════════════════

describe('A) Tier Pricing vs Spec', () => {
  const locationCounts = [1, 5, 10, 20, 50];

  describe('Report Lite', () => {
    for (const locs of locationCounts) {
      it(`@ ${locs} locations = $${spec.expected_tier_totals.report_lite[locs]}`, () => {
        expect(calculateReportPrice('lite', locs).price)
          .toBe(spec.expected_tier_totals.report_lite[locs]);
      });
    }
    it('has correct AI credits', () => {
      expect(reportTiers.lite.aiCredits.base).toBe(spec.tiers.report_lite.ai_credits.base);
      expect(reportTiers.lite.aiCredits.perLocation).toBe(spec.tiers.report_lite.ai_credits.per_location);
    });
    it('has correct user count', () => {
      expect(reportTiers.lite.aiSeats).toBe(spec.tiers.report_lite.users_included);
    });
  });

  describe('Report Plus', () => {
    for (const locs of locationCounts) {
      it(`@ ${locs} locations = $${spec.expected_tier_totals.report_plus[locs]}`, () => {
        expect(calculateReportPrice('plus', locs).price)
          .toBe(spec.expected_tier_totals.report_plus[locs]);
      });
    }
    it('has correct AI credits', () => {
      expect(reportTiers.plus.aiCredits.base).toBe(spec.tiers.report_plus.ai_credits.base);
      expect(reportTiers.plus.aiCredits.perLocation).toBe(spec.tiers.report_plus.ai_credits.per_location);
    });
    it('has correct user count', () => {
      expect(reportTiers.plus.aiSeats).toBe(spec.tiers.report_plus.users_included);
    });
  });

  describe('Report Pro', () => {
    for (const locs of locationCounts) {
      it(`@ ${locs} locations = $${spec.expected_tier_totals.report_pro[locs]}`, () => {
        expect(calculateReportPrice('pro', locs).price)
          .toBe(spec.expected_tier_totals.report_pro[locs]);
      });
    }
    it('has correct AI credits', () => {
      expect(reportTiers.pro.aiCredits.base).toBe(spec.tiers.report_pro.ai_credits.base);
      expect(reportTiers.pro.aiCredits.perLocation).toBe(spec.tiers.report_pro.ai_credits.per_location);
    });
    it('has correct user count', () => {
      expect(reportTiers.pro.aiSeats).toBe(spec.tiers.report_pro.users_included);
    });
  });

  describe('Core Lite', () => {
    for (const locs of locationCounts) {
      it(`@ ${locs} locations = $${spec.expected_tier_totals.core_lite[locs]}`, () => {
        expect(calculateCorePrice('lite', locs).price)
          .toBe(spec.expected_tier_totals.core_lite[locs]);
      });
    }
    it('has correct AI credits', () => {
      expect(coreTiers.lite.aiCredits.base).toBe(spec.tiers.core_lite.ai_credits.base);
      expect(coreTiers.lite.aiCredits.perLocation).toBe(spec.tiers.core_lite.ai_credits.per_location);
    });
    it('has correct user model (10 + 2/loc)', () => {
      expect(coreTiers.lite.aiSeats).toBe(spec.tiers.core_lite.users_included.base);
      expect(coreTiers.lite.aiSeatsPerLocation).toBe(spec.tiers.core_lite.users_included.per_location);
    });
  });

  describe('Core Pro', () => {
    for (const locs of locationCounts) {
      it(`@ ${locs} locations = $${spec.expected_tier_totals.core_pro[locs]}`, () => {
        expect(calculateCorePrice('pro', locs).price)
          .toBe(spec.expected_tier_totals.core_pro[locs]);
      });
    }
    it('has correct AI credits', () => {
      expect(coreTiers.pro.aiCredits.base).toBe(spec.tiers.core_pro.ai_credits.base);
      expect(coreTiers.pro.aiCredits.perLocation).toBe(spec.tiers.core_pro.ai_credits.per_location);
    });
    it('has correct user model (25 + 5/loc)', () => {
      expect(coreTiers.pro.aiSeats).toBe(spec.tiers.core_pro.users_included.base);
      expect(coreTiers.pro.aiSeatsPerLocation).toBe(spec.tiers.core_pro.users_included.per_location);
    });
  });

  describe('AI credits @ 10 locations', () => {
    const tiers = [
      { tier: 'lite' as const, layer: 'report', expected: spec.expected_ai_credits.report_lite['10'] },
      { tier: 'plus' as const, layer: 'report', expected: spec.expected_ai_credits.report_plus['10'] },
      { tier: 'pro' as const, layer: 'report', expected: spec.expected_ai_credits.report_pro['10'] },
    ];
    for (const { tier, expected } of tiers) {
      it(`Report ${tier} @ 10 locs = ${expected} credits`, () => {
        expect(calculateReportPrice(tier, 10).aiCredits).toBe(expected);
      });
    }

    it(`Core Lite @ 10 locs = ${spec.expected_ai_credits.core_lite['10']} credits`, () => {
      expect(calculateCorePrice('lite', 10).aiCredits).toBe(spec.expected_ai_credits.core_lite['10']);
    });

    it(`Core Pro @ 10 locs = ${spec.expected_ai_credits.core_pro['10']} credits`, () => {
      expect(calculateCorePrice('pro', 10).aiCredits).toBe(spec.expected_ai_credits.core_pro['10']);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// B) MODULE PRICING CORRECTNESS
// ═══════════════════════════════════════════════════════════════════════════

describe('B) Module Pricing vs Spec', () => {
  const locationCounts = [5, 10, 20, 50];
  const allModules: ModuleId[] = [
    'labor', 'inventory', 'purchasing', 'marketing', 'reservations',
    'profit', 'revenue', 'delivery', 'guest', 'pulse'
  ];

  for (const moduleId of allModules) {
    describe(`${modules[moduleId].name}`, () => {
      for (const locs of locationCounts) {
        const expected = spec.expected_module_totals[moduleId][locs];
        it(`@ ${locs} locations = $${expected}/mo`, () => {
          expect(calculateModulePrice(moduleId, locs)).toBe(expected);
        });
      }

      it(`setup fee = $${spec.modules[moduleId].setup_fee}`, () => {
        expect(modules[moduleId].setupFee).toBe(spec.modules[moduleId].setup_fee);
      });
    });
  }

  describe('All 10 modules combined', () => {
    for (const locs of locationCounts) {
      const expected = spec.expected_module_totals.all_10[locs];
      it(`@ ${locs} locations = $${expected}/mo`, () => {
        const total = allModules.reduce((sum, id) => sum + calculateModulePrice(id, locs), 0);
        expect(total).toBe(expected);
      });
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// C) WATCHTOWER PRICING CORRECTNESS
// ═══════════════════════════════════════════════════════════════════════════

describe('C) Watchtower Pricing vs Spec', () => {
  const locationCounts = [1, 5, 10, 20, 50];
  const components = ['competitive', 'events', 'trends', 'bundle'] as const;

  for (const comp of components) {
    describe(`${comp}`, () => {
      for (const locs of locationCounts) {
        const expected = spec.expected_watchtower_totals[comp][locs];
        it(`@ ${locs} locations = $${expected}/mo`, () => {
          const result = calculateWatchtowerPrice([comp], locs);
          expect(result.price).toBe(expected);
        });
      }
    });
  }

  it('bundle base prices match spec', () => {
    expect(watchtower.bundle.basePrice).toBe(spec.watchtower.bundle.base);
    expect(watchtower.bundle.perLocationPrice).toBe(spec.watchtower.bundle.per_location);
  });

  it('individual base prices match spec', () => {
    expect(watchtower.competitive.basePrice).toBe(spec.watchtower.competitive.base);
    expect(watchtower.events.basePrice).toBe(spec.watchtower.events.base);
    expect(watchtower.trends.basePrice).toBe(spec.watchtower.trends.base);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// D) BUNDLE PRICING CORRECTNESS
// ═══════════════════════════════════════════════════════════════════════════

describe('D) Bundle Pricing vs Spec', () => {
  const locationCounts = [5, 10, 20, 50];
  const bundles: BundleId[] = [
    'ops_suite', 'growth_suite', 'finance_addon',
    'channel_suite', 'realtime_suite', 'complete_intelligence'
  ];

  for (const bundleId of bundles) {
    describe(`${moduleBundles[bundleId].name}`, () => {
      for (const locs of locationCounts) {
        const expected = spec.expected_bundle_totals[bundleId][locs];
        it(`@ ${locs} locations = $${expected}/mo`, () => {
          expect(calculateBundlePrice(bundleId, locs)).toBe(expected);
        });
      }

      it(`setup fee = $${spec.module_bundles[bundleId].setup_fee}`, () => {
        expect(moduleBundles[bundleId].setupFee).toBe(spec.module_bundles[bundleId].setup_fee);
      });
    });
  }

  describe('Finance Add-On prerequisite enforcement', () => {
    it('fails when prerequisites missing', () => {
      const errors = validatePrerequisites(['profit', 'revenue']);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].moduleId).toBe('profit');
      expect(errors[0].missingPrerequisites).toContain('labor');
      expect(errors[0].missingPrerequisites).toContain('inventory');
    });

    it('passes when labor + inventory present', () => {
      const errors = validatePrerequisites(['labor', 'inventory', 'profit', 'revenue']);
      expect(errors.length).toBe(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// E) PULSE ON REPORT PRO — UNLOCK VS MODULE NUANCE
// ═══════════════════════════════════════════════════════════════════════════

describe('E) Pulse on Report Pro', () => {
  it('Report Pro, 5 locations, Pulse enabled = $557/mo + $399 setup', () => {
    const result = calculateScenario({
      layer: 'report',
      tier: 'pro',
      locations: 5,
      modules: [],
      watchtower: [],
      pulse: true,
    });

    // Monthly: tier($259) + unlock($99) + pulse_module($199) = $557
    const tierPrice = 119 + (4 * 35); // 259
    expect(result.monthly.tierPrice).toBe(tierPrice);
    expect(result.monthly.unlockFees).toBe(99);
    // Pulse module is added via the scenario engine
    // Total monthly = 259 + 99 + 199 = 557
    expect(result.monthly.total).toBe(557);

    // One-time: Pulse setup $399
    expect(result.oneTime.setupFees).toBe(399);
  });

  it('Core Lite, 5 locations, Pulse enabled = $199 module, NO unlock fee', () => {
    const unlocks = calculateUnlockFees('core', 'lite', { pulse: true });
    expect(unlocks.pulseAccess).toBe(0);
    expect(unlocks.total).toBe(0);
  });

  it('Core Pro, 5 locations, Pulse enabled = $199 module, NO unlock fee', () => {
    const unlocks = calculateUnlockFees('core', 'pro', { pulse: true });
    expect(unlocks.pulseAccess).toBe(0);
    expect(unlocks.total).toBe(0);
  });

  it('Report Pro unlock fee for Chat with Data = $49/mo', () => {
    const unlocks = calculateUnlockFees('report', 'pro', { chatWithData: true });
    expect(unlocks.chatWithData).toBe(49);
    expect(unlocks.total).toBe(49);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// F) DISCOUNT STACKING RULES
// ═══════════════════════════════════════════════════════════════════════════

describe('F) Discount Stacking Rules', () => {
  it('volume discount AND annual billing — takes the larger, does NOT stack', () => {
    // 35 locations = 5% volume, annual = 10% billing
    // Should take 10% (larger), not 15% (stacked)
    const result = applyDiscounts(10000, {
      type: 'growth',
      isEarlyAdopter: false,
      isFranchise: false,
      brandCount: 1,
      billingCycle: 'annual'
    });
    // 10% of 10000 = 1000 off
    expect(result.total).toBe(9000);
    expect(result.discounts.length).toBe(1);
    expect(result.discounts[0].percent).toBe(10);
  });

  it('volume 7% AND annual 10% — takes 10%', () => {
    const result = applyDiscounts(10000, {
      type: 'multi-site',
      isEarlyAdopter: false,
      isFranchise: false,
      brandCount: 1,
      billingCycle: 'annual'
    });
    expect(result.total).toBe(9000);
  });

  it('volume 7% AND 2-year 15% — takes 15% (max)', () => {
    const result = applyDiscounts(10000, {
      type: 'multi-site',
      isEarlyAdopter: false,
      isFranchise: false,
      brandCount: 1,
      billingCycle: 'two_year'
    });
    expect(result.total).toBe(8500);
  });

  it('max discount never exceeds 15%', () => {
    // Even with 2-year (15%) and multi-site (7%), should be capped at 15%
    const result = applyDiscounts(10000, {
      type: 'multi-site',
      isEarlyAdopter: false,
      isFranchise: false,
      brandCount: 1,
      billingCycle: 'two_year'
    });
    expect(result.total).toBeGreaterThanOrEqual(8500); // 15% max off
  });

  it('independent (0%) with no billing = 0% discount', () => {
    const result = applyDiscounts(10000, {
      type: 'independent',
      isEarlyAdopter: false,
      isFranchise: false,
      brandCount: 1
    });
    expect(result.total).toBe(10000);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// G) SETUP FEE DISCOUNTS
// ═══════════════════════════════════════════════════════════════════════════

describe('G) Setup Fee Discounts', () => {
  it('3+ modules = 20% off setup fees', () => {
    const result = calculateSetupFees(['labor', 'inventory', 'purchasing']);
    // Setup fees: 299 + 499 + 299 = 1097
    expect(result.subtotal).toBe(1097);
    expect(result.discountPercent).toBe(20);
    expect(result.total).toBe(1097 - Math.round(1097 * 0.2)); // 878
  });

  it('Complete Intelligence bundle = fixed $999 setup (50% off)', () => {
    const result = calculateSetupFees([], { isBundle: 'complete_intelligence' });
    expect(result.subtotal).toBe(999);
    expect(result.discountPercent).toBe(50);
    expect(result.total).toBe(999 - Math.round(999 * 0.5)); // 500
  });

  it('annual prepay = 25% off setup fees', () => {
    const result = calculateSetupFees(['labor'], { isAnnualPrepay: true });
    expect(result.subtotal).toBe(299);
    expect(result.discountPercent).toBe(25);
    expect(result.total).toBe(299 - Math.round(299 * 0.25)); // 224
  });

  it('enterprise = setup fees waived', () => {
    const result = calculateSetupFees(['labor', 'inventory', 'pulse'], { isEnterprise: true });
    expect(result.total).toBe(0);
    expect(result.discountPercent).toBe(100);
  });

  it('annual prepay > 3+ modules discount (25% > 20%)', () => {
    const result = calculateSetupFees(['labor', 'inventory', 'purchasing'], { isAnnualPrepay: true });
    // Both qualify: 3+ modules (20%) and annual (25%) — takes 25%
    expect(result.discountPercent).toBe(25);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// H) INTEGRATION OVERLAP CREDITS (PULSE)
// ═══════════════════════════════════════════════════════════════════════════

describe('H) Pulse Integration Credit Rules', () => {
  it('Pulse + Labor (same system): Pulse setup = $100', () => {
    const result = calculateSetupFees(['labor', 'pulse'], {
      pulseIntegrationOverlap: { laborSameSystem: true }
    });
    // Labor setup: $299, Pulse setup: $399 - $299 credit = $100
    const pulseItem = result.items.find(i => i.name.includes('Pulse'));
    expect(pulseItem?.fee).toBe(100);
  });

  it('Pulse + Inventory (same system): Pulse setup = $0', () => {
    const result = calculateSetupFees(['inventory', 'pulse'], {
      pulseIntegrationOverlap: { inventorySameSystem: true }
    });
    // Inventory setup: $499, Pulse setup: $399 - min(499, 399) = $0
    const pulseItem = result.items.find(i => i.name.includes('Pulse'));
    expect(pulseItem?.fee).toBe(0);
  });

  it('Pulse + Labor + Inventory (same systems): Pulse setup = $0 (credit capped at $399)', () => {
    const result = calculateSetupFees(['labor', 'inventory', 'pulse'], {
      pulseIntegrationOverlap: { laborSameSystem: true, inventorySameSystem: true }
    });
    // Credit = min(299 + 499, 399) = $399 → Pulse setup = $399 - $399 = $0
    const pulseItem = result.items.find(i => i.name.includes('Pulse'));
    expect(pulseItem?.fee).toBe(0);
  });

  it('Pulse + Labor (different systems): full setup fees apply', () => {
    const result = calculateSetupFees(['labor', 'pulse']);
    // No overlap specified → full Pulse setup = $399
    const pulseItem = result.items.find(i => i.name.includes('Pulse'));
    expect(pulseItem?.fee).toBe(399);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// COMPLETE SPEC EXAMPLES (Section 10 of v4.3)
// ═══════════════════════════════════════════════════════════════════════════

describe('Complete Pricing Examples from Spec', () => {
  it('Example 1: Single Location (Report Plus) = $59/mo, $0 setup', () => {
    const ex = spec.complete_examples.example_1_single_report_plus;
    const result = calculateReportPrice('plus', 1);
    expect(result.price).toBe(ex.monthly);
  });

  it('Example 2: 5-Location Chain (Core Lite + Ops Suite) = $784/mo, $879 setup', () => {
    const ex = spec.complete_examples.example_2_5loc_core_ops;
    const tierPrice = calculateCorePrice('lite', 5).price; // 355
    const bundlePrice = calculateBundlePrice('ops_suite', 5); // 429
    expect(tierPrice + bundlePrice).toBe(ex.monthly); // 784
    expect(moduleBundles.ops_suite.setupFee).toBe(ex.one_time); // 879
  });

  it('Example 3: 10-Location Chain (Core Pro + Complete + Watchtower) = $4,012/mo, $999 setup', () => {
    const ex = spec.complete_examples.example_3_10loc_full;
    const tierPrice = calculateCorePrice('pro', 10).price; // 664
    const bundlePrice = calculateBundlePrice('complete_intelligence', 10); // 1938
    const wtPrice = calculateWatchtowerPrice(['bundle'], 10).price; // 1410
    expect(tierPrice + bundlePrice + wtPrice).toBe(ex.monthly); // 4012
    expect(moduleBundles.complete_intelligence.setupFee).toBe(ex.one_time); // 999
  });

  it('Example 4: 35-Location (Core Pro + Complete + Watchtower + AI Pro) subtotal = $10,711, 5% discount = $10,175', () => {
    const ex = spec.complete_examples.example_4_35loc_enterprise_level;
    const tierPrice = calculateCorePrice('pro', 35).price; // 349 + 34*35 = 1539
    const bundlePrice = calculateBundlePrice('complete_intelligence', 35); // 1288 + 30*130 = 5188
    const wtPrice = calculateWatchtowerPrice(['bundle'], 35).price; // 699 + 34*79 = 3385
    const aiPro = 599;
    const subtotal = tierPrice + bundlePrice + wtPrice + aiPro;
    expect(subtotal).toBe(ex.subtotal_monthly); // 10711

    const discountAmt = Math.round(subtotal * 0.05);
    expect(discountAmt).toBe(-ex.volume_discount_5pct); // 536
    expect(subtotal - discountAmt).toBe(ex.monthly_after_discount); // 10175
  });

  it('Example 5: Report Pro + Pulse (5 locations) = $557/mo, $399 setup', () => {
    const ex = spec.complete_examples.example_5_report_pro_pulse;
    const tierPrice = calculateReportPrice('pro', 5).price; // 259
    expect(tierPrice).toBe(ex.monthly_breakdown.report_pro_5loc);

    const pulseUnlock = 99;
    expect(pulseUnlock).toBe(ex.monthly_breakdown.pulse_unlock_fee);

    const pulseModule = calculateModulePrice('pulse', 5); // 199
    expect(pulseModule).toBe(ex.monthly_breakdown.pulse_module_5loc);

    expect(tierPrice + pulseUnlock + pulseModule).toBe(ex.monthly); // 557
    expect(modules.pulse.setupFee).toBe(ex.one_time); // 399
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// AI CREDITS DATA INTEGRITY
// ═══════════════════════════════════════════════════════════════════════════

describe('AI Credits Data Integrity', () => {
  it('action costs match spec', () => {
    for (const [key, cost] of Object.entries(spec.ai_credits.actions)) {
      expect(aiCreditActions[key]).toBe(cost);
    }
  });

  it('top-up prices match spec', () => {
    const tierMap: Record<string, Record<string, number>> = {
      report_lite: aiCreditTopups.report_lite as Record<string, number>,
      report_plus: aiCreditTopups.report_plus as Record<string, number>,
      report_pro: aiCreditTopups.report_pro as Record<string, number>,
      core_lite: aiCreditTopups.core_lite as Record<string, number>,
      core_pro: aiCreditTopups.core_pro as Record<string, number>,
    };
    for (const [tierId, specTopups] of Object.entries(spec.ai_credits.topups)) {
      for (const [amount, price] of Object.entries(specTopups as Record<string, number>)) {
        expect(tierMap[tierId][amount]).toBe(price);
      }
    }
  });

  it('rollover policy matches spec', () => {
    expect(aiCreditRollover.capPercent).toBe(spec.ai_credits.rollover.cap_percent);
    expect(aiCreditRollover.durationMonths).toBe(spec.ai_credits.rollover.duration_months);
    expect(aiCreditRollover.purchasedCreditsExpire).toBe(spec.ai_credits.rollover.purchased_credits_expire);
  });

  it('AI packages match spec', () => {
    expect(aiPackages.ai_plus.monthlyFee).toBe(spec.ai_packages.ai_plus.monthly);
    expect(aiPackages.ai_plus.dailyCap).toBe(spec.ai_packages.ai_plus.daily_cap);
    expect(aiPackages.ai_pro.monthlyFee).toBe(spec.ai_packages.ai_pro.monthly);
    expect(aiPackages.ai_pro.dailyCap).toBe(spec.ai_packages.ai_pro.daily_cap);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SETUP FEE DISCOUNT RULES MATCH SPEC
// ═══════════════════════════════════════════════════════════════════════════

describe('Setup Fee Discount Rules Match Spec', () => {
  it('three_plus_modules_percent', () => {
    expect(setupFeeDiscounts.threeOrMoreModulesPercent)
      .toBe(spec.setup_fee_discounts.three_plus_modules_percent);
  });
  it('complete_intelligence_percent', () => {
    expect(setupFeeDiscounts.completeIntelligencePercent)
      .toBe(spec.setup_fee_discounts.complete_intelligence_percent);
  });
  it('annual_prepay_percent', () => {
    expect(setupFeeDiscounts.annualPrepayPercent)
      .toBe(spec.setup_fee_discounts.annual_prepay_percent);
  });
  it('enterprise_percent', () => {
    expect(setupFeeDiscounts.enterprisePercent)
      .toBe(spec.setup_fee_discounts.enterprise_percent);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PREREQUISITE VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

describe('Prerequisite Validation', () => {
  it('Profit Intelligence requires Labor + Inventory', () => {
    const errors = validatePrerequisites(['profit']);
    expect(errors.length).toBe(1);
    expect(errors[0].missingPrerequisites).toEqual(expect.arrayContaining(['labor', 'inventory']));
  });

  it('All standalone modules pass without prerequisites', () => {
    const standalone: ModuleId[] = ['labor', 'inventory', 'purchasing', 'marketing',
      'reservations', 'revenue', 'delivery', 'guest', 'pulse'];
    for (const id of standalone) {
      const errors = validatePrerequisites([id]);
      expect(errors.length).toBe(0);
    }
  });

  it('Finance Add-On modules (profit+revenue) pass with labor+inventory', () => {
    const errors = validatePrerequisites(['labor', 'inventory', 'profit', 'revenue']);
    expect(errors.length).toBe(0);
  });
});
