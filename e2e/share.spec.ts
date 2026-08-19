import { expect, test } from '@playwright/test';

import { mockPredictionApi } from './fixtures.ts';

test('an embedded page renders no header, and the tool still works', async ({
  page,
}) => {
  await page.goto('/?embed=1');

  await expect(page.locator('.app-header')).toHaveCount(0);
  await expect(page.locator('.molecule-card')).toHaveCount(3);
  await expect(
    page.getByRole('button', { name: 'Predict class' }),
  ).toBeVisible();
});

test('hide=optimization drops the panel it names and its two settings', async ({
  page,
}) => {
  await mockPredictionApi(page);
  await page.goto('/?hide=optimization');

  await expect(page.locator('#solventSet')).toHaveCount(0);
  await expect(page.locator('#temperatureMode')).toHaveCount(0);
  await expect(page.getByText('Reaction Optimization')).toHaveCount(0);
  // The settings it does not name are untouched.
  await expect(page.locator('#temperature')).toHaveValue('60');

  await page.getByRole('button', { name: 'Predict class' }).click();
  await expect(page.locator('.results-subtabs [role="tab"]')).toHaveText([
    'Prediction',
    'Architecture switch',
    'Nearest literature',
  ]);
});

test('an unknown hide key is ignored, so an old link still opens', async ({
  page,
}) => {
  await mockPredictionApi(page);
  await page.goto('/?hide=literature,renamedLastYear');

  await page.getByRole('button', { name: 'Predict class' }).click();
  await expect(page.locator('.results-subtabs [role="tab"]')).toHaveText([
    'Prediction',
    'Condition optimization',
    'Architecture switch',
  ]);
});

test('the configuration survives a move to another page', async ({ page }) => {
  await page.goto('/?hide=literature');

  await page.locator('.app-header-nav').getByText('User Guide').click();

  await expect(page).toHaveURL('/guide?hide=literature');
});

test('the dialog hands out both a link and an iframe', async ({ page }) => {
  await page.goto('/');

  await page.locator('.app-header-actions').getByText('Share').click();

  const dialog = page.locator('.share-dialog');
  // It opens on the link one actually hands out: framed, with the part marked
  // `hiddenByDefault` already switched off.
  await expect(dialog.locator('.code-block pre').first()).toHaveText(
    'https://polycarp.cheminfo.org/?embed=1&hide=architecture',
  );
  await expect(dialog.locator('.code-block pre').nth(1)).toContainText(
    'title="PolyCarp — Copolymer microstructure prediction"',
  );
  await expect(dialog.locator('.code-block pre').nth(1)).toContainText(
    'width="100%"',
  );

  // Blueprint's own indicator covers the input, so the label is what a visitor
  // clicks and what the spec clicks.
  await dialog.getByText('Condition optimization', { exact: true }).click();
  await expect(
    dialog.getByRole('checkbox', { name: 'Condition optimization' }),
  ).not.toBeChecked();

  await expect(dialog.locator('.code-block pre').first()).toHaveText(
    'https://polycarp.cheminfo.org/?embed=1&hide=optimization,architecture',
  );
});
