/**
 * Migrates every catalogued page (except build write-ups, which attach to the
 * character pages in flux-generated.mjs) to the CMS, in batches.
 *
 *     node tools/flux-migrate-html.mjs                       # plan, all pages
 *     node tools/flux-migrate-html.mjs --section Research    # plan, one batch
 *     node tools/flux-migrate-html.mjs --only codes.html
 *     ... --local --apply                                    # write to local CMS
 *     secrets run flux-migrate-html --section Maps --apply   # write to flux
 *
 * Run tools/render-pages.mjs first so script-generated content is included.
 * Routing and sources: flux-catalogue.mjs. Layout: flux-layout.mjs.
 */

import { connect, call, findPage, TARGET } from './flux-client.mjs';
import { usesEngine } from './flux-catalogue.mjs';
import { ensurePage, reusePage, pagePaths, writeSectionIndex, slugOf } from './flux-pages.mjs';
import { linkTargets } from './flux-links.mjs';
import { GENERATED, MIN_COVERAGE, buildPlans, finishModule, sectionLinksModule } from './flux-build.mjs';

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i === -1 ? null : process.argv[i + 1];
};
const APPLY = process.argv.includes('--apply');
const SECTION = arg('--section');
const ONLY = arg('--only');

const { all, plans, builds, skipped } = buildPlans({ only: ONLY, section: SECTION });

/* -------------------------------------------------------------- report --- */

let lastParent = null;
for (const p of plans.sort((a, b) => a.parent.localeCompare(b.parent))) {
  if (p.parent !== lastParent) { console.log(`\n${p.parent}`); lastParent = p.parent; }
  const flags = [
    p.coverage < MIN_COVERAGE ? 'CONTENT LOST' : '',
    p.maps ? `${p.maps} map placeholder(s)` : '',
    usesEngine(p.entry) ? 'engine placeholder' : '',
    p.entry.href.endsWith('.html') && !p.rendered ? 'NOT RENDERED' : '',
  ].filter(Boolean).join(', ');
  console.log(`  ${p.entry.title.slice(0, 40).padEnd(40)} ${String(p.sections.length).padStart(3)} sect`
    + `  ${String(p.coverage).padStart(3)}%${flags ? '  ' + flags : ''}`);
}
if (builds.length) console.log(`\nBuilds (${builds.length}) — attached to character pages by flux-generated.mjs`);
if (skipped.length) {
  console.log(`\nSkipped (${skipped.length}):`);
  skipped.forEach((s) => console.log('  ' + s));
}
console.log(`\n${plans.length} pages to migrate`
  + `${SECTION ? ` in section ${SECTION}` : ''}, of ${all.length} catalogued`);

const lost = plans.filter((p) => p.coverage < MIN_COVERAGE);
if (lost.length) {
  console.error(`refusing to write: ${lost.map((p) => p.entry.href).join(', ')} below ${MIN_COVERAGE}%`);
  process.exit(1);
}
if (!APPLY) { console.log('dry run — pass --apply to write'); process.exit(0); }

/* --------------------------------------------------------------- write --- */

await connect('genshin-migrate');
console.log(`writing to ${TARGET}`);

const root = await findPage('Genshin notes');
if (!root) { console.error('no "Genshin notes" root — run flux-push first'); process.exit(1); }

/** "Reputation quests" or "A/B" -> that page, created empty if missing; "" is the root. */
const parents = {};
async function parentRow(path) {
  if (!parents[path]) {
    let row = root;
    for (const name of path.split('/').filter(Boolean)) row = await ensurePage(name, row.id);
    parents[path] = row;
  }
  return parents[path];
}

// 1. Every page exists before any content is written, so links between pages
//    of this run resolve. Pages are reused, not recreated: recreating would
//    drop the pages nested under them.
// The URL follows the title, so a renamed page does not keep its old address
// (the old one is redirected by tools/flux-redirects.mjs).
for (const p of plans) {
  p.row = await reusePage(p.entry.title, (await parentRow(p.parent)).id);
  const slug = slugOf(p.entry.title);
  if (p.row.slug !== slug) await call('page.update', { id: p.row.id, slug });
}

// A full run owns the tree: anything under the root that is neither a page of
// this run, a parent in flux-tree.mjs, nor the generated Builds/Teams
// is a leftover (renamed, merged or retired) and goes. Its URL is redirected by
// tools/flux-redirects.mjs. Deepest first, so no page is deleted under a parent
// that is already gone.
if (!ONLY && !SECTION) {
  const { pages: now } = await pagePaths();
  const kids = (id) => now.filter((x) => x.parent === id);
  const keep = new Set([root.id, ...plans.map((p) => p.row.id), ...Object.values(parents).map((r) => r.id)]);
  const keepTree = (id) => { keep.add(id); kids(id).forEach((k) => keepTree(k.id)); };
  now.filter((x) => x.parent === root.id && GENERATED.has(x.page)).forEach((x) => keepTree(x.id));
  const doomed = [];
  const walk = (id, depth) => kids(id).forEach((k) => { walk(k.id, depth + 1); if (!keep.has(k.id)) doomed.push(k); });
  walk(root.id, 0);
  for (const d of doomed) await call('page.delete', { id: d.id });
  if (doomed.length) console.log(`  removed ${doomed.length} leftover pages: ${doomed.map((d) => d.page).join(', ')}`);
}

// 2. Content, with local file links pointed at their flux pages.
const targets = await linkTargets();
const { pages, path } = await pagePaths();   // fresh: parents changed in step 1
const byId = new Map(pages.map((x) => [x.id, x]));
const missing = new Set();
for (const p of plans) {
  const here = path(byId.get(p.row.id));
  for (const s of p.sections) {
    const items = s.modules.map((m) => {
      const linked = finishModule(m, here, targets, p.entry.href);
      linked.missing.forEach((x) => missing.add(x));
      return { module: linked.module };
    });
    const { sectionId } = await call('section.create', { pageId: p.row.id, type: s.columns });
    await call('module.add', { items: items.map(({ module }) => ({ sectionId, module })) });
  }
  console.log(`  ${here}`);
}
if (missing.size) console.log(`  links left local (no flux page): ${[...missing].join(', ')}`);

// 3. Section pages that are only containers get a card per child.
const titles = new Set(all.map((e) => e.title));
for (const [name, row] of Object.entries(parents)) {
  if (!name || titles.has(row.page)) continue;   // the root, or a real page with its own content
  const n = await writeSectionIndex(row, all, 'Genshin notes');
  console.log(`  index ${name}: ${n} pages`);
}

// 4. No dead ends: every page ends with its parent and its siblings.
{
  const { pages: now, path: urlOf } = await pagePaths();
  for (const p of plans) {
    const me = now.find((x) => x.id === p.row.id);
    const module = sectionLinksModule(me, now, urlOf, root.id);
    if (!module) continue;
    const { sectionId } = await call('section.create', { pageId: p.row.id, type: 1 });
    await call('module.add', { items: [{ sectionId, module }] });
  }
  console.log(`  section links on ${plans.length} pages`);
}
