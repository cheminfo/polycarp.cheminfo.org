import {
  Button,
  FormGroup,
  HTMLSelect,
  NumericInput,
  Spinner,
  Tab,
  Tabs,
} from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';

import type { ResultsPanel } from '../../state/index.ts';
import { isHidden, predict, state } from '../../state/index.ts';

import { ArchitectureSwitch } from './ArchitectureSwitch.tsx';
import { MoleculeEditor } from './MoleculeEditor.tsx';
import { NearestResults } from './NearestResults.tsx';
import { OptimizationGrid } from './OptimizationGrid.tsx';
import { PredictionCard } from './PredictionCard.tsx';
import { MONOMERS } from './data/monomers.ts';
import { SOLVENTS } from './data/solvents.ts';

const METHODS = [
  { label: 'n/a', value: 'n/a' },
  { label: 'Bulk', value: 'bulk' },
  { label: 'Solvent / Solution', value: 'solvent' },
  { label: 'Emulsion', value: 'emulsion' },
  { label: 'Suspension', value: 'suspension' },
  { label: 'Precipitation', value: 'precipitation' },
  { label: 'Slurry', value: 'slurry' },
  { label: 'Gas phase', value: 'gas phase' },
  { label: 'Aqueous dispersion', value: 'aqueous dispersion' },
  { label: 'Microemulsion', value: 'microemulsion' },
  { label: 'Miniemulsion', value: 'miniemulsion' },
  { label: 'Inverse emulsion', value: 'inverse emulsion' },
  { label: 'Semicontinuous', value: 'semicontinuous' },
  { label: 'Sealed tube', value: 'sealed tube' },
  { label: 'Confined', value: 'confined' },
  { label: 'Surface-initiated', value: 'surface-initiated' },
];

const POLYTYPES = [
  { label: 'n/a', value: 'n/a' },
  { label: 'Free radical', value: 'free radical' },
  {
    label: 'Controlled/Living radical (ATRP, RAFT…)',
    value: 'controlled/living radical',
  },
  { label: 'Cationic', value: 'cationic' },
  { label: 'Anionic', value: 'anionic' },
  { label: 'Coordination (Ziegler–Natta, metallocene)', value: 'coordination' },
  { label: 'Ring-opening (ROP)', value: 'ring-opening' },
  { label: 'Ring-opening metathesis (ROMP)', value: 'romp' },
  { label: 'Step-growth', value: 'step-growth' },
];

const SOLVENT_SETS = [
  { label: 'Top 3 predicted solvents', value: 'top3' },
  { label: 'Common solvents', value: 'common' },
  { label: 'Chlorinated solvents', value: 'chlorinated' },
  { label: 'Aromatic solvents', value: 'aromatic' },
];

const TEMP_MODES = [
  { label: '40–80 °C', value: '40-80' },
  { label: '20–100 °C', value: '20-100' },
  { label: 'Fixed 60 °C', value: 'fixed60' },
  { label: 'Step size 20 °C', value: 'step20' },
];

/**
 * Prediction page: molecule editors, polymerisation parameters and the
 * prediction results.
 *
 * The results area is a set of Blueprint sub-tabs so only one results panel is
 * visible at a time, which keeps the page inside a laptop screen. A hidden
 * panel still applies the value the share link carries — hiding the
 * optimization removes its controls, not the settings it runs with.
 */
export function PredictPage() {
  useSignals();
  const { reaction, optimization } = state.preferences;
  const { loading, error, results } = state.data.prediction;
  const showOptimization = !isHidden('optimization');
  const showArchitecture = !isHidden('architecture');
  const showLiterature = !isHidden('literature');

  return (
    <div className="predict-layout">
      <div className="settings-bar">
        <div className="settings-bar-group">
          <h4>Polymerisation</h4>
          <div className="settings-bar-fields">
            <FormGroup label="Temperature (°C)" labelFor="temperature">
              <NumericInput
                id="temperature"
                value={reaction.temperature.value}
                onValueChange={(value) => (reaction.temperature.value = value)}
                min={0}
                max={300}
                stepSize={5}
                minorStepSize={1}
                fill
              />
            </FormGroup>
            <FormGroup label="Method" labelFor="method">
              <HTMLSelect
                id="method"
                value={reaction.method.value}
                onChange={(e) => (reaction.method.value = e.target.value)}
                fill
                options={METHODS}
              />
            </FormGroup>
            <FormGroup label="Type" labelFor="polytype">
              <HTMLSelect
                id="polytype"
                value={reaction.polytype.value}
                onChange={(e) => (reaction.polytype.value = e.target.value)}
                fill
                options={POLYTYPES}
              />
            </FormGroup>
          </div>
        </div>

        {showOptimization && (
          <div className="settings-bar-group">
            <h4>Reaction Optimization</h4>
            <div className="settings-bar-fields">
              <FormGroup label="Solvent set" labelFor="solventSet">
                <HTMLSelect
                  id="solventSet"
                  value={optimization.solventSet.value}
                  onChange={(e) =>
                    (optimization.solventSet.value = e.target.value)
                  }
                  fill
                  options={SOLVENT_SETS}
                />
              </FormGroup>
              <FormGroup label="Temperature range" labelFor="temperatureMode">
                <HTMLSelect
                  id="temperatureMode"
                  value={optimization.temperatureMode.value}
                  onChange={(e) =>
                    (optimization.temperatureMode.value = e.target.value)
                  }
                  fill
                  options={TEMP_MODES}
                />
              </FormGroup>
            </div>
          </div>
        )}

        <div className="settings-bar-action">
          <Button
            size="large"
            intent="primary"
            loading={loading.value}
            onClick={() => void predict()}
            icon="predictive-analysis"
          >
            Predict class
          </Button>
          {loading.value && (
            <span className="settings-bar-hint">
              Running XTB… up to a minute on first request
            </span>
          )}
        </div>
      </div>

      {error.value && <div className="error-banner">⚠ {error.value}</div>}

      <div className="main-row">
        <div className="editors-col">
          <MoleculeEditor
            label="Monomer 1"
            smiles={reaction.monomer1Smiles.value}
            onSmilesChange={(smiles) =>
              (reaction.monomer1Smiles.value = smiles)
            }
            templates={MONOMERS}
          />
          <MoleculeEditor
            label="Monomer 2"
            smiles={reaction.monomer2Smiles.value}
            onSmilesChange={(smiles) =>
              (reaction.monomer2Smiles.value = smiles)
            }
            templates={MONOMERS}
          />
          <MoleculeEditor
            label="Solvent used for polymerisation"
            smiles={reaction.solventSmiles.value}
            onSmilesChange={(smiles) => (reaction.solventSmiles.value = smiles)}
            templates={SOLVENTS}
          />
        </div>

        <div className="results-col">
          {loading.value && !results.value && (
            <div className="loading-overlay">
              <Spinner size={48} intent="primary" />
              <span>
                Computing molecular descriptors and running prediction…
              </span>
            </div>
          )}
          {results.value && (
            <Tabs
              id="results-subtabs"
              className="results-subtabs"
              selectedTabId={state.view.resultsPanel.value}
              onChange={(newTab) =>
                (state.view.resultsPanel.value = newTab as ResultsPanel)
              }
              renderActiveTabPanelOnly
            >
              <Tab
                id="prediction"
                title="Prediction"
                panel={
                  <PredictionCard
                    prediction={results.value.prediction}
                    solubilityIssue={results.value.solubilityIssue}
                    lookupClass={results.value.lookupClass}
                    lookupClassName={results.value.lookupClassName}
                  />
                }
              />
              {showOptimization && (
                <Tab
                  id="optimization"
                  title="Condition optimization"
                  disabled={results.value.rxnopt.length === 0}
                  panel={
                    <OptimizationGrid predictions={results.value.rxnopt} />
                  }
                />
              )}
              {showArchitecture && (
                <Tab
                  id="architecture"
                  title="Architecture switch"
                  disabled={!results.value.architectureSwitch}
                  panel={
                    results.value.architectureSwitch ? (
                      <ArchitectureSwitch
                        data={results.value.architectureSwitch}
                      />
                    ) : undefined
                  }
                />
              )}
              {showLiterature && (
                <Tab
                  id="lookup"
                  title="Nearest literature"
                  disabled={results.value.nearestNeighbors.length === 0}
                  panel={
                    <NearestResults
                      neighbors={results.value.nearestNeighbors}
                    />
                  }
                />
              )}
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
