import { archColor, classColor } from '../../archColors.ts';
import type { PredictResponse } from '../../types.ts';

interface Props {
  prediction: PredictResponse;
  solubilityIssue: boolean | null;
  /** Top-1 nearest-neighbor's predicted class (null when no neighbour was found). */
  lookupClass: number | null;
  /** Human-readable name of the lookup class (null when unavailable). */
  lookupClassName: string | null;
}

/**
 * Card showing predicted polymer architecture class with confidence probabilities.
 * @param root0
 * @param root0.prediction
 * @param root0.solubilityIssue
 * @param root0.lookupClass
 * @param root0.lookupClassName
 */
export function PredictionCard({
  prediction,
  solubilityIssue,
  lookupClass,
  lookupClassName,
}: Props) {
  const {
    predicted_class_name: predictedClassName,
    predicted_class: predictedClass,
    confidence,
    class_probabilities: classProbabilities,
    timestamp,
  } = prediction;

  const sortedProbs = Object.entries(classProbabilities).toSorted(
    ([, a], [, b]) => b - a,
  );
  const mainColor = classColor(predictedClassName, predictedClass);

  return (
    <div className="prediction-card">
      <h2>Prediction result</h2>
      {timestamp && <div className="prediction-timestamp">{timestamp}</div>}

      <div className="predicted-class-row">
        <span className="predicted-class-label">Predicted class:</span>
        <span
          className="predicted-class-name"
          style={{ background: mainColor }}
        >
          {predictedClassName}
        </span>
        {solubilityIssue && (
          <span className="solubility-warning">⚠ Solubility issue</span>
        )}
      </div>

      {lookupClass !== null && lookupClassName !== null && (
        <div className="lookup-agreement-row">
          {lookupClass === predictedClass ? (
            <span
              className="lookup-agree"
              title="The nearest literature reaction agrees with the model prediction."
            >
              ✓ Nearest-neighbour lookup agrees
            </span>
          ) : (
            <span
              className="lookup-disagree"
              title="The nearest literature reaction disagrees with the model prediction — the paper's voting model would discard this prediction."
            >
              ⚠ Lookup disagrees: nearest literature reaction is{' '}
              <span
                className="lookup-disagree-class"
                style={{ background: archColor(lookupClassName) }}
              >
                {lookupClassName}
              </span>
            </span>
          )}
        </div>
      )}

      <div className="confidence-row">
        <span className="confidence-label">Confidence:</span>
        <span className="confidence-value">
          {(confidence * 100).toFixed(1)}%
        </span>
        <div className="confidence-bar-wrap">
          <div
            className="confidence-bar"
            style={{ width: `${confidence * 100}%`, background: mainColor }}
          />
        </div>
      </div>

      <div className="class-probs-title">Class Probabilities</div>
      <table className="class-probs-table">
        <tbody>
          {sortedProbs.map(([name, prob]) => {
            // Colour by the class name, not the sorted-rank loop index.
            const color = classColor(name);
            const isPredicted =
              name.toLowerCase() === predictedClassName.toLowerCase();
            return (
              <tr key={name} className={isPredicted ? 'predicted' : ''}>
                <td>
                  <span className="class-dot" style={{ background: color }} />
                  {name}
                </td>
                <td className="class-prob-bar-cell">
                  <div className="class-prob-bar-bg">
                    <div
                      className="class-prob-bar"
                      style={{ width: `${prob * 100}%`, background: color }}
                    />
                  </div>
                </td>
                <td style={{ textAlign: 'right', minWidth: 46 }}>
                  {(prob * 100).toFixed(2)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
