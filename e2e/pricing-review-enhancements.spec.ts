import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
const fixture = JSON.parse(readFileSync(new URL('../__tests__/fixtures/published-v1.8.2.json', import.meta.url), 'utf8'));
import { encodePricingIntent, type PricingIntent } from '../src/lib/pricingIntent';
import { supportedLocales } from '../src/lib/locales';
import { buyerReviewCopy, fillBuyerReviewCopy } from '../src/lib/buyerReviewCopy';
import { SELF_SERVE_EMPLOYEE_LIMIT } from '../src/lib/pricingIntent';

const base: PricingIntent = { v:2, layer:'core', corePackage:'core_foundation', locations:120, addOns:[], watchtowerModules:[], crewSkus:[], crossIntelligence:'none', billingCycle:'monthly', operatingModels:[], employees:null, payrollCountry:'' };
test.beforeEach(async ({page}) => {
  await page.route('**/api/pricing/catalog/active*', route => route.fulfill({json:fixture}));
  await page.addInitScript(() => localStorage.setItem('sundae_cookie_consent','declined'));
});

test('overview average follows the exact basket while cards round and explain the applied discount', async ({page}) => {
  await page.goto('/');
  await page.getByTestId('location-count').fill('120');
  const card = page.getByTestId('card-core_foundation');
  await expect(card.locator('.average-price-amount')).toHaveText('$127');
  await expect(card.locator('.plan-total')).toContainText('$15,290/mo');
  await expect(card).toContainText('Includes 5% volume discount');
  await expect(page.getByTestId('decision-total')).toHaveText('$15,290.25/mo');
  await expect(page.getByTestId('decision-average')).toContainText('Average $127.42 per location / month');
  const averageSize=await page.getByTestId('decision-average').locator('strong').evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  const totalSize=await page.getByTestId('decision-total').evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  expect(totalSize).toBeGreaterThan(averageSize);
  await page.getByRole('button',{name:'Refine this plan',exact:true}).click();
  await page.getByRole('button',{name:'Franchise network',exact:true}).click();
  const extension=page.locator('.extension-toggle').filter({hasText:'Franchise'});
  await expect(extension).toContainText('+$6,431.50/mo');
  await expect(extension).toContainText('Includes 5% volume discount');
  await extension.getByRole('checkbox').check();
  await expect(page.getByTestId('basket-total')).toHaveText('$21,721.75/mo');
  await page.getByTestId('commitment-details').locator('summary').click();
  await page.getByRole('button',{name:'Annual · paid upfront −12%',exact:true}).click();
  await expect(extension).toContainText('+$5,957.60/mo');
  await expect(extension).toContainText('Includes 12% subscription discount');
});

test('unavailable Starter has no price and setup guidance follows the selected Crew plan', async ({page}) => {
  await page.goto('/'); await page.getByTestId('location-count').fill('120');
  await page.getByTestId('pricing-tab-crew').click();
  const starter=page.getByTestId('card-lite');
  await expect(page.getByTestId('preset-lite')).toBeDisabled();
  await expect(starter).toContainText('Not available above 5 locations');
  await expect(starter.locator('.plan-price')).toHaveCount(0);
  await expect(page.getByTestId('setup-guide')).toContainText('Crew Operating self-service setup: $0');
  await expect(page.getByTestId('setup-guide')).toContainText('$1,500–$7,500');
  await expect(page.getByTestId('setup-guide')).toContainText('from $12,500');
  await expect(page.getByTestId('card-operating_suite')).toContainText('Add employee count');
  await page.getByRole('button',{name:'Add employee count to complete your estimate',exact:true}).click();
  await page.getByLabel('Unique employees across your locations').fill('2405');
  await expect(page.getByTestId('step-region')).toContainText('Additional employees');
  await page.getByRole('button',{name:/Choose your plan/}).click();
  await expect(page.getByTestId('card-operating_suite')).not.toContainText('Add employee count');
});

test('setup guidance follows the selected pricing rail', async ({page}) => {
  await page.goto('/');
  await expect(page.getByTestId('setup-guide')).toContainText('Core self-service setup: $0');
  await expect(page.getByTestId('setup-guide')).not.toContainText('Crew Starter');
  await page.getByTestId('pricing-tab-both').click();
  await expect(page.getByTestId('setup-guide')).toContainText('Core + Crew self-service setup: $0');
  await expect(page.getByTestId('setup-guide')).not.toContainText('Crew Starter');
  await page.getByTestId('pricing-tab-crew').click();
  await page.getByTestId('preset-operating_suite').click();
  await expect(page.getByTestId('setup-guide')).toContainText('Crew Operating self-service setup: $0');
  await expect(page.getByTestId('setup-guide')).not.toContainText('Crew Starter self-service setup');
});

test('combined buyers edit one card set at a time and retain the other selection', async ({page}) => {
  await page.goto('/'); await page.getByTestId('location-count').fill('3');
  await page.getByTestId('pricing-tab-both').click();
  await page.getByTestId('select-core_margin').click();
  await expect(page.locator('.plan-grid')).toHaveCount(1);
  await expect(page.locator('.other-plan-summary')).toContainText('Crew Operating');
  await page.getByTestId('edit-crew-plan').click();
  await expect(page.locator('.plan-grid')).toHaveCount(1);
  await expect(page.locator('.other-plan-summary')).toContainText('Core Margin');
  await page.getByTestId('preset-schedule_time').click();
  await page.getByTestId('edit-core-plan').click();
  await expect(page.getByTestId('select-core_margin')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.other-plan-summary')).toContainText('Schedule & Time');
  await expect(page.getByTestId('decision-total')).toHaveText('$2,487/mo');
  await expect(page.getByTestId('card-core_margin')).toContainText('Everything in Foundation, plus');
  await expect(page.getByTestId('card-core_performance')).toContainText('Everything in Margin and Growth, plus');
});

test('mobile keeps plan descriptions and a complete non-scrolling comparison', async ({page}) => {
  await page.setViewportSize({width:390,height:844}); await page.goto('/');
  await expect(page.locator('.plan-card:visible')).toHaveCount(1);
  await expect(page.locator('.plan-purpose:visible')).toContainText('See your profit');
  await page.getByTestId('mobile-core-plan').selectOption('core_performance');
  await expect(page.locator('.plan-purpose:visible')).toContainText('forecasting included');
  await page.getByTestId('plan-comparison-details').locator('summary').click();
  await page.getByTestId('comparison-plan').selectOption('core_performance');
  await expect(page.locator('.comparison-mobile')).toContainText('Purchasing Analytics');
  await expect(page.locator('.comparison-mobile')).toContainText('Guest CRM Intelligence');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('supported locales retain prices, localized notices and a usable mobile viewport', async ({page}) => {
  await page.setViewportSize({width:390,height:844}); await page.goto('/');
  await page.getByTestId('location-count').fill('120');
  for (const locale of supportedLocales) {
    await page.locator('header select').selectOption(locale);
    await expect(page.locator('.selection-memory')).toHaveText(buyerReviewCopy[locale].saved);
    await expect(page.locator('header select')).toHaveValue(locale);
    const browserAmount = await page.evaluate((value) => new Intl.NumberFormat(value.locale,{style:'currency',currency:'USD',maximumFractionDigits:2}).format(value.amount), { locale, amount: 15290.25 });
    await expect(page.getByTestId('decision-total')).toContainText(browserAmount);
    await expect(page.getByTestId('decision-average')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),locale).toBe(true);
    const names=await page.locator('header button').allTextContents();
    expect(names.join(' ')).toContain(buyerReviewCopy[locale].startOver);
  }
});

test('375px decision bar keeps the monthly total primary and the average readable', async ({page}) => {
  await page.setViewportSize({width:375,height:812});
  await page.goto('/');
  for (const locations of [8,120]) {
    await page.getByTestId('location-count').fill(String(locations));
    const total = page.getByTestId('decision-total');
    const average = page.getByTestId('decision-average');
    await expect(total).toBeVisible();
    await expect(average).toBeVisible();
    const totalBox = await total.boundingBox();
    const averageBox = await average.boundingBox();
    expect(totalBox && averageBox).toBeTruthy();
    expect(averageBox!.y).toBeGreaterThanOrEqual(totalBox!.y + totalBox!.height);
    const totalSize = await total.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    const averageSize = await average.locator('strong').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(totalSize).toBeGreaterThan(averageSize);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
});

test('Crew payroll uses a controlled country list and large workforces route to sales', async ({page}) => {
  await page.goto('/');
  await page.getByTestId('pricing-tab-crew').click();
  await page.getByTestId('preset-operating_suite').click();
  await page.getByRole('button',{name:'Refine this plan',exact:true}).click();
  const country = page.getByLabel('Payroll country',{exact:true});
  await expect(country.locator('option[value="ZZ"]')).toHaveCount(0);
  await expect(country.locator('option').filter({hasText:'Australia'})).toContainText('availability to confirm');
  await country.selectOption('US');
  await page.getByLabel('Unique employees across your locations').fill('100001');
  await expect(page.getByText('Contact Sales',{exact:true}).first()).toBeVisible();
  await expect(page.getByText('For teams above 100,000 employees',{exact:false})).toBeVisible();
});

test('eligibility and workforce safety notices follow all 25 selected languages', async ({page}) => {
  await page.setViewportSize({width:375,height:812});
  await page.goto(`/simulator?cfg=${encodePricingIntent({...base,locations:3,layer:'both',corePackage:'core_margin',crewSkus:['crew_operations','crew_scheduling','crew_tna','crew_payroll'],employees:100001,payrollCountry:'AU'})}`);
  await page.getByRole('button',{name:/Refine your needs/}).click();
  for (const locale of supportedLocales) {
    await page.locator('header select').selectOption(locale);
    const copy = buyerReviewCopy[locale];
    await expect(page.locator('.availability-note')).toHaveText(copy.watchtowerAvailability);
    await expect(page.locator('#payroll-country option[value="AU"]')).toContainText(copy.payrollAvailability);
    const workforceCount = await page.evaluate((value) => new Intl.NumberFormat(value.locale).format(value.count), { locale, count: SELF_SERVE_EMPLOYEE_LIMIT });
    await expect(page.locator('.enterprise-panel')).toContainText(fillBuyerReviewCopy(copy.largeWorkforce,{count: workforceCount}));
    await expect(page.getByTestId('setup-guide')).toContainText('Core + Crew');
    await expect(page.getByTestId('setup-guide')).not.toContainText('{product}');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),locale).toBe(true);
  }
});

test('header reviews the current plan and Start over removes remembered choices', async ({page}) => {
  await page.goto(`/simulator?cfg=${encodePricingIntent({...base,locations:3,corePackage:'core_growth',addOns:['concept_franchise'],operatingModels:['franchise']})}`);
  await page.getByRole('link',{name:'Pricing',exact:true}).first().click();
  await expect(page.locator('.selection-memory')).toContainText('saved in this browser');
  await page.getByRole('link',{name:'Review estimate',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Review your estimate',exact:true})).toBeVisible();
  await expect(page.getByTestId('basket-total')).toContainText('$3,190');
  await page.getByRole('button',{name:'Start over',exact:true}).click();
  await expect(page.getByTestId('location-count')).toHaveValue('1');
  await expect(page.getByTestId('decision-total')).toHaveText('$1,195/mo');
  await page.reload();
  await expect(page.getByTestId('decision-total')).toHaveText('$1,195/mo');
});

for (const plan of ['core_growth','core_performance'] as const) {
  test(`${plan} exposes and preserves Watchtower selections`, async ({page}) => {
    await page.goto(`/simulator?cfg=${encodePricingIntent({...base,locations:3,corePackage:plan})}`);
    await page.getByRole('button',{name:/Refine your needs/}).click();
    await page.getByRole('checkbox',{name:/^Add market intelligence(?: |$)/}).check();
    await page.getByRole('button',{name:'Review estimate',exact:true}).click();
    await expect(page.getByTestId('step-region')).toContainText('Watchtower Bundle');
  });
}

for (const mobile of [false,true]) {
  test(`${mobile ? 'mobile' : 'desktop'} buyer controls have accessible names and pass axe`, async ({page}) => {
    if(mobile) await page.setViewportSize({width:390,height:844});
    await page.goto('/'); await expect(page.getByTestId('decision-total')).toBeVisible();
    await page.getByTestId('pricing-tab-both').click();
    const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
    await page.getByRole('button',{name:'Refine this plan',exact:true}).press('Enter');
    await expect(page.getByTestId('step-region')).toBeFocused();
    const refine=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(refine.violations).toEqual([]);
  });
}
