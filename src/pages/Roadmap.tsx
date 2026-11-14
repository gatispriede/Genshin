import { Link } from 'react-router-dom';
import { artifactRoadmap, characterRoadmap, domainPriority } from '../data/roadmap';
import { liveReadAt } from '../data/live';

const KIND_LABEL = { set: 'Set', main: 'Main stat', level: 'Level', rarity: '5★ upgrade' } as const;

/**
 * Both roadmaps, computed from the live HoYoLAB read — see src/data/roadmap.ts.
 * Nothing on this page is written by hand, so a refresh updates it.
 */
export default function Roadmap() {
  const artifacts = artifactRoadmap();
  const domains = domainPriority();
  const steps = characterRoadmap();

  return (
    <>
      <h1>Roadmap</h1>
      <p className="meta">
        Computed from the game's own record, read from HoYoLAB on {liveReadAt}, against the
        target sets and main stats in src/data/characters.ts. Refresh the read and this page follows.
      </p>

      <div className="bar"><span className="key">Where to farm</span></div>
      <table className="rows">
        <thead><tr><th>Domain</th><th>Set / main-stat gaps</th><th>For</th></tr></thead>
        <tbody>
          {domains.map((d) => (
            <tr key={d.domain}>
              <td>{d.domain}</td>
              <td className="num">{d.gaps}</td>
              <td>{d.who.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="bar"><span className="key">Artifact roadmap — biggest payoff first</span></div>
      {artifacts.map(({ character: c, team, gaps }) => {
        const real = gaps.filter((g) => g.kind === 'set' || g.kind === 'main');
        const levels = gaps.filter((g) => g.kind === 'level').length;
        const upgrades = gaps.filter((g) => g.kind === 'rarity').length;
        return (
          <section key={c.name}>
            <h3>
              <Link to={`/characters/${encodeURIComponent(c.name)}`}>{c.name}</Link>
              <span className="meta"> · {team} · {c.targetSet ?? 'no target set'}</span>
            </h3>
            {real.length === 0 ? (
              <p className="good">Set and main stats on target.</p>
            ) : (
              <ul>
                {real.map((g, i) => (
                  <li key={i}>
                    <b>{KIND_LABEL[g.kind]}:</b> {g.action}
                    {g.domain && <span className="meta"> — {g.domain}</span>}
                  </li>
                ))}
              </ul>
            )}
            {(levels > 0 || upgrades > 0) && (
              <p className="meta">
                {levels > 0 && `${levels} piece(s) below max level. `}
                {upgrades > 0 && `${upgrades} piece(s) with the right stat on a 4★.`}
              </p>
            )}
          </section>
        );
      })}

      <div className="bar"><span className="key">Character roadmap — levels, talents, weapons</span></div>
      <table className="rows">
        <thead><tr><th>Character</th><th>Team</th><th>Lv</th><th>Talents</th><th>Weapon</th><th>Next step</th></tr></thead>
        <tbody>
          {steps.map((s) => (
            <tr key={s.character.name}>
              <td><Link to={`/characters/${encodeURIComponent(s.character.name)}`}>{s.character.name}</Link></td>
              <td>{s.team}</td>
              <td className="num">{s.character.level}</td>
              <td>{s.character.talents?.join('/') ?? '—'}</td>
              <td>{s.character.weapon ? `${s.character.weapon.name} ${s.character.weapon.level}` : '—'}</td>
              <td>
                {s.next}
                {s.warnings.map((w) => <div key={w} className="warn">⚠ {w}</div>)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
