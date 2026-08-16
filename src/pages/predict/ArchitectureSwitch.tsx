import { archColor } from '../../archColors.ts';
import { DoiButton } from '../../components/shared/DoiButton.tsx';
import type { ArchitectureSwitchResponse } from '../../types.ts';

function fmt(n: number, sign = false): string {
  const s = n.toFixed(1);
  return sign && n > 0 ? `+${s}` : s;
}

interface Props {
  data: ArchitectureSwitchResponse;
}

/**
 * Card showing the closest architecture-switch counterfactual conditions.
 * @param root0
 * @param root0.data
 */
export function ArchitectureSwitch({ data }: Props) {
  const { baseline, counterfactuals, n_evaluated: nEvaluated } = data;

  return (
    <div className="arch-card">
      <h2>Closest architecture switch</h2>
      <div className="arch-baseline">
        Baseline: <strong>{baseline.predicted_class_name}</strong> in{' '}
        <strong>{baseline.solvent_name}</strong> at{' '}
        <strong>{baseline.temperature}°C</strong>
        {nEvaluated > 0 && (
          <span style={{ marginLeft: 8, color: '#738091', fontSize: 11 }}>
            ({nEvaluated} combinations evaluated)
          </span>
        )}
      </div>

      {counterfactuals.length === 0 ? (
        <div
          style={{ color: '#5c6570', fontSize: '0.85rem', fontStyle: 'italic' }}
        >
          No architecture switch found in the evaluated condition space. This
          pair may be robustly in the{' '}
          <strong>{baseline.predicted_class_name}</strong> regime.
        </div>
      ) : (
        counterfactuals.map((cf) => {
          const color = archColor(cf.predicted_class_name);
          const key = `${cf.predicted_class_name}|${cf.solvent_name}|${cf.temperature}`;
          return (
            <div
              key={key}
              className="arch-counterfactual"
              style={{ borderLeftColor: color }}
            >
              <div className="arch-cf-header">
                <span
                  className="arch-badge"
                  style={{
                    background: color,
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}
                >
                  {cf.predicted_class_name}
                </span>
                in <strong>{cf.solvent_name}</strong> at{' '}
                <strong>{cf.temperature}°C</strong>
              </div>
              <div className="arch-cf-details">
                <div className="arch-cf-detail">
                  ΔlogP: <strong>{fmt(cf.delta_logp, true)}</strong>
                </div>
                <div className="arch-cf-detail">
                  ΔT: <strong>{fmt(cf.delta_temperature, true)}°C</strong>
                </div>
                <div className="arch-cf-detail">
                  Confidence:{' '}
                  <strong>{(cf.confidence * 100).toFixed(1)}%</strong>
                </div>
                {cf.reference && (
                  <div
                    className="arch-cf-detail"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', color: '#5c6570' }}>
                      Ref:
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#2c3e50' }}>
                      {cf.reference.monomer1_name} /{' '}
                      {cf.reference.monomer2_name}
                    </span>
                    <DoiButton
                      doi={cf.reference.doi}
                      url={cf.reference.doi_url}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
