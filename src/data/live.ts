/**
 * The game's own record of each character, read from HoYoLAB, laid over the
 * hand-written profiles in characters.ts.
 *
 * Split of responsibility:
 *   live (this file)  FACTS   level, constellation, talents, weapon, every
 *                              artifact piece, combat stats
 *   characters.ts     DECISIONS teams, tier, target set and main stats, notes
 *
 * Refreshing is a re-export from HoYoLAB into the JSON below, not a hand edit.
 * The JSON is written by the Battle Chronicle extract (see
 * reference/data/hoyolab-roster-*.json).
 */

import roster from '../../reference/data/hoyolab-roster-2026-11-14.json';
import type { Character, EquippedArtifact, EquippedWeapon, Slot, Stats } from './types';

interface LiveCharacter {
  n: string;
  el: string;
  lv: number;
  r: 4 | 5;
  c: number;
  /** [name, level, refinement, rarity, main stat, substat] */
  w: [string, number, number, number, string, string] | null;
  /** [slot, set, piece, rarity, level, main stat, substats] */
  a: [string, string, string, number, number, string, string][];
  sets: Record<string, number>;
  /** Normal attack / skill / burst levels, in that order. */
  sk: number[];
  st: Record<string, string>;
}

const READ_AT = roster.readAt.slice(0, 10);
// External data enters here. JSON arrays cannot infer as tuples, so this is
// the one deliberate cast; the extract script is what guarantees the shape.
// HoYoLAB writes some labels with a non-breaking space ("CRIT Rate"),
// which silently misses any lookup by "CRIT Rate". Normalise once, here.
const clean = <T,>(v: T): T => JSON.parse(JSON.stringify(v).replace(/ /g, ' ')) as T;
const live = new Map(clean(roster.characters as unknown as LiveCharacter[]).map((c) => [c.n, c]));

/**
 * Normal attack / skill / burst. A few kits list a fourth, alternate-sprint
 * talent third (Mona's Illusory Torrent); drop it so burst stays last.
 */
const talentLevels = (sk: number[]) => (sk.length === 4 ? [sk[0], sk[1], sk[3]] : sk);

const SLOT: Record<string, Slot> = {
  Flower: 'Flower', Plume: 'Plume', Sands: 'Sands', Goblet: 'Goblet', Circlet: 'Circlet',
};

/** "CRIT DMG 55.1%" -> ["CRIT DMG", "55.1%"]: the value is the last token. */
function splitStat(s: string): [string, string] {
  const i = s.lastIndexOf(' ');
  return i === -1 ? [s, ''] : [s.slice(0, i), s.slice(i + 1)];
}

function weapon(w: LiveCharacter['w']): EquippedWeapon | undefined {
  if (!w) return undefined;
  const [substat, substatValue] = splitStat(w[5] || '');
  return { name: w[0], level: w[1], refinement: w[2], substat: substat || undefined,
           substatValue: substatValue || undefined };
}

function artifacts(c: LiveCharacter): EquippedArtifact[] {
  return c.a.map(([slot, set, piece, rarity, level, main, subs]) => ({
    slot: SLOT[slot] ?? (slot as Slot),
    set, piece, rarity, level, main, subs,
    // Off-set: its set has fewer than two pieces on, so it adds no bonus.
    offSet: (c.sets[set] ?? 0) < 2,
  }));
}

function stats(st: Record<string, string>): Stats {
  const n = (k: string) => (st[k] ? Number(st[k].replace(/[^\d.]/g, '')) : undefined);
  const dmgBonus = Object.entries(st).find(([k]) => /DMG Bonus$/.test(k) && k !== 'Healing Bonus');
  return {
    maxHp: n('Max HP'), atk: n('ATK'), def: n('DEF'), em: n('Elemental Mastery'),
    critRate: st['CRIT Rate'], critDmg: st['CRIT DMG'], energyRecharge: st['Energy Recharge'],
    elementalDmgBonus: dmgBonus?.[1],
  };
}

/** The 4-piece set this character has active, if any. */
export function activeSet(c: Pick<Character, 'artifacts'>): string | undefined {
  const counts: Record<string, number> = {};
  (c.artifacts ?? []).forEach((a) => { counts[a.set] = (counts[a.set] ?? 0) + 1; });
  return Object.entries(counts).find(([, n]) => n >= 4)?.[0];
}

/** Profiles with the game's facts laid over them. Live wins on every fact. */
export function mergeLive(profiles: Character[]): Character[] {
  return profiles.map((p) => {
    const l = live.get(p.name);
    if (!l) return p;
    const merged: Character = {
      ...p,
      level: l.lv,
      rarity: l.r,
      constellation: l.c,
      talents: talentLevels(l.sk),
      weapon: weapon(l.w),
      artifacts: artifacts(l),
      stats: stats(l.st),
      verified: READ_AT,
    };
    if (p.targetSet) {
      // Targets are written as "A or B", sometimes with "(BiS)" notes.
      const options = p.targetSet.split(/\s+or\s+/).map((s) => s.replace(/\s*\(.*?\)\s*/g, '').trim());
      const on = Math.max(0, ...options.map((s) => l.sets[s] ?? 0));
      merged.setProgress = on >= 4 ? 'complete' : on > 0 ? 'partial' : 'none';
    }
    return merged;
  });
}

export const liveReadAt = READ_AT;
