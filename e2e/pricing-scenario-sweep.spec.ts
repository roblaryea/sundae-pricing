/**
 * A compact sweep over the buyer-visible pricing scenarios.
 *
 * This replaces the retired discovery-quiz walk and keeps the checks aligned
 * with the current three-step page: choose a rail, refine it, and review it.
 */
import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { encodePricingIntent, type PricingIntent } from '../src/lib/pricingIntent';

const fixture = JSON.parse(readFileSync(new URL('../__tests__/fixtures/published-v1.8.2.json', import.meta.url), 'utf8'));
const core: PricingIntent = {
  v: 2, layer: 'core', corePackage: 'core_foundation', locations: 1,
  addOns: [], watchtowerModules: [], crewSkus: [], crossIntelligence: 'none',
  billingCycle: 'monthly', operatingModels: [], employees: null, payrollCountry: '',
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/pricing/catalog/active*', (route) => route.fulfill({ json: fixture }));
  await page.addInitScript(() => localStorage.setItem('sundae_cookie_consent', 'declined'));
});

test('monthly totals and averages stay aligned at one, eight and 120 locations', async ({ page }) => {
  await page.goto('/');
  for (const locations of [1, 8, 120]) {
    await page.getByTestId('location-count').fill(String(locations));
    await expect(page.getByTestId('decision-total')).toBeVisible();
    if (locations === 1) {
      await expect(page.getByTestId('decision-average')).toHaveCount(0);
    } else {
      await expect(page.getByTestId('decision-average')).toContainText(`${locations} locations`);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
});

test('Crew Starter enforces its five-location limit and hides an unavailable price', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('pricing-tab-crew').click();
  await page.getByTestId('preset-lite').click();
  await page.getByTestId('location-count').fill('8');
  await page.getByTestId('location-count').press('Tab');
  await expect(page.getByTestId('location-count')).toHaveValue('5');
  await page.getByTestId('pricing-tab-core').click();
  await page.getByTestId('location-count').fill('8');
  await page.getByTestId('pricing-tab-crew').click();
  await expect(page.getByTestId('card-lite')).toContainText('Not available above 5 locations');
  await expect(page.getByTestId('card-lite').locator('.plan-price')).toHaveCount(0);
});

test('large Crew workforces become a sales conversation instead of a huge self-serve quote', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('pricing-tab-crew').click();
  await page.getByTestId('preset-operating_suite').click();
  await page.getByRole('button', { name: 'Refine this plan', exact: true }).click();
  await page.getByLabel('Unique employees across your locations').fill('100001');
  await expect(page.getByText('Contact Sales', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('For teams above 100,000 employees', { exact: false })).toBeVisible();
});

test('the Core handoff remains reopenable after the buyer reviews it', async ({ page }) => {
  await page.goto(`/simulator?cfg=${encodePricingIntent({ ...core, locations: 8, corePackage: 'core_growth' })}`);
  const firstTotal = await page.getByTestId('basket-total').innerText();
  await page.getByRole('button', { name: 'Copy configuration link', exact: true }).click();
  const link = await page.getByLabel('Copy this link', { exact: true }).inputValue();
  await page.goto(link);
  await expect(page.getByTestId('basket-total')).toHaveText(firstTotal);
});
