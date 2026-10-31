"""Shared access to the official Genshin map's public data.

Both map builders needed the same basemap lookup, coordinate transform, tile
window and teleport list, and had drifted copies of each. This is the one copy.

Three things are easy to get wrong and are enforced here:

  * Use detail_v2 from /v1/map/list, not /v1/map/info. The info endpoint still
    serves a 2024-04-15 basemap that predates Natlan, so pins land on empty
    canvas.
  * A pin's pixel position is origin + position, with no padding term:
    detail_v2's origin is already in the widened canvas.
  * Tile levels run opposite to zoom. N1 is sharpest (half the canvas), N3 the
    coarsest. There is no N0.
"""

import json
import math
import subprocess

API = "https://sg-public-api.hoyolab.com/common/map_user/ys_obc/"
TILE = 256
SCALE_AT = {1: 0.5, 2: 0.25, 3: 0.125}
TILE_URL = ("https://act-webstatic.hoyoverse.com/map_manage/map/%s/"
            "%s/%d_%d_N%d.webp")
NOT_TELEPORTABLE = {190}        # Waverider waypoint: the game marks it so


def get(path, map_id="2"):
    url = "%s%s?map_id=%s&app_sn=ys_obc&lang=en-us" % (API, path, map_id)
    r = subprocess.run(["curl", "-sL", url], capture_output=True, check=True)
    d = json.loads(r.stdout)
    if d.get("retcode") != 0:
        raise SystemExit("%s -> retcode %s" % (url, d.get("retcode")))
    return d["data"]


class MapSource(object):
    """The live basemap, plus everything positioned on it."""

    def __init__(self, map_id="2", level=1):
        if level not in SCALE_AT:
            raise SystemExit("level must be 1, 2 or 3 (got %r)" % level)
        self.map_id = map_id
        self.level = level
        self.scale = SCALE_AT[level]

        detail = self._find_basemap(get("v1/map/list", map_id).get("all_map_list"))
        if not detail:
            raise SystemExit("no map node carried a detail_v2.map_version")
        self.version = detail["map_version"]
        self.origin = detail["origin"]
        self.canvas = detail["total_size"]
        self.points = get("v1/map/point/list", map_id)["point_list"]

    @staticmethod
    def _find_basemap(nodes):
        for n in nodes or []:
            v = n.get("detail_v2") or {}
            if v.get("map_version"):
                return v
            hit = MapSource._find_basemap(n.get("children"))
            if hit:
                return hit
        return None

    def px(self, x, y):
        """Game position -> pixel on the tile grid at this level."""
        return (int(round((self.origin[0] + x) * self.scale)),
                int(round((self.origin[1] + y) * self.scale)))

    # ── layers ──────────────────────────────────────────────────────────
    def floors(self):
        """floor_id -> floor name. A pin on a named floor is in a cave, a
        sub-level or underwater, which is the only height signal the map has;
        z_level is 0 everywhere except Fontaine, where it is water depth."""
        out = {}
        for grp in get("v2/map/point_group", self.map_id)["list"]:
            for f in grp.get("floors", []):
                name = (f.get("floor_name") or "").strip()
                if name:
                    out[f["id"]] = name
        return out

    def teleports(self):
        """Everything in the map's own Waypoints group that you can warp to."""
        tree = get("v1/map/label/tree", self.map_id)["tree"]
        group = next((g for g in tree if g["name"] == "Waypoints"), None)
        kinds = {c["id"]: ("statue" if c["id"] == 2
                           else "domain" if c["id"] == 154 else "waypoint")
                 for c in (group or {}).get("children", [])
                 if c["id"] not in NOT_TELEPORTABLE}
        out = []
        for p in self.points:
            kind = kinds.get(p["label_id"])
            if kind:
                x, y = self.px(p["x_pos"], p["y_pos"])
                out.append({"x": x, "y": y, "kind": kind})
        return out

    def areas(self):
        """Named places, each at the centre of its anchor box."""
        out = []

        def walk(nodes):
            for n in nodes or []:
                if n.get("l_x") is not None and n.get("r_x") is not None:
                    x, y = self.px((n["l_x"] + n["r_x"]) / 2.0,
                                   (n["l_y"] + n["r_y"]) / 2.0)
                    out.append({"name": (n.get("name") or "").strip('"'),
                                "x": x, "y": y})
                walk(n.get("children"))

        walk(get("v1/map/map_anchor/list", self.map_id)["list"])
        return out

    def labelled(self, label_id):
        return [p for p in self.points if p["label_id"] == label_id]

    # ── framing ─────────────────────────────────────────────────────────
    def window(self, pixels, pad=TILE):
        """Crop the tile grid to the pins, clamped to the canvas edge -
        asking past it returns 404 tiles."""
        xs = [p[0] for p in pixels]
        ys = [p[1] for p in pixels]
        max_c = int(self.canvas[0] * self.scale) // TILE - 1
        max_r = int(self.canvas[1] * self.scale) // TILE - 1
        c0 = max(0, (min(xs) - pad) // TILE)
        c1 = min(max_c, (max(xs) + pad) // TILE)
        r0 = max(0, (min(ys) - pad) // TILE)
        r1 = min(max_r, (max(ys) + pad) // TILE)
        return Window(self, c0, c1, r0, r1)


class Window(object):
    """A tile rectangle, and coordinates rebased into it."""

    def __init__(self, src, c0, c1, r0, r1):
        self.src = src
        self.off_x, self.off_y = c0 * TILE, r0 * TILE
        self.w, self.h = (c1 - c0 + 1) * TILE, (r1 - r0 + 1) * TILE
        self.tiles = [{"x": c * TILE - self.off_x, "y": r * TILE - self.off_y,
                       "url": TILE_URL % (src.map_id, src.version, c, r, src.level)}
                      for r in range(r0, r1 + 1) for c in range(c0, c1 + 1)]

    def inside(self, x, y):
        return 0 <= x <= self.w and 0 <= y <= self.h

    def rebase(self, x, y):
        return (x - self.off_x, y - self.off_y)

    def keep(self, records):
        """Rebase dicts carrying x/y, dropping any that fall outside."""
        out = []
        for rec in records:
            x, y = self.rebase(rec["x"], rec["y"])
            if self.inside(x, y):
                kept = dict(rec)
                kept["x"], kept["y"] = x, y
                out.append(kept)
        return out

    def nearest(self, records, x, y):
        best, bd = None, None
        for rec in records:
            d = math.hypot(rec["x"] - x, rec["y"] - y)
            if bd is None or d < bd:
                bd, best = d, rec
        return best
