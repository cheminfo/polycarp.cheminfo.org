import react from '@vitejs/plugin-react';
import { cheminfoPrerender } from 'react-cheminfo/vite';
import { defineConfig } from 'vite';

import { ROUTES } from './src/routes.ts';

// Where the dev server forwards `/api` requests. Defaults to the live
// deployment so `npm run dev` works with no setup; point it at a local
// backend with VITE_API_PROXY (e.g. http://localhost:8000). The `/api`
// prefix is stripped, matching the production nginx reverse proxy.
const apiTarget =
  process.env.VITE_API_PROXY ?? 'https://polycarp.cheminfo.org/api';

// The published host port is derived from the first commit date (2026-04-29 →
// 60429, over 60000 so minus 50000); the dev server takes PORT + 1. Never
// Vite's stock 5173, which two checkouts would fight over.
const hostPort = Number(process.env.PORT ?? 10429);
const devServerPort = Number(process.env.VITE_PORT ?? hostPort + 1);

export default defineConfig({
  plugins: [
    react(),
    cheminfoPrerender({
      site: 'polycarp',
      routes: ROUTES,
      // The prediction API is an endpoint, not a page.
      robots: ['/api/'],
      category: 'ScienceApplication',
      operatingSystem: 'Any',
      currency: 'USD',
      // The site says more about itself than its one-line tagline does; the
      // link labels are the route titles, except where a title written for a
      // search result is too long to read as a menu entry (`short`).
      noscript: {
        heading: 'PolyCarp — copolymer microstructure prediction',
        intro:
          'PolyCarp predicts whether a radical copolymer is alternating, random to block-like or gradient, from its monomer pair, solvent and reaction conditions. It needs JavaScript to run.',
      },
    }),
  ],
  server: {
    port: devServerPort,
    // Fail loudly instead of drifting to the next free port, which would leave
    // the README and this file disagreeing.
    strictPort: true,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
  },
  optimizeDeps: {
    include: ['openchemlib'],
  },
});
