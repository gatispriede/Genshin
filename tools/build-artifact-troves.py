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

import glob
import hashlib
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
CHEST_CACHE = os.path.join("reference", "data", "trove-key-chests.json")
KEY_CHESTS = {45: "Precious Chest", 46: "Luxurious Chest"}    # official-map labels that can drop trove keys
OUT = "artifact-troves.html"
MIN_WINDOW = 512      # px of the official map around each region's troves: enough to recognise the place


def esc(s):
    return html.escape(s or "", quote=True)


def point_info(map_id, pin):
    """The pin's community note and picture (v1/map/point/info)."""
    url = "%sv1/map/point/info?map_id=%s&app_sn=ys_obc&lang=en-us&point_id=%s" % (ms.API, map_id, pin)
    r = subprocess.run(["curl", "-sL", url], capture_output=True, check=True)
    return json.loads(r.stdout)["data"]["info"]


def area_of(src):
    """A function placing a pixel position in its official-map area.

    The map gives no area borders, only a labelled anchor per area and per place
    inside it. A point belongs to the nearest anchor in its own region (area_id),
    reported as that anchor's area: borders are approximate, regions are exact."""
    seeds = []
    for top in ms.get("v1/map/map_anchor/list", src.map_id)["list"]:
        name = (top.get("name") or "").strip('"')
        for n in [top] + (top.get("children") or []):
            if n.get("l_x") is not None:
                seeds.append((name, top.get("area_id"),
                              src.px((n["l_x"] + n["r_x"]) / 2.0, (n["l_y"] + n["r_y"]) / 2.0)))

    def place(xy, area_id):
        cand = [sd for sd in seeds if sd[1] == area_id] or seeds
        return min(cand, key=lambda sd: (sd[2][0] - xy[0]) ** 2 + (sd[2][1] - xy[1]) ** 2)[0]
    return place


def key_points(t, src, place, cache):
    """Where the trove's keys come from, as map points: the Precious and
    Luxurious Chests the official map has in the key areas, or (Nine Pillars)
    the Statues of The Seven that hand out the stones."""
    if t.get("keyPoints"):
        k = t["keyPoints"]
        pts = [p for p in src.points if p["label_id"] == k["label"] and p["area_id"] == k["area_id"]]
        kind = lambda p: k["what"]
    elif t.get("keyAreas"):
        areas = set(t["keyAreas"])
        pts = [p for p in src.points if p["label_id"] in KEY_CHESTS
               and place(src.px(p["x_pos"], p["y_pos"]), p["area_id"]) in areas]
        kind = lambda p: KEY_CHESTS[p["label_id"]]
    else:
        return []
    out = []
    for p in pts:
        key = "%s:%s" % (src.map_id, p["id"])
        if key not in cache:
            cache[key] = point_info(src.map_id, p["id"]).get("img") or None
        out.append({"id": p["id"], "kind": kind(p), "xy": src.px(p["x_pos"], p["y_pos"]), "img": cache[key]})
    return out


def steps(t):
    """What to do, in order, before the trove opens. Wiki facts only."""
    found = len(t["keyPts"])
    if t.get("quest"):
        return ["Make offerings to Liyue's Statues of The Seven (they take Geoculi) until you hold 9 Stones of "
                "Remembrance. The statues are the small pins on this trove's layer.",
                "Read the inscription at the pin to start the world quest Nine Pillars of Peace, then set a stone "
                "in each of the nine pillars around Cuijue Slope.",
                "Win the fight inside the vault, then take the Royal Flora from the back room, with a Luxurious and "
                "a Precious Chest. Only the host can claim it in co-op."]
    if t.get("unconfirmed"):
        return ["Reach Adventure Rank 45.",
                "Collect 3 Remnant Incense Guides for this vault. The wiki does not list it yet; guides report "
                "they drop from Precious and Luxurious Chests in Teplo Oasis, Hallowed Plain and Wingspan Peak.",
                "Mark the vault from the guides in your inventory or with the Cryo Treasure Compass, then open it."]
    where = " and ".join(t.get("keyAreas") or []) or t["where"]
    mapped = ("%d of those chests are on the map above (small pins on this trove's layer)." % found if found else
              "The official map has not tagged chest tiers in %s yet, so there are no chest pins for it: open "
              "every Precious and Luxurious Chest you find there." % where)
    out = ["Reach Adventure Rank 45: troves stay shut below it."]
    if t["key"].endswith("Ring"):
        frag = t["key"].replace("Ring", "Fragment")
        out.append("Collect 3 %ss: they drop at random from %s. %s" % (frag, t["keyFrom"].split(" from ", 1)[-1], mapped))
        out.append("The three fragments make the %s." % t["key"])
    else:
        source = re.sub(r"^random ", "", t["keyFrom"])
        out.append("Collect %d× %s: they drop at random from %s. %s" % (t["keys"], t["key"], source, mapped))
    out.append("Mark the trove on the map from the key in your inventory (or with that region's Treasure Compass) "
               "and go to the pin.")
    return out


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
            '<div><b>Inside:</b> %(reward)s</div><div><b>To open it:</b></div><ol class="steps">%(steps)s</ol>%(pic)s</div>'
            % {"n": t["n"], "card": rr.CARD, "pill": rr.PILL, "name": esc(t["name"]), "kind": kind,
               "where": esc(t["where"]), "reward": esc(reward_line(t)),
               "steps": "".join("<li>%s</li>" % esc(x) for x in steps(t)), "pic": pic})


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


def key_marker(t, c, win):
    x, y = rr.pct(win, c["xy"])
    m = {"x": x, "y": y, "role": "farm", "size": "sm", "layer": "q%d" % t["n"],
         "title": "%s (keys for %d)" % (c["kind"], t["n"])}
    if c["img"]:
        full = c["img"] + rr.SHOT if "hoyoverse.com" in c["img"] else c["img"]
        m.update(shot=full, alt="Where this %s is" % c["kind"], card="#q%d" % t["n"],
                 info=("Can drop: %s" % t["key"].replace("Ring", "Fragment")) if not t.get("quest")
                 else "Offerings here give Stones of Remembrance")
    return m


def region_block(r, src):
    slug = "troves-" + re.sub(r"[^a-z0-9]+", "-", r["name"].lower()).strip("-")
    map_id = re.sub(r"-(\w)", lambda m: m.group(1).upper(), slug)
    pts = [t["xy"] for t in r["troves"]] + [c["xy"] for t in r["troves"] for c in t["keyPts"]]
    w = max(p[0] for p in pts) - min(p[0] for p in pts)
    h = max(p[1] for p in pts) - min(p[1] for p in pts)
    # Troves strung along one axis (Nod-Krai runs north-south) gave a sliver of a
    # map; widen the short side to at least 3:4 around the middle.
    cx, cy = (max(p[0] for p in pts) + min(p[0] for p in pts)) // 2, (max(p[1] for p in pts) + min(p[1] for p in pts)) // 2
    frame = pts + [(cx - h * 3 // 8, cy), (cx + h * 3 // 8, cy), (cx, cy - w * 3 // 8), (cx, cy + w * 3 // 8)]
    win = src.window(frame, pad=max(96, (MIN_WINDOW - max(w, h)) // 2))
    # The file name carries a hash of the image: the flux uploader skips names it
    # has seen, so a changed map must get a new name to be uploaded at all.
    tmp = "assets/%s.tmp.webp" % slug
    rr.stitch(win, tmp, scale_to=min(rr.MAX_EDGE, rr.MAX_ENLARGE * max(win.w, win.h)), enlarge=True)
    digest = hashlib.sha1(io.open(tmp, "rb").read()).hexdigest()[:8]
    img = "assets/%s-%s.webp" % (slug, digest)
    for old in glob.glob("assets/%s*.webp" % slug):
        if old.replace(os.sep, "/") not in (img, tmp):
            os.remove(old)
    os.replace(tmp, img)
    markers = [marker(t, win) for t in r["troves"]]
    legend = [{"layer": m["layer"], "text": "%s · %s" % (m["label"], m["title"]), "role": m["role"]} for m in markers]
    markers += [key_marker(t, c, win) for t in r["troves"] for c in t["keyPts"]]
    block, draw = rr.map_block(map_id, img, "%s: where each 5-star artifact trove is" % r["name"], legend, win, markers, track=True)
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
  Green numbered pins are the troves; small blue pins are the Precious and Luxurious Chests in each trove's key
  areas, from the official map (it does not mark area borders, so a chest near an edge may belong to the next area).
  Toggling a trove under its map shows or hides its chests. Click any pin for a picture of the spot; numbers match
  the cards below each map.</div>
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
  import { trackDone } from "./app/done.js";
%(draws)s
  trackDone();
</script>
<script src="app/nav.js"></script>
</body>
</html>
"""


def main():
    data = json.load(io.open(DATA, encoding="utf-8"))
    n, sources, places = 0, {}, {}
    cache = json.load(io.open(CHEST_CACHE, encoding="utf-8")) if os.path.exists(CHEST_CACHE) else {}
    for r in data["regions"]:
        src = sources.get(r["map"]) or sources.setdefault(r["map"], ms.MapSource(r["map"]))
        place = places.get(r["map"]) or places.setdefault(r["map"], area_of(src))
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
            t["keyPts"] = key_points(t, src, place, cache)
    io.open(CHEST_CACHE, "w", encoding="utf-8", newline="\n").write(json.dumps(cache, indent=1, sort_keys=True) + "\n")
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
    for r in data["regions"]:
        for t in r["troves"]:
            print("  %2d %-45s key points %d (%d with picture)" % (t["n"], t["name"], len(t["keyPts"]),
                  sum(1 for c in t["keyPts"] if c["img"])), file=sys.stderr)


if __name__ == "__main__":
    main()
