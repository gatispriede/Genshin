/**
 * Pushes the whole account to flux.siaup.store as native CMS modules.
 *
 * Source of truth is src/data/characters.ts and teams.ts, bundled here with
 * esbuild — so a correction there still lands in one place and gets re-pushed,
 * rather than being hand-edited in the CMS.
 *
 * Run through the vault so the token is injected and never on a command line:
 *     secrets run flux-push            # dry run, prints the plan
 *     secrets run flux-push -- --apply # actually writes
 *
 * Deletes every operator-authored page first (--apply only). System pages —
 * checkout, account, legal, blog — are never touched: they are infrastructure,
 * not content.
 */

import { build } from 'esbuild';
import { unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { connect, call } from './flux-client.mjs';
import { pageSections } from './flux-layout.mjs';
import { sourceHtml } from './flux-catalogue.mjs';

const APPLY = process.argv.includes('--apply');

/* ---------------------------------------------------------------- data --- */

async function loadData() {
  const tmp = resolve('tools/.flux-data.mjs');
  await build({
    entryPoints: [resolve('src/data/index-for-push.ts')],
    bundle: true, format: 'esm', platform: 'node', outfile: tmp, logLevel: 'silent',
  });
  const mod = await import('file://' + tmp + '?t=' + Date.now());
  try { unlinkSync(tmp); } catch {}
  return mod;
}

/* ------------------------------------------------------------- builders --- */

const json = (o) => JSON.stringify(o);

/**
 * Name -> {name, url}, filled during the create pass and read during the
 * module pass. This is what lets a team roster link to character pages and a
 * character link back to its team, instead of printing a bare id.
 */
const links = { characters: {}, teams: {} };

function heading(eyebrow, h, subtitle) {
  return { type: 'SECTION_HEADING', style: 'editorial',
           content: json({ eyebrow, heading: h, subtitle, align: 'left' }) };
}

function characterModules(c, teamName) {
  const mods = [heading(c.element, c.name,
    [c.weaponType, c.rarity ? c.rarity + '★' : null, 'Lv ' + c.level,
     c.constellation === null ? 'constellation unverified' : 'C' + c.constellation,
    ].filter(Boolean).join(' · '))];

  const vitals = [
    { label: 'Element', value: c.element },
    c.weaponType && { label: 'Weapon type', value: c.weaponType },
    { label: 'Level', value: String(c.level) },
    { label: 'Constellation', value: c.constellation === null ? 'not verified' : 'C' + c.constellation },
    c.paidIn && { label: 'Pays off in', value: c.paidIn },
    c.targetSet && { label: 'Target set', value: c.targetSet
      + (c.setProgress ? ` (${{ none: 'not started', partial: 'partly collected', complete: 'complete' }[c.setProgress]})` : '') },
    c.targetMains && { label: 'Main stats', value:
      `Sands ${c.targetMains.sands} · Goblet ${c.targetMains.goblet} · Circlet ${c.targetMains.circlet}` },
    // Team display names with a link through, not the raw ids — "varesa" told
    // the reader nothing and went nowhere.
    ...c.teams.map((id) => {
      const t = links.teams[id];
      return t ? { label: 'Fielded in', value: t.name, href: t.url } : null;
    }),
    c.weapon && { label: 'Weapon', value: `${c.weapon.name} Lv ${c.weapon.level}` +
      (c.weapon.refinement ? ` R${c.weapon.refinement}` : '') },
    c.verified && { label: 'Read from game', value: c.verified },
  ].filter(Boolean);

  if (c.stats) {
    const s = c.stats;
    const cells = [
      s.atk && { value: s.atk.toLocaleString('en-US'), unit: 'ATK', label: 'Total' },
      s.critRate && { value: s.critRate, unit: 'CRIT', label: 'Rate' },
      s.critDmg && { value: s.critDmg, unit: 'CRIT', label: 'DMG' },
      s.energyRecharge && { value: s.energyRecharge, unit: 'ER', label: 'Recharge' },
      s.em !== undefined && { value: String(s.em), unit: 'EM', label: 'Mastery' },
    ].filter(Boolean);
    if (cells.length) mods.push({ type: 'STATS_STRIP', style: 'editorial',
                                  content: json({ cells }) });
  }

  // After the full-width stats band, so vitals and artifacts are
  // neighbours and packSections() puts them side by side.
  mods.push({ type: 'KEY_VALUE_DOSSIER', style: 'spec',
              content: json({ title: 'Vitals', items: vitals }) });

  if (c.artifacts?.length) {
    const items = c.artifacts.map((a) => ({
      label: a.slot, value: a.set, meta: `+${a.level} · ${a.main}`,
      tags: a.offSet ? ['off-set'] : [],
    }));
    const allOff = c.artifacts.every((a) => a.offSet);
    mods.push({ type: 'LIST', style: 'facts',
      content: json({ title: allOff ? 'Artifacts — no set bonus active' : 'Artifacts', items }) });
  }

  if (c.note) {
    mods.push({ type: 'FAQ_ACCORDION', style: 'bordered',
      content: json({ title: 'Notes', mode: 'single',
                      rows: [{ question: `Why is ${c.name} built this way?`, answer: c.note }] }) });
  }
  return mods;
}

function teamModules(t) {
  const mods = [heading(t.element, t.name, t.members.map((m) => m.character).join(' · '))];

  mods.push({ type: 'LIST', style: 'cards', content: json({
    title: 'Roster',
    items: t.members.map((m) => ({
      label: m.character, value: m.role,
      meta: m.set || undefined,
      // Links through to the character's own page where one exists.
      href: links.characters[m.character]?.url,
    })),
  }) });

  mods.push({ type: 'KEY_VALUE_DOSSIER', style: 'spec', content: json({
    title: 'Shield coverage',
    items: [
      { label: 'Breaks', value: t.breaks.join(', ') || 'nothing' },
      { label: 'Cannot break',
        value: t.cannotBreak.length ? t.cannotBreak.join(', ') : 'nothing — covers everything' },
    ],
  }) });

  if (t.note) {
    mods.push({ type: 'FAQ_ACCORDION', style: 'bordered', content: json({
      title: 'Why this team', mode: 'single',
      rows: [{ question: `What makes ${t.name} work?`, answer: t.note }],
    }) });
  }
  return mods;
}

/* ----------------------------------------------------------------- run --- */

/**
 * Creates the page and parents it, but writes no modules — those come in a
 * second pass, once every page exists and its real slug is known, so content
 * can link to URLs instead of guessing at them.
 *
 * page.setParent {pageId, parentId} is the working shape. page.update with a
 * `parent` field returns isError and does nothing.
 */
async function makePage(name, parentId) {
  await call('page.create', { page: name });
  const pages = await call('page.list', {});
  const row = pages.filter((p) => p.page === name).pop();
  if (!row) throw new Error('page vanished after create: ' + name);
  if (parentId) await call('page.setParent', { pageId: row.id, parentId });
  return row;
}

/** Module types compact enough to sit side by side in a 2-column section. */
const PAIRABLE = new Set(['KEY_VALUE_DOSSIER', 'LIST']);

/**
 * Consecutive pairable modules share a 2-column section (vitals beside
 * artifacts, roster beside shield coverage); everything else takes a full row.
 * In an N-column section, content index i lands in column i — probed on flux.
 */
function packSections(modules) {
  const sections = [];
  for (let i = 0; i < modules.length; i++) {
    const m = modules[i];
    const next = modules[i + 1];
    if (PAIRABLE.has(m.type) && next && PAIRABLE.has(next.type)) {
      sections.push([m, next]);
      i++;
    } else {
      sections.push([m]);
    }
  }
  return sections;
}

/** Find-or-create a page and empty its sections, keeping its id and children. */
async function reusePage(name, parentId) {
  const existing = (await call('page.list', {}))
    .filter((p) => p.page === name && p.source !== 'system-page').pop();
  if (!existing) return makePage(name, parentId);
  for (const sectionId of existing.sections || []) {
    await call('section.delete', { id: sectionId });
  }
  if (parentId && existing.parent !== parentId) {
    await call('page.setParent', { pageId: existing.id, parentId });
  }
  return existing;
}

async function writeModules(row, modules) {
  for (const group of packSections(modules)) {
    const { sectionId } = await call('section.create', { pageId: row.id, type: group.length });
    await call('module.add', { items: group.map((m) => ({ sectionId, module: m })) });
  }
}

/**
 * The character's build write-up, appended below the generated stats.
 * Rendered DOM (tools/render-pages.mjs) so script-built tables are included;
 * the write-up's own title is dropped, since the page already has one.
 */
async function writeWriteUp(row, c) {
  if (!c.page) return;
  const sections = pageSections(sourceHtml({ href: c.page }), c.name);
  const body = sections[0]?.modules[0]?.type === 'SECTION_HEADING' ? sections.slice(1) : sections;
  for (const s of body) {
    const { sectionId } = await call('section.create', { pageId: row.id, type: s.columns });
    await call('module.add', { items: s.modules.map((module) => ({ sectionId, module })) });
  }
}

const main = async () => {
  const data = await loadData();
  // Fielded characters, plus anyone with a build write-up (Tighnari, Fischl).
  const characters = data.characters.filter((c) => c.owned && (c.teams.length > 0 || c.page));
  const teams = data.teams;

  console.log(`plan: delete operator pages, then create ${1 + 2 + characters.length + teams.length} pages`);
  console.log(`  characters: ${characters.map((c) => c.name).join(', ')}`);
  console.log(`  teams     : ${teams.map((t) => t.name).join(', ')}`);
  if (!APPLY) { console.log('\ndry run — pass --apply to write'); return; }

  await connect('genshin-push');

  // 1. Clear only the pages this script owns, so a re-run is idempotent
  // without touching system pages or anything authored elsewhere.
  const owned = new Set([
    ...characters.map((c) => c.name), ...teams.map((t) => t.name),
  ]);
  const before = await call('page.list', {});
  const doomed = before.filter((p) => p.source !== 'system-page' && owned.has(p.page));
  // page.delete takes `id`, not `pageId` — unlike setParent and section.create.
  for (const p of doomed) await call('page.delete', { id: p.id });
  console.log(`cleared ${doomed.length} previously pushed pages`);

  // 2. every page first, so phase three can link to real URLs.
  // Structural pages are reused, never recreated: Guides, Maps, Research
  // and the rest are parented to the root by id, and a recreated root would
  // orphan all of them. Only their own sections are cleared and rewritten.
  const root = await reusePage('Genshin notes', null);
  const buildsRoot = await reusePage('Builds', root.id);
  const teamsRoot = await reusePage('Teams', root.id);

  const rootUrl = `/${root.slug}`;
  const buildsUrl = `${rootUrl}/${buildsRoot.slug}`;
  const teamsUrl = `${rootUrl}/${teamsRoot.slug}`;

  const charRows = [];
  for (const c of characters) {
    const row = await makePage(c.name, buildsRoot.id);
    charRows.push([c, row]);
    links.characters[c.name] = { name: c.name, url: `${buildsUrl}/${row.slug}` };
  }
  const teamRows = [];
  for (const t of teams) {
    const row = await makePage(t.name, teamsRoot.id);
    teamRows.push([t, row]);
    links.teams[t.id] = { name: t.name, url: `${teamsUrl}/${row.slug}` };
  }
  console.log(`created ${3 + charRows.length + teamRows.length} pages`);

  // 3. modules, now that every href resolves.
  await writeModules(root, [
    heading('Genshin Impact', 'Account notes',
      `${data.characters.filter((c) => c.owned).length} characters · ${teams.length} teams · read 2026-11-12`),
    { type: 'FEATURE_GRID', style: 'default', content: json({
      columns: 2,
      features: teams.map((t) => ({
        key: t.id, title: t.name,
        description: t.members.map((m) => m.character).join(' · '),
      })),
    }) },
    { type: 'LIST', style: 'default', content: json({
      title: 'Sections',
      items: [
        { label: 'Builds', value: `${characters.length} characters`, href: buildsUrl },
        { label: 'Teams', value: `${teams.length} teams`, href: teamsUrl },
      ],
    }) },
  ]);

  await writeModules(buildsRoot, [
    heading('Characters', 'Builds', `${characters.length} characters currently fielded`),
    { type: 'LIST', style: 'cards', content: json({
      title: 'Characters',
      items: charRows.map(([c]) => ({
        label: c.name,
        value: `${c.element} · Lv ${c.level}`,
        meta: c.targetSet || undefined,
        href: links.characters[c.name].url,
      })),
    }) },
  ]);

  await writeModules(teamsRoot, [
    heading('Teams', 'Teams', 'What each can break, and what it cannot'),
    { type: 'LIST', style: 'cards', content: json({
      title: 'Teams',
      items: teamRows.map(([t]) => ({
        label: t.name,
        value: t.members.map((m) => m.character).join(' · '),
        href: links.teams[t.id].url,
      })),
    }) },
  ]);

  for (const [c, row] of charRows) {
    await writeModules(row, characterModules(c));
    await writeWriteUp(row, c);
  }
  for (const [t, row] of teamRows) await writeModules(row, teamModules(t));

  console.log('\nlinked tree:');
  console.log('  ' + rootUrl);
  console.log('  ' + buildsUrl);
  charRows.forEach(([c]) => console.log('    ' + links.characters[c.name].url));
  console.log('  ' + teamsUrl);
  teamRows.forEach(([t]) => console.log('    ' + links.teams[t.id].url));
};

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
