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
    """Collapse markers at (nearly) the same position into one pin.

    The merged pin keeps the first marker's position and layer, shows the
    first label with a "+" ("26b+"), and its caption lists every label so
    nothing is hidden: "26b · 26c · 26: Zurvan".
    """
    groups = []
    for m in markers:
        if m.get("zone"):
            groups.append([m])
            continue
        home = next((g for g in groups if not g[0].get("zone")
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
    return out


def legend(routed, markers):
    """One toggle per quest that has a marker on this map, in route order."""
    present = {m["layer"] for m in markers if m.get("layer")}
    return [{"layer": "q%d" % e["n"], "text": "%d · %s" % (e["n"], e["quest"]["name"]), "role": "goal"}
            for e in routed if "q%d" % e["n"] in present]
