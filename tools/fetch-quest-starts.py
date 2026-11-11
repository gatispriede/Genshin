"""How each reputation quest is actually STARTED.

The infobox `characters` field is a CAST LIST, not a quest giver. Reading its
first name as "the start NPC" sent the user to Harrison for The Ritou Road
(started by a trapdoor; Harrison only appears at night) and to Furuya Noboru
for Reminiscence of Seirai (started by picking up an item near a shrine).

The authority is the quest page itself, in this order:
  1. ==Starting Location== section prose - explicit and written for this
  2. a "To start this quest, ..." / "obtained from X in Y" sentence in the lede
  3. the `startLocation` infobox field, which is a PLACE and can differ from
     the quest's own area - Home Lies Over the Ocean is an Inazuma reputation
     quest that starts in Liyue Harbor

Also records whether a dedicated "Start Location" screenshot exists, which is a
better map than an NPC's location shot whenever the quest is not NPC-given.

    python -I tools/fetch-quest-starts.py [Region]

Writes reference/data/quest-starts.json
"""
import io, json, os, re, subprocess, sys, urllib.parse

API = "https://genshin-impact.fandom.com/api.php"
UA = "Mozilla/5.0 (compatible; genshin-notes/1.0)"
OUT = os.path.join("reference", "data", "quest-starts.json")


def curl(u):
    return subprocess.run(["curl", "-sL", "-H", "User-Agent: " + UA, u],
                          capture_output=True, check=True).stdout.decode()


def api(p):
    return json.loads(curl(API + "?" + urllib.parse.urlencode({**p, "format": "json"})))


def clean(s):
    s = re.sub(r"\[\[([^|\]]*\|)?([^\]]*)\]\]", r"\2", s)
    s = re.sub(r"\{\{[^}]*\}\}", "", s)
    s = re.sub(r"'''''|'''|''", "", s)
    return re.sub(r"\s+", " ", s).strip()


def extract(title, t):
    out = {"quest": title}
    m = re.search(r"\|startLocation\s*=\s*([^\n|]*)", t)
    out["place"] = clean(m.group(1)) if m else None
    m = re.search(r"==\s*Starting Location\s*==(.*?)(?:<gallery|==)", t, re.S)
    if m and clean(m.group(1)):
        out["how"] = clean(m.group(1))[:300]
        out["source"] = "Starting Location section"
    else:
        body = clean(re.sub(r"\{\{Quest Infobox.*?\n\}\}", "", t, flags=re.S))
        m = re.search(r"((?:To start this quest|To begin|is obtained from|"
                      r"is a World Quest obtained from)[^.]*\.)", body)
        if m:
            out["how"] = m.group(1)[:300]
            out["source"] = "lede sentence"
        else:
            out["how"] = None
            out["source"] = None
    out["has_start_shot"] = bool(re.search(r"Start Location[^|\]\n=]*\.png", t, re.I))
    return out


def main():
    region = sys.argv[1] if len(sys.argv) > 1 else "Inazuma"
    data = json.load(io.open(os.path.join("reference", "data",
                                          "reputation-quests.json"), encoding="utf-8"))
    names = [q["name"] for q in data[region] if q.get("group") != "Request"]
    recs = []
    for i in range(0, len(names), 20):
        r = api({"action": "query", "prop": "revisions", "rvprop": "content",
                 "rvslots": "main", "redirects": "1", "titles": "|".join(names[i:i + 20])})
        for p in r["query"]["pages"].values():
            if "revisions" in p:
                recs.append(extract(p["title"], p["revisions"][0]["slots"]["main"]["*"]))
    recs.sort(key=lambda r: r["quest"])
    existing = json.load(io.open(OUT, encoding="utf-8")) if os.path.exists(OUT) else {}
    existing[region] = recs
    with io.open(OUT, "w", encoding="utf-8") as f:
        json.dump(existing, f, ensure_ascii=False, indent=1)
    told = sum(1 for r in recs if r["how"])
    print("%s: %d quests, %d with an explicit start, %d with a Start Location shot"
          % (region, len(recs), told, sum(1 for r in recs if r["has_start_shot"])),
          file=sys.stderr)


if __name__ == "__main__":
    main()
