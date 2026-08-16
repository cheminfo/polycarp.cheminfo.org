import type {
  ArchitectureSwitchResponse,
  OptimizeResponse,
  PaperMetricsResponse,
  PredictResponse,
  PredictionResults,
  PreprocessResponse,
} from './types.ts';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`API error ${response.status}: ${text}`);
  }
  return response.json() as Promise<T>;
}

/** Fetches the precomputed train/test performance results (Results tab). */
export async function fetchPaperMetrics(): Promise<PaperMetricsResponse> {
  const response = await fetch(`${API_URL}/paper_metrics`);
  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`API error ${response.status}: ${text}`);
  }
  return response.json() as Promise<PaperMetricsResponse>;
}

export interface PredictParams {
  monomer1Smiles: string;
  monomer2Smiles: string;
  solventSmiles: string;
  temperature: number;
  method: string;
  polytype: string;
  solventSet: string;
  temperatureMode: string;
}

/**
 * Runs the full 4-step prediction pipeline and returns combined results.
 * @param params
 */
export async function runPrediction(
  params: PredictParams,
): Promise<PredictionResults> {
  /* eslint-disable camelcase */
  const base = {
    monomer1_smiles: params.monomer1Smiles,
    monomer2_smiles: params.monomer2Smiles,
    solvent_smiles: params.solventSmiles,
    method: params.method,
    polytype: params.polytype,
    temperature: params.temperature,
  };

  const optimParams = {
    solvent_set: params.solventSet,
    temperature_mode: params.temperatureMode,
    temperature_step: 20,
    n_solvents: 3,
  };
  /* eslint-enable camelcase */

  // Step 1: preprocess (XTB features + nearest neighbors)
  const preprocessed = await postJSON<PreprocessResponse>(
    '/preprocess_all',
    base,
  );
  if (!preprocessed.success) {
    throw new Error(preprocessed.error ?? 'Preprocessing failed');
  }

  // Filter out null features before prediction
  const features: Record<string, number> = {};
  for (const [key, value] of Object.entries(preprocessed.features)) {
    if (value !== null) {
      features[key] = value;
    }
  }

  // Step 2: predict class.
  // Note: /predict does NOT return a `success` field — rely on HTTP status only.
  /* eslint-disable camelcase */
  const prediction = await postJSON<PredictResponse>('/predict', {
    features,
    monomer1_smiles: params.monomer1Smiles,
    monomer2_smiles: params.monomer2Smiles,
    solvent_smiles: params.solventSmiles,
  });
  /* eslint-enable camelcase */

  if (!prediction.predicted_class_name) {
    throw new Error(prediction.error ?? 'Prediction returned no class name');
  }

  // Prefer predict's solubility_issue, fall back to preprocess's (matches original).
  const solubilityIssue =
    prediction.solubility_issue !== null &&
    prediction.solubility_issue !== undefined
      ? prediction.solubility_issue
      : preprocessed.solubility_issue;

  // Step 3: reaction optimization (run before architecture switch, like the original).
  let rxnopt: OptimizeResponse['predictions'] = [];
  try {
    const rxnoptResponse = await postJSON<OptimizeResponse>(
      '/optimize_reaction',
      {
        ...base,
        ...optimParams,
      },
    );
    rxnopt = Array.isArray(rxnoptResponse?.predictions)
      ? rxnoptResponse.predictions
      : [];
  } catch {
    // Non-fatal: optimization results are optional
  }

  // Step 4: architecture switch search.
  let architectureSwitch: ArchitectureSwitchResponse | null = null;
  try {
    /* eslint-disable camelcase */
    const arch = await postJSON<ArchitectureSwitchResponse>(
      '/find_architecture_switch',
      {
        ...base,
        ...optimParams,
        top_n: 5,
      },
    );
    /* eslint-enable camelcase */
    architectureSwitch = arch?.success ? arch : null;
  } catch {
    // Non-fatal: architecture switch is optional
  }

  return {
    prediction,
    nearestNeighbors: preprocessed.nearest_neighbors,
    solubilityIssue,
    lookupClass: preprocessed.lookup_class ?? null,
    lookupClassName: preprocessed.lookup_class_name ?? null,
    rxnopt,
    architectureSwitch,
  };
}
