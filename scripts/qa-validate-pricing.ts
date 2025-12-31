// QA Validation Script for Sundae Pricing Data
// Validates all pricing values against the Source of Truth

import {
  reportTiers,
  coreTiers,
  modules,
  watchtower,
  CLIENT_TYPE_RULES,
  EARLY_ADOPTER_TERMS,
  enterprisePricing,
  BREAK_EVEN_POINTS
} from '../src/data/pricing';

interface ValidationResult {
  category: string;
  field: string;
  expected: any;
  actual: any;
  status: 'PASS' | 'FAIL' | 'WARN';
  message?: string;
}

const results: ValidationResult[] = [];

function validate(category: string, field: string, expected: any, actual: any) {
  const status = expected === actual ? 'PASS' : 'FAIL';
  results.push({ category, field, expected, actual, status });
}

// ═══════════════════════════════════════════════════════════════════════════
// REPORT TIERS
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n📊 VALIDATING REPORT TIERS...\n');

// Report Lite
validate('Report Lite', 'basePrice', 0, reportTiers.lite.basePrice);
validate('Report Lite', 'additionalLocationPrice', 0, reportTiers.lite.additionalLocationPrice);
validate('Report Lite', 'aiSeats', 1, reportTiers.lite.aiSeats);
validate('Report Lite', 'aiCredits.base', 40, reportTiers.lite.aiCredits.base);
validate('Report Lite', 'aiCredits.perLocation', 8, reportTiers.lite.aiCredits.perLocation);
validate('Report Lite', 'visuals', 20, reportTiers.lite.visuals);

// Report Plus
validate('Report Plus', 'basePrice', 49, reportTiers.plus.basePrice);
validate('Report Plus', 'additionalLocationPrice', 29, reportTiers.plus.additionalLocationPrice);
validate('Report Plus', 'aiSeats', 3, reportTiers.plus.aiSeats);
validate('Report Plus', 'aiCredits.base', 150, reportTiers.plus.aiCredits.base);
validate('Report Plus', 'aiCredits.perLocation', 30, reportTiers.plus.aiCredits.perLocation);
validate('Report Plus', 'visuals', 120, reportTiers.plus.visuals);
validate('Report Plus', 'benchmarkRadius', '1-2km', reportTiers.plus.benchmarkRadius);

// Report Pro
validate('Report Pro', 'basePrice', 99, reportTiers.pro.basePrice);
validate('Report Pro', 'additionalLocationPrice', 49, reportTiers.pro.additionalLocationPrice);
validate('Report Pro', 'aiSeats', 5, reportTiers.pro.aiSeats);
validate('Report Pro', 'aiCredits.base', 400, reportTiers.pro.aiCredits.base);
validate('Report Pro', 'aiCredits.perLocation', 80, reportTiers.pro.aiCredits.perLocation);
validate('Report Pro', 'visuals', 120, reportTiers.pro.visuals);

// ═══════════════════════════════════════════════════════════════════════════
// CORE TIERS
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n⚡ VALIDATING CORE TIERS...\n');

// Core Lite
validate('Core Lite', 'basePrice', 169, coreTiers.lite.basePrice);
validate('Core Lite', 'additionalLocationPrice', 49, coreTiers.lite.additionalLocationPrice);
validate('Core Lite', 'aiSeats', 5, coreTiers.lite.aiSeats);
validate('Core Lite', 'aiCredits.base', 800, coreTiers.lite.aiCredits.base);
validate('Core Lite', 'aiCredits.perLocation', 160, coreTiers.lite.aiCredits.perLocation);
validate('Core Lite', 'predictiveDays', 14, coreTiers.lite.predictiveDays);
validate('Core Lite', 'customDashboards', 3, coreTiers.lite.customDashboards);

// Core Pro
validate('Core Pro', 'basePrice', 299, coreTiers.pro.basePrice);
validate('Core Pro', 'additionalLocationPrice', 39, coreTiers.pro.additionalLocationPrice);
validate('Core Pro', 'aiSeats', 10, coreTiers.pro.aiSeats);
validate('Core Pro', 'aiCredits.base', 1400, coreTiers.pro.aiCredits.base);
validate('Core Pro', 'aiCredits.perLocation', 280, coreTiers.pro.aiCredits.perLocation);
validate('Core Pro', 'predictiveDays', 30, coreTiers.pro.predictiveDays);
validate('Core Pro', 'customDashboards', 15, coreTiers.pro.customDashboards);

// ═══════════════════════════════════════════════════════════════════════════
// MODULES
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n🧩 VALIDATING MODULES...\n');

// Labor
validate('Labor Module', 'orgLicensePrice', 129, modules.labor.orgLicensePrice);
validate('Labor Module', 'perLocationPrice', 19, modules.labor.perLocationPrice);
validate('Labor Module', 'includedLocations', 5, modules.labor.includedLocations);

// Inventory
validate('Inventory Module', 'orgLicensePrice', 129, modules.inventory.orgLicensePrice);
validate('Inventory Module', 'perLocationPrice', 19, modules.inventory.perLocationPrice);
validate('Inventory Module', 'includedLocations', 5, modules.inventory.includedLocations);

// Purchasing
validate('Purchasing Module', 'orgLicensePrice', 99, modules.purchasing.orgLicensePrice);
validate('Purchasing Module', 'perLocationPrice', 15, modules.purchasing.perLocationPrice);
validate('Purchasing Module', 'includedLocations', 5, modules.purchasing.includedLocations);

// Marketing
validate('Marketing Module', 'orgLicensePrice', 149, modules.marketing.orgLicensePrice);
validate('Marketing Module', 'perLocationPrice', 25, modules.marketing.perLocationPrice);

// Reservations
validate('Reservations Module', 'orgLicensePrice', 99, modules.reservations.orgLicensePrice);
validate('Reservations Module', 'perLocationPrice', 15, modules.reservations.perLocationPrice);

// ═══════════════════════════════════════════════════════════════════════════
// WATCHTOWER
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n🔭 VALIDATING WATCHTOWER...\n');

validate('Watchtower', 'competitive.price', 199, watchtower.competitive.price);
validate('Watchtower', 'events.price', 99, watchtower.events.price);
validate('Watchtower', 'trends.price', 149, watchtower.trends.price);
validate('Watchtower', 'bundle.price', 349, watchtower.bundle.price);
validate('Watchtower', 'bundle.savings', 98, watchtower.bundle.savings);
validate('Watchtower', 'bundle.savingsPercent', 22, watchtower.bundle.savingsPercent);

// Verify bundle math
const individualTotal = watchtower.competitive.price + watchtower.events.price + watchtower.trends.price;
validate('Watchtower', 'individual total = 447', 447, individualTotal);
validate('Watchtower', 'bundle savings math', individualTotal - watchtower.bundle.price, watchtower.bundle.savings);

// ═══════════════════════════════════════════════════════════════════════════
// CLIENT TYPE RULES
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n👥 VALIDATING CLIENT TYPE RULES...\n');

// Check multi-site key exists (hyphenated)
if (CLIENT_TYPE_RULES['multi-site']) {
  results.push({ 
    category: 'Client Types', 
    field: 'multi-site key exists', 
    expected: true, 
    actual: true, 
    status: 'PASS' 
  });
} else {
  results.push({ 
    category: 'Client Types', 
    field: 'multi-site key exists', 
    expected: true, 
    actual: false, 
    status: 'FAIL',
    message: 'Key should be "multi-site" (hyphenated), not "multiSite" (camelCase)'
  });
}

// Validate discount tiers
validate('Client Types', 'independent.discountTier', 0, CLIENT_TYPE_RULES['independent']?.discountTier);
validate('Client Types', 'growth.discountTier', 10, CLIENT_TYPE_RULES['growth']?.discountTier);
validate('Client Types', 'multi-site.discountTier', 15, CLIENT_TYPE_RULES['multi-site']?.discountTier);

// ═══════════════════════════════════════════════════════════════════════════
// EARLY ADOPTER
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n🌟 VALIDATING EARLY ADOPTER TERMS...\n');

validate('Early Adopter', 'discountPercent', 20, EARLY_ADOPTER_TERMS.discountPercent);
validate('Early Adopter', 'priceLockMonths', 24, EARLY_ADOPTER_TERMS.priceLockMonths);
validate('Early Adopter', 'extendedTrialDays', 30, EARLY_ADOPTER_TERMS.extendedTrialDays);
validate('Early Adopter', 'bonusCredits', 500, EARLY_ADOPTER_TERMS.bonusCredits);

// ═══════════════════════════════════════════════════════════════════════════
// ENTERPRISE PRICING
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n🏢 VALIDATING ENTERPRISE PRICING...\n');

validate('Enterprise', 'minLocations', 30, enterprisePricing.minLocations);

// ═══════════════════════════════════════════════════════════════════════════
// BREAK-EVEN POINTS
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n📍 VALIDATING BREAK-EVEN POINTS...\n');

validate('Break-Even', 'sundaeVsTenzo.locations', 3, BREAK_EVEN_POINTS?.sundaeVsTenzo?.locations);
validate('Break-Even', 'coreProVsLite.locations', 14, BREAK_EVEN_POINTS?.coreProVsLite?.locations);
validate('Break-Even', 'enterprise.locations', 30, BREAK_EVEN_POINTS?.enterprise?.locations);

// ═══════════════════════════════════════════════════════════════════════════
// PRINT RESULTS
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n' + '═'.repeat(80));
console.log('📋 VALIDATION RESULTS');
console.log('═'.repeat(80) + '\n');

const passed = results.filter(r => r.status === 'PASS');
const failed = results.filter(r => r.status === 'FAIL');
const warned = results.filter(r => r.status === 'WARN');

console.log(`✅ PASSED: ${passed.length}`);
console.log(`❌ FAILED: ${failed.length}`);
console.log(`⚠️  WARNINGS: ${warned.length}`);
console.log('');

if (failed.length > 0) {
  console.log('─'.repeat(80));
  console.log('❌ FAILURES:');
  console.log('─'.repeat(80));
  failed.forEach(r => {
    console.log(`\n[${r.category}] ${r.field}`);
    console.log(`  Expected: ${JSON.stringify(r.expected)}`);
    console.log(`  Actual:   ${JSON.stringify(r.actual)}`);
    if (r.message) console.log(`  Note:     ${r.message}`);
  });
}

if (warned.length > 0) {
  console.log('\n' + '─'.repeat(80));
  console.log('⚠️  WARNINGS:');
  console.log('─'.repeat(80));
  warned.forEach(r => {
    console.log(`\n[${r.category}] ${r.field}`);
    console.log(`  Expected: ${JSON.stringify(r.expected)}`);
    console.log(`  Actual:   ${JSON.stringify(r.actual)}`);
  });
}

console.log('\n' + '═'.repeat(80));

// Exit with error code if failures
if (failed.length > 0) {
  console.log('\n🚨 VALIDATION FAILED - See failures above\n');
  process.exit(1);
} else {
  console.log('\n✅ ALL VALIDATIONS PASSED\n');
  process.exit(0);
}
