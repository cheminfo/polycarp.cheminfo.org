import { expect, test } from 'vitest';

import { renderRoute, renderSitemap } from '../../vite-plugin-prerender.ts';
import { ROUTES, routeForPath } from '../routes.ts';

const PAGE = [
  '<!doctype html><html lang="en"><head>',
  '<title>Copolymer microstructure prediction — PolyCarp</title>',
  '<meta name="description" content="home description" />',
  '<link rel="canonical" href="https://polycarp.cheminfo.org/" />',
  '<meta property="og:title" content="home title" />',
  '<meta property="og:description" content="home description" />',
  '<meta property="og:url" content="https://polycarp.cheminfo.org/" />',
  '</head><body></body></html>',
].join('');

test('a route gets its own title, description and canonical', () => {
  const html = renderRoute(PAGE, routeForPath('/guide'));
  expect(html).toContain('<title>User guide — PolyCarp</title>');
  expect(html).toContain(
    '<link rel="canonical" href="https://polycarp.cheminfo.org/guide" />',
  );
  expect(html).toContain(
    '<meta name="description" content="How to draw monomers, choose polymerisation conditions and read a PolyCarp prediction, its confidence and the nearest literature reactions." />',
  );
});

test('the social card mirrors the page, not the home page', () => {
  const html = renderRoute(PAGE, routeForPath('/results'));
  expect(html).toContain(
    '<meta property="og:title" content="Model performance — PolyCarp" />',
  );
  expect(html).toContain(
    '<meta property="og:url" content="https://polycarp.cheminfo.org/results" />',
  );
  expect(html).not.toContain('content="home title"');
});

test('an ampersand in a description is escaped, never emitted raw', () => {
  const html = renderRoute(PAGE, {
    path: '/x',
    label: 'X',
    title: 'Salt & "pepper"',
    description: 'A <b> tag & a "quote" must not break the head.',
  });
  expect(html).toContain('<title>Salt &amp; "pepper" — PolyCarp</title>');
  expect(html).toContain(
    'content="A &lt;b&gt; tag &amp; a &quot;quote&quot; must not break the head."',
  );
});

test('the sitemap lists every routed address as an absolute URL', () => {
  const xml = renderSitemap();
  for (const route of ROUTES) {
    expect(xml).toContain(
      `<loc>https://polycarp.cheminfo.org${route.path}</loc>`,
    );
  }
  expect(xml.match(/<loc>/g)).toHaveLength(ROUTES.length);
});
