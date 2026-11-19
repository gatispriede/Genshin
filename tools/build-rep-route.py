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
    approx = q["start"] == "area"
    tag = giver(q) or q["name"]
    return {"x": x, "y": y, "role": "warn" if approx else ("goal" if main else "do-now"),
            "layer": rm.quest_layer(q["label"]), "label": q["label"], "tag": ("≈ " if approx else "") + (tag if len(tag) <= 24 else tag[:23] + "…"),
            "title": q["name"], **({} if main else {"size": "sm"}), **rm.shot_fields(q, SHOT)}


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
    step = ("<br><span class=\"dim\">Step 1: %s</span>" % esc(q["firstStep"])) if q.get("firstStep") else ""
    if not bits and q["start"] == "pin":
        bits.append("exact start: dot <b>%s</b> on the map" % esc(q["label"]))
    return " · ".join(bits) + how.get(q["start"], "") + step


TIERS = ((6, "Very short"), (11, "Short"), (20, "Medium"), (1e9, "Long"))


def route_html(region, routed):
    out = []
    for e in routed:
        q, chain = e["quest"], e["chain"]
        tier = next(t for lim, t in TIERS if e["cost"] < lim)
        todo = [c for c in chain if not c.get("dupOf")]
        steps = "".join(
            '<li><span style="%s">%s</span> %s<br>%s%s</li>' % (PILL, c["label"], esc(c["name"]), where_line(c), shot(c, True))
            for c in chain)
        chain_html = ('<details class="chain"><summary>%d quest%s first%s</summary><ol class="steps">%s</ol></details>'
                      % (len(chain), "" if len(chain) == 1 else "s",
                         (" (%d new)" % len(todo)) if len(todo) != len(chain) else "", steps)) if chain else ""
        slug = REGIONS[region]["slug"]
        solo = rm.solo_query(e["n"], len(routed), [slug + "Route", slug + "City"])
        out.append('<div class="stop" id="q%d" style="%s"><div><span style="%s">%d</span> <b>%s</b> '
                   '<span style="opacity:.65;font-size:.85rem;margin-left:6px">%s</span> '
                   '<a href="%s" style="font-size:.85rem;margin-left:6px">show only this on the map</a></div>'
                   '<div>%s</div>%s%s</div>'
                   % (e["n"], CARD, PILL, e["n"], esc(q["name"]), tier, esc(solo), where_line(q), shot(q), chain_html))
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
"""


def main():
    region = sys.argv[1] if len(sys.argv) > 1 else "Sumeru"
    cfg = REGIONS[region]
    src = ms.MapSource(level=LEVEL)
    routed, side = assemble(region)
    every = [q for e in routed for q in e["chain"] + [e["quest"]]]
    locate(cfg, src, every)
    placed = [q for q in every if "xy" in q and not q.get("dupOf")]

    city = next(a for a in src.areas() if a["name"] == cfg["city"])
    near = lambda q: abs(q["xy"][0] - city["x"]) <= CITY_RADIUS and abs(q["xy"][1] - city["y"]) <= CITY_RADIUS
    in_city = [q for q in placed if near(q)]
    outside = [q for q in placed if not near(q)]

    main_win = src.window([q["xy"] for q in placed], pad=96)
    city_win = tight(src, [q["xy"] for q in in_city] + [(city["x"], city["y"])], pad=28)
    slug = cfg["slug"]
    main_img, city_img = "assets/%s-rep-route-map.webp" % slug, "assets/%s-city-rep-route.webp" % slug
    stitch(main_win, main_img)
    stitch(city_win, city_img, scale_to=1024, enlarge=True)

    is_main = lambda q: q["label"].isdigit()
    # City starts go on the main map too, so its legend lists every quest; the
    # close-up repeats them at a scale where they can be told apart.
    main_markers = [marker(q, main_win, is_main(q)) for q in placed]
    x0, y0 = pct(main_win, (city_win.off_x, city_win.off_y))
    x1, y1 = pct(main_win, (city_win.off_x + city_win.w, city_win.off_y + city_win.h))
    main_markers.append({"zone": True, "rect": True, "x": x0, "y": y0, "w": round(x1 - x0, 2), "h": round(y1 - y0, 2),
                         "role": "hub", "tag": "%s: close-up below" % cfg["city"]})
    city_markers = rm.merge_stacked([marker(q, city_win, is_main(q)) for q in in_city])
    main_markers = rm.merge_stacked(main_markers)
    main_legend, city_legend = rm.legend(routed, main_markers), rm.legend(routed, city_markers)

    total = len(routed)
    chained = sum(1 for e in routed if e["chain"])
    page = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>%(region)s reputation quests: route, shortest first</title>
<link rel="stylesheet" href="styles/map.css">
<style>%(css)s</style>
</head>
<body>
<div class="wrap">
  <h1>%(region)s reputation quests: route, shortest first</h1>
  <p class="sub">%(total)d quests that pay reputation, %(chained)d of them behind a chain. Each number is a quest;
  <b>7a, 7b…</b> are the quests you must do before quest 7, in order. Dots mark where each one <b>starts</b>.
  Generated %(date)s from the official map's quest pins and the wiki.</p>

  <div class="bar key"><b>Reading the map.</b> Green pins are the quests that pay; small red pins are chain
  pre-quests. Yellow dots are approximate: the wiki names only the area. Each pin is captioned with who to talk
  to. A pin ending in <b>+</b> is several starts of one quest at one spot; its caption lists them. Every quest
  has its own toggle under the map, and its chain goes with it. City starts are also on the close-up below.</div>

  <div class="map-wrap" id="%(slug)sRoute" data-map="%(main_img)s" data-alt="%(region)s: where each reputation quest starts" data-legend="%(main_legend)s" data-block-w="20" data-label-min-zoom="0" data-height="%(main_height)s"></div>
  <h2>%(city)s close-up</h2>
  <div class="map-wrap" id="%(slug)sCity" data-map="%(city_img)s" data-alt="%(city)s: quest starts inside the city" data-legend="%(city_legend)s" data-block-w="38" data-label-min-zoom="0"></div>

  <h2>The route</h2>
  <div class="note">Shortest first, counting the whole chain, with each pre-quest's own length. Pictures are the
  official map's start screenshots; click one for full size. A pre-quest shared with an earlier chain says
  which step it already was.</div>
%(route)s
%(requests)s
%(commissions)s
%(story)s
%(elsewhere)s
  <p class="sub">Sources: HoYoLAB interactive map, World Quest pins and their notes
  (reference/data/hoyolab-wq-pins.json); Genshin Impact Wiki quest pages (reference/data/quest-starts.json).
  Built by tools/build-rep-route.py.</p>
</div>
<script type="module">
  import { drawMap } from "./app/annotate.js";
  drawMap("#%(slug)sRoute", %(main_markers)s);
  drawMap("#%(slug)sCity", %(city_markers)s);
</script>
<script src="app/nav.js"></script>
</body>
</html>
""" % {
        "region": region, "css": CSS, "total": total, "chained": chained, "date": time.strftime("%d %b %Y"),
        "slug": slug, "city": cfg["city"], "main_img": main_img, "city_img": city_img,
        "route": route_html(region, routed),
        "requests": side_html("Weekly requests and bounties", "Taken from the Reputation menu, not from the map: "
                              "up to 3 a week across all nations. The name is who you hand in to.", side["request"]),
        "commissions": side_html("Commission quests", "These turn up among your daily commissions; you cannot "
                                 "start them on demand.", side["commission"]),
        "story": side_html("Story quests", "Archon or Story quests: start them from the Quests menu.", side["story"]),
        "elsewhere": side_html("Starts outside %s" % region, "The quest that pays is here, but it starts in "
                               "another region.", side["elsewhere"]),
        "main_markers": json.dumps(main_markers, ensure_ascii=False),
        "main_legend": esc(json.dumps(main_legend, ensure_ascii=False)),
        # Viewport as tall as the image is at full width, capped near a screen height.
        "main_height": "min(%.0fvw, %dpx)" % (100.0 * main_win.h / main_win.w, int(1200 * main_win.h / main_win.w)),
        "city_legend": esc(json.dumps(city_legend, ensure_ascii=False)),
        "city_markers": json.dumps(city_markers, ensure_ascii=False),
    }
    out = "%s-rep-route.html" % slug
    io.open(out, "w", encoding="utf-8", newline="\n").write(page)
    print("wrote %s: %d route stops, %d dots (%d in the city close-up), side lists %s" % (
        out, total, len(placed), len(in_city), {k: len(v) for k, v in side.items()}), file=sys.stderr)


if __name__ == "__main__":
    main()
