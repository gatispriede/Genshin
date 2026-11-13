import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { cpSync, readdirSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Folders that hold either runtime assets or pages the catalogue links to.
 * Missing ones are skipped, so this can list more than a given checkout has.
 */
const ASSET_DIRS = ['styles', 'app', 'reference', 'img', 'farming', 'research', 'docs'];

/** Catalogued pages that sit loose at the root and are not .html. */
const ROOT_FILES = ['CLAUDE.md'];

/**
 * The React bundle is only half the site: every page under /page/ is a real
 * .html file at the project root, loaded in an iframe. Vite would ship dist/
 * with just app.html, so the frames would come up empty on the server. Copy
 * the static half in after the bundle is written.
 */
function copyStaticPages(): Plugin {
  return {
    name: 'copy-static-pages',
    apply: 'build',
    closeBundle() {
      const out = resolve(__dirname, 'dist');
      mkdirSync(out, { recursive: true });

      let html = 0;
      for (const file of readdirSync(__dirname)) {
        if (!file.endsWith('.html') || file === 'app.html') continue;
        cpSync(resolve(__dirname, file), resolve(out, file));
        html++;
      }

      const copied: string[] = [];
      for (const dir of ASSET_DIRS) {
        try {
          cpSync(resolve(__dirname, dir), resolve(out, dir), { recursive: true });
          copied.push(dir);
        } catch {
          // Optional folder — not every project checkout has all of them.
        }
      }

      for (const file of ROOT_FILES) {
        try {
          cpSync(resolve(__dirname, file), resolve(out, file));
        } catch {
          // Optional file.
        }
      }

      this.info(`copied ${html} static pages and ${copied.join(', ')} into dist/`);
    },
  };
}

// The project root is also the web root, so every existing .html page,
// styles/, app/ script and reference/data/*.json stays reachable unchanged.
// The React app is a second entry point at /app.html — index.html is left
// alone so the old hub keeps working while pages migrate across.
export default defineConfig({
  root: '.',
  plugins: [react(), copyStaticPages()],
  server: { port: 5180, open: '/app.html' },
  build: { rollupOptions: { input: 'app.html' } },
});
