import {
  reportTiers,
  modules,
  watchtower,
  CLIENT_TYPE_RULES,
  enterprisePricing
} from '../src/data/pricing';

const errors: string[] = [];

function check(name: string, expected: any, actual: any) {
  if (expected !== actual) {
    errors.push(`❌ ${name}: expected ${expected}, got ${actual}`);
  }
}

console.log('🔍 Validating pricing data (v5.1)...\n');

// Report Lite FREE
check('reportTiers.lite.basePrice', 0, reportTiers.lite.basePrice);
check('reportTiers.lite.aiSeats', 1, reportTiers.lite.aiSeats);

// Report Plus (v5.1)
check('reportTiers.plus.basePrice', 79, reportTiers.plus.basePrice);
check('reportTiers.plus.additionalLocationPrice', 39, reportTiers.plus.additionalLocationPrice);
check('reportTiers.plus.visuals', 30, reportTiers.plus.visuals);
check('reportTiers.plus.aiSeats', 5, reportTiers.plus.aiSeats);
check('reportTiers.plus.benchmarkRadius', '1-2km adjustable', reportTiers.plus.benchmarkRadius);

// Report Pro (v5.1)
check('reportTiers.pro.basePrice', 159, reportTiers.pro.basePrice);
check('reportTiers.pro.additionalLocationPrice', 59, reportTiers.pro.additionalLocationPrice);
check('reportTiers.pro.aiSeats', 10, reportTiers.pro.aiSeats);

// Module prices (v5.1 — Core Pro defaults)
check('modules.labor.orgLicensePrice', 219, modules.labor.orgLicensePrice);
check('modules.inventory.orgLicensePrice', 229, modules.inventory.orgLicensePrice);
check('modules.inventory.perLocationPrice', 24, modules.inventory.perLocationPrice);
check('modules.purchasing.orgLicensePrice', 169, modules.purchasing.orgLicensePrice);
check('modules.purchasing.perLocationPrice', 16, modules.purchasing.perLocationPrice);

// Pulse module (v5.1 — Core Pro default)
check('modules.pulse.orgLicensePrice', 269, modules.pulse.orgLicensePrice);
check('modules.pulse.perLocationPrice', 29, modules.pulse.perLocationPrice);

// Watchtower (v5.1 — ~18% bundle savings)
check('watchtower.bundle.basePrice', 899, watchtower.bundle.basePrice);
check('watchtower.bundle.perLocationPrice', 109, watchtower.bundle.perLocationPrice);
check('watchtower.bundle.savingsPercent', 18, watchtower.bundle.savingsPercent);
check('watchtower.bundle.baseSavings', 198, watchtower.bundle.baseSavings);

// Client types (v5.1 volume discount tiers)
if (!CLIENT_TYPE_RULES['multi-site']) {
  errors.push("❌ CLIENT_TYPE_RULES['multi-site'] is undefined (wrong key?)");
}
check('independent.discountTier', 0, CLIENT_TYPE_RULES['independent']?.discountTier);
check('growth.discountTier', 5, CLIENT_TYPE_RULES['growth']?.discountTier);
check('multi-site.discountTier', 7, CLIENT_TYPE_RULES['multi-site']?.discountTier);
check('enterprise.locationRange[0]', 30, CLIENT_TYPE_RULES['enterprise'].locationRange[0]);

// Results
console.log('');
if (errors.length === 0) {
  console.log('✅ All pricing validations passed!\n');
  process.exit(0);
} else {
  console.log(`Found ${errors.length} error(s):\n`);
  errors.forEach(e => console.log('  ' + e));
  console.log('');
  process.exit(1);
}
