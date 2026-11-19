/**
 * Keeps shared links working when pages move: remember every URL a page has
 * had, and point each one that no longer exists at where that page is now.
 *
 *     secrets run flux-node tools/flux-redirects.mjs snapshot   # before a restructure
 *     secrets run flux-node tools/flux-redirects.mjs plan       # what would change
 *     secrets run flux-node tools/flux-redirects.mjs apply      # create / repoint redirects
 *
 * The snapshot (reference/data/flux-paths.json) is a list of [title, url] pairs
 * that only grows: a page moved twice keeps both old URLs. A page is matched by
 * title, through RENAMED when it was merged into another; a page that is gone
 * falls back to its nearest surviving section, else the root.
 *
 * A redirect that already exists is repointed when its target no longer exists
 * (a page that moved again), so chains never end in a 404.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { connect, call } from './flux-client.mjs';
import { pagePaths } from './flux-pages.mjs';
import { RENAMED } from './flux-tree.mjs';

const SNAPSHOT = 'reference/data/flux-paths.json';
const ROOT = '/genshin-notes';
const mode = process.argv[2];

await connect('genshin-redirects');
const { pages, path } = await pagePaths();
const nowPairs = pages.map((p) => [p.page, path(p)]).filter(([, u]) => u.startsWith(ROOT));
const now = Object.fromEntries(nowPairs);

/** Older snapshots were a {title: url} object; both shapes read as pairs. */
const readSnapshot = () => {
  if (!existsSync(SNAPSHOT)) return [];
  const s = JSON.parse(readFileSync(SNAPSHOT, 'utf8'));
  return Array.isArray(s) ? s : Object.entries(s);
};

if (mode === 'snapshot') {
  const pairs = readSnapshot();
  const seen = new Set(pairs.map(([t, u]) => t + '\n' + u));
  const added = nowPairs.filter(([t, u]) => !seen.has(t + '\n' + u));
  writeFileSync(SNAPSHOT, JSON.stringify([...pairs, ...added], null, 1) + '\n');
  console.log(`${added.length} new paths added to ${SNAPSHOT} (${pairs.length + added.length} total)`);
  process.exit(0);
}

const before = readSnapshot();
if (!before.length) { console.error(`no ${SNAPSHOT}; run snapshot first`); process.exit(1); }
const live = new Set(Object.values(now));
const existing = new Map((await call('redirect.list', {})).redirects.map((r) => [r.from, r]));

/** Nearest surviving ancestor of a vanished URL. */
const fallback = (url) => {
  for (let u = url.slice(0, url.lastIndexOf('/')); u.length >= ROOT.length; u = u.slice(0, u.lastIndexOf('/'))) {
    if (live.has(u)) return u;
  }
  return ROOT;
};

/** Follow RENAMED until a live title (a merge can itself be merged later). */
const target = (title, from) => {
  for (let t = title, hops = 0; t && hops < 5; t = RENAMED[t], hops++) {
    if (RENAMED[t] && now[RENAMED[t]]) return now[RENAMED[t]];
    if (!RENAMED[t] && now[t]) return now[t];
  }
  return fallback(from);
};

const create = [];
const repoint = [];
for (const [title, from] of before) {
  if (live.has(from)) continue;
  const to = target(title, from);
  if (to === from) continue;
  const old = existing.get(from);
  if (!old) create.push({ from, to, title, gone: !now[title] });
  else if (!live.has(old.to) && old.to !== to) repoint.push({ id: old.id, version: old.version, from, to, title, was: old.to });
}
// One URL can appear under two titles; the first decision wins.
const uniq = (list) => [...new Map(list.map((m) => [m.from, m])).values()];

for (const m of uniq(create)) console.log(`${m.gone ? 'gone ' : 'moved'} ${m.from} -> ${m.to}`);
for (const m of uniq(repoint)) console.log(`fix   ${m.from} -> ${m.to}  (was ${m.was})`);
console.log(`${uniq(create).length} to create, ${uniq(repoint).length} to repoint${mode === 'apply' ? '' : ' (plan)'}`);
if (mode !== 'apply') process.exit(0);

for (const m of uniq(create)) {
  await call('redirect.create', { from: m.from, to: m.to, code: 301,
    note: `${m.gone ? 'Page retired' : 'Page moved'}: ${m.title} (site restructure)` });
}
for (const m of uniq(repoint)) await call('redirect.update', { id: m.id, to: m.to, version: m.version });
console.log('done');
