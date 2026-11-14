import { useParams, Link } from 'react-router-dom';
import { byName } from '../data/characters';
import { teams } from '../data/teams';
import type { Character, Stats } from '../data/types';

const PROGRESS = { none: 'not started', partial: 'partly collected', complete: 'complete' } as const;

const STAT_LABELS: [keyof Stats, string][] = [
  ['maxHp', 'Max HP'],
  ['atk', 'ATK'],
  ['def', 'DEF'],
  ['em', 'Elemental Mastery'],
  ['critRate', 'CRIT Rate'],
  ['critDmg', 'CRIT DMG'],
  ['energyRecharge', 'Energy Recharge'],
  ['elementalDmgBonus', 'Elemental DMG Bonus'],
];

function StatTable({ stats }: { stats: Stats }) {
  const rows = STAT_LABELS.filter(([k]) => stats[k] !== undefined);
  if (rows.length === 0) return null;
  return (
    <table className="rows">
      <tbody>
        {rows.map(([k, label]) => (
          <tr key={k}>
            <td>{label}</td>
            <td className="num">
              {typeof stats[k] === 'number' ? (stats[k] as number).toLocaleString() : stats[k]}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Artifacts({ c }: { c: Character }) {
  if (!c.artifacts?.length) return <p className="note">No artifacts recorded.</p>;
  const offSet = c.artifacts.filter((a) => a.offSet).length;
  return (
    <>
      <table className="rows">
        <thead>
          <tr>
            <th>Slot</th>
            <th>Set</th>
            <th>+</th>
            <th>Main stat</th>
          </tr>
        </thead>
        <tbody>
          {c.artifacts.map((a) => (
            <tr key={a.slot}>
              <td>{a.slot}</td>
              <td className={a.offSet ? 'bad' : 'good'}>{a.set}</td>
              <td className="num">{a.level}</td>
              <td>{a.main}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {offSet === c.artifacts.length && (
        <p className="warn">
          All {offSet} pieces are off-set — this character has no set bonus at all.
        </p>
      )}
    </>
  );
}

export default function CharacterDetail() {
  const { name = '' } = useParams();
  const c = byName(decodeURIComponent(name));

  if (!c) {
    return (
      <>
        <h1>Not on the roster</h1>
        <p className="note">
          No character called <code>{decodeURIComponent(name)}</code> in
          src/data/characters.ts.
        </p>
        <p>
          <Link to="/characters">Back to the roster</Link>
        </p>
      </>
    );
  }

  const fieldedIn = teams.filter((t) => t.members.some((m) => m.character === c.name));

  return (
    <>
      <h1>
        {c.name}
        {c.tier && <span className={`tierflag tierflag--${c.tier}`}>tier {c.tier}</span>}
      </h1>
      <p className="meta">
        {c.element}
        {c.weaponType ? ` ${c.weaponType}` : ''}
        {c.rarity ? ` · ${c.rarity}★` : ''} · Lv {c.level} ·{' '}
        {c.constellation === null ? 'constellation not verified' : `C${c.constellation}`}
        {c.verified ? ` · read ${c.verified}` : ''}
      </p>

      {c.note && <p className="note">{c.note}</p>}

      {c.unresearched && (
        <p className="bad">
          Never researched — the kit for this character has never been read. Anything
          below is level and gear only.
        </p>
      )}

      <div className="bar">
        <span className="key">Where the resources go</span>
      </div>
      <table className="rows">
        <tbody>
          <tr>
            <td>Paid in</td>
            <td>{c.paidIn ?? 'not decided'}</td>
          </tr>
          <tr>
            <td>Target set</td>
            <td className="goal">
              {c.targetSet ?? '—'}
              {c.setProgress && <span className="meta"> · {PROGRESS[c.setProgress]}</span>}
            </td>
          </tr>
          {c.targetMains && (
            <tr>
              <td>Main stats</td>
              <td>
                Sands {c.targetMains.sands} · Goblet {c.targetMains.goblet} · Circlet {c.targetMains.circlet}
              </td>
            </tr>
          )}
          <tr>
            <td>Fielded in</td>
            <td>
              {fieldedIn.length ? (
                fieldedIn.map((t, i) => (
                  <span key={t.id}>
                    {i > 0 && ', '}
                    <Link to="/teams">{t.name}</Link>
                  </span>
                ))
              ) : (
                <span className="off">nothing — on the bench</span>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {c.weapon && (
        <>
          <div className="bar">
            <span className="key">Weapon</span>
          </div>
          <table className="rows">
            <tbody>
              <tr>
                <td>{c.weapon.name}</td>
                <td className="num">Lv {c.weapon.level}</td>
                <td>{c.weapon.refinement ? `R${c.weapon.refinement}` : ''}</td>
                <td>
                  {c.weapon.substat ? `${c.weapon.substat} ${c.weapon.substatValue ?? ''}` : ''}
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      <div className="bar">
        <span className="key">Artifacts</span>
      </div>
      <Artifacts c={c} />

      {c.stats && (
        <>
          <div className="bar">
            <span className="key">Stats in game</span>
          </div>
          <StatTable stats={c.stats} />
        </>
      )}

      {c.page && (
        <p className="meta">
          <a href={c.page}>Full write-up →</a>
        </p>
      )}
    </>
  );
}
