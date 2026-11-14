import type { Team } from './types';

/**
 * The teams that actually get played, and what each can break.
 * Ward coefficients are from the wiki's Ward page; see enemy-coverage.html.
 */
export const teams: Team[] = [
  {
    id: 'skirk',
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
    name: 'Mizuki Stellar Swirl',
    element: 'Anemo',
    members: [
      { character: 'Yumemizuki Mizuki', role: 'main-dps', set: 'Gilded Dreams or 2pc/2pc EM' },
      { character: 'Traveler', role: 'enabler' },
      { character: 'Rosaria', role: 'support-dps' },
      { character: 'Barbara', role: 'heal' },
    ],
    breaks: ['Pyro x2', 'Hydro x1', 'Electro x1'],
    cannotBreak: ['Cryo / Frozen', 'Geo', 'Dendro'],
    note: 'Identical ward profile to the Skirk team — Anemo is 0.5 against everything, so it adds nothing to shields.',
    page: 'mizuki-build.html',
  },
  {
    id: 'varesa',
    name: 'Varesa Electro-Charged',
    element: 'Electro',
    members: [
      { character: 'Varesa', role: 'main-dps', set: "Long Night's Oath or Obsidian Codex" },
      { character: 'Furina', role: 'support-dps', set: 'Golden Troupe' },
      { character: 'Kachina', role: 'enabler', set: 'Scroll of the Hero of Cinder City' },
      { character: 'Sucrose', role: 'support-dps', set: 'Viridescent Venerer' },
    ],
    breaks: ['Pyro x2', 'Cryo x1', 'Geo x2', 'Dendro x1', 'Hydro DoT', 'Electro DoT'],
    cannotBreak: [],
    note: 'The specialist. The only team that can touch a Cryo, Geo or Dendro ward at all. Charlotte was swapped out — her Cryo froze targets and shut off Electro-Charged.',
    page: 'teams.html',
  },
  {
    id: 'pyro',
    name: 'Pyro core (planned)',
    element: 'Pyro',
    members: [
      { character: 'Bennett', role: 'heal', set: 'Noblesse Oblige' },
      { character: 'Xiangling', role: 'support-dps' },
    ],
    breaks: ['Cryo / Frozen x2', 'Geo x2', 'Dendro DoT'],
    cannotBreak: ['Pyro'],
    note: 'The missing fourth ward profile. Needs Bennett, and Xiangling levelled from 40.',
    page: 'enemy-coverage.html',
  },
];

export const teamById = (id: string): Team | undefined =>
  teams.find((t) => t.id === id);
