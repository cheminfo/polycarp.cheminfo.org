import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { prerender } from './vite-plugin-prerender.ts';

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
  plugins: [react(), prerender()],
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
