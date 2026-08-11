/**
 * Pre-build gate: assert the shipped catalog matches approved price book v1.7.
 *
 * This runs on every `npm run build` (via `prebuild`). It is deliberately blunt:
 * a wrong number here reaches customers, so the script fails the build rather
 * than warning.
 */
import {
  corePackages,
  CORE_PACKAGE_IDS,
  CORE_DOMAIN_MODULE_IDS,
  conceptSkus,
  foresightAction,
  implementationClasses,
  crewSkus,
  crewBundles,
  billingDiscounts,
  DISCOUNT_RULES,
  ENTERPRISE_ONLY_FROM_UNITS,
  modules,
  getVolumeDiscount,
  RETIRED_CATALOG_IDS,
} from '../src/data/pricing';
import { calculateCorePackagePrice, calculateForesightActionPrice } from '../src/lib/pricingEngine';

const errors: string[] = [];

function check(name: string, expected: unknown, actual: unknown) {
  if (expected !== actual) {
    errors.push(`❌ ${name}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

console.log('🔍 Validating pricing data against price book v1.7...\n');

// ── Core packages: anchor + marginal bands ────────────────────────────────
const EXPECTED_PACKAGES: Record<string, { name: string; anchor: number; bands: number[]; wallet: number }> = {
  core_foundation: { name: 'Core Foundation', anchor: 1195, bands: [175, 150, 125, 105], wallet: 14000 },
  core_margin: { name: 'Core Margin', anchor: 1650, bands: [245, 210, 175, 145], wallet: 16000 },
  core_growth: { name: 'Core Growth', anchor: 1925, bands: [260, 225, 190, 155], wallet: 18000 },
  core_performance: { name: 'Core Performance', anchor: 2980, bands: [409, 348, 290, 236], wallet: 24000 },
};

check('CORE_PACKAGE_IDS.length', 4, CORE_PACKAGE_IDS.length);

for (const [id, spec] of Object.entries(EXPECTED_PACKAGES)) {
  const pkg = corePackages[id as keyof typeof corePackages];
  if (!pkg) {
    errors.push(`❌ corePackages.${id} is missing`);
    continue;
  }
  check(`${id}.name`, spec.name, pkg.name);
  check(`${id}.firstUnitPrice`, spec.anchor, pkg.firstUnitPrice);
  check(`${id}.aiCreditWallet`, spec.wallet, pkg.aiCreditWallet);
  check(`${id}.marginalBands.length`, 4, pkg.marginalBands.length);
  spec.bands.forEach((rate, index) => {
    check(`${id}.marginalBands[${index}].pricePerUnit`, rate, pkg.marginalBands[index]?.pricePerUnit);
  });
  // Bands must start at unit 2 — there is no included-location allowance.
  check(`${id}.marginalBands[0].fromUnit`, 2, pkg.marginalBands[0]?.fromUnit);
}

// ── The marginal mechanic itself ──────────────────────────────────────────
check('5 x Core Foundation total', 1895, calculateCorePackagePrice('core_foundation', 5));
check('5 x Core Foundation average', 379, calculateCorePackagePrice('core_foundation', 5) / 5);
check(
  '11 x Core Foundation is marginal, not retroactive',
  1195 + 9 * 175 + 150,
  calculateCorePackagePrice('core_foundation', 11),
);

// ── Foresight & Action ────────────────────────────────────────────────────
check('foresightAction.firstUnitPrice', 495, foresightAction.firstUnitPrice);
[65, 55, 45, 35].forEach((rate, index) => {
  check(`foresightAction.marginalBands[${index}]`, rate, foresightAction.marginalBands[index]?.pricePerUnit);
});
check('5 x Foresight & Action total', 755, calculateForesightActionPrice(5));

// ── Concepts ──────────────────────────────────────────────────────────────
const EXPECTED_CONCEPTS: Record<string, number> = {
  concept_franchise: 595,
  concept_hotel_fb: 395,
  concept_cloud_kitchen: 395,
  concept_catering: 349,
  concept_production: 595,
  concept_rental_commissary: 395,
};
for (const [id, price] of Object.entries(EXPECTED_CONCEPTS)) {
  check(`conceptSkus.${id}.monthlyPrice`, price, conceptSkus[id as keyof typeof conceptSkus]?.monthlyPrice);
}

// ── Implementation classes (charged once, highest class) ──────────────────
check('implementation.self_service', 0, implementationClasses.self_service.fee);
check('implementation.class_a', 1500, implementationClasses.class_a.fee);
check('implementation.class_b', 2500, implementationClasses.class_b.fee);
check('implementation.class_c', 7500, implementationClasses.class_c.fee);
check('implementation.class_d', 12500, implementationClasses.class_d.fee);
check('implementation.class_d.isFloor', true, implementationClasses.class_d.isFloor);

// ── Crew ──────────────────────────────────────────────────────────────────
const EXPECTED_CREW: Record<string, { name: string; price: number }> = {
  crew_lite: { name: 'Crew Starter', price: 99 },
  crew_scheduling: { name: 'Crew Schedule', price: 179 },
  crew_operations: { name: 'Crew Manage', price: 399 },
  crew_tna: { name: 'Crew Time', price: 99 },
  crew_payroll: { name: 'Crew Pay', price: 129 },
  crew_people_intelligence: { name: 'Crew People', price: 249 },
};
for (const [id, spec] of Object.entries(EXPECTED_CREW)) {
  const sku = crewSkus[id as keyof typeof crewSkus];
  check(`crewSkus.${id}.name`, spec.name, sku?.name);
  check(`crewSkus.${id}.orgLicensePrice`, spec.price, sku?.orgLicensePrice);
}
check('crewBundles.crew_schedule_time_bundle.basePrice', 249, crewBundles.crew_schedule_time_bundle.basePrice);
check('crewBundles.crew_suite_bundle.basePrice', 499, crewBundles.crew_suite_bundle.basePrice);
check('crewBundles.crew_complete_bundle.basePrice', 699, crewBundles.crew_complete_bundle.basePrice);

// Crew is a FLAT monthly price under v1.7 — no per-location adder, no
// included-location allowance, no per-SKU setup fee to sum, and no bundle
// discount percentage (bundle prices are named NET figures).
for (const [id, sku] of Object.entries(crewSkus)) {
  for (const forbidden of ['perLocationPrice', 'baseIncludesLocations', 'setupFee']) {
    if (forbidden in sku) {
      errors.push(
        `❌ crewSkus.${id}.${forbidden} exists — v1.7 prices Crew flat, with implementation charged once at the highest class`,
      );
    }
  }
}
for (const [id, bundle] of Object.entries(crewBundles)) {
  for (const forbidden of ['perLocationPrice', 'setupFee', 'discountPercent']) {
    if (forbidden in bundle) {
      errors.push(
        `❌ crewBundles.${id}.${forbidden} exists — v1.7 bundle prices are named NET prices, not a discount off components`,
      );
    }
  }
}

// ── Discounts ─────────────────────────────────────────────────────────────
check('volume @ 1', 0, getVolumeDiscount(1));
check('volume @ 49', 0, getVolumeDiscount(49));
check('volume @ 50', 2.5, getVolumeDiscount(50));
check('volume @ 99', 2.5, getVolumeDiscount(99));
check('volume @ 100', 5, getVolumeDiscount(100));
check('volume @ 199', 5, getVolumeDiscount(199));
check('volume @ 200', 7, getVolumeDiscount(200));
check('volume @ 249', 7, getVolumeDiscount(249));
check('ENTERPRISE_ONLY_FROM_UNITS', 250, ENTERPRISE_ONLY_FROM_UNITS);
check('billingDiscounts.annual', 10, billingDiscounts.annual);
check('billingDiscounts.two_year', 15, billingDiscounts.two_year);
// Price book v1.7 section 2.1: volume and billing cycle are MUTUALLY
// EXCLUSIVE — whichever is larger, never the sum. This asserted `true`, which
// is why the engine's additive rule survived: the guard was calibrated to the
// bug. A 240-location annual quote was promised 15% against a real 10%.
check('DISCOUNT_RULES.stackingAllowed', false, DISCOUNT_RULES.stackingAllowed);
check('DISCOUNT_RULES.maxDiscountPercent', 15, DISCOUNT_RULES.maxDiscountPercent);

// ── Domain modules must stay unpriced package components ──────────────────
check('CORE_DOMAIN_MODULE_IDS.length', 11, CORE_DOMAIN_MODULE_IDS.length);
for (const [id, module] of Object.entries(modules)) {
  for (const forbidden of [
    'orgLicensePrice',
    'perLocationPrice',
    'baseIncludesLocations',
    'setupFee',
    'pricingByTier',
  ]) {
    if (forbidden in module) {
      errors.push(
        `❌ modules.${id}.${forbidden} exists — domain modules are package components and must carry no price`,
      );
    }
  }
}

// ── Retired ids must not be sellable ──────────────────────────────────────
for (const retired of RETIRED_CATALOG_IDS) {
  if ((CORE_PACKAGE_IDS as string[]).includes(retired)) {
    errors.push(`❌ retired id "${retired}" is being offered as a Core package`);
  }
  if (retired in conceptSkus) {
    errors.push(`❌ retired id "${retired}" is being offered as a concept SKU`);
  }
}

console.log('');
if (errors.length === 0) {
  console.log('✅ All price book v1.7 validations passed!\n');
  process.exit(0);
} else {
  console.log(`Found ${errors.length} error(s):\n`);
  errors.forEach((e) => console.log('  ' + e));
  console.log('');
  process.exit(1);
}
