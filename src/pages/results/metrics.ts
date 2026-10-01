import type { SplitMetrics } from '../../types.ts';

/** The order the per-class table reads in, the macro average last. */
export const ROW_ORDER = ['Alternating', 'Random', 'Gradient', 'Macro'];

/** The columns of the per-class table, in the order they are shown. */
export const METRICS_HEADER = [
  'Class',
  'XGBoost Acc',
  'XGBoost Prec',
  'XGBoost F1',
  'Voting Acc',
  'Voting Prec',
  'Voting F1',
];

/**
 * The per-class metrics table as cells, ready to be handed over: the same rows,
 * in the same order, with the same three decimals.
 * @param split - The split whose two models are compared.
 * @returns One line of cells per class both models report.
 */
export function metricsRows(split: SplitMetrics): string[][] {
  const rows: string[][] = [];
  for (const cls of ROW_ORDER) {
    const xgboost = split.xgboost.per_class[cls];
    const voting = split.voting.per_class[cls];
    if (!xgboost || !voting) continue;
    rows.push([
      cls,
      xgboost.acc.toFixed(3),
      xgboost.prec.toFixed(3),
      xgboost.f1.toFixed(3),
      voting.acc.toFixed(3),
      voting.prec.toFixed(3),
      voting.f1.toFixed(3),
    ]);
  }
  return rows;
}
