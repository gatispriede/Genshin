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
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';

const URL_ = 'https://flux.siaup.store/mcp';
const TOKEN = process.env.FLUX_TOKEN;
const APPLY = process.argv.includes('--apply');

if (!TOKEN) {
  console.error('FLUX_TOKEN is not set — run through the vault binding.');
  process.exit(2);
}

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

/* ----------------------------------------------------------------- mcp --- */

let session = null;

async function rpc(method, params) {
  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  };
  if (session) headers['Mcp-Session-Id'] = session;

  const res = await fetch(URL_, {
    method: 'POST', headers,
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
  });
  if (!session) session = res.headers.get('mcp-session-id');

  const text = await res.text();
  const line = text.split('\n').find((l) => l.startsWith('data: '));
  const payload = JSON.parse(line ? line.slice(6) : text || '{}');
  if (payload.error) throw new Error(method + ': ' + JSON.stringify(payload.error));
  return payload.result;
}

async function call(name, args = {}) {
  const r = await rpc('tools/call', { name, arguments: args });
  const text = r?.content?.[0]?.text;
  const parsed = text ? JSON.parse(text) : r;
  if (parsed && parsed.ok === false) throw new Error(name + ': ' + JSON.stringify(parsed));
  return parsed?.data ?? parsed;
}

async function connect() {
  await rpc('initialize', {
    protocolVersion: '2025-06-18', capabilities: {},
    clientInfo: { name: 'genshin-push', version: '1' },
  });
  await fetch(URL_, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream', 'Mcp-Session-Id': session,
    },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
  });
}

/* ------------------------------------------------------------- builders --- */

const json = (o) => JSON.stringify(o);

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
    c.targetSet && { label: 'Target set', value: c.targetSet },
    c.teams.length && { label: 'Fielded in', value: c.teams.join(', ') },
    c.weapon && { label: 'Weapon', value: `${c.weapon.name} Lv ${c.weapon.level}` +
      (c.weapon.refinement ? ` R${c.weapon.refinement}` : '') },
    c.verified && { label: 'Read from game', value: c.verified },
  ].filter(Boolean);
  mods.push({ type: 'KEY_VALUE_DOSSIER', style: 'spec',
              content: json({ title: 'Vitals', items: vitals }) });

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

async function makePage(name, parentId, modules) {
  await call('page.create', { page: name });
  const pages = await call('page.list', {});
  const row = pages.filter((p) => p.page === name).pop();
  if (!row) throw new Error('page vanished after create: ' + name);
  if (parentId) await call('page.update', { pageId: row.id, parent: parentId });
  if (modules.length) {
    const { sectionId } = await call('section.create', { pageId: row.id, type: 1 });
    await call('module.add', { items: modules.map((m) => ({ sectionId, module: m })) });
  }
  return row;
}

const main = async () => {
  const data = await loadData();
  const characters = data.characters.filter((c) => c.owned && c.teams.length > 0);
  const teams = data.teams;

  console.log(`plan: delete operator pages, then create ${1 + 2 + characters.length + teams.length} pages`);
  console.log(`  characters: ${characters.map((c) => c.name).join(', ')}`);
  console.log(`  teams     : ${teams.map((t) => t.name).join(', ')}`);
  if (!APPLY) { console.log('\ndry run — pass --apply to write'); return; }

  await connect();

  // 1. clear operator-authored pages. System pages are never touched.
  const before = await call('page.list', {});
  const doomed = before.filter((p) => p.source !== 'system-page');
  for (const p of doomed) {
    await call('page.delete', { pageId: p.id });
  }
  console.log(`deleted ${doomed.length} pages: ${doomed.map((p) => p.page).join(', ')}`);

  // 2. root
  const root = await makePage('Genshin notes', null, [
    heading('Genshin Impact', 'Account notes',
      `${data.characters.filter((c) => c.owned).length} characters · ${teams.length} teams · read 2026-11-12`),
    { type: 'FEATURE_GRID', style: 'default', content: json({
      columns: 2,
      features: teams.map((t) => ({
        key: t.id, title: t.name,
        description: t.members.map((m) => m.character).join(' · '),
      })),
    }) },
  ]);

  // 3. two parents
  const buildsRoot = await makePage('Builds', root.id, [
    heading('Characters', 'Builds', `${characters.length} characters currently fielded`)]);
  const teamsRoot = await makePage('Teams', root.id, [
    heading('Teams', 'Teams', 'What each can break, and what it cannot')]);

  // 4. leaves
  const made = [];
  for (const c of characters) {
    const row = await makePage(c.name, buildsRoot.id, characterModules(c));
    made.push(`/genshin-notes/builds/${row.slug}`);
  }
  for (const t of teams) {
    const row = await makePage(t.name, teamsRoot.id, teamModules(t));
    made.push(`/genshin-notes/teams/${row.slug}`);
  }

  console.log(`\ncreated ${made.length + 3} pages`);
  made.forEach((u) => console.log('  ' + u));
};

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
