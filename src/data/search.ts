import { characters } from './characters';
import { teams } from './teams';
import { pages } from './pages';

export interface Hit {
  kind: 'Character' | 'Team' | 'Page';
  title: string;
  hint: string;
  to: string;
  /** Page hits are real .html files, opened directly rather than routed to. */
  external?: boolean;
}

/**
 * One index over everything. Characters and teams come from the typed data,
 * pages from the generated catalogue — so a character's level or set only ever
 * has to be corrected in src/data/characters.ts.
 */
export function search(query: string): Hit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits: Hit[] = [];

  for (const c of characters) {
    const haystack = [
      c.name, c.element, c.weaponType, c.targetSet, c.note,
      ...c.teams, c.paidIn, c.unresearched ? 'unresearched' : '',
    ].filter(Boolean).join(' ').toLowerCase();
    if (haystack.includes(q)) {
      hits.push({
        kind: 'Character',
        title: c.name,
        hint: `${c.element} · Lv ${c.level}${c.teams.length ? ' · ' + c.teams.join(', ') : ''}`,
        to: `/characters/${encodeURIComponent(c.name)}`,
      });
    }
  }

  for (const t of teams) {
    const haystack = [t.name, t.element, t.note, ...t.members.map((m) => m.character + ' ' + (m.set ?? ''))]
      .filter(Boolean).join(' ').toLowerCase();
    if (haystack.includes(q)) {
      hits.push({ kind: 'Team', title: t.name, hint: t.members.map((m) => m.character).join(' · '), to: '/teams' });
    }
  }

  for (const p of pages) {
    if ((p.title + ' ' + p.blurb + ' ' + p.section).toLowerCase().includes(q)) {
      hits.push({ kind: 'Page', title: p.title, hint: p.section, to: p.href, external: true });
    }
  }

  // Characters first, then teams, then pages.
  const rank = { Character: 0, Team: 1, Page: 2 };
  return hits.sort((a, b) => rank[a.kind] - rank[b.kind]);
}
