/**
 * Every pathway, walked to a quote.
 *
 * These exist because reading the code said the combined pathway worked and
 * walking it said otherwise: CORE + CREW went Core tier → add-ons → Watchtower
 * → ROI, skipping Crew entirely, because WatchtowerToggle named its successor
 * (`goToStep('roi')`) instead of advancing within the pathway. The rail agreed
 * with the router the whole time, so nothing static could have caught it.
 *
 * LOCATOR NOTE: step transitions animate out, so the leaving step's buttons
 * are briefly still in the DOM. `.first()` matches the stale one and the click
 * lands on a dying node. Use the LAST match, which is the incoming step.
 */
import { expect, test } from '@playwright/test';

const press = async (page: import('@playwright/test').Page, name: string | RegExp) => {
  await page.getByRole('button', { name }).last().click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(320);
};
const h1 = async (page: import('@playwright/test').Page) =>
  (await page.locator('h1').first().innerText().catch(() => '')).replace(/\s+/g, ' ');

async function toLayerStep(page: import('@playwright/test').Page) {
  await page.goto('/simulator');
  await page.getByRole('button', { name: 'Accept' }).click({ timeout: 4000 }).catch(() => {});
  for (const n of ['Growing Group', 'One brand, multiple sites', 'Continue', 'Profit visibility',
                   'Continue', 'Spreadsheets', 'Continue', 'A POS we already connect to',
                   'Continue', 'Need results fast', 'See Your Custom Stack']) await press(page, n);
  await expect(page.getByRole('heading', { name: /Build Your Intelligence Stack/i })).toBeVisible();
}

test.describe('scenario sweep', () => {
  test('the layer step offers three pathways ONCE each, Core → Crew → Core+Crew', async ({ page }) => {
    await toLayerStep(page);
    // The progress rail's dots also expose a "Select step N" name, so match on
    // the pathway names themselves rather than the verb.
    const selects = (await page.getByRole('button', { name: /^Select (CORE|CREW)/i }).allInnerTexts())
      .map((t) => t.split('\n')[0].trim())
      .filter((t) => /CORE|CREW/i.test(t));
    // It used to render the same three as a row stack AND a card grid: six
    // controls for three choices.
    expect(selects).toEqual(['Select CORE', 'Select CREW', 'Select CORE + CREW']);
  });

  test('CORE+CREW asks the estate once, then walks BOTH rails', async ({ page }) => {
    test.setTimeout(150_000);
    const errs: string[] = [];
    page.on('pageerror', (e) => errs.push(e.message));
    await toLayerStep(page);
    await press(page, /Select CORE \+ CREW/i);

    expect(await h1(page)).toMatch(/How big is the business/i);
    // The shared estate is asked HERE and nowhere else.
    expect(await page.locator('input[type=range]').count()).toBe(1);
    expect(await page.locator('input[type=number]').count()).toBe(1);
    await press(page, /^Continue$/);

    expect(await h1(page)).toMatch(/Core Tier|Core Package/i);
    // Not asked a second time — a shared value must not look per-rail.
    expect(await page.locator('input[type=range]').count()).toBe(0);
    await press(page, /Select Core Growth/i);

    expect(await h1(page)).toMatch(/Power Up|Add-?on/i);
    // These carry stable testids; their visible labels are localized copy.
    await page.getByTestId('continue-button-modules').click();
    await page.waitForTimeout(320);
    expect(await h1(page)).toMatch(/Market Intelligence|Watchtower/i);
    // The label must name the step it reaches, not the one it used to.
    await expect(page.getByTestId('continue-button-watchtower')).toContainText(/Crew/i);
    await page.getByTestId('continue-button-watchtower').click();
    await page.waitForTimeout(320);

    // The step that did not exist: Crew, before the value case, not inside it.
    expect(await h1(page)).toMatch(/Crew/i);
    expect(await page.locator('input[type=range]').count()).toBe(0);

    expect(errs).toEqual([]);
  });

  test('CREW alone keeps its own estate control', async ({ page }) => {
    test.setTimeout(120_000);
    await toLayerStep(page);
    await press(page, /^Select CREW$/);
    expect(await h1(page)).toMatch(/Crew/i);
    // No earlier step asked, so the builder must ask.
    expect(await page.locator('input[type=range]').count()).toBe(1);
    expect(await page.locator('input[type=number]').count()).toBe(1);
  });

  test('CORE alone asks the estate on its package screen', async ({ page }) => {
    test.setTimeout(120_000);
    await toLayerStep(page);
    await press(page, /^Select CORE$/);
    expect(await h1(page)).toMatch(/Core Tier|Core Package/i);
    expect(await page.locator('input[type=range]').count()).toBe(1);
  });

  test('the estate control cannot lie about where its ticks point', async ({ page }) => {
    test.setTimeout(120_000);
    await toLayerStep(page);
    await press(page, /^Select CORE$/);
    const slider = page.locator('input[type=range]').first();
    expect(Number(await slider.getAttribute('max'))).toBe(250);
    const ticks = page.locator('span.absolute');
    const min = Number(await slider.getAttribute('min'));
    const max = Number(await slider.getAttribute('max'));
    for (let i = 0; i < (await ticks.count()); i += 1) {
      const label = Number((await ticks.nth(i).innerText()).replace(/\D/g, ''));
      const rendered = parseFloat(await ticks.nth(i).evaluate((el) => (el as HTMLElement).style.left));
      const truth = ((label - min) / (max - min)) * 100;
      // Labels used to be spread evenly regardless of value: "25" sat at the
      // 50% mark on a 1–100 track, 26 points from where it pointed.
      expect(Math.abs(rendered - truth), `tick ${label} drifted`).toBeLessThan(0.5);
    }
  });

  test('an exact location count can be typed, and is clamped', async ({ page }) => {
    test.setTimeout(120_000);
    await toLayerStep(page);
    await press(page, /^Select CORE$/);
    const num = page.locator('input[type=number]').first();
    const range = page.locator('input[type=range]').first();
    await num.fill('137');
    await num.press('Enter');
    await page.waitForTimeout(350);
    expect(await range.inputValue()).toBe('137');
    await num.fill('9999');
    await num.press('Enter');
    await page.waitForTimeout(350);
    expect(await range.inputValue()).toBe('250');
  });

  test('the volume curve is shown, and does not oversell itself', async ({ page }) => {
    test.setTimeout(120_000);
    await toLayerStep(page);
    await press(page, /Select CORE \+ CREW/i);
    const body = await page.locator('body').innerText();
    expect(body).toMatch(/What scale does to the rate/i);
    // Both halves of the claim, because only one of them is the good news.
    expect(body).toMatch(/an outcome, not a rate card/i);
    expect(body).toMatch(/bill still\s+rises/i);
  });
});
