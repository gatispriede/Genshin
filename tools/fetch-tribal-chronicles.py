"""Natlan's Tribal Chronicles: each tribe's acts in order and what unlocks them.

Tribal Chronicles are Story Quests taken from the quest menu, so the route map
has no start to show for them; what a player needs is the order and the gate
(Adventure Rank and an Archon quest). Both come from the wiki's own table on
the "Tribal Chronicles" page.

    python -I tools/fetch-tribal-chronicles.py

Writes reference/data/tribal-chronicles.json
"""

import io
import json
import os
import re
import subprocess
import time
import urllib.parse

API = "https://genshin-impact.fandom.com/api.php"
UA = "Mozilla/5.0 (compatible; genshin-notes/1.0)"
OUT = os.path.join("reference", "data", "tribal-chronicles.json")


def wikitext(page):
    url = API + "?" + urllib.parse.urlencode({"action": "parse", "page": page, "prop": "wikitext",
                                              "format": "json", "redirects": "1"})
    raw = subprocess.run(["curl", "-s", "-H", "User-Agent: " + UA, url], capture_output=True, check=True).stdout
    return json.loads(raw.decode("utf-8"))["parse"]["wikitext"]["*"]


def gate(small):
    """'{{AR|40}}, {{Quest|X (Quest)}}' -> 'Adventure Rank 40 and X'."""
    small = re.sub(r"<!--.*?-->", "", small or "", flags=re.S)
    small = re.split(r"''Recommended", small)[0]
    parts = ["Adventure Rank %s" % a for a in re.findall(r"\{\{AR\|(\d+)\}\}", small)]
    parts += [re.sub(r"\s*\(Quest\)$", "", q) for q in re.findall(r"\{\{Quest\|([^}|]+)", small)]
    return " and ".join(parts) or None


def main():
    text = wikitext("Tribal Chronicles")
    table = text.split("==Available Tribal Chronicles==", 1)[1].split("\n|}", 1)[0]
    tribes, current = [], None
    for row in table.split("\n|-")[1:]:
        m = re.search(r"\{\{Chapter\|([^|}]+).*?<small>[^:<]*:\s*\[\[([^\]]+)\]\]\s*</small>", row, re.S)
        if m:
            current = {"tribe": m.group(2), "chapter": m.group(1), "acts": []}
            tribes.append(current)
        for act in re.finditer(r"'''Act ([IVX]+):'''\s*\[\[([^\]|]+)[^\]]*\]\](?:<br><small>(.*?)</small>)?", row, re.S):
            current["acts"].append({"act": act.group(1), "name": act.group(2), "unlock": gate(act.group(3))})
    io.open(OUT, "w", encoding="utf-8", newline="\n").write(json.dumps(
        {"_checked": time.strftime("%Y-%m-%d"), "_source": "Genshin Impact Wiki, Tribal Chronicles",
         "tribes": tribes}, ensure_ascii=False, indent=1) + "\n")
    for t in tribes:
        print("%-28s %s" % (t["tribe"], " / ".join("%s %s [%s]" % (a["act"], a["name"], a["unlock"] or "-") for a in t["acts"])))


if __name__ == "__main__":
    main()
