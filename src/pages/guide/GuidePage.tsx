/** Step-by-step user guide for the PolyCarp prediction interface. */
export function GuidePage() {
  return (
    <div className="about-content guide-content">
      <h2>Quick start</h2>
      <p>
        Three steps to get your first prediction: (1) draw or load your two
        monomers, (2) set the reaction conditions, (3) click{' '}
        <strong>Predict class</strong>. Results appear in the panel on the
        right, organised as sub-tabs.
      </p>

      <div className="guide-steps">
        {/* ── Step 1 ── */}
        <div className="guide-step">
          <div className="guide-step-number">1</div>
          <div className="guide-step-body">
            <h3>Define the two monomers</h3>
            <p>
              Each monomer card shows a structure editor. Draw the molecule
              directly in the canvas or click <strong>Load template</strong> to
              pick from a library of common vinyl monomers (styrene, MMA,
              acrylates, acrylamides, and more). The SMILES string updates live
              and can be pasted directly.
            </p>
            <ul>
              <li>
                <strong>Monomer 1</strong> and <strong>Monomer 2</strong> are
                treated symmetrically — the order doesn&apos;t affect the
                prediction.
              </li>
              <li>
                Predictions are most reliable for common vinyl monomers. Unusual
                functional groups or ring-opening motifs may sit outside the
                training distribution.
              </li>
            </ul>
          </div>
        </div>

        {/* ── Step 2 ── */}
        <div className="guide-step">
          <div className="guide-step-number">2</div>
          <div className="guide-step-body">
            <h3>Set reaction conditions</h3>
            <p>
              Copolymer architecture depends strongly on conditions — that is
              the central premise of PolyCarp. The settings bar at the top of
              the page holds every parameter:
            </p>
            <dl className="guide-params">
              <dt>Solvent</dt>
              <dd>
                Draw or select the solvent molecule. The model uses the
                solvent&apos;s log&nbsp;<em>P</em> as a feature. If the
                monomer–solvent pair looks chemically incompatible, a solubility
                warning is shown alongside the results.
              </dd>
              <dt>Temperature (°C)</dt>
              <dd>
                Reaction temperature in degrees Celsius. Most literature data
                sits in the 40–100 °C range; extrapolations far outside this
                range carry higher uncertainty.
              </dd>
              <dt>Polymerisation method</dt>
              <dd>
                The physical setup: bulk, solution, emulsion, suspension, etc.
                Use <em>n/a</em> if not known.
              </dd>
              <dt>Polymerisation type</dt>
              <dd>
                The initiation mechanism: free radical, controlled/living
                radical (ATRP, RAFT), cationic, anionic, coordination, etc. Free
                radical is the most data-rich category.
              </dd>
              <dt>Solvent set & Temperature range</dt>
              <dd>
                These control the <em>condition-optimisation</em> grid and the
                <em> architecture-switch</em> search (Step 3 results) — they
                define the sweep over which the model is evaluated.
              </dd>
            </dl>
          </div>
        </div>

        {/* ── Step 3 ── */}
        <div className="guide-step">
          <div className="guide-step-number">3</div>
          <div className="guide-step-body">
            <h3>Run the prediction</h3>
            <p>
              Click <strong>Predict class</strong>. The first request for a
              fresh monomer pair may take up to a minute while XTB descriptors
              are computed; subsequent predictions on the same structures are
              served from cache.
            </p>
          </div>
        </div>
      </div>

      <h2>Interpreting the results</h2>

      <h3>Prediction card</h3>
      <p>
        The <strong>Prediction</strong> sub-tab shows the predicted architecture
        class — <em>alternating</em>,{' '}
        <em>random&nbsp;to&nbsp;block&nbsp;like</em>, or <em>gradient</em> —
        with the classifier&apos;s confidence and a full probability table.
      </p>
      <p>
        Underneath, the <strong>lookup-agreement indicator</strong> compares the
        model&apos;s prediction with the top-1 nearest literature reaction. A
        calm-green <em>&ldquo;lookup agrees&rdquo;</em> pill is a strong signal
        — the paper&apos;s voting model keeps only such predictions. An amber{' '}
        <em>&ldquo;lookup disagrees&rdquo;</em> pill names the literature class
        instead: treat the prediction with caution and inspect the{' '}
        <strong>Nearest literature</strong> sub-tab.
      </p>
      <p>
        Confidence below ~50 % indicates the system is near a class boundary;
        the condition-optimisation grid (next sub-tab) becomes especially
        informative there.
      </p>

      <h3>Condition optimisation</h3>
      <p>
        A heat-map sweeping the selected solvent set × temperature range,
        showing the predicted architecture in each cell. Use it to:
      </p>
      <ul>
        <li>
          Decide whether the prediction is <strong>robust</strong> (same class
          across most conditions) or <strong>sensitive</strong> (architecture
          flips with small changes — schedule replicates).
        </li>
        <li>
          Find solvent–temperature combinations that favour a target
          architecture.
        </li>
        <li>
          Compare scenarios by changing the <strong>Solvent set</strong> (top-3
          predicted, common, chlorinated, aromatic) or{' '}
          <strong>Temperature range</strong> in the settings bar and re-running.
        </li>
      </ul>

      <h3>Architecture switch (counterfactual)</h3>
      <p>
        The minimum change in conditions that would flip the predicted
        architecture. The baseline is your exact inputs; counterfactuals are
        ranked by smallest change in solvent log&nbsp;<em>P</em> (then
        temperature). Each comes with a matching{' '}
        <strong>same-monomer literature reference</strong> with a clickable DOI
        — use it to ground a planned experiment in a published one.
      </p>

      <h3>Nearest literature</h3>
      <p>
        The closest experimental records in the literature database, ranked by
        fingerprint similarity of the monomer pair. Rows that use the{' '}
        <strong>exact same monomer pair</strong> as your query are pinned to the
        top and marked with a <em>&ldquo;same monomers&rdquo;</em> badge plus an
        amber row tint — these are your most relevant experimental evidence.
      </p>
      <p>
        Sort by Temperature, Method, Type, Architecture, or Similarity by
        clicking the column header. Filter by architecture class or
        free-text-search the solvent/method/type using the controls above the
        table.
      </p>

      <h2>What to do with the results</h2>
      <ul>
        <li>
          <strong>Confirm with a same-monomer entry.</strong> If pinned
          same-monomer rows agree with the model at conditions close to yours,
          confidence is high — proceed with the planned experiment.
        </li>
        <li>
          <strong>If lookup disagrees</strong>, check the gradient between
          conditions. Often the closest literature was run at a very different
          temperature or in a very different solvent; the disagreement may
          reflect that gap, not a model error.
        </li>
        <li>
          <strong>Use counterfactuals to design a screen.</strong> The
          architecture-switch sub-tab tells you the cheapest condition change
          that would shift the architecture — useful for tuning material
          properties or building a comparator series.
        </li>
        <li>
          <strong>Reactivity ratios vs. architecture.</strong> PolyCarp predicts
          the architecture class directly, not individual reactivity ratios (r₁,
          r₂). The class is derived from r₁ × r₂ and r₁ / r₂, so some
          information is deliberately abstracted.
        </li>
        <li>
          <strong>Training distribution.</strong> The model was trained
          predominantly on free-radical polymerisations of vinyl monomers. For
          ring-opening, step-growth, or coordination mechanisms the data are
          sparser and predictions carry higher uncertainty.
        </li>
        <li>
          <strong>API access.</strong> Every endpoint is documented on the
          <strong> API</strong> tab — use it to integrate PolyCarp into a
          high-throughput screen or computational workflow.
        </li>
      </ul>
    </div>
  );
}
