/**
 * Migrates the unblocked static pages to flux as CMS sections and modules.
 *
 * Module choice and side-by-side packing live in flux-layout.mjs; this file
 * only lists the pages, gates on text coverage, and writes.
 *
 *     secrets run flux-migrate-html                    # plan only
 *     secrets run flux-migrate-html --apply
 *     secrets run flux-migrate-html --only codes.html [--apply]
 *
 * Only pages tools/classify-pages.py reports as blocker-free are listed.
 * Build pages need their scripts run first; map pages need MAP_ANNOTATED.
 */

import { readFileSync } from 'node:fs';
import { connect, call, findPage, recreatePage } from './flux-client.mjs';
import { pageSections, moduleText } from './flux-layout.mjs';
import { text, pageContent } from './html-blocks.mjs';

const APPLY = process.argv.includes('--apply');
const ONLY = (() => {
  const i = process.argv.indexOf('--only');
  return i === -1 ? null : process.argv[i + 1];
})();

/** Blocker-free pages, from tools/classify-pages.py. */
const PAGES = [
  ['character-roadmap.html', 'Character roadmap'],
  ['enemy-coverage.html', 'Enemy shields'],
  ['teams.html', 'The three teams'],
  ['build-coverage.html', 'Build coverage'],
  ['stellar.html', 'Stellar Glimmer'],
  ['talent-farming.html', 'Talent farming'],
  ['codes.html', 'Redeem codes'],
  ['collectibles-status.html', 'Collectibles status'],
  ['reputation-compass.html', 'Treasure Compasses'],
  ['reputation-quests.html', 'Reputation quests'],
  ['reaction-combos.html', 'Reaction combos'],
  ['theater.html', 'Imaginarium Theater'],
  ['tcg-swap.html', 'TCG swaps'],
  ['support-squad.html', 'Support squad'],
];

/** Below this, blocks are being dropped — the 4% lesson. Refuse to write. */
const MIN_COVERAGE = 95;

function plan([file, title]) {
  const html = readFileSync(file, 'utf8');
  const sections = pageSections(html, title);
  const modules = sections.flatMap((s) => s.modules);
  const src = text(pageContent(html)).length;
  const out = modules.map(moduleText).join(' ').length;
  const multi = sections.filter((s) => s.columns > 1).length;
  return { file, title, sections, modules,
           coverage: src ? Math.round((100 * out) / src) : 100, multi };
}

const chosen = ONLY ? PAGES.filter(([f]) => f === ONLY) : PAGES;
if (!chosen.length) { console.error('no matching page'); process.exit(1); }
const plans = chosen.map(plan);

for (const p of plans) {
  const flag = p.coverage < MIN_COVERAGE ? '  <- CONTENT LOST' : '';
  console.log(`${p.title.padEnd(22)} ${String(p.sections.length).padStart(3)} sections`
    + ` (${p.multi} multi-column)  ${String(p.modules.length).padStart(3)} modules`
    + `  ${String(p.coverage).padStart(3)}% text${flag}`);
}

const lost = plans.filter((p) => p.coverage < MIN_COVERAGE);
if (lost.length) {
  console.error(`\nrefusing to write: ${lost.map((p) => p.file).join(', ')} below ${MIN_COVERAGE}% coverage`);
  process.exit(1);
}
if (!APPLY) { console.log('\ndry run — pass --apply to write'); process.exit(0); }

await connect('genshin-migrate');

const root = await findPage('Genshin notes');
if (!root) { console.error('no Genshin notes root — run flux-push first'); process.exit(1); }
let guides = await findPage('Guides');
if (!guides) guides = await recreatePage('Guides', root.id);

for (const p of plans) {
  const row = await recreatePage(p.title, guides.id);
  for (const s of p.sections) {
    const { sectionId } = await call('section.create', { pageId: row.id, type: s.columns });
    await call('module.add', { items: s.modules.map((module) => ({ sectionId, module })) });
  }
  console.log(`  /${root.slug}/${guides.slug}/${row.slug}  (${p.sections.length} sections)`);
}
