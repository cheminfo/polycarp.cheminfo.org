import { signal } from '@preact/signals-react';

import type { RoutePath } from '../routes.ts';
import { routeForPath } from '../routes.ts';

import type { ShareConfig } from './shareConfig.ts';
import { DEFAULT_SHARE_CONFIG, parseShareConfig } from './shareConfig.ts';

export type ResultsPanel =
  'prediction' | 'optimization' | 'architecture' | 'lookup';

function initialPath(): RoutePath {
  if (globalThis.location === undefined) return '/';
  return routeForPath(globalThis.location.pathname).path;
}

function initialShareConfig(): ShareConfig {
  if (globalThis.location === undefined) return DEFAULT_SHARE_CONFIG;
  return parseShareConfig(globalThis.location.search);
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
  return view.share.value.hide.includes(key as never);
}
