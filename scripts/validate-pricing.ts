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

console.log('🔍 Validating pricing data (v4.3)...\n');

// Report Lite FREE
check('reportTiers.lite.basePrice', 0, reportTiers.lite.basePrice);
check('reportTiers.lite.aiSeats', 1, reportTiers.lite.aiSeats);

// Report Plus (v4.3)
check('reportTiers.plus.basePrice', 59, reportTiers.plus.basePrice);
check('reportTiers.plus.additionalLocationPrice', 25, reportTiers.plus.additionalLocationPrice);
check('reportTiers.plus.visuals', 50, reportTiers.plus.visuals);
check('reportTiers.plus.aiSeats', 5, reportTiers.plus.aiSeats);
check('reportTiers.plus.benchmarkRadius', '1-2km adjustable', reportTiers.plus.benchmarkRadius);

// Report Pro (v4.3)
check('reportTiers.pro.basePrice', 119, reportTiers.pro.basePrice);
check('reportTiers.pro.additionalLocationPrice', 35, reportTiers.pro.additionalLocationPrice);
check('reportTiers.pro.aiSeats', 15, reportTiers.pro.aiSeats);

// Module prices (v4.3)
check('modules.labor.orgLicensePrice', 169, modules.labor.orgLicensePrice);
check('modules.inventory.orgLicensePrice', 179, modules.inventory.orgLicensePrice);
check('modules.inventory.perLocationPrice', 19, modules.inventory.perLocationPrice);
check('modules.purchasing.orgLicensePrice', 129, modules.purchasing.orgLicensePrice);
check('modules.purchasing.perLocationPrice', 12, modules.purchasing.perLocationPrice);

// Pulse module exists (v4.3 — 10th module)
check('modules.pulse.orgLicensePrice', 199, modules.pulse.orgLicensePrice);
check('modules.pulse.perLocationPrice', 24, modules.pulse.perLocationPrice);

// Watchtower (v4.3 — ~18% bundle savings)
check('watchtower.bundle.basePrice', 699, watchtower.bundle.basePrice);
check('watchtower.bundle.perLocationPrice', 79, watchtower.bundle.perLocationPrice);
check('watchtower.bundle.savingsPercent', 17, watchtower.bundle.savingsPercent);
check('watchtower.bundle.baseSavings', 148, watchtower.bundle.baseSavings);

// Client types (v4.3 volume discount tiers)
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
