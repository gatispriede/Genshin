"""Build reference/data/talents.json — which talent book each character needs,
which domain drops it, and on which days.

Nothing here is typed from memory. The character-to-book mapping is read out of
the local char_*.json files (their talent promote costItems name the book), and
the roster with its levels is parsed from the ROSTER array in build-coverage.html,
which is the one place the project records who you own.

Only the domain table below is hand-written, because no local file holds it.

Run:  python tools/build-talent-data.py
"""

import glob
import io
import json
import os
import re
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "reference", "data")

# Verified 1 Nov 2026 against two independent schedules plus the project's own
# Snezhnaya entry in reference/verified-facts.md. Every Domain of Mastery runs
# the same rotation: first series Mon/Thu, second Tue/Fri, third Wed/Sat, and
# all three on Sunday.
DOMAINS = [
    {
        "domain": "Forsaken Rift",
        "region": "Mondstadt",
        "where": "South of Springvale, below the cliffs",
        "series": ["Freedom", "Resistance", "Ballad"],
    },
    {
        "domain": "Taishan Mansion",
        "region": "Liyue",
        "where": "Jueyun Karst, on the lakeside",
        "series": ["Prosperity", "Diligence", "Gold"],
    },
    {
        "domain": "Violet Court",
        "region": "Inazuma",
        "where": "Kannazuka, north of Tatarasuna",
        "series": ["Transience", "Elegance", "Light"],
    },
    {
        "domain": "Steeple of Ignorance",
        "region": "Sumeru",
        "where": "Lokapala Jungle",
        "series": ["Admonition", "Ingenuity", "Praxis"],
    },
    {
        "domain": "Pale Forgotten Glory",
        "region": "Fontaine",
        "where": "Elynas, in the Fontaine wilds",
        "series": ["Equity", "Justice", "Order"],
    },
    {
        "domain": "Blazing Ruins",
        "region": "Natlan",
        "where": "Tezcatepetonco Range",
        "series": ["Contention", "Kindling", "Conflict"],
    },
    {
        "domain": "Relics of the Fallen Grace",
        "region": "Snezhnaya",
        "where": "Fellfrost Peak",
        "series": ["Charity", "Fortitude", "Glory"],
    },
]

# Regions this account has never set foot in, so their domain is unreachable no
# matter how much resin is on hand. Exploration figures live in README.md.
UNREACHABLE = {
    "Sumeru": "Never visited — 0% exploration. The domain cannot be entered.",
    "Inazuma": "Never visited — 0% exploration. The domain cannot be entered.",
}

BOOK_PREFIXES = ("Teachings of ", "Guide to ", "Philosophies of ")


def book_for_character(path):
    """Return the talent book series a character needs, or None.

    Reads the first talent-promote cost item whose name is a talent book. The
    Traveler has none here because their books vary by element.
    """
    with io.open(path, encoding="utf-8") as fh:
        data = json.load(fh)["data"]
    items = data.get("items", {})
    for talent in data.get("talent", {}).values():
        for info in (talent.get("promote") or {}).values():
            for item_id in (info.get("costItems") or {}):
                name = items.get(str(item_id), {}).get("name", "")
                for prefix in BOOK_PREFIXES:
                    if name.startswith(prefix):
                        return name[len(prefix):]
    return None


def roster_levels():
    """Parse name and level out of the ROSTER array in build-coverage.html."""
    page = io.open(os.path.join(ROOT, "build-coverage.html"), encoding="utf-8").read()
    block = re.search(r"const ROSTER = \[(.*?)\n  \];", page, re.S)
    if not block:
        raise SystemExit("ROSTER array not found in build-coverage.html")
    rows = re.findall(r'\[\s*"([^"]+)"\s*,\s*(\d+)', block.group(1))
    return {name: int(level) for name, level in rows}


def main():
    levels = roster_levels()
    books = {}
    for path in sorted(glob.glob(os.path.join(DATA, "char_*.json"))):
        with io.open(path, encoding="utf-8") as fh:
            name = json.load(fh)["data"]["name"]
        books[name] = book_for_character(path)

    characters = []
    for name, level in sorted(levels.items(), key=lambda kv: -kv[1]):
        series = books.get(name)
        if not series:
            continue
        characters.append({"name": name, "level": level, "series": series})

    # Anyone the char files gave no book for. The Traveler lands here on
    # purpose: their talent books change with the element they are using, so a
    # single series would be wrong. Better listed than silently dropped.
    missing = sorted(n for n in levels if not books.get(n))

    domains = []
    for entry in DOMAINS:
        series = []
        for index, name in enumerate(entry["series"]):
            series.append({"name": name, "days": [index + 1, index + 4]})
        domains.append({
            "domain": entry["domain"],
            "region": entry["region"],
            "where": entry["where"],
            "blocked": UNREACHABLE.get(entry["region"]),
            "series": series,
        })

    out = {
        "_generated": date.today().isoformat(),
        "_by": "tools/build-talent-data.py",
        "_note": (
            "Character-to-book comes from the local char_*.json talent costs; "
            "levels come from the ROSTER array in build-coverage.html. Do not "
            "hand-edit — re-run the builder."
        ),
        "_sources": [
            "char_*.json talent promote costItems (local, authoritative)",
            "Domain rotation verified 1 Nov 2026 against two schedules plus "
            "reference/verified-facts.md for Snezhnaya",
        ],
        "_unmapped": missing,
        "days": ["Sunday", "Monday", "Tuesday", "Wednesday",
                 "Thursday", "Friday", "Saturday"],
        "domains": domains,
        "characters": characters,
    }

    target = os.path.join(DATA, "talents.json")
    with io.open(target, "w", encoding="utf-8") as fh:
        json.dump(out, fh, indent=1, ensure_ascii=False)
        fh.write("\n")

    print("wrote %s" % target)
    print("  %d characters mapped, %d domains" % (len(characters), len(domains)))
    if missing:
        print("  no book found for: %s" % ", ".join(missing))


if __name__ == "__main__":
    main()
