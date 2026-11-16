"""Fetch every World Quest pin on the official map, WITH its description.

The point list (v1/map/point/list) gives positions only, which is why
build-quest-map.py once concluded the pins "carry no names". Each pin's own
record (v1/map/point/info) does: community-written text naming the quest
("Starts 'Children of the Forest'. Requirement: complete 'The World of
Aranara'"), and usually a screenshot. Sampled 16 Nov: 23 of 25 filled.

    python -I tools/fetch-wq-pins.py

Writes reference/data/hoyolab-wq-pins.json:
    {"_fetched": ..., "pins": [{id, area_id, x, y, content, img}]}
x / y are the map's own coordinates; MapSource.px() turns them into pixels.
Resumable: pins already in the file are not fetched again.
"""

import io
import json
import os
import subprocess
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mapsource as ms  # noqa: E402

OUT = os.path.join("reference", "data", "hoyolab-wq-pins.json")
WORLD_QUESTS = 52  # label id of "World Quests" in v1/map/label/tree


def info(point_id):
    url = "%sv1/map/point/info?map_id=2&app_sn=ys_obc&lang=en-us&point_id=%s" % (ms.API, point_id)
    r = subprocess.run(["curl", "-sL", url], capture_output=True, check=True)
    return json.loads(r.stdout)["data"]["info"]


def main():
    have = {}
    if os.path.exists(OUT):
        have = {p["id"]: p for p in json.load(io.open(OUT, encoding="utf-8"))["pins"]}
    pins = [p for p in ms.get("v1/map/point/list")["point_list"] if p["label_id"] == WORLD_QUESTS]
    todo = [p for p in pins if p["id"] not in have]
    print("%d pins, %d to fetch" % (len(pins), len(todo)), file=sys.stderr)
    for i, p in enumerate(todo, 1):
        d = info(p["id"])
        have[p["id"]] = {"id": p["id"], "area_id": p["area_id"], "x": p["x_pos"], "y": p["y_pos"],
                         "content": d.get("content") or "", "img": d.get("img") or ""}
        if i % 50 == 0 or i == len(todo):
            io.open(OUT, "w", encoding="utf-8").write(json.dumps(
                {"_fetched": time.strftime("%Y-%m-%d"), "_source": ms.API + "v1/map/point/info",
                 "pins": sorted(have.values(), key=lambda p: p["id"])}, ensure_ascii=False, indent=1))
            print("  %d/%d" % (i, len(todo)), file=sys.stderr)


if __name__ == "__main__":
    main()
