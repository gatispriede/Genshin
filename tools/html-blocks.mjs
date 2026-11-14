/**
 * Minimal HTML helpers for reading this project's own static pages.
 *
 * Not a general parser — the pages are hand-written with flat, consistent
 * markup, which is what makes a depth-tracking tag walk good enough.
 */

const VOID = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'source']);

/** Split a fragment into its top-level elements, tracking nesting depth. */
export function topLevelBlocks(html) {
  const blocks = [];
  const re = /<(\/?)([a-zA-Z][\w-]*)\b([^>]*)>/g;
  let depth = 0, m;

  while ((m = re.exec(html))) {
    const [tag, closing, rawName, attrs] = m;
    const name = rawName.toLowerCase();
    if (VOID.has(name) || attrs.endsWith('/')) {
      if (depth === 0) blocks.push({ name, html: tag, attrs });
      continue;
    }
    if (!closing) {
      if (depth === 0) blocks.push({ name, attrs, _s: m.index });
      depth++;
    } else {
      depth = Math.max(depth - 1, 0);
      if (depth === 0 && blocks.length) {
        const b = blocks[blocks.length - 1];
        if (b._s !== undefined) {
          b.html = html.slice(b._s, m.index + tag.length);
          delete b._s;
        }
      }
    }
  }
  return blocks.filter((b) => b.html);
}

/** Remove what the CMS sanitiser would drop anyway, plus the site nav. */
export const strip = (h) => h
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, '');

/** Visible text, whitespace collapsed. */
export const text = (h) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export const decode = (s) => s
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&mdash;/g, '—').replace(/&rsquo;/g, '’').replace(/&nbsp;/g, ' ');

export const classOf = (attrs) => (attrs.match(/class="([^"]*)"/) || [, ''])[1];

/** The page body inside .wrap, with scripts, styles and nav removed. */
export function pageContent(html) {
  const body = strip((html.match(/<body[^>]*>([\s\S]*)<\/body>/i) || [, html])[1]);
  return (body.match(/<div class="wrap"[^>]*>([\s\S]*)<\/div>/i) || [, body])[1];
}
