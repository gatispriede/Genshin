/**
 * The flux homepage (/genshin-notes): what the site is, where to start, and
 * every section, for a visitor arriving cold.
 *
 * Used by tools/flux-push.mjs. Kept apart so the homepage's wording can be
 * found and edited without reading the push machinery.
 *
 * START links are paths under the root, checked against flux on 16 Nov
 * (page.list). A renamed page needs its path updated here.
 */

const json = (o) => JSON.stringify(o);

const START = [
  ['The three teams', 'guides/the-three-teams',
   'Who plays together and why, the rotation for each, and the set every member wants.'],
  ['Sumeru reputation route', 'maps/sumeru-rep-quests-route',
   'Every quest that pays Sumeru reputation, shortest first, chain quests included. Click a dot on the map for its start screenshot.'],
  ['Reputation quests: all regions', 'guides/reputation-quests-all-regions',
   'Each region’s reputation quests with start NPC and length, plus the chains hidden behind them.'],
  ['Enemy shields', 'guides/enemy-shields-what-you-cant-break',
   'Which team breaks which elemental shield, and the one gap no team covers.'],
  ['Imaginarium Theater', 'guides/imaginarium-theater',
   'How this account clears it: who to spend in which Act, and the boss loop for the last one.'],
];

const SECTION_BLURB = {
  Builds: 'one page per fielded character: gear against target and the ideal build',
  Teams: 'line-up, rotation and shield coverage per team',
  Guides: 'how-tos built for this account',
  Maps: 'interactive maps: quest starts, collectibles, routes',
  Research: 'the working-out behind the advice, with sources',
  Farming: 'what to farm, where, and on which day',
  Reference: 'data tables, sources and the corrections log',
  Roadmaps: 'artifact and character priorities, in order',
};

function heading(eyebrow, h, subtitle) {
  return { type: 'SECTION_HEADING', style: 'editorial', content: json({ eyebrow, heading: h, subtitle, align: 'left' }) };
}

export function homeModules({ rootUrl, teams, characters, pages, liveReadAt, links }) {
  const owned = characters.filter((c) => c.owned).length;
  const counts = {};
  for (const p of pages) counts[p.section] = (counts[p.section] || 0) + 1;
  counts.Builds = characters.filter((c) => c.owned && (c.teams.length > 0 || c.page)).length;
  counts.Teams = teams.length;
  counts.Roadmaps = 2;
  counts.Guides = (counts.Guides || 0) + (counts.Tools || 0);   // the catalogue's "Tools" are flux's Guides

  return [
    heading('Genshin Impact · one account’s notes', 'Built around what this account actually owns',
      `${owned} characters · ${teams.length} teams · gear read from HoYoLAB on ${liveReadAt}`),
    { type: 'RICH_TEXT', style: 'default', content: json({ value:
      '<p>This is not a general guide. It is one player’s working notes, kept current: which teams to run '
      + 'with the characters on this account, how to gear and play them, and maps for the quests and '
      + 'collectibles still left to do. Every recommendation is checked against the account’s real '
      + 'characters, weapons and artifacts, and against the Genshin Impact Wiki and the official '
      + 'interactive map. When something here turned out wrong, it is fixed and logged.</p>' }) },
    { type: 'LIST', style: 'cards', content: json({
      title: 'Start here',
      items: START.map(([label, path, value]) => ({ label, value, href: `${rootUrl}/${path}` })),
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
        label: s, value: `${counts[s] ?? ''} ${counts[s] ? 'pages · ' : ''}${SECTION_BLURB[s]}`.trim(),
        href: `${rootUrl}/${s.toLowerCase()}`,
      })),
    }) },
    { type: 'RICH_TEXT', style: 'default', content: json({ value:
      '<p style="font-size:.9rem;opacity:.8"><b>How it stays current.</b> Character levels, weapons and artifacts '
      + `are re-read from the HoYoLAB Battle Chronicle (last: ${liveReadAt}). Game mechanics come from the `
      + 'Genshin Impact Wiki; quest start points from the official interactive map’s pins. Mistakes are recorded '
      + `in the <a href="${rootUrl}/reference/corrections-log">corrections log</a>, with what was wrong and why.</p>` }) },
  ];
}
