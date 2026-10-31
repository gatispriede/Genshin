/* Renders map markers from data instead of hand-written divs.
 *
 *   <div class="map-wrap" data-map="assets/foo.webp" data-alt="Foo"></div>
 *   <script type="module">
 *     import { drawMap } from "./app/annotate.js";
 *     drawMap("#myMap", [
 *       { x: 48, y: 31, role: "do-now", label: "1", tag: "Statue of the Seven" },
 *       { x: 70, y: 66, role: "goal", label: "★", tag: "Domain", pulse: true },
 *       { zone: true, x: 40, y: 20, w: 22, h: 30, role: "farm", tag: "Ore belt" }
 *     ]);
 *   </script>
 *
 * x / y / w / h are PERCENTAGES of the image box, so the page stays responsive.
 * Use tools/fetch-map.py to get an image's pixel size, then divide.
 */

const TAG_GAP = 2.9;   // vertical % between a pin and its tag

/**
 * @param {string} selector  element with class "map-wrap"
 * @param {Array}  markers   pins and zones, see module docblock
 */
export function drawMap(selector, markers) {
  const box = document.querySelector(selector);
  if (!box) {
    console.warn(`drawMap: no element matches ${selector}`);
    return;
  }

  if (box.dataset.map && !box.querySelector("img")) {
    const img = document.createElement("img");
    img.src = box.dataset.map;
    img.alt = box.dataset.alt || "";
    box.appendChild(img);
  }

  for (const m of markers) {
    if (m.dot)       box.appendChild(buildDot(m));
    else if (m.zone) box.appendChild(buildZone(m));
    else             box.appendChild(buildPin(m));

    if (m.tag) box.appendChild(buildTag(m));
  }
}

/** Scatter many small dots of one kind: dots("#map", "chest", [[12,34],[56,78]]) */
export function dots(selector, kind, pairs) {
  drawMap(selector, pairs.map(([x, y]) => ({ dot: kind, x, y })));
}

function buildDot(m) {
  const el = document.createElement("div");
  el.className = `dot-m ${m.dot}`;
  el.style.left = `${m.x}%`;
  el.style.top  = `${m.y}%`;
  return el;
}

function buildPin(m) {
  const el = document.createElement("div");
  el.className = ["pin", m.role || "do-now", m.size, m.pulse && "pulse"]
    .filter(Boolean).join(" ");
  el.style.left = `${m.x}%`;
  el.style.top  = `${m.y}%`;
  el.textContent = m.label ?? "";
  if (m.title) el.title = m.title;
  return el;
}

function buildZone(m) {
  const el = document.createElement("div");
  el.className = ["zone", m.role, m.rect && "rect"].filter(Boolean).join(" ");
  el.style.left   = `${m.x}%`;
  el.style.top    = `${m.y}%`;
  el.style.width  = `${m.w}%`;
  el.style.height = `${m.h}%`;
  return el;
}

function buildTag(m) {
  const el = document.createElement("div");
  // zones get the chunkier pill label, pins get the thin tag
  const isZone = Boolean(m.zone);
  el.className = isZone
    ? ["zone-label", m.role].filter(Boolean).join(" ")
    : ["tag", m.role].filter(Boolean).join(" ");

  el.style.left = isZone ? `${m.x + m.w / 2}%` : `${m.x}%`;
  el.style.top  = isZone ? `${m.y - 4}%`       : `${m.y + TAG_GAP}%`;
  el.textContent = m.tag;
  return el;
}

/** Convenience: build the small legend under a map. */
export function drawKey(selector, entries) {
  const box = document.querySelector(selector);
  if (!box) return;
  box.className = "key";
  box.innerHTML = entries
    .map(e => `<span><i style="background:var(--${e.role})"></i>${e.text}</span>`)
    .join("");
}
