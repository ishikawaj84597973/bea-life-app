import { copyFileSync, cpSync, mkdirSync, writeFileSync } from 'node:fs';
// Keep the files published by main/root in sync with the production build.
mkdirSync('assets', { recursive: true });
cpSync('dist/assets', 'assets', { recursive: true });
copyFileSync('dist/index.html', 'index.html');
writeFileSync('.nojekyll', '');
