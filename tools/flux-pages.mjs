/**
 * Page-tree helpers shared by flux-push.mjs and flux-migrate-html.mjs:
 * create, reuse and locate pages, and write a section's index of children.
 *
 * page.create takes only a name; parenting is a separate page.setParent call
 * (passing `parent` to page.create returns isError and does nothing).
 */

import { call } from './flux-client.mjs';

const json = (o) => JSON.stringify(o);
const listPages = async () => (await call('page.list', {})).filter((p) => p.source !== 'system-page');

export function heading(eyebrow, h, subtitle) {
  return { type: 'SECTION_HEADING', style: 'editorial',
           content: json({ eyebrow, heading: h, subtitle, align: 'left' }) };
}

/** Create a page and parent it. */
export async function makePage(name, parentId) {
  await call('page.create', { page: name });
  const row = (await listPages()).filter((p) => p.page === name).pop();
  if (!row) throw new Error('page vanished after create: ' + name);
  if (parentId) await call('page.setParent', { pageId: row.id, parentId });
  return row;
}

/** Find-or-create a page under parentId, leaving its content alone. */
export async function ensurePage(name, parentId) {
  const row = (await listPages()).filter((p) => p.page === name).pop();
  if (!row) return makePage(name, parentId);
  if (parentId && row.parent !== parentId) await call('page.setParent', { pageId: row.id, parentId });
  return row;
}

/**
 * Find-or-create a page and empty its sections, keeping its id, slug and
 * children. Deleting and recreating instead would orphan or drop the pages
 * nested under it (the region reputation pages under the all-regions page).
 */
export async function reusePage(name, parentId) {
  const row = await ensurePage(name, parentId);
  for (const sectionId of row.sections || []) await call('section.delete', { id: sectionId });
  return row;
}

/** Page id -> its public path ("/genshin-notes/guides/x"), from one page.list. */
export async function pagePaths() {
  const pages = await listPages();
  const byId = new Map(pages.map((p) => [p.id, p]));
  const path = (p) => {
    const parts = [];
    for (let x = p; x; x = byId.get(x.parent)) parts.unshift(x.slug);
    return '/' + parts.join('/');
  };
  return { pages, path };
}

/**
 * Overwrite a section page with a card per child, in catalogue order, so the
 * section is not an empty "No data" page. `entries` are catalogue entries
 * ({title, blurb}); children not in the catalogue are listed after them.
 */
export async function writeSectionIndex(row, entries, eyebrow = 'Section') {
  const { pages, path } = await pagePaths();
  const children = pages.filter((p) => p.parent === row.id);
  const order = new Map(entries.map((e, i) => [e.title, i]));
  children.sort((a, b) => (order.get(a.page) ?? 1e9) - (order.get(b.page) ?? 1e9));
  const blurb = new Map(entries.map((e) => [e.title, e.blurb]));
  await reusePage(row.page, row.parent);
  const { sectionId } = await call('section.create', { pageId: row.id, type: 1 });
  await call('module.add', { items: [
    { sectionId, module: heading(eyebrow, row.page, `${children.length} pages`) },
    { sectionId, module: { type: 'LIST', style: 'cards', content: json({
      title: row.page,
      items: children.map((c) => ({ label: c.page, value: blurb.get(c.page) || '', href: path(c) })),
    }) } },
  ] });
  return children.length;
}
