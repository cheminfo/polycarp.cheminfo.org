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

/**
 * Returns an RGB background colour for a heatmap cell.
 * Interpolates from `#f0f4f8` (low confidence) toward the class colour (high).
 * @param classIndex - Zero-based class index (0 = alternating, 1 = random to block like, 2 = gradient).
 * @param confidence - Classifier confidence in [0, 1].
 * @returns CSS `rgb(...)` string.
 */
export function cellBackground(classIndex: number, confidence: number): string {
  const hex = ARCH_COLORS[classIndex] ?? '#555555';
  const r1 = 240;
  const g1 = 244;
  const b1 = 248;
  const r2 = Number.parseInt(hex.slice(1, 3), 16);
  const g2 = Number.parseInt(hex.slice(3, 5), 16);
  const b2 = Number.parseInt(hex.slice(5, 7), 16);
  const t = 0.4 + confidence * 0.6;
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}
