import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { AppShell } from '../components/shared/AppShell.tsx';
import { AboutPage } from '../pages/about/AboutPage.tsx';

test('the shared header links to the NOMAD polymerization data', () => {
  const markup = renderToStaticMarkup(
    <AppShell>
      <div>content</div>
    </AppShell>,
  );

  expect(markup).toContain(
    'href="https://nomad-lab.eu/prod/v1/gui/search/polymerization"',
  );
});

test('the About page links to the PolyCARP repository', () => {
  const markup = renderToStaticMarkup(<AboutPage />);

  expect(markup).toContain('href="https://github.com/lamalab-org/PolyCARP"');
  expect(markup).toContain('lamalab-org/PolyCARP');
});
