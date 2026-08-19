import { expect, test } from '@playwright/test';

import {
  MONOMER1_SMILES,
  MONOMER2_SMILES,
  SOLVENT_SMILES,
  mockPredictionApi,
} from './fixtures.ts';

// The prediction the fixture replays is the service's own answer for the
// reaction the page lands on: styrene + methyl methacrylate in chloroform at
// 60 °C gives `random` at 73.7% confidence, and the nearest literature reaction
// (the same pair, chloroform, 38 °C) agrees with it.

test('a prediction fills the card with the class, its confidence and the odds', async ({
  page,
}) => {
  await mockPredictionApi(page);
  await page.goto('/');

  await page.getByRole('button', { name: 'Predict class' }).click();

  const card = page.locator('.prediction-card');
  await expect(
    card.getByRole('heading', { name: 'Prediction result' }),
  ).toBeVisible();
  await expect(card.locator('.predicted-class-name')).toHaveText('random');
  // #7b2929 — the colour archColors.test.ts pins to the random class.
  await expect(card.locator('.predicted-class-name')).toHaveCSS(
    'background-color',
    'rgb(123, 41, 41)',
  );
  await expect(card.locator('.confidence-value')).toHaveText('73.7%');

  // The three classes, most likely first, each with its own colour.
  const rows = card.locator('.class-probs-table tbody tr');
  await expect(rows).toHaveCount(3);
  await expect(rows.locator('td').nth(0)).toHaveText('random');
  await expect(rows).toContainText(['73.67%', '22.44%', '3.89%']);
  await expect(rows.nth(1).locator('td').first()).toHaveText('gradient');
  await expect(rows.nth(2).locator('td').first()).toHaveText('alternating');
  await expect(card.locator('tr.predicted td').first()).toHaveText('random');
  await expect(rows.nth(2).locator('.class-dot')).toHaveCSS(
    'background-color',
    'rgb(28, 61, 110)',
  );

  await expect(card.locator('.lookup-agree')).toHaveText(
    '✓ Nearest-neighbour lookup agrees',
  );
  await expect(card.locator('.lookup-disagree')).toHaveCount(0);
  await expect(page.locator('.error-banner')).toHaveCount(0);
});

test('the page sends the drawn reaction, and drops the features the service could not compute', async ({
  page,
}) => {
  const calls = await mockPredictionApi(page);
  await page.goto('/');

  await page.getByRole('button', { name: 'Predict class' }).click();
  await expect(page.locator('.predicted-class-name')).toHaveText('random');

  /* eslint-disable camelcase -- the request bodies are the Python API's. */
  expect(calls.preprocess).toStrictEqual({
    monomer1_smiles: MONOMER1_SMILES,
    monomer2_smiles: MONOMER2_SMILES,
    solvent_smiles: SOLVENT_SMILES,
    method: 'solvent',
    polytype: 'free radical',
    temperature: 60,
  });

  // A null descriptor must never reach /predict: the model rejects it.
  expect(Object.keys(calls.predict?.features as object)).toStrictEqual([
    'homo_1',
    'lumo_1',
    'homo_2',
    'lumo_2',
    'temperature',
    'solvent_logp',
  ]);
  expect(calls.optimize).toMatchObject({
    solvent_set: 'top3',
    temperature_mode: 'step20',
    temperature_step: 20,
    n_solvents: 3,
  });
  /* eslint-enable camelcase */
});

test('a changed condition is the one the prediction runs with', async ({
  page,
}) => {
  const calls = await mockPredictionApi(page);
  await page.goto('/');

  await page.locator('#temperature').fill('80');
  await page.locator('#polytype').selectOption('cationic');
  await page.getByRole('button', { name: 'Predict class' }).click();
  await expect(page.locator('.predicted-class-name')).toHaveText('random');

  expect(calls.preprocess).toMatchObject({
    temperature: 80,
    polytype: 'cationic',
  });
});

test('a monomer picked from the templates replaces the drawing', async ({
  page,
}) => {
  const calls = await mockPredictionApi(page);
  await page.goto('/');

  await page
    .locator('.molecule-card')
    .first()
    .getByRole('button', { name: 'Templates' })
    .click();
  await page.getByRole('button', { name: 'Maleic anhydride' }).click();

  await page.getByRole('button', { name: 'Predict class' }).click();
  await expect(page.locator('.predicted-class-name')).toHaveText('random');

  /* eslint-disable camelcase -- the request body is the Python API's. */
  expect(calls.preprocess).toMatchObject({
    monomer1_smiles: 'O=C1C=CC(=O)O1',
    monomer2_smiles: MONOMER2_SMILES,
  });
  /* eslint-enable camelcase */
});

test('the results panels are the four the prediction produced', async ({
  page,
}) => {
  await mockPredictionApi(page);
  await page.goto('/');

  await page.getByRole('button', { name: 'Predict class' }).click();
  await expect(page.locator('.predicted-class-name')).toHaveText('random');

  await expect(page.locator('.results-subtabs [role="tab"]')).toHaveText([
    'Prediction',
    'Condition optimization',
    'Architecture switch',
    'Nearest literature',
  ]);

  await page.getByRole('tab', { name: 'Nearest literature' }).click();
  const literature = page.locator('.nearest-table tbody tr');
  await expect(literature).toHaveCount(2);
  // The exact-pair reaction is pinned first whatever the sort.
  await expect(literature.first().locator('.same-monomer-badge')).toHaveText(
    'same monomers',
  );
  await expect(literature.first().locator('td').nth(2)).toHaveText(
    'chloroform',
  );
  await expect(literature.first().locator('td').nth(3)).toHaveText('38');
  await expect(literature.first().locator('.arch-badge')).toHaveText('random');
  await expect(literature.first().locator('.similarity-badge')).toHaveText(
    '1.00',
  );
  await expect(literature.nth(1).locator('.arch-badge')).toHaveText(
    'alternating',
  );

  await page.getByRole('tab', { name: 'Condition optimization' }).click();
  await expect(page.locator('.optim-grid thead th')).toHaveText([
    'Solvent',
    '40°C',
    '60°C',
  ]);
  await expect(page.locator('.optim-solvent-name')).toHaveText([
    'chloroform',
    'toluene',
  ]);
  await expect(page.locator('.optim-solvent-logp').first()).toHaveText(
    'logP 1.99',
  );
  await expect(page.locator('.optim-pred-cell')).toHaveText([
    '78.2%',
    '73.7%',
    '78.2%',
    '73.7%',
  ]);

  await page.getByRole('tab', { name: 'Architecture switch' }).click();
  await expect(page.locator('.arch-baseline')).toContainText(
    'Baseline: random in chloroform at 60°C',
  );
  await expect(page.locator('.arch-baseline')).toContainText(
    '(9 combinations evaluated)',
  );
  await expect(page.locator('.arch-card')).toContainText(
    'No architecture switch found in the evaluated condition space.',
  );
});

test('a service that is down is reported, not swallowed', async ({ page }) => {
  await page.route('**/api/preprocess_all', (route) =>
    route.fulfill({ status: 503, body: 'model container restarting' }),
  );
  await page.goto('/');

  await page.getByRole('button', { name: 'Predict class' }).click();

  await expect(page.locator('.error-banner')).toHaveText(
    '⚠ API error 503: model container restarting',
  );
  await expect(page.locator('.prediction-card')).toHaveCount(0);
});
