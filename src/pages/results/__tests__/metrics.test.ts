/* eslint-disable camelcase -- the metrics shape is the Python API's. */
import { expect, test } from 'vitest';

import type {
  ClassMetrics,
  ModelMetrics,
  SplitMetrics,
} from '../../../types.ts';
import { metricsToTsv } from '../metrics.ts';

const ALTERNATING: ClassMetrics = { acc: 0.8, prec: 0.8, f1: 0.8 };
const RANDOM: ClassMetrics = { acc: 0.8, prec: 0.73, f1: 0.76 };
const GRADIENT: ClassMetrics = { acc: 0.6, prec: 0.75, f1: 0.67 };
const MACRO: ClassMetrics = { acc: 0.73, prec: 0.76, f1: 0.74 };

/**
 * A model whose per-class numbers are the ones given, and whose confusion
 * matrix is not read by the TSV.
 * @param perClass - The classes it reports.
 * @returns The model metrics.
 */
function model(perClass: Record<string, ClassMetrics>): ModelMetrics {
  return { confusion_matrix: [], per_class: perClass };
}

/**
 * A split whose two models report the classes given.
 * @param xgboost - The plain classifier's classes.
 * @param voting - The voting model's classes.
 * @returns The split.
 */
function split(
  xgboost: Record<string, ClassMetrics>,
  voting: Record<string, ClassMetrics>,
): SplitMetrics {
  return {
    n: 20,
    xgboost: model(xgboost),
    voting: model(voting),
    predictions: [],
  };
}

test('the table is written in the page order, the macro average last', () => {
  const tsv = metricsToTsv(
    split(
      {
        Gradient: GRADIENT,
        Macro: MACRO,
        Alternating: ALTERNATING,
        Random: RANDOM,
      },
      {
        Gradient: GRADIENT,
        Macro: MACRO,
        Alternating: ALTERNATING,
        Random: RANDOM,
      },
    ),
  );

  expect(tsv).toBe(
    [
      'Class\tXGBoost Acc\tXGBoost Prec\tXGBoost F1\tVoting Acc\tVoting Prec\tVoting F1',
      'Alternating\t0.800\t0.800\t0.800\t0.800\t0.800\t0.800',
      'Random\t0.800\t0.730\t0.760\t0.800\t0.730\t0.760',
      'Gradient\t0.600\t0.750\t0.670\t0.600\t0.750\t0.670',
      'Macro\t0.730\t0.760\t0.740\t0.730\t0.760\t0.740',
    ].join('\n'),
  );
});

test('a class only one model reports is left out, as the table leaves it out', () => {
  const tsv = metricsToTsv(
    split(
      { Alternating: ALTERNATING, Gradient: GRADIENT, Macro: MACRO },
      { Alternating: ALTERNATING, Macro: MACRO },
    ),
  );

  expect(tsv.split('\n')).toStrictEqual([
    'Class\tXGBoost Acc\tXGBoost Prec\tXGBoost F1\tVoting Acc\tVoting Prec\tVoting F1',
    'Alternating\t0.800\t0.800\t0.800\t0.800\t0.800\t0.800',
    'Macro\t0.730\t0.760\t0.740\t0.730\t0.760\t0.740',
  ]);
});
