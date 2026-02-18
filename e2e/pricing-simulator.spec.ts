/**
 * E2E Pricing Simulator Verification Tests (v4.3)
 *
 * Verifies that the UI renders prices matching the pricing engine.
 * Uses the dev-mode exposed Zustand store (__SUNDAE_STORE__) to
 * set configuration state, then asserts displayed totals.
 */
import { test, expect, type Page } from '@playwright/test';

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

// ═══════════════════════════════════════════════════════════════════════════
// PRICING VERIFICATION SCENARIOS
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Pricing Simulator E2E Verification', () => {

  test('Report Lite @ 1 location = $0', async ({ page }) => {
    await goToSummary(page, { layer: 'report', tier: 'lite', locations: 1 });
    expect(await getDisplayedTotal(page)).toBe('$0');
  });

  test('Report Plus @ 5 locations = $159', async ({ page }) => {
    await goToSummary(page, { layer: 'report', tier: 'plus', locations: 5 });
    expect(await getDisplayedTotal(page)).toBe('$159');
  });

  test('Report Pro @ 10 locations = $434', async ({ page }) => {
    await goToSummary(page, { layer: 'report', tier: 'pro', locations: 10 });
    expect(await getDisplayedTotal(page)).toBe('$434');
  });

  test('Report Plus @ 20 locations = $534', async ({ page }) => {
    await goToSummary(page, { layer: 'report', tier: 'plus', locations: 20 });
    expect(await getDisplayedTotal(page)).toBe('$534');
  });

  test('Report Pro @ 50 locations = $1,834', async ({ page }) => {
    await goToSummary(page, { layer: 'report', tier: 'pro', locations: 50 });
    expect(await getDisplayedTotal(page)).toBe('$1,834');
  });

  test('Core Lite @ 5 locations = $355', async ({ page }) => {
    await goToSummary(page, { layer: 'core', tier: 'lite', locations: 5 });
    expect(await getDisplayedTotal(page)).toBe('$355');
  });

  test('Core Pro @ 10 locations = $664', async ({ page }) => {
    await goToSummary(page, { layer: 'core', tier: 'pro', locations: 10 });
    expect(await getDisplayedTotal(page)).toBe('$664');
  });

  test('Core Lite + Labor @ 10 locations = $804', async ({ page }) => {
    await goToSummary(page, {
      layer: 'core', tier: 'lite', locations: 10,
      modules: ['labor'],
    });
    expect(await getDisplayedTotal(page)).toBe('$804');
  });

  test('Core Pro + Watchtower bundle @ 5 locations = $1,504', async ({ page }) => {
    await goToSummary(page, {
      layer: 'core', tier: 'pro', locations: 5,
      watchtowerModules: ['bundle'],
    });
    expect(await getDisplayedTotal(page)).toBe('$1,504');
  });

  test('Core Lite + 3 modules @ 20 locations = $2,137', async ({ page }) => {
    await goToSummary(page, {
      layer: 'core', tier: 'lite', locations: 20,
      modules: ['labor', 'inventory', 'purchasing'],
    });
    expect(await getDisplayedTotal(page)).toBe('$2,137');
  });

  test('Core Pro + Watchtower Competitive @ 10 locations = $1,504', async ({ page }) => {
    await goToSummary(page, {
      layer: 'core', tier: 'pro', locations: 10,
      watchtowerModules: ['competitive'],
    });
    expect(await getDisplayedTotal(page)).toBe('$1,504');
  });

  test('Core Pro + all 3 Watchtower modules @ 10 = uses bundle pricing', async ({ page }) => {
    await goToSummary(page, {
      layer: 'core', tier: 'pro', locations: 10,
      watchtowerModules: ['competitive', 'events', 'trends'],
    });
    // When all 3 selected, auto-bundles: 699 + 9*79=1410
    // Core Pro: 664, WT Bundle: 1410 → 2074
    expect(await getDisplayedTotal(page)).toBe('$2,074');
  });

});
