import { signal } from '@preact/signals-react';

import { runPrediction } from '../api.ts';
import type { PaperMetricsResponse, PredictionResults } from '../types.ts';

import { preferences } from './preferences.ts';
import { view } from './view.ts';

/** Loaded and derived domain data. Session-only — never persisted. */
export const data = {
  prediction: {
    results: signal<PredictionResults | null>(null),
    loading: signal(false),
    error: signal<string | null>(null),
  },
  paperMetrics: {
    metrics: signal<PaperMetricsResponse | null>(null),
    loading: signal(false),
    error: signal<string | null>(null),
  },
};

/**
 * Runs the prediction pipeline for the current reaction preferences and stores
 * the outcome. Never throws — the failure is reported through `data`.
 */
export async function predict(): Promise<void> {
  const { reaction, optimization } = preferences;
  if (
    !reaction.monomer1Smiles.value ||
    !reaction.monomer2Smiles.value ||
    !reaction.solventSmiles.value
  ) {
    data.prediction.error.value =
      'Please draw all three structures (Monomer 1, Monomer 2, Solvent).';
    return;
  }

  data.prediction.loading.value = true;
  data.prediction.error.value = null;
  data.prediction.results.value = null;
  view.resultsPanel.value = 'prediction';

  try {
    data.prediction.results.value = await runPrediction({
      monomer1Smiles: reaction.monomer1Smiles.value,
      monomer2Smiles: reaction.monomer2Smiles.value,
      solventSmiles: reaction.solventSmiles.value,
      temperature: reaction.temperature.value,
      method: reaction.method.value,
      polytype: reaction.polytype.value,
      solventSet: optimization.solventSet.value,
      temperatureMode: optimization.temperatureMode.value,
    });
  } catch (error) {
    data.prediction.error.value =
      error instanceof Error ? error.message : String(error);
  } finally {
    data.prediction.loading.value = false;
  }
}
