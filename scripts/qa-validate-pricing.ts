// QA Validation Script for Sundae Pricing Data
// Validates all pricing values against the Source of Truth (v5.1)

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
validate('Report Lite', 'aiCredits.base', 250, reportTiers.lite.aiCredits.base);
validate('Report Lite', 'aiCredits.perLocation', 80, reportTiers.lite.aiCredits.perLocation);
validate('Report Lite', 'visuals', 20, reportTiers.lite.visuals);

// Report Plus
validate('Report Plus', 'basePrice', 79, reportTiers.plus.basePrice);
validate('Report Plus', 'additionalLocationPrice', 39, reportTiers.plus.additionalLocationPrice);
validate('Report Plus', 'aiSeats', 3, reportTiers.plus.aiSeats);
validate('Report Plus', 'aiCredits.base', 1200, reportTiers.plus.aiCredits.base);
validate('Report Plus', 'aiCredits.perLocation', 300, reportTiers.plus.aiCredits.perLocation);
validate('Report Plus', 'visuals', 30, reportTiers.plus.visuals);
validate('Report Plus', 'benchmarkRadius', '1-2km adjustable', reportTiers.plus.benchmarkRadius);

// Report Pro
validate('Report Pro', 'basePrice', 159, reportTiers.pro.basePrice);
validate('Report Pro', 'additionalLocationPrice', 59, reportTiers.pro.additionalLocationPrice);
validate('Report Pro', 'aiSeats', 5, reportTiers.pro.aiSeats);
validate('Report Pro', 'aiCredits.base', 3500, reportTiers.pro.aiCredits.base);
validate('Report Pro', 'aiCredits.perLocation', 800, reportTiers.pro.aiCredits.perLocation);
validate('Report Pro', 'visuals', 80, reportTiers.pro.visuals);

// ═══════════════════════════════════════════════════════════════════════════
// CORE TIERS
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n⚡ VALIDATING CORE TIERS...\n');

// Core Lite
validate('Core Lite', 'basePrice', 279, coreTiers.lite.basePrice);
validate('Core Lite', 'additionalLocationPrice', 79, coreTiers.lite.additionalLocationPrice);
validate('Core Lite', 'aiSeats', 10, coreTiers.lite.aiSeats);
validate('Core Lite', 'aiCredits.base', 8000, coreTiers.lite.aiCredits.base);
validate('Core Lite', 'aiCredits.perLocation', 1600, coreTiers.lite.aiCredits.perLocation);
validate('Core Lite', 'customDashboards', 30, coreTiers.lite.customDashboards);

// Core Pro
validate('Core Pro', 'basePrice', 449, coreTiers.pro.basePrice);
validate('Core Pro', 'additionalLocationPrice', 89, coreTiers.pro.additionalLocationPrice);
validate('Core Pro', 'aiSeats', 15, coreTiers.pro.aiSeats);
validate('Core Pro', 'aiCredits.base', 14000, coreTiers.pro.aiCredits.base);
validate('Core Pro', 'aiCredits.perLocation', 2800, coreTiers.pro.aiCredits.perLocation);
validate('Core Pro', 'predictiveDays', 30, coreTiers.pro.predictiveDays);
validate('Core Pro', 'customDashboards', 75, coreTiers.pro.customDashboards);

// ═══════════════════════════════════════════════════════════════════════════
// MODULES (v5.1 — 10 modules with tier-aware pricing)
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n🧩 VALIDATING MODULES...\n');

// Labor
validate('Labor Module', 'orgLicensePrice', 219, modules.labor.orgLicensePrice);
validate('Labor Module', 'perLocationPrice', 22, modules.labor.perLocationPrice);
validate('Labor Module', 'setupFee', 399, modules.labor.setupFee);

// Inventory
validate('Inventory Module', 'orgLicensePrice', 229, modules.inventory.orgLicensePrice);
validate('Inventory Module', 'perLocationPrice', 24, modules.inventory.perLocationPrice);
validate('Inventory Module', 'setupFee', 499, modules.inventory.setupFee);

// Purchasing
validate('Purchasing Module', 'orgLicensePrice', 169, modules.purchasing.orgLicensePrice);
validate('Purchasing Module', 'perLocationPrice', 16, modules.purchasing.perLocationPrice);
validate('Purchasing Module', 'setupFee', 399, modules.purchasing.setupFee);

// Marketing
validate('Marketing Module', 'orgLicensePrice', 249, modules.marketing.orgLicensePrice);
validate('Marketing Module', 'perLocationPrice', 25, modules.marketing.perLocationPrice);
validate('Marketing Module', 'setupFee', 399, modules.marketing.setupFee);

// Reservations
validate('Reservations Module', 'orgLicensePrice', 169, modules.reservations.orgLicensePrice);
validate('Reservations Module', 'perLocationPrice', 16, modules.reservations.perLocationPrice);
validate('Reservations Module', 'setupFee', 399, modules.reservations.setupFee);

// Pulse (v5.1)
validate('Pulse Module', 'orgLicensePrice', 269, modules.pulse.orgLicensePrice);
validate('Pulse Module', 'perLocationPrice', 29, modules.pulse.perLocationPrice);
validate('Pulse Module', 'setupFee', 499, modules.pulse.setupFee);

// Profit Intelligence
validate('Profit Module', 'orgLicensePrice', 299, modules.profit.orgLicensePrice);
validate('Profit Module', 'perLocationPrice', 28, modules.profit.perLocationPrice);
validate('Profit Module', 'setupFee', 0, modules.profit.setupFee);

// Revenue Optimization
validate('Revenue Module', 'orgLicensePrice', 149, modules.revenue.orgLicensePrice);
validate('Revenue Module', 'perLocationPrice', 14, modules.revenue.perLocationPrice);
validate('Revenue Module', 'setupFee', 299, modules.revenue.setupFee);

// Delivery
validate('Delivery Module', 'orgLicensePrice', 219, modules.delivery.orgLicensePrice);
validate('Delivery Module', 'perLocationPrice', 22, modules.delivery.perLocationPrice);
validate('Delivery Module', 'setupFee', 499, modules.delivery.setupFee);

// Guest Experience
validate('Guest Module', 'orgLicensePrice', 149, modules.guest.orgLicensePrice);
validate('Guest Module', 'perLocationPrice', 14, modules.guest.perLocationPrice);
validate('Guest Module', 'setupFee', 299, modules.guest.setupFee);

// ═══════════════════════════════════════════════════════════════════════════
// WATCHTOWER
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n🔭 VALIDATING WATCHTOWER...\n');

// Watchtower uses base + per-location pricing model (v5.1)
validate('Watchtower', 'competitive.basePrice', 549, watchtower.competitive.basePrice);
validate('Watchtower', 'competitive.perLocationPrice', 69, watchtower.competitive.perLocationPrice);
validate('Watchtower', 'events.basePrice', 249, watchtower.events.basePrice);
validate('Watchtower', 'events.perLocationPrice', 39, watchtower.events.perLocationPrice);
validate('Watchtower', 'trends.basePrice', 299, watchtower.trends.basePrice);
validate('Watchtower', 'trends.perLocationPrice', 29, watchtower.trends.perLocationPrice);
validate('Watchtower', 'bundle.basePrice', 899, watchtower.bundle.basePrice);
validate('Watchtower', 'bundle.perLocationPrice', 109, watchtower.bundle.perLocationPrice);

// Verify bundle math (base prices only)
const individualBaseTotal = watchtower.competitive.basePrice + watchtower.events.basePrice + watchtower.trends.basePrice;
validate('Watchtower', 'individual base total = 1097', 1097, individualBaseTotal);
validate('Watchtower', 'bundle base savings math', individualBaseTotal - watchtower.bundle.basePrice, watchtower.bundle.baseSavings);

// ═══════════════════════════════════════════════════════════════════════════
// CLIENT TYPE RULES (v5.1 — non-stacking volume discounts)
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

// Validate discount tiers (v4.3)
validate('Client Types', 'independent.discountTier', 0, CLIENT_TYPE_RULES['independent']?.discountTier);
validate('Client Types', 'growth.discountTier', 5, CLIENT_TYPE_RULES['growth']?.discountTier);
validate('Client Types', 'multi-site.discountTier', 7, CLIENT_TYPE_RULES['multi-site']?.discountTier);

// ═══════════════════════════════════════════════════════════════════════════
// EARLY ADOPTER (legacy, kept for backward compat)
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
// Note: Core Pro is now ALWAYS more expensive than Lite (premium positioning)
// No break-even point exists anymore - this is intentional
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
