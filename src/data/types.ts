/** Shared vocabulary for the account data. Nothing here is page-specific. */

export type Element =
  | 'Pyro' | 'Hydro' | 'Electro' | 'Cryo' | 'Anemo' | 'Geo' | 'Dendro' | 'None';

export type WeaponType = 'Sword' | 'Claymore' | 'Polearm' | 'Bow' | 'Catalyst';

export type Slot = 'Flower' | 'Plume' | 'Sands' | 'Goblet' | 'Circlet';

/** The game's own on-field / off-field tag, not an opinion. */
export type FieldRole = 'on-field' | 'off-field';

/** What a character does in a team. */
export type TeamRole = 'main-dps' | 'support-dps' | 'heal' | 'sustain' | 'enabler';

/** Which currency actually improves this character — see character-roadmap.html. */
export type PaidIn = 'levels' | 'talents' | 'gear';

export interface EquippedWeapon {
  name: string;
  level: number;
  refinement?: number;
  substat?: string;
  substatValue?: string;
}

export interface EquippedArtifact {
  slot: Slot;
  set: string;
  level: number;
  main: string;
  /** Piece name, e.g. "Lightkeeper's Pledge" — not the set name. */
  piece?: string;
  rarity?: number;
  /** Substats as read from the game, e.g. "CRIT Rate 8.7%(3), ATK 16". */
  subs?: string;
  /** true when this piece belongs to no active set bonus */
  offSet?: boolean;
}

export interface Stats {
  maxHp?: number;
  atk?: number;
  def?: number;
  em?: number;
  critRate?: string;
  critDmg?: string;
  energyRecharge?: string;
  elementalDmgBonus?: string;
}

/** How far a character's target 4-piece set has been collected. */
export type SetProgress = 'none' | 'partial' | 'complete';

/** Target main stats; alternatives are written as 'A or B'. */
export interface TargetMains {
  sands: string;
  goblet: string;
  circlet: string;
}

export interface Character {
  name: string;
  element: Element;
  weaponType?: WeaponType;
  rarity?: 4 | 5;
  level: number;
  /** null = not verified. Every 5-star on this account is C0. */
  constellation: number | null;
  owned: boolean;
  fieldRole?: FieldRole;
  weapon?: EquippedWeapon;
  artifacts?: EquippedArtifact[];
  stats?: Stats;
  /** Normal attack / skill / burst talent levels, from the game. */
  talents?: number[];
  /** Team ids this character is currently fielded in. */
  teams: string[];
  /** Roadmap tier: 1 = do now, 3 = leave alone, null = not in a team. */
  tier: 1 | 2 | 3 | null;
  paidIn?: PaidIn;
  targetSet?: string;
  /** How much of targetSet is equipped: none, some pieces, or the full 4-piece. */
  setProgress?: SetProgress;
  /** Main stats to aim for on the three variable slots. */
  targetMains?: TargetMains;
  /** Never looked up — flagged in reference/research-coverage.md. */
  unresearched?: boolean;
  note?: string;
  /** Page that holds the full write-up, if one exists. */
  page?: string;
  /** When the data above was last read from the game. */
  verified?: string;
}

export interface TeamMember {
  character: string;
  role: TeamRole;
  set?: string;
}

export interface Team {
  id: string;
  /** Investment order, 1 first. Roadmaps sort by it. */
  priority?: number;
  name: string;
  element: Element;
  members: TeamMember[];
  /** Ward elements this team can break, and how fast. */
  breaks: string[];
  cannotBreak: string[];
  note?: string;
  page?: string;
}
