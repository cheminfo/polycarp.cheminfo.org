import { expect, test } from '@playwright/test';

test('the home address renders the three editors the tool works from', async ({
  page,
}) => {
  await page.goto('/');

  const cards = page.locator('.molecule-card');
  await expect(cards).toHaveCount(3);
  await expect(cards.locator('.molecule-card-label')).toHaveText([
    'Monomer 1',
    'Monomer 2',
    'Solvent used for polymerisation',
  ]);
  // Each card draws the structure it holds, so an empty one is not a card.
  await expect(cards.locator('.molecule-card-preview svg')).toHaveCount(3);

  await expect(
    page.getByRole('button', { name: 'Predict class' }),
  ).toBeVisible();
});

test('the landing reaction is styrene + MMA in chloroform at 60 °C', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.locator('#temperature')).toHaveValue('60');
  await expect(page.locator('#method')).toHaveValue('solvent');
  await expect(page.locator('#polytype')).toHaveValue('free radical');
  await expect(page.locator('#solventSet')).toHaveValue('top3');
  await expect(page.locator('#temperatureMode')).toHaveValue('step20');
});

test('the header carries the mark, the wordmark and the four pages', async ({
  page,
}) => {
  await page.goto('/');

  const brand = page.locator('.app-header .brand');
  await expect(brand).toHaveAttribute('href', '/');
  await expect(brand.locator('svg')).toBeVisible();
  await expect(brand.locator('.wordmark__lead')).toHaveText('Poly');
  await expect(brand.locator('.wordmark__alt')).toHaveText('Carp');

  const nav = page.locator('.app-header-nav .nav-link');
  await expect(nav).toHaveText(['Prediction', 'Results', 'API', 'User Guide']);
  await expect(nav.nth(1)).toHaveAttribute('href', '/results');
  await expect(nav.nth(2)).toHaveAttribute('href', '/api-docs');
  await expect(nav.nth(3)).toHaveAttribute('href', '/guide');
  // The brand tint says which page is on show, and only the open one carries it.
  await expect(page.locator('.app-header-nav .nav-link--active')).toHaveText(
    'Prediction',
  );
});

test('the utilities sit right: About, Data, Tools, Share', async ({ page }) => {
  await page.goto('/');

  const utilities = page.locator('.app-header-actions > *');
  await expect(utilities).toHaveCount(4);
  await expect(utilities.nth(0)).toHaveAttribute('href', '/about');
  await expect(utilities.nth(0)).toHaveText('About');
  await expect(utilities.nth(1)).toHaveAttribute(
    'href',
    'https://nomad-lab.eu/prod/v1/gui/search/polymerization',
  );
  await expect(utilities.nth(2)).toHaveClass(/ecosystem-button/);
  await expect(utilities.nth(3)).toHaveText('Share');
});

test('a page link routes without a reload, and retitles the tab', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page).toHaveTitle(
    'Copolymer microstructure prediction — PolyCarp',
  );

  await page.locator('.app-header-nav').getByText('User Guide').click();

  await expect(page).toHaveURL(/\/guide$/);
  await expect(page).toHaveTitle('User guide — PolyCarp');
  await expect(
    page.getByRole('heading', { name: 'Quick start' }),
  ).toBeVisible();
  await expect(page.locator('.guide-step h3')).toHaveText([
    'Define the two monomers',
    'Set reaction conditions',
    'Run the prediction',
  ]);
});

test('a deep address opens on its own page', async ({ page }) => {
  await page.goto('/guide');

  await expect(
    page.getByRole('heading', { name: 'Quick start' }),
  ).toBeVisible();
  await expect(page.locator('.app-header-nav .nav-link--active')).toHaveText(
    'User Guide',
  );
});
