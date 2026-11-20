"""Find the reputation quests you cannot actually start yet.

The reputation lists only show the quest that PAYS reputation. Where that quest
is the tail of a World Quest series, the earlier parts pay nothing and never
appear - so a five-quest chain renders as one short row.

Detecting that from the quest name catches only the ones that say "Part V" on
the tin. This reads the wiki's own infobox instead, which carries two fields
that matter:

    |requirement = Complete [[Tatara Tales (Quest)]]
    |prev        = Tatara Tales: Final Preparations

`prev` is the reliable one - it names the quest immediately before this one, so
walking it backwards gives the chain. `requirement` is free text and catches the
cross-quest gates that `prev` does not.

    python -I tools/fetch-quest-prereqs.py

Writes reference/data/quest-chains.json.

CAVEAT worth keeping in mind: `prev` is not filled in on every page, so the
depth this produces is a LOWER BOUND. Memory's Final Chapter reports depth 1
while its requirement names a whole series. Never present these numbers as
exact; they are "at least this many".
"""

import io
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

API = "https://genshin-impact.fandom.com/api.php"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "reference", "data", "reputation-quests.json")
OUT = os.path.join(ROOT, "reference", "data", "quest-chains.json")
HIDDEN_OUT = os.path.join(ROOT, "reference", "data", "hidden-objectives.json")

# Quest types the wiki's Quest infobox uses. A requirement link to anything else
# (an NPC, "daily reset", an item) is a condition, not a step.
QUEST_TYPES = {"world", "archon", "story", "hangout", "event", "commission", "random"}
# Requirement links: {{Quest|Name}} and [[Name]] / [[Name|label]].
LINK = re.compile(r"\{\{Quest\|([^|}]+)|\[\[([^\]|#]+)")


def links(raw):
    """Page titles linked from a requirement field, in order, without duplicates."""
    out = []
    for a, b in LINK.findall(raw or ""):
        t = (a or b).strip()
        if t and not t.lower().startswith(("file:", "category:")) and t not in out:
            out.append(t)
    return out


def steps_of(text):
    """A Hidden Exploration Objective's ==Steps==, as plain numbered lines."""
    m = re.search(r"==\s*Steps\s*==(.*?)(\n==[^=]|$)", text, re.S)
    if not m:
        return []
    out = []
    for line in m.group(1).splitlines():
        line = line.rstrip()
        if not line.startswith("#") or line.startswith("#:"):
            continue
        depth = len(line) - len(line.lstrip("#"))
        body = clean(line.lstrip("#").strip())
        if body:
            out.append(("  " * (depth - 1)) + body)
    return out

# Quests that gate a whole region. Everyone standing in that region has already
# done them, so flagging each row with "needs the Archon quest" is pure noise.
ENTRY = {
    "The Outlander Who Caught the Wind",
    "Ritou Escape Plan",
}

# Prerequisites that are genuinely blocking for this account even though they
# look routine. A New Star Approaches is the Serenitea Pot quest, still undone.
NOTABLE = {
    # A New Star Approaches is DONE - it is in claimed.json as of 30 Oct 2026.
    # It was wrongly annotated here as "the Serenitea Pot quest, still not done";
    # the Pot quest is A Teapot to Call Home, which is the one still outstanding
    # and which gates Interlude Act II onward.
    "A Teapot to Call Home": "the Serenitea Pot quest - still outstanding, and it "
                             "gates Interlude Act II, which gates Nod-Krai",
}


def api(titles):
    """Fetch wikitext for up to 25 titles. Returns {title: wikitext}."""
    q = {
        "action": "query", "prop": "revisions", "rvprop": "content",
        "rvslots": "main", "format": "json", "redirects": "1",
        "titles": "|".join(titles),
    }
    url = API + "?" + urllib.parse.urlencode(q)
    req = urllib.request.Request(url, headers={"User-Agent": "genshin-notes/1.0"})
    data = json.load(urllib.request.urlopen(req, timeout=30))
    out = {}
    alias = {}
    for key in ("normalized", "redirects"):
        for n in data.get("query", {}).get(key, []):
            alias[n["to"]] = n["from"]
    for page in data.get("query", {}).get("pages", {}).values():
        try:
            text = page["revisions"][0]["slots"]["main"]["*"]
        except (KeyError, IndexError):
            continue
        out[page["title"]] = text
        if page["title"] in alias:
            out[alias[page["title"]]] = text
    return out


def field(text, name, pipes=False):
    """Read one infobox field.

    The value must stay on its own line - a greedy \\s* after the = would
    swallow the newline and capture the NEXT field instead.

    `pipes=True` for values that legitimately contain | because they hold a
    template: {{Quest|Golden Slumber|showType=0}} truncates to "{{Quest"
    otherwise. Plain fields like `prev` stop at the pipe so a trailing
    "|next = ..." on the same line cannot leak in.
    """
    tail = r"[^\n]*" if pipes else r"[^\n|]*"
    m = re.search(r"\|[ \t]*%s[ \t]*=[ \t]*(%s)" % (name, tail), text, re.I)
    return (m.group(1) or "").strip() if m else ""


def clean(s):
    """Wikitext to something readable."""
    s = re.sub(r"\{\{Quest\|([^|}]+)[^}]*\}\}", r"\1", s)
    s = re.sub(r"\{\{Achievement\|([^|}]+)[^}]*\}\}", r"\1", s)
    s = re.sub(r"\[\[([^\]|]+)\|([^\]]+)\]\]", r"\2", s)
    s = re.sub(r"\[\[([^\]]+)\]\]", r"\1", s)
    s = re.sub(r"<br\s*/?>", "; ", s, flags=re.I)
    s = s.replace("''", "").replace("*", " ").replace("(Quest)", "")
    return re.sub(r"\s+", " ", s).strip(" ;*")


def main():
    with io.open(SRC, encoding="utf-8") as fh:
        regions = json.load(fh)

    wanted = [(r, q["name"]) for r, rows in regions.items() for q in rows]
    cache = {}

    def grab(titles):
        todo = [t for t in dict.fromkeys(titles) if t not in cache]
        for i in range(0, len(todo), 25):
            batch = todo[i:i + 25]
            try:
                got = api(batch)
            except Exception as exc:                      # noqa: BLE001
                print("  ! batch failed (%s) - retrying once" % exc)
                time.sleep(2)
                got = api(batch)
            for t in batch:
                text = got.get(t, "")
                hidden = "Hidden Exploration Objectives Infobox" in text[:200]
                # Series (Chapter) and part (Act) pages carry a quest type too, but
                # they are overviews, not quests you start: never a step.
                series = re.search(r"\{\{(Chapter|Act) Infobox", text[:600]) is not None
                typ = (field(text, "type") or "").strip()
                cache[t] = {
                    # Hidden objectives call the field `req`; quests call it `requirement`.
                    "req": field(text, "req" if hidden else "requirement", pipes=True),
                    "prev": clean(field(text, "prev")),
                    "type": typ or "?",
                    "found": bool(text),
                    "kind": "hidden" if hidden else "series" if series
                            else ("quest" if typ.lower() in QUEST_TYPES else "other"),
                }
                if hidden:
                    cache[t]["hidden"] = {
                        "region": field(text, "region"), "area": field(text, "area"),
                        "subarea": field(text, "subarea"), "loc": clean(field(text, "loc", pipes=True)),
                        "characters": [c.strip() for c in field(text, "characters", pipes=True).split(";")
                                       if c.strip() and c.strip() not in ("Traveler", "Paimon")],
                        "steps": steps_of(text),
                    }
            sys.stdout.write("\r  fetched %d" % len(cache))
            sys.stdout.flush()

    print("Reading %d reputation quests" % len(wanted))
    grab([n for _, n in wanted])

    # Walk prev backwards and follow requirement links until nothing new appears:
    # a requirement can name a quest or a hidden objective that has its own.
    for _ in range(8):
        need = [v["prev"] for v in cache.values() if v["prev"] and v["prev"] not in cache]
        need += [l for v in list(cache.values()) for l in links(v["req"]) if l not in cache]
        if not need:
            break
        grab(need)
    print()

    def is_step(title):
        """A linked page you have to DO first: a world quest or a hidden objective.
        Archon and entry quests stay in the requirement text: they are the main story."""
        r = cache.get(title) or {}
        if r.get("kind") == "hidden":
            return True
        return (r.get("kind") == "quest" and r.get("type", "").lower() not in ("archon", "story")
                and title not in ENTRY)

    def gates(name, seen):
        """Steps named in requirements, deepest first: each step's own gates and
        prev chain come before it."""
        out = []
        for l in links((cache.get(name) or {}).get("req")):
            if l in seen or not is_step(l):
                continue
            seen.add(l)
            out += gates(l, seen) + chain(l) + [l]
        return out

    def chain(name, seen=None):
        """Ordered list of quests that come before `name`."""
        seen = seen or set()
        rec = cache.get(name)
        if not rec or not rec["prev"] or name in seen:
            return []
        seen.add(name)
        return chain(rec["prev"], seen) + [rec["prev"]]

    entries = []
    for region, name in wanted:
        rec = cache.get(name) or {}
        # prev chain plus every step the requirement links to, without repeats.
        before = [clean(b) for b in dict.fromkeys(gates(name, {name}) + chain(name))]
        before = [b for b in dict.fromkeys(before)
                  if b != name and (cache.get(b) or {}).get("kind") != "series"]
        req_raw = rec.get("req", "")
        req = clean(req_raw)

        only_entry = req and all(e in req_raw for e in [""]) and any(
            e in req_raw for e in ENTRY) and len(re.findall(r"\[\[", req_raw)) <= 1
        notable = [k for k in NOTABLE if k in req_raw]

        if not before and not req:
            continue

        # An Archon Quest sitting behind the Archon storyline is not a surprise -
        # that IS the main story, and everyone knows it runs in order. The hidden
        # cost is a WORLD quest with world quests stacked behind it, so the two
        # are counted separately and only the world count drives severity.
        own_type = (rec.get("type") or "?").strip()
        world_before = [b for b in before
                        if (cache.get(b, {}).get("type") or "").strip().lower() != "archon"]
        archon_before = len(before) - len(world_before)
        depth = len(world_before)

        if own_type.lower() == "archon":
            sev = "story"
        elif depth >= 6 or re.search(r"\bseries\b", req, re.I):
            sev = "worst"
        elif depth >= 2 or (req and not only_entry):
            sev = "bad"
        elif depth == 1:
            sev = "mild"
        else:
            sev = "entry"
        if only_entry and depth == 0 and own_type.lower() != "archon":
            sev = "entry"
        if notable:
            sev = "bad"

        entries.append({
            "quest": name, "region": region, "severity": sev,
            "type": own_type,
            "priors": depth or None,
            "archonPriors": archon_before or None,
            "before": world_before,
            "hidden": [b for b in world_before if (cache.get(b) or {}).get("kind") == "hidden"],
            "requirement": req,
            "note": NOTABLE[notable[0]] if notable else "",
        })

    rank = {"worst": 0, "bad": 1, "mild": 2, "entry": 3, "story": 4}
    entries.sort(key=lambda e: (rank.get(e["severity"], 9),
                                -(e["priors"] or 0), e["region"], e["quest"]))

    payload = {
        "_checked": time.strftime("%Y-%m-%d"),
        "_by": "tools/fetch-quest-prereqs.py",
        "_why": "The reputation lists only show the quest that PAYS reputation. Where that "
                "quest ends a World Quest series, the earlier parts pay nothing and never "
                "appear, so the row understates the work and its length tier measures the "
                "final part alone.",
        "_caveat": "Counts are a LOWER BOUND. The wiki's prev field is not filled in on every "
                   "page, so a quest can report fewer priors than it really has — Memory's "
                   "Final Chapter reports 1 while its requirement names an entire series.",
        "_source": "Genshin Impact Wiki infobox fields `requirement` and `prev`, via api.php",
        "_entryQuests": sorted(ENTRY),
        "chains": entries,
    }
    with io.open(OUT, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=1, ensure_ascii=False)
        fh.write("\n")

    # Hidden objectives named as steps: where they are and how to solve them.
    hidden = {t: dict(v["hidden"], requirement=clean(v["req"]))
              for t, v in cache.items() if v.get("kind") == "hidden"}
    with io.open(HIDDEN_OUT, "w", encoding="utf-8") as fh:
        json.dump({"_checked": time.strftime("%Y-%m-%d"), "_by": "tools/fetch-quest-prereqs.py",
                   "_source": "Genshin Impact Wiki, Hidden Exploration Objectives infobox and Steps",
                   "objectives": hidden}, fh, indent=1, ensure_ascii=False)
        fh.write("\n")
    print("wrote %s (%d hidden objectives)" % (HIDDEN_OUT, len(hidden)))

    by = {}
    for e in entries:
        by[e["severity"]] = by.get(e["severity"], 0) + 1
    print("wrote %s" % OUT)
    print("  %d quests have a prerequisite" % len(entries))
    print("  " + " · ".join("%s %d" % (k, by[k]) for k in sorted(by)))
    print("  deepest: " + ", ".join(
        "%s (%d)" % (e["quest"], e["priors"]) for e in entries[:5] if e["priors"]))


if __name__ == "__main__":
    main()
