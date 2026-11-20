/**
 * The full page catalogue and how each entry migrates to the CMS.
 *
 * Source of truth is src/data/pages.ts (generated from index.html), so a page
 * cannot be silently left out: every entry is either routed somewhere or
 * listed as skipped with a reason.
 */

import { readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';
import { parentOf, RETIRED } from './flux-tree.mjs';

/**
 * Not content. The two code files are listed under "Making new pages" for
 * authors; CLAUDE.md and AUTHORING.md are instructions for whoever edits the
 * project, and CLAUDE.md is written for an AI assistant — not for a public
 * site.
 */
const SKIP = {
  'reference/account.md': 'the owner\'s account identity (UID, in-game name), kept private',
  'styles/map.css': 'code file, not content',
  'app/annotate.js': 'code file, not content',
  'CLAUDE.md': 'instructions for the AI assistant, not site content',
  'docs/AUTHORING.md': 'authoring guide for editors, not site content',
  'character-roadmap.html': 'superseded by the generated Character roadmap (flux-generated.mjs)',
};

/** Pages driven by engines that will not run in the CMS. */
const ENGINE_PAGES = /app\/(map-core|live-map|collect-map)\.js/;

/** Read pages.ts without a TypeScript toolchain — its format is generated and fixed. */
export function catalogue() {
  const src = readFileSync('src/data/pages.ts', 'utf8');
  const re = /href: "([^"]+)", title: "((?:[^"\\]|\\.)*)", blurb: "((?:[^"\\]|\\.)*)", kind: "([^"]+)", section: "([^"]+)"/g;
  const out = [];
  let m;
  while ((m = re.exec(src))) {
    out.push({ href: m[1], title: JSON.parse(`"${m[2]}"`), blurb: JSON.parse(`"${m[3]}"`),
               kind: m[4], section: m[5] });
  }
  return out;
}

/**
 * How one entry migrates.
 * @returns {{action:'skip'|'builds'|'migrate', reason?:string, parent?:string}}
 */
export function route(entry) {
  if (SKIP[entry.href]) return { action: 'skip', reason: SKIP[entry.href] };
  if (RETIRED[entry.href]) return { action: 'skip', reason: `retired: ${RETIRED[entry.href]}` };
  // Build write-ups attach to the generated character pages (flux-generated.mjs).
  if (entry.section === 'Builds') return { action: 'builds' };
  const parent = parentOf(entry.href);
  if (parent === null) return { action: 'skip', reason: 'not placed in tools/flux-tree.mjs' };
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
  if (!existsSync(rendered)) return readFileSync(entry.href, 'utf8');
  // A render older than its source would publish yesterday's page.
  if (statSync(rendered).mtimeMs < statSync(entry.href).mtimeMs) {
    throw new Error(`${rendered} is older than ${entry.href}; run: node tools/render-pages.mjs ${entry.href}`);
  }
  return readFileSync(rendered, 'utf8');
}

/**
 * Build write-up -> the character whose generated page it is attached to
 * (flux-generated.mjs), read from characters.ts: one profile object per block.
 */
export function buildOwners() {
  const src = readFileSync('src/data/characters.ts', 'utf8');
  const owners = {};
  for (const block of src.split(/\n  \{/)) {
    const name = block.match(/name: '([^']+)'/);
    const page = block.match(/page: '([^']+)'/);
    if (name && page) owners[page[1]] = name[1];
  }
  return owners;
}

export const usesEngine = (entry) =>
  entry.href.endsWith('.html') && ENGINE_PAGES.test(readFileSync(entry.href, 'utf8'));

export const isRendered = (entry) => existsSync(join('tools/.rendered', entry.href));
