import { Link } from 'react-router-dom';
import { characters, inATeam, unresearched } from '../data/characters';
import { teams } from '../data/teams';
import { pages } from '../data/pages';

/** Most-used first. Sections not present are skipped, so this can list extras. */
const SECTION_ORDER = [
  'Builds', 'Tools', 'Maps', 'Farming', 'Research', 'Reference', 'Making new pages',
];

function sectionsInOrder() {
  const seen = new Map<string, number>();
  for (const p of pages) seen.set(p.section, (seen.get(p.section) ?? 0) + 1);
  const known = SECTION_ORDER.filter((s) => seen.has(s));
  const rest = [...seen.keys()].filter((s) => !SECTION_ORDER.includes(s)).sort();
  return [...known, ...rest].map((s) => ({ section: s, count: seen.get(s)! }));
}

export default function Home() {
  const owned = characters.filter((c) => c.owned);
  const tier1 = characters.filter((c) => c.tier === 1);

  return (
    <>
      <h1>Genshin notes</h1>
      <p className="meta">
        {owned.length} characters on the account, {inATeam.length} of them actually
        fielded across {teams.length} teams, and {pages.length} written pages.
        Levels and gear were last read from the game on 2026-11-12.
      </p>

      <div className="bar">
        <span className="key">Spend here first</span>
      </div>
      {tier1.length === 0 ? (
        <p className="note">No tier-1 characters set in src/data/characters.ts.</p>
      ) : (
        <div className="grid2">
          {tier1.map((c) => (
            <Link
              key={c.name}
              to={`/characters/${encodeURIComponent(c.name)}`}
              className={`tile tile--${c.element}`}
            >
              <b>
                {c.name}
                <span className="tierflag tierflag--1">tier 1</span>
              </b>
              <span>
                Lv {c.level} · paid in {c.paidIn ?? 'unknown'}
                {c.note ? ` — ${c.note}` : ''}
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="bar">
        <span className="key">Teams</span>
      </div>
      <div className="grid2">
        {teams.map((t) => (
          <Link key={t.id} to="/teams" className={`tile tile--${t.element}`}>
            <b>{t.name}</b>
            <span>{t.members.map((m) => m.character).join(' · ')}</span>
          </Link>
        ))}
      </div>

      <div className="bar">
        <span className="key">Pages</span>
      </div>
      {sectionsInOrder().map(({ section, count }) => (
        <details key={section} open={section === 'Builds' || section === 'Tools'}>
          <summary>
            <b>{section}</b> <span className="meta">{count}</span>
          </summary>
          <div className="grid2">
            {pages
              .filter((p) => p.section === section)
              .map((p) => (
                <Link key={p.href} to={`/page/${encodeURIComponent(p.href)}`} className="tile">
                  <b>{p.title}</b>
                  <span>{p.blurb}</span>
                </Link>
              ))}
          </div>
        </details>
      ))}
      <p className="note">
        Every page above still renders as the original HTML — nothing was rewritten.
        The search box reaches all {pages.length} of them, plus every character and team.
      </p>

      {unresearched.length > 0 && (
        <>
          <div className="bar">
            <span className="key">Never researched</span>
          </div>
          <p className="note">
            {unresearched.map((c) => c.name).join(', ')} — no kit has ever been read
            for these. Tracked in reference/research-coverage.md.
          </p>
        </>
      )}
    </>
  );
}
