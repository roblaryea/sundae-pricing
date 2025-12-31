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

console.log('🔍 Validating pricing data...\n');

// Report Lite FREE
check('reportTiers.lite.basePrice', 0, reportTiers.lite.basePrice);
check('reportTiers.lite.aiSeats', 1, reportTiers.lite.aiSeats);

// Report Plus corrections
check('reportTiers.plus.visuals', 120, reportTiers.plus.visuals);
check('reportTiers.plus.aiSeats', 3, reportTiers.plus.aiSeats);
check('reportTiers.plus.benchmarkRadius', '1-2km', reportTiers.plus.benchmarkRadius);

// Module prices
check('modules.labor.orgLicensePrice', 129, modules.labor.orgLicensePrice);
check('modules.inventory.orgLicensePrice', 129, modules.inventory.orgLicensePrice);
check('modules.inventory.perLocationPrice', 19, modules.inventory.perLocationPrice);
check('modules.purchasing.orgLicensePrice', 99, modules.purchasing.orgLicensePrice);
check('modules.purchasing.perLocationPrice', 15, modules.purchasing.perLocationPrice);

// Watchtower
check('watchtower.bundle.savingsPercent', 22, watchtower.bundle.savingsPercent);

// Client types
if (!CLIENT_TYPE_RULES['multi-site']) {
  errors.push("❌ CLIENT_TYPE_RULES['multi-site'] is undefined (wrong key?)");
}
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
