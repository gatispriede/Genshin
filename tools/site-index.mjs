/**
 * Indexes the public site the way a visitor or a search engine sees it: crawls
 * flux from the Genshin notes root, follows every internal link, and records
 * per page what it is, how long it is, what it shows, and how it links.
 * Then joins the local catalogue, so every page also says where its source is.
 *
 *     secrets run flux-node tools/site-index.mjs   # writes reference/data/site-index.json
 *
 * Two views per page, because flux renders body text in the browser, not in the
 * served HTML:
 *   seo.*      what a crawler without JavaScript gets (title, canonical, h1, words, links)
 *   content.*  what the page holds, from the local build (words, screens, images, links)
 * Read-only: public GETs plus one CMS page list (to resolve links). Open site-map.html
 * (served by the local dev server) to explore the result as a graph.
 */

import { writeFileSync } from 'node:fs';
import { catalogue, route } from './flux-catalogue.mjs';
import { buildPlans, finishModule } from './flux-build.mjs';
import { moduleText } from './flux-layout.mjs';
import { connect } from './flux-client.mjs';
import { linkTargets } from './flux-links.mjs';
import { publicPath, RETIRED } from './flux-tree.mjs';

const ORIGIN = 'https://flux.siaup.store';
const ROOT = '/genshin-notes';
const OUT = 'reference/data/site-index.json';
const SCREEN_WORDS = 250;          // ~one desktop screen of guide text (visual rule 1: max 3)
const UA = { 'User-Agent': 'genshin-notes-site-index/1.0 (owner audit)' };

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&nbsp;/g, ' ');
const strip = (html) => decode(html.replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const norm = (href) => href.split('#')[0].split('?')[0].replace(/\/$/, '') || '/';

/** One page's facts, from its served HTML. */
function read(url, status, html) {
  const head = html.slice(0, html.indexOf('<body') > 0 ? html.indexOf('<body') : 20000);
  const mainStart = html.indexOf('<main');
  const mainEnd = html.indexOf('</main>');
  const main = mainStart >= 0 ? html.slice(mainStart, mainEnd > mainStart ? mainEnd : undefined) : html;
  const text = strip(main);
  const words = text ? text.split(' ').length : 0;
  const links = [...main.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
    .map(([, href, inner]) => ({ href: decode(href), text: strip(inner).slice(0, 80) }));
  const internal = links.filter((l) => l.href.startsWith(ROOT));
  const external = links.filter((l) => /^https?:/.test(l.href) && !l.href.startsWith(ORIGIN));
  const imgs = [...main.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*>/gi)].map((m) => decode(m[1]));
  return {
    url, status,
    title: decode((head.match(/<title>([^<]*)<\/title>/) || [, ''])[1]),
    description: decode((head.match(/<meta name="description" content="([^"]*)"/) || [, ''])[1]),
    canonical: (head.match(/<link rel="canonical" href="([^"]*)"/) || [, ''])[1],
    h1: strip((main.match(/<h1\b[\s\S]*?<\/h1>/i) || [''])[0]),
    words, screens: Math.max(1, Math.round(words / SCREEN_WORDS)),
    images: imgs.length, imagesExternal: imgs.filter((s) => /^https?:/.test(s) && !s.startsWith(ORIGIN)).length,
    tables: (main.match(/<table\b/gi) || []).length,
    out: [...new Set(internal.map((l) => norm(l.href)))].filter((u) => u !== url),
    anchors: internal.map((l) => ({ to: norm(l.href), text: l.text })),
    external: [...new Set(external.map((l) => l.href))],
  };
}

/* ---------------------------------------------------------------- crawl --- */

const pages = new Map();
const depth = new Map([[ROOT, 0]]);
const queue = [ROOT];
while (queue.length) {
  const url = queue.shift();
  if (pages.has(url)) continue;
  const res = await fetch(ORIGIN + url, { headers: UA, redirect: 'manual' });
  const html = res.status === 200 ? await res.text() : '';
  const page = read(url, res.status, html);
  page.depth = depth.get(url);
  pages.set(url, page);
  for (const to of page.out) {
    if (!depth.has(to)) { depth.set(to, page.depth + 1); queue.push(to); }
  }
  process.stdout.write(`\r${pages.size} pages crawled`);
}
console.log();

/* ------------------------------------------------------------ inbound --- */

// Links on (nearly) every page are site chrome, not editorial links.
const seenOn = new Map();
for (const p of pages.values()) for (const to of p.out) seenOn.set(to, (seenOn.get(to) || 0) + 1);
const chrome = new Set([...seenOn].filter(([, n]) => n >= pages.size * 0.8).map(([u]) => u));
for (const p of pages.values()) {
  p.inbound = [...pages.values()].filter((q) => q.url !== p.url && q.out.includes(p.url)).map((q) => q.url);
  p.contextualInbound = [...pages.values()].filter((q) => q.url !== p.url && q.out.includes(p.url)
    && !chrome.has(p.url) && q.url !== parentOf(p.url)).length;
}
function parentOf(url) { return url.slice(0, url.lastIndexOf('/')) || '/'; }

/* -------------------------------------------------- content (local) view --- */

// What each published page holds, from the same build the publishers upload.
await connect('genshin-site-index');
const targets = await linkTargets();
const { plans } = buildPlans();
const content = new Map();
for (const p of plans) {
  const url = `${ROOT}/${publicPath(p.entry.href, p.entry.title)}`;
  const mods = p.sections.flatMap((s) => s.modules).map((m) => finishModule(m, url, targets, p.entry.href).module);
  const raw = mods.map((m) => m.content).join(' ');
  const words = mods.map(moduleText).join(' ').split(/\s+/).filter(Boolean).length;
  const hrefs = [...raw.matchAll(/href(?:=\\"|":")(\/genshin-notes[^"\#?]*)/g)].map((m) => norm(m[1]));
  content.set(url, {
    words, screens: Math.max(1, Math.round(words / SCREEN_WORDS)),
    images: (raw.match(/<img\s/gi) || []).length + mods.filter((m) => m.type === 'MAP_ANNOTATED').length,
    maps: mods.filter((m) => m.type === 'MAP_ANNOTATED').length,
    tables: (raw.match(/<table[\s>]/gi) || []).length,
    links: [...new Set(hrefs)].filter((u) => u !== url),
  });
}

/* --------------------------------------------------- local catalogue join --- */

const entries = catalogue().map((e) => {
  const r = route(e);
  const url = r.action === 'migrate' ? `${ROOT}/${publicPath(e.href, e.title)}` : null;
  return { source: e.href, title: e.title, section: e.section, kind: e.kind, action: r.action,
           reason: r.reason || (RETIRED[e.href] ? RETIRED[e.href] : ''), url };
});
const bySource = new Map(entries.filter((e) => e.url).map((e) => [e.url, e.source]));
for (const p of pages.values()) {
  p.source = bySource.get(p.url) || (p.url.includes('/builds/') ? 'generated: build (flux-push)'
    : p.url.includes('/teams') ? 'generated: team (flux-push)' : p.url === ROOT ? 'generated: home (flux-home)'
    : 'generated: section index');
}

for (const p of pages.values()) p.content = content.get(p.url) || null;
const contentIn = (url) => [...pages.values()].filter((q) => q.url !== url && (q.content?.links || q.out).includes(url)
  && q.url !== parentOf(url)).length;
for (const p of pages.values()) p.contentInbound = contentIn(p.url);
const list = [...pages.values()].sort((a, b) => a.url.localeCompare(b.url));
const summary = {
  crawledAt: new Date().toISOString(), origin: ORIGIN, root: ROOT,
  pages: list.length,
  broken: list.filter((p) => p.status !== 200).map((p) => `${p.status} ${p.url} (from ${p.inbound.join(', ')})`),
  orphans: list.filter((p) => p.url !== ROOT && p.contextualInbound === 0).map((p) => p.url),
  deadEnds: list.filter((p) => p.status === 200 && p.out.length === 0).map((p) => p.url),
  overThreeScreens: list.filter((p) => (p.content?.screens ?? p.screens) > 3)
    .map((p) => `${p.url} (${p.content?.screens ?? p.screens})`),
  noImages: list.filter((p) => p.status === 200 && !(p.content?.images ?? p.images)).map((p) => p.url),
  noContextLinksIn: list.filter((p) => p.url !== ROOT && p.contentInbound === 0).map((p) => p.url),
  noLinksOut: list.filter((p) => p.content && p.content.links.length === 0).map((p) => p.url),
  bodyNotInHtml: list.filter((p) => p.content && p.words < p.content.words * 0.5).length,
  deep: list.filter((p) => p.depth > 3).map((p) => `${p.url} (${p.depth} clicks)`),
  noDescription: list.filter((p) => !p.description).length,
  badCanonical: list.filter((p) => p.canonical && !p.canonical.startsWith(ORIGIN)).length,
  chromeLinks: [...chrome],
  unpublishedLocal: entries.filter((e) => !e.url).length,
};
writeFileSync(OUT, JSON.stringify({ summary, pages: list, catalogue: entries }, null, 1) + '\n');
const n = (k) => Array.isArray(summary[k]) ? summary[k].length : summary[k];
console.log(Object.fromEntries(Object.keys(summary).filter((k) => k !== 'chromeLinks').map((k) => [k, n(k)])));
process.exit(0);
