/* eslint-disable @typescript-eslint/naming-convention */
// All snake_case properties below match the Python API response shape.

export interface NearestNeighbor {
  /** 1-based rank in the API response; unique within the returned list. */
  rank: number;
  monomer1_smiles: string;
  monomer2_smiles: string;
  solvent_name: string;
  temperature: number;
  method: string;
  polytype: string;
  predicted_class_name: string;
  similarity: number;
  /** True when this literature reaction uses the exact same monomer pair as the query. */
  same_monomer?: boolean;
  doi?: string;
  doi_url?: string;
}

export interface PreprocessResponse {
  success: boolean;
  error?: string;
  features: Record<string, number | null>;
  nearest_neighbors: NearestNeighbor[];
  solubility_issue: boolean | null;
  /** Top-1 nearest-neighbor's class (null when the lookup pool returned nothing). */
  lookup_class?: number | null;
  /** Human-readable name for `lookup_class` (resolved server-side from CLASS_LABELS). */
  lookup_class_name?: string | null;
}

export interface PredictResponse {
  // /predict does not always return a success field — check presence of
  // predicted_class_name instead to confirm a valid response.
  success?: boolean;
  error?: string;
  predicted_class: number;
  predicted_class_name: string;
  class_probabilities: Record<string, number>;
  confidence: number;
  timestamp?: string;
  solubility_issue?: boolean | null;
}

export interface OptimizePrediction {
  solvent_name: string;
  solvent_smiles?: string;
  solvent_logp: number;
  temperature: number;
  method: string;
  polytype: string;
  predicted_class: number;
  predicted_class_name: string;
  confidence: number;
  solubility_issue: boolean | null;
}

export interface OptimizeResponse {
  success?: boolean;
  predictions: OptimizePrediction[];
}

export interface CounterfactualReference {
  doi: string;
  doi_url: string;
  monomer1_name: string;
  monomer2_name: string;
}

export interface Counterfactual {
  predicted_class: number;
  predicted_class_name: string;
  solvent_name: string;
  temperature: number;
  delta_logp: number;
  delta_temperature: number;
  confidence: number;
  reference: CounterfactualReference | null;
}

export interface ArchitectureSwitchResponse {
  success: boolean;
  error?: string;
  baseline: {
    predicted_class_name: string;
    solvent_name: string;
    temperature: number;
  };
  n_evaluated: number;
  counterfactuals: Counterfactual[];
}

export interface FormState {
  monomer1Smiles: string;
  monomer2Smiles: string;
  solventSmiles: string;
  temperature: number;
  method: string;
  polytype: string;
  solventSet: string;
  temperatureMode: string;
}

export interface PredictionResults {
  prediction: PredictResponse;
  nearestNeighbors: NearestNeighbor[];
  solubilityIssue: boolean | null;
  /** Top-1 nearest-neighbor's predicted class (null when no neighbour). */
  lookupClass: number | null;
  /** Human-readable name for `lookupClass`. */
  lookupClassName: string | null;
  rxnopt: OptimizePrediction[];
  architectureSwitch: ArchitectureSwitchResponse | null;
}

// ── /paper_metrics — precomputed train/test performance ──────────────

export interface ClassMetrics {
  acc: number;
  prec: number;
  f1: number;
}

export interface ModelMetrics {
  confusion_matrix: number[][];
  per_class: Record<string, ClassMetrics>;
  accuracy?: number; // plain XGBoost only
  coverage?: number; // voting only
  retained?: number; // voting only
}

export interface IndividualPrediction {
  monomer1_smiles: string;
  monomer2_smiles: string;
  monomer1_name: string | null;
  monomer2_name: string | null;
  solvent_name: string | null;
  solvent_smiles: string | null;
  temperature: number | null;
  method: string | null;
  polytype: string | null;
  true_class: number;
  true_class_name: string;
  xgb_class: number;
  xgb_class_name: string;
  confidence: number;
  lookup_class: number;
  lookup_class_name: string;
  lookup_similarity: number;
  agree: boolean;
  correct: boolean;
  doi: string | null;
  doi_url: string | null;
}

export interface SplitMetrics {
  n: number;
  xgboost: ModelMetrics;
  voting: ModelMetrics;
  predictions: IndividualPrediction[];
}

export interface PaperMetricsResponse {
  classes: string[];
  generated_at: string;
  splits: { train: SplitMetrics; test: SplitMetrics };
}
