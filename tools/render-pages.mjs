/**
 * Renders every catalogued .html page in headless Chrome and saves the DOM
 * AFTER its scripts have run, into tools/.rendered/<same path>.
 *
 * Why: several pages are partly generated at load time — Varesa's source has
 * 2 tables, the rendered page has 4 (the ascension ladder and set grid come
 * from app/ascension.js and app/icons.js). Migrating the source would ship
 * empty placeholders, which is how a page once lost 96% of its content.
 *
 *     node tools/render-pages.mjs              # all pages
 *     node tools/render-pages.mjs varesa-build.html
 *
 * Starts its own static server on 8799 and stops it afterwards.
 */

import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { catalogue } from './flux-catalogue.mjs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 8799;
const OUT = 'tools/.rendered';

const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const targets = catalogue()
  .filter((e) => e.href.endsWith('.html'))
  .filter((e) => !only.length || only.includes(e.href));

const server = spawn('python', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'],
  { stdio: 'ignore' });
await new Promise((resolve) => setTimeout(resolve, 1500));

let done = 0;
const failed = [];
try {
  for (const e of targets) {
    try {
      // virtual-time-budget lets module scripts finish their JSON fetches
      // before the DOM is dumped.
      const html = execFileSync(CHROME, [
        '--headless=new', '--disable-gpu', '--virtual-time-budget=8000',
        '--dump-dom', `http://127.0.0.1:${PORT}/${e.href}`,
      ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
      const path = join(OUT, e.href);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, html);
      done++;
    } catch (err) {
      failed.push(`${e.href}: ${err.message.slice(0, 80)}`);
    }
  }
} finally {
  server.kill();
}

console.log(`rendered ${done}/${targets.length} pages into ${OUT}/`);
failed.forEach((f) => console.log('  FAILED ' + f));
