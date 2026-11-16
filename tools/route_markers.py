"""Marker clean-up for route maps: one layer per quest, and no stacked pins.

Two problems on a dense route map, both seen on Sumeru (16 Nov):
  * Starts at the same spot draw as pins on top of each other - 26b, 26c and
    26 all start at Vourukasha Oasis - so the lower ones cannot be read at any
    zoom. merge_stacked() turns each stack into ONE pin that names them all.
  * With 50 pins, finding quest 5 means scanning the whole map. Every marker
    carries layer "q<n>" (its quest number; a chain shares its quest's layer),
    and legend() lists one entry per quest, so each quest can be toggled.
"""

import re

# Two markers closer than this (percent of the image, both axes) are one stack.
STACK_PCT = 0.9


def quest_layer(label):
    return "q%s" % re.match(r"\d+", label).group(0)


def merge_stacked(markers):
    """Collapse markers of ONE quest at (nearly) the same position into one pin.

    The merged pin keeps the first marker's position and layer, shows the
    first label with a "+" ("26b+"), and its caption lists every label so
    nothing is hidden: "26b · 26c · 26: Zurvan".

    Stacks of DIFFERENT quests are not merged - a merged pin can sit on only
    one layer, and the other quest would lose its toggle. They are nudged
    apart instead (nudge()), so both show once zoomed in.
    """
    groups = []
    for m in markers:
        if m.get("zone"):
            groups.append([m])
            continue
        home = next((g for g in groups if not g[0].get("zone") and g[0].get("layer") == m.get("layer")
                     and abs(g[0]["x"] - m["x"]) < STACK_PCT and abs(g[0]["y"] - m["y"]) < STACK_PCT), None)
        (home.append(m) if home else groups.append([m]))
    out = []
    for g in groups:
        if len(g) == 1:
            out.append(g[0])
            continue
        first = dict(g[0])
        labels = [m["label"] for m in g]
        first["label"] = labels[0] + "+"
        first["tag"] = "%s: %s" % (" · ".join(labels), g[0]["tag"])
        first["title"] = " / ".join(m["title"] for m in g)
        if any(m["role"] == "goal" for m in g):
            first["role"] = "goal"
            first.pop("size", None)
        out.append(first)
    return nudge(out)


# How far apart nudge() spreads coincident pins of different quests, in percent
# of the image: on a 1920px map at 5x zoom that is ~35px, clear of a 32px pin.
NUDGE_PCT = 0.38


def nudge(markers):
    """Spread pins of different quests that sit on the same spot in a small
    ring around it, so none hides another. Positions move by under half a
    percent; the true spot is the ring's centre."""
    import math
    done = []
    for m in markers:
        if m.get("zone"):
            continue
        twins = [d for d in done if abs(d["_x"] - m["x"]) < STACK_PCT and abs(d["_y"] - m["y"]) < STACK_PCT]
        m["_x"], m["_y"] = m["x"], m["y"]
        if twins:
            k = len(twins)
            m["x"] = round(m["x"] + NUDGE_PCT * math.cos(k * 2.1), 2)
            m["y"] = round(m["y"] + NUDGE_PCT * math.sin(k * 2.1), 2)
        done.append(m)
    for m in done:
        m.pop("_x", None)
        m.pop("_y", None)
    return markers


def solo_query(n, total, map_names):
    """Query string that leaves only quest n visible on the route maps.

    The map module keeps HIDDEN layers in the URL as ?map-<name>=a,b,c, so
    "only q5" is "every other quest hidden". The key is set for each name the
    map may answer to: flux currently drops the name we send and falls back to
    "map-annotated" (requested fix, 16 Nov), so both keys are written and the
    links keep working after the fix.
    """
    hidden = ",".join("q%d" % i for i in range(1, total + 1) if i != n)
    return "?" + "&".join("map-%s=%s" % (name, hidden) for name in ["map-annotated"] + list(map_names))


def legend(routed, markers):
    """One toggle per quest that has a marker on this map, in route order."""
    present = {m["layer"] for m in markers if m.get("layer")}
    return [{"layer": "q%d" % e["n"], "text": "%d · %s" % (e["n"], e["quest"]["name"]), "role": "goal"}
            for e in routed if "q%d" % e["n"] in present]
