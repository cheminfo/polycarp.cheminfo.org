import { expect, test } from 'vitest';

import {
  parseShareConfig,
  serializeShareConfig,
  shareUrl,
} from '../shareConfig.ts';

test('an address with no configuration parses to the defaults', () => {
  expect(parseShareConfig('')).toStrictEqual({ embed: false, hide: [] });
  expect(parseShareConfig('?mf=C5H12')).toStrictEqual({
    embed: false,
    hide: [],
  });
});

test('embed is set by the bare flag and by an explicit value', () => {
  expect(parseShareConfig('?embed').embed).toBe(true);
  expect(parseShareConfig('?embed=1').embed).toBe(true);
  expect(parseShareConfig('?embed=0').embed).toBe(false);
});

test('hide reads a comma-separated list of known keys', () => {
  expect(parseShareConfig('?hide=literature,optimization').hide).toStrictEqual([
    'literature',
    'optimization',
  ]);
});

test('an unknown hide key is ignored so an old link still opens', () => {
  expect(
    parseShareConfig('?hide=literature,renamedLastYear').hide,
  ).toStrictEqual(['literature']);
  expect(parseShareConfig('?hide=').hide).toStrictEqual([]);
});

test('a repeated hide key is kept once', () => {
  expect(parseShareConfig('?hide=literature,literature').hide).toStrictEqual([
    'literature',
  ]);
});

test('a default is deleted rather than written', () => {
  expect(serializeShareConfig({ embed: false, hide: [] })).toBe('');
  expect(
    serializeShareConfig({ embed: false, hide: [] }, '?embed=1&hide=x'),
  ).toBe('');
});

test('serialization keeps the tool inputs already in the address', () => {
  expect(
    serializeShareConfig({ embed: true, hide: [] }, '?temperature=80'),
  ).toBe('temperature=80&embed=1');
});

test('the hide list is serialized with readable commas', () => {
  expect(
    serializeShareConfig({ embed: true, hide: ['literature', 'optimization'] }),
  ).toBe('embed=1&hide=optimization,literature');
});

test('parse and serialize round-trip a configuration', () => {
  const query = serializeShareConfig({
    embed: true,
    hide: ['templates', 'architecture'],
  });
  expect(parseShareConfig(`?${query}`)).toStrictEqual({
    embed: true,
    hide: ['templates', 'architecture'],
  });
});

test('shareUrl builds an absolute address and drops an empty query', () => {
  expect(
    shareUrl('https://polycarp.cheminfo.org', '/guide', {
      embed: false,
      hide: [],
    }),
  ).toBe('https://polycarp.cheminfo.org/guide');
  expect(
    shareUrl('https://polycarp.cheminfo.org', '/', {
      embed: true,
      hide: ['literature'],
    }),
  ).toBe('https://polycarp.cheminfo.org/?embed=1&hide=literature');
});
