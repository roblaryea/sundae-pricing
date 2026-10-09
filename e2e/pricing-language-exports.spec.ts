import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import AxeBuilder from '@axe-core/playwright';
import { supportedLocales, localeDirection } from '../src/lib/locales';
import { getBuyerCopy } from '../src/lib/buyerCopy';
import { getBuyerJourneyCopy } from '../src/lib/buyerJourneyCopy';
import { getEstimatePrintLabel } from '../src/lib/basketPdf';
import { encodePricingIntent, type PricingIntent } from '../src/lib/pricingIntent';
const fixture=JSON.parse(readFileSync(new URL('../__tests__/fixtures/published-v1.8.2.json',import.meta.url),'utf8'));
const config: PricingIntent={v:2,layer:'both',corePackage:'core_growth',locations:3,addOns:[],watchtowerModules:['events'],crewSkus:['crew_operations','crew_scheduling','crew_tna','crew_payroll'],crossIntelligence:'none',billingCycle:'annual_quarterly',operatingModels:[],employees:72,payrollCountry:'AE'};
test.beforeEach(async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('sundae_cookie_consent','declined'));
  await page.route('**/api/pricing/catalog/active*',r=>r.fulfill({json:fixture}));
});

test('location question and buyer actions follow all 25 languages without English inheritance',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await page.goto(`/simulator?cfg=${encodePricingIntent(config)}`);
  for(const locale of supportedLocales) {
    await page.locator('header select').selectOption(locale);
    await expect(page.getByTestId('step-region').locator('h1')).toHaveText(getBuyerCopy(locale).review);
    await expect(page.getByRole('button',{name:getEstimatePrintLabel(locale),exact:true})).toBeVisible();
    await page.getByRole('button',{name:new RegExp(getBuyerCopy(locale).choose)}).first().click();
    await expect(page.locator('label[for="buyer-locations"]')).toHaveText(getBuyerJourneyCopy(locale).locationQuestion);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),locale).toBe(true);
    await page.getByRole('button',{name:new RegExp(getBuyerCopy(locale).review)}).first().click();
  }
});

for(const locale of ['fr','ru','ar','zh-Hans','hi','pap'] as const) test(`branded ${locale} print PDF preserves language, money and scope`,async({page})=>{
  await page.goto(`/simulator?lang=${locale}&cfg=${encodePricingIntent(config)}`);
  await expect(page.getByTestId('basket-total')).toBeVisible();
  const popup=page.waitForEvent('popup');
  await page.getByRole('button',{name:getEstimatePrintLabel(locale),exact:true}).click();
  const output=await popup;
  await output.waitForLoadState();
  await expect(output.locator('html')).toHaveAttribute('data-print-ready','true');
  await expect(output.locator('html')).toHaveAttribute('lang',locale);
  await expect(output.locator('html')).toHaveAttribute('dir',localeDirection[locale]);
  await expect(output.locator('h1')).toHaveText(getBuyerCopy(locale).review);
  await expect(output.locator('.sheet')).not.toContainText('Your monthly price');
  await expect(output.locator('.sheet')).toContainText(getBuyerCopy(locale).workforce);
  expect((await new AxeBuilder({page:output}).withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
  const bytes=await output.pdf({path:`/tmp/sundae-print-${locale}.pdf`,printBackground:true,preferCSSPageSize:true});
  const loadingTask=getDocument({data:new Uint8Array(bytes),useSystemFonts:true});
  const document=await loadingTask.promise;
  let text='';
  for(let n=1;n<=document.numPages;n++){
    const content=await(await document.getPage(n)).getTextContent();
    text+=content.items.map(item=>'str' in item?item.str:'').join(' ')+' ';
  }
  expect(text).not.toMatch(/v1\.8\.2|869b1bc6|Catalogue|catalogue/);
  expect(text).toContain('Sundae Technologies Inc');
  if(locale==='ru') expect(text.replace(/\s+/g,' ')).toContain('Проверьте расчёт');
  if(locale==='zh-Hans') expect(text.replace(/\s/g,'')).toContain(getBuyerCopy(locale).review);
  await output.screenshot({path:`/tmp/sundae-print-${locale}.png`,fullPage:true});
  expect(document.numPages).toBeLessThanOrEqual(3);
  await loadingTask.destroy();await output.close();
});

test('open estimates refresh the published curve automatically',async({page})=>{
  await page.clock.install();
  const revised=structuredClone(fixture);revised.tiers[0].locationBands[0][1]=2200;
  let updated=false;
  await page.unroute('**/api/pricing/catalog/active*');
  await page.route('**/api/pricing/catalog/active*',r=>r.fulfill({json:updated?revised:fixture}));
  await page.goto('/');
  await expect(page.getByTestId('decision-total')).toContainText('$1,195');
  updated=true;
  await page.clock.fastForward(60_000);
  await expect(page.getByTestId('decision-total')).toContainText('$2,200');
  await expect(page.getByTestId('card-core_foundation')).toContainText('$2,200');
});
