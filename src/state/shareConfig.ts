import type { ShareVocabulary } from 'react-cheminfo/core';

/**
 * The share vocabulary: `embed` drops the site chrome, `hide` switches features
 * off. This module is the only place that knows those names — components ask
 * `isHidden(key)` and never parse the address themselves.
 */
export const SHARE_VOCABULARY = {
  parts: [
    {
      key: 'templates',
      label: 'Structure templates',
      description:
        'Hiding it keeps the monomers the link carries, but the visitor can only edit them by drawing.',
    },
    {
      key: 'optimization',
      label: 'Condition optimization',
      description:
        'Hiding it removes the solvent/temperature search and its two settings.',
    },
    {
      key: 'architecture',
      label: 'Architecture switch',
      description:
        'Hiding it removes the search for conditions that flip the predicted class.',
      // Inside a host page this repeats what the course already shows.
      hiddenByDefault: true,
    },
    {
      key: 'literature',
      label: 'Nearest literature',
      description:
        'Hiding it removes the table of similar reactions found in the dataset.',
    },
  ],
} as const satisfies ShareVocabulary;

export type HideKey = (typeof SHARE_VOCABULARY)['parts'][number]['key'];
