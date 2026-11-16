/**
 * Current gear against target, per character: set, main stats, weapon and
 * substats. Plus the ideal build, so a page shows what a perfect build is and
 * how far the equipped one is from it.
 *
 * Input is a merged Character (src/data: profile + HoYoLAB read): equipped
 * `artifacts` with HoYoLAB's text ("ATK 46.6%", "CRIT Rate 7.8%(2)") and the
 * targets targetSet / targetMains / targetSubs / targetWeapon / gearSource.
 *
 * The substat score is "useful rolls of all rolls": a substat line counts its
 * rolls ("CRIT Rate 7.8%(2)" = 2), and it is useful when it is in targetSubs.
 */

/** HoYoLAB stat text -> one name: "ATK 46.6%" -> "ATK%", "Cryo DMG Bonus 46.6%" -> "Cryo DMG". */
export function statName(text) {
  const m = String(text).trim().match(/^(.*?)\s+[\d.,]+(%?)(?:\(\d+\))?$/);
  if (!m) return String(text).trim();
  const [, name, pct] = m;
  if (['HP', 'ATK', 'DEF'].includes(name)) return pct ? `${name}%` : name;
  return name.replace(/ DMG Bonus$/, ' DMG');
}

/** "ER% or HP%", "CRIT", "Hydro DMG% or ATK%" -> the stat names they accept. */
function accepted(target) {
  return String(target).split(/\s+or\s+/i).flatMap((o) => {
    const t = o.replace(/\(.*?\)/g, '').trim();
    if (/^ER%?$|^Energy Recharge$/i.test(t)) return ['Energy Recharge'];
    if (/^CRIT$/i.test(t)) return ['CRIT Rate', 'CRIT DMG'];
    if (/^EM$/i.test(t)) return ['Elemental Mastery'];
    return [t.replace(/ DMG%$/, ' DMG')];
  });
}

function rolls(subsText) {
  return String(subsText || '').split(/,\s*/).filter(Boolean).map((s) => {
    const n = s.match(/\((\d+)\)$/);
    return { name: statName(s), text: s.replace(/\(\d+\)$/, ''), rolls: n ? Number(n[1]) : 1 };
  });
}

const tick = (ok) => (ok ? '✓' : '✗');

/** Rows comparing equipped gear with the target. Empty when nothing is targeted. */
export function gearRows(c) {
  const rows = [];
  const arts = c.artifacts || [];
  if (c.targetSet) {
    const counts = {};
    for (const a of arts) counts[a.set] = (counts[a.set] || 0) + 1;
    const now = Object.entries(counts).sort((x, y) => y[1] - x[1]).map(([s, n]) => `${n}× ${s}`).join(' + ') || 'none';
    const hit = Object.entries(counts).some(([s, n]) => n >= 4 && c.targetSet.includes(s));
    rows.push({ label: 'Set', value: `${now} → want ${c.targetSet} ${tick(hit)}` });
  }
  for (const slot of ['sands', 'goblet', 'circlet']) {
    const want = c.targetMains?.[slot];
    if (!want) continue;
    const a = arts.find((x) => x.slot.toLowerCase() === slot);
    const now = a ? statName(a.main) : 'empty';
    const meta = a ? ` (${a.rarity ?? '?'}★ +${a.level})` : '';
    rows.push({ label: slot[0].toUpperCase() + slot.slice(1),
                value: `${now}${meta} → want ${want} ${tick(a && accepted(want).includes(now))}` });
  }
  if (c.targetWeapon && c.weapon) {
    const ok = c.targetWeapon.toLowerCase().startsWith(c.weapon.name.toLowerCase());
    rows.push({ label: 'Weapon', value: `${c.weapon.name} Lv ${c.weapon.level} → want ${c.targetWeapon} ${tick(ok)}` });
  }
  if (c.targetSubs?.length && arts.length) {
    const all = arts.flatMap((a) => rolls(a.subs).map((r) => ({ ...r, slot: a.slot })));
    const useful = all.filter((r) => c.targetSubs.includes(r.name));
    const total = all.reduce((s, r) => s + r.rolls, 0);
    const good = useful.reduce((s, r) => s + r.rolls, 0);
    const list = useful.map((r) => `${r.text} (${r.slot})`).join(', ') || 'none';
    rows.push({ label: 'Substats', value: `${good} of ${total} rolls useful: ${list}` });
  }
  return rows;
}

/** The ideal build, as rows. */
export function idealRows(c) {
  const rows = [];
  if (c.targetSet) rows.push({ label: 'Set', value: c.targetSet });
  for (const slot of ['sands', 'goblet', 'circlet']) {
    if (c.targetMains?.[slot]) rows.push({ label: slot[0].toUpperCase() + slot.slice(1), value: c.targetMains[slot] });
  }
  if (c.targetSubs?.length) rows.push({ label: 'Substats', value: c.targetSubs.join(' > ') });
  if (c.targetWeapon) rows.push({ label: 'Weapon', value: c.targetWeapon });
  if (c.gearSource) rows.push({ label: 'Based on', value: c.gearSource });
  return rows;
}
