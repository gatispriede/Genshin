"""Render <region>-quest-maps.html from reference/data/quest-maps.json.

One card per quest, ordered shortest first, each with the wiki's own in-game
map crop of where it starts.

    python -I tools/fetch-quest-maps.py <Region> 0
    python -I tools/build-quest-maps-page.py [Region ...]

With no arguments it rebuilds every region present in the manifest.
"""

import io
import json
import os
import re
import sys

DATA = os.path.join("reference", "data", "quest-maps.json")

# Cumulative EXP per Reputation Level. THERE ARE TWO CURVES, verified 11 Nov 2026
# against the wiki's per-region tables and confirmed by Inazuma's in-game bar
# reading "130/750" at Level 7.
#
# Mondstadt and Liyue step 400/420/440/460/480/500/520 and cap at Level 8.
# Inazuma, Sumeru, Fontaine and Natlan step 450/500/550/600/650/700/750/800/850
# and run to Level 10 - a steeper curve, so the later regions cost far more.
# Using the Mondstadt curve for Inazuma understates Level 9 by 1,200 EXP.
CURVE_EARLY = [0, 0, 400, 820, 1260, 1720, 2200, 2700, 3220]
CURVE_LATE = [0, 0, 450, 950, 1500, 2100, 2750, 3450, 4200, 5000, 5850]
CURVE = CURVE_EARLY  # back-compat; prefer curve_for(region)


def curve_for(region):
    return CURVE_EARLY if region in ("Mondstadt", "Liyue") else CURVE_LATE

# Per region: what the player is walking toward, and where they stand.
# "confirmed" is only set where a Reputation screen has actually been read -
# never guessed. Regions without it get the full picture and no false precision.
REGIONS = {
    "Liyue": {
        "confirmed": 6,
        "confirmed_note": "Level 6 and the Geo Treasure Compass landed 30 Oct 2026.",
        "target_exp": CURVE[8],
        "target": "Level 8 and <b>Wings of Golden Flight</b>, the glider that caps Liyue",
        "explored": "22.7%",
    },
    "Inazuma": {
        "target_exp": 5000,
        "target": "Level 9 and the <b>Electro Treasure Compass</b>",
        # Read off the in-game Reputation screen 11 Nov 2026: Level 7, 130/750
        # into Level 8, Inazuma Quests 12/45, World Exploration 55%.
        # Level 8 (4,200) pays the Electroculus Resonance Stone; the compass is
        # Level 9 (5,000). That 5,000 is correct - it is the LATE curve.
        "confirmed": 7,
        "confirmed_note": "Level 7 with 130/750 into Level 8, read in game 11 Nov 2026. "
                          "Level 8 pays the Electroculus Resonance Stone.",
        "explored": "55%",
    },
    "Sumeru": {
        "target_exp": 5000,
        "target": "Level 9 and the <b>Dendro Treasure Compass</b>",
        "explored": "0%",
    },
    "Fontaine": {
        "target_exp": 5000,
        "target": "Level 9 and the <b>Hydro Treasure Compass</b>",
        "explored": "2%",
    },
}

# A few past the strict requirement, in case a quest runs longer than its
# script suggests or one turns out already half-done.
BUFFER = 4


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


# Quests the in-game Reputation screen shows as Claimed. Transcribed by hand
# from screenshots - progress is server-side, so no API can supply this.
# A name matching several wiki entries (the game merges "Treasure Lost,
# Treasure Found" into one row, the wiki splits it into Parts 1 and 2) marks
# every match, and is flagged on the page rather than silently resolved.
def load_claimed(region):
    path = os.path.join("reference", "data", "claimed.json")
    if not os.path.exists(path):
        return set()
    names = json.load(io.open(path, encoding="utf-8")).get(region, [])
    return {re.sub(r"[^a-z0-9]+", "", n.lower()) for n in names}


def is_claimed(q, keys):
    n = re.sub(r"[^a-z0-9]+", "", q["name"].lower())
    return n in keys or any(n.startswith(k) for k in keys)


def esc(s):
    return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def card(i, q, state):
    maps = q.get("maps") or []
    close = [m for m in maps if not m["context"]]
    context = [m for m in maps if m["context"]]

    shots = ""
    for m in close[:1] + context[:1]:
        # "Context" files are in-world photos of the surroundings, not maps.
        label = "What you'll see there" if m["context"] else "Exact spot"
        shots += ('<figure><img loading="lazy" src="assets/quest-maps/%s" '
                  'alt="%s map"><figcaption>%s</figcaption></figure>'
                  % (m["file"], esc(q["name"]), label))
    if not shots:
        shots = ('<div class="nomap">No location shot exists on the wiki for '
                 'this one, and the official map\'s quest pins are unnamed — '
                 'so there is nothing to show that would not be invented. '
                 'Head for <b>%s</b> and look for %s.</div>'
                 % (esc(q.get("subarea") or q.get("area") or "the area"),
                    ("<b>%s</b>" % esc(q["npcs"][0])) if q.get("npcs")
                    else "the quest marker"))

    giver = (q.get("npcs") or [None])[0]
    where = q.get("subarea") or q.get("area") or "—"
    extra = len(maps) - len(close[:1] + context[:1])
    more = ('<p class="more">%d more shot%s on the wiki page.</p>'
            % (extra, "" if extra == 1 else "s")) if extra > 0 else ""

    return """
<article id="q-%s" class="quest%s" data-area="%s">
  <header>
    <span class="idx">%d</span>
    <div>
      <h2>%s</h2>
      <p class="meta">%s%s · <b>%s</b> · %d step%s · %.1fk dialogue</p>
    </div>
  </header>
  <div class="shots">%s</div>%s
</article>""" % (
        slug(q["name"]), " " + state if state else "", esc(where),
        i, esc(q["name"]),
        {"done": '<span class="qtag ok">&#10003; claimed</span> ',
         "pri": '<span class="qtag">do this one</span> ',
         "spare": '<span class="qtag sp">spare</span> '}.get(state, ""),
        ("Talk to <b>%s</b>" % esc(giver)) if giver
        else "<i>No giver — starts when you arrive</i>",
        esc(where), q["steps"], "" if q["steps"] == 1 else "s",
        q["dlg"] / 1000.0, shots, more)


def region_exp(region):
    """Total Reputation EXP the region's quests can pay. Counted from the full
    dataset, not from this page's cards - the cards cover only quests with a
    start location, while Archon and story acts have none and still pay 200."""
    path = os.path.join("reference", "data", "reputation-quests.json")
    live = [q for q in json.load(io.open(path, encoding="utf-8")).get(region, [])
            if q.get("group") != "Request" and not q.get("missing")]
    acts = [q for q in live if not q.get("dlg") and not q.get("steps")]
    wq = [q for q in live if q not in acts]
    return len(wq) * 100 + len(acts) * 200, len(wq), len(acts)


def headline(region, cfg, todo, done):
    """What this region is actually asking of you. Only claims a starting
    position where a Reputation screen was read; otherwise states the target
    and lets the reader fill in where they stand."""
    avail, n_wq, n_acts = region_exp(region)
    target = cfg["target_exp"]

    if "confirmed" in cfg:
        earned = CURVE[cfg["confirmed"]]
        short = max(0, target - earned)
        needed = max(2, -(-short // 100))
        top = todo[:needed]
        tail = todo[-needed:]
        return needed, (
            '<div class="bar good"><b>%s</b> %d quests remain here, %d struck '
            "off.<br><br>Next is %s. From the Level %d threshold of <b>%s</b> "
            "that is <b>%s EXP</b>, about <b>%d quests</b>.<br><br>The %d "
            "marked <i>do this one</i> need <b>%.0fk of dialogue and %d "
            "objectives</b>; the same number taken from the longest would cost "
            "<b>%.0fk and %d</b> for identical EXP."
            "<br><br><b>That count is a ceiling.</b> EXP already earned past "
            "the threshold, plus exploration milestones and weekly requests, "
            "comes off the top.</div>"
            % (cfg["confirmed_note"], len(todo), len(done), cfg["target"],
               cfg["confirmed"], "{:,}".format(earned), "{:,}".format(short),
               needed, needed,
               sum(q["dlg"] for q in top) / 1000.0,
               sum(q["steps"] for q in top),
               sum(q["dlg"] for q in tail) / 1000.0,
               sum(q["steps"] for q in tail)))

    gap = target - avail
    pool = ("<b>%d world quests at 100</b> plus <b>%d Archon or story acts at "
            "200</b> = <b>%s EXP</b>"
            % (n_wq, n_acts, "{:,}".format(avail)))
    shortfall = (
        "%s, against the <b>%s</b> needed — <b>short by %s.</b> The gap has to "
        "come from weekly Requests (80 each, capped at 3 per week <i>across "
        "every nation</i>) and exploration milestones."
        % (pool, "{:,}".format(target), "{:,}".format(gap))
        if gap > 0 else
        "%s, against the <b>%s</b> needed — quests cover it, with <b>%s</b> to "
        "spare." % (pool, "{:,}".format(target), "{:,}".format(-gap)))
    shortfall += (
        "<br><br><b>Only the %d world quests appear below</b>; the acts have no "
        "start location of their own, so there is nothing to map for them."
        % n_wq)

    # Two different situations, and quoting the wrong one makes the page lie.
    # A region with nothing struck off is a route plan for later. A region with
    # claimed quests is one you are standing in - and there the stored
    # exploration figure is stale by definition, so it is not quoted at all.
    if done:
        where = (
            "<br><br><b>%d of these are already struck off</b>, so you are in "
            "this region and the Reputation board is open. The exploration "
            "percentage on file predates that and is deliberately not quoted "
            "here. The order below is by measured length, so work from the "
            "top." % len(done))
    else:
        where = (
            "<br><br><b>You have explored %s of this region</b>, so treat this "
            "as a route plan rather than a to-do list — the Reputation board "
            "itself unlocks behind that region's Archon quest, and most of "
            "these start points sit behind waypoints you have not opened. The "
            "flagged ones are simply the shortest, for whenever you do arrive."
            % cfg["explored"])

    return BUFFER + 2, (
        '<div class="bar warn"><b>Target: %s.</b> %s%s</div>'
        % (cfg["target"], shortfall, where))


def build(region, quests):
    cfg = REGIONS.get(region)
    if not cfg:
        print("skipping %s - no config" % region, file=sys.stderr)
        return

    keys = load_claimed(region)
    todo = [q for q in quests if not is_claimed(q, keys)]
    done = [q for q in quests if is_claimed(q, keys)]
    rank = {q["name"]: i for i, q in enumerate(todo, 1)}

    needed, head = headline(region, cfg, todo, done)
    priority = needed + BUFFER

    def state(q):
        if is_claimed(q, keys):
            return "done"
        r = rank[q["name"]]
        return "pri" if r <= needed else ("spare" if r <= priority else "")

    cards = "".join(card(i, q, state(q)) for i, q in enumerate(quests, 1))
    nomaps = [q["name"] for q in quests if not q.get("maps")]
    shots = sum(len(q.get("maps") or []) for q in quests)

    missing = ""
    if nomaps:
        missing = ('<div class="note"><b>%d quest%s no location shot '
                   'anywhere:</b> %s. Those cards say so rather than showing a '
                   "guess.</div>"
                   % (len(nomaps), " has" if len(nomaps) == 1 else "s have",
                      ", ".join("<i>%s</i>" % esc(n) for n in nomaps)))

    nav = " · ".join(
        ('<b>%s</b>' % r) if r == region
        else '<a href="%s-quest-maps.html">%s</a>' % (r.lower(), r)
        for r in REGIONS)

    html = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>%s reputation quests — where each one starts</title>
<link rel="stylesheet" href="styles/map.css">
<style>
  .quest{scroll-margin-top:14px;background:var(--panel);border-radius:10px;
         padding:14px 16px;margin:14px 0;border-left:3px solid var(--line)}
  .quest.pri{border-left-color:var(--do-now)}
  .quest.spare{border-left-color:var(--hub)}
  .quest.done{border-left-color:#3a4a3c;opacity:.5}
  .quest.done h2{text-decoration:line-through;text-decoration-color:#4a5a66}
  .quest.done .shots img{filter:grayscale(1) brightness(.6)}
  .quest header{display:flex;gap:14px;align-items:flex-start;margin-bottom:10px}
  .quest h2{margin:0;font-size:1.04rem;color:var(--paper);border:0;padding:0}
  .idx{flex:0 0 34px;height:34px;border-radius:50%%;background:#2a3543;
       color:var(--dim);font-weight:700;display:grid;place-items:center;font-size:.95rem}
  .pri .idx{background:var(--do-now);color:#1a1008}
  .done .idx{background:#243229;color:#5e8f70}
  .qtag{display:inline-block;padding:1px 8px;border-radius:999px;
        background:#3a2412;color:#ffc48f;font-size:.68rem;letter-spacing:.05em;
        text-transform:uppercase;white-space:nowrap}
  .qtag.ok{background:#15321f;color:#7ee2a8}
  .qtag.sp{background:#15283a;color:#8fc4ff}
  .meta{margin:3px 0 0;color:var(--dim);font-size:.85rem}
  .meta b{color:var(--best)}
  .shots{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px}
  .shots figure{margin:0}
  .shots img{width:100%%;border-radius:7px;display:block;background:#0e141c}
  .shots figcaption{color:var(--dim);font-size:.74rem;letter-spacing:.07em;
                    text-transform:uppercase;margin-top:5px}
  .more{color:#5d6b7e;font-size:.78rem;margin:8px 0 0}
  .nomap{color:var(--dim);font-size:.86rem;padding:10px 12px;border-radius:7px;
         background:#1a222c;border:1px dashed var(--line)}
  .rnav{margin:10px 0 4px;font-size:.92rem}
  .rnav a{color:var(--best);text-decoration:none;margin-right:4px}
  .rnav a:hover{text-decoration:underline}
</style>
</head>
<body>
<div class="wrap">

<h1>%s reputation quests — where each one starts</h1>
<p class="sub">All %d world quests that pay Reputation EXP, ordered shortest
first, with %d map and location shots pulled from the wiki.</p>
<div class="rnav">%s</div>

%s

<div class="bar key">
  <b>These maps are the wiki's own in-game crops</b>, taken from each quest page
  and each giver's NPC page — not pins I placed. The white ring marks the spot;
  the blue teardrop nearby is the waypoint to teleport to.
</div>

<div class="note">
  <b>Why there is no single map with every dot on it.</b> The official
  interactive map's World Quest layer has <b>576 pins, every one of which
  returns a null name</b>, and the wiki stores no coordinates. A combined map
  would have been guesswork; these per-quest crops are exact.
  Full sortable table across all regions:
  <a href="reputation-quests.html">reputation-quests.html</a>.
</div>
%s
%s

<div class="note">
  Regenerate with <code>python -I tools/fetch-quest-maps.py %s 0</code> then
  <code>python -I tools/build-quest-maps-page.py %s</code>.
</div>

</div>
<script src="app/quest-chains.js"></script>
<script src="app/nav.js"></script>
</body>
</html>
""" % (region, region, len(quests), shots, nav, head, missing, cards,
       region, region)

    out = "%s-quest-maps.html" % region.lower()
    with io.open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote %-28s %2d quests, %3d shots, %d flagged"
          % (out, len(quests), shots, needed))


def main():
    data = json.load(io.open(DATA, encoding="utf-8"))
    wanted = sys.argv[1:] or list(data)
    for region in wanted:
        if region in data:
            build(region, data[region])
        else:
            print("no manifest data for %s" % region, file=sys.stderr)


if __name__ == "__main__":
    main()
