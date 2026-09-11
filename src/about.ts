import type { AboutContent } from 'react-cheminfo/core';

/**
 * What PolyCarp says about itself: the record the shared About page is drawn
 * from. The prose limits are checked by `aboutProblems` in the test suite.
 */
export const ABOUT: AboutContent = {
  siteId: 'polycarp',
  what: 'PolyCarp predicts whether a radical copolymerisation gives an alternating, random to block-like or gradient copolymer.',
  can: [
    'Draw two monomers, set solvent, temperature and mechanism, and predict the class.',
    'Read the nearest literature copolymerisations the prediction was checked against.',
    'Sweep solvents and temperatures to find conditions that switch the architecture.',
    'See where the classifier and its literature analogue disagree, flagged on the card.',
    "Browse the model's per-class accuracy on the training and test splits.",
    'Call the same predictions from the REST API.',
  ],
  paragraphs: [
    "A gradient-boosted classifier reads XTB descriptors of the two monomers, the solvent's log P, the temperature and the polymerisation type. A voting layer compares its answer with the closest same-monomer reaction in the literature, and flags the prediction when the two disagree.",
    'The training set is ~3,800 copolymerisations extracted from ~1,200 publications, each recorded with its solvent, temperature and mechanism — the first dataset at this scale to carry conditions per entry. It is open: the Data link in the header opens it in NOMAD.',
  ],
  cite: [
    {
      what: 'Condition-aware prediction of copolymer architecture',
      reference: {
        authors: [
          { given: 'Mara', family: 'Schilling-Wilhelmi' },
          { given: 'Boris', family: 'Bulgakov' },
          { given: 'Luc', family: 'Patiny' },
          { given: 'Sarthak', family: 'Kapoor' },
          { given: 'Kevin Maik', family: 'Jablonka' },
        ],
        title: 'Condition-aware prediction of copolymer architecture',
        journal: 'ChemRxiv',
        journalAbbreviation: 'ChemRxiv',
        year: 2026,
        volume: '',
        issue: '',
        firstPage: '',
        lastPage: '',
        doi: '10.26434/chemrxiv.15004102/v2',
        publisher: 'ChemRxiv',
      },
    },
  ],
  credits: [
    'openchemlib',
    'react-ocl',
    'react-science',
    'react-cheminfo',
    'blueprint',
    'cheminfo-font',
    'react',
    'vite',
  ],
};
