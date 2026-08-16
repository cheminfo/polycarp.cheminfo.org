/** About page — what PolyCarp is, how it was built, and how to get in touch. */
export function AboutPage() {
  return (
    <div className="about-content">
      <h2>What is PolyCarp?</h2>
      <p>
        <strong>PolyCarp</strong> (Copolymer Architecture Reactivity Predictor)
        is a condition-aware machine-learning tool that predicts the
        microstructure of radical copolymers. Given two monomers and reaction
        conditions — solvent, temperature, and polymerisation mechanism — it
        classifies the resulting copolymer as <em>alternating</em>,{' '}
        <em>random&nbsp;to&nbsp;block&nbsp;like</em>, or <em>gradient</em>,
        retrieves the closest experimental analogues from a curated literature
        database, and suggests how to nudge the conditions to switch the
        predicted architecture.
      </p>

      <h2>The model</h2>
      <p>
        A gradient-boosted classifier on <strong>XTB</strong>-computed monomer
        descriptors plus solvent log&nbsp;<em>P</em>, temperature, and an
        embedding of the polymerisation type and method. A{' '}
        <strong>voting</strong> layer compares the classifier&apos;s prediction
        against the architecture of the closest same-monomer literature
        reaction; predictions where the two
        <em> disagree</em> are flagged on the result card (and discarded in the
        paper&apos;s coverage metric), so you know when to be cautious.
      </p>

      <h2>The data</h2>
      <p>
        A vision–language-model pipeline parses typeset tables and scanned
        figures from polymer-chemistry literature, yielding{' '}
        <strong>~3,800 copolymerisations</strong> from{' '}
        <strong>~1,200 publications</strong>, each annotated with reactivity
        ratios, solvent, temperature, and polymerisation mechanism — the first
        dataset at this scale to record reaction conditions per entry. The full
        dataset is openly available; the <strong>Data</strong> tab links to the
        NOMAD entry for interactive search.
      </p>

      <h2>Architecture switch (counterfactual)</h2>
      <p>
        For the inputs you supply, the model first predicts the architecture for
        the <strong>exact</strong> conditions you entered — the{' '}
        <em>baseline</em>. It then sweeps a grid of solvents (drawn from the
        chosen <em>solvent set</em>) crossed with temperatures (from the chosen{' '}
        <em>temperature range</em>) and reports the condition sets whose
        predicted architecture <strong>differs</strong> from the baseline,
        ranked by the smallest change in solvent log&nbsp;<em>P</em> (then
        temperature). Each counterfactual is paired with the closest{' '}
        <em>same-monomer</em> literature reaction so the experimental analogue
        is one click away.
      </p>

      <h2>How the app was built</h2>
      <ul className="about-pipeline">
        <li>
          <strong>Data extraction</strong> — a multi-modal VLM pipeline (built
          on the lab&apos;s open-source <code>copolextractor</code>) ingests
          PDFs and tabulates reactivity ratios with conditions.
        </li>
        <li>
          <strong>Curation</strong> — duplicates and inconsistent entries are
          flagged and reconciled; SMILES are canonicalised with RDKit.
        </li>
        <li>
          <strong>Descriptors</strong> — XTB semi-empirical quantum chemistry
          computes per-monomer electronic descriptors (Fukui indices, HOMO/LUMO,
          dipole, etc.); solvent properties come from RDKit.
        </li>
        <li>
          <strong>Model</strong> — an XGBoost multi-class classifier with
          hyper-parameter tuning on the curated splits; a nearest-neighbour
          lookup module computes the voting layer.
        </li>
        <li>
          <strong>Deployment</strong> — the model and dataset ship together
          inside a FastAPI service (this web app is its frontend). Both
          codebases are public; see the <strong>API</strong> tab for the live
          OpenAPI documentation.
        </li>
      </ul>

      <h2>Citation</h2>
      <blockquote className="about-citation">
        Predicting copolymer architecture from literature-extracted data.{' '}
        <em>Manuscript in preparation.</em> See the{' '}
        <a
          href="https://github.com/lamalab-org/copolymer-reactivity"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub repository
        </a>{' '}
        for the latest preprint and the dataset.
      </blockquote>

      <h2>Credits & contact</h2>
      <p>
        Built by <strong>Mara Schilling-Wilhelmi</strong>,{' '}
        <strong>
          <a
            href="https://zakodium.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Luc Patiny
          </a>
        </strong>{' '}
        (Zakodium SA), and{' '}
        <strong>
          <a
            href="https://kjablonka.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Kevin Jablonka
          </a>
        </strong>
        , with{' '}
        <a
          href="https://nomad-lab.eu/nomad-lab/"
          target="_blank"
          rel="noopener noreferrer"
        >
          NOMAD
        </a>{' '}
        support from <strong>Sarthak Kapoor</strong> and experimental support
        from <strong>Boris Bulgakov</strong>.
      </p>
      <p>
        For research enquiries, reach out via{' '}
        <a href="https://lamalab.org" target="_blank" rel="noopener noreferrer">
          lamalab.org
        </a>
        . Bug reports, questions, and contributions are welcome as GitHub issues
        on the{' '}
        <a
          href="https://github.com/lamalab-org/copolymer-reactivity/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          copolymer-reactivity
        </a>{' '}
        (model + API) and{' '}
        <a
          href="https://github.com/cheminfo/polycarp.cheminfo.org/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          polycarp.cheminfo.org
        </a>{' '}
        (this web app) repositories.
      </p>
    </div>
  );
}
