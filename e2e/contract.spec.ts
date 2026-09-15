/* eslint-disable camelcase -- the /paper_metrics payload is the Python API's. */
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { ABOUT } from '../src/about.ts';
import { ROUTES } from '../src/routes.ts';
import type { ModelMetrics, PaperMetricsResponse } from '../src/types.ts';

import { mockPredictionApi } from './fixtures.ts';

const CLASSES = ['Alternating', 'Random', 'Gradient'];

const MODEL: ModelMetrics = {
  confusion_matrix: [
    [4, 1, 0],
    [1, 8, 1],
    [0, 2, 3],
  ],
  per_class: {
    Alternating: { acc: 0.8, prec: 0.8, f1: 0.8 },
    Random: { acc: 0.8, prec: 0.73, f1: 0.76 },
    Gradient: { acc: 0.6, prec: 0.75, f1: 0.67 },
    Macro: { acc: 0.73, prec: 0.76, f1: 0.74 },
  },
  accuracy: 0.75,
  coverage: 0.9,
  retained: 18,
};

const PAPER_METRICS: PaperMetricsResponse = {
  classes: CLASSES,
  generated_at: '2026-08-19T06:34:46',
  splits: {
    train: { n: 20, xgboost: MODEL, voting: MODEL, predictions: [] },
    test: { n: 20, xgboost: MODEL, voting: MODEL, predictions: [] },
  },
};

const OPENAPI = {
  openapi: '3.1.0',
  info: { title: 'PolyCarp', version: '1.0.0' },
  paths: {},
};

/**
 * Answers the two GET endpoints the Results and API pages load, so a route
 * sweep never depends on the remote deployment being up.
 * @param page - The page under test.
 */
async function mockPageData(page: Page): Promise<void> {
  await page.route('**/api/paper_metrics', (route) =>
    route.fulfill({ json: PAPER_METRICS }),
  );
  await page.route('**/api/openapi.json', (route) =>
    route.fulfill({ json: OPENAPI }),
  );
}

/**
 * Record every uncaught error and every console.error the page raises from
 * now on.
 * @param page - The page under test.
 * @returns The list the messages are pushed to.
 */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => {
    errors.push(`pageerror: ${error.message}`);
  });
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(`console.error: ${message.text()}`);
    }
  });
  return errors;
}

test('/about is the About page, with the Cite control and the footer', async ({
  page,
}) => {
  await page.goto('/about');

  await expect(page.locator('.about-hero h1')).toHaveText('PolyCarp');
  await expect(
    page.getByRole('heading', { name: 'How to cite', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.about-citation')).toHaveCount(
    ABOUT.cite?.length ?? 0,
  );
  await expect(
    page
      .locator('.app-header')
      .getByRole('button', { name: 'Cite', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
});

for (const embed of ['?embed', '?embed=1']) {
  test(`/${embed} drops the header and the footer, and the prediction still runs`, async ({
    page,
  }) => {
    await mockPredictionApi(page);
    await page.goto(`/${embed}`);

    await page.getByRole('button', { name: 'Predict class' }).click();
    await expect(page.locator('.predicted-class-name')).toHaveText('random');
    await expect(page.locator('.confidence-value')).toHaveText('73.7%');

    await expect(page.locator('.app-header')).toHaveCount(0);
    await expect(page.getByRole('banner')).toHaveCount(0);
    await expect(page.getByRole('contentinfo')).toHaveCount(0);
  });
}

for (const { path } of ROUTES) {
  test(`${path} loads with no error`, async ({ page }) => {
    const errors = collectErrors(page);
    await mockPageData(page);

    await page.goto(path);
    await page.waitForLoadState('networkidle');

    expect(errors).toStrictEqual([]);
    await expect(page.getByRole('main')).toBeVisible();
  });
}

test('an address the site does not answer opens the prediction tool', async ({
  page,
}) => {
  const errors = collectErrors(page);
  await mockPredictionApi(page);

  await page.goto('/no-such-page/anywhere');

  await expect(page.getByRole('main')).toBeVisible();
  await page.getByRole('button', { name: 'Predict class' }).click();
  await expect(page.locator('.predicted-class-name')).toHaveText('random');
  expect(errors).toStrictEqual([]);
});
