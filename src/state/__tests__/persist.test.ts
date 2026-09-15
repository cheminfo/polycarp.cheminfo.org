import { signal } from '@preact/signals-react';
import { expect, test, vi } from 'vitest';

import { persistBucket } from '../persist.ts';

/**
 * Stands in for `localStorage`, which Node does not have.
 * @param entries - What the store already holds.
 * @returns The entries, still readable after the bucket has written to them.
 */
function stubStore(entries: Record<string, string> = {}): Map<string, string> {
  const store = new Map(Object.entries(entries));
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  });
  return store;
}

test('a stored bucket is read back onto the signals', () => {
  const store = stubStore({
    'polycarp:preferences:v1': JSON.stringify({
      reaction: { temperature: 95, method: 'bulk' },
    }),
  });

  const bucket = persistBucket('preferences', {
    reaction: { temperature: signal(60), method: signal('solvent') },
    optimization: { solventSet: signal('top3') },
  });

  expect(bucket.reaction.temperature.value).toBe(95);
  expect(bucket.reaction.method.value).toBe('bulk');
  // A field the stored payload never named keeps its default.
  expect(bucket.optimization.solventSet.value).toBe('top3');
  // The whole tree is written back, defaults included.
  expect(JSON.parse(store.get('polycarp:preferences:v1') ?? '')).toStrictEqual({
    reaction: { temperature: 95, method: 'bulk' },
    optimization: { solventSet: 'top3' },
  });
});

test('changing a signal re-serialises the whole bucket', () => {
  const store = stubStore();
  const bucket = persistBucket('changes', {
    reaction: { temperature: signal(60) },
  });

  bucket.reaction.temperature.value = 42;

  expect(JSON.parse(store.get('polycarp:changes:v1') ?? '')).toStrictEqual({
    reaction: { temperature: 42 },
  });
});

test('a stored field whose shape no longer matches is discarded', () => {
  stubStore({
    'polycarp:shape:v1': JSON.stringify({ reaction: { temperature: 'hot' } }),
  });

  const bucket = persistBucket('shape', {
    reaction: { temperature: signal(60) },
  });

  expect(bucket.reaction.temperature.value).toBe(60);
});

test('a store that throws leaves the defaults in place', () => {
  vi.stubGlobal('localStorage', {
    getItem: () => {
      throw new Error('storage is partitioned');
    },
    setItem: () => {
      throw new Error('storage is partitioned');
    },
    removeItem: () => undefined,
  });

  const bucket = persistBucket('blocked', {
    reaction: { temperature: signal(60) },
  });

  expect(bucket.reaction.temperature.value).toBe(60);
});
