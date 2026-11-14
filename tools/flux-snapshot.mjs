/**
 * Reads every operator page off a CMS instance over MCP and writes them in
 * the shape tools/verify-bundle.mjs reads — so flux can be verified page by
 * page without exporting a bundle (which lands on flux's own disk, out of
 * reach). Optionally deletes named stale pages first.
 *
 *     secrets run flux-node tools/flux-snapshot.mjs [--delete "A" "B" ...]
 *     node tools/verify-bundle.mjs tools/.bundles/flux-live.json
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { connect, call, TARGET } from './flux-client.mjs';

const OUT = 'tools/.bundles/flux-live.json';
const i = process.argv.indexOf('--delete');
const doomed = i === -1 ? [] : process.argv.slice(i + 1).filter((a) => !a.startsWith('--'));

await connect('genshin-snapshot');

for (const name of doomed) {
  const rows = (await call('page.list', {})).filter((p) => p.page === name && p.source !== 'system-page');
  for (const r of rows) await call('page.delete', { id: r.id });
  console.log(`deleted ${rows.length} x "${name}"`);
}

const pages = (await call('page.list', {})).filter((p) => p.source !== 'system-page');
const navigation = [];
const sections = [];
for (const p of pages) {
  const got = await call('page.get', { page: p.page });
  navigation.push({ ...got.navigation, sections: (got.sections || []).map((s) => s.id) });
  sections.push(...(got.sections || []));
}

mkdirSync('tools/.bundles', { recursive: true });
writeFileSync(OUT, JSON.stringify({ source: TARGET, navigation, sections }));
console.log(`snapshot of ${TARGET}: ${navigation.length} pages, ${sections.length} sections -> ${OUT}`);
process.exit(0);
