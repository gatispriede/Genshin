"""Where each quest in a region's reputation chains STARTS.

reputation-quests.json covers only the quests that pay reputation. Their chain
pre-quests (quest-chains.json `before`) had no start data, so a route could not
send you to them. This fetches the same infobox fields for every quest in the
region — reputation quests and pre-quests alike — plus the first step, which
names who to talk to ("Talk to Katheryne"), and the requirement line.

    python -I tools/fetch-quest-starts.py Sumeru

Writes reference/data/quest-starts.json, keyed by quest name, merged across
regions. Reuses the infobox parsing in fetch-reputation-quests.py.
"""

import importlib.util
import io
import json
import os
import re
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("rep", os.path.join(HERE, "fetch-reputation-quests.py"))
rep = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(rep)

OUT = os.path.join("reference", "data", "quest-starts.json")


def first_step(wt):
    """Text of objective #1 under ==Steps==, links and templates flattened."""
    m = re.search(r"==\s*Steps?\s*==", wt)
    if not m:
        return None
    section = re.split(r"\n==[^=]", wt[m.end():])[0]
    s = re.search(r"^#(?!#)\s*(.+)$", section, re.M)
    if not s:
        return None
    t = rep.delink(s.group(1))
    t = re.sub(r"\{\{[^{}|]*\|([^{}|]*)(?:\|[^{}]*)?\}\}", r"\1", t)
    return re.sub(r"\s+", " ", t).strip()


NOT_A_GIVER = {"paimon", "traveler", "aether", "lumine", "player", "choose", "option"}


def first_speaker(wt):
    """First named speaker in ==Dialogue== who is not Paimon or the Traveler.

    Usually the quest giver: the wiki writes dialogue as '''Name:''' lines in
    the order the quest plays. Steps like "Head to the rest stop" name nobody,
    and the infobox character list is in order of appearance, not "who gives
    it", so this is the most reliable name a page has.
    """
    m = re.search(r"==\s*Dialogue\s*==", wt)
    if not m:
        return None
    for s in re.finditer(r"'''\s*([^':\n{}\[\]]{2,40}?)\s*:\s*'''", wt[m.end():m.end() + 20000]):
        name = s.group(1).strip()
        if name.lower() not in NOT_A_GIVER and "(" not in name:
            return name
    return None


def titles_for(region):
    reps = json.load(io.open(os.path.join("reference", "data", "reputation-quests.json"), encoding="utf-8"))[region]
    reps = reps.get("world") if isinstance(reps, dict) else reps
    chains = json.load(io.open(os.path.join("reference", "data", "quest-chains.json"), encoding="utf-8"))["chains"]
    pre = [p for c in chains if c["region"] == region for p in (c.get("before") or [])]
    return sorted(set([q["name"] for q in reps] + pre))


def main():
    region = sys.argv[1] if len(sys.argv) > 1 else "Sumeru"
    titles = titles_for(region)
    out = json.load(io.open(OUT, encoding="utf-8")) if os.path.exists(OUT) else {}
    print("%s: %d quests" % (region, len(titles)), file=sys.stderr)
    for i in range(0, len(titles), 20):
        r = rep.get({"action": "query", "prop": "revisions", "rvprop": "content", "rvslots": "main",
                     "redirects": "1", "titles": "|".join(titles[i:i + 20])})
        for page in r["query"]["pages"].values():
            if "revisions" not in page:
                out[page["title"]] = {"region": region, "missing": True}
                continue
            wt = page["revisions"][0]["slots"]["main"]["*"]
            box = rep.infobox(wt)
            dlg, steps = rep.measure(wt)
            chars = rep.delink(rep.field(box, "characters")) or ""
            out[page["title"]] = {
                "region": region,
                "type": rep.field(box, "type"),
                "start": rep.delink(rep.field(box, "startLocation")),
                "area": rep.delink(rep.field(box, "area")),
                "subarea": rep.delink(rep.field(box, "subarea")),
                "requirement": rep.delink(rep.field(box, "requirement")),
                "npcs": [c.strip() for c in chars.split(";") if c.strip() and c.strip() not in ("Traveler", "Paimon")],
                "firstStep": first_step(wt),
                "firstSpeaker": first_speaker(wt),
                "dlg": dlg,
                "steps": steps,
            }
        time.sleep(0.3)
    io.open(OUT, "w", encoding="utf-8").write(json.dumps(out, ensure_ascii=False, indent=1, sort_keys=True))
    print("wrote %s (%d quests total)" % (OUT, len(out)), file=sys.stderr)


if __name__ == "__main__":
    main()
