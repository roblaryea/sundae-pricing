#!/usr/bin/env npx tsx
/**
 * Pricing Audit Script (v4.3)
 *
 * Single command that validates all pricing data integrity:
 * - Runs pricing tests
 * - Scans for hard-coded prices in UI components
 * - Validates bundle math
 * - Validates entitlements match pricing model
 * - Optionally regenerates release notes
 * - Prints PASS/FAIL report
 *
 * Usage:
 *   npx tsx scripts/pricing_audit.ts
 *   npx tsx scripts/pricing_audit.ts --with-release-notes
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import {
  reportTiers,
  coreTiers,
  modules,
  watchtower,
  CLIENT_TYPE_RULES,
  EARLY_ADOPTER_TERMS,
  enterprisePricing,
  detectClientType,
} from '../src/data/pricing';

const REPORT_PATH = join(__dirname, '..', 'docs', 'product', 'pricing', 'PRICING_AUDIT_REPORT.md');
const withReleaseNotes = process.argv.includes('--with-release-notes');

interface AuditResult {
  category: string;
  check: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  detail?: string;
}

const results: AuditResult[] = [];

function pass(category: string, check: string, detail?: string) {
  results.push({ category, check, status: 'PASS', detail });
}

function fail(category: string, check: string, detail?: string) {
  results.push({ category, check, status: 'FAIL', detail });
}

function warn(category: string, check: string, detail?: string) {
  results.push({ category, check, status: 'WARN', detail });
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECK 1: Run pricing tests
// ═══════════════════════════════════════════════════════════════════════════

console.log('1/6 Running pricing tests...');
try {
  execSync('npx vitest run __tests__/pricing.test.ts', {
    cwd: join(__dirname, '..'),
    encoding: 'utf-8',
    timeout: 30000,
    stdio: 'pipe',
  });
  pass('Tests', 'Pricing test suite passes');
} catch (e: any) {
  fail('Tests', 'Pricing test suite', e.stdout?.slice(-500));
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECK 2: Run validation scripts
// ═══════════════════════════════════════════════════════════════════════════

console.log('2/6 Running validation scripts...');
try {
  execSync('npx tsx scripts/validate-pricing.ts', {
    cwd: join(__dirname, '..'),
    encoding: 'utf-8',
    timeout: 15000,
    stdio: 'pipe',
  });
  pass('Validation', 'Pre-build validation (validate-pricing.ts) passes');
} catch (e: any) {
  fail('Validation', 'Pre-build validation', e.stdout?.slice(-500));
}

try {
  execSync('npx tsx scripts/qa-validate-pricing.ts', {
    cwd: join(__dirname, '..'),
    encoding: 'utf-8',
    timeout: 15000,
    stdio: 'pipe',
  });
  pass('Validation', 'QA validation (qa-validate-pricing.ts) passes');
} catch (e: any) {
  fail('Validation', 'QA validation', e.stdout?.slice(-500));
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECK 3: Bundle math validation
// ═══════════════════════════════════════════════════════════════════════════

console.log('3/6 Validating bundle math...');

const individualBaseTotal =
  watchtower.competitive.basePrice +
  watchtower.events.basePrice +
  watchtower.trends.basePrice;

const individualPerLocTotal =
  watchtower.competitive.perLocationPrice +
  watchtower.events.perLocationPrice +
  watchtower.trends.perLocationPrice;

if (watchtower.bundle.individualBaseTotal === individualBaseTotal) {
  pass('Bundle Math', 'individualBaseTotal matches sum of individual base prices');
} else {
  fail('Bundle Math', 'individualBaseTotal mismatch',
    `Expected ${individualBaseTotal}, got ${watchtower.bundle.individualBaseTotal}`);
}

if (watchtower.bundle.baseSavings === individualBaseTotal - watchtower.bundle.basePrice) {
  pass('Bundle Math', 'baseSavings = individualTotal - bundlePrice');
} else {
  fail('Bundle Math', 'baseSavings mismatch');
}

if (watchtower.bundle.individualPerLocTotal === individualPerLocTotal) {
  pass('Bundle Math', 'individualPerLocTotal matches sum');
} else {
  fail('Bundle Math', 'individualPerLocTotal mismatch',
    `Expected ${individualPerLocTotal}, got ${watchtower.bundle.individualPerLocTotal}`);
}

if (watchtower.bundle.perLocSavings === individualPerLocTotal - watchtower.bundle.perLocationPrice) {
  pass('Bundle Math', 'perLocSavings = individualPerLocTotal - bundlePerLoc');
} else {
  fail('Bundle Math', 'perLocSavings mismatch');
}

const actualSavingsPercent = Math.round(
  (watchtower.bundle.baseSavings / watchtower.bundle.individualBaseTotal) * 100
);
if (actualSavingsPercent === watchtower.bundle.savingsPercent) {
  pass('Bundle Math', `Savings percent is ${actualSavingsPercent}% (~18%)`);
} else {
  fail('Bundle Math', 'savingsPercent mismatch',
    `Calculated ${actualSavingsPercent}%, stored ${watchtower.bundle.savingsPercent}%`);
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECK 4: Scan for hard-coded prices in UI
// ═══════════════════════════════════════════════════════════════════════════

console.log('4/6 Scanning for hard-coded prices...');

const KNOWN_HARDCODED_FILES = [
  'src/components/ConfigBuilder/LayerStack.tsx',
  'src/data/featureComparisons.ts',
  'src/components/Summary/PricingFAQ.tsx',
];

try {
  const grepResult = execSync(
    `grep -rn '\\$[0-9]' src/ --include='*.tsx' --include='*.ts' -l`,
    { cwd: join(__dirname, '..'), encoding: 'utf-8', stdio: 'pipe' }
  );
  const files = grepResult.trim().split('\n').filter(Boolean);

  // Filter out known acceptable files
  const ACCEPTABLE_FILES = new Set([
    ...KNOWN_HARDCODED_FILES,
    'src/data/pricing.ts',           // Source of truth
    'src/data/competitorPricing.ts',  // Competitor data (not Sundae pricing)
    'src/data/competitors.ts',        // Competitor data
    'src/config/pricingAssumptions.ts', // Market assumptions
    'src/lib/watchtowerValueScenarios.ts', // ROI value estimates
    'src/hooks/usePriceCalculation.ts', // Comments
    'src/components/Summary/CompactCompetitorCompare.tsx', // Regex pattern
  ]);

  const unexpected = files.filter(f => !ACCEPTABLE_FILES.has(f));

  if (unexpected.length === 0) {
    pass('Hard-coded Prices', 'No unexpected hard-coded dollar amounts in UI');
  } else {
    warn('Hard-coded Prices', 'Unexpected $ amounts found in files',
      unexpected.join(', '));
  }

  // Check known hard-coded files for sync
  for (const file of KNOWN_HARDCODED_FILES) {
    warn('Hard-coded Prices', `${file} contains hard-coded prices`,
      'Verify these match src/data/pricing.ts');
  }
} catch {
  pass('Hard-coded Prices', 'No hard-coded dollar amounts found in src/');
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECK 5: Entitlements/data model consistency
// ═══════════════════════════════════════════════════════════════════════════

console.log('5/6 Validating entitlements consistency...');

// Tier hierarchy: prices should increase
if (reportTiers.lite.basePrice < reportTiers.plus.basePrice &&
    reportTiers.plus.basePrice < reportTiers.pro.basePrice) {
  pass('Entitlements', 'Report tier prices increase Lite < Plus < Pro');
} else {
  fail('Entitlements', 'Report tier price hierarchy broken');
}

if (coreTiers.lite.basePrice < coreTiers.pro.basePrice) {
  pass('Entitlements', 'Core Lite < Core Pro base price');
} else {
  fail('Entitlements', 'Core tier price hierarchy broken');
}

// AI credits should increase with tier
if (reportTiers.lite.aiCredits.base < reportTiers.plus.aiCredits.base &&
    reportTiers.plus.aiCredits.base < reportTiers.pro.aiCredits.base) {
  pass('Entitlements', 'Report AI credits increase with tier');
} else {
  fail('Entitlements', 'Report AI credits hierarchy broken');
}

// AI seats should increase with tier
if (reportTiers.lite.aiSeats < reportTiers.plus.aiSeats &&
    reportTiers.plus.aiSeats < reportTiers.pro.aiSeats) {
  pass('Entitlements', 'Report AI seats increase with tier');
} else {
  fail('Entitlements', 'Report AI seats hierarchy broken');
}

// Client type detection boundaries (v4.3)
if (detectClientType(29) === 'independent' &&
    detectClientType(30) === 'growth' &&
    detectClientType(99) === 'growth' &&
    detectClientType(100) === 'multi-site' &&
    detectClientType(200) === 'multi-site' &&
    detectClientType(201) === 'enterprise') {
  pass('Entitlements', 'Client type detection boundaries correct (v4.3)');
} else {
  fail('Entitlements', 'Client type detection boundary mismatch');
}

// Enterprise threshold alignment
if (enterprisePricing.minLocations === CLIENT_TYPE_RULES['enterprise'].locationRange[0]) {
  pass('Entitlements', 'Enterprise min locations aligned across data sources');
} else {
  fail('Entitlements', 'Enterprise threshold mismatch',
    `enterprisePricing.minLocations=${enterprisePricing.minLocations}, CLIENT_TYPE_RULES=${CLIENT_TYPE_RULES['enterprise'].locationRange[0]}`);
}

// Module count (v4.3: 10 modules including Pulse)
const moduleKeys = Object.keys(modules);
if (moduleKeys.length === 10) {
  pass('Entitlements', 'All 10 modules present (including Pulse)');
} else {
  fail('Entitlements', `Expected 10 modules, found ${moduleKeys.length}`);
}

// All modules have 5 included locations
const allInclude5 = moduleKeys.every(k => modules[k as keyof typeof modules].includedLocations === 5);
if (allInclude5) {
  pass('Entitlements', 'All modules include 5 locations');
} else {
  fail('Entitlements', 'Not all modules include 5 locations');
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECK 6: Optionally regenerate release notes
// ═══════════════════════════════════════════════════════════════════════════

if (withReleaseNotes) {
  console.log('6/6 Regenerating release notes...');
  try {
    execSync('npx tsx scripts/release_notes.ts', {
      cwd: join(__dirname, '..'),
      encoding: 'utf-8',
      timeout: 30000,
      stdio: 'pipe',
    });
    pass('Release Notes', 'Release notes regenerated successfully');
  } catch (e: any) {
    warn('Release Notes', 'Could not regenerate release notes', e.message?.slice(0, 200));
  }
} else {
  console.log('6/6 Skipping release notes (use --with-release-notes to include)');
}

// ═══════════════════════════════════════════════════════════════════════════
// GENERATE REPORT
// ═══════════════════════════════════════════════════════════════════════════

const passed = results.filter(r => r.status === 'PASS');
const failed = results.filter(r => r.status === 'FAIL');
const warned = results.filter(r => r.status === 'WARN');

const overallStatus = failed.length === 0 ? 'PASS' : 'FAIL';
const today = new Date().toISOString().split('T')[0];

let report = `# Pricing Audit Report\n\n`;
report += `> Generated: ${today}\n\n`;
report += `## Overall Status: ${overallStatus === 'PASS' ? 'PASS' : 'FAIL'}\n\n`;
report += `| Metric | Count |\n`;
report += `|--------|-------|\n`;
report += `| Passed | ${passed.length} |\n`;
report += `| Failed | ${failed.length} |\n`;
report += `| Warnings | ${warned.length} |\n`;
report += `| Total Checks | ${results.length} |\n\n`;

if (failed.length > 0) {
  report += `## Failures\n\n`;
  for (const r of failed) {
    report += `- **[${r.category}]** ${r.check}`;
    if (r.detail) report += `\n  - ${r.detail}`;
    report += `\n`;
  }
  report += `\n`;
}

if (warned.length > 0) {
  report += `## Warnings\n\n`;
  for (const r of warned) {
    report += `- **[${r.category}]** ${r.check}`;
    if (r.detail) report += `\n  - ${r.detail}`;
    report += `\n`;
  }
  report += `\n`;
}

report += `## All Checks\n\n`;
report += `| Status | Category | Check |\n`;
report += `|--------|----------|-------|\n`;
for (const r of results) {
  const icon = r.status === 'PASS' ? 'PASS' : r.status === 'FAIL' ? 'FAIL' : 'WARN';
  report += `| ${icon} | ${r.category} | ${r.check} |\n`;
}
report += `\n`;

report += `## How to Run\n\n`;
report += `\`\`\`bash\n`;
report += `# Standard audit\n`;
report += `npm run pricing:audit\n\n`;
report += `# Full audit with release notes\n`;
report += `npm run pricing:audit:full\n\`\`\`\n`;

writeFileSync(REPORT_PATH, report, 'utf-8');

// Console output
console.log('\n' + '='.repeat(60));
console.log(`PRICING AUDIT: ${overallStatus}`);
console.log('='.repeat(60));
console.log(`  Passed:   ${passed.length}`);
console.log(`  Failed:   ${failed.length}`);
console.log(`  Warnings: ${warned.length}`);
console.log('='.repeat(60));

if (failed.length > 0) {
  console.log('\nFAILURES:');
  for (const r of failed) {
    console.log(`  [${r.category}] ${r.check}`);
    if (r.detail) console.log(`    ${r.detail}`);
  }
}

if (warned.length > 0) {
  console.log('\nWARNINGS:');
  for (const r of warned) {
    console.log(`  [${r.category}] ${r.check}`);
    if (r.detail) console.log(`    ${r.detail}`);
  }
}

console.log(`\nReport saved to: ${REPORT_PATH}`);
process.exit(failed.length > 0 ? 1 : 0);
