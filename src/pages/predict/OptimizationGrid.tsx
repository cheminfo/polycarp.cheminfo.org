import { ClickToCopy } from 'react-cheminfo/ui';

import { ARCH_COLORS, cellSwatch } from '../../archColors.ts';
import type { OptimizePrediction } from '../../types.ts';

interface Props {
  predictions: OptimizePrediction[];
}

/**
 * Heat-map grid of predicted polymer architectures across solvents and temperatures.
 * @param root0
 * @param root0.predictions
 */
export function OptimizationGrid({ predictions }: Props) {
  if (predictions.length === 0) return null;

  // Build pivot: solvent → temperature → prediction
  const solventMap = new Map<
    string,
    {
      logp: number;
      smiles: string | undefined;
      byTemp: Map<number, OptimizePrediction>;
    }
  >();
  const tempSet = new Set<number>();

  for (const p of predictions) {
    tempSet.add(p.temperature);
    if (!solventMap.has(p.solvent_name)) {
      solventMap.set(p.solvent_name, {
        logp: p.solvent_logp,
        smiles: p.solvent_smiles,
        byTemp: new Map(),
      });
    }
    const entry = solventMap.get(p.solvent_name);
    if (entry) entry.byTemp.set(p.temperature, p);
  }

  const temperatures = [...tempSet].toSorted((a, b) => a - b);
  const solvents = [...solventMap.entries()];

  const classNames = new Map<number, string>();
  for (const p of predictions) {
    if (!classNames.has(p.predicted_class)) {
      classNames.set(p.predicted_class, p.predicted_class_name);
    }
  }
  const legendEntries = [...classNames.entries()].toSorted(([a], [b]) => a - b);

  return (
    <div className="optim-card">
      <h2>Reaction condition optimization</h2>
      <div className="optim-grid-wrap">
        <table className="optim-grid">
          <thead>
            <tr>
              <th className="solvent-col">Solvent</th>
              {temperatures.map((t) => (
                <th key={t}>{t}°C</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {solvents.map(([solventName, { logp, smiles, byTemp }]) => (
              <tr key={solventName}>
                <td className="optim-solvent-cell">
                  <ClickToCopy
                    as="div"
                    className="optim-solvent-name"
                    value={smiles ?? solventName}
                    label={smiles === undefined ? 'solvent' : 'solvent SMILES'}
                  >
                    {solventName}
                  </ClickToCopy>
                  <div className="optim-solvent-logp">
                    logP{' '}
                    <ClickToCopy value={logp.toFixed(2)} label="logP">
                      {logp.toFixed(2)}
                    </ClickToCopy>
                  </div>
                </td>
                {temperatures.map((t) => {
                  const pred = byTemp.get(t);
                  if (!pred) return <td key={t}>—</td>;
                  const { background, foreground } = cellSwatch(
                    pred.predicted_class,
                    pred.confidence,
                  );
                  const confidenceText = `${(pred.confidence * 100).toFixed(1)}%`;
                  return (
                    <td key={t} style={{ padding: '4px' }}>
                      <ClickToCopy
                        as="div"
                        className={`optim-pred-cell${pred.solubility_issue ? ' solubility-issue' : ''}`}
                        style={{
                          background,
                          color: foreground,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 4,
                          height: 40,
                          fontWeight: 700,
                          fontSize: '0.85rem',
                        }}
                        value={confidenceText}
                        label={`${pred.predicted_class_name} confidence`}
                      >
                        {confidenceText}
                      </ClickToCopy>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="optim-legend">
        {legendEntries.map(([classIdx, name]) => (
          <div key={classIdx} className="optim-legend-item">
            <div
              className="optim-legend-swatch"
              style={{ background: ARCH_COLORS[classIdx] }}
            />
            {name}
          </div>
        ))}
        <div className="optim-legend-item" style={{ marginLeft: 'auto' }}>
          <span style={{ fontSize: 11 }}>⚠ solubility issue</span>
        </div>
      </div>
    </div>
  );
}
