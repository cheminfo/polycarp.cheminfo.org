import type { RoutePath } from '../routes.ts';
import { SITE_URL, routeForPath, titleForRoute } from '../routes.ts';

import { serializeShareConfig } from './shareConfig.ts';
import { view } from './view.ts';

/**
 * Navigates to a routed path, carrying the share configuration and the tool
 * inputs already in the address so an embed stays configured across clicks.
 * @param path - The routed path to move to.
 */
export function navigate(path: RoutePath): void {
  const query = serializeShareConfig(
    view.share.value,
    globalThis.location.search,
  );
  globalThis.history.pushState(null, '', `${path}${query ? `?${query}` : ''}`);
  view.path.value = path;
  syncDocumentMeta();
}

/** Starts listening for back/forward, and titles the initial page. */
export function startRouter(): () => void {
  const onPopState = () => {
    view.path.value = routeForPath(globalThis.location.pathname).path;
    syncDocumentMeta();
  };
  globalThis.addEventListener('popstate', onPopState);
  syncDocumentMeta();
  return () => globalThis.removeEventListener('popstate', onPopState);
}

/**
 * Keeps the tab title and the canonical link in step after an in-app move. The
 * description and the social card were already read off the wire by then, so
 * nothing else is rewritten here.
 */
function syncDocumentMeta(): void {
  const route = routeForPath(globalThis.location.pathname);
  document.title = titleForRoute(route);
  const canonical = document.querySelector('link[rel="canonical"]');
  // The canonical drops the query string: a shared configuration is not a page.
  canonical?.setAttribute('href', `${SITE_URL}${route.path}`);
}
