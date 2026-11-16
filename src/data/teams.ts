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
    rotation: [
      { who: 'Escoffier', does: 'Skill: off-field Cryo; her passive shreds Cryo and Hydro RES. Burst when it is ready, for healing.' },
      { who: 'Mona', does: 'Skill, then Burst: Omen makes enemies take more damage. Her Hydro on Escoffier’s Cryo makes Frozen, which spawns Skirk’s Void Rifts.' },
      { who: 'Mika', does: 'Skill: party ATK speed. Each teammate who lands a hit gives Skirk a Death’s Crossing stack (3 stacks, 20s each).' },
      { who: 'Skirk', does: 'Tap Skill to enter Seven-Phase Flash (+45 Serpent’s Subtlety, 12.5s).' },
      { who: 'Skirk', does: 'N5D on repeat: five Normal Attacks, then a dash. This is the damage.' },
      { who: 'Skirk', does: 'Weave Charged Attacks to absorb Void Rifts: +8 Serpent’s Subtlety each, and the state lasts longer.' },
      { who: 'Skirk', does: 'Havoc: Extinction (her Burst inside the state): costs no Serpent’s Subtlety and buffs the next 10 Normal Attacks.' },
    ],
    rotationNote: 'From skirk-build.html (rotation section), with this team’s supports in front. Split option: Hold Skill → Burst first (aim for ~61 Serpent’s Subtlety), swap out to the supports, then come back for Tap Skill and N5D.',
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
    rotation: [
      { who: 'Sucrose', does: 'Skill: shares 20% of her EM with the party; Instructor adds +120 party EM after the reaction.' },
      { who: 'Traveler (Cryo)', does: 'Skill: Cryo on the enemy. Stellar Swirl only exists because he is in the party. From the 2nd rotation also Burst + charged attack; skip both on the first.' },
      { who: 'Rosaria', does: 'Skill, then Burst: the Ice Lance keeps off-field Cryo up for 12s (her C2), so Mizuki always has Cryo to swirl.' },
      { who: 'Sucrose', does: 'Burst every OTHER rotation: it refreshes her EM share each time it hits.' },
      { who: 'Mizuki', does: 'Skill, and stay on field. With Sucrose’s Burst up, take 4 nukes; without it, take 3 and swap out.' },
      { who: 'Mizuki', does: 'Pull-out tech: as her 3rd shot lands, dash out of her Skill range and straight back. That moves a nuke earlier. Then time her Burst between shots 10 and 11, so the 4th nuke lands on shot 11.' },
    ],
    rotationNote: 'Zajef77, “The Ultimate Mizuki Guide (Part 1)”, 1:15:19 and 1:26:11 (Sucrose team rotations). His team runs Odette in Rosaria’s slot. He wants Sucrose on Sacrificial Fragments for the extra Skill; on Fruit of Fulfillment you will sometimes Burst instead of Skill. Two rotation shapes alternate: A = Sucrose Burst, 4 nukes; B = Sucrose Skill only, 3 nukes.',
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
    rotation: [
      { who: 'Varesa', does: 'First rotation only: one Skill → Charged Attack → Plunge (ECP), then swap out. This banks Nightsoul points before the buffs land.' },
      { who: 'Furina', does: 'Skill (Salon members), then Burst (Fanfare: party DMG buff that grows with HP changes).' },
      { who: 'Valeriy', does: 'Skill: shield. Burst when ready: at C6 its shells deal double damage, and enemies they hit take +10% Electro CRIT Rate for 7s.' },
      { who: 'Charlotte', does: 'Burst: party heal, Noblesse +20% ATK, and a healing field. Swap to Varesa right after: Thrilling Tales gives the next character +48% ATK.' },
      { who: 'Varesa', does: 'The loop inside Charlotte’s field: ECP (short Burst if 30 energy) · ECP · ECP (short Burst).' },
      { who: 'Varesa', does: 'Finish with Charged Attack → Plunge twice, no Skill. Her next rotation then starts with an enhanced Skill.' },
    ],
    rotationNote: 'Varesa’s loop is from varesa-build.html (Rotation at C0); the support order is set for this line-up, so that Charlotte is last and Thrilling Tales goes to Varesa. Valeriy wears Tenacity of the Millelith, whose +20% ATK lasts only 3s after his Skill hits, so most of it is over before Varesa’s loop. His value here is the shield and his C6 crit debuff.',
    page: 'teams.html',
  },
];

export const teamById = (id: string): Team | undefined =>
  teams.find((t) => t.id === id);
