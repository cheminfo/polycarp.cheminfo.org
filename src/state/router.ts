import { effect } from '@preact/signals-react';
import { applyShareConfig, startDocumentMeta } from 'react-cheminfo/core';

import type { RoutePath } from '../routes.ts';
import { ROUTES, routeForPath } from '../routes.ts';

import { SHARE_VOCABULARY } from './shareConfig.ts';
import { view } from './view.ts';

/**
 * Navigates to a routed path, carrying the share configuration and the tool
 * inputs already in the address so an embed stays configured across clicks.
 * @param path - The routed path to move to.
 */
export function navigate(path: RoutePath): void {
  const query = applyShareConfig(
    globalThis.location.search,
    view.share.value,
    SHARE_VOCABULARY,
  );
  globalThis.history.pushState(null, '', `${path}${query ? `?${query}` : ''}`);
  view.path.value = path;
}

/** Starts listening for back/forward, and titles the page on screen. */
export function startRouter(): () => void {
  const onPopState = () => {
    view.path.value = routeForPath(globalThis.location.pathname).path;
  };
  globalThis.addEventListener('popstate', onPopState);
  const stopMeta = startDocumentMeta({
    site: 'polycarp',
    routes: ROUTES,
    url: () => view.path.value,
    follow: effect,
  });
  return () => {
    stopMeta();
    globalThis.removeEventListener('popstate', onPopState);
  };
}
