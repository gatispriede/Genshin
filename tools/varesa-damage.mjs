/**
 * Why does Varesa crit for ~50k when showcases show ~150k?
 *
 * Models her two biggest hits with the standard damage formula and compares
 * the account's build to a well-built C0, factor by factor, so each gap has a
 * number. Every input is a named constant below — change one and re-run.
 *
 *     node tools/varesa-damage.mjs
 *
 * Sources: talent multipliers and passives from the Fandom talent page (fetched
 * 14 Nov); base ATK from reference/data/char_10000111.json; the account's
 * stats from the HoYoLAB read of 14 Nov.
 *
 * Formula: (talent% x ATK + flat) x (1 + DMG%) x CRIT x DEF x RES
 *   DEF multiplier, Lv 90 attacker vs Lv 90 enemy, no DEF shred: 0.5
 *   RES multiplier: 1 - RES when RES >= 0; 1 - RES/2 when RES < 0
 */

const BASE_ATK = 341 + 510;          // Varesa Lv 90 base + The Widsith base

/** Talent multipliers by level (Fandom). Burst talent scales both burst hits. */
const TALENT = {
  // Fiery Passion Flying Kick — her burst while in Fiery Passion.
  flyingKick: { 6: 8.0528, 10: 10.3536 },
  // Volcano Kablam — special burst from Apex Drive; counts as Plunging DMG.
  kablam: { 6: 5.637, 10: 7.2475 },
};

/** A1 "Rainbow Crash": after her Skill, a Fiery Passion ground impact adds 180% ATK. */
const RAINBOW_CRASH = 1.8;

const resMult = (res) => (res < 0 ? 1 - res / 2 : 1 - res);

/**
 * One build. `nightsoulStacks` is her A4 (+35% base ATK per Nightsoul Burst,
 * max 2) — 2 stacks needs Natlan teammates triggering Nightsoul Bursts often.
 */
function hit(b, which) {
  const atk = b.sheetAtk + BASE_ATK * (0.35 * b.nightsoulStacks + b.atkPctBuffs);
  const isPlunge = which === 'kablam';
  const talent = TALENT[which][b.burstTalent];
  const base = talent * atk + (isPlunge ? RAINBOW_CRASH * atk : 0);
  // Long Night's Oath only boosts PLUNGING damage: 2pc +25%, 4pc up to +75%.
  const lno = isPlunge ? 0.25 + 0.75 : 0;
  const dmg = 1 + b.electroDmg + b.furinaFanfare + lno;
  const crit = 1 + b.critDmg;
  const res = resMult(b.enemyRes);
  return { value: base * dmg * crit * 0.5 * res, atk, dmg, crit, res, talent };
}

/** The account today (HoYoLAB, 14 Nov). */
const NOW = {
  sheetAtk: 2304,
  nightsoulStacks: 1,    // only Varesa is Natlan in the current team
  atkPctBuffs: 0.20,     // Charlotte's Noblesse Oblige
  burstTalent: 6,
  electroDmg: 0.0,       // ATK% goblet
  furinaFanfare: 0.21,   // Furina burst talent 1: 0.07% x 300 Fanfare
  critDmg: 1.23,
  enemyRes: 0.10,        // no Electro shred landing
};

/** A well-built C0: same weapon, no extra five-stars beyond what you own. */
const SHOWCASE_C0 = {
  sheetAtk: 2400,        // ATK% sands; goblet and circlet no longer ATK%
  nightsoulStacks: 2,    // a second Natlan teammate keeps both stacks up
  atkPctBuffs: 0.20,
  burstTalent: 10,
  electroDmg: 0.466,     // Electro DMG goblet
  furinaFanfare: 0.75,   // Furina burst talent 10: 0.25% x 300
  critDmg: 2.0,          // CRIT DMG circlet + substats
  enemyRes: -0.30,       // Viridescent Venerer swirling Electro: 10% - 40%
};

const k = (n) => `${(n / 1000).toFixed(1)}k`;

for (const which of ['kablam', 'flyingKick']) {
  const a = hit(NOW, which);
  const b = hit(SHOWCASE_C0, which);
  console.log(`\n${which === 'kablam' ? 'Volcano Kablam (plunge, Apex Drive)' : 'Fiery Passion Flying Kick (burst)'}`);
  console.log(`  now ${k(a.value)}   well-built C0 ${k(b.value)}   x${(b.value / a.value).toFixed(2)}`);
  const factors = [
    ['DMG bonus (Electro goblet + Furina burst talent)', b.dmg / a.dmg],
    ['CRIT DMG 123% -> 200%', b.crit / a.crit],
    ['Electro RES shred (VV swirling Electro)', b.res / a.res],
    ['Burst talent 6 -> 10', (TALENT[which][10] + (which === 'kablam' ? RAINBOW_CRASH : 0))
      / (TALENT[which][6] + (which === 'kablam' ? RAINBOW_CRASH : 0))],
    ['ATK (2nd Nightsoul stack, sheet)', b.atk / a.atk],
  ].sort((x, y) => y[1] - x[1]);
  for (const [name, f] of factors) console.log(`    x${f.toFixed(2)}  ${name}`);
}

// C6 adds +100% CRIT DMG and +10% CRIT Rate to plunges and burst — what many
// online clips are running. Shown so the 150k figure has its context.
const c6 = hit({ ...SHOWCASE_C0, critDmg: 3.0 }, 'kablam');
console.log(`\nSame build at C6 (+100% CRIT DMG on these hits): Kablam ${k(c6.value)}`);
