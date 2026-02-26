import { describe, it, expect } from 'vitest';
import {
  calculateReportPrice,
  calculateCorePrice,
  calculateModulePrice,
  calculateWatchtowerPrice,
  applyDiscounts,
  calculateEnterpriseOrg,
  calculateFullPrice
} from '../src/lib/pricingEngine';
import type { Configuration, ClientProfile } from '../src/lib/pricingEngine';
import {
  reportTiers,
  coreTiers,
  modules,
  watchtower,
  CLIENT_TYPE_RULES,
  EARLY_ADOPTER_TERMS,
  enterprisePricing,
  detectClientType,
  type ModuleId,
  type WatchtowerId
} from '../src/data/pricing';

describe('Report Tier Pricing', () => {
  it('Report Lite is FREE for any location count', () => {
    expect(calculateReportPrice('lite', 1).price).toBe(0);
    expect(calculateReportPrice('lite', 50).price).toBe(0);
    expect(calculateReportPrice('lite', 100).price).toBe(0);
  });

  it('Report Lite has 1 AI seat (not 2)', () => {
    expect(reportTiers.lite.aiSeats).toBe(1);
  });

  it('Report Plus @ 5 locations = $235', () => {
    expect(calculateReportPrice('plus', 5).price).toBe(235); // 79 + 4*39
  });

  it('Report Plus has 5 AI seats, 30 visuals, 1-2km adjustable radius', () => {
    expect(reportTiers.plus.aiSeats).toBe(5);
    expect(reportTiers.plus.visuals).toBe(30);
    expect(reportTiers.plus.benchmarkRadius).toBe('1-2km adjustable');
  });

  it('Report Pro @ 10 locations = $690', () => {
    expect(calculateReportPrice('pro', 10).price).toBe(690); // 159 + 9*59
  });
});

describe('Core Tier Pricing', () => {
  it('Core Lite @ 5 locations = $595', () => {
    expect(calculateCorePrice('lite', 5).price).toBe(595); // 279 + 4*79
  });

  it('Core Pro @ 5 locations = $805', () => {
    expect(calculateCorePrice('pro', 5).price).toBe(805); // 449 + 4*89
  });

  it('Core Pro total cost ALWAYS higher (premium positioning)', () => {
    // Pro should always cost more in total (premium tier)
    const lite5 = calculateCorePrice('lite', 5).price;
    const pro5 = calculateCorePrice('pro', 5).price;
    expect(pro5).toBeGreaterThan(lite5); // 805 > 595

    const lite14 = calculateCorePrice('lite', 14).price;
    const pro14 = calculateCorePrice('pro', 14).price;
    expect(pro14).toBeGreaterThan(lite14); // 1606 > 1306

    // Note: Pro becomes better per-location value at scale (intended)
    // This is fine - premium tier should reward scale
  });
});

describe('Module Pricing', () => {
  it('Labor = $219 org license (v5.1 Core Pro pricing)', () => {
    expect(modules.labor.orgLicensePrice).toBe(219);
  });

  it('Labor @ 10 locations = $373', () => {
    expect(calculateModulePrice('labor', 10)).toBe(373); // 219 + 7*22
  });

  it('Inventory = $229 org, $24/extra (v5.1)', () => {
    expect(modules.inventory.orgLicensePrice).toBe(229);
    expect(modules.inventory.perLocationPrice).toBe(24);
  });

  it('Purchasing = $169 org, $16/extra (v5.1)', () => {
    expect(modules.purchasing.orgLicensePrice).toBe(169);
    expect(modules.purchasing.perLocationPrice).toBe(16);
  });

  it('Purchasing @ 10 locations = $281', () => {
    expect(calculateModulePrice('purchasing', 10)).toBe(281); // 169 + 7*16
  });
});

describe('Watchtower Pricing (New Base + Per-Location Model)', () => {
  it('Bundle @ 1 location = $899 base', () => {
    expect(calculateWatchtowerPrice(['bundle'], 1).price).toBe(899);
  });

  it('Bundle @ 5 locations = $1,335', () => {
    expect(calculateWatchtowerPrice(['bundle'], 5).price).toBe(1335); // 899 + 4*109
  });

  it('Individual modules @ 1 location calculated correctly', () => {
    const result = calculateWatchtowerPrice(['competitive', 'events', 'trends'], 1);
    // When selecting all 3 individual modules, returns bundle price + shows savings
    expect(result.price).toBe(899); // Automatically gets bundle price
    expect(result.savings).toBe(198); // Shows what you're saving vs individual (1097 - 899)
  });

  it('Bundle data shows savings', () => {
    expect(watchtower.bundle.baseSavings).toBe(198); // 1097 - 899
  });
});

describe('Discount Model (v4.3 Non-Stacking)', () => {
  it('Growth discount = 5% (volume tier)', () => {
    const r = applyDiscounts(1000, {
      type: 'growth',
      isEarlyAdopter: false,
      isFranchise: false,
      brandCount: 1
    });
    expect(r.total).toBe(950);
  });

  it('Multi-site discount = 7% (volume tier)', () => {
    const r = applyDiscounts(1000, {
      type: 'multi-site',
      isEarlyAdopter: false,
      isFranchise: false,
      brandCount: 1
    });
    expect(r.total).toBe(930);
  });

  it('Enterprise gets no percentage discount (custom pricing)', () => {
    const r = applyDiscounts(1000, {
      type: 'enterprise',
      isEarlyAdopter: false,
      isFranchise: false,
      brandCount: 1
    });
    expect(r.total).toBe(1000);
  });

  it('Growth + Early Adopter: 1000 → 950 → 760', () => {
    const r = applyDiscounts(1000, {
      type: 'growth',
      isEarlyAdopter: true,
      isFranchise: false,
      brandCount: 1
    });
    expect(r.total).toBe(760);
  });
});

describe('Enterprise Pricing', () => {
  it('Triggers at 30+ locations (not 50+)', () => {
    expect(enterprisePricing.minLocations).toBe(30);
    expect(CLIENT_TYPE_RULES['enterprise'].locationRange[0]).toBe(30);
  });

  it('Org License @ 40 locations = $5,660', () => {
    expect(calculateEnterpriseOrg(40)).toBe(5660);
    // 2500 + 10*99 + 20*79 + 10*59 = 2500 + 990 + 1580 + 590
  });
});

describe('Data Integrity', () => {
  it('multi-site key exists (hyphenated, not camelCase)', () => {
    expect(CLIENT_TYPE_RULES['multi-site']).toBeDefined();
    expect(CLIENT_TYPE_RULES['multi-site'].discountTier).toBe(7);
  });

  it('Early adopter terms correct', () => {
    expect(EARLY_ADOPTER_TERMS.discountPercent).toBe(20);
    expect(EARLY_ADOPTER_TERMS.bonusCredits).toBe(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SAFETY NET TESTS — Coupling, consistency, and structural integrity
// ═══════════════════════════════════════════════════════════════════════════

describe('No Duplicated Pricing Sources', () => {
  it('reportTiers has exactly 3 tiers: lite, plus, pro', () => {
    const keys = Object.keys(reportTiers);
    expect(keys).toEqual(['lite', 'plus', 'pro']);
  });

  it('coreTiers has exactly 3 tiers: lite, pro, enterprise', () => {
    const keys = Object.keys(coreTiers);
    expect(keys).toEqual(['lite', 'pro', 'enterprise']);
  });

  it('modules has exactly 10 modules (including pulse)', () => {
    const keys = Object.keys(modules);
    expect(keys).toHaveLength(10);
    expect(keys).toEqual([
      'labor', 'inventory', 'purchasing', 'marketing', 'reservations',
      'profit', 'revenue', 'delivery', 'guest', 'pulse'
    ]);
  });

  it('watchtower has exactly 4 entries: competitive, events, trends, bundle', () => {
    const keys = Object.keys(watchtower);
    expect(keys).toEqual(['competitive', 'events', 'trends', 'bundle']);
  });

  it('all module ids match their object keys', () => {
    for (const [key, mod] of Object.entries(modules)) {
      expect(mod.id).toBe(key);
    }
  });

  it('all watchtower ids match their object keys', () => {
    for (const [key, wt] of Object.entries(watchtower)) {
      expect(wt.id).toBe(key);
    }
  });
});

describe('AI Credits Math', () => {
  it('Report tier AI credits: base + (locations-1) * perLocation', () => {
    for (const tier of ['lite', 'plus', 'pro'] as const) {
      const data = reportTiers[tier];
      const result = calculateReportPrice(tier, 5);
      const expectedCredits = data.aiCredits.base + 4 * data.aiCredits.perLocation;
      expect(result.aiCredits).toBe(expectedCredits);
    }
  });

  it('Core tier AI credits: base + (locations-1) * perLocation', () => {
    for (const tier of ['lite', 'pro'] as const) {
      const data = coreTiers[tier];
      const result = calculateCorePrice(tier, 5);
      const expectedCredits = (data.aiCredits.base as number) + 4 * (data.aiCredits.perLocation as number);
      expect(result.aiCredits).toBe(expectedCredits);
    }
  });

  it('AI credits scale linearly with locations', () => {
    const r1 = calculateReportPrice('pro', 1);
    const r10 = calculateReportPrice('pro', 10);
    expect(r10.aiCredits - r1.aiCredits).toBe(9 * reportTiers.pro.aiCredits.perLocation);
  });
});

describe('Bundle Discount Correctness', () => {
  it('bundle base price = sum of individual base prices minus savings', () => {
    const individualSum = watchtower.competitive.basePrice +
                          watchtower.events.basePrice +
                          watchtower.trends.basePrice;
    expect(watchtower.bundle.individualBaseTotal).toBe(individualSum); // 1097
    expect(watchtower.bundle.baseSavings).toBe(individualSum - watchtower.bundle.basePrice); // 198

    // Verify ~18% discount
    const discountPct = watchtower.bundle.baseSavings / individualSum * 100;
    expect(discountPct).toBeCloseTo(watchtower.bundle.savingsPercent, 0);
  });

  it('bundle per-location price = sum of individual per-location minus savings', () => {
    const individualPerLoc = watchtower.competitive.perLocationPrice +
                             watchtower.events.perLocationPrice +
                             watchtower.trends.perLocationPrice;
    expect(watchtower.bundle.individualPerLocTotal).toBe(individualPerLoc);
    expect(watchtower.bundle.perLocSavings).toBe(individualPerLoc - watchtower.bundle.perLocationPrice);
  });

  it('bundle includes all 3 individual watchtower modules', () => {
    expect(watchtower.bundle.includes).toEqual(['competitive', 'events', 'trends']);
  });
});

describe('Client Type Detection (v4.3 Boundaries)', () => {
  it('1-29 locations = independent', () => {
    expect(detectClientType(1)).toBe('independent');
    expect(detectClientType(15)).toBe('independent');
    expect(detectClientType(29)).toBe('independent');
  });

  it('30-99 locations = growth', () => {
    expect(detectClientType(30)).toBe('growth');
    expect(detectClientType(50)).toBe('growth');
    expect(detectClientType(99)).toBe('growth');
  });

  it('100-200 locations = multi-site', () => {
    expect(detectClientType(100)).toBe('multi-site');
    expect(detectClientType(150)).toBe('multi-site');
    expect(detectClientType(200)).toBe('multi-site');
  });

  it('201+ locations = enterprise', () => {
    expect(detectClientType(201)).toBe('enterprise');
    expect(detectClientType(500)).toBe('enterprise');
  });

  it('franchise flag overrides location count', () => {
    expect(detectClientType(1, true)).toBe('franchise');
    expect(detectClientType(100, true)).toBe('franchise');
  });
});

describe('Module Pricing — All 10 Modules', () => {
  const allModules: ModuleId[] = [
    'labor', 'inventory', 'purchasing', 'marketing', 'reservations',
    'profit', 'revenue', 'delivery', 'guest', 'pulse'
  ];

  it('every module has positive orgLicensePrice', () => {
    for (const id of allModules) {
      expect(modules[id].orgLicensePrice).toBeGreaterThan(0);
    }
  });

  it('every module has positive perLocationPrice', () => {
    for (const id of allModules) {
      expect(modules[id].perLocationPrice).toBeGreaterThan(0);
    }
  });

  it('every module includes 3 locations in org license', () => {
    for (const id of allModules) {
      expect(modules[id].baseIncludesLocations).toBe(3);
    }
  });

  it('module price at baseIncludesLocations = orgLicensePrice only', () => {
    for (const id of allModules) {
      const price = calculateModulePrice(id, modules[id].baseIncludesLocations);
      expect(price).toBe(modules[id].orgLicensePrice);
    }
  });

  it('module price at baseIncludesLocations + 1 = orgLicensePrice + 1 * perLocationPrice', () => {
    for (const id of allModules) {
      const price = calculateModulePrice(id, modules[id].baseIncludesLocations + 1);
      expect(price).toBe(modules[id].orgLicensePrice + modules[id].perLocationPrice);
    }
  });
});

describe('Watchtower Individual Pricing', () => {
  const individualModules: WatchtowerId[] = ['competitive', 'events', 'trends'];

  it('every individual watchtower module has positive basePrice', () => {
    for (const id of individualModules) {
      expect(watchtower[id].basePrice).toBeGreaterThan(0);
    }
  });

  it('every individual watchtower module has positive perLocationPrice', () => {
    for (const id of individualModules) {
      expect(watchtower[id].perLocationPrice).toBeGreaterThan(0);
    }
  });

  it('single watchtower module @ 1 location = basePrice', () => {
    for (const id of individualModules) {
      const result = calculateWatchtowerPrice([id], 1);
      expect(result.price).toBe(watchtower[id].basePrice);
    }
  });

  it('single watchtower module @ 5 locations = basePrice + 4 * perLocationPrice', () => {
    for (const id of individualModules) {
      const expected = watchtower[id].basePrice + 4 * watchtower[id].perLocationPrice;
      const result = calculateWatchtowerPrice([id], 5);
      expect(result.price).toBe(expected);
    }
  });
});

describe('Tier Hierarchy Invariants', () => {
  it('Report tier base prices increase: Lite < Plus < Pro', () => {
    expect(reportTiers.lite.basePrice).toBeLessThan(reportTiers.plus.basePrice);
    expect(reportTiers.plus.basePrice).toBeLessThan(reportTiers.pro.basePrice);
  });

  it('Report tier AI credits increase: Lite < Plus < Pro', () => {
    expect(reportTiers.lite.aiCredits.base).toBeLessThan(reportTiers.plus.aiCredits.base);
    expect(reportTiers.plus.aiCredits.base).toBeLessThan(reportTiers.pro.aiCredits.base);
  });

  it('Report tier AI seats increase: Lite < Plus < Pro', () => {
    expect(reportTiers.lite.aiSeats).toBeLessThan(reportTiers.plus.aiSeats);
    expect(reportTiers.plus.aiSeats).toBeLessThan(reportTiers.pro.aiSeats);
  });

  it('Report tier visuals increase: Lite < Plus <= Pro', () => {
    expect(reportTiers.lite.visuals).toBeLessThan(reportTiers.plus.visuals);
    expect(reportTiers.plus.visuals).toBeLessThanOrEqual(reportTiers.pro.visuals);
  });

  it('Core Lite base price < Core Pro base price', () => {
    expect(coreTiers.lite.basePrice).toBeLessThan(coreTiers.pro.basePrice);
  });

  it('Core tier AI credits increase: Lite < Pro', () => {
    expect(coreTiers.lite.aiCredits.base as number).toBeLessThan(coreTiers.pro.aiCredits.base as number);
  });

  it('Core tier AI seats increase: Lite < Pro', () => {
    expect(coreTiers.lite.aiSeats).toBeLessThan(coreTiers.pro.aiSeats);
  });
});

describe('Enterprise Pricing Structural Integrity', () => {
  it('enterprise volume tiers are sorted ascending by min locations', () => {
    const tiers = enterprisePricing.volumeDiscount.tiers;
    for (let i = 1; i < tiers.length; i++) {
      expect(tiers[i].min).toBeGreaterThan(tiers[i - 1].min);
    }
  });

  it('enterprise org license per-location tiers are sorted ascending', () => {
    const tiers = enterprisePricing.orgLicense.perLocationTiers;
    for (let i = 1; i < tiers.length; i++) {
      expect(tiers[i].min).toBeGreaterThan(tiers[i - 1].min);
    }
  });

  it('enterprise org license per-location price decreases with scale', () => {
    const tiers = enterprisePricing.orgLicense.perLocationTiers;
    for (let i = 1; i < tiers.length; i++) {
      expect(tiers[i].price).toBeLessThan(tiers[i - 1].price);
    }
  });

  it('enterprise minLocations matches CLIENT_TYPE_RULES enterprise range', () => {
    expect(enterprisePricing.minLocations).toBe(CLIENT_TYPE_RULES['enterprise'].locationRange[0]);
  });
});
