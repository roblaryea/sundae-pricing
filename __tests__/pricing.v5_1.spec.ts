/**
 * PRICING QA AUDIT — v5.1 Scenario Verification Harness
 *
 * Tests engine outputs against canonical spec (generated/pricingSpec.v5_1.json).
 * Covers: tier pricing, tier-aware module pricing, bundles, watchtower, unlock fees,
 * setup fees, discounts, prerequisites, seat caps, and full scenarios.
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
  seatCaps,
  setupFeeDiscounts,
  type ModuleId,
  type BundleId,
} from '../src/data/pricing';

// ─── Load canonical spec ───────────────────────────────────────────────────
const specPath = join(__dirname, '..', 'generated', 'pricingSpec.v5_1.json');
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
    it('has correct seat count', () => {
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
    it('has correct seat count', () => {
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
    it('has correct seat count', () => {
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
    it('has correct fixed seat count (15)', () => {
      expect(coreTiers.lite.aiSeats).toBe(spec.tiers.core_lite.users_included);
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
    it('has correct fixed seat count (25)', () => {
      expect(coreTiers.pro.aiSeats).toBe(spec.tiers.core_pro.users_included);
    });
  });

  describe('AI credits @ 10 locations', () => {
    const tiers = [
      { tier: 'lite' as const, expected: spec.expected_ai_credits.report_lite['10'] },
      { tier: 'plus' as const, expected: spec.expected_ai_credits.report_plus['10'] },
      { tier: 'pro' as const, expected: spec.expected_ai_credits.report_pro['10'] },
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
// B) MODULE PRICING CORRECTNESS (Core Pro default)
// ═══════════════════════════════════════════════════════════════════════════

describe('B) Module Pricing vs Spec (Core Pro)', () => {
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
          expect(calculateModulePrice(moduleId, locs, 'core_pro')).toBe(expected);
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
        const total = allModules.reduce((sum, id) => sum + calculateModulePrice(id, locs, 'core_pro'), 0);
        expect(total).toBe(expected);
      });
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// B2) TIER-AWARE MODULE PRICING (Core Lite vs Core Pro)
// ═══════════════════════════════════════════════════════════════════════════

describe('B2) Tier-Aware Module Pricing', () => {
  it('Core Lite pays more than Core Pro for same module', () => {
    const liteLabor = calculateModulePrice('labor', 5, 'core_lite');
    const proLabor = calculateModulePrice('labor', 5, 'core_pro');
    expect(liteLabor).toBeGreaterThan(proLabor);
    // Core Lite: 249 + 2*25 = 299, Core Pro: 219 + 2*22 = 263
    expect(liteLabor).toBe(299);
    expect(proLabor).toBe(263);
  });

  it('modules include 3 locations (per-location starts from #4)', () => {
    // At 3 locations: just base price
    const at3 = calculateModulePrice('labor', 3, 'core_pro');
    expect(at3).toBe(219);
    // At 4 locations: base + 1 * perLoc
    const at4 = calculateModulePrice('labor', 4, 'core_pro');
    expect(at4).toBe(219 + 22);
  });

  it('without tier defaults to Core Pro pricing', () => {
    const noTier = calculateModulePrice('labor', 5);
    const proPricing = calculateModulePrice('labor', 5, 'core_pro');
    expect(noTier).toBe(proPricing);
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
// D) BUNDLE PRICING CORRECTNESS (Core Pro)
// ═══════════════════════════════════════════════════════════════════════════

describe('D) Bundle Pricing vs Spec (Core Pro)', () => {
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
          expect(calculateBundlePrice(bundleId, locs, 'core_pro')).toBe(expected);
        });
      }

      it(`setup fee = $${spec.module_bundles[bundleId].setup_fee}`, () => {
        expect(moduleBundles[bundleId].setupFee).toBe(spec.module_bundles[bundleId].setup_fee);
      });
    });
  }

  describe('Tier-aware bundle pricing', () => {
    it('Core Lite bundle > Core Pro bundle', () => {
      const liteOps = calculateBundlePrice('ops_suite', 5, 'core_lite');
      const proOps = calculateBundlePrice('ops_suite', 5, 'core_pro');
      expect(liteOps).toBeGreaterThan(proOps);
      // Core Lite: 627 + 2*63 = 753, Core Pro: 555 + 2*56 = 667
      expect(liteOps).toBe(753);
      expect(proOps).toBe(667);
    });

    it('bundles include 3 locations (per-location starts from #4)', () => {
      const at3 = calculateBundlePrice('ops_suite', 3, 'core_pro');
      expect(at3).toBe(555); // just base price
      const at4 = calculateBundlePrice('ops_suite', 4, 'core_pro');
      expect(at4).toBe(555 + 56); // base + 1 * perLoc
    });
  });

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
// E) INTELLIGENCE UNLOCK ON REPORT PRO
// ═══════════════════════════════════════════════════════════════════════════

describe('E) Intelligence on Report Pro', () => {
  it('Report Pro Intelligence unlock fee = $79/mo', () => {
    const unlocks = calculateUnlockFees('report', 'pro', { intelligence: true });
    expect(unlocks.intelligence).toBe(79);
    expect(unlocks.total).toBe(79);
  });

  it('Report Pro Pulse unlock fee = $99/mo', () => {
    const unlocks = calculateUnlockFees('report', 'pro', { pulse: true });
    expect(unlocks.pulseAccess).toBe(99);
    expect(unlocks.total).toBe(99);
  });

  it('Core Lite has no unlock fees', () => {
    const unlocks = calculateUnlockFees('core', 'lite', { intelligence: true, pulse: true });
    expect(unlocks.intelligence).toBe(0);
    expect(unlocks.pulseAccess).toBe(0);
    expect(unlocks.total).toBe(0);
  });

  it('Core Pro has no unlock fees', () => {
    const unlocks = calculateUnlockFees('core', 'pro', { intelligence: true, pulse: true });
    expect(unlocks.total).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// F) DISCOUNT STACKING RULES
// ═══════════════════════════════════════════════════════════════════════════

describe('F) Discount Stacking Rules', () => {
  it('volume discount AND annual billing — takes the larger, does NOT stack', () => {
    // 35 locations = 5% volume, annual = 10% billing → takes 10%
    const result = applyDiscounts(10000, {
      type: 'growth',
      isEarlyAdopter: false,
      isFranchise: false,
      brandCount: 1,
      billingCycle: 'annual'
    });
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
    const result = applyDiscounts(10000, {
      type: 'multi-site',
      isEarlyAdopter: false,
      isFranchise: false,
      brandCount: 1,
      billingCycle: 'two_year'
    });
    expect(result.total).toBeGreaterThanOrEqual(8500);
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
    // Setup fees: 399 + 499 + 399 = 1297
    expect(result.subtotal).toBe(1297);
    expect(result.discountPercent).toBe(20);
    expect(result.total).toBe(1297 - Math.round(1297 * 0.2));
  });

  it('Complete Intelligence bundle = fixed $999 setup (50% off)', () => {
    const result = calculateSetupFees([], { isBundle: 'complete_intelligence' });
    expect(result.subtotal).toBe(999);
    expect(result.discountPercent).toBe(50);
    expect(result.total).toBe(999 - Math.round(999 * 0.5));
  });

  it('annual prepay = 25% off setup fees', () => {
    const result = calculateSetupFees(['labor'], { isAnnualPrepay: true });
    expect(result.subtotal).toBe(399);
    expect(result.discountPercent).toBe(25);
    expect(result.total).toBe(399 - Math.round(399 * 0.25));
  });

  it('enterprise = setup fees waived', () => {
    const result = calculateSetupFees(['labor', 'inventory', 'pulse'], { isEnterprise: true });
    expect(result.total).toBe(0);
    expect(result.discountPercent).toBe(100);
  });

  it('annual prepay > 3+ modules discount (25% > 20%)', () => {
    const result = calculateSetupFees(['labor', 'inventory', 'purchasing'], { isAnnualPrepay: true });
    expect(result.discountPercent).toBe(25);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// H) INTEGRATION OVERLAP CREDITS (PULSE)
// ═══════════════════════════════════════════════════════════════════════════

describe('H) Pulse Integration Credit Rules', () => {
  it('Pulse + Labor (same system): Pulse setup reduced', () => {
    const result = calculateSetupFees(['labor', 'pulse'], {
      pulseIntegrationOverlap: { laborSameSystem: true }
    });
    const pulseItem = result.items.find(i => i.name.includes('Pulse'));
    // Pulse setup: $499 - $299 credit = $200
    expect(pulseItem?.fee).toBe(200);
  });

  it('Pulse + Inventory (same system): Pulse setup reduced', () => {
    const result = calculateSetupFees(['inventory', 'pulse'], {
      pulseIntegrationOverlap: { inventorySameSystem: true }
    });
    const pulseItem = result.items.find(i => i.name.includes('Pulse'));
    // Pulse setup: $499 - min(499, 399) = $100
    expect(pulseItem?.fee).toBe(100);
  });

  it('Pulse + Labor + Inventory (same systems): Pulse setup = $100 (credit capped at $399)', () => {
    const result = calculateSetupFees(['labor', 'inventory', 'pulse'], {
      pulseIntegrationOverlap: { laborSameSystem: true, inventorySameSystem: true }
    });
    // Credit = min(299 + 499, 399) = $399 → Pulse setup = $499 - $399 = $100
    const pulseItem = result.items.find(i => i.name.includes('Pulse'));
    expect(pulseItem?.fee).toBe(100);
  });

  it('Pulse + Labor (different systems): full setup fees apply', () => {
    const result = calculateSetupFees(['labor', 'pulse']);
    const pulseItem = result.items.find(i => i.name.includes('Pulse'));
    expect(pulseItem?.fee).toBe(499);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// COMPLETE SPEC EXAMPLES (v5.1)
// ═══════════════════════════════════════════════════════════════════════════

describe('Complete Pricing Examples from Spec', () => {
  it('Example 1: Single Location (Report Plus) = $79/mo, $0 setup', () => {
    const ex = spec.complete_examples.example_1_single_report_plus;
    const result = calculateReportPrice('plus', 1);
    expect(result.price).toBe(ex.monthly);
  });

  it('Example 2: 5-Location Chain (Core Lite + Ops Suite) = $1,348/mo, $879 setup', () => {
    const ex = spec.complete_examples.example_2_5loc_core_ops;
    const tierPrice = calculateCorePrice('lite', 5).price; // 595
    const bundlePrice = calculateBundlePrice('ops_suite', 5, 'core_lite'); // 753
    expect(tierPrice + bundlePrice).toBe(ex.monthly); // 1348
    expect(moduleBundles.ops_suite.setupFee).toBe(ex.one_time); // 879
  });

  it('Example 3: 10-Location Chain (Core Pro + Complete + Watchtower) = $6,002/mo, $999 setup', () => {
    const ex = spec.complete_examples.example_3_10loc_full;
    const tierPrice = calculateCorePrice('pro', 10).price; // 1250
    const bundlePrice = calculateBundlePrice('complete_intelligence', 10, 'core_pro'); // 2872
    const wtPrice = calculateWatchtowerPrice(['bundle'], 10).price; // 1880
    expect(tierPrice + bundlePrice + wtPrice).toBe(ex.monthly); // 6002
    expect(moduleBundles.complete_intelligence.setupFee).toBe(ex.one_time); // 999
  });

  it('Example 4: 35-Location (Core Pro + Complete + Watchtower + Intelligence Pro) subtotal = $15,551, 5% discount = $14,773', () => {
    const ex = spec.complete_examples.example_4_35loc_enterprise_level;
    const tierPrice = calculateCorePrice('pro', 35).price; // 449 + 34*89 = 3475
    const bundlePrice = calculateBundlePrice('complete_intelligence', 35, 'core_pro'); // 1696 + 32*168 = 7072
    const wtPrice = calculateWatchtowerPrice(['bundle'], 35).price; // 899 + 34*109 = 4605
    const intelligencePro = 399;
    const subtotal = tierPrice + bundlePrice + wtPrice + intelligencePro;
    expect(subtotal).toBe(ex.subtotal_monthly); // 15551

    const discountAmt = Math.round(subtotal * 0.05);
    expect(discountAmt).toBe(-ex.volume_discount_5pct); // 778
    expect(subtotal - discountAmt).toBe(ex.monthly_after_discount); // 14773
  });

  it('Example 5: Report Pro + Intelligence + Pulse (5 locations) = $801/mo, $499 setup', () => {
    const ex = spec.complete_examples.example_5_report_pro_intelligence_pulse;
    const tierPrice = calculateReportPrice('pro', 5).price; // 395
    expect(tierPrice).toBe(ex.monthly_breakdown.report_pro_5loc);

    const intelUnlock = 79;
    expect(intelUnlock).toBe(ex.monthly_breakdown.intelligence_unlock_fee);

    const pulseModule = calculateModulePrice('pulse', 5); // 327
    expect(pulseModule).toBe(ex.monthly_breakdown.pulse_module_5loc);

    expect(tierPrice + intelUnlock + pulseModule).toBe(ex.monthly); // 801
    expect(modules.pulse.setupFee).toBe(ex.one_time); // 499
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
// SEAT CAPS
// ═══════════════════════════════════════════════════════════════════════════

describe('Seat Caps', () => {
  it('Report Lite: 1 seat, 0 additional', () => {
    expect(seatCaps.report_lite.included).toBe(1);
    expect(seatCaps.report_lite.maxAdditional).toBe(0);
  });

  it('Report Plus: 5 seats, max 3 additional at $19', () => {
    expect(seatCaps.report_plus.included).toBe(5);
    expect(seatCaps.report_plus.maxAdditional).toBe(3);
    expect(seatCaps.report_plus.additionalCost).toBe(19);
  });

  it('Report Pro: 10 seats, max 5 additional at $15', () => {
    expect(seatCaps.report_pro.included).toBe(10);
    expect(seatCaps.report_pro.maxAdditional).toBe(5);
    expect(seatCaps.report_pro.additionalCost).toBe(15);
  });

  it('Core Lite: 15 seats, unlimited additional at $12', () => {
    expect(seatCaps.core_lite.included).toBe(15);
    expect(seatCaps.core_lite.maxAdditional).toBeNull();
    expect(seatCaps.core_lite.additionalCost).toBe(12);
  });

  it('Core Pro: 25 seats, unlimited additional at $10', () => {
    expect(seatCaps.core_pro.included).toBe(25);
    expect(seatCaps.core_pro.maxAdditional).toBeNull();
    expect(seatCaps.core_pro.additionalCost).toBe(10);
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
