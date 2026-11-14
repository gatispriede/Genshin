/**
 * Verifies an exported CMS bundle against this project's source pages.
 *
 *     node tools/verify-bundle.mjs tools/.bundles/local.json
 *
 * For every catalogued page that should have migrated, finds the CMS page of
 * the same title in the bundle and measures WORD RECALL: the share of the
 * source page's words that appear in that CMS page's modules. Length ratios
 * can hide a loss when something else adds text; recall cannot — and the
 * missing words are listed, so a gap can be traced to the block it came from.
 *
 * Also reports catalogue pages missing from the bundle, and build pages are
 * checked separately since they attach to character pages.
 */

import { readFileSync } from 'node:fs';
import { catalogue, route, sourceHtml } from './flux-catalogue.mjs';
import { contentText, text } from './html-blocks.mjs';
import { moduleText } from './flux-layout.mjs';

const PASS = 97;

const path = process.argv[2];
if (!path) { console.error('usage: node tools/verify-bundle.mjs <bundle.json>'); process.exit(2); }
const bundle = JSON.parse(readFileSync(path, 'utf8'));

/** Collect every array of objects anywhere in the bundle — the format is not documented. */
function arrays(node, out = []) {
  if (Array.isArray(node)) {
    if (node.length && typeof node[0] === 'object') out.push(node);
    node.forEach((n) => arrays(n, out));
  } else if (node && typeof node === 'object') {
    Object.values(node).forEach((v) => arrays(v, out));
  }
  return out;
}
const all = arrays(bundle);
const navigation = all.find((a) => a[0] && 'page' in a[0] && 'sections' in a[0]) || [];
const sectionRows = all.find((a) => a[0] && 'content' in a[0] && Array.isArray(a[0].content)) || [];
const sectionById = new Map(sectionRows.map((s) => [s.id, s]));

/** Every module on a page, in section order. */
function pageModules(nav) {
  return (nav.sections || []).flatMap((id) => sectionById.get(id)?.content || []);
}

/** Decode entities first: &#39; and &amp; otherwise split words and inflate 'missing'. */
const unentity = (s) => s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
  .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
const words = (s) => (unentity(s).replace(/['’]/g, '').toLowerCase().match(/[\p{L}\p{N}%★'’.-]+/gu) || [])
  .map((w) => w.replace(/^[.'’-]+|[.'’-]+$/g, '')).filter(Boolean);

function recall(src, out) {
  const have = new Map();
  for (const w of words(out)) have.set(w, (have.get(w) || 0) + 1);
  const missing = [];
  let hit = 0;
  for (const w of words(src)) {
    const n = have.get(w) || 0;
    if (n > 0) { hit++; have.set(w, n - 1); } else missing.push(w);
  }
  const total = hit + missing.length;
  return { pct: total ? Math.round((1000 * hit) / total) / 10 : 100, missing };
}

const byTitle = new Map(navigation.filter((n) => n.source !== 'system-page').map((n) => [n.page, n]));

let pass = 0, fail = 0;
const absent = [];
console.log(`bundle: ${navigation.length} pages, ${sectionRows.length} sections\n`);

for (const entry of catalogue()) {
  if (route(entry).action !== 'migrate') continue;
  const nav = byTitle.get(entry.title);
  if (!nav) { absent.push(entry.title); continue; }
  const out = pageModules(nav).map((m) => {
    try { return moduleText(m); } catch { return text(String(m.content || '')); }
  }).join(' ');
  const r = recall(contentText(sourceHtml(entry)), out);
  const ok = r.pct >= PASS;
  ok ? pass++ : fail++;
  const sample = r.missing.slice(0, 8).join(' ');
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${String(r.pct).padStart(5)}%  ${entry.title.slice(0, 44).padEnd(44)}`
    + (r.missing.length ? `  missing ${r.missing.length}: ${sample}` : ''));
}

console.log(`\n${pass} pass, ${fail} below ${PASS}%, ${absent.length} not in bundle`);
if (absent.length) absent.forEach((t) => console.log('  absent: ' + t));
process.exit(fail || absent.length ? 1 : 0);
