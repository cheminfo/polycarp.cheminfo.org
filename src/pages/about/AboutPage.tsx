import { AboutPage as SharedAboutPage, AboutSection } from 'react-cheminfo/ui';

import { ABOUT } from '../../about.ts';

const MODEL_REPOSITORY = 'https://github.com/lamalab-org/copolymer-reactivity';

/** About page: the shared record, plus how the model and its data were built. */
export function AboutPage() {
  return (
    <SharedAboutPage content={ABOUT}>
      <AboutSection title="How it is built">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>Extraction</strong> — <code>copolextractor</code>, a
            vision-language pipeline, reads reactivity ratios and their
            conditions off typeset tables and scanned figures.
          </li>
          <li>
            <strong>Curation</strong> — duplicate and inconsistent entries are
            reconciled, and SMILES are canonicalised with RDKit.
          </li>
          <li>
            <strong>Descriptors</strong> — XTB computes Fukui indices, HOMO/LUMO
            and dipole per monomer; solvent properties come from RDKit.
          </li>
          <li>
            <strong>Model</strong> — an XGBoost multi-class classifier, with a
            nearest-neighbour lookup for the voting layer.
          </li>
          <li>
            <strong>Service</strong> — model and dataset ship inside a FastAPI
            service; this page is its frontend, and the API tab shows its live
            OpenAPI reference.
          </li>
        </ul>
        <p style={{ margin: '8px 0 0' }}>
          Built by Mara Schilling-Wilhelmi,{' '}
          <a href="https://zakodium.com" target="_blank" rel="noreferrer">
            Luc Patiny
          </a>{' '}
          and{' '}
          <a href="https://kjablonka.com" target="_blank" rel="noreferrer">
            Kevin Jablonka
          </a>
          , with NOMAD support from Sarthak Kapoor and experimental support from
          Boris Bulgakov. Reach the group at{' '}
          <a href="https://lamalab.org" target="_blank" rel="noreferrer">
            lamalab.org
          </a>
          .
        </p>
        <p style={{ margin: '8px 0 0' }}>
          The paper is in preparation. Until it appears, the preprint and the
          dataset are in{' '}
          <a href={MODEL_REPOSITORY} target="_blank" rel="noreferrer">
            lamalab-org/copolymer-reactivity
          </a>
          , which is also where a problem with the model or the API is reported.
        </p>
      </AboutSection>
    </SharedAboutPage>
  );
}
