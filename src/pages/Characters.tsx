import { useState } from 'react';
import { Link } from 'react-router-dom';
import { characters } from '../data/characters';
import type { Element } from '../data/types';

const ELEMENTS: Element[] = [
  'Pyro', 'Hydro', 'Electro', 'Cryo', 'Anemo', 'Geo', 'Dendro',
];

type Filter = 'all' | 'fielded' | 'bench' | 'unresearched';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'fielded', label: 'In a team' },
  { id: 'bench', label: 'On the bench' },
  { id: 'unresearched', label: 'Never researched' },
];

export default function Characters() {
  const [filter, setFilter] = useState<Filter>('all');
  const [element, setElement] = useState<Element | null>(null);

  const shown = characters
    .filter((c) => c.owned)
    .filter((c) => (element ? c.element === element : true))
    .filter((c) => {
      if (filter === 'fielded') return c.teams.length > 0;
      if (filter === 'bench') return c.teams.length === 0;
      if (filter === 'unresearched') return !!c.unresearched;
      return true;
    })
    .sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));

  return (
    <>
      <h1>Characters</h1>
      <p className="meta">
        Everything here is read from src/data/characters.ts. Correct a level or a
        set there and this page, the search box and every detail page follow.
      </p>

      <div className="chips">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={'chip' + (filter === f.id ? ' is-on' : '')}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="chips">
        <button
          className={'chip' + (element === null ? ' is-on' : '')}
          onClick={() => setElement(null)}
        >
          Any element
        </button>
        {ELEMENTS.map((e) => (
          <button
            key={e}
            className={'chip' + (element === e ? ' is-on' : '')}
            onClick={() => setElement(e)}
          >
            {e}
          </button>
        ))}
      </div>

      <p className="meta">{shown.length} shown</p>

      {shown.length === 0 ? (
        <p className="note">Nothing matches that combination.</p>
      ) : (
        <div className="grid2">
          {shown.map((c) => (
            <Link
              key={c.name}
              to={`/characters/${encodeURIComponent(c.name)}`}
              className={`tile tile--${c.element}`}
            >
              <b>
                {c.name}
                {c.tier && <span className={`tierflag tierflag--${c.tier}`}>tier {c.tier}</span>}
              </b>
              <span>
                Lv {c.level} · {c.element}
                {c.weaponType ? ` ${c.weaponType}` : ''}
                {c.rarity ? ` · ${c.rarity}★` : ''}
                {c.teams.length ? ` · ${c.teams.join(', ')}` : ' · bench'}
                {c.unresearched ? ' · never researched' : ''}
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
