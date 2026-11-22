"""Wood farming routes: for every wood type, the best loop of 11 trees, numbered
in walking order from the nearest teleport.

Why 11: a chopped tree refreshes once ten OTHER trees have been chopped (Genshin
Impact Wiki, "Wood"), so a loop of 11 trees of one type can be farmed without
stopping: 3 wood a tree, up to the 2,000-a-day cap per wood type.

    python -I tools/build-wood-routes.py

Reads   the official map's Wood layers (one pin per tree; the label tree in
        reference/data/hoyo_tree.json names them)
Writes  wood-farming.html (overview), wood-<region>.html (one per region),
        assets/wood-<wood>-<hash>.webp, reference/data/wood-routes.json (the
        region pages, for tools/flux-tree.mjs)
"""

import glob
import hashlib
import html
import importlib.util
import io
import json
import math
import os
import re
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import mapsource as ms  # noqa: E402

_spec = importlib.util.spec_from_file_location("rep_route", os.path.join(HERE, "build-rep-route.py"))
rr = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(rr)

LOOP = 11              # 1 tree + the 10 that must be chopped before it refreshes
MIN_WINDOW = 192       # px of the official map around a loop: enough to recognise the spot
REGIONS = {1: "Mondstadt", 2: "Liyue", 3: "Inazuma", 4: "Sumeru", 8: "Fontaine",
           11: "Natlan", 13: "Nod-Krai", 16: "Snezhnaya"}
MANIFEST = os.path.join("reference", "data", "wood-routes.json")


def esc(s):
    return html.escape(s or "", quote=True)


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def wood_labels():
    tree = json.load(io.open(os.path.join("reference", "data", "hoyo_tree.json"), encoding="utf-8"))["data"]["tree"]
    return {n["id"]: n["name"] for n in next(n for n in tree if n["name"] == "Wood")["children"]}


def places(src):
    """(name, area, x, y) for every named place on the map, areas and the places in them."""
    out = []
    for top in ms.get("v1/map/map_anchor/list", src.map_id)["list"]:
        area = (top.get("name") or "").strip('"')
        for n in [top] + (top.get("children") or []):
            if n.get("l_x") is not None:
                out.append(((n.get("name") or "").strip('"'), area,
                            *src.px((n["l_x"] + n["r_x"]) / 2.0, (n["l_y"] + n["r_y"]) / 2.0)))
    return out


def walk_order(start, pts):
    """Nearest-neighbour order from `start` (the teleport): the route as walked."""
    left, path, at = list(pts), [], start
    while left:
        nxt = min(left, key=lambda q: math.dist(at, q["xy"]))
        left.remove(nxt)
        path.append(nxt)
        at = nxt["xy"]
    return path


def best_loop(trees):
    """The 11 trees packed closest together: the tree whose 10th-nearest
    neighbour is nearest, with those neighbours."""
    best = None
    for t in trees:
        near = sorted(trees, key=lambda u: math.dist(t["xy"], u["xy"]))[:LOOP]
        r = math.dist(t["xy"], near[-1]["xy"])
        if best is None or r < best[0]:
            best = (r, near)
    return best[1]


def band(px, cuts, words):
    return next((w for c, w in zip(cuts, words) if px <= c), words[-1])


def plan(src):
    floors = src.floors()
    tps = src.teleports()
    named = places(src)
    out = []
    for label, wood in sorted(wood_labels().items(), key=lambda kv: kv[1]):
        trees = [{"xy": src.px(p["x_pos"], p["y_pos"]), "area_id": p["area_id"],
                  "floor": floors.get((p.get("point_group") or {}).get("floor_id"))}
                 for p in src.points if p["label_id"] == label]
        if not trees:
            continue
        surface = [t for t in trees if not t["floor"]]
        pool = surface if len(surface) >= LOOP else trees
        loop = best_loop(pool) if len(pool) >= LOOP else pool
        cx = sum(t["xy"][0] for t in loop) / len(loop)
        cy = sum(t["xy"][1] for t in loop) / len(loop)
        tp = min(tps, key=lambda t: math.dist((t["x"], t["y"]), (cx, cy)))
        route = walk_order((tp["x"], tp["y"]), loop)
        length = sum(math.dist(route[i]["xy"], route[(i + 1) % len(route)]["xy"]) for i in range(len(route)))
        place = min(named, key=lambda n: math.dist((n[2], n[3]), (cx, cy)))
        out.append({
            "wood": wood, "total": len(trees), "region": REGIONS.get(loop[0]["area_id"], "Other"),
            "place": place[0], "area": place[1], "route": route, "tp": tp,
            "loop": len(route) >= LOOP, "underground": bool(loop[0]["floor"]), "floor": loop[0]["floor"],
            # Distances are pixels of the official map at half scale; the page only
            # ever shows them as words, since the map gives no metre scale.
            "walk": band(length, (60, 130), ("short", "medium", "long")),
            "approach": band(math.dist((tp["x"], tp["y"]), (cx, cy)), (40, 90), ("next to it", "a short walk", "a long walk")),
        })
    return out


def stitch_hashed(win, name):
    """Stitch, then name the file by its contents: the flux uploader skips names it has seen."""
    tmp = "assets/%s.tmp.webp" % name
    rr.stitch(win, tmp, scale_to=min(rr.MAX_EDGE, rr.MAX_ENLARGE * max(win.w, win.h)), enlarge=True)
    img = "assets/%s-%s.webp" % (name, hashlib.sha1(io.open(tmp, "rb").read()).hexdigest()[:8])
    for old in glob.glob("assets/%s-*.webp" % name):
        if old.replace(os.sep, "/") not in (img, tmp):
            os.remove(old)
    os.replace(tmp, img)
    return img


def loop_block(src, w):
    pts = [t["xy"] for t in w["route"]] + [(w["tp"]["x"], w["tp"]["y"])]
    extent = max(max(p[0] for p in pts) - min(p[0] for p in pts), max(p[1] for p in pts) - min(p[1] for p in pts))
    win = src.window(pts, pad=max(48, (MIN_WINDOW - extent) // 2))
    img = stitch_hashed(win, "wood-" + slug(w["wood"]))
    x, y = rr.pct(win, (w["tp"]["x"], w["tp"]["y"]))
    markers = [{"x": x, "y": y, "role": "hub", "label": "W", "tag": "Teleport here", "title": "Start: teleport"}]
    for i, t in enumerate(w["route"], 1):
        x, y = rr.pct(win, t["xy"])
        markers.append({"x": x, "y": y, "role": "farm", "size": "sm", "label": str(i), "title": "%s tree %d" % (w["wood"], i)})
    map_id = "wood" + "".join(p.title() for p in slug(w["wood"]).split("-"))
    return rr.map_block(map_id, img, "%s: an %d-tree loop near %s" % (w["wood"], len(w["route"]), w["place"]), [], win, markers)


def card(w):
    how = "" if w["loop"] else ("Fewer than 11 trees of this type stand together, so this spot cannot be looped "
                                "without waiting: chop these, then log out and back in to refresh them.")
    where = "%s, %s" % (w["place"], w["area"]) if w["place"] != w["area"] else w["area"]
    under = (" These trees are on the map's &ldquo;%s&rdquo; layer, not the surface." % esc(w["floor"])) if w["underground"] else ""
    return ('<h2>%s</h2><p><b>Where:</b> %s &middot; <b>Loop:</b> %s walk &middot; <b>From the waypoint:</b> %s '
            '&middot; %d trees of this type on the official map.%s</p>%s'
            % (esc(w["wood"]), esc(where), w["walk"], w["approach"], w["total"], under,
               ("<p>%s</p>" % esc(how)) if how else ""))


HOW_TO = """  <div class="bar key">Teleport to W, chop 1 to 11, then start again at 1: it has refreshed by then.
  <a href="wood-farming.html">How the loop works</a>.</div>"""

MECHANICS = """  <div class="bar key"><b>How wood farming works.</b> Each tree gives up to 3 wood, then stays empty
  until you have chopped <b>ten other trees</b> (or logged out and in). So a loop of 11 trees of one type never runs
  dry: every route here is the tightest 11-tree group of that wood on the official map, numbered in walking order
  from the nearest teleport. You can chop up to <b>2,000 of each wood type a day</b>. Chops are Physical Normal,
  Charged and Plunging Attacks by sword, claymore and polearm users; infused attacks do not count, nor do
  Clorinde's or Skirk's Charged Attacks. Hitting several trees at once still drops wood from only one.</div>"""

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
  <p class="sub">%(sources)s Generated %(date)s.</p>
  <div class="note editor">Built by <code>python -I tools/build-wood-routes.py</code>.</div>
</div>
<script type="module">
  import { drawMap } from "./app/annotate.js";
%(draws)s
</script>
<script src="app/nav.js"></script>
</body>
</html>
"""


SOURCES = ("Sources: HoYoLAB interactive map, Wood layers (one pin per tree) and teleport waypoints; Genshin "
           "Impact Wiki, &ldquo;Wood&rdquo; (refresh rule, daily cap, what counts as a chop), checked 21 Nov 2026.")


def write(path, title, sub, body, draws="", sources=SOURCES):
    """Region pages pass a one-line pointer: the full list lives on the overview, not on nine pages."""
    io.open(path, "w", encoding="utf-8", newline="\n").write(PAGE % {
        "title": title, "sub": sub, "body": body, "css": rr.CSS, "date": time.strftime("%d %b %Y"),
        "draws": draws, "sources": sources})


def main():
    src = ms.MapSource("2")
    woods = plan(src)
    regions = {}
    for w in woods:
        regions.setdefault(w["region"], []).append(w)
    order = [r for r in REGIONS.values() if r in regions] + [r for r in regions if r not in REGIONS.values()]
    pages = []
    for region in order:
        ws = sorted(regions[region], key=lambda w: w["wood"])
        blocks, draws = [], []
        for w in ws:
            block, draw = loop_block(src, w)
            blocks.append("  %s\n  %s" % (card(w), block))
            draws.append(draw)
        href = "wood-%s.html" % slug(region)
        write(href, "Wood farming in %s" % region,
              "%d wood types whose best loop is in %s. Each map: teleport at W, trees numbered in walking order."
              % (len(ws), region), HOW_TO + "\n" + "\n".join(blocks), "\n".join(draws),
              sources='Sources: as on <a href="wood-farming.html">Wood farming routes</a>.')
        pages.append({"href": href, "title": "Wood farming in %s" % region, "woods": [w["wood"] for w in ws]})
        print("  %s: %d wood types" % (href, len(ws)), file=sys.stderr)

    rows = "".join('<tr><td>%s</td><td><a href="%s">%s</a></td><td>%s</td><td>%s</td><td>%s</td></tr>' % (
        esc(w["wood"]), "wood-%s.html" % slug(w["region"]), esc(w["region"]),
        esc(w["place"]), (w["walk"] + " loop") if w["loop"] else "no 11-tree loop", w["approach"])
        for w in sorted(woods, key=lambda w: w["wood"]))
    links = "".join('<li><a href="%s">%s</a> &middot; %s</li>' % (p["href"], esc(p["title"]), esc(", ".join(p["woods"])))
                    for p in pages)
    write("wood-farming.html", "Wood farming routes",
          "The best 11-tree loop for each of the %d wood types, with the teleport to start from." % len(woods),
          MECHANICS + '\n  <h2>By region</h2>\n  <ul class="regions">%s</ul>\n  <h2>Every wood type</h2>\n'
          '  <table><thead><tr><th>Wood</th><th>Region</th><th>Best spot</th><th>Loop</th><th>From the waypoint</th>'
          '</tr></thead><tbody>%s</tbody></table>' % (links, rows))
    io.open(MANIFEST, "w", encoding="utf-8", newline="\n").write(json.dumps(pages, ensure_ascii=False, indent=1) + "\n")
    print("wood-farming.html: %d wood types, %d region pages" % (len(woods), len(pages)), file=sys.stderr)


if __name__ == "__main__":
    main()
