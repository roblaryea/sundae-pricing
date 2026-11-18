import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { encodePricingIntent, type PricingIntent } from '../src/lib/pricingIntent';
const fixture = JSON.parse(readFileSync(new URL('../__tests__/fixtures/published-policy-20261010.json', import.meta.url), 'utf8'));
const base: PricingIntent = {v:2,layer:'core',corePackage:'core_foundation',locations:3,addOns:[],watchtowerModules:[],crewSkus:[],crossIntelligence:'none',billingCycle:'monthly',operatingModels:[],employees:null,payrollCountry:''};
test.beforeEach(async ({page}) => {
  await page.route('**/api/pricing/catalog/active*', route => route.fulfill({json:fixture}));
  await page.addInitScript(() => localStorage.setItem('sundae_cookie_consent','declined'));
});

test('fresh overview asks for locations before showing any monetary values', async ({page}) => {
  await page.goto('/');
  await expect(page.getByTestId('location-count')).toHaveValue('');
  await expect(page.getByTestId('location-count')).toHaveAttribute('required','');
  await expect(page.getByTestId('location-gate-message')).toContainText('Enter your locations to see pricing');
  await expect(page.getByTestId('decision-total')).toHaveCount(0);
  for (const id of ['core_foundation','core_margin','core_growth','core_performance']) {
    await expect(page.getByTestId(`card-${id}`)).not.toContainText('$');
    await expect(page.getByTestId(`card-${id}`)).toContainText('Enter your locations to see pricing');
  }
  await expect(page.getByTestId('select-core_foundation')).toBeEnabled();
});

test('entering locations reveals the unchanged totals and per-location framing', async ({page}) => {
  await page.goto('/');
  await page.getByTestId('location-count').fill('3');
  await expect(page.getByTestId('decision-total')).toContainText('$1,545');
  await expect(page.getByTestId('decision-average')).toContainText('$515');
  await expect(page.getByTestId('card-core_foundation')).toContainText('$515');
  await expect(page.getByTestId('card-core_foundation')).toContainText('$1,545');
  await page.reload();
  await expect(page.getByTestId('decision-total')).toContainText('$1,545');
});

test('explicit simulator links remain immediately reviewable', async ({page}) => {
  await page.goto(`/simulator?lang=ar&cfg=${encodePricingIntent(base)}`);
  await expect(page.getByTestId('basket-total')).toContainText('1,545');
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
});

for (const rail of ['crew','both']) test(`${rail} browsing and custom capabilities do not leak prices before a footprint`, async ({page}) => {
  await page.goto('/');
  await page.getByTestId(`pricing-tab-${rail}`).click();
  if (rail === 'both') await page.getByTestId('edit-crew-plan').click();
  await page.locator('summary').filter({hasText:'Choose individual Crew capabilities'}).click();
  await page.locator('summary').filter({hasText:'One-time setup'}).click();
  await page.locator('.price-details > summary').click();
  await expect(page.locator('main')).not.toContainText('$');
  await expect(page.getByTestId('location-count')).toHaveValue('');
  await page.getByTestId('location-count').fill('3');
  await expect(page.getByTestId('decision-total')).toContainText(rail === 'crew' ? '$697' : '$2,242');
});

for (const invalid of ['0','-1','1.5','10001']) test(`invalid footprint ${invalid} cannot reveal the one-location default`, async ({page}) => {
  await page.goto('/');
  await page.getByTestId('location-count').fill(invalid);
  await page.getByTestId('location-count').press('Tab');
  await expect(page.getByTestId('decision-total')).toHaveCount(0);
  await expect(page.getByTestId('location-gate-message')).toBeVisible();
});

test('one location is valid, clearing hides pricing, and Start over reopens the gate', async ({page}) => {
  await page.goto('/');
  await page.getByTestId('location-count').fill('1');
  await expect(page.getByTestId('decision-total')).toContainText('$1,195');
  await page.getByTestId('location-count').fill('');
  await page.getByTestId('location-count').press('Tab');
  await expect(page.getByTestId('decision-total')).toHaveCount(0);
  await page.getByTestId('location-count').fill('3');
  await expect(page.getByTestId('decision-total')).toContainText('$1,545');
  await page.getByRole('button',{name:'Start over',exact:true}).click();
  await expect(page.getByTestId('location-count')).toHaveValue('');
  await expect(page.getByTestId('decision-total')).toHaveCount(0);
});

test('legacy multi-location returns retain their meaningful footprint', async ({page}) => {
  await page.addInitScript(saved => localStorage.setItem('sundae-pricing-config-v1-7',JSON.stringify({state:saved,version:2})), base);
  await page.goto('/');
  await expect(page.getByTestId('location-count')).toHaveValue('3');
  await expect(page.getByTestId('decision-total')).toContainText('$1,545');
});

test('an old automatically saved one-location default stays gated', async ({page}) => {
  await page.addInitScript(saved => localStorage.setItem('sundae-pricing-config-v1-7',JSON.stringify({state:saved,version:2})), {...base,locations:1});
  await page.goto('/');
  await expect(page.getByTestId('location-count')).toHaveValue('');
  await expect(page.getByTestId('decision-total')).toHaveCount(0);
});

test('entering a multi-digit count avoids a one-location price flash', async ({page}) => {
  await page.goto('/');
  await expect(page.getByTestId('location-gate-message')).toBeVisible();
  await page.evaluate(() => {
    const totals: string[] = [];
    Object.assign(window, { observedPricingTotals: totals });
    new MutationObserver(() => {
      const total = document.querySelector('[data-testid="decision-total"]')?.textContent;
      if (total) totals.push(total);
    }).observe(document.querySelector('main')!, { subtree: true, childList: true, characterData: true });
  });
  await page.getByTestId('location-count').fill('1');
  await page.getByTestId('location-count').pressSequentially('0',{delay:50});
  await expect(page.getByTestId('decision-total')).toContainText('$2,770');
  await expect(page.getByTestId('decision-average')).toContainText('$277');
  expect(await page.evaluate(() => (window as Window & { observedPricingTotals: string[] }).observedPricingTotals.some(total => total.includes('$1,195')))).toBe(false);
});

test('the plus control starts at one and replaces an invalid draft consistently', async ({page}) => {
  await page.goto('/');
  const locations = page.getByTestId('location-count');
  const plus = page.getByRole('button', {name:'How many locations? +', exact:true});
  await plus.click();
  await expect(locations).toHaveValue('1');
  await expect(page.getByTestId('decision-total')).toContainText('$1,195');
  await locations.fill('10000');
  await locations.fill('');
  await plus.click();
  await expect(locations).toHaveValue('1');
  await expect(page.getByTestId('decision-total')).toContainText('$1,195');
});

test('the existing simulator retains numeric normalization', async ({page}) => {
  await page.goto(`/simulator?cfg=${encodePricingIntent(base)}`);
  await page.locator('.buyer-progress button').first().click();
  const locations = page.getByTestId('location-count');
  await locations.fill(''); await locations.press('Tab');
  await expect(locations).toHaveValue('3');
  await locations.fill('3.9'); await locations.press('Enter');
  await expect(locations).toHaveValue('3');
});

test('the header review and card prompts focus the required existing field', async ({page}) => {
  await page.goto('/');
  await expect(page.getByTestId('location-gate-message')).toBeVisible();
  await page.locator('header').getByRole('link', {name:'Review estimate', exact:true}).click();
  await expect(page.getByTestId('location-count')).toBeFocused();
  await page.getByTestId('card-core_margin').getByRole('button', {name:'Enter your locations to see pricing'}).click();
  await expect(page.getByTestId('location-count')).toBeFocused();
  await expect(page.getByTestId('decision-total')).toHaveCount(0);
});

test('overview Review prompts for a footprint while shared reviews still work', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button',{name:'Review estimate',exact:true}).click();
  await expect(page.getByTestId('location-count')).toBeFocused();
  await expect(page).toHaveURL(/\/$/);
  await page.getByTestId('location-count').fill('3');
  await page.getByTestId('location-count').press('Enter');
  await page.getByRole('button',{name:'Review estimate',exact:true}).click();
  await expect(page.getByTestId('basket-total')).toContainText('$1,545');
});
