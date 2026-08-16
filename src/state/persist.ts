import { Signal, effect } from '@preact/signals-react';

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

function applyTree(bucket: Bucket, stored: unknown): void {
  if (typeof stored !== 'object' || stored === null) return;
  for (const [key, value] of Object.entries(bucket)) {
    if (!(key in stored)) continue;
    const incoming = (stored as Record<string, unknown>)[key];
    if (isSignal(value)) {
      if (incoming !== undefined) value.value = incoming;
    } else {
      applyTree(value, incoming);
    }
  }
}

/**
 * Rehydrates a bucket of signals from one namespaced `localStorage` entry and
 * re-serialises the whole tree whenever any leaf changes. Storage is
 * partitioned or unavailable inside an iframe, so every access is best-effort
 * and the app must stay usable when it fails.
 * @param key - Bucket name, namespaced under `polycarp:`.
 * @param bucket - Plain object whose leaves are signals.
 * @returns The same bucket, rehydrated.
 */
export function persistBucket<T extends Bucket>(key: string, bucket: T): T {
  const storageKey = `${STORAGE_PREFIX}:${key}:v1`;

  try {
    const stored = globalThis.localStorage?.getItem(storageKey);
    if (stored) applyTree(bucket, JSON.parse(stored));
  } catch {
    // Unreadable or partitioned storage: keep the defaults.
  }

  effect(() => {
    const snapshot = JSON.stringify(readTree(bucket));
    try {
      globalThis.localStorage?.setItem(storageKey, snapshot);
    } catch {
      // Quota exceeded or storage blocked: preferences simply do not persist.
    }
  });

  return bucket;
}
