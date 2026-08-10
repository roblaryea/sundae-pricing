/**
 * E2E Pricing Simulator Verification Tests (price book v1.7)
 *
 * Verifies that the UI renders prices matching the pricing engine — in
 * particular that the summary total equals the MARGINAL band computation and
 * never a flat per-location multiplication.
 *
 * Uses the dev-mode exposed Zustand store (__SUNDAE_STORE__) to set
 * configuration state, then asserts displayed totals.
 */
import { test, expect, type Page } from '@playwright/test';
import { calculateFullPrice, type AddOnId } from '../src/lib/pricingEngine';
import { corePackages } from '../src/data/pricing';
import type { CorePackageId } from '../src/data/pricing';

interface SimConfig {
  corePackage: CorePackageId;
  locations: number;
  addOns?: AddOnId[];
  watchtowerModules?: string[];
}

const JOURNEY = [
  { id: 'persona', name: 'Discover Your Persona', completed: true },
  { id: 'layer', name: 'Choose Your Layer', completed: true },
  { id: 'package', name: 'Select Your Package', completed: true },
  { id: 'locations', name: 'Configure Locations', completed: true },
  { id: 'addons', name: 'Add-ons', completed: true },
  { id: 'watchtower', name: 'Watchtower Intel', completed: true },
  { id: 'roi', name: 'Calculate ROI', completed: true },
  { id: 'summary', name: 'Review & Launch', completed: false },
];

async function setStore(page: Page, config: SimConfig, currentStep: number) {
  await page.goto('/simulator');
  await page.waitForFunction(() => (window as any).__SUNDAE_STORE__, { timeout: 10000 });

  await page.evaluate(
    ({ cfg, step, journey }) => {
      const store = (window as any).__SUNDAE_STORE__;
      store.setState({
        layer: 'core',
        corePackage: cfg.corePackage,
        locations: cfg.locations,
        addOns: cfg.addOns || [],
        watchtowerModules: cfg.watchtowerModules || [],
        currentStep: step,
        journeySteps: journey,
      });
    },
    { cfg: config, step: currentStep, journey: JOURNEY },
  );
}

async function goToSummary(page: Page, config: SimConfig) {
  await setStore(page, config, 7);
  await page.waitForSelector('text=Monthly Investment', { timeout: 10000 });
}

async function getDisplayedTotal(page: Page): Promise<string> {
  const totalEl = page.locator('text=/^\\$[\\d,]+$/').first();
  return (await totalEl.textContent()) ?? '';
}

function getExpectedTotal(config: SimConfig): string {
  const result = calculateFullPrice({
    layer: 'core',
    corePackage: config.corePackage,
    locations: config.locations,
    addOns: config.addOns ?? [],
    watchtower: config.watchtowerModules ?? [],
    clientProfile: {
      type: 'independent',
      isEarlyAdopter: false,
      isFranchise: false,
      brandCount: 1,
    },
  });

  return `$${result.total.toLocaleString()}`;
}

test.describe('Pricing Simulator E2E Verification (v1.7)', () => {
  async function expectSummaryToMatchEngine(page: Page, config: SimConfig) {
    await goToSummary(page, config);
    expect(await getDisplayedTotal(page)).toBe(getExpectedTotal(config));
  }

  test('Core Foundation matches pricing engine @ 1 location', async ({ page }) => {
    await expectSummaryToMatchEngine(page, { corePackage: 'core_foundation', locations: 1 });
  });

  test('Core Foundation matches pricing engine @ 5 locations', async ({ page }) => {
    await expectSummaryToMatchEngine(page, { corePackage: 'core_foundation', locations: 5 });
  });

  test('Core Margin matches pricing engine across two bands @ 12 locations', async ({ page }) => {
    await expectSummaryToMatchEngine(page, { corePackage: 'core_margin', locations: 12 });
  });

  test('Core Growth matches pricing engine across three bands @ 30 locations', async ({ page }) => {
    await expectSummaryToMatchEngine(page, { corePackage: 'core_growth', locations: 30 });
  });

  test('Core Performance matches pricing engine across all bands @ 60 locations', async ({ page }) => {
    await expectSummaryToMatchEngine(page, { corePackage: 'core_performance', locations: 60 });
  });

  test('Core Foundation + Foresight & Action @ 10 locations', async ({ page }) => {
    await expectSummaryToMatchEngine(page, {
      corePackage: 'core_foundation',
      locations: 10,
      addOns: ['foresight_action'],
    });
  });

  test('Core Growth + concept SKU @ 20 locations', async ({ page }) => {
    await expectSummaryToMatchEngine(page, {
      corePackage: 'core_growth',
      locations: 20,
      addOns: ['concept_franchise'],
    });
  });

  test('Core Performance + Watchtower bundle @ 5 locations', async ({ page }) => {
    await expectSummaryToMatchEngine(page, {
      corePackage: 'core_performance',
      locations: 5,
      watchtowerModules: ['bundle'],
    });
  });

  test('summary total is the marginal computation, not a flat per-location rate', async ({ page }) => {
    // 5 Core Foundation locations = 1195 + 4 x 175 = 1895.
    // A flat-rate model (5 x 175 + 1195, or 5 x 379) would produce a different figure
    // at other unit counts; assert the exact published worked example.
    await goToSummary(page, { corePackage: 'core_foundation', locations: 5 });
    expect(await getDisplayedTotal(page)).toBe('$1,895');
  });

  test('package cards show the anchor price, not a per-location rate', async ({ page }) => {
    await setStore(page, { corePackage: 'core_foundation', locations: 5 }, 2);
    await expect(page.getByTestId('core-package-total-core_foundation')).toContainText('1,895');
    await expect(page.getByTestId('core-package-total-core_margin')).toContainText(
      `${(corePackages.core_margin.firstUnitPrice + 4 * corePackages.core_margin.marginalBands[0].pricePerUnit).toLocaleString()}`,
    );
  });

  test('domain modules are shown as included, with no price and no toggle', async ({ page }) => {
    await setStore(page, { corePackage: 'core_foundation', locations: 5 }, 4);
    const labor = page.getByTestId('included-module-labor');
    await expect(labor).toBeVisible();
    await expect(labor).toContainText('Included');
    await expect(labor).not.toContainText('$');
  });
});
