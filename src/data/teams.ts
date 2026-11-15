import type { Team } from './types';

/**
 * The teams that actually get played, and what each can break.
 * Ward coefficients are from the wiki's Ward page; see enemy-coverage.html.
 */
export const teams: Team[] = [
  {
    id: 'skirk',
    priority: 1,
    name: 'Skirk freeze',
    element: 'Cryo',
    members: [
      { character: 'Skirk', role: 'main-dps', set: 'Finale of the Deep Galleries' },
      { character: 'Mona', role: 'enabler', set: 'Tenacity of the Millelith' },
      { character: 'Escoffier', role: 'heal', set: 'Golden Troupe' },
      { character: 'Mika', role: 'sustain', set: 'Noblesse Oblige' },
    ],
    breaks: ['Pyro x2', 'Hydro x1', 'Electro x1'],
    cannotBreak: ['Cryo / Frozen', 'Geo', 'Dendro'],
    note: 'Mona Hydro onto Escoffier Cryo makes Frozen on repeat, which is what spawns Skirk’s Void Rifts. Rosaria beats Mika here on paper and loses on levels. Sets (14 Nov, via Google AI): only Mika holds Noblesse Oblige — two copies do not stack, and Mona carried a second one. Mona moves to Tenacity of the Millelith (her Skill ticks trigger it) or Scroll; Escoffier to Golden Troupe for her off-field damage. Farm Denouement of Sin: Golden Troupe there serves Escoffier and Furina at once.',
    page: 'teams.html',
  },
  {
    id: 'mizuki',
    priority: 2,
    name: 'Mizuki Stellar Swirl',
    element: 'Anemo',
    members: [
      { character: 'Yumemizuki Mizuki', role: 'main-dps', set: 'Gilded Dreams or 2pc/2pc EM' },
      { character: 'Traveler', role: 'enabler' },
      { character: 'Rosaria', role: 'support-dps' },
      { character: 'Valeriy', role: 'sustain' },
    ],
    breaks: ['Pyro x1', 'Hydro x1', 'Electro x1', 'Cryo / Frozen x1', 'Dendro x1'],
    cannotBreak: ['Geo'],
    note: 'NOT WORKING YET (15 Nov): Mizuki’s damage talent Vast Be the Dream is locked. It needs her at Lv 70 (she is 60), then the quests Revelations by Chance and Witch’s Revelation: Instruction Beyond Dreams (Court of Fontaine). Until then the team does plain Swirl damage. Valeriy replaced Barbara on 15 Nov: his C2 gives the party +100 EM for 18s on a 10s Skill, so it is always up, and Mizuki’s payload is 10× EM. His shield covers interruption; her Burst heals. His Electro meets the Cryo as Superconduct only on his casts, far less often than Fischl’s Oz. Not yet confirmed by an in-game clear-time test (research/14).',
    page: 'mizuki-build.html',
  },
  {
    id: 'varesa',
    priority: 1,
    name: 'Varesa Electro-Charged',
    element: 'Electro',
    members: [
      { character: 'Varesa', role: 'main-dps', set: "Long Night's Oath or Obsidian Codex" },
      { character: 'Furina', role: 'support-dps', set: 'Golden Troupe' },
      { character: 'Charlotte', role: 'heal', set: 'Noblesse Oblige' },
      { character: 'Sucrose', role: 'support-dps', set: 'Viridescent Venerer' },
    ],
    breaks: ['Pyro x2', 'Cryo x1', 'Geo x2', 'Dendro x1', 'Hydro DoT', 'Electro DoT'],
    cannotBreak: [],
    note: 'The specialist. As played, 14 Nov (in-game screenshot): Varesa 90, Charlotte 50, Furina 40, Sucrose 50. Charlotte replaced Kachina, who is not built. Charlotte heals to max Furina’s Fanfare and carries Noblesse Oblige for +20% ATK on Varesa. Trade-off on record: her Cryo meets Furina’s Hydro as Freeze, which competes with Electro-Charged. Breaks list not yet re-derived for this lineup.',
    page: 'teams.html',
  },
];

export const teamById = (id: string): Team | undefined =>
  teams.find((t) => t.id === id);
