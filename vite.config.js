import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        application: resolve(import.meta.dirname, 'index.html'),
        cgv: resolve(import.meta.dirname, 'cgv.html'),
        mentionsLegales: resolve(import.meta.dirname, 'mentions-legales.html'),
        confidentialite: resolve(import.meta.dirname, 'confidentialite.html')
      }
    }
  }
});
