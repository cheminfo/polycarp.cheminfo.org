import {
  applyShareConfig,
  buildShareUrl,
  parseShareConfig,
} from 'react-cheminfo/core';
import { expect, test } from 'vitest';

import { SHARE_VOCABULARY } from '../shareConfig.ts';

const parse = (search: string) => parseShareConfig(search, SHARE_VOCABULARY);
const apply = (config: Parameters<typeof applyShareConfig>[1], search = '') =>
  applyShareConfig(search, config, SHARE_VOCABULARY);

test('an address with no configuration parses to the defaults', () => {
  expect(parse('')).toStrictEqual({ embed: false, hidden: [], params: {} });
  expect(parse('?mf=C5H12')).toStrictEqual({
    embed: false,
    hidden: [],
    params: {},
  });
});

test('embed is set by the bare flag and by an explicit value', () => {
  expect(parse('?embed').embed).toBe(true);
  expect(parse('?embed=1').embed).toBe(true);
  expect(parse('?embed=0').embed).toBe(false);
});

test('hide reads a comma-separated list of known keys', () => {
  expect(parse('?hide=literature,optimization').hidden).toStrictEqual([
    'optimization',
    'literature',
  ]);
});

test('an unknown hide key is ignored so an old link still opens', () => {
  expect(parse('?hide=literature,renamedLastYear').hidden).toStrictEqual([
    'literature',
  ]);
  expect(parse('?hide=').hidden).toStrictEqual([]);
});

test('a repeated hide key is kept once', () => {
  expect(parse('?hide=literature,literature').hidden).toStrictEqual([
    'literature',
  ]);
});

test('a default is deleted rather than written', () => {
  expect(apply({ embed: false, hidden: [], params: {} })).toBe('');
  expect(
    apply({ embed: false, hidden: [], params: {} }, '?embed=1&hide=x'),
  ).toBe('');
});

test('serialization keeps the tool inputs already in the address', () => {
  expect(
    apply({ embed: true, hidden: [], params: {} }, '?temperature=80'),
  ).toBe('temperature=80&embed=1');
});

test('the hide list is serialized with readable commas', () => {
  expect(
    apply({ embed: true, hidden: ['literature', 'optimization'], params: {} }),
  ).toBe('embed=1&hide=optimization,literature');
});

test('parse and serialize round-trip a configuration', () => {
  const query = apply({
    embed: true,
    hidden: ['templates', 'architecture'],
    params: {},
  });
  expect(parse(`?${query}`)).toStrictEqual({
    embed: true,
    hidden: ['templates', 'architecture'],
    params: {},
  });
});

test('buildShareUrl builds an absolute address and drops an empty query', () => {
  expect(
    buildShareUrl({
      base: 'https://polycarp.cheminfo.org/guide',
      config: { embed: false, hidden: [], params: {} },
      vocabulary: SHARE_VOCABULARY,
    }),
  ).toBe('https://polycarp.cheminfo.org/guide');
  expect(
    buildShareUrl({
      base: 'https://polycarp.cheminfo.org/',
      config: { embed: true, hidden: ['literature'], params: {} },
      vocabulary: SHARE_VOCABULARY,
    }),
  ).toBe('https://polycarp.cheminfo.org/?embed=1&hide=literature');
});
