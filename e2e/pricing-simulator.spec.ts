/**
 * E2E Pricing Simulator Verification Tests (v4.3)
 *
 * Verifies that the UI renders prices matching the pricing engine.
 * Uses the dev-mode exposed Zustand store (__SUNDAE_STORE__) to
 * set configuration state, then asserts displayed totals.
 */
import { test, expect, type Page } from '@playwright/test';
import { calculateFullPrice } from '../src/lib/pricingEngine';
import type { ModuleId } from '../src/data/pricing';

interface SimConfig {
  layer: 'report' | 'core';
  tier: string;
  locations: number;
  modules?: string[];
  watchtowerModules?: string[];
}

// Helper: navigate to /simulator, set state via exposed Zustand store, jump to summary
async function goToSummary(page: Page, config: SimConfig) {
  await page.goto('/simulator');

  // Wait for React + Zustand to mount
  await page.waitForFunction(() => (window as any).__SUNDAE_STORE__, { timeout: 10000 });

  // Set all config and navigate to summary step
  await page.evaluate((cfg) => {
    const store = (window as any).__SUNDAE_STORE__;
    store.setState({
      layer: cfg.layer,
      tier: cfg.tier,
      locations: cfg.locations,
      modules: cfg.modules || [],
      watchtowerModules: cfg.watchtowerModules || [],
      currentStep: 7,
      journeySteps: [
        { id: 'persona', name: 'Discover Your Persona', completed: true },
        { id: 'layer', name: 'Choose Your Layer', completed: true },
        { id: 'tier', name: 'Select Your Tier', completed: true },
        { id: 'locations', name: 'Configure Locations', completed: true },
        { id: 'modules', name: 'Add Modules', completed: true },
        { id: 'watchtower', name: 'Watchtower Intel', completed: true },
        { id: 'roi', name: 'Calculate ROI', completed: true },
        { id: 'summary', name: 'Review & Launch', completed: false },
      ],
    });
  }, config);

  // Wait for summary to render
  await page.waitForSelector('text=Monthly Investment', { timeout: 10000 });
}

// Helper: extract displayed monthly total
async function getDisplayedTotal(page: Page): Promise<string> {
  const totalEl = page.locator('text=/^\\$[\\d,]+$/').first();
  return (await totalEl.textContent()) ?? '';
}

function getExpectedTotal(config: SimConfig): string {
  const result = calculateFullPrice({
    layer: config.layer,
    tier: config.tier,
    locations: config.locations,
    modules: (config.modules ?? []) as ModuleId[],
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

// ═══════════════════════════════════════════════════════════════════════════
// PRICING VERIFICATION SCENARIOS
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Pricing Simulator E2E Verification', () => {
  async function expectSummaryToMatchEngine(page: Page, config: SimConfig) {
    await goToSummary(page, config);
    expect(await getDisplayedTotal(page)).toBe(getExpectedTotal(config));
  }

  test('Report Lite matches pricing engine @ 1 location', async ({ page }) => {
    await expectSummaryToMatchEngine(page, { layer: 'report', tier: 'lite', locations: 1 });
  });

  test('Report Plus matches pricing engine @ 5 locations', async ({ page }) => {
    await expectSummaryToMatchEngine(page, { layer: 'report', tier: 'plus', locations: 5 });
  });

  test('Report Pro matches pricing engine @ 10 locations', async ({ page }) => {
    await expectSummaryToMatchEngine(page, { layer: 'report', tier: 'pro', locations: 10 });
  });

  test('Report Plus matches pricing engine @ 20 locations', async ({ page }) => {
    await expectSummaryToMatchEngine(page, { layer: 'report', tier: 'plus', locations: 20 });
  });

  test('Report Pro matches pricing engine @ 50 locations', async ({ page }) => {
    await expectSummaryToMatchEngine(page, { layer: 'report', tier: 'pro', locations: 50 });
  });

  test('Core Lite matches pricing engine @ 5 locations', async ({ page }) => {
    await expectSummaryToMatchEngine(page, { layer: 'core', tier: 'lite', locations: 5 });
  });

  test('Core Pro matches pricing engine @ 10 locations', async ({ page }) => {
    await expectSummaryToMatchEngine(page, { layer: 'core', tier: 'pro', locations: 10 });
  });

  test('Core Lite + Labor matches pricing engine @ 10 locations', async ({ page }) => {
    await expectSummaryToMatchEngine(page, {
      layer: 'core', tier: 'lite', locations: 10,
      modules: ['labor'],
    });
  });

  test('Core Pro + Watchtower bundle matches pricing engine @ 5 locations', async ({ page }) => {
    await expectSummaryToMatchEngine(page, {
      layer: 'core', tier: 'pro', locations: 5,
      watchtowerModules: ['bundle'],
    });
  });

  test('Core Lite + 3 modules matches pricing engine @ 20 locations', async ({ page }) => {
    await expectSummaryToMatchEngine(page, {
      layer: 'core', tier: 'lite', locations: 20,
      modules: ['labor', 'inventory', 'purchasing'],
    });
  });

  test('Core Pro + Watchtower Competitive matches pricing engine @ 10 locations', async ({ page }) => {
    await expectSummaryToMatchEngine(page, {
      layer: 'core', tier: 'pro', locations: 10,
      watchtowerModules: ['competitive'],
    });
  });

  test('Core Pro + all 3 Watchtower modules uses bundle pricing from engine', async ({ page }) => {
    await expectSummaryToMatchEngine(page, {
      layer: 'core', tier: 'pro', locations: 10,
      watchtowerModules: ['competitive', 'events', 'trends'],
    });
  });

});
