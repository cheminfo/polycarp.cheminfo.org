import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { MONOMER2_SMILES, mockPredictionApi } from './fixtures.ts';

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Where the editor's toolbar and drawing canvas sit. They live in an open
 * shadow root that locators do not pierce reliably, so they are measured in
 * the page.
 * @param page - The page holding one open structure editor.
 * @returns The two boxes, in page coordinates.
 */
async function editorBoxes(
  page: Page,
): Promise<{ toolbar: Box; drawing: Box }> {
  const handle = await page.waitForFunction(() => {
    const root = document.querySelector(
      '[data-openchemlib-canvas-editor]',
    )?.shadowRoot;
    const toolbar = root?.firstElementChild?.getBoundingClientRect();
    const drawing = root
      ?.querySelector('canvas[tabindex]')
      ?.getBoundingClientRect();
    if (!toolbar?.width || !drawing?.width) return null;
    return { toolbar: toolbar.toJSON(), drawing: drawing.toJSON() };
  });
  return (await handle.jsonValue()) as { toolbar: Box; drawing: Box };
}

test('a bond drawn in the editor is in the monomer the prediction is asked for', async ({
  page,
}) => {
  const calls = await mockPredictionApi(page);
  await page.goto('/');

  await page.locator('.molecule-card-preview').first().click();
  const dialog = page.getByRole('dialog', { name: 'Edit — Monomer 1' });
  await expect(dialog).toBeVisible();
  // Measured once the dialog has finished sliding in, or the clicks land
  // where the canvas used to be.
  await expect(page.locator('.bp6-dialog-container')).toHaveClass(
    /bp6-overlay-enter-done/,
  );
  const { toolbar, drawing } = await editorBoxes(page);

  // The fifth button is the single bond, the tool the next click draws with.
  await page.mouse.move(toolbar.x + 12, toolbar.y + 2 + 5 * 21 + 10);
  await expect(page.getByTestId('structure-editor-tooltip')).toContainText(
    'Single bond',
  );

  // Empty space: styrene sits in the middle, the help button top right.
  await page.mouse.click(
    drawing.x + drawing.width - 80,
    drawing.y + drawing.height - 60,
  );
  await dialog.getByRole('button', { name: 'Done' }).click();
  await expect(dialog).toBeHidden();

  await page.getByRole('button', { name: 'Predict class' }).click();
  await expect(page.locator('.predicted-class-name')).toHaveText('random');

  /* eslint-disable camelcase -- the request body is the Python API's. */
  expect(calls.preprocess).toMatchObject({
    // Styrene, with the ethane the click drew beside it.
    monomer1_smiles: 'CC.C=Cc1ccccc1',
    monomer2_smiles: MONOMER2_SMILES,
  });
  /* eslint-enable camelcase */
});
