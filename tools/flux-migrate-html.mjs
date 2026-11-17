/**
 * Migrates every catalogued page (except build write-ups, which attach to the
 * character pages in flux-push.mjs) to the CMS, in batches.
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
import { pageSections, moduleText, enginePlaceholder } from './flux-layout.mjs';
import { contentText } from './html-blocks.mjs';
import { catalogue, route, sourceHtml, usesEngine, isRendered, PARENT_FOR_SECTION } from './flux-catalogue.mjs';
import { ensurePage, reusePage, pagePaths, writeSectionIndex } from './flux-pages.mjs';
import { linkTargets, withLinks } from './flux-links.mjs';

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i === -1 ? null : process.argv[i + 1];
};
const APPLY = process.argv.includes('--apply');
const SECTION = arg('--section');
const ONLY = arg('--only');

/**
 * Same-page query links (href="?map-…=…", e.g. a route map's "show only this
 * quest") lose their href on flux: the sanitizer keeps only paths and URLs.
 * Prefix the page's own path, known once the page exists.
 */
function withPagePath(module, path) {
  let content = module.content;
  // Same page: "?query" (map filters) and "#anchor" (a map picture's "Full entry" link).
  for (const lead of ['?', '#']) content = content.split(`href=\\"${lead}`).join(`href=\\"${path}${lead}`);
  return content === module.content ? module : { ...module, content };
}

/** Below this, blocks are being dropped — the 4% lesson. Refuse to write. */
const MIN_COVERAGE = 95;

function plan(entry, parent) {
  const html = sourceHtml(entry);
  const sections = pageSections(html, entry.title);
  if (usesEngine(entry)) {
    // After the title heading, before the carried-over notes.
    sections.splice(1, 0, { columns: 1, modules: [enginePlaceholder()] });
  }
  const modules = sections.flatMap((s) => s.modules);
  const src = contentText(html).length;
  const out = modules.map(moduleText).join(' ').length;
  return {
    entry, parent, sections, modules,
    coverage: src ? Math.round((100 * out) / src) : 100,
    maps: modules.filter((m) => m.content.includes('MAP_ANNOTATED_PLACEHOLDER')).length,
    rendered: isRendered(entry),
  };
}

/* ------------------------------------------------------------- routing --- */

const all = catalogue();
const skipped = [];
const builds = [];
const plans = [];

for (const entry of all) {
  if (ONLY && entry.href !== ONLY) continue;
  if (SECTION && entry.section !== SECTION) continue;
  const r = route(entry);
  if (r.action === 'skip') skipped.push(`${entry.href} — ${r.reason}`);
  else if (r.action === 'builds') builds.push(entry.href);
  else plans.push(plan(entry, r.parent));
}

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
if (builds.length) console.log(`\nBuilds (${builds.length}) — attached to character pages by flux-push.mjs`);
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

/** "Guides/Reputation quests — all regions" -> that page, created empty if missing. */
const parents = {};
async function parentRow(path) {
  if (!parents[path]) {
    let row = root;
    for (const name of path.split('/')) row = await ensurePage(name, row.id);
    parents[path] = row;
  }
  return parents[path];
}

// 1. Every page exists before any content is written, so links between pages
//    of this run resolve. Pages are reused, not recreated: recreating would
//    drop the pages nested under them.
for (const p of plans) {
  const parent = await parentRow(p.parent);
  // A whole-section batch owns that section: clear children that are no
  // longer in the catalogue (renamed or retired), so they don't linger as
  // orphans beside their replacements. Never on --only, never system pages.
  if (!ONLY && !parent.cleared) {
    parent.cleared = true;
    const keep = new Set(plans.filter((x) => x.parent === p.parent).map((x) => x.entry.title));
    const nested = new Set(Object.values(PARENT_FOR_SECTION).flatMap((v) => v.split('/')));
    const stale = (await call('page.list', {})).filter((x) => x.parent === parent.id
      && x.source !== 'system-page' && !keep.has(x.page) && !nested.has(x.page));
    for (const s of stale) await call('page.delete', { id: s.id });
    if (stale.length) console.log(`  cleared ${stale.length} stale under ${p.parent}: ${stale.map((s) => s.page).join(', ')}`);
  }
  p.row = await reusePage(p.entry.title, parent.id);
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
      const linked = withLinks(withPagePath(m, here), targets, p.entry.href);
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
  if (titles.has(row.page)) continue;   // a real page with its own content
  const n = await writeSectionIndex(row, all, 'Genshin notes');
  console.log(`  index ${name}: ${n} pages`);
}
