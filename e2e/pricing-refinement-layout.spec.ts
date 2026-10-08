import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { encodePricingIntent, type PricingIntent } from '../src/lib/pricingIntent';
import { supportedLocales } from '../src/lib/locales';
import { getBuyerCopy } from '../src/lib/buyerCopy';

const fixture = JSON.parse(readFileSync(new URL('../__tests__/fixtures/published-v1.8.2.json', import.meta.url), 'utf8'));
const base: PricingIntent = { v:2, layer:'core', corePackage:'core_foundation', locations:3, addOns:[], watchtowerModules:[], crewSkus:[], crossIntelligence:'none', billingCycle:'monthly', operatingModels:[], employees:null, payrollCountry:'' };
test.beforeEach(async ({page}) => {
  await page.route('**/api/pricing/catalog/active*', route => route.fulfill({json:fixture}));
  await page.addInitScript(() => localStorage.setItem('sundae_cookie_consent','declined'));
});

test('payment disclosure keeps the choice visible and keyboard edits update review without resetting scope', async ({page}) => {
  await page.goto(`/simulator?cfg=${encodePricingIntent(base)}`);
  await page.getByRole('button',{name:/Refine your needs/}).click();
  const details=page.getByTestId('commitment-details');
  const summary=details.locator('summary');
  await expect(details).not.toHaveAttribute('open');
  await expect(summary).toContainText('Monthly · rolling');
  await expect(page.getByTestId('payment-term-annual_upfront')).not.toBeVisible();
  await expect(page.getByTestId('basket-total')).toHaveText('$1,545/mo');
  await summary.press('Enter');
  await expect(details).toHaveAttribute('open','');
  await page.getByTestId('payment-term-annual_upfront').press('Enter');
  await expect(page.getByTestId('selected-term')).toHaveText('Annual · paid upfront');
  await expect(summary).toContainText('Includes 12% subscription discount');
  await expect(page.getByTestId('basket-total')).toHaveText('$1,359.60/mo');
  await expect(page.locator('.payment-line')).toContainText('$16,315.20');
  await summary.press('Space');
  await expect(details).not.toHaveAttribute('open');
  await expect(summary).toBeFocused();
  await page.getByRole('button',{name:'Review estimate',exact:true}).click();
  await expect(page.getByTestId('basket-total')).toHaveText('$1,359.60/mo');
  await page.getByRole('button',{name:/Refine your needs/}).click();
  await expect(page.getByTestId('selected-term')).toHaveText('Annual · paid upfront');
  await expect(details).not.toHaveAttribute('open');
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  await details.locator('summary').click();
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
});

test('closed payment summary explains the applied volume discount when it exceeds the chosen term discount', async ({page}) => {
  await page.goto(`/simulator?cfg=${encodePricingIntent({...base,locations:200,billingCycle:'annual_quarterly'})}`);
  await page.getByRole('button',{name:/Refine your needs/}).click();
  const summary=page.getByTestId('commitment-details').locator('summary');
  await expect(summary).toContainText('Annual · paid quarterly');
  await expect(summary).toContainText('Includes 7% volume discount');
  await expect(summary).not.toContainText('5%');
  await expect(page.locator('.quote-aside')).toContainText(getBuyerCopy('en').intentNote);
  expect((await page.locator('.quote-aside').innerText()).split(getBuyerCopy('en').exclusions).length-1).toBe(1);
});

for (const [width,columns] of [[1440,3],[820,2],[390,2],[320,2]] as const) {
  test(`business choices stay readable at ${width}px and recommend without adding a charge`, async ({page}) => {
    await page.setViewportSize({width,height:900});
    await page.goto(`/simulator?cfg=${encodePricingIntent(base)}`);
    await page.getByRole('button',{name:/Refine your needs/}).click();
    const choices=page.locator('.model-options button');
    const first=await choices.first().boundingBox();
    const nextRow=await choices.nth(columns).boundingBox();
    for (let i=0;i<columns;i++) {
      const bounds=await choices.nth(i).boundingBox();
      expect(bounds!.y).toBeCloseTo(first!.y, 0);
      expect(bounds!.width).toBeGreaterThan(100);
    }
    expect(nextRow!.y).toBeGreaterThan(first!.y);
    await page.getByTestId('business-model-franchise').click();
    await expect(page.getByTestId('basket-total')).toHaveText('$1,545/mo');
    await expect(page.getByRole('checkbox',{name:/^Franchise(?: |$)/})).not.toBeChecked();
    await expect(page.getByTestId('setup-guide')).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    if(width===1440 || width===390) {
      await page.evaluate(()=>window.scrollTo(0,0));
      await page.screenshot({path:`docs/product/pricing/screenshots/refinement-compact-${width}.png`,fullPage:true});
    }
  });
}

test('mobile payment summary and expanded choices retain translated terms in every locale', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto(`/simulator?cfg=${encodePricingIntent({...base,billingCycle:'annual_upfront'})}`);
  await page.getByRole('button',{name:/Refine your needs/}).click();
  const details=page.getByTestId('commitment-details');
  for(const locale of supportedLocales) {
    await page.locator('header select').selectOption(locale);
    await expect(page.getByTestId('selected-term')).toHaveText(getBuyerCopy(locale).terms[2]);
    await details.locator('summary').click();
    await expect(page.getByTestId('payment-term-annual_upfront')).toHaveAttribute('aria-pressed','true');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),locale).toBe(true);
    await details.locator('summary').click();
  }
  await page.locator('header select').selectOption('ar');
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:'docs/product/pricing/screenshots/refinement-compact-ar.png',fullPage:true});
});
