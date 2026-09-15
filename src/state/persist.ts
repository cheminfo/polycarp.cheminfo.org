import { Signal, effect } from '@preact/signals-react';
import { persistBucket as persistJsonBucket } from 'react-cheminfo/core';

const STORAGE_PREFIX = 'polycarp';

interface Bucket {
  [key: string]: Signal<unknown> | Bucket;
}

function isSignal(value: unknown): value is Signal<unknown> {
  return value instanceof Signal;
}

function readTree(bucket: Bucket): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(bucket)) {
    out[key] = isSignal(value) ? value.value : readTree(value);
  }
  return out;
}

function applyTree(bucket: Bucket, stored: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(bucket)) {
    const incoming = stored[key];
    if (incoming === undefined) continue;
    if (isSignal(value)) {
      value.value = incoming;
    } else if (typeof incoming === 'object' && incoming !== null) {
      applyTree(value, incoming as Record<string, unknown>);
    }
  }
}

/**
 * Rehydrates a bucket of signals from one namespaced `localStorage` entry and
 * re-serialises the whole tree whenever any leaf changes.
 *
 * The entry itself is owned by `persistBucket` from `react-cheminfo/core`, which
 * survives a partitioned or full store and discards a stored field whose shape
 * no longer matches its default; what stays here is only the adapter between
 * that plain JSON object and a tree of signals.
 * @param key - Bucket name, namespaced under `polycarp:`.
 * @param bucket - Plain object whose leaves are signals.
 * @returns The same bucket, rehydrated.
 */
export function persistBucket<T extends Bucket>(key: string, bucket: T): T {
  const entry = persistJsonBucket({
    key: `${STORAGE_PREFIX}:${key}`,
    defaults: readTree(bucket),
  });

  applyTree(bucket, entry.read().value);

  effect(() => {
    entry.write(readTree(bucket));
  });

  return bucket;
}
