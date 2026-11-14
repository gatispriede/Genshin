/**
 * One-off probe: how does a multi-column section place its modules?
 * Builds a scratch page with a 3-column section holding three labelled
 * RICH_TEXT blocks, so the render shows which content index lands in which
 * column. Delete the page afterwards with --clean.
 *
 *     secrets run flux-layout-probe
 *     secrets run flux-layout-probe --clean
 */

import { connect, call, findPage, recreatePage } from './flux-client.mjs';

const NAME = 'Layout probe';
const block = (label) => ({
  type: 'RICH_TEXT', style: 'default',
  content: JSON.stringify({ value: `<p><b>${label}</b> — content index marker</p>` }),
});

await connect('genshin-probe');

if (process.argv.includes('--clean')) {
  const p = await findPage(NAME);
  if (p) await call('page.delete', { id: p.id });
  console.log(p ? 'probe page deleted' : 'nothing to delete');
  process.exit(0);
}

const page = await recreatePage(NAME);
const { sectionId } = await call('section.create', { pageId: page.id, type: 3 });
await call('module.add', { items: ['A (0)', 'B (1)', 'C (2)'].map((l) => ({ sectionId, module: block(l) })) });
console.log(`https://flux.siaup.store/${page.slug}`);
