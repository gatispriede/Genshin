/**
 * The public site's page tree on flux: which parent each page sits under, and
 * which pages are not published. Plan: reference/site-restructure.md.
 *
 * Parent paths are page titles under the "Genshin notes" root; "A/B" nests one
 * level deeper. Build write-ups and generated team pages are not listed here:
 * flux-push.mjs owns Builds and Teams.
 */

import { slugOf } from './flux-pages.mjs';

export const TREE = {
  // Top level, beside the generated Builds and Teams. '' is the "Genshin notes" root.
  '': ['reputation-quests.html'],
  // The overview is itself the parent: it has content, and the regions hang off it.
  'Reputation quests': [
    'liyue-rep-route.html', 'inazuma-rep-route.html', 'sumeru-rep-route.html',
    'fontaine-rep-route.html', 'reputation-compass.html',
  ],
  'Team building': [
    'teams.html', 'support-squad.html', 'research/12-varesa-team.md', 'research/13-varesa-damage-gap.md',
  ],
  'Combat': [
    'enemy-coverage.html', 'reaction-combos.html', 'stellar.html', 'theater.html',
    'tactical-sweep.html', 'research/08-snezhnaya-mechanics.md',
  ],
  'Farming & economy': [
    'codes.html', 'research/02-wishes-and-primogems.md', 'research/01-mora-farming.md',
    'research/07-ore-farming.md', 'research/03-character-materials.md', 'talent-farming.html',
    'saurian-farming.html', 'local-legends.html', 'domains.html',
  ],
  'Maps & puzzles': [
    'starfell-valley-guide.html', 'dragonspine-quest-map.html', 'research/06a-in-the-mountains.md',
    'vault-of-qingce.html', 'chi-of-yore-puzzles.html', 'wuwang-statue-puzzle.html', 'arsenal-keys.html',
    'eye-of-graeae-map.html', 'derelict-masonry-dock.html', 'exaiphanes-statues-map.html', 'yaodie-valley-map.html',
    'chasm-ore-map.html', 'redbeet-map.html', 'fowl-map.html', 'fishing-spots-map.html', 'windcatcher-map.html',
    'crafting-bench-map.html', 'bounty-stormbearer-map.html', 'collectible-map.html',
  ],
  'TCG': ['tcg.html'],
  'Reference': [
    'reference/kits.md', 'reference/artifact-sets.md', 'artifacts.html', 'reference/sources.md', 'reference/corrections.md',
  ],
};

/**
 * Old page title -> the page that replaced it, so its URL redirects there rather
 * than to the section (tools/flux-redirects.mjs). One instance per topic: the
 * region route pages absorbed the region lists, the start-map pages and the
 * interactive quest map.
 */
export const RENAMED = {
  'Reputation quests — all regions': 'Reputation quests',
  'Sumeru rep quests — route': 'Sumeru reputation quests',
  'Liyue — every reputation quest': 'Liyue reputation quests',
  'Inazuma — every reputation quest': 'Inazuma reputation quests',
  'Sumeru — every reputation quest': 'Sumeru reputation quests',
  'Fontaine — every reputation quest': 'Fontaine reputation quests',
  'Liyue quests — start maps': 'Liyue reputation quests',
  'Inazuma quests — start maps': 'Inazuma reputation quests',
  'Sumeru quests — start maps': 'Sumeru reputation quests',
  'Fontaine quests — start maps': 'Fontaine reputation quests',
  'Quest map — interactive': 'Reputation quests',
  'World quest pins': 'Reputation quests',
  'Artifact roadmap': 'Builds',
  'Character roadmap': 'Builds',
  // Imaginarium Theater: four pages became one (theater.html).
  'Theater — Act 1 picks': 'Imaginarium Theater',
  '10 · Imaginarium Theater': 'Imaginarium Theater',
  '10a · Theater — the Normal run': 'Imaginarium Theater',
  // Tactical Sweep: merged into tactical-sweep.html.
  '11 · Tactical Sweep': 'Tactical Sweep',
  '11a · Sweep boss mechanics': 'Tactical Sweep',
  // Genius Invokation TCG: merged into tcg.html.
  'TCG — cards & a Skirk deck': 'Genius Invokation TCG',
  'TCG swaps': 'Genius Invokation TCG',
  // Tyrant’s Fang farming: merged into saurian-farming.html.
  "Tyrant’s Fang plan": "Tyrant’s Fang farming",
  "Natlan routes": "Tyrant’s Fang farming",
  "Natlan Saurian map": "Tyrant’s Fang farming",
  // Artifacts & budget weapons: merged into artifacts.html.
  "09 · Artifact sets": "Artifacts & budget weapons",
  "04 · Weapons & artifacts": "Artifacts & budget weapons",
};

/** Account-only pages with no generic version worth publishing (restructure plan). */
export const RETIRED = {
  'research/09-artifact-sets.md': "merged into artifacts.html; kept as notes",
  'research/04-weapons-and-artifacts.md': "merged into artifacts.html; kept as notes",
  'farming/index.html': "merged into saurian-farming.html; kept as notes",
  'farming/routes.html': "merged into saurian-farming.html; kept as notes",
  'farming/map.html': "merged into saurian-farming.html; kept as notes",
  'tcg-skirk.html': "merged into tcg.html; kept as notes",
  'tcg-swap.html': "merged into tcg.html; kept as notes",
  'research/11-tactical-sweep.md': "merged into tactical-sweep.html; kept as notes",
  'research/11a-tactical-sweep-bosses.md': "merged into tactical-sweep.html; kept as notes",
  'build-coverage.html': 'which of the owner\'s characters are built',
  'collectibles-status.html': 'the owner\'s exploration progress',
  'oculus-tracking.html': 'the owner\'s oculus progress',
  'research/05-current-loadouts.md': 'audit of the owner\'s loadouts',
  'research/06-artifact-plan.md': 'the owner\'s artifact plan',
  'reference/weapons-owned.md': 'the owner\'s weapon inventory',
  'reference/open-questions.md': 'the owner\'s open research questions',
  'reference/research-coverage.md': 'internal research tracking',
  'research/10-imaginarium-theater.md': "one account's Theater plan; its rules moved into theater.html",
  'research/10a-theater-normal-run.md': "one account's Theater run log; its rules moved into theater.html",
  'reference/verified-facts.md': 'internal fact log; its facts move into the pages they belong to',
};

const PARENT_OF = Object.fromEntries(Object.entries(TREE).flatMap(([parent, hrefs]) => hrefs.map((h) => [h, parent])));

/** Where a page goes on flux: a parent path, or null when the tree does not place it. */
export const parentOf = (href) => (href in PARENT_OF ? PARENT_OF[href] : null);

/** A placed page's path under the root ("reputation-quests/sumeru-reputation-quests"). */
export const publicPath = (href, title) => [...(parentOf(href) || '').split('/').filter(Boolean), title]
  .map(slugOf).join('/');

/** Every page title that is a parent in the tree ("Combat", "Reputation quests", …). */
export const parentTitles = () => new Set(Object.keys(TREE).filter(Boolean).flatMap((p) => p.split('/')));
