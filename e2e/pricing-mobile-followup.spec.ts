import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { PAYROLL_COUNTRIES } from '../src/lib/pricingIntent';
import { supportedLocales } from '../src/lib/locales';
const fixture=JSON.parse(readFileSync(new URL('../__tests__/fixtures/published-policy-20261010.json',import.meta.url),'utf8'));
test.beforeEach(async({page})=>{
  await page.route('**/api/pricing/catalog/active*',r=>r.fulfill({json:fixture}));
  await page.addInitScript(()=>localStorage.setItem('sundae_cookie_consent','declined'));
});
for(const width of [320,375,390,1440]) test(`${width}px leads with the location average before and after scrolling`,async({page})=>{
  await page.setViewportSize({width,height:812});await page.goto('/');
  for(const n of [8,120]){
    await page.getByTestId('location-count').fill(String(n));
    for(const scroll of [false,true]){
      if(scroll)await page.locator('.pricing-notes.overview-notes').scrollIntoViewIfNeeded();
      const a=page.getByTestId('decision-average').locator('strong'),t=page.getByTestId('decision-total');
      await expect(a).toBeVisible();await expect(t).toBeVisible();
      expect(await a.evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThan(await t.evaluate(e=>parseFloat(getComputedStyle(e).fontSize)));
      const ab=await a.boundingBox(),tb=await t.boundingBox();expect(ab!.x+ab!.width).toBeLessThanOrEqual(tb!.x);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
  }
  await page.getByTestId('pricing-tab-both').click();
  await expect(page.getByTestId('other-plan-average')).toBeVisible();
  const other=page.locator('.other-plan-price');
  expect(await other.locator('strong').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThan(await other.locator('.plan-total').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)));
  await page.getByRole('button',{name:'Refine this plan',exact:true}).click();
  await expect(page.getByTestId('basket-average')).toBeVisible();
  expect(await page.getByTestId('basket-average').locator('strong').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThan(await page.getByTestId('basket-total').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)));
  await page.getByRole('button',{name:'Review estimate',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Review your estimate',exact:true})).toBeVisible();
  await expect(page.getByTestId('basket-average')).toBeVisible();
});
test('mobile payroll offers every covered country in each locale and carries GB through review',async({page})=>{
  await page.setViewportSize({width:375,height:812});await page.goto('/');
  await page.getByTestId('pricing-tab-crew').click();await page.getByTestId('preset-operating_suite').click();
  await page.getByRole('button',{name:'Refine this plan',exact:true}).click();const country=page.locator('#payroll-country');await expect(country).toBeVisible();
  for(const locale of supportedLocales){
    await page.locator('header select').selectOption(locale);
    expect(await country.locator('option').evaluateAll(es=>es.map(e=>(e as HTMLOptionElement).value).filter(Boolean).sort())).toEqual(PAYROLL_COUNTRIES.map(c=>c.code).sort());
    expect(await country.evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(16);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await page.locator('header select').selectOption('en');await country.selectOption('GB');
  await page.getByLabel('Unique employees across your locations').fill('40');
  await page.getByRole('button',{name:'Review estimate',exact:true}).click();await expect(page.locator('.scope-notes')).toContainText('United Kingdom');
});
