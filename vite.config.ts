import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Project site: https://stredevirad.github.io/portfolio/
// The base must match the repository name (see docs/adr/002-hosting.md).
export const BASE = '/portfolio/';

export default defineConfig({
  base: BASE,
  plugins: [react()],
  build: {
    target: 'es2022',
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 2048,
    reportCompressedSize: false,
  },
  ssr: {
    noExternal: ['gsap', 'lenis'],
  },
  server: { port: 5173 },
  preview: { port: 4173 },
});
