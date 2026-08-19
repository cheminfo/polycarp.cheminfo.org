import { aboutProblems } from 'react-cheminfo/core';
import { expect, test } from 'vitest';

import { ABOUT } from '../about.ts';

test('the record says what the family checks', () => {
  expect(aboutProblems(ABOUT)).toStrictEqual([]);
});

test('it belongs to this site', () => {
  expect(ABOUT.siteId).toBe('polycarp');
});

test('what a visitor can do here is six lines', () => {
  expect(ABOUT.can).toHaveLength(6);
  expect(ABOUT.can[0]).toBe(
    'Draw two monomers, set solvent, temperature and mechanism, and predict the class.',
  );
});

test('it credits every package the page runs on', () => {
  expect(ABOUT.credits).toStrictEqual([
    'openchemlib',
    'react-ocl',
    'react-science',
    'react-cheminfo',
    'blueprint',
    'cheminfo-font',
    'react',
    'vite',
  ]);
});

test('the context is the model and the dataset', () => {
  expect(ABOUT.paragraphs).toHaveLength(2);
  expect(ABOUT.paragraphs?.[1]).toContain('~3,800 copolymerisations');
});

test('the site asks for no citation of its own yet', () => {
  expect(ABOUT.cite).toBeUndefined();
});
