/**
 * Turns one static page into CMS sections: which module each block becomes,
 * and how blocks pack side by side.
 *
 * Layout rules
 *   - h1 / h2 open a group and become a one-column SECTION_HEADING.
 *   - .bar and .note are CALLOUTS, not headings. They render as a styled
 *     RICH_TEXT box at body size. (Treating them as headings is what turned
 *     one-sentence notes into giant <h2> text on the first migration.)
 *   - Each block is narrow or wide. Wide blocks — tables over two columns,
 *     long prose — get a full-width section. Runs of narrow blocks pack into
 *     2- or 3-column sections, in reading order.
 *
 * Probed on flux: in an N-column section, content index i lands in column i.
 */

import { topLevelBlocks, text, decode, classOf, pageContent } from './html-blocks.mjs';
import { mapModule } from './flux-maps.mjs';

const json = (o) => JSON.stringify(o);

/** Prose shorter than this sits beside its neighbours; longer gets full width. */
const NARROW_PROSE_CHARS = 500;

/* ------------------------------------------------------------ callouts --- */

// Light-theme versions of styles/map.css .bar variants — flux renders on white,
// so the original dark-panel colours would read as black boxes.
const CALLOUT = {
  good: ['#eef8f1', '#2e9d5b', '#14532d'],
  bad:  ['#fdf0f0', '#c0392b', '#7f1d1d'],
  warn: ['#fff8e1', '#c99a06', '#5c4300'],
  key:  ['#fff1ec', '#ff5a3c', '#7a2511'],
  note: ['#f5f6f8', '#9aa4b5', '#374151'],
};

function calloutModule(innerHtml, variant) {
  const [bg, edge, ink] = CALLOUT[variant] || CALLOUT.note;
  const style = `border-left:4px solid ${edge};background:${bg};color:${ink};`
    + 'padding:12px 16px;border-radius:6px;font-size:.95rem;line-height:1.55';
  return { type: 'RICH_TEXT', style: 'default',
           content: json({ value: `<div style="${style}">${innerHtml}</div>` }) };
}

function calloutVariant(cls) {
  for (const v of ['key', 'bad', 'warn', 'good']) if (new RegExp(`\\b${v}\\b`).test(cls)) return v;
  return 'note';
}

/** Stand-in for a map whose image is not uploaded yet (tools/flux-upload-map-images.mjs). Marked so it can be found. */
export function mapPlaceholder(alt, img) {
  const label = alt || 'Map';
  const src = img ? ` <span style="opacity:.7">(${img})</span>` : '';
  return calloutModule(
    `<b>${label}</b> — interactive map coming with the map module.${src}`
    + '<!-- MAP_ANNOTATED_PLACEHOLDER -->',
    'note');
}

/** Stand-in for a page whose main view is a live engine that cannot run in the CMS. */
export function enginePlaceholder() {
  return calloutModule(
    '<b>Interactive view not available here.</b> This page’s main content is a live map '
    + 'built from game data; the notes below are carried over, the map is not.',
    'warn');
}

/* ------------------------------------------------------------- modules --- */

function headingModule(heading, eyebrow, subtitle) {
  return { type: 'SECTION_HEADING', style: 'editorial',
           content: json({ eyebrow, heading, subtitle, align: 'left' }) };
}

function richText(html) {
  return { type: 'RICH_TEXT', style: 'default', content: json({ value: html }) };
}

/** Returns [module, isWide]. */
function tableBlock(html) {
  const rows = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  const widest = Math.max(0, ...rows.map((r) => (r.match(/<t[dh]\b/gi) || []).length));
  const merged = /colspan|rowspan/i.test(html);

  // Two plain columns are label/value pairs — exactly what the dossier holds.
  if (widest === 2 && !merged) {
    const items = rows.map((r) => {
      const cells = (r.match(/<t[dh][\s\S]*?<\/t[dh]>/gi) || []).map((c) => decode(text(c)));
      return cells.length === 2 && cells[0] ? { label: cells[0], value: cells[1] } : null;
    }).filter(Boolean);
    if (items.length >= 2) {
      return [{ type: 'KEY_VALUE_DOSSIER', style: 'spec', content: json({ items }) }, false];
    }
  }
  return [richText(html), true];
}

function listBlock(html) {
  const items = (html.match(/<li[\s\S]*?<\/li>/gi) || [])
    .map((li) => decode(text(li))).filter(Boolean).map((t) => ({ label: t }));
  if (items.length < 2) return [richText(html), false];
  return [{ type: 'LIST', style: 'default', content: json({ items }) }, false];
}

/* -------------------------------------------------------------- packing --- */

/** Split n narrow blocks into rows of 2-3, never leaving a lone block. */
export function rowSizes(n) {
  if (n === 0) return [];
  if (n <= 3) return [n];
  const sizes = [];
  let left = n;
  while (left > 0) {
    if (left === 4) { sizes.push(2, 2); break; }
    const take = Math.min(3, left);
    sizes.push(take);
    left -= take;
  }
  return sizes;
}

/* ----------------------------------------------------------------- page --- */

/**
 * @returns {{columns: number, modules: object[]}[]} sections in page order
 */
export function pageSections(html, title) {
  const sections = [];
  let narrow = [];
  let prose = [];

  const flushNarrow = () => {
    let i = 0;
    for (const size of rowSizes(narrow.length)) {
      sections.push({ columns: size, modules: narrow.slice(i, i + size) });
      i += size;
    }
    narrow = [];
  };
  const place = (module, wide) => {
    if (wide) { flushNarrow(); sections.push({ columns: 1, modules: [module] }); }
    else narrow.push(module);
  };
  const flushProse = () => {
    if (!prose.length) return;
    const html = prose.join('\n');
    prose = [];
    place(richText(html), text(html).length > NARROW_PROSE_CHARS);
  };
  const heading = (module) => {
    flushProse(); flushNarrow();
    sections.push({ columns: 1, modules: [module] });
  };

  const blocks = topLevelBlocks(pageContent(html));
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const cls = classOf(b.attrs);

    if (b.name === 'h1') {
      // A .sub paragraph straight after the title is its subtitle.
      const next = blocks[i + 1];
      const sub = next && /\bsub\b/.test(classOf(next.attrs)) ? decode(text(next.html)) : undefined;
      if (sub) i++;
      heading(headingModule(decode(text(b.html)), title, sub));
      continue;
    }
    if (b.name === 'h2' || b.name === 'h3') {
      heading(headingModule(decode(text(b.html))));
      continue;
    }
    if (b.name === 'div' && /\b(bar|note)\b/.test(cls)) {
      flushProse();
      const inner = b.html.replace(/^<div[^>]*>/, '').replace(/<\/div>$/, '');
      place(calloutModule(inner, /\bnote\b/.test(cls) ? 'note' : calloutVariant(cls)), false);
      continue;
    }
    if (b.name === 'div' && /\bmap-wrap\b/.test(cls)) {
      // A real MAP_ANNOTATED, built from the page's own drawMap() data
      // (tools/flux-maps.mjs). Full width. Until its image is uploaded, a
      // named placeholder holds the slot instead.
      flushProse();
      const alt = (b.attrs.match(/data-alt="([^"]*)"/) || [, ''])[1];
      const img = (b.attrs.match(/data-map="([^"]*)"/) || [, ''])[1];
      place(mapModule(b.attrs, html) || mapPlaceholder(alt, img), true);
      continue;
    }
    if (b.name === 'table') { flushProse(); place(...tableBlock(b.html)); continue; }
    if (b.name === 'ul' || b.name === 'ol') { flushProse(); place(...listBlock(b.html)); continue; }

    if (text(b.html)) prose.push(b.html);
  }
  flushProse();
  flushNarrow();
  return sections;
}

/** Visible text carried by a module, for coverage checks. */
export function moduleText(m) {
  const c = JSON.parse(m.content);
  if (c.value) return text(c.value);
  return [c.eyebrow, c.heading, c.subtitle, c.title,
    ...(c.items || []).flatMap((i) => [i.label, i.value])].filter(Boolean).join(' ');
}
