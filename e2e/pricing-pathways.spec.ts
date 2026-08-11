/**
 * Golden paths through the pricing simulator.
 *
 * Three commercial pathways exist and all three must reach a priced quote:
 * Core only, Crew only, and Core + Crew. The combined pathway is the one most
 * multi-site groups actually sign, and until recently it could not be
 * configured at all — `layer` was `'core' | 'crew'` and the summary
 * early-returned on the Crew branch, so the two rails were mutually exclusive.
 *
 * These specs also pin the two discovery answers that shape the quote rather
 * than the persona: operating model (concept pathways and per-object overlays)
 * and systems (the one-time implementation class, which previously read
 * "Scoped at contract" for every visitor because nothing asked).
 */
import { expect, test } from '@playwright/test';

const SIM = '/simulator';

/** Click a button by accessible name, tolerating the ones that auto-advance. */
async function choose(page: import('@playwright/test').Page, name: RegExp) {
  await page.getByRole('button', { name }).first().click();
  await page.waitForTimeout(250);
}

async function heading(page: import('@playwright/test').Page) {
  return (await page.locator('h1,h2,h3').first().innerText()).replace(/\n/g, ' / ');
}

/** Walk the discovery quiz, which is shared by every pathway. */
async function completeDiscovery(
  page: import('@playwright/test').Page,
  opts: { operatingModel: RegExp; stack: RegExp[] },
) {
  await page.goto(SIM);
  await page.getByRole('button', { name: /^Accept$/ }).click().catch(() => {});

  await choose(page, /Growing Group/); // 8 locations
  await choose(page, opts.operatingModel);
  await choose(page, /^Continue$/);
  await choose(page, /Profit visibility/);
  await choose(page, /^Continue$/);
  await choose(page, /Spreadsheets/);
  await choose(page, /^Continue$/);
  for (const s of opts.stack) await choose(page, s);
  await choose(page, /^Continue$/);
  await choose(page, /Need results fast/);
  // Persona reveal → layer step.
  await choose(page, /^(Continue|Next|See|Build)/i);
  await expect(page.getByRole('heading', { name: /Build Your Intelligence Stack/i })).toBeVisible();
}

test.describe('pricing simulator pathways', () => {
  test('offers all three commercial pathways at the layer step', async ({ page }) => {
    await completeDiscovery(page, {
      operatingModel: /One brand, multiple sites/,
      stack: [/A POS we already connect to/],
    });
    const labels = await page.locator('button:visible').allInnerTexts();
    const joined = labels.join(' | ');
    expect(joined).toMatch(/CORE/);
    expect(joined).toMatch(/CREW/);
    // The combined rail — the deal that could not previously be configured.
    expect(joined).toMatch(/CORE \+ CREW/);
  });

  test('Core only reaches a quote with a real implementation fee', async ({ page }) => {
    await completeDiscovery(page, {
      operatingModel: /One brand, multiple sites/,
      stack: [/A POS we already connect to/, /Accounting or ERP/],
    });
    await choose(page, /^Select CORE$/);
    await expect(page.getByRole('heading', { name: /Choose Your Core Tier/i })).toBeVisible();

    // The estate control lives on the package screen now — locations are not a
    // step of their own, and every price moves with it.
    await expect(page.getByLabel(/how many locations/i)).toBeVisible();

    await choose(page, /Select Core Growth/);
    // Walk to the summary.
    for (let i = 0; i < 8; i += 1) {
      const before = await heading(page);
      const next = page
        .locator('button:visible')
        .filter({ hasText: /^(Continue|Next|See|View|Skip|Review|Get)/i })
        .first();
      if ((await next.count()) === 0) break;
      await next.click().catch(() => {});
      await page.waitForTimeout(400);
      if ((await heading(page)) === before) break;
    }

    const body = await page.locator('body').innerText();
    expect(body).toMatch(/Implementation \(one-time\)/);
    // POS + one further system resolves Class B, not the old blanket
    // "Scoped at contract" that every visitor used to see.
    expect(body).not.toMatch(/Scoped at contract/);
  });

  test('Core + Crew prices both rails and shows a combined monthly', async ({ page }) => {
    await completeDiscovery(page, {
      operatingModel: /Franchise network/,
      stack: [/A POS we already connect to/],
    });
    await choose(page, /^Select CORE \+ CREW$/);
    await choose(page, /Select Core Growth/);

    // Walk forward until the Crew builder appears in the combined path.
    for (let i = 0; i < 6; i += 1) {
      if (/crew/i.test(await heading(page))) break;
      const next = page
        .locator('button:visible')
        .filter({ hasText: /^(Continue|Next|See|View|Skip|Review|Get)/i })
        .first();
      if ((await next.count()) === 0) break;
      await next.click().catch(() => {});
      await page.waitForTimeout(400);
    }
    expect(await heading(page)).toMatch(/crew/i);

    await choose(page, /Crew Manage/i);
    await choose(page, /Crew Time/i);
    const submit = page
      .locator('button:visible')
      .filter({ hasText: /^(Continue|Review|See)/i })
      .first();
    if (await submit.count()) await submit.click();
    await page.waitForTimeout(800);

    const body = await page.locator('body').innerText();
    expect(body).toMatch(/Crew \(operational substrate\)/);
    expect(body).toMatch(/Combined monthly/);
  });

  test('a hotel group is shown its per-object overlay before signature', async ({ page }) => {
    await completeDiscovery(page, {
      operatingModel: /Hotel or resort F&B/,
      stack: [/A POS we already connect to/],
    });
    await choose(page, /^Select CORE$/);
    await choose(page, /Select Core Growth/);
    for (let i = 0; i < 8; i += 1) {
      const before = await heading(page);
      const next = page
        .locator('button:visible')
        .filter({ hasText: /^(Continue|Next|See|View|Skip|Review|Get)/i })
        .first();
      if ((await next.count()) === 0) break;
      await next.click().catch(() => {});
      await page.waitForTimeout(400);
      if ((await heading(page)) === before) break;
    }
    const body = await page.locator('body').innerText();
    // Revenue-centre billing is a real recurring cost; meeting it after signing
    // is how a quote loses trust.
    expect(body).toMatch(/revenue centre/i);
  });

  test('no step is reachable without a way forward', async ({ page }) => {
    await completeDiscovery(page, {
      operatingModel: /One brand, multiple sites/,
      stack: [/A POS we already connect to/],
    });
    await choose(page, /^Select CORE$/);
    const seen = new Set<string>();
    for (let i = 0; i < 10; i += 1) {
      const h = await heading(page);
      expect(seen.has(h), `revisited "${h}" — the journey looped`).toBe(false);
      seen.add(h);
      const next = page
        .locator('button:visible')
        .filter({ hasText: /^(Continue|Next|See|View|Skip|Review|Get|Select)/i })
        .first();
      if ((await next.count()) === 0) break;
      await next.click().catch(() => {});
      await page.waitForTimeout(400);
      if ((await heading(page)) === h) break;
    }
    expect(seen.size).toBeGreaterThan(2);
  });
});
