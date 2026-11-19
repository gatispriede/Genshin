"""The frame shared by the reputation pages: styles, intro, footer, shell().

Split out of build-reputation-pages.py so that file stays about the quests.
"""

import reputation_chains

UPDATED = "7 Nov 2026"

CSS = """  .qt{width:100%;border-collapse:collapse;margin:10px 0 22px;font-size:.88rem}
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
"""

INTRO = """<div class="bar key">
  <b>Shortest first, measured.</b> Every quest that pays Reputation EXP is ranked by
  how much there is to do: <b>Steps</b> is its numbered objective list on the wiki,
  <b>Dialogue</b> the size of its script. Together they turn "which are quickest" from
  a guess into a measurement. Treat it as an ordering, not a stopwatch: a short
  script with a long walk still takes time.
</div>

<h2>Where reputation EXP comes from</h2>
<table>
  <tr><th>Source</th><th>EXP</th><th>Note</th></tr>
  <tr><td>Archon Quest acts in the region</td><td>200 each</td><td>Banked automatically once done</td></tr>
  <tr><td>World quests</td><td>100 each</td><td>The bulk of it, and uncapped: every quest on the region pages</td></tr>
  <tr><td>Exploration milestones</td><td>100 each</td><td>At 20%, 40% and 60% exploration</td></tr>
  <tr><td>Weekly requests and bounties</td><td>80 each</td><td>Capped at 3 per week, shared across every nation</td></tr>
  <tr><td>Supply Notices</td><td>varies</td><td>Unlock at Reputation Level 1</td></tr>
</table>

<div class="note">
  <b>Use the game as your checklist.</b> The region's reputation NPC (Liyue: Ms. Yu,
  Reputation → Quests) lists every qualifying quest with an Achieved / Not achieved
  mark. Neither the wiki nor HoYoLAB knows which ones you have done; the game does.
  <b>Mondstadt is not covered yet. Natlan</b> uses per-tribe reputation, a different
  system, and <b>Snezhnaya</b> has none.
</div>"""

REGEN = """<div class="note editor">
  <b>Regenerate</b> with <code>python -I tools/fetch-reputation-quests.py</code>
  then <code>python -I tools/build-reputation-pages.py</code>. The source is the
  wiki's auto-generated <i>&lt;Region&gt; Quests with Reputation Reward</i>
  categories, which are emitted by each quest's own infobox and so cannot drift
  out of sync the way a hand-written list page does.
</div>"""

LINKS = '<a href="reputation-compass.html">what each Treasure Compass costs</a>'


def shell(title, sub, body):
    """The frame every reputation page shares."""
    return """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>%s</title>
<link rel="stylesheet" href="styles/map.css">
<style>
%s%s</style>
</head>
<body>
<div class="wrap">

<h1>%s</h1>
<p class="sub">%s</p>
%s

%s

</div>
<script src="app/quest-chains.js"></script>
<script src="app/nav.js"></script>
</body>
</html>
""" % (title, CSS, reputation_chains.CSS, title, sub, body, REGEN)
