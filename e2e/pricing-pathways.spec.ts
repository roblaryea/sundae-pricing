/**
 * Buyer paths through the current three-step pricing experience.
 *
 * This spec deliberately stays at the public pricing surface. The former
 * discovery-quiz journey was retired when the buyer flow was simplified; the
 * controls below are the paths a customer can use today.
 */
import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { encodePricingIntent, type PricingIntent } from '../src/lib/pricingIntent';

const fixture = JSON.parse(readFileSync(new URL('../__tests__/fixtures/published-v1.8.2.json', import.meta.url), 'utf8'));
const base: PricingIntent = {
  v: 2, layer: 'core', corePackage: 'core_foundation', locations: 3,
  addOns: [], watchtowerModules: [], crewSkus: [], crossIntelligence: 'none',
  billingCycle: 'monthly', operatingModels: [], employees: null, payrollCountry: '',
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/pricing/catalog/active*', (route) => route.fulfill({ json: fixture }));
  await page.addInitScript(() => localStorage.setItem('sundae_cookie_consent', 'declined'));
});

test('offers Core, Crew and Core + Crew once each', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('pricing-tab-core')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('pricing-tab-crew')).toHaveCount(1);
  await expect(page.getByTestId('pricing-tab-both')).toHaveCount(1);
  await expect(page.locator('.plan-card')).toHaveCount(4);
});

test('Core path reaches a review with a visible monthly investment', async ({ page }) => {
  await page.goto(`/simulator?cfg=${encodePricingIntent(base)}`);
  await expect(page.getByRole('heading', { name: 'Make the next step yours.', exact: true })).toBeVisible();
  await expect(page.getByTestId('basket-total')).toHaveText('$1,545/mo');
});

test('Crew path collects workforce inputs and reaches review', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('pricing-tab-crew').click();
  await page.getByTestId('preset-operating_suite').click();
  await page.getByRole('button', { name: 'Refine this plan', exact: true }).click();
  await page.getByLabel('Unique employees across your locations').fill('72');
  await page.getByRole('button', { name: 'Review estimate', exact: true }).click();
  await expect(page.getByTestId('basket-total')).toBeVisible();
  await expect(page.getByTestId('step-region')).toContainText('72');
});

test('Core + Crew lets the buyer edit one rail at a time and reviews the combined quote', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('pricing-tab-both').click();
  await page.getByTestId('select-core_margin').click();
  await expect(page.locator('.plan-grid')).toHaveCount(1);
  await page.getByTestId('edit-crew-plan').click();
  await page.getByTestId('preset-schedule_time').click();
  await page.getByTestId('edit-core-plan').click();
  await expect(page.getByTestId('select-core_margin')).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Refine this plan', exact: true }).click();
  await page.getByRole('button', { name: 'Review estimate', exact: true }).click();
  await expect(page.getByTestId('step-region')).toContainText('Core + Crew');
  await expect(page.getByTestId('basket-total')).toBeVisible();
});

test('Core handoff links carry the selected Core intent without Crew-only fields', async ({ page }) => {
  await page.goto(`/simulator?cfg=${encodePricingIntent({ ...base, employees: 1_000_000, payrollCountry: 'XX' })}`);
  await page.getByRole('button', { name: 'Copy configuration link', exact: true }).click();
  const input = page.getByLabel('Copy this link', { exact: true });
  await expect(input).toBeVisible();
  const cfg = new URL(await input.inputValue()).searchParams.get('cfg');
  expect(cfg).toBeTruthy();
  const raw = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(cfg!.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))));
  expect(raw).not.toHaveProperty('employees');
  expect(raw).not.toHaveProperty('payrollCountry');
});
