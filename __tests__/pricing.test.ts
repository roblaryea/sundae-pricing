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
  modules, 
  watchtower, 
  CLIENT_TYPE_RULES, 
  EARLY_ADOPTER_TERMS,
  enterprisePricing 
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
  
  it('Report Plus @ 5 locations = $165', () => {
    expect(calculateReportPrice('plus', 5).price).toBe(165); // 49 + 4*29
  });
  
  it('Report Plus has 3 AI seats, 120 visuals, 1-2km radius', () => {
    expect(reportTiers.plus.aiSeats).toBe(3);
    expect(reportTiers.plus.visuals).toBe(120);
    expect(reportTiers.plus.benchmarkRadius).toBe('1-2km');
  });
  
  it('Report Pro @ 10 locations = $540', () => {
    expect(calculateReportPrice('pro', 10).price).toBe(540); // 99 + 9*49
  });
});

describe('Core Tier Pricing', () => {
  it('Core Lite @ 5 locations = $385', () => {
    expect(calculateCorePrice('lite', 5).price).toBe(385); // 169 + 4*54
  });
  
  it('Core Pro @ 5 locations = $515', () => {
    expect(calculateCorePrice('pro', 5).price).toBe(515); // 319 + 4*49
  });
  
  it('Core Pro total cost ALWAYS higher (premium positioning)', () => {
    // Pro should always cost more in total (premium tier)
    const lite5 = calculateCorePrice('lite', 5).price;
    const pro5 = calculateCorePrice('pro', 5).price;
    expect(pro5).toBeGreaterThan(lite5); // 515 > 385
    
    const lite14 = calculateCorePrice('lite', 14).price;
    const pro14 = calculateCorePrice('pro', 14).price;
    expect(pro14).toBeGreaterThan(lite14); // 1021 > 871
    
    // Note: Pro becomes better per-location value at scale (intended)
    // This is fine - premium tier should reward scale
  });
});

describe('Module Pricing', () => {
  it('Labor = $139 org license (optimized pricing)', () => {
    expect(modules.labor.orgLicensePrice).toBe(139);
  });
  
  it('Labor @ 10 locations = $234', () => {
    expect(calculateModulePrice('labor', 10)).toBe(234); // 139 + 5*19
  });
  
  it('Inventory = $139 org, $19/extra (optimized)', () => {
    expect(modules.inventory.orgLicensePrice).toBe(139);
    expect(modules.inventory.perLocationPrice).toBe(19);
  });
  
  it('Purchasing = $119 org, $15/extra (optimized)', () => {
    expect(modules.purchasing.orgLicensePrice).toBe(119);
    expect(modules.purchasing.perLocationPrice).toBe(15);
  });
  
  it('Purchasing @ 10 locations = $194', () => {
    expect(calculateModulePrice('purchasing', 10)).toBe(194); // 119 + 5*15
  });
});

describe('Watchtower Pricing (New Base + Per-Location Model)', () => {
  it('Bundle @ 1 location = $720 base', () => {
    expect(calculateWatchtowerPrice(['bundle'], 1).price).toBe(720);
  });
  
  it('Bundle @ 5 locations = $1,048', () => {
    expect(calculateWatchtowerPrice(['bundle'], 5).price).toBe(1048); // 720 + 4*82
  });
  
  it('Individual modules @ 1 location calculated correctly', () => {
    const result = calculateWatchtowerPrice(['competitive', 'events', 'trends'], 1);
    // When selecting all 3 individual modules, returns bundle price + shows savings
    expect(result.price).toBe(720); // Automatically gets bundle price
    expect(result.savings).toBe(127); // Shows what you're saving vs individual
  });
  
  it('Bundle data shows 15% savings', () => {
    expect(watchtower.bundle.savingsPercent).toBe(15);
    expect(watchtower.bundle.baseSavings).toBe(127); // 847 - 720
  });
});

describe('Discount Stacking', () => {
  it('Growth discount = 10%', () => {
    const r = applyDiscounts(1000, { 
      type: 'growth', 
      isEarlyAdopter: false, 
      isFranchise: false, 
      brandCount: 1 
    });
    expect(r.total).toBe(900);
  });
  
  it('Multi-site discount = 15%', () => {
    const r = applyDiscounts(1000, { 
      type: 'multi-site', 
      isEarlyAdopter: false, 
      isFranchise: false, 
      brandCount: 1 
    });
    expect(r.total).toBe(850);
  });
  
  it('Enterprise gets no percentage discount', () => {
    const r = applyDiscounts(1000, { 
      type: 'enterprise', 
      isEarlyAdopter: false, 
      isFranchise: false, 
      brandCount: 1 
    });
    expect(r.total).toBe(1000);
  });
  
  it('Growth + Early Adopter stack: 1000 → 900 → 720', () => {
    const r = applyDiscounts(1000, { 
      type: 'growth', 
      isEarlyAdopter: true, 
      isFranchise: false, 
      brandCount: 1 
    });
    expect(r.total).toBe(720);
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
    expect(CLIENT_TYPE_RULES['multi-site'].discountTier).toBe(15);
  });
  
  it('Early adopter terms correct', () => {
    expect(EARLY_ADOPTER_TERMS.discountPercent).toBe(20);
    expect(EARLY_ADOPTER_TERMS.bonusCredits).toBe(500);
  });
});
