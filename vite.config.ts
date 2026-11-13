import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { cpSync, readdirSync, mkdirSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Folders that hold either runtime assets or pages the catalogue links to.
 * Missing ones are skipped, so this can list more than a given checkout has.
 */
const ASSET_DIRS = ['styles', 'app', 'reference', 'img', 'farming', 'research', 'docs'];

/** Catalogued pages that sit loose at the root and are not .html. */
const ROOT_FILES = ['CLAUDE.md'];

/**
 * index.html is the hand-maintained hub and the input to
 * tools/build-pages-index.py, so it stays in the repo — but the React app
 * takes its place in a build, because Caddy serves index.html for a directory
 * request and app/nav.js already points "Home" at index.html.
 */
const HUB = 'index.html';
const APP_ENTRY = 'app.html';

/**
 * The React bundle is only half the site: every page the catalogue lists is a
 * real .html file. Vite would ship dist/ with just the bundle, so those links
 * would 404 on the server. Copy the static half in after the bundle is written
 * and promote the app to index.html.
 */
function buildStaticHalf(): Plugin {
  return {
    name: 'build-static-half',
    apply: 'build',
    closeBundle() {
      const out = resolve(__dirname, 'dist');
      mkdirSync(out, { recursive: true });

      let html = 0;
      for (const file of readdirSync(__dirname)) {
        // The hub is replaced by the app below; the entry is already in dist/.
        if (!file.endsWith('.html') || file === APP_ENTRY || file === HUB) continue;
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

      renameSync(resolve(out, APP_ENTRY), resolve(out, HUB));

      this.info(
        `copied ${html} static pages and ${copied.join(', ')} into dist/, ` +
        `and promoted ${APP_ENTRY} to ${HUB}`,
      );
    },
  };
}

// The project root is also the web root, so every existing .html page,
// styles/, app/ script and reference/data/*.json stays reachable unchanged.
//
// base: './' because the build is served from a subdirectory — flux serves it
// at /bundles/genshin/, not at a domain root. Absolute /assets/… URLs would
// 404 there. Relative URLs work in both places.
export default defineConfig({
  root: '.',
  base: './',
  plugins: [react(), buildStaticHalf()],
  server: { port: 5180, open: `/${APP_ENTRY}` },
  build: { rollupOptions: { input: APP_ENTRY } },
});
