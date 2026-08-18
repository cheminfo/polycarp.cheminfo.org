import { pageDocumentMeta } from 'react-cheminfo/core';
import { expect, test } from 'vitest';

import { ROUTES, routeForPath } from '../routes.ts';

test('every route resolves to itself', () => {
  for (const route of ROUTES) {
    expect(routeForPath(route.path).path).toBe(route.path);
  }
});

test('a trailing slash resolves to the same route', () => {
  expect(routeForPath('/guide/').path).toBe('/guide');
  expect(routeForPath('/').path).toBe('/');
});

test('an unknown address falls back to the home page', () => {
  expect(routeForPath('/nope').path).toBe('/');
  expect(routeForPath('/results/extra').path).toBe('/');
});

test('the title is the page name then the site name', () => {
  expect(
    pageDocumentMeta({ site: 'polycarp', routes: ROUTES, url: '/results' })
      .title,
  ).toBe('Model performance — PolyCarp');
});

test('every page has a distinct title and description', () => {
  const titles = new Set(ROUTES.map((route) => route.title));
  const descriptions = new Set(ROUTES.map((route) => route.description));
  expect(titles.size).toBe(ROUTES.length);
  expect(descriptions.size).toBe(ROUTES.length);
});

test('descriptions are the length search results show', () => {
  for (const route of ROUTES) {
    expect(route.description.length).toBeGreaterThanOrEqual(110);
    expect(route.description.length).toBeLessThanOrEqual(160);
  }
});
