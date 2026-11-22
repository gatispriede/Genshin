"""What an upgrade is worth, in DPS, before you farm for it.

    python -I tools/upgrade-calc.py skirk        # or mizuki, varesa
    python -I tools/upgrade-calc.py --list

Method: a measured dummy run is the baseline (reference/data/upgrade-baselines.json).
It already contains talent multipliers, rotation and the dummy's resistance, so an
upgrade only has to say which terms of the damage formula it changes:

    damage ~ scaling stat x (1 + DMG bonus) x (1 + CRIT Rate x CRIT DMG) x talent multiplier

and the carry's DPS scales by new term / old term. Resistance and shields stay out:
they change what a fight requires, not what an upgrade is worth.

Artifact cases follow the owner's rules (22 Nov 2026), counted in good rolls:
    worst  one wanted substat, 2 rolls
    mid    two wanted substats, 1 roll each
    lucky  three wanted substats, 1 roll each
Rolls are the averages of the four possible values; a CRIT Rate and a CRIT DMG roll
are both worth 6.6 crit value, so worst and mid differ only through the stats chosen.
"""

import io
import json
import os
import sys

DATA = os.path.join("reference", "data", "upgrade-baselines.json")

# Average single roll of each 5-star substat, and +20 main stats.
ROLL = {"cr": 0.033, "cd": 0.066, "atk%": 0.0496, "em": 19.8}
MAIN = {"atk%": 0.466, "elem": 0.466, "cr": 0.311, "cd": 0.622, "em": 186.5}

# Standard elemental talent scaling relative to level 1 (levels 1-13).
TALENT = [None, 1.0, 1.075, 1.15, 1.25, 1.325, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.125]

# Furina's Fanfare: DMG bonus per point at Burst level n is 0.07% + 0.02% x (n - 1); 300 points max.
def fanfare(level, share):
    return (0.0007 + 0.0002 * (level - 1)) * 300 * share


class Stats(object):
    """The terms an upgrade can move, for one carry."""

    def __init__(self, c, team):
        self.scaling = c["scaling"]
        self.base, self.pct, self.flat = c["base"], c["pct"], c["flat"]
        self.cr, self.cd, self.dmg = c["cr"], c["cd"], c["dmg"]
        self.team_pct, self.team_dmg = team.get("pct", 0), team.get("dmg", 0)

    def copy(self):
        s = Stats.__new__(Stats)
        s.__dict__.update(self.__dict__)
        return s

    def add(self, stat, value):
        if stat == "atk%":
            self.pct += value
        elif stat == "em":
            self.flat += value
        elif stat == "cr":
            self.cr += value
        elif stat == "cd":
            self.cd += value
        elif stat == "elem":
            self.dmg += value
        elif stat in ("hp", "atk"):
            pass                                    # flower/plume mains do not move: they stay
        else:
            raise SystemExit("unknown stat %r" % stat)

    def value(self):
        if self.scaling == "em":
            stat = self.flat
        else:
            stat = self.base * (1 + self.pct + self.team_pct) + self.flat
        return stat * (1 + self.dmg + self.team_dmg) * (1 + min(self.cr, 1.0) * self.cd)


def cases(wanted):
    """The owner's three cases for one new piece, best stats first in `wanted`."""
    a, b = wanted[0], wanted[1]
    return {
        "worst": {a: 2 * ROLL[a]},
        "mid": {a: ROLL[a], b: ROLL[b]},
        "lucky": {w: ROLL[w] for w in wanted[:3]},
    }


def swap(stats, piece, new_main, new_subs):
    """Remove a slot's current piece and put in a new one."""
    s = stats.copy()
    s.add(piece["main"], -MAIN.get(piece["main"], 0))
    for k, v in piece["subs"].items():
        s.add(k, -v)
    s.add(new_main, MAIN.get(new_main, 0))
    for k, v in new_subs.items():
        s.add(k, v)
    return s


def good_rolls(piece, wanted):
    return sum(round(v / ROLL[k]) for k, v in piece["subs"].items() if k in wanted)


def report(name, t):
    run, carry = t["run"], t["carry"]
    print("== %s (%s run, %s)" % (carry["name"], run["date"], " / ".join(run["team"])))
    if not run.get("carryDamage"):
        print("   No damage breakdown for this run: %s" % run.get("_missing", "add carryDamage"))
        return
    base_dps = run["carryDamage"] / run["seconds"]
    team_dps = run["teamDamage"] / run["seconds"]
    stats = Stats(carry, t.get("team", {}))
    if "fanfare" in t:
        stats.team_dmg = fanfare(t["fanfare"]["burst"], t["fanfare"]["avgShare"])
    base = stats.value()
    want = t["want"]
    print("   Carry %.0f DPS of %.0f team DPS. Scaling on %s." % (base_dps, team_dps, carry["scaling"].upper()))
    bench = t.get("benchmarks", {}).get("teams", [])
    if bench:
        # Community calcs are the ceiling to aim at; this model only prices the steps toward it.
        print("\n   Community benchmarks (your team now at %.0f):" % team_dps)
        for b in bench:
            print("   %-58s %7.0f  you: %3.0f%%  (%s)" % (b["team"], b["dps"], 100 * team_dps / b["dps"], b["by"]))

    def line(label, s):
        r = s.value() / base
        print("   %-46s x%.3f -> %6.0f DPS" % (label, r, base_dps * r))
        return r

    print("\n   Piece by piece (worst case puts both rolls on the first wanted stat, %s):" % want["subs"][0])
    best = {}
    for slot in ("sands", "goblet", "circlet"):
        piece = t["gear"][slot]
        target = want[slot]
        rolls = good_rolls(piece, want["subs"])
        print("   %s: now %s main, %d good rolls -> %s main" % (slot, piece["main"], rolls, target))
        for case, subs in cases(want["subs"]).items():
            r = line("  " + case, swap(stats, piece, target, subs))
            best[(slot, case)] = r
    keep = [slot for slot in ("sands", "goblet", "circlet")
            if best[(slot, "lucky")] < 1.0]
    if keep:
        print("   Keep: %s (even the lucky case is worse)." % ", ".join(keep))

    print("\n   Worth-it swaps together:")
    for case, subs in cases(want["subs"]).items():
        s = stats
        for slot in ("sands", "goblet", "circlet"):
            if slot not in keep:
                s = swap(s, t["gear"][slot], want[slot], subs)
        line("  " + case, s)

    talents = t.get("talents", {})
    talent_key = next((k for k in ("normal", "skill", "burst") if k in talents), None)
    if talent_key:
        now = talents[talent_key]
        print("\n   %s talent (share of damage %.0f%%, assumed):" % (talent_key, 100 * talents["share"]))
        for to in range(now + 1, 11):
            r = 1 + talents["share"] * (TALENT[to] / TALENT[now] - 1)
            print("   %-46s x%.3f -> %6.0f DPS" % ("  %d -> %d" % (now, to), r, base_dps * r))
    if "fanfare" in t:
        f = t["fanfare"]
        print("\n   Furina's Burst talent (Fanfare averaging %.0f%% of max, assumed):" % (100 * f["avgShare"]))
        for to in range(f["burst"] + 1, 11):
            s = stats.copy()
            s.team_dmg = fanfare(to, f["avgShare"])
            line("  %d -> %d" % (f["burst"], to), s)


def main():
    data = json.load(io.open(DATA, encoding="utf-8"))["teams"]
    if len(sys.argv) < 2 or sys.argv[1] == "--list":
        print("teams: %s" % ", ".join(sorted(data)))
        return
    name = sys.argv[1]
    if name not in data:
        raise SystemExit("no team %r (have: %s)" % (name, ", ".join(sorted(data))))
    report(name, data[name])


if __name__ == "__main__":
    main()
