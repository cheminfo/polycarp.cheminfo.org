/* eslint-disable camelcase -- the payloads below are the Python API's own
   snake_case responses, quoted as the service sends them. */
import type { Page } from '@playwright/test';

import type {
  ArchitectureSwitchResponse,
  OptimizeResponse,
  PredictResponse,
  PreprocessResponse,
} from '../src/types.ts';

/**
 * One prediction, captured from the live service on 2026-08-19 for the
 * reaction the page lands on: styrene + methyl methacrylate in chloroform at
 * 60 °C, free radical, solvent method. The numbers are the model's own, so a
 * spec asserting them is asserting a known-good answer rather than a made-up
 * one; the service is not called during a test run.
 */
export const MONOMER1_SMILES = 'C=Cc1ccccc1';
export const MONOMER2_SMILES = 'C=C(C)C(=O)OC';
export const SOLVENT_SMILES = 'ClC(Cl)Cl';

const PREPROCESS: PreprocessResponse = {
  success: true,
  features: {
    homo_1: -0.3831983426925056,
    lumo_1: -0.25019698362403947,
    homo_2: -0.411266206644472,
    lumo_2: -0.2694879036811149,
    temperature: 60,
    solvent_logp: 1.9864,
    // A descriptor the service could not compute. The page must drop it before
    // calling /predict, which `predict.spec.ts` asserts on the request body.
    solvent_TPSA: null,
  },
  nearest_neighbors: [
    {
      rank: 1,
      similarity: 1,
      same_monomer: true,
      monomer1_smiles: MONOMER1_SMILES,
      monomer2_smiles: MONOMER2_SMILES,
      solvent_name: 'chloroform',
      temperature: 38,
      method: 'solvent',
      polytype: 'free radical',
      predicted_class_name: 'random',
      doi: '10.1021/ed049p367',
      doi_url: 'https://doi.org/10.1021/ed049p367',
    },
    {
      rank: 2,
      similarity: 0.86,
      same_monomer: false,
      monomer1_smiles: MONOMER1_SMILES,
      monomer2_smiles: 'O=C1C=CC(=O)O1',
      solvent_name: 'benzene',
      temperature: 60,
      method: 'solvent',
      polytype: 'free radical',
      predicted_class_name: 'alternating',
      doi: '10.1002/pol.1985.170230811',
      doi_url: 'https://doi.org/10.1002/pol.1985.170230811',
    },
  ],
  solubility_issue: null,
  lookup_class: 1,
  lookup_class_name: 'random',
};

const PREDICT: PredictResponse = {
  predicted_class: 1,
  predicted_class_name: 'random',
  class_probabilities: {
    alternating: 0.03893791884183884,
    random: 0.736705482006073,
    gradient: 0.22435659170150757,
  },
  confidence: 0.736705482006073,
  timestamp: '2026-08-19T06:34:46.238509',
};

const OPTIMIZE: OptimizeResponse = {
  success: true,
  predictions: [
    {
      temperature: 40,
      solvent_name: 'chloroform',
      solvent_smiles: SOLVENT_SMILES,
      solvent_logp: 1.9864,
      method: 'solvent',
      polytype: 'free radical',
      predicted_class: 1,
      predicted_class_name: 'random',
      confidence: 0.7821223735809326,
      solubility_issue: null,
    },
    {
      temperature: 60,
      solvent_name: 'chloroform',
      solvent_smiles: SOLVENT_SMILES,
      solvent_logp: 1.9864,
      method: 'solvent',
      polytype: 'free radical',
      predicted_class: 1,
      predicted_class_name: 'random',
      confidence: 0.736705482006073,
      solubility_issue: null,
    },
    {
      temperature: 40,
      solvent_name: 'toluene',
      solvent_smiles: 'Cc1ccccc1',
      solvent_logp: 1.99502,
      method: 'solvent',
      polytype: 'free radical',
      predicted_class: 1,
      predicted_class_name: 'random',
      confidence: 0.7821223735809326,
      solubility_issue: null,
    },
    {
      temperature: 60,
      solvent_name: 'toluene',
      solvent_smiles: 'Cc1ccccc1',
      solvent_logp: 1.99502,
      method: 'solvent',
      polytype: 'free radical',
      predicted_class: 1,
      predicted_class_name: 'random',
      confidence: 0.736705482006073,
      solubility_issue: null,
    },
  ],
};

const ARCHITECTURE_SWITCH: ArchitectureSwitchResponse = {
  success: true,
  baseline: {
    predicted_class_name: 'random',
    solvent_name: 'chloroform',
    temperature: 60,
  },
  n_evaluated: 9,
  counterfactuals: [],
};

/** What the page sent to each endpoint, filled in as the calls come in. */
export interface RecordedCalls {
  preprocess: Record<string, unknown> | null;
  predict: Record<string, unknown> | null;
  optimize: Record<string, unknown> | null;
}

/**
 * Answers `/api` from the captured prediction above, and records what the page
 * asked for. The prediction service is remote and runs XTB, so a spec that
 * called it would be slow, would need the deployment up, and would still be
 * checking the same four requests this records.
 * @param page - The page under test.
 * @returns The recorded request bodies, filled in as the page calls.
 */
export async function mockPredictionApi(page: Page): Promise<RecordedCalls> {
  const calls: RecordedCalls = {
    preprocess: null,
    predict: null,
    optimize: null,
  };

  await page.route('**/api/preprocess_all', async (route) => {
    calls.preprocess = route.request().postDataJSON() as Record<
      string,
      unknown
    >;
    await route.fulfill({ json: PREPROCESS });
  });
  await page.route('**/api/predict', async (route) => {
    calls.predict = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ json: PREDICT });
  });
  await page.route('**/api/optimize_reaction', async (route) => {
    calls.optimize = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ json: OPTIMIZE });
  });
  await page.route('**/api/find_architecture_switch', (route) =>
    route.fulfill({ json: ARCHITECTURE_SWITCH }),
  );

  return calls;
}
