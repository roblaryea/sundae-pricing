import { test, expect } from '@playwright/test';

test('recovers a missing lazy route module once and renders the simulator', async ({ page }) => {
  let moduleRequests = 0;
  await page.route('**/src/pages/Simulator.tsx*', async route => {
    moduleRequests += 1;
    if (moduleRequests === 1) {
      await route.fulfill({ status: 404, contentType: 'text/javascript', body: '' });
    } else {
      await route.continue();
    }
  });
  await page.goto('/simulator', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('step-region')).toBeVisible();
  expect(moduleRequests).toBe(2);
  expect(await page.evaluate(() => sessionStorage.getItem('sundae:chunk-recovery:simulator'))).toBeNull();
});

test('a persistently missing route module stops after one reload', async ({ page }) => {
  let moduleRequests = 0;
  await page.route('**/src/pages/Simulator.tsx*', async route => {
    moduleRequests += 1;
    await route.fulfill({ status: 404, contentType: 'text/javascript', body: '' });
  });
  await page.goto('/simulator', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Something went wrong' })).toBeVisible();
  await expect.poll(() => moduleRequests).toBe(2);
  expect(await page.evaluate(() => sessionStorage.getItem('sundae:chunk-recovery:simulator'))).toBe('1');
  // Reaching the boundary after the guarded attempt must not start another reload.
  await page.waitForTimeout(500);
  expect(moduleRequests).toBe(2);
});
