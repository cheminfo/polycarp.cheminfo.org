import { expect, test } from 'vitest';

import {
  ARCH_COLORS,
  archColor,
  cellBackground,
  classColor,
} from '../archColors.ts';

test('archColor resolves the three canonical class names', () => {
  expect(archColor('alternating')).toBe('#1c3d6e');
  expect(archColor('random to block like')).toBe('#7b2929');
  expect(archColor('gradient')).toBe('#b5621e');
});

test('archColor matches case-insensitively and on loose variants', () => {
  expect(archColor('Alternating')).toBe('#1c3d6e');
  expect(archColor('RANDOM')).toBe('#7b2929');
  expect(archColor('block')).toBe('#7b2929');
  expect(archColor('Gradient copolymer')).toBe('#b5621e');
});

test('archColor falls back to grey for an unknown name', () => {
  expect(archColor('statistical')).toBe('#555');
  expect(archColor('')).toBe('#555');
});

test('classColor prefers the numeric index over the name', () => {
  expect(classColor('gradient', 0)).toBe('#1c3d6e');
  expect(classColor('alternating', 2)).toBe('#b5621e');
});

test('classColor falls back to the name for an out-of-range index', () => {
  expect(classColor('gradient', 7)).toBe('#b5621e');
  expect(classColor('unknown', 7)).toBe('#555');
});

test('classColor uses the name when no index is given', () => {
  expect(classColor('random to block like')).toBe('#7b2929');
});

test('ARCH_COLORS holds the three model class colours in index order', () => {
  expect(ARCH_COLORS).toStrictEqual(['#1c3d6e', '#7b2929', '#b5621e']);
});

test('cellBackground interpolates from the neutral tint to the class colour', () => {
  // t = 0.4 at confidence 0, e.g. red: 240 + (28 - 240) * 0.4 = 155.2 -> 155
  expect(cellBackground(0, 0)).toBe('rgb(155,171,193)');
  // t = 1 at confidence 1: the class colour itself, #1c3d6e
  expect(cellBackground(0, 1)).toBe('rgb(28,61,110)');
  expect(cellBackground(2, 1)).toBe('rgb(181,98,30)');
});

test('cellBackground falls back to grey for an unknown class index', () => {
  expect(cellBackground(9, 1)).toBe('rgb(85,85,85)');
});
