"""Which quests a region's reputation route contains, in what order, and where
each one starts. Used by tools/build-rep-route.py; kept apart so the matching
rules can be read and tested without the page template.

Start positions, best first:
  1. "pin"     - a World Quest pin on the official map whose community text names
                 the quest (reference/data/hoyolab-wq-pins.json). Exact, and
                 usually with a screenshot.
  2. "follow"  - the quest begins where the previous part of its chain ended
                 (its first step is a continuation, not "talk to someone").
  3. "area"    - only the wiki's area/subarea is known: placed at the centre of
                 that named place on the map, labelled with the NPC's name.
Quests with no start on the map at all are kept but not placed:
  "request"    - weekly Reputation Requests/Bounties, taken from the reputation
                 menu (the hand-in NPC is named instead).
  "commission" - commission-type quests; they appear among daily commissions
                 and cannot be started on demand.
  "story"      - Archon/Story quests, started from the quest menu.
  "elsewhere"  - starts in another region.
"""

import io
import json
import os
import re

DATA = os.path.join("reference", "data")

# A pin mentioning a quest right after one of these words names it as a
# PREREQUISITE ("Requirement: complete X"), not as the quest that starts there.
PREREQ_WORDS = ("complete", "completing", "completion", "after", "requirement", "requires", "following", "finish")

# First steps that continue the previous part instead of sending you somewhere.
FOLLOW_ON = re.compile(r"^(go to the deepest|talk to paimon after|find the last place|fight |"
                       r"enter the secret passage|report back)", re.I)


def norm(s):
    return re.sub(r"[^a-z0-9]+", " ", re.sub(r"\(.*?\)", "", (s or "").lower())).strip()


def load(name):
    return json.load(io.open(os.path.join(DATA, name), encoding="utf-8"))


def pin_score(pin, key):
    """Lower is better. None when the pin does not name the quest as its own.

    Whole words only: "...fecundity part i" must not match "part iii". And a
    pin that names the quest only as a prerequisite ("Requirement: complete
    X") is the NEXT quest's pin, so it does not count at all.
    """
    text = " " + norm(pin["content"]) + " "
    for m in re.finditer(r"(?<= )%s(?= )" % re.escape(key), text):
        before = text[max(0, m.start() - 40):m.start()].split()
        if not any(w in before for w in PREREQ_WORDS):
            return m.start()
    return None


def best_pin(name, pins, home_area):
    key = norm(name)
    if len(key) < 4:
        return None
    scored = [(s + (0 if p["area_id"] == home_area else 500), p)
              for p in pins for s in [pin_score(p, key)] if s is not None]
    # Several quests of one series often share a pin; the earliest mention wins.
    if not scored:
        return None
    scored.sort(key=lambda t: t[0])
    return scored[0][1]


def effort(q):
    """Same minutes-ish units as build-reputation-pages.py effort()."""
    return (q.get("dlg") or 0) / 1000.0 + (q.get("steps") or 0) * 0.6


def route(region, home_area, home_names):
    """The ordered route: one entry per reputation quest, chains expanded.

    home_names: area/subarea names that belong to this region's map; a start
    outside them is "elsewhere".
    """
    starts = {k: v for k, v in load("quest-starts.json").items() if v.get("region") == region}
    rep = {q["name"]: q for q in load("reputation-quests.json")[region]}
    chains = {c["quest"]: c for c in load("quest-chains.json")["chains"] if c["region"] == region}
    pins = load("hoyolab-wq-pins.json")["pins"]
    claimed = {norm(n) for n in load("claimed.json").get(region, [])}

    def place(name, prev_entry):
        s = starts.get(name, {})
        r = rep.get(name, {})
        where = s.get("subarea") or s.get("area")
        entry = {"name": name, "npc": (s.get("npcs") or [None])[0], "npcs": s.get("npcs") or [], "firstStep": s.get("firstStep"),
                 "where": where, "requirement": s.get("requirement"), "effort": effort(s)}
        if r.get("group") == "Request":
            entry["start"] = "request"
        elif s.get("type") == "Commission":
            entry["start"] = "commission"
        elif s.get("type") in (None, "Archon", "Story") and not where:
            entry["start"] = "story"
        elif where and where not in home_names:
            entry["start"] = "elsewhere"
        else:
            pin = best_pin(name, pins, home_area)
            if pin and pin["area_id"] != home_area:
                entry.update(start="elsewhere", pin=pin)
            elif pin:
                entry.update(start="pin", pin=pin)
            elif prev_entry and FOLLOW_ON.match(s.get("firstStep") or ""):
                entry["start"] = "follow"
            else:
                entry["start"] = "area"
        return entry

    out = []
    for name, r in rep.items():
        c = chains.get(name) or {}
        before = c.get("before") or [] if c.get("severity") in ("worst", "bad", "mild") else []
        steps, prev = [], None
        for p in before:
            e = place(p, prev)
            e["done"] = norm(p) in claimed
            steps.append(e)
            prev = e
        main = place(name, prev if before else None)
        main["done"] = norm(name) in claimed
        cost = main["effort"] + sum(e["effort"] for e in steps if not e["done"])
        out.append({"quest": main, "chain": steps, "cost": cost, "group": r.get("group")})
    out.sort(key=lambda e: e["cost"])
    return out
