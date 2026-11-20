"""The 5-star artifact troves page: every fixed spot that gives 5-star
artifacts, one annotated map per region, and a card per spot.

    python -I tools/build-artifact-troves.py

Reads   reference/data/artifact-troves.json (facts checked on the wiki; one
        official-map pin per spot)
Writes  artifact-troves.html, assets/troves-<region>.webp

Positions and pictures come from the official map's own pins; the map tiles are
stitched the same way as the reputation route maps (build-rep-route.py), so the
pins and pictures behave the same on flux: click a pin, see where the trove is.
"""

import html
import importlib.util
import io
import json
import os
import re
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import mapsource as ms  # noqa: E402

_spec = importlib.util.spec_from_file_location("rep_route", os.path.join(HERE, "build-rep-route.py"))
rr = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(rr)

DATA = os.path.join("reference", "data", "artifact-troves.json")
OUT = "artifact-troves.html"
MIN_WINDOW = 512      # px of the official map around each region's troves: enough to recognise the place


def esc(s):
    return html.escape(s or "", quote=True)


def point_info(map_id, pin):
    """The pin's community note and picture (v1/map/point/info)."""
    url = "%sv1/map/point/info?map_id=%s&app_sn=ys_obc&lang=en-us&point_id=%s" % (ms.API, map_id, pin)
    r = subprocess.run(["curl", "-sL", url], capture_output=True, check=True)
    return json.loads(r.stdout)["data"]["info"]


def picture(t):
    """Full-size link plus a resized preview. Official-map pictures take the
    OSS resize suffix; wiki pictures are served as they are."""
    img = t.get("img")
    if not img:
        return None, None
    return img, (img + rr.SHOT) if "hoyoverse.com" in img else img


def reward_line(t):
    if t.get("unconfirmed"):
        return "Contents not yet confirmed on the wiki; the older vaults give two 5-star sets and a Dust of Enlightenment."
    if t.get("piece"):
        return "One 5-star piece: %s." % t["piece"]
    return "Two full 5-star sets: %s%s." % (" and ".join(t["sets"]), (", plus a " + t["extra"]) if t.get("extra") else "")


def key_line(t):
    return "%d× %s, from %s." % (t["keys"], t["key"], t["keyFrom"]) if not t.get("unconfirmed") else \
        "3× %s (%s)." % (t["key"], t["keyFrom"])


def card(t):
    full, small = picture(t)
    pic = ('<a href="%s" target="_blank" rel="noopener"><img loading="lazy" style="%s" src="%s" alt="Where %s is"></a>'
           % (esc(full), rr.IMG_BIG, esc(small), esc(t["name"]))) if full else \
        '<div class="dim">No picture on the official map yet.</div>'
    kind = "Quest vault" if t.get("quest") else "Trove"
    return ('<div class="stop" id="q%(n)s" style="%(card)s"><div><span style="%(pill)s">%(n)s</span> <b>%(name)s</b>'
            ' <span style="opacity:.65;font-size:.85rem;margin-left:6px">%(kind)s · %(where)s</span></div>'
            '<div><b>Unlock:</b> %(key)s</div><div><b>Inside:</b> %(reward)s</div>%(note)s%(pic)s</div>'
            % {"n": t["n"], "card": rr.CARD, "pill": rr.PILL, "name": esc(t["name"]), "kind": kind,
               "where": esc(t["where"]), "key": esc(key_line(t)), "reward": esc(reward_line(t)),
               "note": ('<div class="dim">%s</div>' % esc(t["note"])) if t.get("note") else "", "pic": pic})


def marker(t, win):
    x, y = rr.pct(win, t["xy"])
    full, small = picture(t)
    m = {"x": x, "y": y, "role": "warn" if t.get("unconfirmed") else "goal", "layer": "q%d" % t["n"],
         "label": str(t["n"]), "tag": t["where"] if len(t["where"]) <= 24 else t["where"][:23] + "…",
         "title": t["name"]}
    if small:
        m.update(shot=small, card="#q%d" % t["n"], alt="Where %s is" % t["name"],
                 info="%d× %s" % (t["keys"], t["key"]))
    return m


def region_block(r, src):
    slug = "troves-" + re.sub(r"[^a-z0-9]+", "-", r["name"].lower()).strip("-")
    map_id = re.sub(r"-(\w)", lambda m: m.group(1).upper(), slug)
    pts = [t["xy"] for t in r["troves"]]
    w = max(p[0] for p in pts) - min(p[0] for p in pts)
    h = max(p[1] for p in pts) - min(p[1] for p in pts)
    # Troves strung along one axis (Nod-Krai runs north-south) gave a sliver of a
    # map; widen the short side to at least 3:4 around the middle.
    cx, cy = (max(p[0] for p in pts) + min(p[0] for p in pts)) // 2, (max(p[1] for p in pts) + min(p[1] for p in pts)) // 2
    frame = pts + [(cx - h * 3 // 8, cy), (cx + h * 3 // 8, cy), (cx, cy - w * 3 // 8), (cx, cy + w * 3 // 8)]
    win = src.window(frame, pad=max(96, (MIN_WINDOW - max(w, h)) // 2))
    img = "assets/%s.webp" % slug
    rr.stitch(win, img, scale_to=min(rr.MAX_EDGE, rr.MAX_ENLARGE * max(win.w, win.h)), enlarge=True)
    markers = [marker(t, win) for t in r["troves"]]
    legend = [{"layer": m["layer"], "text": "%s · %s" % (m["label"], m["title"]), "role": m["role"]} for m in markers]
    block, draw = rr.map_block(map_id, img, "%s: where each 5-star artifact trove is" % r["name"], legend, win, markers)
    body = "  <h2>%s</h2>\n  <p>%s</p>\n  %s\n%s\n" % (esc(r["name"]), esc(r["intro"]), block,
                                                     "\n".join("  " + card(t) for t in r["troves"]))
    return body, draw


def summary(regions):
    rows = []
    for r in regions:
        sets = sorted({s for t in r["troves"] for s in t["sets"]})
        rows.append("<tr><td>%s</td><td>%d</td><td>%s</td></tr>" % (
            esc(r["name"]), len(r["troves"]),
            esc(", ".join(sets)) if sets else esc(r["troves"][0].get("piece") or "not yet confirmed")))
    return ('<table><thead><tr><th>Region</th><th>Spots</th><th>5-star sets inside</th></tr></thead><tbody>%s</tbody></table>'
            % "".join(rows))


PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>5-star artifact troves: every fixed spot on the map</title>
<link rel="stylesheet" href="styles/map.css">
<style>%(css)s</style>
</head>
<body>
<div class="wrap">
  <h1>5-star artifact troves: every fixed spot on the map</h1>
  <p class="sub">%(count)d places in the open world hand out 5-star artifacts with no resin. Most are Hidden
  Troves: collect the keys from chests nearby, open the trove, take two full 5-star sets. Each opens once and never
  refills, so they are free gear for every account at Adventure Rank 45 or higher.</p>
  <div class="bar key"><b>How it works.</b> Each trove takes the keys of its own area (seals, rings, guides), which
  drop at random from <b>Precious and Luxurious Chests</b> there. Once you hold a full set of keys, the trove can be
  marked on the map from the item in your inventory or with that region's Treasure Compass. Inazuma, Sumeru and
  Fontaine have no trove: their 5-star pieces come from domains and bosses (see <a href="artifacts.html">Artifacts</a>).
  Click a pin to see the spot; numbers match the cards below each map.</div>
  %(summary)s
%(body)s
  <p class="sub">Sources: Genshin Impact Wiki pages Hidden Trove, Tribal Secret Space, Kuuhenki's Hidden Trove,
  Secret Hall of the Realms, Shadow Realm Treasure Vault, Nine Pillars of Peace and each key item (checked %(checked)s);
  HoYoLAB interactive map pins and their pictures. Generated %(date)s.</p>
  <div class="note editor">Built by <code>python -I tools/build-artifact-troves.py</code> from
  reference/data/artifact-troves.json.</div>
</div>
<script type="module">
  import { drawMap } from "./app/annotate.js";
%(draws)s
</script>
<script src="app/nav.js"></script>
</body>
</html>
"""


def main():
    data = json.load(io.open(DATA, encoding="utf-8"))
    n, sources = 0, {}
    for r in data["regions"]:
        src = sources.get(r["map"]) or sources.setdefault(r["map"], ms.MapSource(r["map"]))
        pins = {p["id"]: p for p in src.points}
        for t in r["troves"]:
            n += 1
            t["n"] = n
            p = pins.get(t["pin"])
            if not p:
                raise SystemExit("pin %s (%s) is not on map %s any more" % (t["pin"], t["name"], r["map"]))
            t["xy"] = src.px(p["x_pos"], p["y_pos"])
            if not t.get("img"):
                t["img"] = point_info(r["map"], t["pin"]).get("img") or None
    bodies, draws = [], []
    for r in data["regions"]:
        b, d = region_block(r, sources[r["map"]])
        bodies.append(b)
        draws.append(d)
    io.open(OUT, "w", encoding="utf-8", newline="\n").write(PAGE % {
        "css": rr.CSS, "count": n, "summary": summary(data["regions"]), "body": "\n".join(bodies),
        "checked": data["_checked"], "date": time.strftime("%d %b %Y"), "draws": "\n".join(draws)})
    missing = [t["name"] for r in data["regions"] for t in r["troves"] if not t.get("img")]
    print("%s: %d spots, %d maps; no picture: %s" % (OUT, n, len(bodies), missing or "none"), file=sys.stderr)


if __name__ == "__main__":
    main()
