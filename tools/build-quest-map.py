"""Place every reputation quest on the real game map.

The official interactive map's 576 World Quest pins carry no names, so they
cannot be tied to a quest. What the wiki *does* record exactly is each quest's
subarea - "Liyue Harbor", "Mondstadt City", "Sumeru City" - and the map's own
anchor list gives every named area a bounding box. Matching the two puts each
quest on the map at its named place, which is honest: area-accurate, not
pin-accurate. The per-quest start-location screenshots stay the precise answer,
and each dot links to its own.

Two things about the basemap that are easy to get wrong:

  * Use detail_v2 from /v1/map/list, not /v1/map/info. The info endpoint still
    serves a 2024-04-15 basemap that predates Natlan.
  * A pin's pixel position is origin + position, with no padding term.

Tile levels run opposite to zoom: N1 is sharpest (half scale), N3 coarsest.

    python -I tools/build-quest-map.py

Writes reference/data/quest-map.data.js
"""

import io
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mapsource import MapSource, TILE          # noqa: E402

LEVEL = 2                      # N2: quarter scale, enough for four regions

OUT = os.path.join("reference", "data", "quest-map.data.js")
QUEST_MAPS = os.path.join("reference", "data", "quest-maps.json")
CLAIMED = os.path.join("reference", "data", "claimed.json")




def norm(s):
    """Compare place names without quotes, case or filler words."""
    s = re.sub(r"[^a-z\s]", " ", (s or "").lower())
    return tuple(w for w in s.split() if w not in ("the", "of", "a"))


def main():
    src = MapSource(level=LEVEL)
    version = src.version
    print("basemap %s  canvas %dx%d" % (version, src.canvas[0], src.canvas[1]),
          file=sys.stderr)

    def to_px(x, y):
        return src.px(x, y)

    # --- named places -----------------------------------------------------
    areas = [dict(a, key=norm(a["name"])) for a in src.areas()]
    by_key = {}
    for a in areas:
        by_key.setdefault(a["key"], a)
    print("%d named places" % len(areas), file=sys.stderr)

    # --- teleports --------------------------------------------------------
    waypoints = src.teleports()
    print("%d teleports" % len(waypoints), file=sys.stderr)

    # --- quests -----------------------------------------------------------
    qdata = json.load(io.open(QUEST_MAPS, encoding="utf-8"))
    claimed = json.load(io.open(CLAIMED, encoding="utf-8"))

    # Sub-maps of their own: nothing on the Teyvat canvas can represent them.
    OFF_MAP = {"enkanomiya": "Enkanomiya",
               "sea of bygone eras": "Sea of Bygone Eras",
               "the chasm: underground mines": None}   # surface Chasm is fine

    def variants(raw):
        """Wiki area strings carry suffixes the map's anchors don't use:
        "Vanarana (Subarea)", "The Chasm (Area)", "Liffey Region; Fontaine"."""
        if not raw:
            return
        seen = set()
        for v in (raw,
                  re.sub(r"\s*\([^)]*\)", "", raw),
                  raw.split(";")[0],
                  re.sub(r"\s*\([^)]*\)", "", raw.split(";")[0]),
                  raw.split(":")[0]):
            v = v.strip()
            if v and v not in seen:
                seen.add(v)
                yield v

    quests, unplaced, offmap = [], [], []
    for region, items in qdata.items():
        done = {n.lower() for n in claimed.get(region, []) if isinstance(n, str)}
        for q in items:
            place = None
            for candidate in (q.get("subarea"), q.get("area")):
                for v in variants(candidate):
                    place = by_key.get(norm(v))
                    if place:
                        break
                if place:
                    break

            if not place:
                where = ((q.get("subarea") or "") + " " +
                         (q.get("area") or "")).lower()
                elsewhere = next((label for key, label in OFF_MAP.items()
                                  if label and key in where), None)
                if elsewhere:
                    offmap.append({"name": q["name"], "region": region,
                                   "map": elsewhere,
                                   "where": q.get("subarea") or q.get("area"),
                                   "npc": (q.get("npcs") or [None])[0]})
                else:
                    unplaced.append({"name": q["name"], "region": region,
                                     "where": q.get("subarea") or q.get("area"),
                                     "npc": (q.get("npcs") or [None])[0]})
                continue

            shots = q.get("maps") or []
            close = next((m for m in shots if not m.get("context")), None)
            wide = next((m for m in shots if m.get("context")), None)

            steps = q.get("steps") or 0
            dlg = q.get("dlg") or 0
            score = dlg / 1000.0 + steps * 0.6
            quests.append({
                "name": q["name"],
                "region": region,
                "x": place["x"], "y": place["y"],
                "place": place["name"],
                "npc": (q.get("npcs") or [None])[0],
                "where": q.get("subarea") or q.get("area"),
                "steps": steps, "dlg": dlg,
                "tier": ("very short" if score < 7 else
                         "short" if score < 14 else
                         "medium" if score < 30 else "long"),
                "img": close["file"] if close else None,
                "wide": wide["file"] if wide else None,
                "done": q["name"].lower() in done,
            })

    quests.sort(key=lambda q: q["dlg"] / 1000.0 + q["steps"] * 0.6)
    print("%d placed · %d on other maps · %d with no usable area"
          % (len(quests), len(offmap), len(unplaced)), file=sys.stderr)
    for u in offmap:
        print("  other map (%s): %s" % (u["map"], u["name"]), file=sys.stderr)
    for u in unplaced:
        print("  no area: %s" % u["name"], file=sys.stderr)

    if not quests:
        raise SystemExit("nothing placed - check subarea names")

    # --- tile window ------------------------------------------------------
    win = src.window([(q["x"], q["y"]) for q in quests])
    off_x, off_y = win.off_x, win.off_y
    tiles = win.tiles
    print("%d tiles  %dx%d px" % (len(tiles), win.w, win.h), file=sys.stderr)

    def rebase(records):
        out = []
        for rec in records:
            kept = dict(rec)
            kept.pop("key", None)
            kept["x"], kept["y"] = win.rebase(rec["x"], rec["y"])
            if win.inside(kept["x"], kept["y"]):
                out.append(kept)
        return out

    data = {
        "generatedAt": __import__("datetime").date.today().isoformat(),
        "basemap": version,
        "tileSize": TILE,
        "size": {"w": win.w, "h": win.h},
        "imageBase": "assets/quest-maps/",
        "tiles": tiles,
        "areas": rebase(areas),
        "waypoints": rebase(waypoints),
        "quests": rebase(quests),
        "offMap": offmap,
        "noArea": unplaced,
        "clusters": [],
        "points": [],
    }

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with io.open(OUT, "w", encoding="utf-8") as f:
        f.write("/* Generated by tools/build-quest-map.py - do not hand-edit. */\n")
        f.write("window.QUEST_MAP = ")
        json.dump(data, f, ensure_ascii=False)
        f.write(";\n")
    print("wrote " + OUT, file=sys.stderr)


if __name__ == "__main__":
    main()
