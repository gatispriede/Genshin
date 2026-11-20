/**
 * What every published page should contain, built locally and touching no CMS.
 * Shared by the two publishers, so they cannot drift apart:
 *   flux-migrate-html.mjs   - writes section by section (the old path)
 *   flux-bundle-publish.mjs - diffs against flux and imports one scoped bundle
 *
 * A page's final content is its own sections (from the HTML), with links
 * resolved and private data redacted, plus an "In this section" list.
 * Container pages in the tree (Combat, TCG, ...) get a card per child.
 */

import { pageSections, moduleText, enginePlaceholder, withoutEditorNotes } from './flux-layout.mjs';
import { contentText } from './html-blocks.mjs';
import { catalogue, route, sourceHtml, usesEngine, isRendered } from './flux-catalogue.mjs';
import { withLinks } from './flux-links.mjs';

const json = (o) => JSON.stringify(o);
const heading = (eyebrow, h, subtitle) => ({ type: 'SECTION_HEADING', style: 'editorial',
  content: json({ eyebrow, heading: h, subtitle, align: 'left' }) });

/** Top-level pages flux-push.mjs generates; the HTML publishers leave them alone. */
export const GENERATED = new Set(['Builds', 'Teams']);

/** Below this, blocks are being dropped (a page once lost 96% this way). Refuse to publish. */
export const MIN_COVERAGE = 95;

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

/**
 * The owner's account identity stays off the public site. Local notes keep it
 * (the tools read it); what flux receives says "<UID>" instead.
 */
const PRIVATE = [[/790160140/g, '<UID>'], [/\bFunisimo\b/g, 'the Traveler']];
function redact(module) {
  let content = module.content;
  for (const [re, to] of PRIVATE) content = content.replace(re, to);
  return content === module.content ? module : { ...module, content };
}

/** One catalogue entry -> its sections, before links are resolved. */
function plan(entry, parent) {
  const html = sourceHtml(entry);
  const sections = pageSections(html, entry.title);
  if (usesEngine(entry)) {
    // After the title heading, before the carried-over notes.
    sections.splice(1, 0, { columns: 1, modules: [enginePlaceholder()] });
  }
  const modules = sections.flatMap((s) => s.modules);
  const src = contentText(withoutEditorNotes(html)).length; // editor notes are dropped on purpose
  const out = modules.map(moduleText).join(' ').length;
  return {
    entry, parent, sections, modules,
    coverage: src ? Math.round((100 * out) / src) : 100,
    maps: modules.filter((m) => m.content.includes('MAP_ANNOTATED_PLACEHOLDER')).length,
    rendered: isRendered(entry),
  };
}

/**
 * Every page to publish, filtered like the migrator's flags.
 * @returns {{all, plans, builds: string[], skipped: string[]}}
 */
export function buildPlans({ only = null, section = null } = {}) {
  const all = catalogue();
  const skipped = [];
  const builds = [];
  const plans = [];
  for (const entry of all) {
    if (only && entry.href !== only) continue;
    if (section && entry.section !== section) continue;
    const r = route(entry);
    if (r.action === 'skip') skipped.push(`${entry.href} — ${r.reason}`);
    else if (r.action === 'builds') builds.push(entry.href);
    else plans.push(plan(entry, r.parent));
  }
  return { all, plans, builds, skipped };
}

/** A module as published: redacted, same-page links absolute, file links to flux URLs. */
export function finishModule(module, pagePath, targets, fromHref) {
  return withLinks(withPagePath(redact(module), pagePath), targets, fromHref);
}

/**
 * The "In this section" list: the parent (unless it is the root) and the
 * siblings, so no page is a dead end. null when there is nothing to list.
 */
export function sectionLinksModule(me, pages, urlOf, rootId) {
  const up = pages.find((x) => x.id === me.parent);
  const sibs = pages.filter((x) => x.parent === me.parent && x.id !== me.id && !GENERATED.has(x.page));
  const items = [
    ...(up && up.id !== rootId ? [{ label: `↑ ${up.page}`, href: urlOf(up) }] : []),
    ...sibs.map((x) => ({ label: x.page, href: urlOf(x) })),
  ];
  return items.length ? { type: 'LIST', style: 'default', content: json({ title: 'In this section', items }) } : null;
}

/**
 * A container page's content: a heading and a card per child, in catalogue
 * order (children not in the catalogue last). `entries` are catalogue entries.
 */
export function sectionIndexModules(row, children, entries, urlOf, eyebrow = 'Genshin notes') {
  const order = new Map(entries.map((e, i) => [e.title, i]));
  const blurb = new Map(entries.map((e) => [e.title, e.blurb]));
  const sorted = [...children].sort((a, b) => (order.get(a.page) ?? 1e9) - (order.get(b.page) ?? 1e9));
  return [
    heading(eyebrow, row.page, `${sorted.length} pages`),
    { type: 'LIST', style: 'cards', content: json({
      title: row.page,
      items: sorted.map((c) => ({ label: c.page, value: blurb.get(c.page) || '', href: urlOf(c) })),
    }) },
  ];
}
