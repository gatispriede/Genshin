export interface PageEntry {
  href: string;
  title: string;
  blurb: string;
  /** map | tool | doc - the existing index.html card classes */
  kind: string;
  section: string;
}

/**
 * Every existing static page, generated from index.html so the two cannot
 * drift. These still render as themselves; the React shell frames them and
 * makes them searchable. Pages migrate to components one at a time.
 *
 * Regenerate: python -I tools/build-pages-index.py
 */
export const pages: PageEntry[] = [
  { href: "starfell-valley-guide.html", title: "Starfell Valley", blurb: "Priority spots, chest zones, waypoints \u2014 Mondstadt", kind: "map", section: "Maps" },
  { href: "dragonspine-quest-map.html", title: "Dragonspine \u2014 In the Mountains", blurb: "Route to Peak of Vindagnyr", kind: "map", section: "Maps" },
  { href: "chasm-ore-map.html", title: "The Chasm \u2014 ore", blurb: "Surface belt and the Underground Mines", kind: "map", section: "Maps" },
  { href: "fishing-spots-map.html", title: "Fishing spots", blurb: "Mondstadt and Liyue, best spot per region", kind: "map", section: "Maps" },
  { href: "windcatcher-map.html", title: "Wind Catcher", blurb: "Anemograna charging spots", kind: "map", section: "Maps" },
  { href: "crafting-bench-map.html", title: "Crafting benches", blurb: "Where to make bait and alchemy items", kind: "map", section: "Maps" },
  { href: "fowl-map.html", title: "Fowl", blurb: "Draff in Springvale \u2014 bait ingredient", kind: "map", section: "Maps" },
  { href: "bounty-stormbearer-map.html", title: "Bounty \u2014 Ruin Guard", blurb: "Stormbearer search area", kind: "map", section: "Maps" },
  { href: "redbeet-map.html", title: "Red Beet", blurb: "Everfrozen Earth corridor", kind: "map", section: "Maps" },
  { href: "eye-of-graeae-map.html", title: "Eye of Graeae", blurb: "Three fragment questlines", kind: "map", section: "Maps" },
  { href: "yaodie-valley-map.html", title: "Yaodie Valley", blurb: "Chenyu Vale \u2014 hidden quest cave", kind: "map", section: "Maps" },
  { href: "arsenal-keys.html", title: "The Arsenal \u2014 3 keys", blurb: "Tatarasuna: where each Key to Some Place is, with the wiki's map and close-up", kind: "map", section: "Maps" },
  { href: "vault-of-qingce.html", title: "Vault of Qingce", blurb: "Why the gate is locked", kind: "map", section: "Maps" },
  { href: "chi-of-yore-puzzles.html", title: "Chi of Yore \u2014 statues", blurb: "Both Qingce puzzles", kind: "map", section: "Maps" },
  { href: "wuwang-statue-puzzle.html", title: "Wuwang Hill \u2014 8 statues", blurb: "Diagram with compass", kind: "map", section: "Maps" },
  { href: "theater-picks.html", title: "Theater \u2014 Act 1 picks", blurb: "Which four of the six trial characters, with portraits", kind: "tool", section: "Tools" },
  { href: "liyue-quest-maps.html", title: "Liyue quests \u2014 start maps", blurb: "All 57, shortest first, with the wiki's in-game crop of each start spot", kind: "map", section: "Maps" },
  { href: "inazuma-quest-maps.html", title: "Inazuma quests \u2014 start maps", blurb: "Toward the Electro Treasure Compass", kind: "map", section: "Maps" },
  { href: "sumeru-quest-maps.html", title: "Sumeru quests \u2014 start maps", blurb: "Toward the Dendro Treasure Compass", kind: "map", section: "Maps" },
  { href: "fontaine-quest-maps.html", title: "Fontaine quests \u2014 start maps", blurb: "Toward the Hydro Treasure Compass", kind: "map", section: "Maps" },
  { href: "local-legends.html", title: "Local Legends \u2014 all 36", blurb: "Resinless bosses that respawn daily. Mapped, with the AR 55 catch on the rewards", kind: "map", section: "Maps" },
  { href: "domains.html", title: "Domains \u2014 all 74", blurb: "Every entrance mapped and tickable. One-time clears are fixed Primogems and cost no resin", kind: "map", section: "Maps" },
  { href: "collectible-map.html", title: "Collectible maps", blurb: "Crimson Agate and every oculus, grouped into warps rather than a walking loop. Tick them off as you go", kind: "map", section: "Maps" },
  { href: "quest-map.html", title: "Quest map \u2014 interactive", blurb: "Every reputation quest on the live game map, with teleports. Click a dot for the NPC, length and start screenshot", kind: "map", section: "Maps" },
  { href: "reputation-quests.html", title: "Reputation quests \u2014 all regions", blurb: "Every quest with its start NPC and a measured length. Liyue \u00b7 Inazuma \u00b7 Sumeru \u00b7 Fontaine", kind: "tool", section: "Tools" },
  { href: "liyue-reputation-quests.html", title: "Liyue reputation quests", blurb: "The full list, and the claim step people miss", kind: "tool", section: "Tools" },
  { href: "reputation-compass.html", title: "Treasure Compasses", blurb: "Reputation costs and the fastest route to each", kind: "tool", section: "Tools" },
  { href: "collectibles-status.html", title: "Collectibles status", blurb: "Exploration per region, oculi remaining, what to do next", kind: "tool", section: "Tools" },
  { href: "tcg-skirk.html", title: "TCG \u2014 cards & a Skirk deck", blurb: "How to get cards, what they cost, the deck", kind: "tool", section: "Tools" },
  { href: "build-coverage.html", title: "Build coverage", blurb: "All 23 characters \u2014 who's documented, who isn't", kind: "tool", section: "Tools" },
  { href: "support-squad.html", title: "Support squad", blurb: "Barbara, Mika, Sucrose, Alyosha, Kaeya, Chongyun", kind: "tool", section: "Tools" },
  { href: "talent-farming.html", title: "Talent farming", blurb: "What is open today, who needs it, and why resin is not the thing to fix", kind: "tool", section: "Tools" },
  { href: "stellar.html", title: "Stellar Glimmer", blurb: "Stellar-Conduct and Stellar Swirl, the one passive that enables them, and who you own", kind: "tool", section: "Tools" },
  { href: "theater.html", title: "Imaginarium Theater", blurb: "This season's cast as faces \u2014 who to field on Act 1 and who to keep fresh", kind: "tool", section: "Tools" },
  { href: "character-roadmap.html", title: "Character roadmap", blurb: "Where levels, talent books and Mora go next \u2014 ordered by what the three teams need, and who levels do nothing for", kind: "tool", section: "Tools" },
  { href: "tcg-swap.html", title: "TCG swaps", blurb: "Every switch effect in Genius Invokation, split by whether it pays you or just costs less", kind: "tool", section: "Tools" },
  { href: "codes.html", title: "Redeem codes", blurb: "Dated snapshot, live split from dead, and a tick per code so you know what you have used", kind: "tool", section: "Tools" },
  { href: "sucrose-build.html", title: "Sucrose \u2014 build & materials", blurb: "Elemental Mastery in all three slots, and why. Target stats, 3\u2605/4\u2605 catalysts, artifacts", kind: "tool", section: "Builds" },
  { href: "escoffier-build.html", title: "Escoffier \u2014 build & materials", blurb: "Skirk\u2019s best teammate. Sets and 3\u2605/4\u2605 polearms with icons, and the Skirk material overlap", kind: "tool", section: "Builds" },
  { href: "tighnari-build.html", title: "Tighnari \u2014 build & materials", blurb: "Artifact sets and 3\u2605/4\u2605 bows with icons, plus every ascension material", kind: "tool", section: "Builds" },
  { href: "fischl-build.html", title: "Fischl \u2014 build & rotation", blurb: "Five 3\u2605 pieces and 7.1% crit, and the fix", kind: "tool", section: "Builds" },
  { href: "skirk-build.html", title: "Skirk \u2014 build & rotation", blurb: "Slot by slot, and the team that triples her damage", kind: "tool", section: "Builds" },
  { href: "varesa-build.html", title: "Varesa \u2014 build & rotation", blurb: "Slot by slot, and the ECP loop", kind: "tool", section: "Builds" },
  { href: "enemy-coverage.html", title: "Enemy shields \u2014 what you can't break", blurb: "Wards fall to reactions, not damage. Cryo and Frozen wards need Pyro and no team has any \u2014 the one hole artifacts can't fix", kind: "tool", section: "Tools" },
  { href: "teams.html", title: "The three teams", blurb: "Skirk freeze \u00b7 Mizuki Stellar Swirl \u00b7 Varesa Electro-Charged \u2014 why each works, the set per slot, and the two things you can't have at once", kind: "tool", section: "Tools" },
  { href: "mizuki-build.html", title: "Mizuki \u2014 swirl carry", blurb: "Her passive turns 1,000% of her EM into an ordinary hit that crits, so crit is her real gap. The team, the rotation, and why Hydro is the wrong aura", kind: "tool", section: "Builds" },
  { href: "furina-build.html", title: "Furina \u2014 build & priority", blurb: "Her party buff ignores her level \u2014 so the burst talent is the best investment on the account, 1\u219210 takes it from +21% to +75%", kind: "tool", section: "Builds" },
  { href: "derelict-masonry-dock.html", title: "Derelict Masonry Dock", blurb: "Atocpan \u2014 the artifact domain for Skirk and Varesa", kind: "map", section: "Maps" },
  { href: "exaiphanes-statues-map.html", title: "Snezhnaya statues", blurb: "Five stops that level the Exaiphanes Blade \u2014 free", kind: "map", section: "Maps" },
  { href: "oculus-tracking.html", title: "Oculus tracking", blurb: "What HoYoLAB can and can't tick off for you", kind: "map", section: "Maps" },
  { href: "reaction-combos.html", title: "Reaction combos", blurb: "Element pair picker", kind: "map", section: "Maps" },
  { href: "farming/map.html", title: "Natlan Saurian map", blurb: "All 946 spawns on the real terrain, clustered and routed, with every teleport. For Tyrant\u2019s Fang", kind: "map", section: "Farming" },
  { href: "farming/index.html", title: "Tyrant\u2019s Fang plan", blurb: "How many days of farming are left, crafting ratios and the Lv. 60 gate", kind: "tool", section: "Farming" },
  { href: "farming/routes.html", title: "Natlan routes", blurb: "16 written loops, densest first, each linking to its spot on the map", kind: "tool", section: "Farming" },
  { href: "farming/quests.html", title: "World quest pins", blurb: "All 576 official pins across Teyvat \u2014 unnamed, so use the quest map above for named quests", kind: "map", section: "Farming" },
  { href: "research/01-mora-farming.md", title: "01 \u00b7 Mora farming", blurb: "Blossoms of Wealth, Ley Line Overflow, the Frostbearing Tree's 600,000 Mora", kind: "doc", section: "Research" },
  { href: "research/02-wishes-and-primogems.md", title: "02 \u00b7 Wishes & Primogems", blurb: "What F2P really earns per month, pity maths, pull strategy, why the Frostbearing Tree pays none", kind: "doc", section: "Research" },
  { href: "research/03-character-materials.md", title: "03 \u00b7 Characters & materials", blurb: "Roster, priority, talent domains", kind: "doc", section: "Research" },
  { href: "research/04-weapons-and-artifacts.md", title: "04 \u00b7 Weapons & artifacts", blurb: "Best 3-stars, per-character builds", kind: "doc", section: "Research" },
  { href: "research/05-current-loadouts.md", title: "05 \u00b7 Loadout audit", blurb: "Every equipped piece, per slot \u2014 and the free 5\u2605 sword you're not using. Gear data is 28 Oct, stale", kind: "doc", section: "Research" },
  { href: "research/06-artifact-plan.md", title: "06 \u00b7 Artifact plan", blurb: "AR 51: guaranteed 5\u2605 domains, the Strongbox, and defining a goblet instead of farming for it", kind: "doc", section: "Research" },
  { href: "research/06a-in-the-mountains.md", title: "06a \u00b7 In the Mountains", blurb: "Dragonspine unlock walkthrough", kind: "doc", section: "Research" },
  { href: "research/07-ore-farming.md", title: "07 \u00b7 Ore farming", blurb: "Dense routes near waypoints", kind: "doc", section: "Research" },
  { href: "research/08-snezhnaya-mechanics.md", title: "08 \u00b7 Snezhnaya mechanics", blurb: "Prime Ice Constructs, melting ice, and what the Shadow Realm pays", kind: "doc", section: "Research" },
  { href: "research/09-artifact-sets.md", title: "09 \u00b7 Artifact sets", blurb: "Damage / support / utility, per-character tiers", kind: "doc", section: "Research" },
  { href: "research/10-imaginarium-theater.md", title: "10 \u00b7 Imaginarium Theater", blurb: "Normal Mode: 24 Vigor for 24 slots, nothing can be wasted. Act-by-act teams by role, card priority, blessing path", kind: "doc", section: "Research" },
  { href: "research/10a-theater-normal-run.md", title: "10a \u00b7 Theater \u2014 the Normal run", blurb: "Reached Act 5. The Act 6 boss, where failing the 18s shield timer is what gives you the \u221270% RES window", kind: "doc", section: "Research" },
  { href: "research/11-tactical-sweep.md", title: "11 \u00b7 Tactical Sweep", blurb: "All four stages to 36,000 \u2014 pick for the Morale condition, hold \u221250% RES, and why Mondstadt was locked", kind: "doc", section: "Research" },
  { href: "research/11a-tactical-sweep-bosses.md", title: "11a \u00b7 Sweep boss mechanics", blurb: "Shields, paralysis windows and resistance tables \u2014 every boss has a 4\u20136\u00d7 damage state", kind: "doc", section: "Research" },
  { href: "research/12-varesa-team.md", title: "12 \u00b7 Varesa's team", blurb: "Nothing you own shreds Electro RES \u2014 but Mizuki's Viridescent Venerer already does. Nightsoul Burst cadence, and the goblet worth more than any swap", kind: "doc", section: "Research" },
  { href: "research/13-varesa-damage-gap.md", title: "13 \u00b7 Varesa's damage gap", blurb: "Why ~50k when clips show ~150k: five gaps that multiply, modelled hit by hit \u2014 and the Skill \u2192 plunge \u2192 Kablam sequence", kind: "doc", section: "Research" },
  { href: "CLAUDE.md", title: "CLAUDE.md", blurb: "Working rules \u2014 loads automatically every session", kind: "doc", section: "Reference" },
  { href: "reference/account.md", title: "Account snapshot", blurb: "Roster, gear, exploration \u2014 and how to refresh it", kind: "doc", section: "Reference" },
  { href: "reference/verified-facts.md", title: "Verified facts", blurb: "Checked numbers with dates. Anything not here, look up again", kind: "doc", section: "Reference" },
  { href: "reference/kits.md", title: "Character kits", blurb: "All 23 \u2014 talents, passives, constellations, full text", kind: "doc", section: "Reference" },
  { href: "reference/artifact-sets.md", title: "Artifact sets", blurb: "All 63, 2pc and 4pc bonuses", kind: "doc", section: "Reference" },
  { href: "reference/weapons-owned.md", title: "Weapons you own", blurb: "Substats and passive text", kind: "doc", section: "Reference" },
  { href: "reference/open-questions.md", title: "Open questions", blurb: "Unverified things \u2014 most answerable in-game in seconds", kind: "doc", section: "Reference" },
  { href: "reference/sources.md", title: "Sources", blurb: "Which source answers what, and how to reach it", kind: "doc", section: "Reference" },
  { href: "reference/corrections.md", title: "Corrections log", blurb: "What I got wrong, and the habits that caused it", kind: "doc", section: "Reference" },
  { href: "reference/research-coverage.md", title: "Research coverage", blurb: "What\u2019s already been looked up \u2014 per character, per set, per mechanic. Read before researching anything", kind: "doc", section: "Reference" },
  { href: "docs/AUTHORING.md", title: "Authoring guide", blurb: "How to build a new map page quickly", kind: "tool", section: "Making new pages" },
  { href: "styles/map.css", title: "styles/map.css", blurb: "Shared pin, tag, zone and callout styles", kind: "tool", section: "Making new pages" },
  { href: "app/annotate.js", title: "app/annotate.js", blurb: "Render markers from data", kind: "tool", section: "Making new pages" },
];

export const sections = [...new Set(pages.map((p) => p.section))];
