import { signal } from '@preact/signals-react';

import { persistBucket } from './persist.ts';

// Styrene + methyl methacrylate in chloroform at 60 °C — the textbook
// free-radical copolymerisation, and a monomer pair with ~150 literature
// entries, so the landing screen demonstrates model-vs-literature agreement.
export const DEFAULT_MONOMER1 = 'C=Cc1ccccc1';
export const DEFAULT_MONOMER2 = 'C=C(C)C(=O)OC';
export const DEFAULT_SOLVENT = 'ClC(Cl)Cl';

/** User choices that survive a reload. Persisted as one localStorage entry. */
export const preferences = persistBucket('preferences', {
  reaction: {
    monomer1Smiles: signal(DEFAULT_MONOMER1),
    monomer2Smiles: signal(DEFAULT_MONOMER2),
    solventSmiles: signal(DEFAULT_SOLVENT),
    temperature: signal(60),
    method: signal('solvent'),
    polytype: signal('free radical'),
  },
  optimization: {
    solventSet: signal('top3'),
    temperatureMode: signal('step20'),
  },
});

/** Restores every reaction and optimization setting to its default. */
export function resetReactionPreferences(): void {
  preferences.reaction.monomer1Smiles.value = DEFAULT_MONOMER1;
  preferences.reaction.monomer2Smiles.value = DEFAULT_MONOMER2;
  preferences.reaction.solventSmiles.value = DEFAULT_SOLVENT;
  preferences.reaction.temperature.value = 60;
  preferences.reaction.method.value = 'solvent';
  preferences.reaction.polytype.value = 'free radical';
  preferences.optimization.solventSet.value = 'top3';
  preferences.optimization.temperatureMode.value = 'step20';
}
