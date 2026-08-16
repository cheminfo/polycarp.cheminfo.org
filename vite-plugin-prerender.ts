import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Plugin } from 'vite';

import type { RouteDefinition } from './src/routes.ts';
import { ROUTES, SITE_URL, titleForRoute } from './src/routes.ts';

function escapeText(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function escapeAttribute(value: string): string {
  return escapeText(value).replaceAll('"', '&quot;');
}

interface HeadFields {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
}

function headFor(route: RouteDefinition): HeadFields {
  const url = `${SITE_URL}${route.path}`;
  const title = titleForRoute(route);
  return {
    title,
    description: route.description,
    canonical: url,
    ogTitle: title,
    ogDescription: route.description,
    ogUrl: url,
  };
}

const OG_PROPERTIES = [
  ['og:title', 'ogTitle'],
  ['og:description', 'ogDescription'],
  ['og:url', 'ogUrl'],
] as const satisfies ReadonlyArray<readonly [string, keyof HeadFields]>;

/**
 * Rewrites the built page's head for a single route.
 * @param html - The built `index.html`.
 * @param route - The route whose head to write.
 * @returns The page as that route should be served.
 */
export function renderRoute(html: string, route: RouteDefinition): string {
  const head = headFor(route);
  let out = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeText(head.title)}</title>`,
  );
  out = out.replace(
    /(?<open><meta\s+name="description"\s+content=")[^"]*(?<close>")/,
    `$<open>${escapeAttribute(head.description)}$<close>`,
  );
  out = out.replace(
    /(?<open><link\s+rel="canonical"\s+href=")[^"]*(?<close>")/,
    `$<open>${escapeAttribute(head.canonical)}$<close>`,
  );
  for (const [property, field] of OG_PROPERTIES) {
    out = out.replace(
      new RegExp(
        String.raw`(?<open><meta\s+property="${property}"\s+content=")[^"]*(?<close>")`,
      ),
      `$<open>${escapeAttribute(head[field])}$<close>`,
    );
  }
  return out;
}

/** The sitemap, generated from the same route table the router reads. */
export function renderSitemap(): string {
  const urls = ROUTES.map(
    (route) => `  <url><loc>${SITE_URL}${route.path}</loc></url>`,
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/**
 * Writes one real HTML file per route, each with its own title, description
 * and canonical, plus `sitemap.xml`. A static server has no request hook, so
 * the head has to be right before the file is ever served.
 * @returns The Vite plugin.
 */
export function prerender(): Plugin {
  return {
    name: 'polycarp-prerender',
    apply: 'build',
    enforce: 'post',
    writeBundle(options, bundle) {
      const outDir = options.dir ?? 'dist';
      const index = bundle['index.html'];
      if (index?.type !== 'asset') {
        throw new Error('prerender: index.html missing from the bundle');
      }
      const html = String(index.source);

      for (const route of ROUTES) {
        const rendered = renderRoute(html, route);
        if (route.path === '/') {
          writeFileSync(join(outDir, 'index.html'), rendered);
          continue;
        }
        const dir = join(outDir, route.path.slice(1));
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, 'index.html'), rendered);
      }

      writeFileSync(join(outDir, 'sitemap.xml'), renderSitemap());
    },
  };
}
