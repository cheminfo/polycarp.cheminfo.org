import { useSignals } from '@preact/signals-react/runtime';
import type { ComponentType } from 'react';
import { useEffect } from 'react';

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

/** Root component: starts the router and renders the routed page. */
export function App() {
  useEffect(startRouter, []);

  return (
    <AppShell>
      <RoutedPage />
    </AppShell>
  );
}

function RoutedPage() {
  useSignals();
  const Page = PAGES[state.view.path.value];
  return <Page />;
}
