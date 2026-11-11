"""Which outstanding reputation quests can actually be STARTED right now.

A requirement string is a CONJUNCTION. "Complete Bookworm Swordsman and Ritou
Escape Plan" needs both. Testing it with `"Ritou Escape Plan" in req` reports it
as clear, which is how the user got sent to Aratani for a quest that would not
start. Parse the names out and check every one.

    python -I tools/quest-gates.py [Region]
"""
import io, json, os, re, sys

DONE_BY_PROGRESS = {
    # Archon / story quests not in the reputation lists but provably finished:
    # the account is deep into Inazuma, and claimed.json carries the rest.
    "ritou escape plan",
    "stillness, the sublimation of shadow",
    "omnipresence over mortals",
    "a new star approaches",
}

NOISE = re.compile(r"^(complete|start|the|have|and|any|of|in|your|a|an|total|"
                   r"completions|times|world|quest|series|following)$", re.I)


def names_in(req):
    """Quest-ish names inside a requirement string, split on conjunctions."""
    if not req:
        return []
    out = []
    for part in re.split(r";|\band\b|,(?![^(]*\))", req):
        part = part.strip().strip('"')
        part = re.sub(r"^(Complete|Start)\s+(the\s+)?", "", part, flags=re.I)
        part = re.sub(r"\s+\d+\s*(total\s+)?(times|completions).*$", "", part, flags=re.I)
        part = re.sub(r"\s+(World\s+)?Quest(\s+Series)?$", "", part, flags=re.I)
        part = part.strip(" .;")
        if part and not NOISE.match(part) and len(part) > 3:
            out.append(part)
    return out


def main():
    region = sys.argv[1] if len(sys.argv) > 1 else "Inazuma"
    base = os.path.join("reference", "data")
    L = lambda n: json.load(io.open(os.path.join(base, n), encoding="utf-8"))
    claimed_doc, quests = L("claimed.json"), L("reputation-quests.json")[region]
    chains = {c["quest"].lower(): c for c in L("quest-chains.json")["chains"]
              if c.get("region") == region}
    starts = {r["quest"]: r for r in L("quest-starts.json").get(region, [])}

    done = {q.lower() for q in claimed_doc.get(region, [])} | DONE_BY_PROGRESS
    # A claimed series part implies its series: "Orobashi's Legacy: Part V"
    # satisfies a requirement naming "Orobashi's Legacy series".
    for q in list(done):
        if ":" in q:
            done.add(q.split(":")[0].strip())

    Q = {q["name"]: q for q in quests}
    outstanding = claimed_doc.get(region + "_outstanding") or []
    score = lambda q: (q.get("dlg") or 0) / 1000.0 + (q.get("steps") or 0) * 0.6

    rows = []
    for n in outstanding:
        q = Q.get(n)
        if not q:
            continue
        c = chains.get(n.lower()) or {}
        missing = [b for b in (c.get("before") or []) if b.lower() not in done]
        missing += [r for r in names_in(c.get("requirement"))
                    if r.lower() not in done and r not in missing]
        rows.append((score(q), n, missing, q))

    rows.sort()
    clear = [r for r in rows if not r[2]]
    print("%s: %d outstanding, %d startable now\n" % (region, len(rows), len(clear)))
    for s, n, _, q in clear:
        how = (starts.get(n) or {}).get("how")
        where = q.get("start") or q.get("subarea") or q.get("area") or "?"
        print("  %5.1f  %-42s %s" % (s, n[:42], where))
        if how:
            print("         %s" % how[:120])
    print("\n  -- blocked, with what is missing --")
    for s, n, miss, _ in rows:
        if miss:
            print("  %5.1f  %-42s needs: %s" % (s, n[:42], "; ".join(miss[:3])[:90]))


if __name__ == "__main__":
    main()
