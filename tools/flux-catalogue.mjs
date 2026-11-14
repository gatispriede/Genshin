/**
 * The full page catalogue and how each entry migrates to the CMS.
 *
 * Source of truth is src/data/pages.ts (generated from index.html), so a page
 * cannot be silently left out: every entry is either routed somewhere or
 * listed as skipped with a reason.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';

/** Catalogue section -> parent page in the CMS tree. */
export const PARENT_FOR_SECTION = {
  Tools: 'Guides',
  Maps: 'Maps',
  Farming: 'Farming',
  Research: 'Research',
  Reference: 'Reference',
};

/**
 * Not content. The two code files are listed under "Making new pages" for
 * authors; CLAUDE.md and AUTHORING.md are instructions for whoever edits the
 * project, and CLAUDE.md is written for an AI assistant — not for a public
 * site.
 */
const SKIP = {
  'styles/map.css': 'code file, not content',
  'app/annotate.js': 'code file, not content',
  'CLAUDE.md': 'instructions for the AI assistant, not site content',
  'docs/AUTHORING.md': 'authoring guide for editors, not site content',
};

/** Pages driven by engines that will not run in the CMS. */
const ENGINE_PAGES = /app\/(map-core|live-map|collect-map)\.js/;

/** Read pages.ts without a TypeScript toolchain — its format is generated and fixed. */
export function catalogue() {
  const src = readFileSync('src/data/pages.ts', 'utf8');
  const re = /href: "([^"]+)", title: "((?:[^"\\]|\\.)*)", blurb: "(?:[^"\\]|\\.)*", kind: "([^"]+)", section: "([^"]+)"/g;
  const out = [];
  let m;
  while ((m = re.exec(src))) {
    out.push({ href: m[1], title: JSON.parse(`"${m[2]}"`), kind: m[3], section: m[4] });
  }
  return out;
}

/**
 * How one entry migrates.
 * @returns {{action:'skip'|'builds'|'migrate', reason?:string, parent?:string}}
 */
export function route(entry) {
  if (SKIP[entry.href]) return { action: 'skip', reason: SKIP[entry.href] };
  // Build write-ups attach to the generated character pages (flux-push.mjs).
  if (entry.section === 'Builds') return { action: 'builds' };
  const parent = PARENT_FOR_SECTION[entry.section];
  if (!parent) return { action: 'skip', reason: `no parent for section "${entry.section}"` };
  return { action: 'migrate', parent };
}

/**
 * The HTML to migrate for an entry: the rendered DOM when one exists, so
 * script-generated tables are included; markdown converted; else the source.
 */
export function sourceHtml(entry) {
  if (entry.href.endsWith('.md')) {
    return marked.parse(readFileSync(entry.href, 'utf8'), { gfm: true });
  }
  const rendered = join('tools/.rendered', entry.href);
  return readFileSync(existsSync(rendered) ? rendered : entry.href, 'utf8');
}

export const usesEngine = (entry) =>
  entry.href.endsWith('.html') && ENGINE_PAGES.test(readFileSync(entry.href, 'utf8'));

export const isRendered = (entry) => existsSync(join('tools/.rendered', entry.href));
