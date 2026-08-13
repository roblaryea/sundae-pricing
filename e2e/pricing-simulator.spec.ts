/**
 * Buyer-facing pricing verification (price book v1.7).
 *
 * These tests cross the rendered summary boundary. They deliberately compare
 * what a prospect sees with the same published engines used by the live
 * calculator, across package families, estate-size bands, commitment terms,
 * Crew dependency/bundle paths, and the 250+ enterprise handoff.
 */
import { test, expect, type Page } from '@playwright/test';
import { calculateFullPrice, type AddOnId } from '../src/lib/pricingEngine';
import { computeCrewQuote } from '../src/lib/crewPricing';
import { corePackages } from '../src/data/pricing';
import type { BillingCycle, CorePackageId } from '../src/data/pricing';
import type { CrewSkuId } from '../src/types/configuration';
import { stepIndex } from '../src/lib/journey';

interface SimConfig {
  layer?: 'core' | 'crew' | 'both';
  corePackage?: CorePackageId;
  locations: number;
  addOns?: AddOnId[];
  watchtowerModules?: string[];
  crewSkus?: CrewSkuId[];
  billingCycle?: BillingCycle;
}

async function setStore(page: Page, config: SimConfig, currentStep: number) {
  await page.goto('/simulator');
  await page.waitForFunction(() => (window as Window & { __SUNDAE_STORE__?: unknown }).__SUNDAE_STORE__, {
    timeout: 10_000,
  });

  await page.evaluate(
    ({ cfg, step }) => {
      const store = (window as Window & { __SUNDAE_STORE__: { getState: () => any; setState: (state: any) => void } })
        .__SUNDAE_STORE__;
      const journeySteps = store.getState().journeySteps.map((journeyStep: any) => ({
        ...journeyStep,
        completed: journeyStep.id !== 'summary',
      }));
      store.setState({
        layer: cfg.layer ?? 'core',
        corePackage: cfg.corePackage ?? 'core_foundation',
        locations: cfg.locations,
        addOns: cfg.addOns ?? [],
        watchtowerModules: cfg.watchtowerModules ?? [],
        crewSkus: cfg.crewSkus ?? [],
        billingCycle: cfg.billingCycle ?? 'monthly',
        currentStep: step,
        journeySteps,
      });
    },
    { cfg: config, step: currentStep },
  );
}

async function goToSummary(page: Page, config: SimConfig) {
  await setStore(page, config, stepIndex('summary'));
  await expect(page.getByTestId('summary-monthly-total')).toBeVisible();
}

function coreResult(config: SimConfig) {
  return calculateFullPrice({
    layer: config.layer === 'both' ? 'both' : 'core',
    corePackage: config.corePackage ?? 'core_foundation',
    locations: config.locations,
    addOns: config.addOns ?? [],
    watchtower: config.watchtowerModules ?? [],
    clientProfile: {
      type: 'independent',
      isEarlyAdopter: false,
      isFranchise: false,
      brandCount: 1,
      billingCycle: config.billingCycle ?? 'monthly',
    },
  });
}

function expectedMonthly(config: SimConfig): number {
  const core = config.layer === 'crew' ? 0 : coreResult(config).total;
  const crew = config.layer === 'core' || !config.crewSkus?.length
    ? 0
    : computeCrewQuote(config.crewSkus, config.locations).monthly;
  return core + crew;
}

function money(amount: number): string {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

async function expectSummaryToMatchEngine(page: Page, config: SimConfig) {
  await goToSummary(page, config);
  await expect(page.getByTestId('summary-monthly-total')).toHaveText(money(expectedMonthly(config)));
}

const CORE_PACKAGES: CorePackageId[] = [
  'core_foundation',
  'core_margin',
  'core_growth',
  'core_performance',
];
const ESTATE_SIZES = [1, 5, 25, 60, 100, 249];

test.describe('Core price and location matrix', () => {
  for (const corePackage of CORE_PACKAGES) {
    for (const locations of ESTATE_SIZES) {
      test(`${corePackage} matches the quote engine @ ${locations} locations`, async ({ page }) => {
        await expectSummaryToMatchEngine(page, { corePackage, locations });
      });
    }
  }

  test('250 locations crosses to enterprise without printing a self-serve number', async ({ page }) => {
    await goToSummary(page, { corePackage: 'core_performance', locations: 250 });
    await expect(page.getByTestId('summary-monthly-total')).toHaveText('Custom pricing');
    await expect(page.getByText(/enterprise quote/i)).toBeVisible();
  });

  test('annual commitment applies the published 10% Core discount', async ({ page }) => {
    await expectSummaryToMatchEngine(page, {
      corePackage: 'core_margin',
      locations: 100,
      billingCycle: 'annual',
    });
  });

  test('two-year commitment applies the published 15% Core discount', async ({ page }) => {
    await expectSummaryToMatchEngine(page, {
      corePackage: 'core_growth',
      locations: 200,
      billingCycle: 'two_year',
    });
  });

  test('Foundation + Foresight & Action matches @ 10 locations', async ({ page }) => {
    await expectSummaryToMatchEngine(page, {
      corePackage: 'core_foundation',
      locations: 10,
      addOns: ['foresight_action'],
    });
  });

  test('Growth + concept SKU matches @ 20 locations', async ({ page }) => {
    await expectSummaryToMatchEngine(page, {
      corePackage: 'core_growth',
      locations: 20,
      addOns: ['concept_franchise'],
    });
  });

  test('Performance + Watchtower matches @ 5 locations', async ({ page }) => {
    await expectSummaryToMatchEngine(page, {
      corePackage: 'core_performance',
      locations: 5,
      watchtowerModules: ['bundle'],
    });
  });

  test('five-location Foundation is the published marginal example', async ({ page }) => {
    await goToSummary(page, { corePackage: 'core_foundation', locations: 5 });
    await expect(page.getByTestId('summary-monthly-total')).toHaveText('$1,895');
  });

  test('partial-scope Core competitors are not presented as like-for-like savings', async ({ page }) => {
    await goToSummary(page, { corePackage: 'core_margin', locations: 25 });
    await page.getByRole('button', { name: /View Full Competitor Comparison/i }).click();
    await expect(page.getByTestId('core-comparison-value-bridge')).toContainText(
      '6 connected outcome domains',
    );
    await expect(page.getByRole('button', { name: /vs Tenzo/i })).toContainText(
      'Not like-for-like',
    );
    await expect(page.getByRole('button', { name: /vs Tenzo/i })).toContainText(
      'partial-scope annual rate',
    );
  });
});

const CREW_SCENARIOS: Array<{ label: string; crewSkus: CrewSkuId[] }> = [
  { label: 'Crew Schedule', crewSkus: ['crew_scheduling'] },
  { label: 'Crew Manage', crewSkus: ['crew_operations', 'crew_scheduling'] },
  { label: 'Schedule & Time (BYO HR/payroll)', crewSkus: ['crew_scheduling', 'crew_tna'] },
  {
    label: 'Crew Operating',
    crewSkus: ['crew_operations', 'crew_scheduling', 'crew_tna', 'crew_payroll'],
  },
  {
    label: 'Crew Complete',
    crewSkus: [
      'crew_operations',
      'crew_scheduling',
      'crew_tna',
      'crew_payroll',
      'crew_people_intelligence',
    ],
  },
];

test.describe('Crew packages, bundles, and dependencies', () => {
  for (const scenario of CREW_SCENARIOS) {
    for (const locations of [1, 25, 60, 100]) {
      test(`${scenario.label} matches the Crew engine @ ${locations} locations`, async ({ page }) => {
        await expectSummaryToMatchEngine(page, {
          layer: 'crew',
          locations,
          crewSkus: scenario.crewSkus,
        });
      });
    }
  }

  test('Crew Starter enforces its five-location cap defensively', async ({ page }) => {
    await goToSummary(page, { layer: 'crew', locations: 10, crewSkus: ['crew_lite'] });
    await expect(page.getByTestId('summary-monthly-total')).toHaveText('$175');
    await expect(page.getByText('5 locations', { exact: true })).toBeVisible();
  });

  test('Crew Pay cannot be quoted without its Manage dependency', async ({ page }) => {
    const payWithResolvedDependencies: CrewSkuId[] = [
      'crew_operations',
      'crew_scheduling',
      'crew_payroll',
    ];
    await expectSummaryToMatchEngine(page, {
      layer: 'crew',
      locations: 25,
      crewSkus: payWithResolvedDependencies,
    });
    await expect(page.getByText(/Crew Operating/i).first()).toBeVisible();
  });

  test('Crew published net price does not silently earn a Core commitment discount', async ({ page }) => {
    const crewSkus: CrewSkuId[] = [
      'crew_operations',
      'crew_scheduling',
      'crew_tna',
      'crew_payroll',
    ];
    const monthly = computeCrewQuote(crewSkus, 25).monthly;
    await goToSummary(page, {
      layer: 'crew',
      locations: 25,
      crewSkus,
      billingCycle: 'two_year',
    });
    await expect(page.getByTestId('summary-monthly-total')).toHaveText(money(monthly));
    await expect(page.getByTestId('crew-commitment-policy')).toContainText(
      'No automatic annual or multi-year discount',
    );
  });

  test('Crew comparison shows workforce alternatives only and discloses excluded scope', async ({ page }) => {
    await goToSummary(page, {
      layer: 'crew',
      locations: 8,
      crewSkus: ['crew_operations', 'crew_scheduling', 'crew_tna', 'crew_payroll'],
    });
    for (const name of ['Homebase', 'Deputy', '7shifts']) {
      await expect(page.getByRole('button', { name: new RegExp(`vs ${name}`, 'i') })).toBeVisible();
    }
    await expect(page.getByRole('button', { name: /vs Power BI/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /vs Restaurant365/i })).toHaveCount(0);
    await expect(page.getByText(/displayed price excludes the US payroll add-on/i)).toBeVisible();
    await expect(page.getByText(/No Crew commitment discount is assumed/i)).toBeVisible();
    await expect(page.getByTestId('crew-comparison-value-bridge')).toContainText(
      'Compare the outcome, not a partial rate',
    );
    await expect(page.getByTestId('crew-comparison-value-bridge')).toContainText(
      'native Sundae payroll across 36 supported countries',
    );
    await expect(page.getByText(/partial-scope annual rate/i).first()).toBeVisible();
    await expect(page.getByText(/cheaper per year/i)).toHaveCount(0);
    await expect(page.getByText(/· Aug-2026/i).first()).toBeVisible();
    await expect(page.getByText(/2026-08-12/)).toHaveCount(0);

    await page.getByRole('button', { name: /vs Deputy/i }).click();
    await expect(page.getByTestId('crew-scope-gap-deputy')).toContainText(
      'does not price your full selected scope',
    );
    await expect(page.getByText('Disclosed partial-scope gap')).toBeVisible();
    await expect(page.getByText('$1,344', { exact: true })).toBeVisible();
    await expect(page.getByText(/2026-08-12/)).toHaveCount(0);
  });

  test('combined Core Margin + Crew Operating prints one decision number', async ({ page }) => {
    await expectSummaryToMatchEngine(page, {
      layer: 'both',
      corePackage: 'core_margin',
      locations: 25,
      crewSkus: ['crew_operations', 'crew_scheduling', 'crew_tna', 'crew_payroll'],
    });
    await expect(page.getByText(/Core .* \+ Crew/i)).toBeVisible();
  });

  test('combined journey configures Crew, then shows the value case before summary', async ({ page }) => {
    await setStore(page, {
      layer: 'both',
      corePackage: 'core_margin',
      locations: 25,
      crewSkus: [],
    }, stepIndex('watchtower'));

    await page.getByRole('button', { name: /Continue to ROI Calculator/i }).click();
    await expect(page.getByRole('button', { name: /Configure Crew/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Build your Sundae Crew/i })).toBeVisible();

    await page.getByRole('button', { name: /Crew Operating Manage \+ Time \+ Pay/i }).click();
    await page.getByRole('button', { name: /Continue to value case/i }).click();
    await expect(page.getByRole('button', { name: /Calculate ROI/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Calculate Your ROI' })).toBeVisible();
    await expect(page.getByText(/Return is modelled on your Core package only/i)).toBeVisible();

    await page.getByRole('button', { name: /View Summary/i }).click();
    await expect(page.getByText(/Monthly Investment · Core \+ Crew/i)).toBeVisible();
    await expect(page.getByText(/Crew and add-ons excluded/i)).toBeVisible();
  });
});

test.describe('Package-selection clarity', () => {
  test('Core cards show the estate total, not a misleading flat rate', async ({ page }) => {
    await setStore(page, { corePackage: 'core_foundation', locations: 5 }, stepIndex('tier'));
    await expect(page.getByTestId('core-package-total-core_foundation')).toContainText('1,895');
    await expect(page.getByTestId('core-package-total-core_margin')).toContainText(
      `${(
        corePackages.core_margin.firstUnitPrice +
        4 * corePackages.core_margin.marginalBands[0].pricePerUnit
      ).toLocaleString()}`,
    );
  });

  test('domain modules are included capabilities, not priced toggles', async ({ page }) => {
    await setStore(page, { corePackage: 'core_foundation', locations: 5 }, stepIndex('addons'));
    const labor = page.getByTestId('included-module-labor');
    await expect(labor).toBeVisible();
    await expect(labor).toContainText('Included');
    await expect(labor).not.toContainText('$');
  });

  test('Crew tiles label anchors as first-location prices', async ({ page }) => {
    await setStore(page, {
      layer: 'crew',
      locations: 25,
      crewSkus: ['crew_scheduling', 'crew_tna'],
    }, stepIndex('tier'));
    await expect(page.getByRole('button', { name: /Crew Pay/i })).toContainText('first location /mo');
    await expect(page.getByText(/native Sundae payroll suite supporting 36 countries/i)).toBeVisible();
  });

  test('BYO-HR Schedule & Time is available as a one-click acquisition path', async ({ page }) => {
    await setStore(page, {
      layer: 'crew',
      locations: 25,
      crewSkus: ['crew_operations', 'crew_scheduling', 'crew_tna', 'crew_payroll'],
    }, stepIndex('tier'));
    await page.getByRole('button', { name: /Schedule & Time Keep your HR\/payroll/i }).click();
    await expect(page.getByText('Schedule & Time', { exact: true }).last()).toBeVisible();
    await expect(page.getByText('$1365', { exact: true }).first()).toBeVisible();
  });
});
