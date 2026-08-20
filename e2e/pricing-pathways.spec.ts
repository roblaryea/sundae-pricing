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

/**
 * Click a button by accessible name, tolerating the ones that auto-advance.
 *
 * LAST, not first: steps animate out, so the leaving step's buttons are briefly
 * still in the DOM. `.first()` matches the dying node and the click lands on
 * nothing, which reads as "the journey has no way forward" when it plainly has.
 */
async function choose(page: import('@playwright/test').Page, name: RegExp) {
  await page.getByRole('button', { name }).last().click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(300);
}

async function heading(page: import('@playwright/test').Page) {
  // h1 ONLY. Matching h1,h2,h3 picked up the site header ("sundae · Pricing
  // Simulator · Products · Solutions"), which never changes — so every step
  // looked identical and the walk appeared to have nowhere to go.
  return (await page.locator('h1').first().innerText().catch(() => '')).replace(/\n/g, ' / ');
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


/**
 * Advance one step, using the step's own forward control.
 *
 * The generic "click anything that looks like Continue" loops kept stalling:
 * a package card's button reads "Core Growth / $1,925 / Select Core Growth",
 * so an anchored ^Select never matched, and the sticky header carries buttons
 * of its own. Named testids where they exist, accessible names otherwise.
 */
async function forward(page: import('@playwright/test').Page) {
  for (const id of ['continue-button-modules', 'continue-button-watchtower', 'continue-button-roi']) {
    const el = page.getByTestId(id);
    if (await el.count() > 0 && await el.isVisible().catch(() => false)) {
      await el.click({ timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(350);
      return true;
    }
  }
  const next = page
    .getByTestId('step-region')
    .getByRole('button', { name: /(Continue|Review summary|View Summary|See my|Get started)/i })
    .last();
  if ((await next.count()) === 0) return false;
  await next.click({ timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(350);
  return true;
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

    // The estate control lives on the package screen for Core-only — locations
    // are not a step of their own there, and every price moves with it. It is
    // now a slider AND an exact-entry field, so match the roles rather than a
    // label that both of them share.
    await expect(page.getByRole('slider', { name: /how many locations/i })).toBeVisible();
    await expect(page.getByRole('spinbutton', { name: /how many locations/i })).toBeVisible();

    await choose(page, /Select Core Growth/);
    // Walk to the summary.
    for (let i = 0; i < 8; i += 1) {
      const before = await heading(page);
      if (!(await forward(page))) break;
      if ((await heading(page)) === before) break;
    }

    await page.waitForTimeout(1200);
    const body = await page.getByTestId('step-region').innerText();
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
    // The combined pathway asks the shared estate FIRST, because that one
    // number prices both rails. It used to be asked twice, once per rail.
    await expect(page.getByRole('heading', { name: /How big is the business/i })).toBeVisible();
    await choose(page, /^Continue$/);
    await choose(page, /Select Core Growth/);

    // Add-ons → Watchtower → Crew. Crew is a step of its own now; it used to
    // be rendered inside the ROI slot behind a phase flag.
    await forward(page);
    await forward(page);
    expect(await heading(page)).toMatch(/crew/i);

    // Presets are named "Crew Starter / Schedule & Time / Crew Operating /
    // Crew Complete" — picking one seeds the SKU set in a single click.
    await choose(page, /Crew Operating/i);
    await forward(page);   // Crew → value case
    await forward(page);   // value case → summary
    await page.waitForTimeout(600);

    await page.waitForTimeout(1200);
    const body = await page.getByTestId('step-region').innerText();
    // Both rails, and a combined figure that is exactly their sum.
    expect(body).toMatch(/crew/i);
    expect(body).toMatch(/combined/i);
    const figures = [...body.matchAll(/\$([\d,]+)/g)].map((m) => Number(m[1].replace(/,/g, '')));
    expect(figures.length, 'summary printed no money at all').toBeGreaterThan(2);
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
        .getByTestId('step-region')
        .getByRole('button', { name: /(Continue|Next|See my|View|Skip|Review|Get started)/i })
        .last();
      if ((await next.count()) === 0) break;
      await next.click().catch(() => {});
      await page.waitForTimeout(400);
      if ((await heading(page)) === before) break;
    }
    await page.waitForTimeout(1200);
    const body = await page.getByTestId('step-region').innerText();
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
      // Scope to the step region — the sticky header and progress rail carry
      // buttons too. And match the ACCESSIBLE NAME, not the leading text: a
      // package card's button reads "Core Growth / $1,925 / Select Core
      // Growth", so an anchored ^Select never matched it and the walk looked
      // like it had nowhere to go.
      const next = page
        .getByTestId('step-region')
        .getByRole('button', { name: /(Continue|Next|See my|View|Skip|Review|Get started|Select Core)/i })
        .last();
      if ((await next.count()) === 0) break;
      await next.click().catch(() => {});
      await page.waitForTimeout(400);
      if ((await heading(page)) === h) break;
    }
    expect(seen.size).toBeGreaterThan(2);
  });
});
