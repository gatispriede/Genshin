/**
 * Pre-export guard: the settings a bundle import OVERWRITES must be identical
 * on the local instance and on flux, or the import changes flux's settings.
 *
 * Found the hard way: the local instance carried funisimo's siteSeo branding
 * and populated operator details (address, email, phone, VAT, bank account)
 * where flux had none — while publicUrl and system pages, the two things that
 * had been checked, matched perfectly.
 *
 *     node tools/flux-settings.mjs --local         # snapshot local
 *     secrets run flux-settings                    # snapshot flux
 *     node tools/flux-settings.mjs --compare       # diff; exit 1 on any difference
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { connect, call, TARGET } from './flux-client.mjs';

const DIR = 'tools/.bundles';
const LOCAL = process.argv.includes('--local');

/** Isolation tokens differ per call; compare presence, not value. */
function normalise(v) {
  if (typeof v === 'string') return /^iso_[0-9a-f]+$/.test(v) ? '<set>' : v;
  if (Array.isArray(v)) return v.map(normalise);
  if (v && typeof v === 'object') {
    const out = {};
    for (const k of Object.keys(v).sort()) {
      if (['version', 'editedAt', 'editedBy', '_id', 'updatedAt'].includes(k)) continue;
      out[k] = normalise(v[k]);
    }
    return out;
  }
  return v;
}

/** Flatten to dotted paths so a diff names the exact field. */
function flatten(v, prefix = '', out = {}) {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    for (const [k, x] of Object.entries(v)) flatten(x, prefix ? `${prefix}.${k}` : k, out);
  } else {
    out[prefix] = JSON.stringify(v);
  }
  return out;
}

if (process.argv.includes('--compare')) {
  const read = (n) => JSON.parse(readFileSync(`${DIR}/settings-${n}.json`, 'utf8'));
  const [a, b] = [flatten(read('local')), flatten(read('flux'))];
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
  const diffs = keys.filter((k) => a[k] !== b[k]);
  if (!diffs.length) { console.log('settings identical — safe to export'); process.exit(0); }
  console.log(`${diffs.length} difference(s) — DO NOT EXPORT until resolved:\n`);
  for (const k of diffs) {
    console.log(`  ${k}\n    local: ${(a[k] ?? '(absent)').slice(0, 90)}\n    flux:  ${(b[k] ?? '(absent)').slice(0, 90)}`);
  }
  process.exit(1);
}

await connect('genshin-settings');
const seo = await call('seo.get', {});
const footer = await call('footer.get', {}).catch((e) => ({ error: e.message }));
const snapshot = normalise({ siteSeo: seo.siteSeo, siteFlags: seo.siteFlags, footer });

mkdirSync(DIR, { recursive: true });
const name = LOCAL ? 'local' : 'flux';
writeFileSync(`${DIR}/settings-${name}.json`, JSON.stringify(snapshot, null, 2));
console.log(`snapshot of ${TARGET} -> ${DIR}/settings-${name}.json`);
process.exit(0);
