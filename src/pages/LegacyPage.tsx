import { useParams, Link } from 'react-router-dom';
import { pages } from '../data/pages';

/**
 * The migration hatch. Every page that has not been rewritten as a component
 * still renders as itself, in an iframe, framed by the React shell. Nothing is
 * lost and nothing had to be ported to get the app standing up.
 */
export default function LegacyPage() {
  const { href = '' } = useParams();
  const entry = pages.find((p) => p.href === href);

  if (!entry) {
    return (
      <>
        <h1>No such page</h1>
        <p className="note">
          Nothing in src/data/pages.ts has the href <code>{href}</code>. If the file
          exists, regenerate the catalogue with tools/build-pages-index.py.
        </p>
        <p>
          <Link to="/">Back to the hub</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1>{entry.title}</h1>
      <p className="meta">
        {entry.section} · {entry.blurb} ·{' '}
        <a href={`/${entry.href}`} target="_blank" rel="noreferrer">
          open on its own
        </a>
      </p>
      <iframe className="frame" src={`/${entry.href}`} title={entry.title} />
    </>
  );
}
