import { useEffect, useMemo, useState } from 'react';

import { fetchPaperMetrics } from '../../api.ts';
import { archColor } from '../../archColors.ts';
import type {
  IndividualPrediction,
  ModelMetrics,
  PaperMetricsResponse,
  SplitMetrics,
} from '../../types.ts';

const ROW_ORDER = ['Alternating', 'Random', 'Gradient', 'Macro'];
const PAGE_SIZE = 20;

type SplitKey = 'train' | 'test';
type RowFilter = 'all' | 'correct' | 'incorrect' | 'abstained';

/**
 * Per-class table comparing plain XGBoost against the voting model.
 * @param root0
 * @param root0.split
 */
function MetricsTable({ split }: { split: SplitMetrics }) {
  return (
    <table className="metrics-table">
      <thead>
        <tr>
          <th rowSpan={2}>Class</th>
          <th colSpan={3}>Plain XGBoost</th>
          <th colSpan={3}>Voting model</th>
        </tr>
        <tr>
          <th>Acc</th>
          <th>Prec</th>
          <th>F1</th>
          <th>Acc</th>
          <th>Prec</th>
          <th>F1</th>
        </tr>
      </thead>
      <tbody>
        {ROW_ORDER.map((cls) => {
          const x = split.xgboost.per_class[cls];
          const v = split.voting.per_class[cls];
          if (!x || !v) return null;
          const isMacro = cls === 'Macro';
          return (
            <tr key={cls} className={isMacro ? 'metrics-macro' : undefined}>
              <td className="metrics-class">
                {!isMacro && (
                  <span
                    className="metrics-swatch"
                    style={{ background: archColor(cls) }}
                  />
                )}
                {cls}
              </td>
              <td>{x.acc.toFixed(3)}</td>
              <td>{x.prec.toFixed(3)}</td>
              <td>{x.f1.toFixed(3)}</td>
              <td>{v.acc.toFixed(3)}</td>
              <td>{v.prec.toFixed(3)}</td>
              <td>{v.f1.toFixed(3)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/**
 * Confusion-matrix heatmap; cell shade scales with the row-normalised count.
 * @param root0
 * @param root0.title
 * @param root0.matrix
 * @param root0.classes
 */
function ConfusionMatrix({
  title,
  matrix,
  classes,
}: {
  title: string;
  matrix: number[][];
  classes: string[];
}) {
  return (
    <div className="confusion">
      <div className="confusion-title">{title}</div>
      <table className="confusion-table">
        <thead>
          <tr>
            <th />
            <th className="confusion-axis" colSpan={classes.length}>
              predicted
            </th>
          </tr>
          <tr>
            <th />
            {classes.map((c) => (
              <th key={c}>{c.slice(0, 4)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => {
            const total = row.reduce((a, b) => a + b, 0) || 1;
            const label = classes[i] ?? '';
            return (
              <tr key={label}>
                <th className="confusion-rowlabel">{label.slice(0, 4)}</th>
                {row.map((count, j) => {
                  const frac = count / total;
                  return (
                    <td
                      // eslint-disable-next-line react/no-array-index-key
                      key={j}
                      style={{
                        background: `rgba(28, 61, 110, ${0.08 + frac * 0.85})`,
                        color: frac > 0.5 ? '#fff' : '#1a2733',
                        fontWeight: i === j ? 700 : 400,
                      }}
                    >
                      {count}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="confusion-caption">rows = true class</div>
    </div>
  );
}

/**
 * One split: headline numbers, per-class table, confusion matrices.
 * @param root0
 * @param root0.label
 * @param root0.split
 * @param root0.classes
 */
function SplitSection({
  label,
  split,
  classes,
}: {
  label: string;
  split: SplitMetrics;
  classes: string[];
}) {
  const xgb: ModelMetrics = split.xgboost;
  const vote: ModelMetrics = split.voting;
  return (
    <section className="results-split">
      <h3>
        {label} set{' '}
        <span className="results-split-n">({split.n} reactions)</span>
      </h3>
      <p className="results-headline">
        Plain XGBoost accuracy{' '}
        <strong>{((xgb.accuracy ?? 0) * 100).toFixed(1)}%</strong> · voting
        model retains{' '}
        <strong>{((vote.coverage ?? 0) * 100).toFixed(0)}%</strong> of samples (
        {vote.retained}/{split.n}) at macro-F1{' '}
        <strong>{(vote.per_class.Macro?.f1 ?? 0).toFixed(3)}</strong>.
      </p>
      <MetricsTable split={split} />
      <div className="confusion-row">
        <ConfusionMatrix
          title="Plain XGBoost"
          matrix={xgb.confusion_matrix}
          classes={classes}
        />
        <ConfusionMatrix
          title={`Voting model (retained ${vote.retained})`}
          matrix={vote.confusion_matrix}
          classes={classes}
        />
      </div>
    </section>
  );
}

/**
 * Colour-coded architecture-class pill.
 * @param root0
 * @param root0.name
 */
function ClassPill({ name }: { name: string }) {
  return (
    <span className="pred-pill" style={{ background: archColor(name) }}>
      {name}
    </span>
  );
}

/**
 * Browsable, filterable table of per-row individual predictions.
 * @param root0
 * @param root0.splits
 */
function IndividualPredictions({
  splits,
}: {
  splits: PaperMetricsResponse['splits'];
}) {
  const [splitKey, setSplitKey] = useState<SplitKey>('test');
  const [filter, setFilter] = useState<RowFilter>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);

  const rows: IndividualPrediction[] = splits[splitKey].predictions;

  // Each kept row carries its index in the source array, so a page row has a
  // key that survives filtering and paging.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const kept: Array<{ row: IndividualPrediction; sourceIndex: number }> = [];
    for (const [sourceIndex, r] of rows.entries()) {
      if (filter === 'correct' && !r.correct) continue;
      if (filter === 'incorrect' && r.correct) continue;
      if (filter === 'abstained' && r.agree) continue;
      if (q) {
        const hay = `${r.monomer1_name ?? ''} ${r.monomer2_name ?? ''} ${
          r.solvent_name ?? ''
        }`.toLowerCase();
        if (!hay.includes(q)) continue;
      }
      kept.push({ row: r, sourceIndex });
    }
    return kept;
  }, [rows, filter, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );

  // Reset to the first page whenever the filtered set changes.
  const resetPage = () => setPage(0);

  return (
    <section className="results-split">
      <h3>Individual predictions</h3>
      <p className="results-headline">
        Every reaction in the split, with its true class, the model&apos;s
        prediction, and whether the voting model kept the prediction or
        abstained (XGBoost and the nearest-neighbour lookup disagreed).
      </p>

      <div className="ind-controls">
        <div className="ind-toggle">
          {(['test', 'train'] as SplitKey[]).map((k) => (
            <button
              key={k}
              type="button"
              className={`ind-toggle-btn${splitKey === k ? ' active' : ''}`}
              onClick={() => {
                setSplitKey(k);
                resetPage();
              }}
            >
              {k === 'test' ? 'Test' : 'Train'} ({splits[k].n})
            </button>
          ))}
        </div>
        <select
          className="ind-select"
          aria-label="Filter predictions by outcome"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value as RowFilter);
            resetPage();
          }}
        >
          <option value="all">All predictions</option>
          <option value="correct">Correct only</option>
          <option value="incorrect">Incorrect only</option>
          <option value="abstained">Voting abstained</option>
        </select>
        <input
          className="ind-search"
          type="search"
          aria-label="Filter by monomer or solvent name"
          placeholder="Filter by monomer / solvent name…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            resetPage();
          }}
        />
      </div>

      <div className="ind-table-wrap">
        <table className="ind-table">
          <thead>
            <tr>
              <th>Monomer 1</th>
              <th>Monomer 2</th>
              <th>Solvent</th>
              <th>T (°C)</th>
              <th>True</th>
              <th>Predicted</th>
              <th>Conf.</th>
              <th>Voting</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map(({ row: r, sourceIndex }) => (
              <tr
                key={`${splitKey}-${sourceIndex}`}
                className={r.correct ? undefined : 'ind-row-wrong'}
              >
                <td title={r.monomer1_smiles}>{r.monomer1_name ?? '—'}</td>
                <td title={r.monomer2_smiles}>{r.monomer2_name ?? '—'}</td>
                <td>{r.solvent_name ?? '—'}</td>
                <td>{r.temperature ?? '—'}</td>
                <td>
                  <ClassPill name={r.true_class_name} />
                </td>
                <td>
                  <ClassPill name={r.xgb_class_name} />
                  {!r.correct && <span className="ind-x">✗</span>}
                </td>
                <td>{(r.confidence * 100).toFixed(0)}%</td>
                <td>
                  {r.agree ? (
                    <span className="ind-kept">kept</span>
                  ) : (
                    <span className="ind-abstain">abstained</span>
                  )}
                </td>
                <td>
                  {r.doi_url ? (
                    <a
                      href={r.doi_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      DOI
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={9} className="ind-empty">
                  No predictions match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="ind-pager">
        <button
          type="button"
          disabled={safePage === 0}
          onClick={() => setPage(safePage - 1)}
        >
          ‹ Prev
        </button>
        <span>
          {filtered.length} reaction{filtered.length === 1 ? '' : 's'} · page{' '}
          {safePage + 1} / {pageCount}
        </span>
        <button
          type="button"
          disabled={safePage >= pageCount - 1}
          onClick={() => setPage(safePage + 1)}
        >
          Next ›
        </button>
      </div>
    </section>
  );
}

/** Results tab — the paper's train/test model-performance numbers. */
export function ResultsPage() {
  const [data, setData] = useState<PaperMetricsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPaperMetrics()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((error_: unknown) => {
        if (!cancelled) {
          setError(
            error_ instanceof Error ? error_.message : 'Failed to load metrics',
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="results-tab about-content">
        <h2>Model performance</h2>
        <p className="results-error">Could not load results: {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="results-tab about-content">
        <h2>Model performance</h2>
        <p>Loading results…</p>
      </div>
    );
  }

  return (
    <div className="results-tab about-content">
      <h2>Model performance</h2>
      <p>
        Architecture-prediction performance of the released PolyCarp model on
        the training and held-out test splits, reproducing the paper&apos;s
        performance table. Two model variants are shown: the{' '}
        <strong>plain XGBoost</strong> classifier, and the{' '}
        <strong>voting model</strong> — XGBoost combined with a
        nearest-neighbour lookup, which keeps a prediction only when the two
        agree (its <em>coverage</em>) and abstains otherwise, trading coverage
        for reliability.
      </p>

      <SplitSection
        label="Test"
        split={data.splits.test}
        classes={data.classes}
      />
      <SplitSection
        label="Training"
        split={data.splits.train}
        classes={data.classes}
      />

      <IndividualPredictions splits={data.splits} />

      <p className="results-verify">
        These numbers are cached on the server — precomputed from the released
        model bundle and committed data splits by{' '}
        <code>copol_prediction/reproduce_paper_metrics.py</code>, served via{' '}
        <code>GET /paper_metrics</code>, not recomputed in the browser. To
        verify them, run that script (see{' '}
        <a
          href="https://github.com/lamalab-org/copolymer-reactivity/blob/main/copol_prediction/REPRODUCE.md"
          target="_blank"
          rel="noopener noreferrer"
        >
          REPRODUCE.md
        </a>
        ); it re-evaluates the model and checks every value against the paper.
      </p>
    </div>
  );
}
