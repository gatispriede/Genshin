import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pages } from '../data/pages';

/**
 * Pages that have not been rewritten as components are real .html files, and
 * they are opened directly rather than framed.
 *
 * This used to be an iframe. flux serves the build under /bundles/*, which
 * returns `X-Frame-Options: DENY` — that blocks framing even same-origin, so
 * every frame would have come up blank once deployed. Relaxing that header is
 * a change to shared, multi-tenant infrastructure, which is not a trade worth
 * making for a notes site: the static pages carry their own nav (app/nav.js),
 * so opening them directly costs only the search bar.
 *
 * The route is kept so older /page/<href> links still resolve.
 */
export default function LegacyPage() {
  const { href = '' } = useParams();
  const entry = pages.find((p) => p.href === href);

  useEffect(() => {
    // Relative, so it resolves under /bundles/genshin/ as well as at a root.
    if (entry) window.location.replace(entry.href);
  }, [entry]);

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
      <p className="meta">Opening {entry.href}…</p>
      <p>
        <a href={entry.href}>Open it now</a> if nothing happens.
      </p>
    </>
  );
}
