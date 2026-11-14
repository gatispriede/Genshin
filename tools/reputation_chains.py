"""Chain quests for the reputation page: their own subsection, one expandable
block per chain, prerequisites in the order you have to do them.

Why this exists: the reputation lists only show the quest that PAYS. When that
quest ends a series, the earlier parts pay nothing and never appeared, so a
nine-quest chain sat in the table as one short row — and you only found out
when the NPC would not talk to you. A badge saying "needs 9 first" was not
enough; you need the nine, in order.

Rendered as <details>/<summary>, not by a script, so it still works where
scripts are stripped (the CMS). Used by tools/build-reputation-pages.py.

Data: reference/data/quest-chains.json (tools/fetch-quest-prereqs.py). Its
counts are a LOWER BOUND — the wiki's `prev` field is not filled on every page.
"""

from html import escape

# Severities that mean "real prerequisite quests you must do first".
# "story" (behind the Archon storyline) and "entry" (only the region's entry
# quest) stay in the plain table: everyone in the region has done those.
CHAIN_SEVERITIES = ("worst", "bad", "mild")


def is_chain(chain):
    return bool(chain) and chain.get("severity") in CHAIN_SEVERITIES and chain.get("before")


def split(world, chains_for_region):
    """World quests -> (standalone, chained), keeping each list's order."""
    standalone, chained = [], []
    for q in world:
        c = chains_for_region.get(q["name"])
        (chained if is_chain(c) else standalone).append(q)
    return standalone, chained


def _block(q, chain, done):
    before = chain.get("before") or []
    steps = "".join("<li>%s</li>" % escape(p) for p in before)
    pays = ('<li class="pays"><b>%s</b> — pays the reputation%s</li>'
            % (escape(q["name"]), ' <span class="ok">&#10003; claimed</span>' if done else ""))
    extra = []
    if chain.get("requirement"):
        extra.append("<b>Also required:</b> %s" % escape(chain["requirement"]))
    if chain.get("note"):
        extra.append(escape(chain["note"]))
    if (chain.get("priors") or 0) > len(before):
        extra.append("The wiki counts %d earlier quests; only %d are named, so check the "
                     "first one's own page for anything before it." % (chain["priors"], len(before)))
    where = q.get("subarea") or q.get("area") or q.get("start") or ""
    summary = ("%s%s <span class=\"dim\">— %d quest%s first%s</span>"
               % ('<span class="ok">&#10003;</span> ' if done else "",
                  escape(q["name"]), len(before), "" if len(before) == 1 else "s",
                  (", " + escape(where)) if where else ""))
    return ('<details class="chain%s"><summary>%s</summary>'
            '<ol class="chain-steps">%s%s</ol>%s</details>'
            % (" done" if done else "", summary, steps, pays,
               ('<p class="sub">%s</p>' % "<br>".join(extra)) if extra else ""))


def section(region, chained, chains_for_region, is_done):
    """The "Chain quests" subsection, or "" when the region has none."""
    if not chained:
        return ""
    # Shortest chain first: those are the ones worth starting.
    chained = sorted(chained, key=lambda q: len(chains_for_region[q["name"]].get("before") or []))
    open_n = sum(1 for q in chained if not is_done(q))
    blocks = "\n".join(_block(q, chains_for_region[q["name"]], is_done(q)) for q in chained)
    return """
<h3>Chain quests — <b>100 EXP each, but only the last part pays</b> (%d, %d unclaimed)</h3>
<div class="note">Each of these is the <b>final part of a series</b>. The earlier quests
pay no reputation, so the region's own list never shows them — and the NPC will not
offer the final part until they are done. Open a chain to see every quest in the order
to do them. Shortest chains first. Counts are a lower bound: the wiki does not record
every link.</div>
%s
""" % (len(chained), open_n, blocks)


CSS = """
details.chain { background: var(--panel, #f5f6f8); border-radius: 8px; margin: 6px 0;
  padding: 8px 12px; border-left: 3px solid var(--warn, #c99a06); }
details.chain.done { border-left-color: var(--good, #2e9d5b); opacity: .75; }
details.chain summary { cursor: pointer; font-weight: 600; }
ol.chain-steps { margin: 8px 0 4px 18px; }
ol.chain-steps li.pays { margin-top: 4px; }
"""
