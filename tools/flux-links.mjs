/**
 * Rewrites links between local pages ("varesa-build.html", "research/x.md")
 * to the pages they became on flux. Without this a migrated page keeps
 * relative file links that 404 on the site.
 *
 * Module content is a JSON string, so a link appears either inside HTML as
 * href=\"x.html#a\" or as a list item's "href":"x.html".
 */

import { posix } from 'node:path';
import { pagePaths } from './flux-pages.mjs';
import { catalogue, buildOwners } from './flux-catalogue.mjs';

/** Local href -> flux path, for every catalogue page that exists on flux. */
export async function linkTargets() {
  const { pages, path } = await pagePaths();
  const byTitle = new Map(pages.map((p) => [p.page, p]));
  const owners = buildOwners();
  const targets = {};
  for (const e of catalogue()) {
    const row = byTitle.get(owners[e.href] || e.title);
    if (row) targets[e.href] = path(row);
  }
  return targets;
}

const LOCAL = /^(?!https?:|\/|#|\?|mailto:)([^#?]+\.(?:html|md))([#?].*)?$/;

/**
 * The module with its local links pointed at flux. `from` is the source
 * page's own href: research/x.md linking "06-y.md" or "../z.html" means
 * research/06-y.md and z.html. Unknown local targets are left as they are
 * and returned in `missing`, so a run can report them.
 */
export function withLinks(module, targets, from = '') {
  const missing = new Set();
  const dir = posix.dirname(from);
  const swap = (href) => {
    const m = href.match(LOCAL);
    if (!m) return href;
    const to = targets[posix.normalize(posix.join(dir, m[1]))];
    if (!to) { missing.add(m[1]); return href; }
    return to + (m[2] || '');
  };
  const content = module.content
    .replace(/href=\\"([^"\\]+)\\"/g, (_, h) => `href=\\"${swap(h)}\\"`)
    .replace(/"href":"([^"]+)"/g, (_, h) => `"href":"${swap(h)}"`);
  return { module: content === module.content ? module : { ...module, content }, missing };
}
