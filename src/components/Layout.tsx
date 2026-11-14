import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { search } from '../data/search';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/characters', label: 'Characters' },
  { to: '/teams', label: 'Teams' },
  { to: '/roadmap', label: 'Roadmap' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const results = q.trim().length > 1 ? search(q).slice(0, 8) : [];

  // Close the dropdown on any route change or outside click.
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  return (
    <div className="shell">
      <nav className="shell__bar" onClick={(e) => e.stopPropagation()}>
        <NavLink to="/" className="shell__brand">Genshin notes</NavLink>
        <div className="shell__links">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => 'shell__link' + (isActive ? ' is-active' : '')}
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <input
            className="shell__search"
            placeholder="Search characters, teams, pages…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
          />
          {open && results.length > 0 && (
            <div style={{
              position: 'absolute', top: '110%', right: 0, zIndex: 20,
              width: 360, background: 'var(--panel)', border: '1px solid var(--line)',
              borderRadius: 9, padding: 6, maxHeight: '70vh', overflowY: 'auto',
            }}>
              {results.map((r) => {
                const body = (
                  <>
                    <b style={{ color: 'var(--paper)', fontSize: '.86rem' }}>{r.title}</b>
                    <span style={{ display: 'block', color: 'var(--dim)', fontSize: '.76rem' }}>
                      {r.kind} · {r.hint}
                    </span>
                  </>
                );
                const style = {
                  display: 'block', width: '100%', textAlign: 'left' as const, background: 'none',
                  border: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer',
                  padding: '7px 9px', borderRadius: 6, textDecoration: 'none',
                };
                // Page hits are real files — an anchor, so ctrl-click still works.
                return r.external ? (
                  <a key={r.kind + r.to} href={r.to} style={style}>{body}</a>
                ) : (
                  <button
                    key={r.kind + r.to}
                    onClick={() => { navigate(r.to); setQ(''); setOpen(false); }}
                    style={style}
                  >
                    {body}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {children}
    </div>
  );
}
