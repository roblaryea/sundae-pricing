import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5181',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'env -u NO_COLOR VITE_PRICING_CATALOG_URL=http://localhost:5181 VITE_REQUIRE_LIVE_PRICING=true npm run dev -- --port 5181 --host 127.0.0.1',
    url: 'http://localhost:5181',
    reuseExistingServer: false,
    timeout: 30000,
  },
});
