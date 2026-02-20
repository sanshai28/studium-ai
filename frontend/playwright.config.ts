import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  timeout: 60_000,

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: isCI
    ? [
        {
          command: 'npm run dev',
          port: 3000,
          reuseExistingServer: false,
          timeout: 30_000,
        },
      ]
    : [
        {
          command: 'npm run dev',
          cwd: '../backend',
          port: 5001,
          reuseExistingServer: true,
          timeout: 30_000,
        },
        {
          command: 'npm run dev',
          port: 3000,
          reuseExistingServer: true,
          timeout: 30_000,
        },
      ],
});
