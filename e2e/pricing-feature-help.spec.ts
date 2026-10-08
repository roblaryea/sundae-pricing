import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { supportedLocales } from '../src/lib/locales';
import { featureHelpLabels, englishFeatureHelp, featureHelpExtras } from '../src/lib/featureHelpCopy';
const fixture = JSON.parse(readFileSync(new URL('../__tests__/fixtures/published-v1.8.2.json', import.meta.url), 'utf8'));
test.beforeEach(async ({ page }) => {
  await page.route('**/api/pricing/catalog/active*', route => route.fulfill({json:fixture}));
  await page.addInitScript(() => localStorage.setItem('sundae_cookie_consent','declined'));
});
const tooltip = (page: Page) => page.getByRole('tooltip');
const help = (page: Page, id: string) => page.locator(`[data-feature-help="${id}"]:visible`).first();
async function insideViewport(page: Page) {
  const bounds = await tooltip(page).boundingBox();
  const viewport = page.viewportSize()!;
  expect(bounds!.x).toBeGreaterThanOrEqual(10);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width - 10);
  expect(bounds!.y).toBeGreaterThanOrEqual(10);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height - 10);
}

test('hover help is readable, hoverable, dismissible and independent of card selection', async ({page}) => {
  await page.goto('/');
  await help(page,'inventory').hover();
  await expect(tooltip(page)).toContainText(englishFeatureHelp.inventory);
  await tooltip(page).hover();
  await expect(tooltip(page)).toBeVisible();
  await expect(page.getByTestId('select-core_foundation')).toHaveAttribute('aria-pressed','true');
  await help(page,'inventory').click();
  await page.locator('h1').hover();
  await expect(tooltip(page)).toBeVisible();
  await expect(page.getByTestId('decision-total')).toHaveText('$1,195/mo');
  await help(page,'inventory').press('Escape');
  await expect(tooltip(page)).toHaveCount(0);
  await expect(help(page,'inventory')).toBeFocused();
  await page.getByTestId('card-core_margin').click({position:{x:30,y:35}});
  await expect(page.getByTestId('select-core_margin')).toHaveAttribute('aria-pressed','true');
});

test('keyboard help has a description, Escape closes it and plan selection still works', async ({page}) => {
  await page.goto('/');
  await help(page,'profit').focus();
  await expect(tooltip(page)).toContainText(englishFeatureHelp.profit);
  await expect(help(page,'profit')).toHaveAccessibleName('About Profit Intelligence');
  await expect(help(page,'profit')).toHaveAccessibleDescription(englishFeatureHelp.profit);
  await help(page,'profit').press('Escape');
  await expect(tooltip(page)).toHaveCount(0);
  await help(page,'profit').press('Enter');
  await expect(tooltip(page)).toBeVisible();
  await help(page,'labor').focus();
  await expect(tooltip(page)).toHaveCount(1);
  await expect(tooltip(page)).toContainText(englishFeatureHelp.labor);
  await page.getByTestId('select-core_growth').press('Enter');
  await expect(tooltip(page)).toHaveCount(0);
  await expect(page.getByTestId('select-core_growth')).toHaveAttribute('aria-pressed','true');
  expect(await page.locator('button button, label button').count()).toBe(0);
});

test('comparison, Crew assembly and specialist help explain capabilities without adding charges', async ({page}) => {
  await page.goto('/');
  await page.getByTestId('plan-comparison-details').locator('summary').click();
  await page.locator('.comparison-desktop').getByRole('button',{name:'About Guest CRM Intelligence'}).click();
  await expect(tooltip(page)).toContainText(englishFeatureHelp.guest_crm);
  await page.getByTestId('pricing-tab-crew').click();
  await help(page,'crew_payroll').click();
  await expect(tooltip(page)).toContainText('Country support is confirmed before setup');
  await expect(page.getByTestId('preset-operating_suite')).toHaveAttribute('aria-pressed','true');
  await page.locator('summary').filter({hasText:'Choose individual Crew capabilities'}).click();
  await page.locator('.sku-options [data-feature-help="crew_people_intelligence"]').click();
  await expect(tooltip(page)).toContainText(englishFeatureHelp.crew_people_intelligence);
  await expect(page.getByRole('checkbox',{name:'Crew People',exact:true})).not.toBeChecked();
  await page.getByTestId('pricing-tab-core').click();
  await page.getByTestId('select-core_growth').click();
  await page.getByRole('button',{name:'Refine this plan',exact:true}).click();
  await page.getByTestId('business-model-franchise').click();
  for (const id of ['foresight_action','concept_franchise','bundle']) {
    await help(page,id).click();
    await expect(tooltip(page)).toContainText(englishFeatureHelp[id as keyof typeof englishFeatureHelp]);
  }
  await expect(page.getByRole('checkbox',{name:/^Franchise/})).not.toBeChecked();
  await expect(page.getByRole('checkbox',{name:/^Add market intelligence/})).not.toBeChecked();
  await page.locator('summary').filter({hasText:'Cross-Intelligence Pro'}).click();
  await help(page,'cross_pro').click();
  await expect(tooltip(page)).toContainText(englishFeatureHelp.cross_pro);
});

for (const locale of ['en','ar'] as const) {
  test(`mobile ${locale} tap help stays within the viewport and passes axe`, async ({page}) => {
    await page.setViewportSize({width:375,height:812}); await page.goto('/');
    await page.locator('header select').selectOption(locale);
    await help(page,'profit').click();
    await expect(tooltip(page)).toBeVisible();
    await insideViewport(page);
    expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
    await page.getByTestId('decision-total').click();
    await expect(tooltip(page)).toHaveCount(0);
    await page.getByTestId('mobile-core-plan').selectOption('core_performance');
    await help(page,'foresight_action').click();
    await insideViewport(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({path:`docs/product/pricing/screenshots/feature-help-mobile-${locale}.png`});
  });
}

test('help uses the selected language in all site locales', async ({page}) => {
  await page.goto('/');
  for (const locale of supportedLocales) {
    await page.locator('header select').selectOption(locale);
    await help(page,'profit').click();
    const text=await tooltip(page).innerText();
    expect(text.length).toBeGreaterThan(30);
    await expect(help(page,'profit')).toHaveAccessibleName(featureHelpLabels[locale].replace('{feature}', await tooltip(page).locator('strong').innerText()));
    if(locale !== 'en') expect(text).not.toContain(englishFeatureHelp.profit);
    await help(page,'profit').press('Escape');
  }
  for (const [locale,descriptions] of Object.entries(featureHelpExtras)) {
    expect(descriptions.length,locale).toBe(14);
    expect(descriptions.every(text=>text.length>10),locale).toBe(true);
  }
});

test('business icons match onboarding and selection remains optional and keyboard operable', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button',{name:'Refine this plan',exact:true}).click();
  const choices = {single_brand:'store',multi_brand:'building2',franchise:'building2',hotel_fb:'hotel',cloud_kitchen:'truck',catering:'party-popper',production:'factory'};
  for (const [id,icon] of Object.entries(choices)) {
    const button=page.getByTestId(`business-model-${id}`);
    await expect(button.locator(`.model-icon .lucide-${icon}`)).toHaveCount(1);
    await expect(button).toHaveAttribute('aria-pressed','false');
    await button.press('Enter');
    await expect(button).toHaveAttribute('aria-pressed','true');
    await expect(page.getByTestId('basket-total')).toHaveText('$1,195/mo');
  }
  await page.getByTestId('business-model-franchise').press('Enter');
  await expect(page.getByTestId('business-model-franchise')).toHaveAttribute('aria-pressed','false');
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  await page.screenshot({path:'docs/product/pricing/screenshots/business-model-icons.png',fullPage:false});
});


test('mobile theme thumb stays inside its track in English, Arabic and Urdu', async ({page}) => {
  await page.setViewportSize({width:375,height:812}); await page.goto('/');
  const toggle=page.getByTestId('theme-toggle');
  const thumb=page.getByTestId('theme-thumb');
  for (const locale of ['en','ar','ur']) {
    await page.locator('header select').selectOption(locale);
    for (let mode=0;mode<2;mode++) {
      const before=await toggle.getAttribute('aria-pressed');
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-pressed',before==='true'?'false':'true');
      await expect.poll(async () => {
        const track=await toggle.boundingBox(); const knob=await thumb.boundingBox();
        return !!track && !!knob && knob.x>=track.x && knob.x+knob.width<=track.x+track.width && knob.y>=track.y && knob.y+knob.height<=track.y+track.height;
      }).toBe(true);
      await page.getByTestId('location-count').fill('3');
      await expect(page.getByTestId('decision-total')).toBeVisible();
    }
  }
});
