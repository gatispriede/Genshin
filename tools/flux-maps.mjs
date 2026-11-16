/**
 * Turns a page's drawMap() maps into MAP_ANNOTATED modules for flux.
 *
 * The local pages draw maps in the browser:
 *     <div class="map-wrap" id="mondstadt" data-map="assets/x.webp" data-alt="…">
 *     <script type="module"> drawMap("#mondstadt", [{x, y, role, tag, …}]) </script>
 * The CMS cannot run that script, so this reads the same data at build time:
 * each page's module scripts run against recording stubs of drawMap() and
 * dots(), never the real DOM code. Only this repo's own pages pass through it.
 *
 * Marker shape (app/annotate.js) -> MAP_ANNOTATED shape (CMS doc
 * docs/current/modules/map-annotated.md in redis-node-js-cloud):
 *     { dot: "chest", x, y }        -> { kind: "dot",  dot: "chest", x, y }
 *     { zone: true, x, y, w, h, … } -> { kind: "zone", … }
 *     anything else                 -> { kind: "pin",  role: role || "do-now", … }
 * Percentages carry over unchanged: both sides treat x/y as % of the image.
 *
 * Image URLs come from reference/data/flux-map-images.json
 * (tools/flux-upload-map-images.mjs).
 */

import { readFileSync, existsSync } from 'node:fs';

const MANIFEST = 'reference/data/flux-map-images.json';
const ROLES = new Set(['do-now', 'goal', 'hub', 'farm', 'best', 'warn', 'off']);
const DOT_KINDS = new Set(['chest', 'wp']);

let manifestCache;
function imageUrl(localPath) {
  manifestCache ??= existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
  return manifestCache[localPath];
}

/** Every drawMap()/dots() call in the page's module scripts, grouped by map id. */
export function markersById(html) {
  const byId = new Map();
  const add = (sel, list) => {
    const id = String(sel).replace(/^#/, '');
    byId.set(id, [...(byId.get(id) || []), ...list]);
  };
  const drawMap = (sel, markers) => add(sel, markers || []);
  const dots = (sel, kind, pairs) => add(sel, pairs.map(([x, y]) => ({ dot: kind, x, y })));
  for (const [, body] of html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)) {
    if (!/\b(drawMap|dots)\(/.test(body)) continue;
    const code = body.replace(/^\s*import\s[^;]*;\s*$/gm, '');
    new Function('drawMap', 'dots', 'drawKey', code)(drawMap, dots, () => {});
  }
  return byId;
}

/** One local marker in the module's shape. Throws on values the module would reject. */
export function toModuleMarker(m, where) {
  if (m.dot) {
    if (!DOT_KINDS.has(m.dot)) throw new Error(`${where}: dot kind "${m.dot}" is not chest/wp`);
    return { kind: 'dot', dot: m.dot, x: m.x, y: m.y };
  }
  const role = m.role || 'do-now';
  if (!ROLES.has(role)) throw new Error(`${where}: role "${role}" is not one of ${[...ROLES].join(', ')}`);
  const out = { kind: m.zone ? 'zone' : 'pin', x: m.x, y: m.y, role };
  for (const k of ['label', 'tag', 'title', 'size', 'pulse', 'w', 'h', 'rect', 'layer']) {
    if (m[k] !== undefined && m[k] !== null && m[k] !== '') out[k] = m[k];
  }
  if (out.label !== undefined) out.label = String(out.label);
  return out;
}

/**
 * The MAP_ANNOTATED module for one .map-wrap block, or null when its image
 * has not been uploaded yet (the caller then keeps the placeholder).
 */
export function mapModule(attrs, html) {
  const id = (attrs.match(/\bid="([^"]*)"/) || [, ''])[1];
  const img = (attrs.match(/data-map="([^"]*)"/) || [, ''])[1];
  const alt = (attrs.match(/data-alt="([^"]*)"/) || [, ''])[1];
  const src = imageUrl(img);
  if (!src) return null;
  const markers = (markersById(html).get(id) || []).map((m, i) => toModuleMarker(m, `#${id} marker ${i}`));
  const content = { image: { src, alt: alt || undefined }, markers };
  // data-legend='[{layer, text, role}]' replaces the role-derived legend, e.g.
  // one toggle per quest on a route map (tools/route_markers.py).
  const legendAttr = (attrs.match(/data-legend="([^"]*)"/) || [, ''])[1];
  if (legendAttr) {
    content.legend = JSON.parse(legendAttr.replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
    content.legendFromRoles = false;
  }
  // data-label-min-zoom="0" shows captions at every zoom (the module default
  // hides them below 1.4x to keep dense maps clean).
  const minZoom = (attrs.match(/data-label-min-zoom="([^"]*)"/) || [, ''])[1];
  if (minZoom !== '') content.labelMinZoom = Number(minZoom);
  // data-height overrides the module's clamp(320px, 60vh, 640px) viewport, which
  // crops the bottom of a tall map (the image fits the width, not the height).
  const height = (attrs.match(/data-height="([^"]*)"/) || [, ''])[1];
  if (height) content.height = height;
  return { type: 'MAP_ANNOTATED', style: 'default', name: id || undefined, content: JSON.stringify(content) };
}
