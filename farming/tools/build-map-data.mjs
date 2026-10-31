/**
 * Builds a map dataset from the official Genshin map's public API.
 *
 * Two things are easy to get wrong and are asserted below:
 *
 *  - Use `detail_v2` from /v1/map/list, not /v1/map/info. The info endpoint
 *    still serves a 2024-04-15 basemap that predates Natlan entirely, so pins
 *    land on empty canvas. detail_v2 carries the current map_version.
 *  - A pin's pixel position is `origin + position`, with no padding term:
 *    detail_v2's origin is already expressed in the widened canvas.
 *
 * Tile levels run opposite to zoom: N1 is sharpest (half scale), N3 coarsest.
 *
 * Usage:
 *   node tools/build-map-data.mjs --labels            # list what you can map
 *   node tools/build-map-data.mjs --label 603         # build that dataset
 *   node tools/build-map-data.mjs --label 603 --out features/map/map.data.js \
 *        --global SAURIAN_MAP
 *
 * Any label works, so a new "where is all the X" map is one command — see
 * tools/README.md.
 */
import { writeFile } from 'node:fs/promises';

const API = 'https://sg-public-api.hoyolab.com/common/map_user/ys_obc/';
const TILE_URL = (v, c, r, n, map) =>
  `https://act-webstatic.hoyoverse.com/map_manage/map/${map}/${v}/${c}_${r}_N${n}.webp`;

const TILE = 256;
const MIN_CLUSTER = 8;

/* Tile levels run opposite to zoom. N1 is half the full canvas; each step
   coarser halves it again, and cuts the tile count by four. A region-sized
   dataset wants N1; anything spanning Teyvat wants N3 or it pulls thousands
   of tiles. */
const SCALE_AT = { 1: 0.5, 2: 0.25, 3: 0.125 };

// ── Args ─────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf('--' + name);
  return i === -1 ? fallback : argv[i + 1];
};
const has = (name) => argv.includes('--' + name);

const mapId = arg('map', '2');
const Q = `map_id=${mapId}&app_sn=ys_obc&lang=en-us`;

const getJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  const json = await res.json();
  if (json.retcode !== 0) throw new Error(`${url} → retcode ${json.retcode}`);
  return json.data;
};

// ── Discovery mode ───────────────────────────────────────────────
const tree = await getJson(`${API}v1/map/label/tree?${Q}`);

if (has('labels')) {
  const filter = (arg('labels', '') || '').toLowerCase();
  for (const group of tree.tree || []) {
    const kids = (group.children || []).filter(
      (c) => !filter || c.name.toLowerCase().includes(filter) ||
             group.name.toLowerCase().includes(filter)
    );
    if (!kids.length) continue;
    console.log(`\n${group.name}`);
    for (const c of kids) console.log(`  ${String(c.id).padStart(5)}  ${c.name}`);
  }
  console.log('\nBuild one with:  node tools/build-map-data.mjs --label <id>');
  process.exit(0);
}

const labelId = Number(arg('label', 603));
const outPath = arg('out', 'features/map/map.data.js');
const globalName = arg('global', 'SAURIAN_MAP');
const LEVEL = Number(arg('level', 1));
const SCALE = SCALE_AT[LEVEL];
if (!SCALE) throw new Error(`--level must be 1, 2 or 3 (got ${arg('level')})`);

// ── Current basemap config ───────────────────────────────────────
const list = await getJson(`${API}v1/map/list?${Q}`);

/* Map nodes come back as a tree; only one carries a live basemap. */
const findBasemap = (nodes) => {
  for (const n of nodes || []) {
    if (n.detail_v2?.map_version) return n;
    const hit = findBasemap(n.children);
    if (hit) return hit;
  }
  return null;
};

const node = findBasemap(list.all_map_list || []);
if (!node) throw new Error('no map node carried a detail_v2.map_version');

const { map_version: version, origin, total_size: canvas } = node.detail_v2;
console.log(`basemap ${version} · canvas ${canvas[0]}x${canvas[1]} · origin ${origin}`);

const toPx = (x, y) => [
  Math.round((origin[0] + x) * SCALE),
  Math.round((origin[1] + y) * SCALE)
];

// ── Pins ─────────────────────────────────────────────────────────
const { point_list: points } = await getJson(`${API}v1/map/point/list?${Q}`);
const pins = points
  .filter((p) => p.label_id === labelId)
  .map((p) => toPx(p.x_pos, p.y_pos));

if (!pins.length) {
  throw new Error(`label ${labelId} has no pins — run --labels to see valid ids`);
}

const limit = [canvas[0] * SCALE, canvas[1] * SCALE];
for (const [x, y] of pins) {
  if (x < 0 || y < 0 || x > limit[0] || y > limit[1]) {
    throw new Error(`transform wrong: pin ${x},${y} is off a ${limit} canvas`);
  }
}

// ── Tile window ──────────────────────────────────────────────────
const xs = pins.map((p) => p[0]);
const ys = pins.map((p) => p[1]);
const c0 = Math.floor(Math.min(...xs) / TILE);
const c1 = Math.floor(Math.max(...xs) / TILE);
const r0 = Math.floor(Math.min(...ys) / TILE);
const r1 = Math.floor(Math.max(...ys) / TILE);
const off = { x: c0 * TILE, y: r0 * TILE };

const tiles = [];
for (let r = r0; r <= r1; r++) {
  for (let c = c0; c <= c1; c++) {
    tiles.push({
      x: c * TILE - off.x,
      y: r * TILE - off.y,
      url: TILE_URL(version, c, r, LEVEL, mapId)
    });
  }
}

/* Fail loudly rather than shipping a map of broken images. */
const probe = await fetch(tiles[Math.floor(tiles.length / 2)].url);
if (!probe.ok) throw new Error(`tile probe failed → HTTP ${probe.status}`);

// ── Named places inside the window ───────────────────────────────
const anchors = await getJson(`${API}v1/map/map_anchor/list?${Q}`);
const areas = [];
(function walk(nodes, parent) {
  for (const n of nodes || []) {
    if (n.l_x != null && n.r_x != null) {
      const [ax, ay] = toPx((n.l_x + n.r_x) / 2, (n.l_y + n.r_y) / 2);
      const x = ax - off.x;
      const y = ay - off.y;
      const w = (c1 - c0 + 1) * TILE;
      const h = (r1 - r0 + 1) * TILE;
      if (x >= 0 && y >= 0 && x <= w && y <= h) {
        areas.push({ name: n.name.replace(/^"|"$/g, ''), parent, x, y });
      }
    }
    walk(n.children, n.name ? n.name.replace(/^"|"$/g, '') : parent);
  }
})(anchors.list, null);

// ── Teleport waypoints inside the window ─────────────────────────
/* So a circle can be reached, not just found. Statues double as waypoints. */
/* Everything in the map's own Waypoints group is somewhere you can teleport,
   except the Waverider waypoint, which the game itself marks as not
   teleportable. Reading the group beats hardcoding ids that move per patch. */
const NOT_TELEPORTABLE = new Set([190]);
const wpGroup = (tree.tree || []).find((g) => g.name === 'Waypoints');
const WAYPOINT_LABELS = {};
for (const c of wpGroup?.children || []) {
  if (NOT_TELEPORTABLE.has(c.id)) continue;
  WAYPOINT_LABELS[c.id] =
    c.id === 2 ? 'statue' : c.id === 154 ? 'domain' : 'waypoint';
}
const inWindow = (x, y) =>
  x >= 0 && y >= 0 && x <= (c1 - c0 + 1) * TILE && y <= (r1 - r0 + 1) * TILE;

const waypoints = [];
for (const p of points) {
  const kind = WAYPOINT_LABELS[p.label_id];
  if (!kind) continue;
  const [wx, wy] = toPx(p.x_pos, p.y_pos);
  const x = wx - off.x;
  const y = wy - off.y;
  if (inWindow(x, y)) waypoints.push({ x, y, kind });
}

// ── Clusters ─────────────────────────────────────────────────────
const CELL = 300 * SCALE;
const bins = new Map();
for (const p of pins) {
  const key = `${Math.floor(p[0] / CELL)},${Math.floor(p[1] / CELL)}`;
  if (!bins.has(key)) bins.set(key, []);
  bins.get(key).push(p);
}

const clusters = [...bins.values()]
  .filter((v) => v.length >= MIN_CLUSTER)
  .map((v) => {
    const cx = v.reduce((a, p) => a + p[0], 0) / v.length;
    const cy = v.reduce((a, p) => a + p[1], 0) / v.length;
    const spread = Math.max(...v.map((p) => Math.hypot(p[0] - cx, p[1] - cy)));
    const x = Math.round(cx - off.x);
    const y = Math.round(cy - off.y);
    /* Name a cluster after the nearest named place, so it can be spoken about. */
    let near = null, nd = Infinity;
    for (const a of areas) {
      const d = Math.hypot(a.x - x, a.y - y);
      if (d < nd) { nd = d; near = a; }
    }
    /* Distance to the closest teleport, so the page can say how far you walk. */
    let hop = null;
    for (const w of waypoints) {
      const d = Math.hypot(w.x - x, w.y - y);
      if (hop === null || d < hop) hop = d;
    }
    return {
      n: v.length, x, y,
      r: Math.round(Math.max(34, spread + 18)),
      place: near ? near.name : null,
      hop: hop === null ? null : Math.round(hop)
    };
  })
  .sort((a, b) => b.n - a.n);

const data = {
  generatedAt: new Date().toISOString().slice(0, 10),
  basemap: version,
  labelId,
  tileSize: TILE,
  size: { w: (c1 - c0 + 1) * TILE, h: (r1 - r0 + 1) * TILE },
  tiles,
  areas,
  waypoints,
  clusters,
  points: pins.map((p) => [p[0] - off.x, p[1] - off.y])
};

await writeFile(
  new URL('../' + outPath, import.meta.url),
  '/* Generated by tools/build-map-data.mjs — do not hand-edit. */\n' +
    `window.${globalName} = ${JSON.stringify(data)};\n`
);

console.log(
  `${data.points.length} pins · ${clusters.length} clusters · ${areas.length} named places · ` +
    `${waypoints.length} waypoints · ` +
    `${tiles.length} tiles · ${data.size.w}x${data.size.h}px → ${outPath}`
);
