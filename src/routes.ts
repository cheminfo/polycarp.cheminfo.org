import type { RouteMeta } from 'react-cheminfo/core';

export const SITE_NAME = 'PolyCarp';
export const SITE_URL = 'https://polycarp.cheminfo.org';

/**
 * A routed page: what a crawler is told about it, plus the label the header
 * shows. `path`, `title`, `short` and `description` come from `RouteMeta`; a
 * description is one sentence of 110–160 characters, the length a search
 * result shows.
 */
export interface RouteDefinition extends RouteMeta {
  /** Label shown in the header navigation. */
  label: string;
}

/**
 * Every address the application routes itself. This is the single source the
 * router, the sitemap, the prerenderer and the `<noscript>` block all read, so
 * a new page can never be indexed inconsistently.
 */
export const ROUTES = [
  {
    path: '/',
    label: 'Prediction',
    title: 'Copolymer microstructure prediction',
    short: 'Prediction',
    description:
      'Predict whether a radical copolymer is alternating, random to block-like or gradient from its monomer pair, solvent and reaction conditions.',
  },
  {
    path: '/results',
    label: 'Results',
    title: 'Model performance',
    description:
      'Per-class accuracy, precision and F1 of the XGBoost and voting models on the training and test splits, with every individual prediction browsable.',
  },
  {
    path: '/api-docs',
    label: 'API',
    title: 'REST API',
    description:
      'OpenAPI reference for the PolyCarp prediction service: preprocess monomers, predict copolymer class, optimise conditions and search architecture switches.',
  },
  {
    path: '/guide',
    label: 'User Guide',
    title: 'User guide',
    description:
      'How to draw monomers, choose polymerisation conditions and read a PolyCarp prediction, its confidence and the nearest literature reactions.',
  },
  {
    path: '/about',
    label: 'About',
    title: 'About',
    description:
      'PolyCarp predicts copolymer microstructure from XTB descriptors and a curated reactivity-ratio dataset. Method, data sources, citation and licence.',
  },
] as const satisfies readonly RouteDefinition[];

export type Route = (typeof ROUTES)[number];
export type RoutePath = Route['path'];

/** Resolves a URL path to a known route, falling back to the home page. */
export function routeForPath(pathname: string): Route {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;
  return ROUTES.find((route) => route.path === normalized) ?? ROUTES[0];
}
