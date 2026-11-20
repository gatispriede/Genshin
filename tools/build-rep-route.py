"""One page per region: every reputation quest in route order, shortest first,
with each chain's pre-quests before the quest that pays, and every start point
on one region map plus a city close-up.

    python -I tools/build-rep-route.py Sumeru

Reads   reference/data/{reputation-quests,quest-starts,quest-chains,hoyolab-wq-pins,claimed}.json
Writes  <region>-rep-route.html, assets/<region>-rep-route-map.webp,
        assets/<region>-city-rep-route.webp

Positions come from the official map (tools/route_data.py explains the order
of preference). The basemap is the official tile set, stitched by headless
Chrome because this machine has no image library; flux caps uploads at 1920px,
which is why the city gets its own close-up instead of sharing one huge image.
"""

import base64
import html
import io
import json
import os
import re
import subprocess
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mapsource as ms  # noqa: E402
import route_data as rd  # noqa: E402
import route_markers as rm  # noqa: E402

# area_id is the official map's region id (hoyolab-wq-pins.json): 1 Mondstadt,
# 2 Liyue, 3 Inazuma, 4 Sumeru, 8 Fontaine, 11 Natlan, 13 Nod-Krai, 16 Snezhnaya.
REGIONS = {
    "Liyue": {"area_id": 2, "city": "Liyue Harbor", "slug": "liyue"},
    "Inazuma": {"area_id": 3, "city": "Inazuma City", "slug": "inazuma"},
    "Sumeru": {"area_id": 4, "city": "Sumeru City", "slug": "sumeru"},
    "Fontaine": {"area_id": 8, "city": "Court of Fontaine", "slug": "fontaine"},
}
LEVEL = 1                      # half scale: sharp enough for a city close-up
MAX_EDGE = 1920                # flux resizes anything larger anyway
CITY_RADIUS = 110              # px at LEVEL 1 around the city's anchor
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
PORT = 8812
TILE_DIR = os.path.join("tools", ".route-tiles")
SHOT = "?x-oss-process=image/resize,w_640/format,webp"   # 2.3 MB PNG -> ~35 KB


def esc(s):
    return html.escape(s or "", quote=True)


# Inline, not classes: flux keeps style attributes but not this page's <style>.
PILL = "display:inline-block;min-width:1.6em;text-align:center;border-radius:999px;background:#ff5a3c;color:#fff;font-size:.8rem;padding:1px 6px;font-weight:700"
CARD = "border-left:3px solid #ff5a3c;padding:6px 10px;margin:12px 0"
IMG_BIG = "max-width:320px;width:100%;border-radius:6px;display:block;margin-top:6px"
IMG_SMALL = "max-width:200px;width:100%;border-radius:6px;display:block;margin-top:4px"


def letter(i):
    return "abcdefghijklmnopqrstuvwxyz"[i]


# ── positions ──────────────────────────────────────────────────────────────
def locate(region_cfg, src, entries):
    """Attach px (x, y) to every placeable start; mark the rest unplaced."""
    pins = [p for p in rd.load("hoyolab-wq-pins.json")["pins"] if p["area_id"] == region_cfg["area_id"]]
    pts = [src.px(p["x"], p["y"]) for p in pins]
    box = (min(x for x, _ in pts) - 60, min(y for _, y in pts) - 60,
           max(x for x, _ in pts) + 60, max(y for _, y in pts) + 60)
    inside = lambda x, y: box[0] <= x <= box[2] and box[1] <= y <= box[3]
    # "Another region" needs a clear miss: a border place's anchor can sit just
    # past the outermost pin (Valley of Dahri, 64px) while Wangshu Inn is ~900px out.
    FAR = 300
    elsewhere = lambda x, y: not (box[0] - FAR <= x <= box[2] + FAR and box[1] - FAR <= y <= box[3] + FAR)
    areas = src.areas()

    def area_xy(where):
        key = rd.norm(re.sub(r"\(subarea\)", "", where or "", flags=re.I))
        hit = next((a for a in areas if rd.norm(a["name"]) == key), None) or \
            next((a for a in areas if rd.norm(a["name"]).startswith(key)), None) if key else None
        return (hit["x"], hit["y"]) if hit else None

    for q in entries:
        named = area_xy(q["where"])
        if named and elsewhere(*named) and q["start"] in ("pin", "area", "follow"):
            # The wiki names a place outside the region: no pin overrides that
            # (a series name like "Garcia's Paean" matches other quests' pins).
            q["start"] = "elsewhere"
        elif q["start"] == "pin":
            q["xy"] = src.px(q["pin"]["x"], q["pin"]["y"])
        elif q["start"] == "area":
            xy = area_xy(q["where"])
            if xy and inside(*xy):
                q["xy"] = xy
            else:
                q["start"] = "elsewhere"
        elif q["start"] == "follow" and q.get("where"):
            # Continues where the previous part ended: approximate dot at its named place.
            xy = area_xy(q["where"])
            if xy and inside(*xy):
                q["xy"] = xy
    return box


# ── basemap ────────────────────────────────────────────────────────────────
def stitch(window, out_path, scale_to=MAX_EDGE, enlarge=False):
    """Download the window's tiles and compose them with headless Chrome.

    enlarge: scale UP to scale_to as well. The official tiles stop at half scale,
    where a whole city is ~60px wide; enlarging spreads its exact pins apart.
    """
    os.makedirs(TILE_DIR, exist_ok=True)
    tiles = []
    for t in window.tiles:
        name = re.sub(r"[^A-Za-z0-9_.-]", "_", t["url"].split("/map/")[-1])
        path = os.path.join(TILE_DIR, name)
        if not os.path.exists(path):
            subprocess.run(["curl", "-sL", "-o", path, t["url"]], check=True)
        tiles.append({"x": t["x"], "y": t["y"], "src": "/" + path.replace(os.sep, "/")})
    s = scale_to / max(window.w, window.h)
    if not enlarge:
        s = min(1.0, s)
    page = os.path.join(TILE_DIR, "stitch.html")
    io.open(page, "w", encoding="utf-8").write(
        "<!doctype html><body><pre id=o>pending</pre><script>"
        "const T=%s,W=%d,H=%d,S=%f;const c=document.createElement('canvas');"
        "c.width=Math.round(W*S);c.height=Math.round(H*S);const g=c.getContext('2d');g.scale(S,S);"
        "Promise.all(T.map(t=>new Promise(r=>{const i=new Image();i.onload=()=>{g.drawImage(i,t.x,t.y);r()};"
        "i.onerror=r;i.src=t.src}))).then(()=>{o.textContent=c.width+'x'+c.height+'|'+c.toDataURL('image/webp',0.82)});"
        "</script>" % (json.dumps(tiles), window.w, window.h, s))
    server = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"],
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        time.sleep(1)
        dom = subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--virtual-time-budget=20000",
                              "--dump-dom", "http://127.0.0.1:%d/%s" % (PORT, page.replace(os.sep, "/"))],
                             capture_output=True, text=True, encoding="utf-8").stdout
    finally:
        server.terminate()
    m = re.search(r"<pre id=\"o\">(\d+)x(\d+)\|data:image/webp;base64,([^<]+)</pre>", dom)
    if not m:
        raise SystemExit("stitch failed for %s" % out_path)
    io.open(out_path, "wb").write(base64.b64decode(m.group(3)))
    print("  %s %sx%s %d KB" % (out_path, m.group(1), m.group(2), os.path.getsize(out_path) // 1024), file=sys.stderr)


class Crop(object):
    """A pixel rectangle that need not align with tiles (Window always does).
    Same interface stitch() and pct() use: w, h, off_x, off_y, tiles, rebase."""

    def __init__(self, src, x0, y0, x1, y1):
        tile = ms.TILE
        self.off_x, self.off_y, self.w, self.h = x0, y0, x1 - x0, y1 - y0
        self.tiles = [{"x": c * tile - x0, "y": r * tile - y0,
                       "url": ms.TILE_URL % (src.map_id, src.version, c, r, src.level)}
                      for r in range(y0 // tile, (y1 - 1) // tile + 1)
                      for c in range(x0 // tile, (x1 - 1) // tile + 1)]

    def rebase(self, x, y):
        return (x - self.off_x, y - self.off_y)


def tight(src, points, pad):
    """Square crop around points, padded, so a city fills the image."""
    xs, ys = [p[0] for p in points], [p[1] for p in points]
    cx, cy = (min(xs) + max(xs)) // 2, (min(ys) + max(ys)) // 2
    half = max(max(xs) - min(xs), max(ys) - min(ys)) // 2 + pad
    return Crop(src, cx - half, cy - half, cx + half, cy + half)


def pct(window, xy):
    x, y = window.rebase(*xy)
    return round(100.0 * x / window.w, 2), round(100.0 * y / window.h, 2)


# ── route → markers and page ───────────────────────────────────────────────
def assemble(region):
    """Number the route, de-duplicate shared pre-quests, split off the rest."""
    starts = rd.load("quest-starts.json")
    names = {x for v in starts.values() if v.get("region") == region for x in (v.get("subarea"), v.get("area")) if x}
    entries = rd.route(region, REGIONS[region]["area_id"], names)
    routed, side = [], {"request": [], "commission": [], "story": [], "elsewhere": []}
    for e in entries:
        kind = e["quest"]["start"]
        (routed if kind in ("pin", "area", "follow") else side[kind]).append(e)
    seen = {}
    for n, e in enumerate(routed, 1):
        e["n"] = n
        e["quest"]["label"] = str(n)
        for i, q in enumerate(e["chain"]):
            q["label"] = "%d%s" % (n, letter(i))
            if q["name"] in seen:
                q["dupOf"] = seen[q["name"]]
            else:
                seen[q["name"]] = q["label"]
        seen.setdefault(e["quest"]["name"], e["quest"]["label"])
    return routed, side


def giver(q):
    """Who starts the quest, best evidence first: step 1's "Talk to X", the
    pin's "Starting NPC: X", the first speaker in the wiki's dialogue, and only
    then the wiki's character list (in order of appearance, often not the giver)."""
    # "???" is the wiki's unnamed speaker; Paimon is in every quest; "…Note" or
    # "…Letter" is a thing you read. None of them is who to talk to.
    person = lambda s: bool(s) and "?" not in s and s != "Paimon" and not re.search(
        r"\b(note|letter|book|notice|diary|journal|record|sign|inscription|tablet|mural|message|memo)s?\b", s, re.I)
    # Case-insensitive verb, case-SENSITIVE name: "Find the last place..." names nobody.
    m = re.match(r"(?i:talk to|speak (?:to|with)|meet(?: up)? with|find)\s+(?:the\s+)?([A-Z][\w'.-]*(?: [A-Z][\w'.-]*)*)",
                 q.get("firstStep") or "")
    m2 = re.search(r"Starting NPC:\s*([^\n]+)", (q.get("pin") or {}).get("content") or "")
    for cand in (m and m.group(1), m2 and m2.group(1).strip(), q.get("firstSpeaker")):
        if person(cand):
            return cand
    # The wiki's character list is in order of appearance, not "who gives it":
    # trust it only when it names a single NPC. Otherwise the caller uses the quest name.
    npcs = [n for n in (q.get("npcs") or []) if n != "Paimon"]
    return npcs[0] if len(npcs) == 1 else None


def marker(q, window, main):
    x, y = pct(window, q["xy"])
    approx = q["start"] in ("area", "follow")
    tag = giver(q) or q["name"]
    return {"x": x, "y": y, "role": "warn" if approx else ("goal" if main else "do-now"),
            "layer": rm.quest_layer(q["label"]), "label": q["label"], "tag": ("≈ " if approx else "") + (tag if len(tag) <= 24 else tag[:23] + "…"),
            "title": q["name"], **rm.shot_fields(q, SHOT)}


def shot(q, small=False):
    img = (q.get("pin") or {}).get("img")
    if not img:
        return ""
    return '<a href="%s" target="_blank" rel="noopener"><img loading="lazy" style="%s" src="%s" alt="Where %s starts"></a>' % (
        esc(img), IMG_SMALL if small else IMG_BIG, esc(img + SHOT), esc(q["name"]))


def where_line(q):
    if q.get("dupOf"):
        return "already done as <b>%s</b>" % q["dupOf"]
    bits = []
    if giver(q):
        bits.append("<b>%s</b>" % esc(giver(q)))
    if q["where"]:
        bits.append(esc(q["where"]))
    how = {"pin": "", "area": " <span class=\"warn\">(map dot is approximate: area only)</span>",
           "follow": " <span class=\"dim\">(starts where the previous part ends)</span>",
           "elsewhere": " <span class=\"warn\">(starts outside this region)</span>"}
    if q.get("commission"):
        how = dict(how, area=" <span class=\"warn\">(a commission quest: it turns up among your daily commissions "
                              "here once unlocked; map dot is the area)</span>")
    step = ("<br><span class=\"dim\">Step 1: %s</span>" % esc(q["firstStep"])) if q.get("firstStep") else ""
    if not bits and q["start"] == "pin":
        bits.append("exact start: dot <b>%s</b> on the map" % esc(q["label"]))
    return " · ".join(bits) + how.get(q["start"], "") + step


TIERS = ((6, "Very short"), (11, "Short"), (20, "Medium"), (1e9, "Long"))


def requirement_line(q):
    """The wiki's requirement text for this quest or step."""
    req = (q.get("requirement") or "").strip()
    return ('<div class="req"><b>To unlock:</b> %s</div>' % esc(req)) if req else ""


def hidden_html(q):
    """A hidden objective's steps (riddles, puzzles), folded: the wiki's walkthrough."""
    steps = q.get("hidden") or []
    if not steps:
        return ""
    items = "".join('<li%s>%s</li>' % (' class="sub"' if st.startswith("  ") else "", esc(st.strip()))
                    for st in steps)
    return ('<details class="hidden"><summary>Hidden objective: how to solve it</summary><ol class="steps">%s</ol>'
            '</details>' % items)


def step_html(c):
    kind = ' <span class="tag">hidden objective</span>' if c.get("hidden") else ""
    return ('<li><span style="%s">%s</span> %s%s<br>%s%s%s%s</li>'
            % (PILL, c["label"], esc(c["name"]), kind, where_line(c), requirement_line(c), hidden_html(c), shot(c)))


def route_html(map_id, routed):
    """The stops of one page. Every stop says what unlocks it and lists the quests
    (and hidden objectives) that lead to it, in the order you do them."""
    out = []
    for e in routed:
        q, chain = e["quest"], e["chain"]
        tier = next(t for lim, t in TIERS if e["cost"] < lim)
        todo = [c for c in chain if not c.get("dupOf")]
        chain_html = ('<details class="chain" open><summary>%d step%s first%s</summary><ol class="steps">%s</ol></details>'
                      % (len(chain), "" if len(chain) == 1 else "s",
                         (" (%d new)" % len(todo)) if len(todo) != len(chain) else "",
                         "".join(step_html(c) for c in chain))) if chain else ""
        solo = rm.solo_query(e["n"], len(routed), [map_id])
        out.append('<div class="stop" id="q%d" style="%s"><div><span style="%s">%d</span> <b>%s</b> '
                   '<span style="opacity:.65;font-size:.85rem;margin-left:6px">%s</span> '
                   '<a href="%s" style="font-size:.85rem;margin-left:6px">show only this on the map</a></div>'
                   '<div>%s</div>%s%s%s</div>'
                   % (e["n"], CARD, PILL, e["n"], esc(q["name"]), tier, esc(solo), where_line(q),
                      requirement_line(q), shot(q), chain_html))
    return "\n".join(out)


def side_html(title, note, items):
    if not items:
        return ""
    rows = "".join("<li><b>%s</b>%s</li>" % (esc(e["quest"]["name"]),
                   (" — " + esc(e["quest"]["npc"] or "") + (", " + esc(e["quest"]["where"]) if e["quest"]["where"] else ""))
                   if (e["quest"]["npc"] or e["quest"]["where"]) else "") for e in items)
    return '<h2>%s</h2><div class="note">%s</div><ul class="side">%s</ul>' % (title, note, rows)


CSS = """
.stop{background:var(--panel);border-radius:10px;padding:10px 12px;margin:8px 0}
.stop .head{font-size:1.02rem}.stop .body{display:flex;gap:12px;flex-wrap:wrap;margin-top:4px}
.stop .body>div{flex:1 1 260px}.lbl{display:inline-block;min-width:1.6em;text-align:center;border-radius:999px;
background:#ff5a3c;color:#fff;font-size:.8rem;padding:1px 6px}.lbl.big{font-size:.9rem}
.tier{color:var(--dim);font-size:.85rem;margin-left:6px}.shot{max-width:320px;width:100%;border-radius:6px}
.thumb{max-width:200px;width:100%;border-radius:6px;display:block;margin-top:4px}
ol.steps{margin:6px 0 2px 18px}ol.steps li{margin:6px 0}details.chain summary{cursor:pointer;font-weight:600}
.warn{color:var(--warn,#c99a06)}.dim{color:var(--dim)}ul.side li{margin:3px 0}
.req{margin-top:4px;font-size:.9rem}.tag{font-size:.75rem;background:#5b3a8f;color:#fff;border-radius:999px;padding:1px 7px}
details.hidden{margin:4px 0}details.hidden summary{cursor:pointer;font-size:.88rem}ol.steps li.sub{list-style:none;margin-left:12px;opacity:.85}
"""


MIN_AREA = 4          # an area with fewer quests joins its nearest neighbour
MAX_PER_PAGE = 12     # more than this and an area splits by sub-area, then into parts
MIN_WINDOW = 384      # px of the official map an area crop always covers
MAX_ENLARGE = 2       # beyond this the half-scale tiles blur badly (the old city close-up was 4x)


def area_key(name):
    """The wiki's area name, cleaned: "(Area)" suffixes dropped, and the first
    of several areas ("Liffey Region; Fontaine Research Institute…")."""
    name = re.split(r"\s*;\s*", name or "")[0]
    return re.sub(r"\s*\((?:area|subarea)\)", "", name, flags=re.I).strip()


def slugify(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def _centre(es):
    return (sum(e["quest"]["xy"][0] for e in es) / len(es), sum(e["quest"]["xy"][1] for e in es) / len(es))


def _merge_small(groups):
    """Groups under MIN_AREA quests join the nearest big group (by centre)."""
    big = {k: v for k, v in groups.items() if len(v) >= MIN_AREA}
    if not big:
        top = max(groups, key=lambda k: len(groups[k]))
        big = {top: groups[top]}
    merged = {k: [] for k in big}
    for k, v in groups.items():
        if k in big:
            continue
        cx, cy = _centre(v)
        near = min(big, key=lambda b: (_centre(big[b])[0] - cx) ** 2 + (_centre(big[b])[1] - cy) ** 2)
        big[near] = big[near] + v
        merged[near].append(k)
    return big, merged


def group_by_area(routed):
    """Routed quests -> pages of at most MAX_PER_PAGE. By area first; an area
    over the limit splits by sub-area (Liyue Harbor inside Sea of Clouds); a
    sub-area still over it splits into parts, shortest quests first. Small
    groups join the nearest bigger one, so every page has a real list."""
    by_area = {}
    for e in routed:
        by_area.setdefault(area_key(e["quest"].get("area") or e["quest"]["where"]) or "Elsewhere", []).append(e)
    areas, also = _merge_small(by_area)
    out = []
    for area, entries in areas.items():
        if len(entries) <= MAX_PER_PAGE:
            out.append({"area": area, "also": sorted(also[area]), "entries": entries})
            continue
        by_sub = {}
        for e in entries:
            by_sub.setdefault(area_key(e["quest"]["where"]) or area, []).append(e)
        # Small sub-areas around a city keep their own page when there are enough
        # of them together, so the city's parts stay city quests.
        small = [k for k, v in by_sub.items() if len(v) < MIN_AREA]
        if sum(len(by_sub[k]) for k in small) >= MIN_AREA:
            rest = [e for k in small for e in by_sub.pop(k)]
            by_sub["Around " + max(by_sub, key=lambda k: len(by_sub[k]))] = rest
            names = sorted(set(small + also[area]))
        else:
            names = also[area]
        subs, sub_also = _merge_small(by_sub)
        for k in subs:
            if k.startswith("Around "):
                sub_also[k] = names
        for sub, es in subs.items():
            es.sort(key=lambda e: e["cost"])
            n_parts = -(-len(es) // MAX_PER_PAGE)          # ceil
            size = -(-len(es) // n_parts)                   # even parts: 25 -> 9, 8, 8
            parts = [es[i:i + size] for i in range(0, len(es), size)]
            for n, part in enumerate(parts, 1):
                name = sub if len(parts) == 1 else "%s, part %d" % (sub, n)
                out.append({"area": name, "also": sorted(sub_also[sub]) if n == 1 else [], "entries": part})
    for g in out:
        g["entries"].sort(key=lambda e: e["cost"])
    out.sort(key=lambda g: -len(g["entries"]))
    return out


def relabel(entries):
    """Number one page's stops 1..n; chain steps 1a, 1b. A step already listed
    under an earlier quest on the same page says so instead of repeating."""
    seen = {}
    for n, e in enumerate(entries, 1):
        e["n"] = n
        e["quest"]["label"] = str(n)
        for i, q in enumerate(e["chain"]):
            q["label"] = "%d%s" % (n, letter(i))
            q.pop("dupOf", None)
            if q["name"] in seen:
                q["dupOf"] = seen[q["name"]]
            else:
                seen[q["name"]] = q["label"]
        seen.setdefault(e["quest"]["name"], e["quest"]["label"])


PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>%(title)s</title>
<link rel="stylesheet" href="styles/map.css">
<style>%(css)s</style>
</head>
<body>
<div class="wrap">
  <h1>%(title)s</h1>
  <p class="sub">%(sub)s</p>
%(body)s
  <p class="sub">Sources: HoYoLAB interactive map (World Quest pins and their notes); Genshin Impact Wiki quest and
  hidden-objective pages (requirements, steps, start NPCs). Generated %(date)s.</p>
  <div class="note editor">Built by <code>python -I tools/build-rep-route.py %(region)s</code> from
  reference/data/quest-starts.json, quest-chains.json and hidden-objectives.json.</div>
</div>
<script type="module">
  import { drawMap } from "./app/annotate.js";
%(draws)s
</script>
<script src="app/nav.js"></script>
</body>
</html>
"""


def map_block(map_id, img, alt, legend, window, markers):
    height = "min(%.0fvw, %dpx)" % (100.0 * window.h / window.w, int(1200 * window.h / window.w))
    return ('<div class="map-wrap" id="%s" data-map="%s" data-alt="%s" data-legend="%s" data-block-w="24" '
            'data-label-min-zoom="0" data-height="%s"></div>'
            % (map_id, img, esc(alt), esc(json.dumps(legend, ensure_ascii=False)), height),
            '  drawMap("#%s", %s);' % (map_id, json.dumps(markers, ensure_ascii=False)))


def area_page(region, cfg, src, g):
    """One area: its own map crop, its quests shortest first, each with what
    unlocks it and the steps that lead to it."""
    relabel(g["entries"])
    every = [q for e in g["entries"] for q in e["chain"] + [e["quest"]]]
    placed = [q for q in every if "xy" in q and not q.get("dupOf")]
    slug = "%s-rep-%s" % (cfg["slug"], slugify(g["area"]))
    map_id = re.sub(r"-(\w)", lambda m: m.group(1).upper(), slug)
    # Never crop tighter than MIN_WINDOW px of the official map: the tiles stop at
    # half scale, so a tiny crop (a city) has to be blown up and goes blurry. A
    # wider crop shows some surroundings and needs at most MAX_ENLARGE.
    xs, ys = [q["xy"][0] for q in placed], [q["xy"][1] for q in placed]
    extent = max(max(xs) - min(xs), max(ys) - min(ys))
    win = src.window([q["xy"] for q in placed], pad=max(72, (MIN_WINDOW - extent) // 2))
    img = "assets/%s.webp" % slug
    stitch(win, img, scale_to=min(MAX_EDGE, MAX_ENLARGE * max(win.w, win.h)), enlarge=True)
    markers = rm.merge_stacked([marker(q, win, q["label"].isdigit()) for q in placed])
    block, draw = map_block(map_id, img, "%s, %s: where each reputation quest starts" % (g["area"], region),
                            rm.legend(g["entries"], markers), win, markers)
    chained = sum(1 for e in g["entries"] if e["chain"])
    title = g["area"] + (" and nearby" if g["also"] else "")
    sub = ("%d reputation quests in %s%s, shortest first; %d need other quests first, listed under them in order "
           "(<b>3a, 3b</b> before quest 3). <b>To unlock</b> lines are the wiki's requirements."
           % (len(g["entries"]), esc(g["area"]), (" (with %s)" % esc(", ".join(g["also"]))) if g["also"] else "",
              chained))
    body = ('  <div class="bar key"><b>Reading the map.</b> Green pins are the quests that pay; small red pins are the '
            'quests and hidden objectives you do first. Yellow dots are approximate: the wiki names only the area. '
            'Each pin is captioned with who to talk to; each quest has its own toggle under the map.</div>\n  %s\n'
            '  <h2>The route</h2>\n%s' % (block, route_html(map_id, g["entries"])))
    out = slug + ".html"
    io.open(out, "w", encoding="utf-8", newline="\n").write(PAGE % {
        "title": "%s reputation quests: %s" % (region, title), "sub": sub, "body": body, "css": CSS,
        "date": time.strftime("%d %b %Y"), "region": region, "draws": draw})
    return {"href": out, "title": "%s: %s" % (region, title), "area": g["area"], "also": g["also"],
            "quests": len(g["entries"]), "chained": chained,
            "box": [min(q["xy"][0] for q in placed), min(q["xy"][1] for q in placed),
                    max(q["xy"][0] for q in placed), max(q["xy"][1] for q in placed)]}


def overview_page(region, cfg, src, routed, side, areas):
    """The region page: one map with an outline per area, and a card per area."""
    placed = [e["quest"] for e in routed]
    win = src.window([q["xy"] for q in placed], pad=96)
    # New name, not -rep-route-map: the uploader skips names it has seen, and this
    # map has a different crop from the old single-page route map.
    img = "assets/%s-rep-areas-map.webp" % cfg["slug"]
    stitch(win, img)
    markers = []
    for a in areas:
        x0, y0 = pct(win, (a["box"][0] - 20, a["box"][1] - 20))
        x1, y1 = pct(win, (a["box"][2] + 20, a["box"][3] + 20))
        markers.append({"zone": True, "rect": True, "x": x0, "y": y0, "w": round(x1 - x0, 2), "h": round(y1 - y0, 2),
                        "role": "hub", "tag": "%s: %d quests" % (a["area"], a["quests"])})
    for q in placed:
        x, y = pct(win, q["xy"])
        markers.append({"x": x, "y": y, "role": "goal", "size": "sm", "title": q["name"]})
    map_id = cfg["slug"] + "Route"
    block, draw = map_block(map_id, img, "%s: reputation quest areas" % region, [], win, markers)
    cards = "".join('<li><a href="%s">%s</a> · %d quests%s%s</li>' % (
        a["href"], esc(a["title"].split(": ", 1)[1]), a["quests"],
        (", %d behind other quests" % a["chained"]) if a["chained"] else "",
        (" (also %s)" % esc(", ".join(a["also"]))) if a["also"] else "") for a in areas)
    total = len(routed) + sum(len(v) for v in side.values())
    body = '  <h2>Areas</h2>\n  <ul class="regions">%s</ul>\n  %s\n%s%s%s%s' % (
        cards, block,
        side_html("Weekly requests and bounties", "Taken from the Reputation menu, not from the map: up to 3 a week "
                  "across all nations. The name is who you hand in to.", side["request"]),
        side_html("Commission quests", "These turn up among your daily commissions; you cannot start them on "
                  "demand.", side["commission"]),
        side_html("Story quests", "Archon or Story quests: start them from the Quests menu.", side["story"]),
        side_html("Starts outside %s" % region, "The quest that pays is here, but it starts in another region.",
                  side["elsewhere"]))
    sub = ("%d quests pay %s reputation. The ones you start from the map are split by area below, each page with its "
           "own map, the quests shortest first, what unlocks them and the quests that lead to them." % (total, region))
    out = "%s-rep-route.html" % cfg["slug"]
    io.open(out, "w", encoding="utf-8", newline="\n").write(PAGE % {
        "title": "%s reputation quests" % region, "sub": sub, "body": body, "css": CSS,
        "date": time.strftime("%d %b %Y"), "region": region, "draws": draw})
    return out


def write_index(region, areas):
    """The area pages' cards in index.html (the page catalogue), right after the
    region's own card, between markers this script owns."""
    slug = REGIONS[region]["slug"]
    start, end = "<!-- areas:%s -->" % slug, "<!-- /areas:%s -->" % slug
    cards = "".join('\n  <a class="card map" href="%s">\n    <b>%s</b><span>%d reputation quests%s, '
                    'with their own map and the quests that lead to them</span></a>'
                    % (a["href"], esc(a["title"]), a["quests"],
                       (" (also %s)" % esc(", ".join(a["also"]))) if a["also"] else "") for a in areas)
    block = "%s%s\n  %s" % (start, cards, end)
    s = io.open("index.html", encoding="utf-8").read()
    if start in s:
        s = re.sub(re.escape(start) + r".*?" + re.escape(end), lambda m: block, s, flags=re.S)
    else:
        anchor = re.search(r'  <a class="card map" href="%s-rep-route.html">.*?</a>\n' % slug, s, re.S)
        s = s[:anchor.end()] + "  " + block + "\n" + s[anchor.end():]
    io.open("index.html", "w", encoding="utf-8", newline="").write(s)


def main():
    region = sys.argv[1] if len(sys.argv) > 1 else "Sumeru"
    cfg = REGIONS[region]
    src = ms.MapSource(level=LEVEL)
    routed, side = assemble(region)
    locate(cfg, src, [q for e in routed for q in e["chain"] + [e["quest"]]])
    # A quest whose own start could not be placed moves to the side lists.
    side["elsewhere"] += [e for e in routed if "xy" not in e["quest"]]
    routed = [e for e in routed if "xy" in e["quest"]]
    areas = [area_page(region, cfg, src, g) for g in group_by_area(routed)]
    overview_page(region, cfg, src, routed, side, areas)
    write_index(region, areas)
    manifest = os.path.join("reference", "data", "rep-route-areas.json")
    data = json.load(io.open(manifest, encoding="utf-8")) if os.path.exists(manifest) else {}
    data[region] = [{"href": a["href"], "title": a["title"]} for a in areas]
    io.open(manifest, "w", encoding="utf-8").write(json.dumps(data, indent=1, ensure_ascii=False) + "\n")
    print("%s: %d area pages %s" % (region, len(areas), [(a["area"], a["quests"]) for a in areas]), file=sys.stderr)


if __name__ == "__main__":
    main()
