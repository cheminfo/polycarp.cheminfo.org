import { signal } from '@preact/signals-react';
import type { ShareConfig } from 'react-cheminfo/core';
import {
  isHidden as isPartHidden,
  parseShareConfig,
} from 'react-cheminfo/core';

import type { RoutePath } from '../routes.ts';
import { routeForPath } from '../routes.ts';

import { SHARE_VOCABULARY } from './shareConfig.ts';

export type ResultsPanel =
  'prediction' | 'optimization' | 'architecture' | 'lookup';

function initialPath(): RoutePath {
  if (globalThis.location === undefined) return '/';
  return routeForPath(globalThis.location.pathname).path;
}

function initialShareConfig(): ShareConfig {
  const search =
    globalThis.location === undefined ? '' : globalThis.location.search;
  return parseShareConfig(search, SHARE_VOCABULARY);
}

/** Ephemeral cross-component UI state. Session-only. */
export const view = {
  path: signal<RoutePath>(initialPath()),
  resultsPanel: signal<ResultsPanel>('prediction'),
  shareDialogOpen: signal(false),
  /**
   * Read once from the initial address and re-applied to every address the app
   * writes afterwards, so a reload restores the same configuration.
   */
  share: signal<ShareConfig>(initialShareConfig()),
};

/** True when the named feature is switched off by the current share link. */
export function isHidden(key: string): boolean {
  return isPartHidden(view.share.value, key);
}
