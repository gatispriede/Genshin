import { Link } from 'react-router-dom';
import { teams } from '../data/teams';
import { byName } from '../data/characters';

export default function Teams() {
  return (
    <>
      <h1>Teams</h1>
      <p className="meta">
        The four teams in src/data/teams.ts, with what each can break. Ward
        coefficients come from the wiki; the long version is in enemy-coverage.html.
        Anemo and Geo are 0.5 against every ward, which is why two of these teams
        have an identical profile.
      </p>

      {teams.map((t) => (
        <section key={t.id}>
          <div className="bar">
            <span className="key">{t.name}</span>
          </div>

          <table className="rows">
            <thead>
              <tr>
                <th>Character</th>
                <th>Role</th>
                <th>Level</th>
                <th>Set wanted</th>
              </tr>
            </thead>
            <tbody>
              {t.members.map((m) => {
                const c = byName(m.character);
                return (
                  <tr key={m.character}>
                    <td>
                      {c ? (
                        <Link to={`/characters/${encodeURIComponent(c.name)}`}>{m.character}</Link>
                      ) : (
                        m.character
                      )}
                    </td>
                    <td>{m.role}</td>
                    <td className="num">{c ? c.level : '—'}</td>
                    <td>{m.set ?? c?.targetSet ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p>
            <span className="good">Breaks:</span> {t.breaks.join(', ') || 'nothing'}
          </p>
          <p>
            <span className="bad">Cannot break:</span>{' '}
            {t.cannotBreak.length ? t.cannotBreak.join(', ') : 'nothing — this one covers everything'}
          </p>
          {t.note && <p className="note">{t.note}</p>}
          {t.page && (
            <p className="meta">
              <Link to={`/page/${encodeURIComponent(t.page)}`}>Full write-up →</Link>
            </p>
          )}
        </section>
      ))}
    </>
  );
}
