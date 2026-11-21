import { defineConfig, devices } from '@playwright/test';

// BASE_URL can point at production (e.g. https://stredevirad.github.io/portfolio/) to re-run the smoke suite live.
const external = process.env.BASE_URL;
const baseURL = external ?? 'http://127.0.0.1:4173/portfolio/';

export default defineConfig({
  testDir: 'tests',
  timeout: 45_000,
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, grep: /@smoke/ },
  ],
  webServer: external
    ? undefined
    : { command: 'node scripts/serve.mjs 4173', url: 'http://127.0.0.1:4173/portfolio/', reuseExistingServer: !process.env.CI, timeout: 30_000 },
});
