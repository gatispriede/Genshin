/**
 * Uploads every map image used by a drawMap() page to the flux image library
 * and records its public URL, so MAP_ANNOTATED modules can point at it.
 *
 *     secrets run flux-node tools/flux-upload-map-images.mjs           # dry run
 *     secrets run flux-node tools/flux-upload-map-images.mjs --apply
 *
 * Idempotent: images already in the manifest are skipped. The manifest,
 * reference/data/flux-map-images.json, maps "assets/foo.webp" -> flux URL and
 * is what tools/flux-maps.mjs reads.
 *
 * Positions survive the upload: flux resizes to a 1920px long edge, and
 * marker x/y are percentages of the image, so a uniform resize moves nothing.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { extname } from 'node:path';
import { connect, call } from './flux-client.mjs';

const APPLY = process.argv.includes('--apply');
const MANIFEST = 'reference/data/flux-map-images.json';
const TYPES = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };

/** Every data-map="..." on a page that calls drawMap. */
export function mapImagesInRepo() {
  const found = new Set();
  for (const f of readdirSync('.').filter((n) => n.endsWith('.html'))) {
    const html = readFileSync(f, 'utf8');
    if (!html.includes('drawMap')) continue;
    for (const m of html.matchAll(/data-map="([^"]+)"/g)) found.add(m[1]);
  }
  return [...found].sort();
}

const main = async () => {
  const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
  const todo = mapImagesInRepo().filter((p) => !manifest[p]);
  console.log(`${Object.keys(manifest).length} already uploaded, ${todo.length} to upload`);
  for (const p of todo) console.log('  ', p);
  if (!APPLY || todo.length === 0) { if (!APPLY) console.log('\ndry run — pass --apply'); return; }

  await connect('genshin-map-images');
  const failed = [];
  for (const p of todo) {
    // A shrunk copy (tools/.map-upload/<name>) wins when present: payloads
    // over ~1 MB of base64 fail the request-body limit with "internal error".
    const shrunk = `tools/.map-upload/${p.split('/').pop()}`;
    const src = existsSync(shrunk) ? shrunk : p;
    try {
      const r = await call('image.upload', {
        filename: p.split('/').pop(),
        contentBase64: readFileSync(src).toString('base64'),
        contentType: TYPES[extname(src).toLowerCase()],
        ratio: 'free',
        tags: ['genshin-map'],
        idempotencyKey: `genshin-map:${p}`,
      });
      const url = r.location || r.url || r.data?.location || r.data?.url;
      if (!url) throw new Error(`no URL in result: ${JSON.stringify(r).slice(0, 200)}`);
      manifest[p] = url;
      writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
      console.log(`  ${p} -> ${url}${src === shrunk ? '  (shrunk copy)' : ''}`);
    } catch (e) {
      failed.push(p);
      console.log(`  FAILED ${p} (${Math.round(readFileSync(src).length / 1024)} KB): ${e.message}`);
    }
  }
  if (failed.length) { console.log(`\n${failed.length} failed`); process.exitCode = 1; }
};

main().then(() => process.exit(0), (e) => { console.error(e.message); process.exit(1); });
