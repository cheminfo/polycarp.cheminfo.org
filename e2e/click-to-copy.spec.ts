/* eslint-disable camelcase -- the /paper_metrics payload is the Python API's. */
import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import type { PaperMetricsResponse } from '../src/types.ts';

import {
  MONOMER1_SMILES,
  MONOMER2_SMILES,
  SOLVENT_SMILES,
  mockPredictionApi,
} from './fixtures.ts';

// The tool is clicked and dragged, not read: chrome.css makes the body
// unselectable, and what a visitor would paste elsewhere is copied by clicking
// it instead. Every value asserted below is the one the fixture replays.

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

const OPENAPI = {
  openapi: '3.1.0',
  info: { title: 'PolyCarp', version: '1.0.0' },
  paths: {},
};

const PAPER_METRICS: PaperMetricsResponse = {
  classes: ['Alternating', 'Random', 'Gradient'],
  generated_at: '2026-08-19T06:34:46',
  splits: {
    train: {
      n: 20,
      xgboost: {
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
      },
      voting: {
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
        coverage: 0.9,
        retained: 18,
      },
      predictions: [],
    },
    test: {
      n: 20,
      xgboost: {
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
      },
      voting: {
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
        coverage: 0.9,
        retained: 18,
      },
      predictions: [
        {
          monomer1_smiles: MONOMER1_SMILES,
          monomer2_smiles: MONOMER2_SMILES,
          monomer1_name: 'styrene',
          monomer2_name: 'methyl methacrylate',
          solvent_name: 'chloroform',
          solvent_smiles: SOLVENT_SMILES,
          temperature: 60,
          method: 'solvent',
          polytype: 'free radical',
          true_class: 1,
          true_class_name: 'random',
          xgb_class: 1,
          xgb_class_name: 'random',
          confidence: 0.7367,
          lookup_class: 1,
          lookup_class_name: 'random',
          lookup_similarity: 1,
          agree: true,
          correct: true,
          doi: '10.1021/ed049p367',
          doi_url: 'https://doi.org/10.1021/ed049p367',
        },
      ],
    },
  },
};

/**
 * Answers the two GET endpoints the Results and API pages read.
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
 * Click a copyable value and return what it put on the clipboard.
 * @param page - The page under test.
 * @param value - The value to click.
 * @returns The clipboard's text once the value says it copied.
 */
async function copyAndRead(page: Page, value: Locator): Promise<string> {
  await value.click();
  await expect(value).toHaveAttribute('data-copy', 'copied');
  return page.evaluate(() => navigator.clipboard.readText());
}

/**
 * The computed `user-select` of an element.
 * @param value - The element to measure.
 * @returns What the browser resolved `user-select` to.
 */
function userSelect(value: Locator): Promise<string> {
  return value.evaluate((node) => window.getComputedStyle(node).userSelect);
}

/**
 * Run the prediction the page lands on and wait for its card.
 * @param page - The page under test.
 */
async function predict(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Predict class' }).click();
  await expect(page.locator('.predicted-class-name')).toHaveText('random');
}

test('the text of the tool cannot be selected, but a field still can', async ({
  page,
}) => {
  await page.goto('/');

  const label = page.locator('.molecule-card-label').first();
  expect(await userSelect(label)).toBe('none');

  await label.dblclick();
  expect(await page.evaluate(() => window.getSelection()?.toString())).toBe('');

  // A form control is typed in, so it keeps its selection.
  expect(await userSelect(page.locator('#temperature'))).toBe('text');
});

test('the prediction card copies its class, its confidence and an odds cell', async ({
  page,
}) => {
  await mockPredictionApi(page);
  await page.goto('/');
  await predict(page);

  const card = page.locator('.prediction-card');
  const predicted = card.locator('.predicted-class-name');
  expect(
    await predicted.evaluate((node) => window.getComputedStyle(node).cursor),
  ).toBe('copy');
  await expect(predicted).toHaveAttribute(
    'title',
    'Copy the predicted class (random)',
  );
  expect(await copyAndRead(page, predicted)).toBe('random');
  // The class colour is the cell's meaning, so copying must not repaint it.
  await expect(predicted).toHaveCSS('background-color', 'rgb(123, 41, 41)');

  expect(await copyAndRead(page, card.locator('.confidence-value'))).toBe(
    '73.7%',
  );

  const gradientCell = card
    .locator('.class-probs-table tbody tr')
    .nth(1)
    .locator('td')
    .nth(2);
  await expect(gradientCell).toHaveAttribute(
    'title',
    'Copy the gradient probability (22.44%)',
  );
  expect(await copyAndRead(page, gradientCell)).toBe('22.44%');
});

test('each molecule card shows the SMILES it draws, and copies it', async ({
  page,
}) => {
  await page.goto('/');

  const smiles = page.locator('.molecule-card-smiles');
  await expect(smiles).toHaveText([
    MONOMER1_SMILES,
    MONOMER2_SMILES,
    SOLVENT_SMILES,
  ]);

  expect(await copyAndRead(page, smiles.nth(1))).toBe(MONOMER2_SMILES);
  // The copy is the whole click: the editor the preview opens stays shut.
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('a literature reaction copies its structure and its DOI', async ({
  page,
}) => {
  await mockPredictionApi(page);
  await page.goto('/');
  await predict(page);

  await page.getByRole('tab', { name: 'Nearest literature' }).click();
  const rows = page.locator('.nearest-table tbody tr');
  // The second row is the maleic-anhydride analogue, whose monomer 2 differs.
  const structure = rows.nth(1).locator('.nearest-structure').nth(1);
  expect(await copyAndRead(page, structure)).toBe('O=C1C=CC(=O)O1');

  await rows.first().getByLabel('DOI: 10.1021/ed049p367').hover();
  const doi = page.locator('.doi-value');
  await expect(doi).toHaveText('10.1021/ed049p367');
  expect(await copyAndRead(page, doi)).toBe('10.1021/ed049p367');
});

test('the optimization grid copies the solvent, its logP and a cell', async ({
  page,
}) => {
  await mockPredictionApi(page);
  await page.goto('/');
  await predict(page);

  await page.getByRole('tab', { name: 'Condition optimization' }).click();

  // The row reads "toluene" and copies what the editor takes: its SMILES.
  const toluene = page.locator('.optim-solvent-name').nth(1);
  await expect(toluene).toHaveText('toluene');
  expect(await copyAndRead(page, toluene)).toBe('Cc1ccccc1');

  const logP = page.locator('.optim-solvent-logp').first();
  await expect(logP).toHaveText('logP 1.99');
  expect(await copyAndRead(page, logP.locator('.click-to-copy'))).toBe('1.99');

  const cell = page.locator('.optim-pred-cell').first();
  await expect(cell).toHaveAttribute(
    'title',
    'Copy the random confidence (78.2%)',
  );
  expect(await copyAndRead(page, cell)).toBe('78.2%');
});

test('the results page copies a metric, the headline numbers and the table', async ({
  page,
}) => {
  await mockPageData(page);
  await page.goto('/results');

  const split = page.locator('.results-split').first();
  await expect(split.locator('.results-headline .click-to-copy')).toHaveText([
    '75.0%',
    '90%',
    '0.740',
  ]);

  const macroF1 = split.locator('.metrics-table tbody tr').nth(3).locator('td');
  await expect(macroF1.nth(6)).toHaveAttribute(
    'title',
    'Copy the Macro voting F1 (0.740)',
  );
  expect(await copyAndRead(page, macroF1.nth(1))).toBe('0.730');

  // Scoped to the button: the cell copied just above still holds its own
  // "Copied" status for a second and a half, and the accessible name of the
  // button stays its label once the text changes.
  const copyTable = split.getByRole('button', { name: 'Copy table' });
  await copyTable.click();
  await expect(copyTable).toContainText('Copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    [
      'Class\tXGBoost Acc\tXGBoost Prec\tXGBoost F1\tVoting Acc\tVoting Prec\tVoting F1',
      'Alternating\t0.800\t0.800\t0.800\t0.800\t0.800\t0.800',
      'Random\t0.800\t0.730\t0.760\t0.800\t0.730\t0.760',
      'Gradient\t0.600\t0.750\t0.670\t0.600\t0.750\t0.670',
      'Macro\t0.730\t0.760\t0.740\t0.730\t0.760\t0.740',
    ].join('\n'),
  );

  // The individual rows show the name and copy the SMILES behind it.
  const row = page.locator('.ind-table tbody tr').first();
  await expect(row.locator('td').nth(0)).toHaveText('styrene');
  expect(await copyAndRead(page, row.locator('td').nth(0))).toBe(
    MONOMER1_SMILES,
  );
  expect(await copyAndRead(page, row.locator('td').nth(2))).toBe(
    SOLVENT_SMILES,
  );
});

test('a page a reader quotes from stays selectable', async ({ page }) => {
  await mockPageData(page);

  await page.goto('/guide');
  expect(await userSelect(page.locator('.guide-content'))).toBe('text');
  expect(await userSelect(page.locator('.guide-step-body p').first())).toBe(
    'text',
  );

  await page.goto('/api-docs');
  const docs = page.locator('.api-docs-tab');
  expect(await userSelect(docs)).toBe('text');
  await expect(docs.locator('.info .title')).toContainText('PolyCarp');
  expect(await userSelect(docs.locator('.info .title'))).toBe('text');
});
