/**
 * The share vocabulary: `embed` drops the site chrome, `hide` switches features
 * off. This module is the only place that knows those names — components ask
 * `isHidden(key)` and never parse the address themselves.
 */

/** Every feature an embedder may switch off, named positively. */
export const HIDEABLE_FEATURES = [
  {
    key: 'templates',
    label: 'Structure templates',
    description:
      'Hiding it keeps the monomers the link carries, but the visitor can only edit them by drawing.',
  },
  {
    key: 'optimization',
    label: 'Condition optimization',
    description:
      'Hiding it removes the solvent/temperature search and its two settings.',
  },
  {
    key: 'architecture',
    label: 'Architecture switch',
    description:
      'Hiding it removes the search for conditions that flip the predicted class.',
  },
  {
    key: 'literature',
    label: 'Nearest literature',
    description:
      'Hiding it removes the table of similar reactions found in the dataset.',
  },
] as const satisfies ReadonlyArray<{
  key: string;
  label: string;
  description: string;
}>;

export type HideKey = (typeof HIDEABLE_FEATURES)[number]['key'];

const HIDE_KEYS = new Set<string>(HIDEABLE_FEATURES.map((f) => f.key));

export interface ShareConfig {
  /** Drop the site chrome — header, navigation, external links. */
  embed: boolean;
  /** Features switched off, in declaration order. */
  hide: HideKey[];
}

export const DEFAULT_SHARE_CONFIG: ShareConfig = { embed: false, hide: [] };

/**
 * Reads a share configuration out of a query string. An unknown `hide` key is
 * ignored so a link written before a feature was renamed still opens.
 * @param search - The address's query string, with or without its leading `?`.
 * @returns The configuration the address asks for.
 */
export function parseShareConfig(search: string): ShareConfig {
  const params = new URLSearchParams(search);
  // `?embed` and `?embed=1` both mean embedded — teachers retype these by hand.
  const embed = params.has('embed') && params.get('embed') !== '0';
  const seen = new Set<HideKey>();
  for (const raw of (params.get('hide') ?? '').split(',')) {
    const key = raw.trim();
    if (HIDE_KEYS.has(key)) seen.add(key as HideKey);
  }
  return { embed, hide: [...seen] };
}

/**
 * Writes a share configuration into a query string, deleting every key left at
 * its default so an unconfigured link stays a plain link.
 * @param config - The configuration to serialise.
 * @param search - The current query string, whose tool inputs are preserved.
 * @returns The query string, without its leading `?`, commas left unescaped.
 */
export function serializeShareConfig(config: ShareConfig, search = ''): string {
  const params = new URLSearchParams(search);
  params.delete('embed');
  params.delete('hide');
  if (config.embed) params.set('embed', '1');
  const wanted = new Set<string>(config.hide);
  const hide = HIDEABLE_FEATURES.filter((f) => wanted.has(f.key)).map(
    (f) => f.key,
  );
  if (hide.length > 0) params.set('hide', hide.join(','));
  // A teacher has to be able to read these links, and `,` parses identically.
  return params.toString().replaceAll('%2C', ',');
}

/**
 * Builds the absolute address a share link points at.
 * @param origin - Site origin, e.g. `https://polycarp.cheminfo.org`.
 * @param pathname - The routed path being shared.
 * @param config - The configuration to write into the query string.
 * @param search - The current query string, whose tool inputs are preserved.
 * @returns The absolute URL.
 */
export function shareUrl(
  origin: string,
  pathname: string,
  config: ShareConfig,
  search = '',
): string {
  const query = serializeShareConfig(config, search);
  return `${origin}${pathname}${query ? `?${query}` : ''}`;
}
