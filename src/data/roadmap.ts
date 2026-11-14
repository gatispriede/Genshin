/**
 * Roadmaps computed from the live roster — nothing here is hand-written.
 *
 *   artifactRoadmap  per fielded character, every gap between what is
 *                    equipped and the target set / main stats in characters.ts
 *   characterRoadmap per fielded character, the next level, talent and weapon
 *                    step, steered by the profile's `paidIn`
 *
 * Both re-run on every HoYoLAB refresh, so they cannot go stale the way the
 * hand-written character-roadmap.html did (it told the reader to find
 * Varesa's "missing" Long Night's Oath, which she was wearing).
 */

import { characters } from './characters';
import { teams } from './teams';
import type { Character, EquippedArtifact, Slot } from './types';

/* ------------------------------------------------------------ stat names --- */

/**
 * Canonical form for comparing a main stat as the game reports it
 * ("ATK 46.6%", "Electro DMG Bonus 46.6%") with a target as written
 * ("ATK%", "Electro DMG", "CRIT").
 */
function canon(raw: string): string {
  const s = raw.trim().toLowerCase();
  const pct = /%\s*$/.test(s) || /%/.test(s);
  if (/crit rate/.test(s)) return 'critrate';
  if (/crit dmg/.test(s)) return 'critdmg';
  if (/^crit\b/.test(s)) return 'crit';
  if (/energy recharge|^er%?$/.test(s)) return 'er';
  if (/elemental mastery|^em$/.test(s)) return 'em';
  if (/healing/.test(s)) return 'heal';
  const el = s.match(/(pyro|hydro|electro|cryo|anemo|geo|dendro|physical) dmg/);
  if (el) return `${el[1]}dmg`;
  for (const base of ['atk', 'hp', 'def']) {
    if (s.startsWith(base)) return pct ? `${base}%` : base;
  }
  return s;
}

/** Does the equipped main stat satisfy a target like "Hydro DMG% or ATK%"? */
function mainMatches(equipped: string, target: string): boolean {
  const have = canon(equipped);
  return target.split(/\s+or\s+/i).some((t) => {
    const want = canon(t);
    return want === have || (want === 'crit' && (have === 'critrate' || have === 'critdmg'));
  });
}

/** Target sets are written "A or B", sometimes with "(BiS)" notes. */
const setOptions = (target: string) =>
  target.split(/\s+or\s+|,\s*/i).map((s) => s.replace(/\s*\(.*?\)\s*/g, '').trim()).filter(Boolean);

/* --------------------------------------------------------------- domains --- */

/** Which domain drops each set. Natlan entries are from this project's own map pages. */
export const DOMAIN: Record<string, string> = {
  'Golden Troupe': 'Denouement of Sin',
  'Marechaussee Hunter': 'Denouement of Sin',
  'Viridescent Venerer': 'Valley of Remembrance',
  'Maiden Beloved': 'Valley of Remembrance',
  'Noblesse Oblige': 'Clear Pool and Mountain Cavern',
  'Bloodstained Chivalry': 'Clear Pool and Mountain Cavern',
  'Tenacity of the Millelith': 'Ridge Watch',
  'Pale Flame': 'Ridge Watch',
  'Gilded Dreams': 'Spire of Solitary Enlightenment',
  "Long Night's Oath": 'Derelict Masonry Dock',
  'Finale of the Deep Galleries': 'Derelict Masonry Dock',
  'Obsidian Codex': 'Sanctum of Rainbow Spirits',
  'Scroll of the Hero of Cinder City': 'Sanctum of Rainbow Spirits',
};

/* ------------------------------------------------------- artifact roadmap --- */

export type GapKind = 'set' | 'main' | 'level' | 'rarity';

export interface ArtifactGap {
  kind: GapKind;
  slot?: Slot;
  /** What to do, in one line. */
  action: string;
  /** Higher matters more: a wrong goblet beats an unlevelled flower. */
  weight: number;
  domain?: string;
}

export interface CharacterGaps {
  character: Character;
  team: string;
  gaps: ArtifactGap[];
}

const MAIN_WEIGHT: Partial<Record<Slot, number>> = { Goblet: 3, Sands: 2.5, Circlet: 2.5 };
const MAX_LEVEL = (rarity = 5) => (rarity >= 5 ? 20 : 16);

function gapsFor(c: Character): ArtifactGap[] {
  const gaps: ArtifactGap[] = [];
  const pieces = c.artifacts ?? [];

  if (c.targetSet) {
    const options = setOptions(c.targetSet);
    const counts: Record<string, number> = {};
    pieces.forEach((a) => { counts[a.set] = (counts[a.set] ?? 0) + 1; });
    const best = Math.max(0, ...options.map((o) => counts[o] ?? 0));
    if (best < 4) {
      gaps.push({
        kind: 'set', weight: 4 - best * 0.5,
        action: `${best}/4 pieces of ${options[0]} — collect ${4 - best} more`,
        domain: DOMAIN[options[0]],
      });
    }
  }

  for (const slot of ['Sands', 'Goblet', 'Circlet'] as Slot[]) {
    const target = c.targetMains?.[slot.toLowerCase() as 'sands' | 'goblet' | 'circlet'];
    const piece = pieces.find((a) => a.slot === slot);
    if (!target) continue;
    if (!piece) {
      gaps.push({ kind: 'main', slot, weight: MAIN_WEIGHT[slot] ?? 2,
                  action: `${slot}: empty — want ${target}`, domain: setDomain(c) });
    } else if (!mainMatches(piece.main, target)) {
      gaps.push({ kind: 'main', slot, weight: MAIN_WEIGHT[slot] ?? 2,
                  action: `${slot}: ${piece.main} → want ${target}`, domain: setDomain(c) });
    }
  }

  for (const piece of pieces) {
    const max = MAX_LEVEL(piece.rarity);
    if (piece.level < max) {
      gaps.push({ kind: 'level', slot: piece.slot, weight: 1 + (max - piece.level) / 20,
                  action: `${piece.slot}: level +${piece.level} → +${max}` });
    }
    if ((piece.rarity ?? 5) < 5 && mainMatchesTarget(c, piece)) {
      gaps.push({ kind: 'rarity', slot: piece.slot, weight: 0.5,
                  action: `${piece.slot}: right stat on a ${piece.rarity}★ — replace with a 5★ when one drops` });
    }
  }
  return gaps.sort((a, b) => b.weight - a.weight);
}

function mainMatchesTarget(c: Character, piece: EquippedArtifact): boolean {
  const target = c.targetMains?.[piece.slot.toLowerCase() as 'sands' | 'goblet' | 'circlet'];
  return target ? mainMatches(piece.main, target) : piece.slot === 'Flower' || piece.slot === 'Plume';
}

const setDomain = (c: Character) => (c.targetSet ? DOMAIN[setOptions(c.targetSet)[0]] : undefined);

const tierRank = (c: Character) => c.tier ?? 9;

/**
 * Everyone fielded in a team, biggest artifact payoff first.
 *
 * Ranked by the weight of set and main-stat gaps, with main DPS lifted —
 * not by levelling tier, which is empty for characters already at max level
 * and would bury Varesa's goblet, the largest single gain on the account.
 */
export function artifactRoadmap(): CharacterGaps[] {
  const score = (gaps: ArtifactGap[], role: string) =>
    gaps.filter((g) => g.kind === 'set' || g.kind === 'main').reduce((s, g) => s + g.weight, 0)
    * (role === 'main-dps' ? 2 : 1);
  return fielded()
    .map(({ character, team, role }) => ({ character, team, role, gaps: gapsFor(character) }))
    .sort((a, b) => score(b.gaps, b.role) - score(a.gaps, a.role))
    .map(({ character, team, gaps }) => ({ character, team, gaps }));
}

/** Domains ranked by how many set and main-stat gaps a run there could close. */
export function domainPriority(): { domain: string; gaps: number; who: string[] }[] {
  const by: Record<string, { gaps: number; who: Set<string> }> = {};
  for (const { character, gaps } of artifactRoadmap()) {
    for (const g of gaps) {
      if (!g.domain || (g.kind !== 'set' && g.kind !== 'main')) continue;
      by[g.domain] ??= { gaps: 0, who: new Set() };
      by[g.domain].gaps++;
      by[g.domain].who.add(character.name);
    }
  }
  return Object.entries(by)
    .map(([domain, v]) => ({ domain, gaps: v.gaps, who: [...v.who] }))
    .sort((a, b) => b.gaps - a.gaps);
}

/* ------------------------------------------------------ character roadmap --- */

const CAPS = [20, 40, 50, 60, 70, 80, 90];

export interface CharacterStep {
  character: Character;
  team: string;
  role: string;
  nextLevel: number | null;
  /** The step the profile's paidIn says pays off. */
  next: string;
  warnings: string[];
}

function fielded(): { character: Character; team: string; role: string }[] {
  const out: { character: Character; team: string; role: string }[] = [];
  for (const t of teams) {
    for (const m of t.members) {
      const c = characters.find((x) => x.name === m.character && x.owned);
      // The team's set assignment stands in when the profile records none (Mika).
      if (c) out.push({ character: { ...c, targetSet: c.targetSet ?? m.set }, team: t.name, role: m.role });
    }
  }
  return out.sort((a, b) => tierRank(a.character) - tierRank(b.character)
    || (b.role === 'main-dps' ? 1 : 0) - (a.role === 'main-dps' ? 1 : 0));
}

export function characterRoadmap(): CharacterStep[] {
  return fielded().map(({ character: c, team, role }) => {
    const nextLevel = CAPS.find((cap) => cap > c.level) ?? null;
    const [na, skill, burst] = c.talents ?? [];
    const gapCount = gapsFor(c).filter((g) => g.kind === 'set' || g.kind === 'main').length;

    let next: string;
    if (c.paidIn === 'talents') next = `Talents — skill ${skill ?? '?'}, burst ${burst ?? '?'}: raise the one the team relies on`;
    else if (c.paidIn === 'gear') next = gapCount ? `Artifacts — ${gapCount} set/main-stat gap(s), see artifact roadmap` : 'Artifacts — set and main stats on target; level the pieces';
    else next = nextLevel ? `Ascend to Lv ${nextLevel}` : 'Max level';

    const warnings: string[] = [];
    if (c.weapon && c.weapon.level < c.level - 10) {
      warnings.push(`weapon Lv ${c.weapon.level} trails character Lv ${c.level}`);
    }
    if (role === 'main-dps' && (skill ?? 0) < 6) warnings.push(`main DPS with skill talent ${skill}`);
    if (na !== undefined && role === 'main-dps' && na < 6) warnings.push(`normal attack talent ${na}`);

    return { character: c, team, role, nextLevel, next, warnings };
  });
}
