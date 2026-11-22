import type { Character } from './types';
import { mergeLive } from './live';

/**
 * THE SOURCE OF TRUTH for this account's roster.
 *
 * Levels and gear were read from HoYoLAB and the in-game character screens on
 * 2026-11-12. Elements, weapon types and rarities come from the wiki via
 * reference/kits.md, or were read from the wiki directly in the same session.
 *
 * Change a character here and every page that reads this file follows. That is
 * the whole point: Varesa's stats used to live in five separate files.
 *
 * `constellation: null` means not verified. Every 5-star on this account is C0;
 * several 4-stars are high but no individual count has been confirmed.
 */
const profiles: Character[] = [
  {
    name: 'Varesa', element: 'Electro', weaponType: 'Catalyst', rarity: 5,
    level: 90, constellation: 0, owned: true, fieldRole: 'on-field',
    weapon: { name: 'The Widsith', level: 90, refinement: 2, substat: 'CRIT DMG', substatValue: '55.1%' },
    artifacts: [
      { slot: 'Flower', set: "Lightkeeper's", level: 16, main: 'HP 3,571', offSet: true },
      { slot: 'Plume', set: "Nightingale's Tail", level: 20, main: 'ATK 311', offSet: true },
      { slot: 'Sands', set: "Undying One's", level: 20, main: 'ATK% 46.6%', offSet: true },
      { slot: 'Goblet', set: 'A Horn Unwinded', level: 16, main: 'ATK% 34.8%', offSet: true },
      { slot: 'Circlet', set: 'Dyed Tassel', level: 16, main: 'ATK% 34.8%', offSet: true },
    ],
    stats: { maxHp: 19690, atk: 2304, def: 947, em: 63, critRate: '44.9%', critDmg: '123.0%', energyRecharge: '116.3%', elementalDmgBonus: '0.0%' },
    teams: ['varesa'], tier: null, paidIn: 'gear',
    targetMains: { sands: 'ATK%', goblet: 'Electro DMG', circlet: 'CRIT DMG' }, // varesa-build.html
    targetSet: "Long Night's Oath (BiS) or Obsidian Codex",
    note: 'Max level, Long Night’s Oath 4pc, artifacts done (all +20, 16 Nov): crafted Electro DMG goblet, CRIT DMG circlet, 64% CRIT Rate / 188% CRIT DMG, 47% Electro DMG. Dummy test 16 Nov: 18,437 DPS (was 14,138). Keep the CRIT DMG circlet: a CRIT Rate one overcaps with Valeriy’s +10%. Next gains: Valeriy Skill-and-swap (he sat on field 4.6 s a cycle), then substat hunting on the circlet (no crit subs).',
    page: 'varesa-build.html', targetSubs: ["CRIT Rate", "CRIT DMG", "ATK%", "ATK"], targetWeapon: "The Widsith (owned); her signature is better", gearSource: "varesa-build.html: ER to her need, then CRIT, ATK%, flat ATK", verified: '2026-11-12',
  },
  {
    name: 'Yumemizuki Mizuki', element: 'Anemo', weaponType: 'Catalyst', rarity: 5,
    level: 60, constellation: 0, owned: true, fieldRole: 'on-field',
    weapon: { name: 'Sacrificial Fragments', level: 70, substat: 'Elemental Mastery', substatValue: '182' },
    artifacts: [
      { slot: 'Flower', set: 'Viridescent Venerer', level: 4, main: 'HP 1,530' },
      { slot: 'Plume', set: 'Viridescent Venerer', level: 8, main: 'ATK 152' },
      { slot: 'Sands', set: 'Viridescent Venerer', level: 0, main: 'EM 25' },
      { slot: 'Goblet', set: 'Royal Silver Urn', level: 9, main: 'EM 99', offSet: true },
      { slot: 'Circlet', set: 'Viridescent Venerer', level: 2, main: 'EM 44' },
    ],
    stats: { maxHp: 12023, atk: 733, def: 615, em: 426, critRate: '8.9%', critDmg: '63.2%', energyRecharge: '115.5%', elementalDmgBonus: '15.0%' },
    teams: ['mizuki'], tier: 1, paidIn: 'levels',
    targetMains: { sands: 'Elemental Mastery', goblet: 'Elemental Mastery', circlet: 'CRIT Rate or CRIT DMG' }, // mizuki-build.html
    targetSet: 'Viridescent Venerer (with Sucrose on Instructor), or Gilded Dreams / 2pc-2pc EM',
    note: 'Stellar Swirl carry. Vast Be the Dream unlocked 16 Nov at Lv 70: ~23k often, ~65k crits. 15% CRIT Rate is the gap - her payload crits.',
    page: 'mizuki-build.html', targetSubs: ["Elemental Mastery", "CRIT Rate", "CRIT DMG", "Energy Recharge"], targetWeapon: "Sacrificial Fragments (owned, R2)", gearSource: "mizuki-build.html and Zajef's guide: EM about equal to CRIT", verified: '2026-11-12',
  },
  {
    name: 'Furina', element: 'Hydro', weaponType: 'Sword', rarity: 5,
    level: 40, constellation: 0, owned: true, fieldRole: 'off-field',
    weapon: { name: 'Favonius Sword', level: 31, refinement: 1, substat: 'Energy Recharge', substatValue: '28.9%' },
    stats: { maxHp: 7690, atk: 421, def: 267, em: 19, critRate: '44.6%', critDmg: '55.0%', energyRecharge: '192.4%' },
    teams: ['varesa'], tier: 2, paidIn: 'talents',
    targetSet: 'Golden Troupe', setProgress: 'partial',
    targetMains: { sands: 'ER% or HP%', goblet: 'HP%', circlet: 'CRIT' },
    note: 'Her party buff ignores her level - burst talent 1 to 10 takes it from +21% to +75%. Level to 60 and stop.',
    page: 'furina-build.html', targetSubs: ["HP%", "CRIT Rate", "CRIT DMG", "Energy Recharge"], targetWeapon: "Favonius Sword (owned)", gearSource: "furina-build.html: HP% sands and goblet; her buff reads Fanfare and talent, not stats", verified: '2026-11-12',
  },
  {
    name: 'Skirk', element: 'Cryo', weaponType: 'Sword', rarity: 5, level: 90,
    constellation: 0, owned: true, fieldRole: 'on-field', teams: ['skirk'], tier: null,
    paidIn: 'gear', targetMains: { sands: 'ATK%', goblet: 'Cryo DMG or ATK%', circlet: 'CRIT' }, // skirk-build.html
    targetSet: 'Finale of the Deep Galleries',
    note: 'Max level. Needs Cryo reactions nearby to spawn Void Rifts for her ATK stacks.',
    page: 'skirk-build.html', targetSubs: ["CRIT Rate", "CRIT DMG", "ATK%", "ATK"], targetWeapon: "The Black Sword (owned)", gearSource: "skirk-build.html: CRIT, ATK%, flat ATK; ER and EM are dead rolls", verified: '2026-11-12',
  },
  {
    name: 'Escoffier', element: 'Cryo', weaponType: 'Polearm', rarity: 5, level: 70,
    constellation: 0, owned: true, fieldRole: 'off-field', teams: ['skirk'], tier: 3,
    paidIn: 'talents', targetSet: 'Golden Troupe', setProgress: 'partial',
    targetMains: { sands: 'ATK%', goblet: 'Cryo DMG%', circlet: 'CRIT' },
    note: 'Cryo RES shred is talent-scaled, so books beat levels.',
    page: 'escoffier-build.html', targetSubs: ["Energy Recharge", "ATK%", "CRIT DMG", "CRIT Rate"], targetWeapon: "Prototype Starglitter (owned)", gearSource: "escoffier-build.html: ER until her Burst is reliable, then ATK% and CRIT; her healing scales on ATK", verified: '2026-11-12',
  },
  {
    name: 'Mona', element: 'Hydro', weaponType: 'Catalyst', level: 57,
    constellation: null, owned: true, teams: ['skirk'], tier: 2, paidIn: 'gear',
    targetSet: 'Tenacity of the Millelith', setProgress: 'partial',
    targetMains: { sands: 'ER%', goblet: 'Hydro DMG% or ATK%', circlet: 'CRIT or HP%' }, unresearched: true,
    note: 'Wants 200%+ ER and Thrilling Tales of the Dragon Slayers to pass ATK to Skirk.',
    targetSubs: ["Energy Recharge", "ATK%", "CRIT Rate", "CRIT DMG"], targetWeapon: "Thrilling Tales of Dragon Slayers (passes ATK to Skirk)", gearSource: "unresearched: teams.ts note and characters.ts; ER first for her Omen Burst", verified: '2026-11-12',
  },
  {
    name: 'Barbara', element: 'Hydro', weaponType: 'Catalyst', rarity: 4, level: 70,
    constellation: null, owned: true, fieldRole: 'off-field', teams: [], tier: null,
    note: 'Left the Mizuki team on 15 Nov for Valeriy (+100 EM from his C2).', verified: '2026-11-12',
  },
  {
    name: 'Rosaria', element: 'Cryo', weaponType: 'Polearm', level: 1,
    constellation: null, owned: true, teams: ['mizuki', 'skirk'], tier: 2, paidIn: 'levels',
    unresearched: true,
    note: 'Wanted by two teams and still Lv 1. Up to 15% team CRIT Rate, plus Cryo resonance.',
    targetSet: 'The Exile (party energy) or 2pc/2pc ER', targetMains: { sands: 'Energy Recharge', goblet: 'ATK% or Cryo DMG', circlet: 'CRIT Rate' }, targetSubs: ["Energy Recharge", "CRIT Rate", "ATK%"], targetWeapon: "Favonius Lance (not owned); Dragon's Bane for now", gearSource: "unresearched: her job in the Mizuki team is Burst uptime (Ice Lance Cryo), so ER first; CRIT Rate for her party CRIT share once ascended", verified: '2026-11-12',
  },
  {
    name: 'Traveler', element: 'Cryo', weaponType: 'Sword', rarity: 5, level: 40,
    constellation: null, owned: true, teams: ['mizuki'], tier: 1, paidIn: 'gear',
    note: 'Cryo form is the only Stellar Jubilee passive owned - it converts Cryo Swirl into Stellar Swirl. His own damage is level-independent, so level him only to survive.',
    targetSet: 'Heart of the Furnace', targetMains: { sands: 'ATK% or Elemental Mastery', goblet: 'Cryo DMG or ATK%', circlet: 'CRIT Rate or CRIT DMG' }, targetSubs: ["CRIT Rate", "CRIT DMG", "ATK%", "Elemental Mastery"], targetWeapon: "Exaiphanes Blade (owned)", gearSource: "Zajef's Mizuki guide, 1:06:30-1:09: Heart of the Furnace without Odette; ATK and EM about equal for his Stellar reaction share", verified: '2026-11-12',
  },
  {
    name: 'Kachina', element: 'Geo', weaponType: 'Polearm', rarity: 4, level: 50,
    constellation: null, owned: true, fieldRole: 'off-field', teams: [], tier: null,
    paidIn: 'gear', targetSet: 'Scroll of the Hero of Cinder City', setProgress: 'partial',
    targetMains: { sands: 'DEF%', goblet: 'Geo DMG', circlet: 'CRIT Rate or CRIT DMG' }, // kachina-build.html
    targetSubs: ["Energy Recharge", "DEF%", "CRIT Rate", "CRIT DMG"],
    targetWeapon: "Prototype Starglitter (owned); Favonius Lance or Footprint of the Rainbow",
    gearSource: "kachina-build.html: Game8, Pocket Tactics, genshin-builds (17 Nov) — ER > DEF% > CRIT, aim ~2,000 DEF",
    note: 'Not built: mixed pieces from four sets, three at +0, talents 1/1/1. Her sands (DEF%) and goblet (Geo DMG) are already the right main stats, so levelling them is the cheap first step. No team slot today; Charlotte has the Varesa slot.',
    page: 'kachina-build.html', verified: '2026-11-16',
  },
  {
    name: 'Sucrose', element: 'Anemo', weaponType: 'Catalyst', rarity: 4, level: 50,
    constellation: null, owned: true, fieldRole: 'off-field', teams: ['mizuki'], tier: 3,
    paidIn: 'gear', targetSet: 'Instructor', setProgress: 'partial',
    // EM in all three slots, per sucrose-build.html.
    targetMains: { sands: 'Elemental Mastery', goblet: 'Elemental Mastery', circlet: 'Elemental Mastery' },
    note: 'Mizuki team from 16 Nov. Mollis Favonius gives the party 20% of her EM - a gear number, not a level one. 4pc Instructor (VV stays on Mizuki); Fruit of Fulfillment from a Midlander catalyst billet.',
    page: 'sucrose-build.html', targetSubs: ["Elemental Mastery", "Energy Recharge", "CRIT Rate"], targetWeapon: "Fruit of Fulfillment (owned); Sacrificial Fragments for the extra Skill", gearSource: "sucrose-build.html: EM, then ER to need", verified: '2026-11-12',
  },
  {
    name: 'Xiangling', element: 'Pyro', weaponType: 'Polearm', rarity: 4, level: 40,
    constellation: null, owned: true, fieldRole: 'off-field', teams: [], tier: 1,
    paidIn: 'levels',
    note: 'The only elemental hole on the account. Pyro breaks Cryo and Frozen wards at x2 and no current team has any.',
    verified: '2026-11-12',
  },
  {
    name: 'Mika', element: 'Cryo', weaponType: 'Polearm', rarity: 4, level: 45,
    constellation: null, owned: true, teams: ['skirk'], tier: 3, targetMains: { sands: 'HP%', goblet: 'HP%', circlet: 'Healing Bonus' }, // support-squad.html
    paidIn: 'gear',
    note: 'Likely replaced by Rosaria once she is levelled.', targetSet: 'Noblesse Oblige', targetSubs: ["HP%", "Energy Recharge"], targetWeapon: "Favonius Lance (not owned)", gearSource: "characters.ts: healing scales on HP", verified: '2026-11-12',
  },
  {
    name: 'Bennett', element: 'Pyro', weaponType: 'Sword', rarity: 4, level: 0,
    constellation: null, owned: false, teams: [], tier: 1, paidIn: 'levels',
    targetSet: 'Noblesse Oblige',
    note: 'Not owned yet. His ATK buff is a share of Base ATK, so levels raise the buff. C6 Pyro-infuses swords and would overwrite Skirk.',
  },

  { name: 'Tighnari', element: 'Dendro', weaponType: 'Bow', rarity: 5, level: 70, constellation: null, owned: true, teams: [], tier: null, note: 'Only levelled Dendro. Dendro breaks Hydro wards at x2 where the teams manage x1.', page: 'tighnari-build.html', verified: '2026-11-12' },
  { name: 'Alyosha', element: 'Electro', weaponType: 'Polearm', rarity: 4, level: 60, constellation: null, owned: true, teams: [], tier: null, verified: '2026-11-12' },
  { name: 'Valeriy', element: 'Electro', weaponType: 'Sword', rarity: 4, level: 60, constellation: null, owned: true, fieldRole: 'off-field', teams: ['varesa'], tier: 3, paidIn: 'levels', note: 'Varesa team from 16 Nov (was Mizuki, 15 Nov): Offensive Directive adds to on-field Electro hits, C6 gives +10% Electro CRIT Rate on enemies he hits, and his shield covers Varesa’s plunges. C2: party +100 EM for 18s after his Skill (10s cooldown). Also the Theater Act 4-6 support, 16 Nov.', targetSet: 'Tenacity of the Millelith (worn) or 2pc/2pc ATK%', targetMains: { sands: 'ATK% or Energy Recharge', goblet: 'ATK%', circlet: 'ATK% or CRIT' }, targetSubs: ["ATK%", "Energy Recharge", "CRIT Rate", "CRIT DMG"], targetWeapon: "Favonius Sword (owned)", gearSource: "unresearched: his shield and Offensive Directive both scale on his ATK", verified: '2026-11-16' },
  { name: 'Iansan', element: 'Electro', weaponType: 'Polearm', rarity: 4, level: 1, constellation: null, owned: true, fieldRole: 'off-field', teams: [], tier: 1, paidIn: 'levels', targetSet: 'Scroll of the Hero of Cinder City', setProgress: 'none', targetMains: { sands: 'ATK% or Energy Recharge', goblet: 'ATK%', circlet: 'ATK%' }, targetSubs: ['Energy Recharge', 'ATK%', 'ATK'], targetWeapon: "Prototype Starglitter: Kachina's copy (Escoffier keeps hers; Fearless forbids one copy in two battlefields). ER substat for her 70-Energy Burst; Kitain Cross Spear and Dragon's Bane are EM, which her ATK-based buff ignores", gearSource: "wiki (22 Nov): her Burst gives the active character 27% of her ATK at 42+ Nightsoul points, capped by Burst level (610 at Lv 8); Cinder City 4pc +12%/+40% Electro and Hydro on Electro-Charged, 2pc +6 Energy per Nightsoul Burst. Every Natlan Tribal Secret Space holds a full 5-star Cinder City set (artifact-troves).", note: 'Pulled 22 Nov; level and constellation not read yet (level 1 assumed for a fresh pull). Candidate for the Varesa team in Charlotte’s slot: ATK buff from her Burst, heals the active character for 60% of her ATK after a Nightsoul Burst (A4), Electro energy, and no Cryo to Freeze with Furina. Her buff reads her ATK, so levels and Burst talent are what she is paid in.', verified: '2026-11-22' },
  { name: 'Dahlia', element: 'Hydro', weaponType: 'Sword', rarity: 4, level: 60, constellation: null, owned: true, teams: [], tier: null, verified: '2026-11-12' },
  { name: 'Fischl', element: 'Electro', weaponType: 'Bow', rarity: 4, level: 60, constellation: null, owned: true, fieldRole: 'off-field', teams: [], tier: null, page: 'fischl-build.html', verified: '2026-11-12' },
  { name: 'Lisa', element: 'Electro', weaponType: 'Catalyst', rarity: 4, level: 60, constellation: null, owned: true, teams: [], tier: null, verified: '2026-11-12' },
  { name: 'Charlotte', element: 'Cryo', weaponType: 'Catalyst', level: 50, constellation: null, owned: true, teams: ['varesa'], tier: 2, unresearched: true, targetSet: 'Noblesse Oblige', setProgress: 'none', targetMains: { sands: 'ER%', goblet: 'ATK%', circlet: 'Healing Bonus or ATK%' }, note: 'Back in the Varesa team as healer (14 Nov, in-game). Burst heals the party to max Furina’s Fanfare; Noblesse Oblige gives Varesa +20% ATK. Her Cryo meets Furina’s Hydro as Freeze, which competes with Electro-Charged.', page: 'charlotte-build.html', targetSubs: ["ATK%", "Energy Recharge", "ATK"], targetWeapon: "Thrilling Tales of Dragon Slayers R5 (owned; +48% ATK to Varesa)", gearSource: "charlotte-build.html: her healing scales on ATK only", verified: '2026-11-14' },
  { name: 'Chongyun', element: 'Cryo', weaponType: 'Claymore', rarity: 4, level: 40, constellation: null, owned: true, teams: [], tier: null, verified: '2026-11-12' },
  { name: 'Noelle', element: 'Geo', weaponType: 'Claymore', rarity: 4, level: 40, constellation: null, owned: true, teams: [], tier: null, verified: '2026-11-12' },
  { name: 'Amber', element: 'Pyro', weaponType: 'Bow', rarity: 4, level: 40, constellation: null, owned: true, teams: [], tier: null, verified: '2026-11-12' },
  { name: 'Kaeya', element: 'Cryo', weaponType: 'Sword', rarity: 4, level: 32, constellation: null, owned: true, teams: [], tier: null, verified: '2026-11-12' },
  { name: 'Manekin', element: 'None', weaponType: 'Sword', rarity: 5, level: 20, constellation: null, owned: true, teams: [], tier: null, verified: '2026-11-12' },
  { name: 'Manekina', element: 'None', weaponType: 'Sword', rarity: 5, level: 20, constellation: null, owned: true, teams: [], tier: null, verified: '2026-11-12' },
  { name: 'Keqing', element: 'Electro', weaponType: 'Sword', level: 20, constellation: null, owned: true, teams: [], tier: null, unresearched: true, verified: '2026-11-12' },
  { name: 'Lynette', element: 'Anemo', weaponType: 'Sword', rarity: 4, level: 20, constellation: null, owned: true, teams: [], tier: null, verified: '2026-11-12' },
  { name: 'Candace', element: 'Hydro', weaponType: 'Polearm', rarity: 4, level: 20, constellation: null, owned: true, teams: [], tier: null, verified: '2026-11-12' },
  { name: 'Collei', element: 'Dendro', weaponType: 'Bow', rarity: 4, level: 20, constellation: null, owned: true, teams: [], tier: null, verified: '2026-11-12' },
  { name: 'Beidou', element: 'Electro', weaponType: 'Claymore', rarity: 4, level: 20, constellation: null, owned: true, teams: [], tier: null, verified: '2026-11-12' },
  { name: 'Razor', element: 'Electro', weaponType: 'Claymore', rarity: 4, level: 20, constellation: null, owned: true, teams: [], tier: null, verified: '2026-11-12' },
  { name: 'Prune', element: 'Anemo', weaponType: 'Catalyst', level: 12, constellation: null, owned: true, teams: [], tier: null, verified: '2026-11-12' },
  { name: 'Sayu', element: 'Anemo', weaponType: 'Claymore', level: 1, constellation: null, owned: true, teams: [], tier: null, unresearched: true, verified: '2026-11-12' },
];

/** Profiles with HoYoLAB's facts laid over them — see live.ts. */
export const characters: Character[] = mergeLive(profiles);


export const byName = (name: string): Character | undefined =>
  characters.find((c) => c.name.toLowerCase() === name.toLowerCase());

export const owned = characters.filter((c) => c.owned);
export const unresearched = characters.filter((c) => c.unresearched);
export const inATeam = characters.filter((c) => c.teams.length > 0);
