/**
 * Prints the Genshin page tree on a CMS instance, with counts per section,
 * and which catalogue pages are missing from it.
 *
 *     node tools/flux-tree.mjs --local      # local instance
 *     secrets run flux-tree                 # flux
 */

import { connect, call, TARGET } from './flux-client.mjs';
import { catalogue, route } from './flux-catalogue.mjs';

await connect('genshin-tree');
const pages = (await call('page.list', {})).filter((p) => p.source !== 'system-page');
const byId = new Map(pages.map((p) => [p.id, p]));
const root = pages.find((p) => p.page === 'Genshin notes');

console.log(`${TARGET}\n`);
if (!root) { console.log('no "Genshin notes" root'); process.exit(0); }

const kids = (id) => pages.filter((p) => p.parent === id);
const inTree = new Set([root.page]);
for (const section of kids(root.id)) {
  const leaves = kids(section.id);
  inTree.add(section.page);
  leaves.forEach((l) => inTree.add(l.page));
  console.log(`${section.page.padEnd(12)} ${String(leaves.length).padStart(3)} pages`);
}

const expected = catalogue().filter((e) => route(e).action === 'migrate');
const missing = expected.filter((e) => !inTree.has(e.title));
console.log(`\ncatalogue pages present: ${expected.length - missing.length}/${expected.length}`);
const bySection = {};
missing.forEach((e) => { (bySection[e.section] ||= []).push(e.title); });
for (const [s, titles] of Object.entries(bySection)) console.log(`  missing ${s}: ${titles.length}`);

const strays = pages.filter((p) => !byId.has(p.parent) && p.page !== 'Genshin notes' && p.parent);
if (strays.length) console.log(`\n${strays.length} page(s) whose parent no longer exists`);
process.exit(0);
