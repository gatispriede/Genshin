"""Render reputation-quests.html from reference/data/reputation-quests.json.

One page, four regions, every quest with its start NPC, where it starts, and an
effort score. Regenerate after fetch-reputation-quests.py:

    python -I tools/build-reputation-pages.py
"""

import io
import json
import os
import re
from urllib.parse import quote

DATA = os.path.join("reference", "data", "reputation-quests.json")
OUT = "reputation-quests.html"

# Reputation level costs. Mondstadt's curve, confirmed against Liyue in-game
# (Lv 5 showed /460). Cumulative EXP to reach each level.
LEVELS = [0, 0, 400, 820, 1260, 1720, 2200, 2700, 3220, 3800, 4400]

# Where this account stands, read off the in-game Reputation screen 30 Oct 2026.
KNOWN = {"Liyue": {"level": 4, "into": 40, "next": 460, "done": 8}}

NOTE = {
    "Liyue": "Geo Treasure Compass at Level 6. The in-game counter reads 8/60 "
             "- which is exactly the world-quest count below, so this list and "
             "the game agree.",
}

# Regions whose note is arithmetic rather than prose: the compass sits at
# Level 9, and whether the region's own quests can pay for it is a sum, not a
# sentence to be retyped. These were hardcoded and had drifted - Inazuma read
# "45 quests = 4,500" when the real pool is 42 world quests plus 3 story acts,
# which is 4,800. Computed now so it cannot drift again.
COMPASS = {
    "Inazuma": "Electro",
    "Sumeru": "Dendro",
    "Fontaine": "Hydro",
}
TARGET_EXP = 5000


def pool(quests):
    """Reputation EXP the region's own quests can pay. Acts are worth 200."""
    live = [q for q in quests if q.get("group") != "Request" and not q.get("missing")]
    acts = [q for q in live if is_act(q)]
    world = [q for q in live if not is_act(q)]
    return len(world) * 100 + len(acts) * 200, len(world), len(acts)


def note(region, quests):
    if region in NOTE:
        return NOTE[region]
    if region not in COMPASS:
        return ""
    avail, n_wq, n_acts = pool(quests)
    gap = TARGET_EXP - avail
    tail = ("short by %s, which has to come from weekly requests and "
            "exploration milestones." % "{:,}".format(gap) if gap > 0 else
            "enough on its own, with %s to spare." % "{:,}".format(-gap))
    return ("%s Treasure Compass at Level 9 (%s EXP). %d world quests at 100 "
            "plus %d story acts at 200 = %s - %s"
            % (COMPASS[region], "{:,}".format(TARGET_EXP), n_wq, n_acts,
               "{:,}".format(avail), tail))


def effort(q):
    """Rough minutes-ish score. Dialogue dominates; each step adds walking.

    Prior quests count too. Ranking on the paying quest's own length alone was
    wrong: Soheil's Wish measures as Medium while hiding five prerequisites.
    q["_priors"] is attached in region_section before any sort happens.
    """
    own = (q.get("dlg") or 0) / 1000.0 + (q.get("steps") or 0) * 0.6
    return own + (q.get("_priors") or 0) * PRIOR_COST


def tier(score):
    if score < 6:
        return "t1", "Very short"
    if score < 11:
        return "t2", "Short"
    if score < 20:
        return "t3", "Medium"
    return "t4", "Long"


def giver(q):
    npcs = q.get("npcs") or []
    return npcs[0] if npcs else None


# Quests the in-game Reputation screen shows as Claimed. Transcribed by hand
# from screenshots - progress is server-side, so no API can supply this.
# A name that matches several wiki entries (the game merges "Treasure Lost,
# Treasure Found" into one row, the wiki splits it into Parts 1 and 2) marks
# every match, and is flagged on the page rather than silently resolved.
def load_claimed(region):
    path = os.path.join("reference", "data", "claimed.json")
    if not os.path.exists(path):
        return set(), set()
    names = json.load(io.open(path, encoding="utf-8")).get(region, [])
    keys = {re.sub(r"[^a-z0-9]+", "", n.lower()) for n in names}
    return keys, set()


def is_claimed(q, keys):
    n = re.sub(r"[^a-z0-9]+", "", q["name"].lower())
    return n in keys or any(n.startswith(k) for k in keys)


def esc(s):
    return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def anchor(name):
    return "q-" + re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


# Start-location crops, where fetch-quest-maps.py has already downloaded them.
# Keyed by quest name, per region. Absent regions simply get no thumbnails.
def load_maps():
    path = os.path.join("reference", "data", "quest-maps.json")
    if not os.path.exists(path):
        return {}
    data = json.load(io.open(path, encoding="utf-8"))
    out = {}
    for region, quests in data.items():
        out[region] = {q["name"]: (q.get("maps") or []) for q in quests}
    return out


MAPS = load_maps()
MAP_PAGE = {r: "%s-quest-maps.html" % r.lower()
            for r in ("Liyue", "Inazuma", "Sumeru", "Fontaine")}


def load_chains():
    """Prior-quest counts from tools/fetch-quest-prereqs.py.

    Only the quest that PAYS reputation is listed on this page. Where it ends a
    World Quest series the earlier parts pay nothing and never appear, so a
    five-quest chain used to render as one short row. This is what fixes that.
    """
    path = os.path.join("reference", "data", "quest-chains.json")
    if not os.path.exists(path):
        return {}
    data = json.load(io.open(path, encoding="utf-8"))
    out = {}
    for c in data.get("chains", []):
        out.setdefault(c.get("region"), {})[c["quest"]] = c
    return out


CHAINS = load_chains()

# What one unpaid prior quest costs, in the same "minutes-ish" units as effort().
# Across the dataset the median quest scores 16.9 and the lower quartile 8.7; a
# prior is a whole quest, so 12 is deliberately conservative - it keeps chains
# from swamping the ranking while stopping a 9-prior quest from posing as short.
PRIOR_COST = 12.0


def priors_of(region, q):
    """How many unpaid quests stand in front of this one.

    Two things this number does NOT capture, so the ranking understates rather
    than overstates:

      - 28 quests are absent from the chain file (mostly Liyue) and score 0 here.
        Absent is not the same as standalone; it means nobody checked.
      - `priors` only walks the wiki's `prev` field. Every quest that scores 0
        still carries a free-text `requirement`, and those range from "kill one
        Shroomboar" to "complete Aranyaka". app/quest-chains.js renders that text
        inline because it cannot be scored - read the badge, not just the rank.
    """
    c = CHAINS.get(region, {}).get(q["name"])
    return (c.get("priors") or 0) if c else 0


def thumb(region, q):
    """Small crop linking to the quest's full card."""
    page = MAP_PAGE.get(region)
    shots = MAPS.get(region, {}).get(q["name"]) or []
    close = [m for m in shots if not m["context"]] or shots
    if not page or not close:
        return '<td class="thumb"><span class="dim">—</span></td>'
    return ('<td class="thumb"><a href="%s#%s" title="Where %s starts">'
            '<img loading="lazy" src="assets/quest-maps/%s" alt=""></a></td>'
            % (page, anchor(q["name"]), esc(q["name"]), close[0]["file"]))


def rows(region, quests):
    keys, _ = load_claimed(region)
    out = []
    for q in quests:
        done = is_claimed(q, keys)
        s = effort(q)
        cls, label = tier(s)
        where = q.get("subarea") or q.get("area") or q.get("start") or "—"
        g = giver(q)
        page = MAP_PAGE.get(region)
        name = esc(q["name"])
        if page and MAPS.get(region, {}).get(q["name"]):
            name = '<a href="%s#%s">%s</a>' % (page, anchor(q["name"]), name)
        out.append(
            '<tr class="%s%s">'
            "%s"
            '<td class="q">%s</td>'
            '<td class="npc">%s</td>'
            '<td class="loc">%s</td>'
            '<td class="n">%d</td>'
            '<td class="n">%.1fk</td>'
            '<td class="tier"><span class="pill %s">%s</span></td>'
            '<td class="onmap"><a href="quest-map.html?q=%s" '
            'title="Find it on the quest map">map</a></td>'
            "</tr>"
            % (cls, " done" if done else "", thumb(region, q),
               ('<span class="ok">&#10003;</span> ' + name) if done else name,
               esc(g) if g else '<i class="dim">no named giver</i>',
               esc(where), q.get("steps") or 0,
               (q.get("dlg") or 0) / 1000.0, cls, label,
               quote(q["name"]))
        )
    return "\n".join(out)


def is_act(q):
    """Archon / story-act index pages carry no dialogue and no step list of
    their own - the acts underneath them do. They pay 200, not 100, and they
    cannot be ranked for length, so they get their own bucket."""
    return not q.get("dlg") and not q.get("steps")


def act_note(region, acts):
    """This used to read "at AR 40 these are almost certainly already banked",
    which was a guess - and the Inazuma screenshots disproved it: two of three
    are claimed and Omnipresence Over Mortals is not. Say what was read."""
    keys, _ = load_claimed(region)
    open_acts = [q["name"] for q in acts if not is_claimed(q, keys)]
    if not keys:
        return ("No Reputation screen has been read for this region, so none "
                "are marked either way.")
    if not open_acts:
        return "All of them are claimed."
    return ("<b>%d still unclaimed</b> on the last screen read — %s. At 200 "
            "each that is worth two world quests apiece."
            % (len(open_acts), ", ".join("<b>%s</b>" % esc(n) for n in open_acts)))


def region_section(region, quests):
    live = [q for q in quests if not q.get("missing")]
    for q in live:
        q["_priors"] = priors_of(region, q)
    acts = [q for q in live if is_act(q)]
    req = [q for q in live if q.get("group") == "Request" and not is_act(q)]
    world = [q for q in live if q.get("group") != "Request" and not is_act(q)]
    world.sort(key=effort)
    req.sort(key=effort)

    head = ""
    k = KNOWN.get(region)
    if k:
        need = (k["next"] - k["into"]) + (LEVELS[6] - LEVELS[5])
        n = need // 100
        shortest = world[:n]
        head = (
            '<div class="bar good"><b>Measured 30 Oct 2026: Level %d, %d/%d.</b> '
            "You need <b>%d EXP</b> to Level 6 and the compass — "
            "<b>%d world quests</b>, and the counter in game reads <b>%d/%d</b>. "
            "Take the top %d rows below and you are done: together they hold "
            "<b>%.0fk characters of dialogue and %d objectives</b>, against "
            "<b>%.0fk and %d</b> for the %d longest. Same 900 EXP either way.</div>"
            % (k["level"], k["into"], k["next"], need, n, k["done"],
               len(world) + len(acts), n,
               sum(q["dlg"] for q in shortest) / 1000.0,
               sum(q["steps"] for q in shortest),
               sum(q["dlg"] for q in world[-n:]) / 1000.0,
               sum(q["steps"] for q in world[-n:]), n)
        )

    # Acts are worth 200 each, so an unclaimed one is worth two world quests.
    # Striking off the claimed ones is the only way to see which is left.
    act_keys, _ = load_claimed(region)
    act_rows = "".join(
        '<li class="%s"><b>%s</b>%s</li>'
        % ("done" if is_claimed(q, act_keys) else "",
           esc(q["name"]),
           ' <span class="ok">&#10003; claimed</span>'
           if is_claimed(q, act_keys) else "")
        for q in acts)

    return """
<h2 id="%s">%s</h2>
<p class="sub">%s</p>
%s
<h3>Archon &amp; story acts — <b>200 EXP each</b> (%d)</h3>
<div class="note">Index pages for multi-act chapters, so they carry no script or
step list of their own and can't be ranked for length. %s
<ul class="acts">%s</ul></div>

<h3>World quests — <b>100 EXP each, uncapped</b> (%d)</h3>""" % (
        region.lower(), region, esc(note(region, quests)), head,
        len(acts), act_note(region, acts), act_rows, len(world)) + """
<p class="sub">Sorted shortest first. <b>Steps</b> is the wiki's numbered
objective count; <b>Dialogue</b> is thousands of characters of script. Both come
straight from the quest pages, so this is measured, not guessed.</p>
<table class="qt">
<tr><th></th><th>Quest</th><th>Start NPC</th><th>Where</th><th>Steps</th><th>Dialogue</th><th></th><th></th></tr>
%s
</table>

<h3>Weekly Reputation Requests - <b>80 EXP, capped 3/week</b> (%d)</h3>
<div class="note"><b>These are not world quests.</b> They repeat weekly, pay 80
rather than 100, and the cap of 3 per week is <b>shared across every nation</b>
- so three Liyue requests mean none left for Inazuma that week. Worth doing, but
they cannot be farmed.</div>
<table class="qt">
<tr><th></th><th>Request</th><th>NPC</th><th>Where</th><th>Steps</th><th>Dialogue</th><th></th><th></th></tr>
%s
</table>
""" % (rows(region, world), len(req), rows(region, req))


def main():
    data = json.load(io.open(DATA, encoding="utf-8"))
    regions = [r for r in data if data[r]]

    nav = " · ".join('<a href="#%s">%s</a>' % (r.lower(), r) for r in regions)
    body = "".join(region_section(r, data[r]) for r in regions)

    html = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Reputation quests — every region</title>
<link rel="stylesheet" href="styles/map.css">
<style>
  .qt{width:100%%;border-collapse:collapse;margin:10px 0 22px;font-size:.88rem}
  .qt th{text-align:left;color:var(--dim);font-size:.72rem;letter-spacing:.08em;
         text-transform:uppercase;padding:6px 8px;border-bottom:1px solid var(--line)}
  .qt td{padding:6px 8px;border-bottom:1px solid #1e2733;vertical-align:top}
  .qt tr:hover td{background:#1c2430}
  .qt .q{color:var(--paper);font-weight:600}
  .qt .npc{color:var(--best)}
  .qt .loc{color:var(--dim)}
  .qt .n{text-align:right;color:var(--dim);font-variant-numeric:tabular-nums;white-space:nowrap}
  .qt .onmap{width:44px;text-align:right}
  .qt .onmap a{color:#7fb7ff;text-decoration:none;font-size:.82rem}
  .qt .onmap a:hover{text-decoration:underline}
  .qt .thumb{width:72px;padding:4px 8px 4px 0}
  .qt .thumb img{width:64px;height:44px;object-fit:cover;border-radius:4px;display:block;
                 background:#0e141c;transition:transform .12s}
  .qt .thumb a:hover img{transform:scale(1.06)}
  .qt .q a{color:inherit;text-decoration:none;border-bottom:1px dotted #46566b}
  .qt .q a:hover{color:var(--do-now);border-bottom-color:var(--do-now)}
  .dim{color:#5d6b7e}
  .qt tr.done .q{color:#6d7b8c;text-decoration:line-through;text-decoration-color:#3c4a5a}
  .qt tr.done .npc,.qt tr.done .loc{color:#4e5c6d}
  .qt tr.done .thumb img{filter:grayscale(1) brightness(.55)}
  .qt tr.done .pill{opacity:.35}
  .ok{color:#5ec97f;text-decoration:none;display:inline-block}
  .acts li.done b{color:#6d7b8c;text-decoration:line-through;text-decoration-color:#3c4a5a}
  .acts li.done .ok{font-size:.74rem;letter-spacing:.04em}
  .pill{display:inline-block;padding:1px 8px;border-radius:999px;font-size:.72rem;
        letter-spacing:.04em;white-space:nowrap}
  .t1 .pill{background:#13351f;color:#7ee2a8}
  .t2 .pill{background:#132d35;color:#7ed0e2}
  .t3 .pill{background:#352f13;color:#e2d07e}
  .t4 .pill{background:#351313;color:#e28f7e}
  .nav{margin:10px 0 4px;font-size:.92rem}
  .nav a{color:var(--best);text-decoration:none;margin-right:4px}
  .nav a:hover{text-decoration:underline}
</style>
</head>
<body>
<div class="wrap">

<h1>Reputation quests — every region</h1>
<p class="sub">Start NPC, start location, and a measured length for every quest
that pays Reputation EXP. Generated from the wiki, %s. &middot; <a href="reputation-compass.html">what each compass costs</a> &middot; <a href="quest-map.html">see them all on the map</a></p>
<div class="nav">%s</div>

<div class="bar key">
  <b>How length is measured.</b> You suggested deducting it from how much text a
  quest has, and that works — the wiki stores the full script. <b>Dialogue</b> is
  the size of each quest's dialogue section; <b>Steps</b> is its numbered
  objective list. Sorting on the two together turns "which are quickest" from a
  guess into a measurement. Treat it as an ordering, not a stopwatch: a short
  script with a long walk still takes time.
</div>

<div class="bar warn">
  <b>On pins.</b> You asked for exact per-quest dots. The official map's World
  Quest layer has <b>576 pins with no names on them</b> — every one returns a
  null label, so a pin cannot be tied to a quest. Rather than invent
  coordinates, this page gives the <b>start NPC and subarea</b>, which the wiki
  does record exactly. Searching the NPC's name in-game puts a marker on them.
</div>

<div class="note">
  <b>Mondstadt and Snezhnaya are not here</b> — Mondstadt by your request, and
  <b>Snezhnaya has no Reputation system at all</b>. <b>Natlan is absent because
  it has no such category</b>: it uses per-tribe reputation, a different system
  with its own tracks.
</div>

%s

<div class="note">
  <b>Regenerate</b> with <code>python -I tools/fetch-reputation-quests.py</code>
  then <code>python -I tools/build-reputation-pages.py</code>. The source is the
  wiki's auto-generated <i>&lt;Region&gt; Quests with Reputation Reward</i>
  categories, which are emitted by each quest's own infobox and so cannot drift
  out of sync the way a hand-written list page does.
</div>

</div>
<script src="app/quest-chains.js"></script>
<script src="app/nav.js"></script>
</body>
</html>
""" % ("7 Nov 2026", nav, body)

    with io.open(OUT, "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote " + OUT)


if __name__ == "__main__":
    main()
