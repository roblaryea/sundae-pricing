import { expect, test } from '@playwright/test';
import { stepIndexIn } from '../src/lib/journey';

// SUNDAE-PRICING-2: exercise the real route, including React-caught errors.
// A pageerror listener alone misses failures handled by the ErrorBoundary.
for (const layer of ['core', 'crew', 'both'] as const) {
  test(`simulator renders and updates the ${layer} pathway without runtime errors`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto('/simulator');
    await expect(page.getByTestId('step-region')).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('initial.png'), fullPage: true });
    await page.evaluate(({ layer, step }) => {
      const store = (window as Window & {
        __SUNDAE_STORE__: { setState: (value: Record<string, unknown>) => void };
      }).__SUNDAE_STORE__;
      store.setState({ layer, currentStep: step });
    }, { layer, step: stepIndexIn(layer, 'layer') });
    await expect(page.getByRole('heading', { name: /Build Your Intelligence Stack/i })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('pathway.png'), fullPage: true });
    expect(errors).toEqual([]);
  });
}
