import { defineConfig, globalIgnores } from 'eslint/config';
import { globals } from 'eslint-config-zakodium';
import react from 'eslint-config-zakodium/react';
import ts from 'eslint-config-zakodium/ts';
import unicorn from 'eslint-config-zakodium/unicorn';

export default defineConfig(
  globalIgnores(['coverage', 'dist']),
  ts,
  unicorn,
  react,
  {
    // Runs inside the lactame.com visualizer runtime, which injects OCL and API.
    // It is a classic script, not a module, and it speaks the Python API's
    // snake_case payloads.
    files: ['views/**'],
    languageOptions: {
      globals: { ...globals.browser, API: 'readonly', OCL: 'readonly' },
    },
    rules: {
      camelcase: 'off',
      'no-console': 'off',
      'unicorn/prefer-top-level-await': 'off',
    },
  },
);
