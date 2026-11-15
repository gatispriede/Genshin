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
    note: 'Max level, wearing all five pieces of Long Night’s Oath (4-piece bonus active). Corrected 14 Nov from HoYoLAB: earlier notes read the five piece names as five sets and concluded she had no set bonus. Still true: the goblet is ATK%, so Electro DMG Bonus is 0.0% — an Electro goblet is the biggest single gain.',
    page: 'varesa-build.html', verified: '2026-11-12',
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
    targetSet: 'Gilded Dreams, or 2pc/2pc EM',
    note: 'Stellar Swirl carry. 4pc Viridescent Venerer is already live. 8.9% CRIT Rate is the gap - her payload crits.',
    page: 'mizuki-build.html', verified: '2026-11-12',
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
    page: 'furina-build.html', verified: '2026-11-12',
  },
  {
    name: 'Skirk', element: 'Cryo', weaponType: 'Sword', rarity: 5, level: 90,
    constellation: 0, owned: true, fieldRole: 'on-field', teams: ['skirk'], tier: null,
    paidIn: 'gear', targetMains: { sands: 'ATK%', goblet: 'Cryo DMG or ATK%', circlet: 'CRIT' }, // skirk-build.html
    targetSet: 'Finale of the Deep Galleries',
    note: 'Max level. Needs Cryo reactions nearby to spawn Void Rifts for her ATK stacks.',
    page: 'skirk-build.html', verified: '2026-11-12',
  },
  {
    name: 'Escoffier', element: 'Cryo', weaponType: 'Polearm', rarity: 5, level: 70,
    constellation: 0, owned: true, fieldRole: 'off-field', teams: ['skirk'], tier: 3,
    paidIn: 'talents', targetSet: 'Golden Troupe', setProgress: 'partial',
    targetMains: { sands: 'ATK%', goblet: 'Cryo DMG%', circlet: 'CRIT' },
    note: 'Cryo RES shred is talent-scaled, so books beat levels.',
    page: 'escoffier-build.html', verified: '2026-11-12',
  },
  {
    name: 'Mona', element: 'Hydro', weaponType: 'Catalyst', level: 57,
    constellation: null, owned: true, teams: ['skirk'], tier: 2, paidIn: 'gear',
    targetSet: 'Tenacity of the Millelith', setProgress: 'partial',
    targetMains: { sands: 'ER%', goblet: 'Hydro DMG% or ATK%', circlet: 'CRIT or HP%' }, unresearched: true,
    note: 'Wants 200%+ ER and Thrilling Tales of the Dragon Slayers to pass ATK to Skirk.',
    verified: '2026-11-12',
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
    verified: '2026-11-12',
  },
  {
    name: 'Traveler', element: 'Cryo', weaponType: 'Sword', rarity: 5, level: 40,
    constellation: null, owned: true, teams: ['mizuki'], tier: 1, paidIn: 'gear',
    note: 'Cryo form is the only Stellar Jubilee passive owned - it converts Cryo Swirl into Stellar Swirl. His own damage is level-independent, so level him only to survive.',
    verified: '2026-11-12',
  },
  {
    name: 'Kachina', element: 'Geo', weaponType: 'Polearm', rarity: 4, level: 50,
    constellation: null, owned: true, fieldRole: 'off-field', teams: [], tier: null,
    paidIn: 'gear', targetSet: 'Scroll of the Hero of Cinder City',
    note: 'Not built — no levels or artifacts worth fielding; used for exploring only (14 Nov). Was the Varesa team enabler on paper; Charlotte has the slot.',
    verified: '2026-11-12',
  },
  {
    name: 'Sucrose', element: 'Anemo', weaponType: 'Catalyst', rarity: 4, level: 50,
    constellation: null, owned: true, fieldRole: 'off-field', teams: ['varesa'], tier: 3,
    paidIn: 'gear', targetSet: 'Viridescent Venerer', setProgress: 'partial',
    // EM in all three slots, per sucrose-build.html.
    targetMains: { sands: 'Elemental Mastery', goblet: 'Elemental Mastery', circlet: 'Elemental Mastery' },
    note: 'Mollis Favonius gives the party 20% of her EM. That is a gear number, not a level one.',
    page: 'sucrose-build.html', verified: '2026-11-12',
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
    note: 'Likely replaced by Rosaria once she is levelled.', verified: '2026-11-12',
  },
  {
    name: 'Bennett', element: 'Pyro', weaponType: 'Sword', rarity: 4, level: 0,
    constellation: null, owned: false, teams: [], tier: 1, paidIn: 'levels',
    targetSet: 'Noblesse Oblige',
    note: 'Not owned yet. His ATK buff is a share of Base ATK, so levels raise the buff. C6 Pyro-infuses swords and would overwrite Skirk.',
  },

  { name: 'Tighnari', element: 'Dendro', weaponType: 'Bow', rarity: 5, level: 70, constellation: null, owned: true, teams: [], tier: null, note: 'Only levelled Dendro. Dendro breaks Hydro wards at x2 where the teams manage x1.', page: 'tighnari-build.html', verified: '2026-11-12' },
  { name: 'Alyosha', element: 'Electro', weaponType: 'Polearm', rarity: 4, level: 60, constellation: null, owned: true, teams: [], tier: null, verified: '2026-11-12' },
  { name: 'Valeriy', element: 'Electro', weaponType: 'Sword', rarity: 4, level: 60, constellation: null, owned: true, fieldRole: 'off-field', teams: ['mizuki'], tier: 3, paidIn: 'levels', note: 'Mizuki team from 15 Nov. C6 on the account: his C2 gives the party +100 EM for 18s after his Skill (10s cooldown), so it never drops. Swap in, Skill, swap out. Levels only grow his shield.', verified: '2026-11-15' },
  { name: 'Dahlia', element: 'Hydro', weaponType: 'Sword', rarity: 4, level: 60, constellation: null, owned: true, teams: [], tier: null, verified: '2026-11-12' },
  { name: 'Fischl', element: 'Electro', weaponType: 'Bow', rarity: 4, level: 60, constellation: null, owned: true, fieldRole: 'off-field', teams: [], tier: null, page: 'fischl-build.html', verified: '2026-11-12' },
  { name: 'Lisa', element: 'Electro', weaponType: 'Catalyst', rarity: 4, level: 60, constellation: null, owned: true, teams: [], tier: null, verified: '2026-11-12' },
  { name: 'Charlotte', element: 'Cryo', weaponType: 'Catalyst', level: 50, constellation: null, owned: true, teams: ['varesa'], tier: 2, unresearched: true, targetSet: 'Noblesse Oblige', setProgress: 'none', targetMains: { sands: 'ER%', goblet: 'ATK%', circlet: 'Healing Bonus or ATK%' }, note: 'Back in the Varesa team as healer (14 Nov, in-game). Burst heals the party to max Furina’s Fanfare; Noblesse Oblige gives Varesa +20% ATK. Her Cryo meets Furina’s Hydro as Freeze, which competes with Electro-Charged.', verified: '2026-11-14' },
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
