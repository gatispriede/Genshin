/**
 * Reputation, per region, aimed at one thing: unlocking the Treasure Compass.
 *
 * EXP values are the CURRENT (post-doubling) figures. Many guides still quote
 * the halved numbers — if a source says a 5-star bounty is 100, it is stale.
 *
 * Sources: genshin-impact.fandom.com/wiki/Reputation and /wiki/Bounty,
 * game8.co City Reputation System, cross-checked 2026-10-30.
 */
window.REPUTATION = {
  /* Weekly caps are SHARED across every region and tribe — this is the single
     most important fact on the page. Three bounties and three requests per
     week, total, not per region. */
  weekly: {
    bounties: { count: 3, best: 200, natlanBest: 240, note: 'Shared across all regions' },
    requests: { count: 3, each: 80, note: 'Shared across all regions' },
    resets: 'Monday 04:00 server time'
  },

  oneOff: [
    { what: 'World Quest', exp: 100, note: 'Each, in that region. Natlan tribe quests give 400.' },
    { what: 'Archon Quest', exp: 200, note: 'Each, in that region.' },
    { what: 'Exploration 20% / 40% / 60%', exp: 100, note: 'Each milestone, plus 20,000 Mora.' }
  ],

  regions: [
    {
      name: 'Mondstadt',
      compass: 'Anemo Treasure Compass',
      level: 6,
      maxLevel: 8,
      expToCompass: 2220,
      worldQuests: 22,
      specialty: 'Philanemo Mushroom',
      caveat: 'Does not work in Dragonspine.'
    },
    {
      name: 'Liyue',
      compass: 'Geo Treasure Compass',
      level: 6,
      maxLevel: 8,
      expToCompass: 2220,
      worldQuests: 57,
      specialty: 'Cor Lapis',
      caveat: 'Works in The Chasm: Underground Mines.'
    },
    {
      name: 'Inazuma',
      compass: 'Electro Treasure Compass',
      level: 9,
      maxLevel: 10,
      expToCompass: 5200,
      worldQuests: null,
      specialty: 'Onikabuto',
      caveat: 'Works in Enkanomiya.'
    },
    {
      name: 'Sumeru',
      compass: 'Dendro Treasure Compass',
      level: 9,
      maxLevel: 10,
      expToCompass: 5200,
      worldQuests: null,
      specialty: 'Padisarah',
      caveat: 'Does not work in the Orchard of Pairidaeza. Bounties from Effendi.'
    },
    {
      name: 'Fontaine',
      compass: 'Hydro Treasure Compass',
      level: 9,
      maxLevel: 10,
      expToCompass: 5200,
      worldQuests: null,
      specialty: 'Beryl Conch',
      caveat: 'Works in the Sea of Bygone Eras.'
    },
    {
      name: 'Natlan',
      compass: 'Pyro Treasure Compass',
      level: 4,
      maxLevel: null,
      expToCompass: null,
      worldQuests: null,
      specialty: null,
      tribe: true,
      caveat: 'Tribe Reputation Lv. 4 with three tribes, not a city level. ' +
              'Tribal quests give 400 each and bounties 240, so it climbs fastest.'
    }
  ],

  /* Every compass is a forging blueprint, not a finished item. */
  forging: '10 Golden Raven Insignia + 50 Crystal Chunks + 30 of the region’s local specialty, at any blacksmith.'
};
