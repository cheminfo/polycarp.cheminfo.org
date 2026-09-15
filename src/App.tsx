import { useSignals } from '@preact/signals-react/runtime';
import type { ComponentType } from 'react';
import { useEffect } from 'react';
import { SiteTheme } from 'react-cheminfo/ui';

import { AppShell } from './components/shared/AppShell.tsx';
import { AboutPage } from './pages/about/AboutPage.tsx';
import { ApiDocsPage } from './pages/apiDocs/ApiDocsPage.tsx';
import { GuidePage } from './pages/guide/GuidePage.tsx';
import { PredictPage } from './pages/predict/PredictPage.tsx';
import { ResultsPage } from './pages/results/ResultsPage.tsx';
import type { RoutePath } from './routes.ts';
import { state } from './state/index.ts';
import { startRouter } from './state/router.ts';

const PAGES: Record<RoutePath, ComponentType> = {
  '/': PredictPage,
  '/results': ResultsPage,
  '/api-docs': ApiDocsPage,
  '/guide': GuidePage,
  '/about': AboutPage,
};

// Swagger UI renders its own <main id="operations">, so the shell must not add a second one.
const PAGES_WITH_OWN_MAIN: ReadonlySet<RoutePath> = new Set(['/api-docs']);

/** Root component: starts the router and renders the routed page. */
export function App() {
  useSignals();
  useEffect(startRouter, []);
  const pageHasMain = PAGES_WITH_OWN_MAIN.has(state.view.path.value);

  return (
    <>
      <SiteTheme siteId="polycarp" />
      <AppShell pageHasMain={pageHasMain}>
        <RoutedPage />
      </AppShell>
    </>
  );
}

function RoutedPage() {
  useSignals();
  const Page = PAGES[state.view.path.value];
  return <Page />;
}
