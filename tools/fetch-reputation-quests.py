"""Build the reputation-quest dataset for every region that has a Reputation system.

Reads the Fandom wiki's auto-generated "<Region> Quests with Reputation Reward"
categories, then pulls each quest's wikitext for its start NPC, location, and
two objective proxies for how long the quest takes:

  dlg   - characters of ==Dialogue== section. The single best length signal.
  steps - top-level numbered objectives under ==Steps==.

Why the category and not the "<Region> Reputation EXP" page: the category is
emitted by each quest's own infobox (|rep = <Region>), so it cannot drift. The
prose page is transcribed by hand and was missing entries.

The wiki's api.php answers curl with a User-Agent. Only article HTML returns 402.

    python -I tools/fetch-reputation-quests.py

Writes reference/data/reputation-quests.json
"""

import io
import json
import os
import re
import subprocess
import sys
import time
import urllib.parse

API = "https://genshin-impact.fandom.com/api.php"
UA = "Mozilla/5.0 (compatible; genshin-notes/1.0)"

# Mondstadt and Snezhnaya deliberately excluded - Snezhnaya has no Reputation
# system at all, and Mondstadt is already near its cap on this account.
REGIONS = ["Liyue", "Inazuma", "Sumeru", "Fontaine", "Natlan"]

OUT = os.path.join("reference", "data", "reputation-quests.json")


def get(params):
    url = API + "?" + urllib.parse.urlencode({**params, "format": "json"})
    raw = subprocess.run(
        ["curl", "-s", "-H", "User-Agent: " + UA, url],
        capture_output=True, check=True,
    ).stdout
    return json.loads(raw.decode("utf-8"))


def members(region):
    """Every page in the region's reputation-reward category."""
    out, cont = [], {}
    while True:
        r = get({
            "action": "query", "list": "categorymembers",
            "cmtitle": "Category:%s Quests with Reputation Reward" % region,
            "cmlimit": "500", **cont,
        })
        out += [m["title"] for m in r.get("query", {}).get("categorymembers", [])]
        if "continue" not in r:
            return out
        cont = r["continue"]


def infobox(wt):
    """The {{Quest Infobox}} block, brace-balanced so nested templates survive."""
    i = wt.find("{{Quest Infobox")
    if i < 0:
        return ""
    depth, j = 0, i
    while j < len(wt) - 1:
        if wt.startswith("{{", j):
            depth += 1
            j += 2
            continue
        if wt.startswith("}}", j):
            depth -= 1
            j += 2
            if depth == 0:
                return wt[i:j]
            continue
        j += 1
    return wt[i:]


def field(box, name):
    m = re.search(r"\n\s*\|\s*%s\s*=\s*([^\n]*)" % name, box)
    if not m:
        return None
    v = m.group(1).strip()
    # A blank field followed by the next pipe means "absent", not "|next = ..."
    return None if not v or v.startswith("|") else v


def delink(s):
    if not s:
        return None
    s = re.sub(r"\[\[(?:[^\]|]*\|)?([^\]]*)\]\]", r"\1", s)
    return re.sub(r"<!--.*?-->", "", s, flags=re.S).strip()


def measure(wt):
    """Length proxies. dlg is the dialogue tail; steps are top-level objectives."""
    m = re.search(r"==\s*Dialogue\s*==", wt)
    dlg = len(wt) - m.start() if m else 0

    steps = 0
    m = re.search(r"==\s*Steps?\s*==", wt)
    if m:
        section = re.split(r"\n==[^=]", wt[m.end():])[0]
        steps = len(re.findall(r"^#(?!#)", section, re.M))
    return dlg, steps


def quests(titles):
    """Fetch wikitext in batches of 20 and reduce each to a record."""
    recs = []
    for i in range(0, len(titles), 20):
        batch = titles[i:i + 20]
        r = get({
            "action": "query", "prop": "revisions", "rvprop": "content",
            "rvslots": "main", "redirects": "1", "titles": "|".join(batch),
        })
        for page in r["query"]["pages"].values():
            if "revisions" not in page:
                recs.append({"name": page["title"], "missing": True})
                continue
            wt = page["revisions"][0]["slots"]["main"]["*"]
            box = infobox(wt)
            dlg, steps = measure(wt)
            chars = delink(field(box, "characters")) or ""
            recs.append({
                "name": page["title"],
                "type": field(box, "type"),
                # group=Request marks a WEEKLY Reputation Request: 80 EXP and
                # capped at 3/week shared across nations, NOT an uncapped 100.
                "group": field(box, "group"),
                "start": delink(field(box, "startLocation")),
                "area": delink(field(box, "area")),
                "subarea": delink(field(box, "subarea")),
                # Traveler and Paimon are in every quest; they name no giver.
                "npcs": [c.strip() for c in chars.split(";")
                         if c.strip() and c.strip() not in ("Traveler", "Paimon")],
                "dlg": dlg,
                "steps": steps,
            })
        time.sleep(0.3)
    return recs


def main():
    data = {}
    for region in REGIONS:
        titles = members(region)
        recs = quests(titles)
        recs.sort(key=lambda r: r.get("dlg") or 0)
        data[region] = recs
        world = [r for r in recs if r.get("group") != "Request"
                 and r.get("type") != "Archon" and not r.get("missing")]
        print("%-9s %3d total  %3d world quests  %2d weekly requests"
              % (region, len(recs), len(world),
                 sum(1 for r in recs if r.get("group") == "Request")),
              file=sys.stderr)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with io.open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    print("wrote " + OUT, file=sys.stderr)


if __name__ == "__main__":
    main()
