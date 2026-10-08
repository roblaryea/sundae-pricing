import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
const fixture = JSON.parse(readFileSync(new URL('../__tests__/fixtures/published-v1.8.2.json', import.meta.url), 'utf8'));
import { encodePricingIntent, decodePricingIntent, type PricingIntent } from '../src/lib/pricingIntent';
const base: PricingIntent = {v:2,layer:'core',corePackage:'core_foundation',locations:3,addOns:[],watchtowerModules:[],crewSkus:[],crossIntelligence:'none',billingCycle:'monthly',operatingModels:[],employees:null,payrollCountry:''};
test.beforeEach(async ({ page }, testInfo) => {
  await page.route('**/api/pricing/catalog/active*',(route) => route.fulfill({json:fixture}));
  if(!testInfo.title.startsWith('mobile ')) await page.addInitScript(() => localStorage.setItem('sundae_cookie_consent','declined'));
});
for (const [id, price] of [['core_foundation','$1,545'],['core_margin','$2,140'],['core_growth','$2,445'],['core_performance','$3,798']] as const) {
  test(`${id} carries its actual selection from overview to review`, async ({page}) => {
    await page.goto('/'); await page.getByTestId('location-count').fill('3');
    await page.getByTestId(`select-${id}`).click();
    await page.getByRole('button',{name:'Review estimate',exact:true}).click();
    await expect(page.getByTestId('basket-total')).toContainText(price);
    await expect(page.getByTestId('step-region')).toContainText(id.replace('core_','').replace(/^./,(c) => c.toUpperCase()));
  });
}
test('franchise refinement is relevant, optional and explicitly priced',async ({page}) => {
  await page.goto('/'); await page.getByTestId('location-count').fill('3');
  await page.getByRole('button',{name:'Refine this plan',exact:true}).click();
  await page.getByRole('button',{name:'Franchise network',exact:true}).click();
  await expect(page.getByTestId('basket-total')).toContainText('$1,545');
  await page.getByRole('checkbox',{name:/^Franchise(?: |$)/}).check();
  await expect(page.getByTestId('basket-total')).toContainText('$2,290');
  await page.getByRole('button',{name:'Review estimate',exact:true}).click();
  await expect(page.getByTestId('basket-total')).toContainText('$2,290');
  await expect(page.locator('summary').filter({hasText:'Explore the value case'})).toBeVisible();
});
test('Crew-only base estimate collects headcount without double charging bundle components',async ({page}) => {
  await page.goto('/'); await page.getByTestId('pricing-tab-crew').click();
  await page.getByTestId('location-count').fill('3'); await page.getByTestId('preset-operating_suite').click();
  await page.getByRole('button',{name:'Refine this plan',exact:true}).click();
  await expect(page.getByTestId('basket-total')).toContainText('$697');
  await page.getByLabel('Unique employees across your locations').fill('65');
  await page.getByLabel('Payroll country',{exact:true}).fill('AE');
  await page.getByRole('button',{name:'Review estimate',exact:true}).click();
  await expect(page.getByTestId('basket-total')).toContainText('$712');
  await expect(page.getByTestId('step-region')).toContainText('60 employees included');
  await expect(page.getByTestId('step-region')).toContainText('AE');
});
test('Both uses one estate and one basket with the selected term',async ({page}) => {
  await page.goto('/'); await page.getByTestId('pricing-tab-both').click();
  await page.getByTestId('location-count').fill('3'); await page.getByTestId('select-core_margin').click();
  await page.getByRole('button',{name:'Refine this plan',exact:true}).click();
  await expect(page.getByTestId('basket-total')).toContainText('$2,837');
  await page.getByRole('button',{name:'Annual · paid upfront'}).click();
  await page.getByRole('button',{name:'Review estimate',exact:true}).click();
  await expect(page.getByTestId('basket-total')).toContainText('$2,496.56');
  await expect(page.getByTestId('step-region')).toContainText('$29,958.72');
});
test('the account and demo CTAs carry the exact reviewed intent and download produces a PDF',async ({page}) => {
  const cfg: PricingIntent = {...base,layer:'both',corePackage:'core_growth',watchtowerModules:['events'],addOns:['concept_franchise'],crewSkus:['crew_operations','crew_scheduling','crew_payroll'],employees:72,payrollCountry:'AE',billingCycle:'annual_quarterly'};
  await page.goto(`/simulator?cfg=${encodePricingIntent(cfg)}`);
  await expect(page.getByTestId('basket-total')).toBeVisible();
  await expect(page.getByTestId('step-region')).not.toContainText('v1.8.2');
  const demo = new URL((await page.getByRole('link',{name:'Book Demo',exact:true}).last().getAttribute('href'))!);
  const received = decodePricingIntent(demo.searchParams.get('cfg')!);
  expect(received).toMatchObject(cfg);
  expect(received?.catalogue).toBeUndefined();
  expect(demo.searchParams.has('email')).toBe(false);
  const account = new URL((await page.getByRole('link',{name:'Continue to Sundae'}).getAttribute('href'))!);
  const returned = new URL(account.searchParams.get('returnUrl')!,'https://sundae.io');
  expect(decodePricingIntent(returned.searchParams.get('cfg')!)).toMatchObject(cfg);
  const download = page.waitForEvent('download');
  await page.getByRole('button',{name:'Download PDF',exact:true}).click();
  const pdf = await download; expect(pdf.suggestedFilename()).toMatch(/Sundae-estimate-3-locations.pdf/);
  await pdf.saveAs('/tmp/sundae-buyer-estimate.pdf');
  const bytes = readFileSync((await pdf.path())!);
  expect(bytes.subarray(0,5).toString()).toBe('%PDF-');
  const parsedPdf=await getDocument({data:new Uint8Array(bytes),useSystemFonts:true}).promise;
  let extracted='';
  for(let i=1;i<=parsedPdf.numPages;i++) {
    const pdfPage=await parsedPdf.getPage(i);
    const content=await pdfPage.getTextContent();
    extracted+=content.items.map(item=>'str' in item ? item.str : '').join(' ')+' ';
  }
  expect(extracted).toContain('Core Growth');
  expect(extracted).toContain('Event & Calendar Signals');
  expect(extracted).toContain('AVERAGE PER LOCATION / MONTH');
  expect(extracted).toContain('$1,346.43');
  expect(extracted).toContain('TOTAL MONTHLY INVESTMENT');
  expect(extracted).not.toMatch(/v1\.8\.2|869b1bc6|Catalogue|catalogue/);
  expect(extracted).toContain('Sundae Technologies Inc.');
  expect(extracted).toContain('$12,117.90');
  expect(extracted).toContain('12-month subscription, paid every 3 months');
  expect(extracted).toContain('Your plan includes 60');
  expect(extracted).toContain('Additional employees: 12');
  expect(extracted).toContain('United Arab Emirates (AE)');
  expect(extracted).toContain('Charges above those limits are not included');
  expect(extracted).toContain('Setup will be confirmed separately');
  expect(extracted).not.toMatch(/\bslots\b|\bobjects?\b|\bprorated\b|\bstatutory\b|\bactivation\b/i);
  expect(bytes.toString('latin1')).toContain('/FontFile2');
  const amount = (await page.getByTestId('basket-total').innerText()).match(/\$[\d,]+(?:\.\d{2})?/)![0];
  expect(extracted).toContain(amount);
});
test('diversified buyers choose specialist scope explicitly and can edit it backwards', async ({page}) => {
  await page.goto('/'); await page.getByTestId('location-count').fill('8');
  await page.getByRole('button',{name:'Refine this plan',exact:true}).click();
  await page.getByRole('button',{name:'Diversified group',exact:true}).click();
  await page.getByRole('button',{name:'Hotel F&B',exact:true}).click();
  await page.getByRole('button',{name:'Cloud kitchen',exact:true}).click();
  await expect(page.getByTestId('basket-total')).toContainText('$2,420');
  await page.getByRole('checkbox',{name:/^Hotel F&B(?: |$)/}).check();
  await page.getByRole('checkbox',{name:/^Cloud Kitchen(?: |$)/}).check();
  const selected = await page.getByTestId('basket-total').innerText();
  await page.getByRole('button',{name:'Review estimate',exact:true}).click();
  await expect(page.getByTestId('basket-total')).toHaveText(selected);
  await page.getByRole('button',{name:/Refine your needs/}).click();
  await expect(page.getByRole('checkbox',{name:/^Hotel F&B(?: |$)/})).toBeChecked();
  await page.getByRole('checkbox',{name:/^Cloud Kitchen(?: |$)/}).uncheck();
  await page.getByRole('button',{name:'Review estimate',exact:true}).click();
  await expect(page.getByTestId('basket-total')).not.toHaveText(selected);
});
test('branded exports handle simple, dense and Enterprise scopes without internal identifiers', async ({page}) => {
  const cases: [string,PricingIntent][] = [
    ['core',{...base,locations:1}],
    ['dense',{...base,locations:249,layer:'both',corePackage:'core_growth',addOns:['foresight_action','concept_franchise','concept_hotel_fb','concept_cloud_kitchen','concept_catering','concept_production','concept_rental_commissary'],watchtowerModules:['bundle'],crossIntelligence:'pro',crewSkus:['crew_operations','crew_scheduling','crew_tna','crew_payroll','crew_people_intelligence'],employees:6000,payrollCountry:'AE',billingCycle:'two_year_upfront'}],
    ['enterprise',{...base,locations:250}],
    ['crew-unknown',{...base,layer:'crew',crewSkus:['crew_operations','crew_scheduling','crew_payroll']}],
    ['enterprise-crew',{...base,locations:250,layer:'crew',crewSkus:['crew_operations','crew_scheduling','crew_payroll'],employees:6000,payrollCountry:'AE'}],
  ];
  for(const [name,cfg] of cases){
    await page.goto(`/simulator?cfg=${encodePricingIntent(cfg)}`);
    await expect(page.getByTestId('basket-total')).toBeVisible();
    const download=page.waitForEvent('download');
    await page.getByRole('button',{name:'Download PDF',exact:true}).click();
    const pdf=await download; await pdf.saveAs(`/tmp/sundae-estimate-${name}.pdf`);
    const loadingTask=getDocument({data:new Uint8Array(readFileSync((await pdf.path())!)),useSystemFonts:true});
    const parsed=await loadingTask.promise;
    let text='';
    for(let n=1;n<=parsed.numPages;n++){
      const content=await (await parsed.getPage(n)).getTextContent();
      const pageText=content.items.map(item=>'str' in item?item.str:'').join(' ');
      expect(pageText).toContain('YOUR SUBSCRIPTION ESTIMATE');
      expect(pageText).toContain('Sundae Technologies Inc.');
      text+=pageText+' ';
    }
    expect(text).not.toMatch(/v1\.8\.2|869b1bc6|Catalogue|catalogue/);
    expect(text).toContain(`${cfg.locations} ${cfg.locations===1?'location':'locations'}`);
    if(cfg.locations>=250) {
      expect(text).toContain('CUSTOM PROPOSAL');
      expect(text).not.toMatch(/\$[\d,]+/);
      expect(text).not.toContain('Average');
    }
    else expect(text).toContain((await page.getByTestId('basket-total').innerText()).match(/\$[\d,]+(?:\.\d{2})?/)![0]);
    if(cfg.locations===1) expect(text).not.toContain('Average');
    if(name==='crew-unknown') expect(text).toContain('Extra employee charges are not included until you enter your employee count');
    if(name==='enterprise-crew') expect(text).toContain('Included employees and any extra employee charges will be confirmed in your proposal');
    await loadingTask.destroy();
  }
});
test('Watchtower individual choices, bundle and package prerequisite stay coherent', async ({page}) => {
  await page.goto('/'); await page.getByTestId('select-core_growth').click();
  await page.getByRole('button',{name:'Refine this plan',exact:true}).click();
  await page.locator('summary').filter({hasText:/^Watchtower$/}).click();
  const choices = page.locator('details').filter({has:page.locator('summary').filter({hasText:/^Watchtower$/})});
  await choices.getByRole('checkbox').nth(1).check();
  await expect(choices.getByRole('checkbox').nth(1)).toBeChecked();
  await page.getByRole('button',{name:'Review estimate',exact:true}).click();
  await expect(page.getByTestId('step-region')).toContainText('Event & Calendar Signals');
  await page.getByRole('button',{name:/Refine your needs/}).click();
  await page.getByRole('checkbox',{name:/^Add market intelligence/}).check();
  await page.locator('summary').filter({hasText:/^Watchtower$/}).click();
  await expect(choices.getByRole('checkbox').nth(0)).toBeChecked();
  await choices.getByRole('checkbox').nth(2).uncheck();
  await expect(page.getByRole('checkbox',{name:/^Add market intelligence/})).not.toBeChecked();
  await choices.getByRole('checkbox').nth(2).check();
  await expect(page.getByRole('checkbox',{name:/^Add market intelligence/})).toBeChecked();
  await expect(page.getByTestId('basket-total')).toContainText('$2,824');
  await page.getByRole('button',{name:/Choose your plan/}).click();
  await page.getByTestId('select-core_foundation').click();
  await page.getByRole('button',{name:/Review your estimate/}).click();
  await expect(page.getByTestId('basket-total')).toContainText('$1,195');
});
test('calculation details expose reached bands, optional schedule, discount and setup policy', async ({page}) => {
  await page.goto('/'); await page.getByTestId('location-count').fill('8');
  await page.locator('summary').filter({hasText:'How your price is calculated'}).click();
  const details = page.locator('.price-details');
  await expect(details).toContainText('You receive whichever saving is greater');
  await expect(details).toContainText('The maximum saving is 20%');
  await expect(details).toContainText('You pay one setup fee, based on the most involved setup you need');
  await expect(details).toContainText('7 × $175');
  await expect(details.locator('details')).not.toHaveAttribute('open','');
  await details.getByText('View the full location price list',{exact:true}).click();
  await expect(details).toContainText('Locations 151–250');
});
test('returning visitors retain their edited ROI assumptions after a reload', async ({page}) => {
  await page.goto(`/simulator?cfg=${encodePricingIntent(base)}`);
  await page.locator('summary').filter({hasText:'Explore the value case'}).click();
  const slider = page.locator('input[type=range]').first();
  await slider.fill('250000');
  await page.reload();
  await page.getByRole('button',{name:/Review your estimate/}).click();
  await page.locator('summary').filter({hasText:'Explore the value case'}).click();
  await expect(page.locator('input[type=range]').first()).toHaveValue('250000');
});
test('numeric edges and Starter cap keep the visible scope and reviewed quote aligned', async ({page}) => {
  await page.goto('/'); const locations=page.getByTestId('location-count');
  await locations.fill('3'); await locations.fill(''); await locations.press('Tab');
  await expect(locations).toHaveValue('3');
  await locations.fill('3.9'); await locations.press('Enter'); await expect(locations).toHaveValue('3');
  await page.getByTestId('pricing-tab-crew').click(); await page.getByTestId('preset-lite').click();
  await locations.fill('7'); await locations.press('Tab'); await expect(locations).toHaveValue('5');
  await page.getByRole('button',{name:'Review estimate',exact:true}).click();
  await expect(page.getByTestId('step-region')).toContainText('5 locations');
});
test('share clipboard fallback produces a reopenable exact configuration', async ({page}) => {
  await page.addInitScript(() => Object.defineProperty(navigator,'clipboard',{value:{writeText:async () => { throw new Error('blocked'); }},configurable:true}));
  const cfg={...base,layer:'both' as const,corePackage:'core_margin' as const,crewSkus:['crew_operations','crew_scheduling','crew_tna','crew_payroll'] as PricingIntent['crewSkus'],employees:65,payrollCountry:'ZZ',billingCycle:'annual_quarterly' as const};
  await page.goto(`/simulator?cfg=${encodePricingIntent(cfg)}`);
  const total=await page.getByTestId('basket-total').innerText();
  await page.getByRole('button',{name:'Copy configuration link',exact:true}).click();
  const link=await page.getByLabel('Copy this link',{exact:true}).inputValue();
  expect(decodePricingIntent(new URL(link).searchParams.get('cfg')!)).toMatchObject(cfg);
  await page.goto(link); await expect(page.getByTestId('basket-total')).toHaveText(total);
  await expect(page.getByTestId('step-region')).toContainText('confirm payroll availability, local legal requirements and setup for your country');
});
test('clipboard success is announced and its link can be opened in a fresh context', async ({page,context,browser}) => {
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto(`/simulator?cfg=${encodePricingIntent(base)}`);
  await page.getByRole('button',{name:'Copy configuration link',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('Link copied');
  const link=await page.evaluate(() => navigator.clipboard.readText());
  const fresh=await browser.newContext(); const receiver=await fresh.newPage();
  await receiver.route('**/api/pricing/catalog/active*',(route) => route.fulfill({json:fixture}));
  await receiver.goto(link); await expect(receiver.getByTestId('basket-total')).toContainText('$1,545');
  await fresh.close();
});
test('consent granted at review records the visible stage once and covers later refinements', async ({page}) => {
  await page.addInitScript(() => localStorage.removeItem('sundae_cookie_consent'));
  await page.route('**/src/lib/analytics.ts*', route => route.fulfill({contentType:'application/javascript',body:`
    export const initAnalyticsIfConsented = () => {};
    export function trackPricingEvent(event, properties={}) {
      if(localStorage.getItem('sundae_cookie_consent')!=='accepted')return false;
      (window.__pricingEvents ??= []).push({event,properties}); return true;
    }
  `}));
  await page.goto(`/simulator?cfg=${encodePricingIntent(base)}`);
  await expect(page.getByTestId('basket-total')).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as {__pricingEvents?:unknown[]}).__pricingEvents ?? [])).toEqual([]);
  await page.getByRole('button',{name:'Accept',exact:true}).click();
  const events = () => page.evaluate(() => (window as unknown as {__pricingEvents:{event:string;properties:Record<string,unknown>}[]}).__pricingEvents);
  await expect.poll(async () => (await events()).filter(x=>x.event==='quote_reviewed').length).toBe(1);
  await page.getByRole('button',{name:/Refine your needs/}).click();
  await page.getByRole('button',{name:'Franchise network',exact:true}).click();
  await page.getByRole('checkbox',{name:/^Franchise(?: |$)/}).check();
  expect((await events()).filter(x=>x.event==='configuration_changed').map(x=>x.properties.fields)).toEqual(expect.arrayContaining(['operatingModels','addOns']));
  expect(JSON.stringify(await events())).not.toContain('cfg=');
});
test('catalogue retry recovers to current prices and keyboard navigation focuses the next screen', async ({page}) => {
  await page.unroute('**/api/pricing/catalog/active*'); let attempts=0;
  await page.route('**/api/pricing/catalog/active*',route => ++attempts===1 ? route.fulfill({status:503,body:'unavailable'}) : route.fulfill({json:fixture}));
  await page.goto('/'); await page.getByRole('button',{name:'Try again',exact:true}).click();
  await expect(page.getByTestId('select-core_foundation')).toBeVisible();
  await page.getByTestId('select-core_growth').press('Enter');
  await page.getByRole('button',{name:'Refine this plan',exact:true}).press('Enter');
  await expect(page.getByTestId('step-region')).toBeFocused();
  await page.getByRole('button',{name:'Review estimate',exact:true}).press('Enter');
  await expect(page.getByTestId('step-region')).toBeFocused();
  await expect(page.getByTestId('basket-total')).toContainText('$1,925');
});
test('returning visitors can change the chosen package without stale summary state',async ({page}) => {
  await page.goto(`/simulator?cfg=${encodePricingIntent({...base,corePackage:'core_margin'})}`);
  await expect(page.getByTestId('basket-total')).toContainText('$2,140');
  await page.getByRole('link',{name:'Pricing',exact:true}).first().click();
  await page.getByTestId('select-core_foundation').click();
  await page.getByRole('button',{name:'Review estimate',exact:true}).click();
  await expect(page.getByTestId('basket-total')).toContainText('$1,545');
});
test('an invalid retired link does not silently replace the current selection',async ({page}) => {
  await page.goto('/'); await page.getByTestId('select-core_growth').click();
  await page.goto('/simulator?cfg=' + btoa(JSON.stringify({v:1,layer:'report',tier:'pro',locations:4})).replace(/=+$/,''));
  await expect(page.getByRole('alert')).toContainText('retired offer');
  await page.getByRole('button',{name:/Review your estimate/}).click();
  await expect(page.getByTestId('basket-total')).toContainText('$1,925');
});
test('Enterprise has a proposal path and no self-serve headline or account CTA',async ({page}) => {
  await page.goto(`/simulator?cfg=${encodePricingIntent({...base,locations:250})}`);
  await expect(page.getByTestId('basket-total')).toHaveText('Contact Sales');
  await expect(page.getByRole('link',{name:'Continue to Sundae'})).toHaveCount(0);
  await expect(page.getByTestId('basket-average')).toHaveCount(0);
  await expect(page.locator('.price-details')).toHaveCount(0);
  await expect(page.locator('summary').filter({hasText:'Explore the value case'})).toHaveCount(0);
  await page.getByRole('button',{name:/Refine your needs/}).click();
  await page.getByRole('button',{name:'Franchise network',exact:true}).click();
  await expect(page.locator('.extension-toggle').filter({hasText:'$'})).toHaveCount(0);
  await expect(page.locator('.term-options')).not.toContainText('%');
});
test('the location average follows monthly scope and term, stays localized and is omitted for one location', async ({page}) => {
  const cfg: PricingIntent = {...base,layer:'both',corePackage:'core_growth',watchtowerModules:['events'],addOns:['concept_franchise'],crewSkus:['crew_operations','crew_scheduling','crew_payroll'],employees:72,payrollCountry:'AE',billingCycle:'annual_quarterly'};
  await page.goto(`/simulator?cfg=${encodePricingIntent(cfg)}`);
  await expect(page.getByTestId('basket-average')).toHaveText('Average $1,346.43 per location / month · across 3 locations');
  await page.getByRole('button',{name:/Refine your needs/}).click();
  await page.getByRole('button',{name:'Annual · paid upfront'}).click();
  await expect(page.getByTestId('basket-average')).toContainText('$1,248.11');
  await page.getByRole('button',{name:'Review estimate',exact:true}).click();
  await page.getByLabel('Language',{exact:true}).selectOption('ar');
  await expect(page.getByTestId('basket-average')).toContainText('متوسط');
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await page.getByRole('combobox').selectOption('en');
  await page.goto(`/simulator?cfg=${encodePricingIntent({...base,locations:1})}`);
  await expect(page.getByTestId('basket-total')).toContainText('$1,195');
  await expect(page.getByTestId('basket-average')).toHaveCount(0);
});
test('published catalogue failure blocks stale prices',async ({page}) => {
  await page.unroute('**/api/pricing/catalog/active*');
  await page.route('**/api/pricing/catalog/active*',(route) => route.fulfill({status:503,body:'unavailable'}));
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'Pricing is temporarily unavailable'})).toBeVisible();
  await expect(page.getByTestId('select-core_foundation')).toHaveCount(0);
});
test('Crew cannot be reviewed without a selected plan', async ({page}) => {
  await page.goto('/'); await page.getByTestId('pricing-tab-crew').click();
  await page.locator('summary').filter({hasText:'Choose individual Crew capabilities'}).click();
  await page.getByRole('checkbox',{name:/^Crew Pay(?: |$)/}).uncheck();
  await page.getByRole('checkbox',{name:/^Crew Time(?: |$)/}).uncheck();
  await page.getByRole('checkbox',{name:/^Crew Manage(?: |$)/}).uncheck();
  await page.getByRole('checkbox',{name:/^Crew Schedule(?: |$)/}).uncheck();
  await expect(page.getByRole('button',{name:'Review estimate',exact:true})).toBeDisabled();
  await expect(page.getByRole('status')).toContainText('Choose a Crew plan');
  await page.getByTestId('location-count').fill('250');
  await expect(page.getByRole('heading',{name:'Pricing that fits your business.'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Review estimate',exact:true})).toBeDisabled();
  await page.getByTestId('preset-operating_suite').click();
  await expect(page.getByRole('link',{name:'Contact Sales',exact:true})).toBeVisible();
});
test('German has localized refinement and bill-affecting exclusions', async ({page}) => {
  await page.goto('/'); await page.getByLabel('Language',{exact:true}).selectOption('de');
  await page.getByTestId('pricing-tab-crew').click();
  await page.getByRole('button',{name:'Bedarf verfeinern',exact:true}).click();
  await expect(page.getByLabel('Einmalig gezählte Mitarbeitende an allen Standorten')).toBeVisible();
  await expect(page.getByText('Land der Lohnabrechnung',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Schätzung prüfen',exact:true}).click();
  await expect(page.getByTestId('step-region')).toContainText('Vor Aktivierung separat festgelegt');
  await expect(page.getByTestId('step-region')).toContainText('Zusätzliche Personalkosten');
});
test('optional ROI closes back to the same quote and preserves the term', async ({page}) => {
  await page.goto(`/simulator?cfg=${encodePricingIntent({...base,billingCycle:'annual_upfront'})}`);
  await expect(page.getByTestId('basket-total')).toContainText('$1,359.60');
  await page.locator('summary').filter({hasText:'Explore the value case'}).click();
  await expect(page.getByTestId('continue-button-roi')).toBeVisible();
  await page.getByTestId('continue-button-roi').click();
  await expect(page.getByTestId('continue-button-roi')).toHaveCount(0);
  await expect(page.getByTestId('basket-total')).toContainText('$1,359.60');
  await expect(page.getByRole('button',{name:/Review your estimate/})).toHaveAttribute('aria-current','step');
});
test('refinement and review premium visual references', async ({page}) => {
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(`/simulator?cfg=${encodePricingIntent({...base,layer:'both',corePackage:'core_margin',crewSkus:['crew_operations','crew_scheduling','crew_tna','crew_payroll'],employees:65,payrollCountry:'AE',operatingModels:['franchise'],addOns:['concept_franchise']})}`);
  await expect(page.getByTestId('basket-total')).toBeVisible();
  await page.screenshot({path:'docs/product/pricing/screenshots/review.png',fullPage:false});
  await page.getByRole('button',{name:/Refine your needs/}).click();
  await expect(page.getByLabel('Unique employees across your locations')).toBeVisible();
  await page.screenshot({path:'docs/product/pricing/screenshots/refinement.png',fullPage:false});
});
for (const width of [375,390]) {
  test(`mobile ${width}px shows a first price, readable header and usable controls`,async ({page}) => {
    await page.setViewportSize({width,height:844}); await page.goto('/');
    await expect(page.getByTestId('select-core_foundation')).toBeVisible();
    const priceBox = await page.getByTestId('card-core_foundation').locator('.plan-price').boundingBox();
    expect(priceBox!.y + priceBox!.height).toBeLessThan(760);
    const consent=page.getByRole('dialog',{name:'Cookie consent'});
    await expect(consent).toBeVisible();
    const consentBox=await consent.boundingBox();
    expect(priceBox!.y+priceBox!.height).toBeLessThan(consentBox!.y);
    if(width===390) await page.screenshot({path:'docs/product/pricing/screenshots/mobile-fresh.png',fullPage:false});
    await consent.getByRole('button',{name:'Decline',exact:true}).click();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth); expect(overflow).toBe(false);
    await page.getByLabel('Language',{exact:true}).selectOption('ar');
    await expect(page.locator('html')).toHaveAttribute('dir','rtl');
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await page.getByLabel('اللغة',{exact:true}).selectOption('en');
    if (width === 390) await page.screenshot({path:'docs/product/pricing/screenshots/mobile.png',fullPage:false});
    await page.getByRole('button',{name:'Refine this plan',exact:true}).click();
    await page.getByRole('button',{name:'Review estimate',exact:true}).click();
    await expect(page.getByTestId('basket-total')).toContainText('$1,195');
  });
}
test('Arabic remains RTL with localized controls and coherent totals',async ({page}) => {
  await page.goto('/'); await page.getByLabel('Language',{exact:true}).selectOption('ar');
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await expect(page.getByRole('heading',{name:'أسعار تناسب أعمالك.'})).toBeVisible();
  await page.getByTestId('location-count').fill('3');
  await page.getByRole('button',{name:'مراجعة التقدير',exact:true}).click();
  const amount = await page.evaluate(() => new Intl.NumberFormat('ar', { style:'currency', currency:'USD', maximumFractionDigits:0 }).format(1545));
  await expect(page.getByTestId('basket-total')).toContainText(amount);
  await expect(page.getByTestId('step-region')).not.toContainText('3 locations');
  await page.getByRole('button',{name:/حدد احتياجاتك/}).click();
  await page.getByRole('button',{name:'سنوي · دفع مقدم'}).click();
  await page.getByRole('button',{name:'مراجعة التقدير',exact:true}).click();
  await expect(page.getByTestId('step-region')).toContainText('مدة الالتزام');
  await expect(page.getByTestId('step-region')).not.toContainText('Commitment term');
});
test('desktop overview visual reference',async ({page}) => {
  await page.setViewportSize({width:1440,height:1000}); await page.goto('/');
  await expect(page.getByTestId('select-core_foundation')).toBeVisible();
  await page.screenshot({path:'docs/product/pricing/screenshots/desktop.png',fullPage:false});
});
test('light theme and mobile review retain readable premium layouts',async ({page}) => {
  await page.setViewportSize({width:1440,height:1000}); await page.goto('/');
  await page.getByRole('button',{name:/switch to light/i}).click();
  await expect(page.locator('html')).toHaveClass(/light/);
  await page.screenshot({path:'docs/product/pricing/screenshots/light.png',fullPage:false});
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'Review estimate',exact:true}).click();
  await expect(page.getByTestId('basket-total')).toContainText('$1,195');
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.screenshot({path:'docs/product/pricing/screenshots/mobile-review.png',fullPage:true});
});
