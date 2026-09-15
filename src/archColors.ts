import type { ColorScale, Swatch } from 'react-cheminfo/core';
import { colorAt, evenScale, swatchAt } from 'react-cheminfo/core';

/**
 * Hex colors for the three polymer architecture classes, indexed by the real
 * model class index (matches the backend `CLASS_LABELS` in
 * `copol_prediction/api/app.py`):
 *   [0] = alternating
 *   [1] = random to block like
 *   [2] = gradient
 */
export const ARCH_COLORS: readonly [string, string, string] = [
  '#1c3d6e', // 0 = alternating
  '#7b2929', // 1 = random to block like
  '#b5621e', // 2 = gradient
];

/**
 * Resolves a class name to its canonical model class index.
 * Matches by substring (case-insensitive) and tolerates loose names
 * (e.g. `"random"`, `"block"`). Returns `undefined` for unknown strings.
 * @param name - Predicted class name, e.g. `"alternating"`, `"random to block like"`, `"gradient"`.
 * @returns Zero-based class index, or `undefined` if the name is unrecognized.
 */
function classIndexForName(name: string): number | undefined {
  const lower = name.toLowerCase();
  if (lower.includes('gradient')) return 2;
  if (lower.includes('alternating')) return 0;
  // `"random to block like"` plus loose variants like `"random"` / `"block"`.
  if (lower.includes('random') || lower.includes('block')) return 1;
  return undefined;
}

/**
 * Returns the architecture colour for a predicted class name.
 * Resolves the name to its canonical class index so the result matches what
 * `classColor` would return for the same class. Falls back to `'#555'` for
 * genuinely unknown names.
 * @param name - Predicted class name, e.g. `"alternating"`, `"random to block like"`, `"gradient"`.
 * @returns Hex colour string.
 */
export function archColor(name: string): string {
  const index = classIndexForName(name);
  return (index === undefined ? undefined : ARCH_COLORS[index]) ?? '#555';
}

/**
 * Returns the architecture colour by numeric class index, or falls back to
 * a name-based lookup when no index is given.
 * @param name - Predicted class name used as fallback when index is absent.
 * @param index - Zero-based class index (0 = alternating, 1 = random to block like, 2 = gradient).
 * @returns Hex colour string.
 */
export function classColor(name: string, index?: number): string {
  if (index !== undefined) return ARCH_COLORS[index] ?? archColor(name);
  return archColor(name);
}

/** The tint a cell carries when the classifier is least confident. */
const NEUTRAL_TINT = '#f0f4f8';

/** The two inks a heatmap cell is written in, whichever reads better. */
const CELL_INK = { dark: '#1c2127', light: '#ffffff' };

/**
 * The ramp a heatmap cell is read on: the neutral tint at its low end, the
 * class colour at its high end.
 * @param classIndex - Zero-based class index (0 = alternating, 1 = random to block like, 2 = gradient).
 * @returns The two-stop scale for that class.
 */
function cellScale(classIndex: number): ColorScale {
  return evenScale([NEUTRAL_TINT, ARCH_COLORS[classIndex] ?? '#555555']);
}

/**
 * Where a confidence sits on the cell ramp. The low end is never reached, so
 * an unconfident cell still reads as its class rather than as blank paper.
 * @param confidence - Classifier confidence in [0, 1].
 * @returns A position on the scale, from 0.4 to 1.
 */
function cellPosition(confidence: number): number {
  return 0.4 + confidence * 0.6;
}

/**
 * Returns the background colour for a heatmap cell.
 * Interpolates from `#f0f4f8` (low confidence) toward the class colour (high).
 * @param classIndex - Zero-based class index (0 = alternating, 1 = random to block like, 2 = gradient).
 * @param confidence - Classifier confidence in [0, 1].
 * @returns A `#rrggbb` colour.
 */
export function cellBackground(classIndex: number, confidence: number): string {
  return colorAt(cellScale(classIndex), cellPosition(confidence));
}

/**
 * Returns the background of a heatmap cell together with the ink that stays
 * readable on it, which is decided by contrast against the colour that was
 * actually mixed rather than by the confidence that produced it.
 * @param classIndex - Zero-based class index (0 = alternating, 1 = random to block like, 2 = gradient).
 * @param confidence - Classifier confidence in [0, 1].
 * @returns The cell background and the ink to write the value in.
 */
export function cellSwatch(classIndex: number, confidence: number): Swatch {
  return swatchAt(cellScale(classIndex), cellPosition(confidence), CELL_INK);
}
