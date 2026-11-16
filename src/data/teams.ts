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
      { character: 'Yumemizuki Mizuki', role: 'main-dps', set: 'Viridescent Venerer' },
      { character: 'Traveler', role: 'enabler' },
      { character: 'Rosaria', role: 'support-dps' },
      { character: 'Sucrose', role: 'support-dps', set: 'Instructor' },
    ],
    breaks: ['Hydro x1', 'Electro x1', 'Pyro x0.5'],
    cannotBreak: ['Cryo / Frozen', 'Geo', 'Dendro'],
    note: 'As played from 16 Nov (in-game screenshot): Mizuki 70, Traveler 40, Rosaria 20, Sucrose 50. Vast Be the Dream unlocked 16 Nov: ~23k hits often, ~65k crits. Sucrose is a second Anemo who swirls Cryo too (keeps Radiance up) and shares 20% of her EM; Valeriy moved to the Varesa team because his Electro ate the Cryo here. Two 4pc VV do not stack: VV stays on Mizuki, Sucrose goes to 4pc Instructor (party +120 EM). Shields: Cryo only now, plus Anemo at 0.5.',
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
      { character: 'Valeriy', role: 'sustain' },
    ],
    breaks: ['Pyro x2', 'Cryo x1', 'Hydro x1', 'Electro x1', 'Dendro x1'],
    cannotBreak: [],
    note: 'The specialist. As played from 16 Nov (in-game screenshot): Varesa 90, Charlotte 60, Furina 60, Valeriy 60, hitting ~60k. Valeriy (C6) replaced Sucrose: his Offensive Directive adds to the on-field Electro hits and his C6 gives +10% Electro CRIT Rate on enemies he hits, against the loss of Sucrose’s -40% Electro RES. Earlier, 14 Nov: Varesa 90, Charlotte 50, Furina 40, Sucrose 50. Charlotte replaced Kachina, who is not built. Charlotte heals to max Furina’s Fanfare and carries Noblesse Oblige for +20% ATK on Varesa. Trade-off on record: her Cryo meets Furina’s Hydro as Freeze, which competes with Electro-Charged. Breaks list not yet re-derived for this lineup.',
    page: 'teams.html',
  },
];

export const teamById = (id: string): Team | undefined =>
  teams.find((t) => t.id === id);
