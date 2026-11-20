/**
 * The pages built from data rather than from an HTML file: the homepage, the
 * Builds index and one page per fielded character, the Teams index and one
 * page per team. Builds content only and touches no CMS; the bundle publisher
 * (flux-bundle-publish.mjs) diffs it against flux and imports what changed.
 *
 * Source of truth is src/data/characters.ts and teams.ts, bundled with
 * esbuild, so a correction there lands in one place and gets re-published
 * rather than being hand-edited in the CMS.
 *
 * Each page is {parent, title, from, sections(urlOf)}. `parent` is a path of
 * titles under the "Genshin notes" root ('' = the root itself; null = the
 * root page). `sections` takes urlOf(parent, title) -> flux path, so pages can
 * link each other by real URL, and returns [{type: columns, modules}].
 */

import { build } from 'esbuild';
import { unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { gearRows, idealRows } from './gear-check.mjs';
import { homeModules } from './flux-home.mjs';
import { heading } from './flux-pages.mjs';
import { pageSections } from './flux-layout.mjs';
import { sourceHtml } from './flux-catalogue.mjs';

const json = (o) => JSON.stringify(o);
const escHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

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

/** links: {characters: name -> {url}, teams: id -> {name, url}}. */
function characterModules(c, links) {
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
    // Team display names with a link through, not the raw ids.
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
    if (cells.length) mods.push({ type: 'STATS_STRIP', style: 'editorial', content: json({ cells }) });
  }

  // After the full-width stats band, so vitals and artifacts are neighbours
  // and packSections() puts them side by side.
  mods.push({ type: 'KEY_VALUE_DOSSIER', style: 'spec', content: json({ title: 'Vitals', items: vitals }) });

  if (c.artifacts?.length) {
    const items = c.artifacts.map((a) => ({
      label: a.slot, value: a.set, meta: `+${a.level} · ${a.main}`, tags: a.offSet ? ['off-set'] : [],
    }));
    const allOff = c.artifacts.every((a) => a.offSet);
    mods.push({ type: 'LIST', style: 'facts',
      content: json({ title: allOff ? 'Artifacts — no set bonus active' : 'Artifacts', items }) });
  }

  // Equipped gear against target, then the ideal build (tools/gear-check.mjs).
  for (const [title, items] of [['Gear vs target', gearRows(c)], ['Ideal build', idealRows(c)]]) {
    if (items.length) mods.push({ type: 'KEY_VALUE_DOSSIER', style: 'spec', content: json({ title, items }) });
  }

  if (c.note) {
    mods.push({ type: 'FAQ_ACCORDION', style: 'bordered',
      content: json({ title: 'Notes', mode: 'single',
                      rows: [{ question: `Why is ${c.name} built this way?`, answer: c.note }] }) });
  }
  return mods;
}

/**
 * One team page: why it works, roster with sets, shields, rotation, the
 * mechanics behind it, swaps and what to avoid. `t.note` is the private
 * account log and is never published (checked in teamSections).
 */
function teamModules(t, links) {
  const mods = [heading(t.element, t.name, t.members.map((m) => m.character).join(' · '))];
  if (t.why) mods.push({ type: 'RICH_TEXT', style: 'default', content: json({ value: `<p>${escHtml(t.why)}</p>` }) });

  mods.push({ type: 'LIST', style: 'cards', content: json({
    title: 'Roster',
    items: t.members.map((m) => ({
      label: m.character, value: m.role,
      meta: [m.set, m.mains].filter(Boolean).join(' — ') || undefined,
      href: links.characters[m.character]?.url,
    })),
  }) });

  mods.push({ type: 'KEY_VALUE_DOSSIER', style: 'spec', content: json({
    title: 'Shield coverage',
    items: [
      { label: 'Breaks', value: t.breaks.join(', ') || 'nothing' },
      { label: 'Cannot break', value: t.cannotBreak.length ? t.cannotBreak.join(', ') : 'nothing — covers everything' },
    ],
  }) });

  if (t.rotation?.length) {
    mods.push({ type: 'LIST', style: 'numbered', content: json({
      title: 'Rotation', items: t.rotation.map((s) => ({ label: s.who, value: s.does })),
    }) });
    if (t.rotationNote) {
      mods.push({ type: 'RICH_TEXT', style: 'default', content: json({
        value: `<p style="font-size:.9rem;opacity:.8"><i>${escHtml(t.rotationNote)}</i></p>` }) });
    }
  }

  if (t.mechanics?.length) {
    mods.push({ type: 'FAQ_ACCORDION', style: 'bordered', content: json({
      title: 'How it works', mode: 'single',
      rows: t.mechanics.map((m) => ({ question: m.title, answer: m.text })),
    }) });
  }

  if (t.swaps?.length) {
    const rows = t.swaps.map((x) => `<tr><td><b>${escHtml(x.who)}</b></td><td>${escHtml(x.instead)}</td>`
      + `<td>${escHtml(x.why)}</td></tr>`).join('');
    mods.push({ type: 'RICH_TEXT', style: 'default', content: json({ value:
      `<h3>Swaps</h3><table><tr><th>Bring</th><th>Instead of</th><th>Why</th></tr>${rows}</table>` }) });
  }

  if (t.avoid?.length) {
    mods.push({ type: 'RICH_TEXT', style: 'default', content: json({ value:
      `<p><b>Do not run:</b> ${t.avoid.map(escHtml).join(' ')}</p>` }) });
  }
  return mods;
}

/** Module types compact enough to sit side by side in a 2-column section. */
const PAIRABLE = new Set(['KEY_VALUE_DOSSIER', 'LIST']);

/**
 * Consecutive pairable modules share a 2-column section (vitals beside
 * artifacts, roster beside shield coverage); everything else takes a full row.
 * In an N-column section, content index i lands in column i (probed on flux).
 */
function packSections(modules) {
  const sections = [];
  for (let i = 0; i < modules.length; i++) {
    const m = modules[i];
    const next = modules[i + 1];
    if (PAIRABLE.has(m.type) && next && PAIRABLE.has(next.type)) { sections.push([m, next]); i++; }
    else sections.push([m]);
  }
  return sections.map((modules) => ({ type: modules.length, modules }));
}

/**
 * The character's build write-up, below the generated stats. Rendered DOM
 * (tools/render-pages.mjs) so script-built tables are included; the
 * write-up's own title is dropped, since the page already has one.
 */
function writeUpSections(c) {
  if (!c.page) return [];
  const sections = pageSections(sourceHtml({ href: c.page }), c.name);
  const body = sections[0]?.modules[0]?.type === 'SECTION_HEADING' ? sections.slice(1) : sections;
  return body.map((s) => ({ type: s.columns, modules: s.modules }));
}

/** A team's sections, refusing to return any that carry its private note. */
function teamSections(t, links) {
  const sections = packSections(teamModules(t, links));
  if (t.note && JSON.stringify(sections).includes(JSON.stringify(t.note).slice(1, -1))) {
    throw new Error(`team "${t.name}": its private note reached the page`);
  }
  return sections;
}

/* ---------------------------------------------------------------- pages --- */

/** Every generated page, in tree order (parents before children). */
export async function generatedPages() {
  const data = await loadData();
  // Fielded characters, plus anyone with a build write-up (Tighnari, Fischl).
  const characters = data.characters.filter((c) => c.owned && (c.teams.length > 0 || c.page));
  const teams = data.teams;

  const linksFor = (urlOf) => ({
    characters: Object.fromEntries(characters.map((c) => [c.name, { name: c.name, url: urlOf('Builds', c.name) }])),
    teams: Object.fromEntries(teams.map((t) => [t.id, { name: t.name, url: urlOf('Teams', t.name) }])),
  });

  return [
    { parent: null, title: 'Genshin notes', from: '', sections: (urlOf) => packSections(homeModules({
      rootUrl: urlOf(null, 'Genshin notes'), teams, characters: data.characters, pages: data.pages, links: linksFor(urlOf),
    })) },
    { parent: '', title: 'Builds', from: '', sections: (urlOf) => packSections([
      heading('Characters', 'Builds', `${characters.length} characters currently fielded`),
      { type: 'LIST', style: 'cards', content: json({
        title: 'Characters',
        items: characters.map((c) => ({
          label: c.name, value: `${c.element} · Lv ${c.level}`, meta: c.targetSet || undefined,
          href: urlOf('Builds', c.name),
        })),
      }) },
    ]) },
    { parent: '', title: 'Teams', from: '', sections: (urlOf) => packSections([
      heading('Teams', 'Teams', 'What each can break, and what it cannot'),
      { type: 'LIST', style: 'cards', content: json({
        title: 'Teams',
        items: teams.map((t) => ({
          label: t.name, value: t.members.map((m) => m.character).join(' · '), href: urlOf('Teams', t.name),
        })),
      }) },
    ]) },
    ...characters.map((c) => ({ parent: 'Builds', title: c.name, from: c.page || '',
      sections: (urlOf) => [...packSections(characterModules(c, linksFor(urlOf))), ...writeUpSections(c)] })),
    ...teams.map((t) => ({ parent: 'Teams', title: t.name, from: '',
      sections: (urlOf) => teamSections(t, linksFor(urlOf)) })),
  ];
}
