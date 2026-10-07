import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: 'web',
  resolve: { alias: { '/src': fileURLToPath(new URL('./src', import.meta.url)) } },
  base: '/bea-life-app/',
  build: { outDir: '../dist', emptyOutDir: true }
});
