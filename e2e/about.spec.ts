import { expect, test } from '@playwright/test';

// Every string below is quoted from src/about.ts, the ecosystem record and the
// credits registry — the About page is what those become, so a page that drifts
// from them has lost a credit or a licence without anybody noticing.

test('About opens from the header and names the site', async ({ page }) => {
  await page.goto('/');

  await page.locator('.app-header-actions').getByText('About').click();

  await expect(page).toHaveURL(/\/about$/);
  const hero = page.locator('.about-page .about-hero');
  await expect(hero.locator('h1 .wordmark__lead')).toHaveText('Poly');
  await expect(hero.locator('h1 .wordmark__alt')).toHaveText('Carp');
  await expect(hero.locator('p').first()).toHaveText(
    'Predict the microstructure of a radical copolymerisation.',
  );
  await expect(hero.locator('p').nth(1)).toHaveText(
    'PolyCarp predicts whether a radical copolymerisation gives an alternating, random to block-like or gradient copolymer.',
  );
});

test('what you can do here is the six lines the record carries', async ({
  page,
}) => {
  await page.goto('/about');

  await expect(page.locator('.about-can h2')).toHaveText(
    'What you can do here',
  );
  await expect(page.locator('.about-can li')).toHaveText([
    'Draw two monomers, set solvent, temperature and mechanism, and predict the class.',
    'Read the nearest literature copolymerisations the prediction was checked against.',
    'Sweep solvents and temperatures to find conditions that switch the architecture.',
    'See where the classifier and its literature analogue disagree, flagged on the card.',
    "Browse the model's per-class accuracy on the training and test splits.",
    'Call the same predictions from the REST API.',
  ]);
});

test('every borrowed work is credited with its licence', async ({ page }) => {
  await page.goto('/about');

  const credits = page.locator('.about-credits .credits-list li');
  await expect(credits).toHaveCount(8);
  await expect(credits.locator('a')).toHaveText([
    'OpenChemLib',
    'react-ocl',
    'react-science',
    'react-cheminfo',
    'Blueprint',
    'cheminfo-font',
    'React',
    'Vite',
  ]);
  // The licence beside the work is what makes this a credit rather than a list
  // of links, and it is the part a hand-written page forgets.
  await expect(credits.nth(0)).toContainText('BSD-3-Clause');
  await expect(credits.nth(4)).toContainText('Apache-2.0');
  await expect(credits.nth(5)).toContainText('CC-BY-4.0');
  await expect(credits.nth(0).locator('a')).toHaveAttribute(
    'href',
    'https://github.com/cheminfo/openchemlib-js',
  );
});

test('the licence and the sources are named, and so is where to report', async ({
  page,
}) => {
  await page.goto('/about');

  const licence = page.locator('.about-licence');
  await expect(licence.locator('h2')).toHaveText('Licence and source');
  await expect(licence.locator('p')).toContainText('MIT, © cheminfo.');
  await expect(licence.locator('a')).toHaveAttribute(
    'href',
    'https://github.com/cheminfo/polycarp.cheminfo.org',
  );

  await expect(page.locator('.about-issues a')).toHaveAttribute(
    'href',
    'https://github.com/cheminfo/polycarp.cheminfo.org/issues',
  );
});

test('the site says how the model and its dataset were built', async ({
  page,
}) => {
  await page.goto('/about');

  await expect(page.locator('.about-context p')).toHaveCount(2);
  await expect(page.locator('.about-context p').nth(1)).toContainText(
    '~3,800 copolymerisations extracted from ~1,200 publications',
  );

  const built = page.locator('.about-section', {
    has: page.getByRole('heading', { name: 'How it is built' }),
  });
  await expect(built.locator('li strong')).toHaveText([
    'Extraction',
    'Curation',
    'Descriptors',
    'Model',
    'Service',
  ]);
  await expect(
    built.getByRole('link', { name: 'lamalab-org/PolyCARP' }),
  ).toHaveAttribute('href', 'https://github.com/lamalab-org/PolyCARP');
});
