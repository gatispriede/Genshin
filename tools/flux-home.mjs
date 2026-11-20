/**
 * The flux homepage (/genshin-notes): what the site is, where to start, and
 * every section, for a visitor arriving cold.
 *
 * Used by tools/flux-push.mjs. Kept apart so the homepage's wording can be
 * found and edited without reading the push machinery.
 *
 * START links name catalogue pages; their URLs come from the page tree
 * (flux-tree.mjs), so they follow a page when it moves.
 */

const json = (o) => JSON.stringify(o);

import { TREE, publicPath } from './flux-tree.mjs';
import { slugOf } from './flux-pages.mjs';

// [catalogue href, card text]. The URL comes from the page tree (flux-tree.mjs),
// so moving a page cannot leave a stale link here.
const START = [
  ['reputation-quests.html',
   'Every quest that pays reputation, shortest first, with a route map per region and a picture of each start.'],
  ['teams.html', 'Three team archetypes: who plays together, the rotation, and the set every member wants.'],
  ['enemy-coverage.html', 'Which element breaks which enemy shield, and how to cover every one.'],
  ['codes.html', 'Codes checked in game, not just copied from aggregators, and when the next batch is due.'],
  ['theater.html', 'Who to spend in which Act, and the boss loop for the last one.'],
];

/** Top-level sections in the order shown, with the line under each. */
const SECTION_BLURB = {
  'Reputation quests': 'route maps per region, shortest quests first, chains included',
  Builds: 'one page per character: target sets, main stats, substats, weapons',
  Teams: 'line-up, rotation and shield coverage per team',
  'Team building': 'how the teams were put together, and the damage maths behind them',
  Combat: 'enemy shields, reactions, Imaginarium Theater, Tactical Sweep',
  'Farming & economy': 'codes, wishes, Mora, ore, talent books, bosses and domains',
  'Maps & puzzles': 'puzzle solutions, gathering routes and collectibles',
  TCG: 'Genius Invokation: cards and a deck',
  Reference: 'character kits, artifact sets, sources, and what other guides get wrong',
};

function heading(eyebrow, h, subtitle) {
  return { type: 'SECTION_HEADING', style: 'editorial', content: json({ eyebrow, heading: h, subtitle, align: 'left' }) };
}

export function homeModules({ rootUrl, teams, characters, pages, links }) {
  const counts = Object.fromEntries(Object.entries(TREE).filter(([k]) => k).map(([k, v]) => [k, v.length]));
  counts.Builds = characters.filter((c) => c.owned && (c.teams.length > 0 || c.page)).length;
  counts.Teams = teams.length;
  const titleOf = Object.fromEntries(pages.map((p) => [p.href, p.title]));

  return [
    heading('Genshin Impact notes', 'Measured guides, not guesses',
      'Reputation routes · team builds · enemy shields · codes checked in game'),
    { type: 'RICH_TEXT', style: 'default', content: json({ value:
      '<p>Guides built from measurement: quests ranked by how long they actually are, each start placed '
      + 'on the official map, team advice checked with damage tests, and redeem codes tried in game '
      + 'before they are listed. Game data comes from the Genshin Impact Wiki and the official '
      + 'interactive map. When something here turns out wrong, it is fixed and logged.</p>' }) },
    { type: 'LIST', style: 'cards', content: json({
      title: 'Start here',
      items: START.map(([href, value]) => ({
        label: titleOf[href], value, href: `${rootUrl}/${publicPath(href, titleOf[href])}`,
      })),
    }) },
    { type: 'LIST', style: 'cards', content: json({
      title: 'The teams',
      items: teams.map((t) => ({
        label: t.name, value: t.members.map((m) => m.character).join(' · '),
        href: links.teams[t.id]?.url,
      })),
    }) },
    { type: 'LIST', style: 'default', content: json({
      title: 'Every section',
      items: Object.keys(SECTION_BLURB).map((s) => ({
        label: s, value: `${counts[s] ? `${counts[s]} page${counts[s] === 1 ? '' : 's'} · ` : ''}${SECTION_BLURB[s]}`,
        href: `${rootUrl}/${slugOf(s)}`,
      })),
    }) },
    { type: 'RICH_TEXT', style: 'default', content: json({ value:
      '<p style="font-size:.9rem;opacity:.8"><b>Corrections.</b> Mistakes are recorded in the '
      + `<a href="${rootUrl}/reference/corrections-log">corrections log</a>, with what was wrong and why.</p>` }) },
  ];
}
