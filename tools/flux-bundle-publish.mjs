/**
 * Publishes to flux as one scoped bundle: build every page locally, export the
 * live versions, diff, and import only the pages that changed, in one call.
 *
 *     secrets run flux-node tools/flux-bundle-publish.mjs                 # diff + bundle.plan, writes nothing
 *     secrets run flux-node tools/flux-bundle-publish.mjs --only theater.html
 *     secrets run flux-node tools/flux-bundle-publish.mjs --apply         # import the changed pages
 *     secrets run flux-node tools/flux-bundle-publish.mjs --apply --prune # and delete pages the tree dropped
 *     secrets run flux-node tools/flux-bundle-publish.mjs --generated     # only the data-built pages
 *
 * Two kinds of page go out in the same diff and import:
 *   - catalogue pages, built from local HTML/markdown (flux-build.mjs)
 *   - generated pages: homepage, Builds and a page per character, Teams and a
 *     page per team, built from src/data (flux-generated.mjs). --only and
 *     --section leave these out; --generated publishes only these.
 * Both pass through finishModule: the account UID and in-game name are redacted.
 *
 * Why: the section-by-section migrator empties and rebuilds every page (hundreds
 * of calls, rate limits, pages briefly blank). A merge import upserts by id in
 * one call and the CMS backs the site up first.
 *
 * What the CMS's merge import does, and what this script does about it
 * (reference/site-restructure.md, "Publishing"):
 *   - deletes nothing          -> sections a page no longer uses are deleted after import
 *   - version check (since ~20 Nov): each doc carries its exported version and the import
 *                                 is refused on a mismatch; the script also re-exports first
 *   - $set merges fields       -> section docs are sent whole
 *   - no revalidation          -> site.revalidate after import
 *
 * Pages missing on flux are created first (page.create), since content can only
 * be diffed against a page that exists. Pages on flux that the tree no longer
 * places (leaf pages only) are reported, and deleted with --prune --apply.
 *
 * Every bundle and plan is saved under tools/.bundles/ (gitignored).
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { connect, call, findPage } from './flux-client.mjs';
import { ensurePage, pagePaths } from './flux-pages.mjs';
import { linkTargets } from './flux-links.mjs';
import { generatedPages } from './flux-generated.mjs';
import { MIN_COVERAGE, buildPlans, finishModule, sectionLinksModule, sectionIndexModules } from './flux-build.mjs';

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i === -1 ? null : process.argv[i + 1];
};
const APPLY = process.argv.includes('--apply');
const PRUNE = process.argv.includes('--prune');
const ONLY = arg('--only');
const SECTION = arg('--section');
const GENERATED_ONLY = process.argv.includes('--generated');
const WITH_GENERATED = !ONLY && !SECTION;
const CATALOGUE = !GENERATED_ONLY;
const OUT = 'tools/.bundles';
const EDITOR = 'bundle:genshin-publish';
const EXPORT_CHUNK = 8;

/** Fields module.add fills in; a bundle has to carry them itself. */
const MODULE_DEFAULTS = { action: 'none', actionStyle: 'default', actionType: 'TEXT', actionContent: '{}', animation: 'none' };

/* ---------------------------------------------------------------- build --- */

await connect('genshin-bundle-publish');
// Done tracking needs the CMS's CHECKLIST module; until flux lists it, tracked
// pages publish exactly as before (cards as rich text, no trackDone).
const types = (await call('module.listTypes', { audience: 'client' })).itemTypes || [];
const checklist = types.some((t) => t.value === 'CHECKLIST');
console.log(`done tracking: ${checklist ? 'on (CHECKLIST available)' : 'off (no CHECKLIST module on flux yet)'}`);
const { all, plans } = CATALOGUE ? buildPlans({ only: ONLY, section: SECTION, checklist }) : { all: [], plans: [] };
const generated = WITH_GENERATED ? await generatedPages() : [];
const lost = plans.filter((p) => p.coverage < MIN_COVERAGE);
if (lost.length) {
  console.error(`refusing: ${lost.map((p) => p.entry.href).join(', ')} below ${MIN_COVERAGE}% content`);
  process.exit(1);
}

const root = await findPage('Genshin notes');
if (!root) { console.error('no "Genshin notes" root on flux'); process.exit(1); }

/** The page at parentPath/title, walking the tree from the root; null if any step is missing. parentPath null = the root. */
function find(pages, parentPath, title) {
  if (parentPath === null) return pages.find((x) => x.id === root.id) || root;
  let row = root;
  for (const name of [...parentPath.split('/').filter(Boolean), title]) {
    row = pages.find((x) => x.parent === row.id && x.page === name);
    if (!row) return null;
  }
  return row;
}

/** Create whatever is missing along parentPath/title. */
async function create(parentPath, title) {
  let row = root;
  for (const name of [...parentPath.split('/').filter(Boolean), title]) row = await ensurePage(name, row.id);
}

// Pages that do not exist yet: list them (dry run) or create them (--apply).
const before = (await pagePaths()).pages;
const placed = [...plans.map((p) => ({ parent: p.parent, title: p.entry.title })), ...generated];
const absent = placed.filter((p) => !find(before, p.parent, p.title));
if (absent.length) {
  console.log(`${absent.length} page(s) not on flux yet: ${absent.map((p) => `${p.parent}/${p.title}`).join(', ')}`);
  if (APPLY) for (const p of absent) await create(p.parent, p.title);
  else console.log('  (created on --apply; their content is diffed on the next run)');
}

const { pages, path } = await pagePaths();
const byId = new Map(pages.map((x) => [x.id, x]));
const targets = await linkTargets();

/** page id -> {row, sections: [{type, modules}]}: what flux should hold. */
const want = new Map();
for (const p of plans) {
  const row = find(pages, p.parent, p.entry.title);
  if (!row) continue;                            // created on --apply, absent on a dry run
  const here = path(row);
  const sections = p.sections.map((s) => ({
    type: s.columns, modules: s.modules.map((m) => finishModule(m, here, targets, p.entry.href).module),
  }));
  const links = sectionLinksModule(row, pages, path, root.id);
  if (links) sections.push({ type: 1, modules: [links] });
  want.set(row.id, { row, sections });
}

// Generated pages: links between them use real paths (undefined while a page is absent).
const urlOf = (parent, title) => { const row = find(pages, parent, title); return row ? path(row) : undefined; };
for (const g of generated) {
  const row = find(pages, g.parent, g.title);
  if (!row) continue;
  const here = path(row);
  want.set(row.id, { row, sections: g.sections(urlOf).map((s) => ({
    type: s.type, modules: s.modules.map((m) => finishModule(m, here, targets, g.from).module),
  })) });
}

// Container pages (a tree parent that is not itself a catalogue page) get a card per child.
if (!ONLY && CATALOGUE) {
  const titles = new Set(all.map((e) => e.title));
  const parentNames = new Set(plans.flatMap((p) => p.parent.split('/').filter(Boolean)));
  for (const name of parentNames) {
    if (titles.has(name)) continue;
    const row = pages.find((x) => x.page === name && x.parent === root.id);
    if (!row) continue;
    const kids = pages.filter((x) => x.parent === row.id);
    want.set(row.id, { row, sections: [{ type: 1, modules: sectionIndexModules(row, kids, all, path) }] });
  }
}

/* ----------------------------------------------------------------- diff --- */

/**
 * Export pages inline. The CMS caps an inline bundle at 256 KB, so a batch that
 * is too large is split in half; a single page over the cap cannot be exported
 * inline at all and is returned in `tooLarge` (publish it with the migrator).
 */
async function exportPages(ids) {
  const out = { skeleton: null, nav: [], sections: new Map(), tooLarge: [] };
  const take = async (batch) => {
    let r;
    try {
      r = await call('bundle.exportScoped', { scope: { pages: batch } });
    } catch (e) {
      if (!/bundle_too_large/.test(e.message)) throw e;
      if (batch.length === 1) { out.tooLarge.push(batch[0]); return; }
      const half = Math.ceil(batch.length / 2);
      await take(batch.slice(0, half));
      await take(batch.slice(half));
      return;
    }
    if (r.scope?.unmatched?.length) throw new Error(`export did not find: ${r.scope.unmatched.join(', ')}`);
    out.skeleton ||= r.bundle;
    out.nav.push(...r.bundle.site.navigation);
    for (const sec of r.bundle.site.sections) out.sections.set(sec.id, sec);
  };
  for (let i = 0; i < ids.length; i += EXPORT_CHUNK) await take(ids.slice(i, i + EXPORT_CHUNK));
  return out;
}

const norm = (sections) => JSON.stringify(sections.map((s) => ({
  type: s.type, modules: s.modules.map((m) => ({ type: m.type, style: m.style, content: m.content })),
})));
const liveOf = (navDoc, secs) => navDoc.sections.map((id) => secs.get(id)).filter(Boolean)
  .map((s) => ({ type: s.type, modules: s.content || [] }));

const baseline = await exportPages([...want.keys()]);
const changed = [];
for (const navDoc of baseline.nav) {
  const w = want.get(navDoc.id);
  if (w && norm(liveOf(navDoc, baseline.sections)) !== norm(w.sections)) changed.push(navDoc);
}
console.log(`${want.size - baseline.tooLarge.length} pages compared, ${changed.length} differ from flux`);
if (baseline.tooLarge.length) {
  console.log(`over the 256 KB inline limit, not handled here (use the migrator): `
    + baseline.tooLarge.map((id) => path(byId.get(id))).join(', '));
}
for (const n of changed) console.log(`  ${path(byId.get(n.id))}`);

const tracked = new Set([...want.keys(), root.id]);
const strays = pages.filter((x) => path(x).startsWith(path(root) + '/') && !tracked.has(x.id)
  && !pages.some((c) => c.parent === x.id));
if (WITH_GENERATED && CATALOGUE && strays.length) {
  // Retired or merged pages. Their URLs get redirects from tools/flux-redirects.mjs.
  if (PRUNE && APPLY) {
    for (const x of strays) await call('page.delete', { id: x.id });
    console.log(`deleted ${strays.length} pages the tree no longer places: ${strays.map((x) => x.page).join(', ')}`);
  } else {
    console.log(`not in the tree (--prune --apply deletes them): ${strays.map((x) => path(x)).join(', ')}`);
  }
}
if (!changed.length) process.exit(0);

/* --------------------------------------------------------------- bundle --- */

const INLINE_LIMIT = 240_000;   // the CMS's cap is 262,144 bytes; leave room for the wrapper
const now = new Date().toISOString();

/** One changed page -> its navigation doc, section docs, and the section ids it drops. */
function pageDocs(navDoc) {
  const w = want.get(navDoc.id);
  const ids = w.sections.map((_, i) => navDoc.sections[i] || randomUUID());
  const sections = w.sections.map((s, i) => ({
    id: ids[i], type: s.type, page: navDoc.page,
    content: s.modules.map((m) => ({ ...MODULE_DEFAULTS, ...m })),
    // The CMS checks versions on import: an existing doc carries the version it was
    // exported with (the CMS bumps it); a new doc carries none.
    ...(baseline.sections.has(ids[i]) ? { version: baseline.sections.get(ids[i]).version } : {}),
    editedAt: now, editedBy: EDITOR,
  }));
  return {
    nav: { ...navDoc, sections: ids, editedAt: now, editedBy: EDITOR },
    sections, orphans: navDoc.sections.slice(w.sections.length),
  };
}

/** Changed pages packed into bundles that each fit the inline limit. */
const groups = [];
for (const navDoc of changed) {
  const docs = pageDocs(navDoc);
  const size = JSON.stringify(docs).length;
  const last = groups[groups.length - 1];
  if (last && last.size + size < INLINE_LIMIT) { last.pages.push(docs); last.size += size; }
  else groups.push({ pages: [docs], size });
}
const toBundle = (g) => ({
  ...baseline.skeleton,
  manifest: { ...baseline.skeleton.manifest, exportedAt: now,
    scope: { pages: g.pages.map((d) => d.nav.id), include: [], unmatched: [] } },
  site: { ...baseline.skeleton.site, navigation: g.pages.map((d) => d.nav),
          sections: g.pages.flatMap((d) => d.sections), languages: [], images: [] },
});

mkdirSync(OUT, { recursive: true });
const stamp = now.replace(/[:.]/g, '-');
for (const [i, g] of groups.entries()) {
  g.bundle = toBundle(g);
  writeFileSync(`${OUT}/publish-${stamp}-${i + 1}.json`, JSON.stringify(g.bundle, null, 1));
  const planned = await call('bundle.plan', { bundle: g.bundle, mode: 'merge' });
  const c = planned.collections;
  console.log(`bundle ${i + 1}/${groups.length} (${Math.round(g.size / 1024)} KB): pages ${c.Navigation.replaced} replaced`
    + ` / ${c.Navigation.added} added; sections ${c.Sections.replaced} replaced / ${c.Sections.added} added`);
  if (planned.errors?.length) { console.error('plan errors:', planned.errors); process.exit(1); }
}
if (!APPLY) { console.log(`dry run; bundles saved in ${OUT}/publish-${stamp}-*.json; pass --apply to import`); process.exit(0); }

/* --------------------------------------------------------------- import --- */

// The CMS does no version check: refuse if anyone edited these pages since the diff.
const again = await exportPages(changed.map((n) => n.id));
const fingerprint = (n, secs) => JSON.stringify([n.version, n.editedAt, n.sections,
  n.sections.map((id) => [secs.get(id)?.version, secs.get(id)?.editedAt])]);
const moved = again.nav.filter((n) => fingerprint(n, again.sections)
  !== fingerprint(baseline.nav.find((b) => b.id === n.id), baseline.sections));
if (moved.length) {
  console.error(`edited on flux since the diff, nothing written: ${moved.map((n) => n.page).join(', ')}`);
  process.exit(1);
}

for (const [i, g] of groups.entries()) {
  const result = await call('bundle.importScoped', { bundle: g.bundle, mode: 'merge' });
  console.log(`imported bundle ${i + 1}/${groups.length}; backup ${JSON.stringify(result.backup ?? result.backupPath ?? result).slice(0, 160)}`);
  const orphans = g.pages.flatMap((d) => d.orphans);
  for (const id of orphans) await call('section.delete', { id });
  if (orphans.length) console.log(`  deleted ${orphans.length} sections no longer used`);
}
await call('site.revalidate', { scope: 'all' });
console.log('revalidated');
