import { defineConfig, devices } from '@playwright/test';

// The same two numbers vite.config.ts derives from the first commit date
// (2026-04-29 → 60429, over 60000 so minus 50000): the container publishes
// 10429, the dev server takes PORT + 1. Never Vite's stock 5173.
const hostPort = Number(process.env.PORT ?? 10429);
const devServerPort = Number(process.env.VITE_PORT ?? hostPort + 1);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['list'], ['html']] : 'html',
  use: {
    baseURL: `http://localhost:${devServerPort}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // One server: the prediction service is remote, and every spec that needs it
  // answers `/api` from a fixture rather than reaching the deployment.
  webServer: {
    command: 'npm run dev',
    url: `http://localhost:${devServerPort}`,
    reuseExistingServer: !process.env.CI,
  },
});
