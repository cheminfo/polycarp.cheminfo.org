import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      provider: 'v8',
    },
    // The specs under e2e/ are Playwright's, and vitest would collect them.
    exclude: [...configDefaults.exclude, 'e2e/**'],
    snapshotFormat: {
      maxOutputLength: Number.MAX_SAFE_INTEGER,
    },
  },
});
