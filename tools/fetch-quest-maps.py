"""Download each quest's start-location map image from the wiki.

Fandom quest pages embed screenshots of the in-game map showing exactly where
the quest starts - files named like:

    World Quest Overstretched Start Location.png
    NPC Location Qiaoxi Context.png

That is a real map per quest from the authority, which is better than any pin I
could place myself: the official interactive map's 576 World Quest pins are all
unnamed, so nothing there can be tied to a quest.

    python -I tools/fetch-quest-maps.py [Region] [count]

Writes assets/quest-maps/*.png and reference/data/quest-maps.json
"""

import io
import json
import os
import re
import subprocess
import sys
import urllib.parse

API = "https://genshin-impact.fandom.com/api.php"
UA = "Mozilla/5.0 (compatible; genshin-notes/1.0)"
IMG_DIR = os.path.join("assets", "quest-maps")
OUT = os.path.join("reference", "data", "quest-maps.json")

# "Context" shots are zoomed-out orientation views; the plain Location shot is
# the close-up. Keep both, preferring the close-up for display.
#
# Coverage comes from two places, because neither alone is complete: the quest
# page's own "Start Location" shot, and - for the ~half of quests that have
# none - the giver NPC's page, which almost always carries "NPC Location X".
WANTED = re.compile(r"([A-Za-z0-9 ,'\.\-]*?Location[^|\]\n=]*?\.png)", re.I)


def curl(url, binary=False):
    r = subprocess.run(["curl", "-sL", "-H", "User-Agent: " + UA, url],
                       capture_output=True, check=True)
    return r.stdout if binary else r.stdout.decode("utf-8")


def api(params):
    return json.loads(curl(API + "?" + urllib.parse.urlencode(
        {**params, "format": "json"})))


def wikitext(titles):
    out = {}
    for i in range(0, len(titles), 20):
        r = api({"action": "query", "prop": "revisions", "rvprop": "content",
                 "rvslots": "main", "redirects": "1",
                 "titles": "|".join(titles[i:i + 20])})
        for p in r["query"]["pages"].values():
            if "revisions" in p:
                out[p["title"]] = p["revisions"][0]["slots"]["main"]["*"]
    return out


def image_urls(files):
    """File name -> direct URL, 20 at a time."""
    urls = {}
    for i in range(0, len(files), 20):
        batch = files[i:i + 20]
        r = api({"action": "query", "prop": "imageinfo", "iiprop": "url",
                 "titles": "|".join("File:" + f for f in batch)})
        for p in r["query"]["pages"].values():
            if "imageinfo" in p:
                urls[p["title"][5:]] = p["imageinfo"][0]["url"]
    return urls


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def main():
    region = sys.argv[1] if len(sys.argv) > 1 else "Liyue"
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 0

    data = json.load(io.open(os.path.join("reference", "data",
                                          "reputation-quests.json"),
                             encoding="utf-8"))
    quests = [q for q in data[region]
              if q.get("group") != "Request" and (q.get("dlg") or q.get("steps"))]
    quests.sort(key=lambda q: q["dlg"] / 1000.0 + q["steps"] * 0.6)
    if limit:
        quests = quests[:limit]

    givers = {q["name"]: (q.get("npcs") or [None])[0] for q in quests}
    texts = wikitext([q["name"] for q in quests])
    npc_texts = wikitext(sorted({g for g in givers.values() if g}))

    found, all_files = {}, set()
    for q in quests:
        files = []
        for source in (texts.get(q["name"], ""),
                       npc_texts.get(givers[q["name"]] or "", "")):
            for m in WANTED.findall(source):
                f = m.strip()
                if f and f not in files:
                    files.append(f)
        # Close-ups first, "Context" orientation shots after.
        files.sort(key=lambda f: ("context" in f.lower(), len(f)))
        found[q["name"]] = files
        all_files.update(files)

    urls = image_urls(sorted(all_files))
    os.makedirs(IMG_DIR, exist_ok=True)

    manifest = []
    for q in quests:
        local = []
        for f in found[q["name"]]:
            url = urls.get(f)
            if not url:
                continue
            name = slug(f[:-4]) + ".png"
            path = os.path.join(IMG_DIR, name)
            if not os.path.exists(path):
                blob = curl(url.split("/revision/")[0], binary=True)
                if len(blob) < 1000:          # an error page, not an image
                    continue
                with open(path, "wb") as fh:
                    fh.write(blob)
            local.append({"file": name.replace("\\", "/"),
                          "context": "context" in f.lower()})
        manifest.append({**q, "maps": local})
        print("%-42s %d map%s" % (q["name"][:42], len(local),
                                  "" if len(local) == 1 else "s"),
              file=sys.stderr)

    # Merge, don't clobber: each run covers one region and the others must
    # survive, or the pages built from this file lose their thumbnails.
    existing = {}
    if os.path.exists(OUT):
        existing = json.load(io.open(OUT, encoding="utf-8"))
    existing[region] = manifest
    with io.open(OUT, "w", encoding="utf-8") as f:
        json.dump(existing, f, ensure_ascii=False, indent=1)
    print("wrote " + OUT, file=sys.stderr)


if __name__ == "__main__":
    main()
