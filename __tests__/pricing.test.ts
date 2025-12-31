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
  it('Core Lite @ 5 locations = $365', () => {
    expect(calculateCorePrice('lite', 5).price).toBe(365); // 169 + 4*49
  });
  
  it('Core Pro @ 5 locations = $455', () => {
    expect(calculateCorePrice('pro', 5).price).toBe(455); // 299 + 4*39
  });
  
  it('Core Pro cheaper per-location at 14+ locations', () => {
    const lite14 = calculateCorePrice('lite', 14).price / 14;
    const pro14 = calculateCorePrice('pro', 14).price / 14;
    expect(pro14).toBeLessThanOrEqual(lite14);
  });
});

describe('Module Pricing', () => {
  it('Labor = $129 org license (not $99)', () => {
    expect(modules.labor.orgLicensePrice).toBe(129);
  });
  
  it('Labor @ 10 locations = $224', () => {
    expect(calculateModulePrice('labor', 10)).toBe(224); // 129 + 5*19
  });
  
  it('Inventory = $129 org, $19/extra (not $149/$25)', () => {
    expect(modules.inventory.orgLicensePrice).toBe(129);
    expect(modules.inventory.perLocationPrice).toBe(19);
  });
  
  it('Purchasing = $99 org, $15/extra (not $199/$49)', () => {
    expect(modules.purchasing.orgLicensePrice).toBe(99);
    expect(modules.purchasing.perLocationPrice).toBe(15);
  });
  
  it('Purchasing @ 10 locations = $174', () => {
    expect(calculateModulePrice('purchasing', 10)).toBe(174); // 99 + 5*15
  });
});

describe('Watchtower Pricing', () => {
  it('Bundle = $349', () => {
    expect(calculateWatchtowerPrice(['bundle']).price).toBe(349);
  });
  
  it('Individual total = $447', () => {
    expect(calculateWatchtowerPrice(['competitive', 'events', 'trends']).price).toBe(447);
  });
  
  it('Bundle saves $98 (22%, not 20%)', () => {
    expect(watchtower.bundle.savings).toBe(98);
    expect(watchtower.bundle.savingsPercent).toBe(22);
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
