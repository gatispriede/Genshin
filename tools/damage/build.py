"""A character's damage from the ground up: base stats at their level, an owned
weapon, artifacts under a roll case, party buffs, then the hit-by-hit formula.

    python -I tools/damage/build.py          # Skirk: check, then weapons x artifact cases x teams

Stats:   ATK = (character base + weapon base) x (1 + ATK%) + flat ATK
Hits:    tools/skirk-rotation.py (talent tables, Death's Crossing, Finale, Extinction, DEF, RES)

Artifact cases count GOOD substat rolls across the five pieces (owner's rules, 22 Nov):
  bad 10 (2 per piece) · lucky 15 (3 per piece) · good 20 (4 per piece)
Each case's rolls go, one at a time, to whichever wanted stat raises damage most.
"""

import importlib.util
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from gamedata import character_stats, weapon_id, weapon_stats  # noqa: E402

_spec = importlib.util.spec_from_file_location("rot", os.path.join(HERE, "..", "skirk-rotation.py"))
rot = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(rot)

ROLL = {"cr": 0.033, "cd": 0.066, "atk%": 0.0496}            # average single roll, 5-star
MAIN = {"atk%": 0.466, "elem": 0.466, "cr": 0.311, "cd": 0.622}
FLOWER_HP, PLUME_ATK = 4780, 311
CASES = {"bad": 10, "lucky": 15, "good": 20}

# Owned swords and what their passive means for Skirk (Amber text, 22 Nov).
WEAPONS = {
    "The Black Sword": dict(r=1, na=0.20, note="Normal/Charged DMG +20%"),
    "Exaiphanes Blade": dict(r=5, note="passive is Traveler-only; stats only. Fearless: the Traveler uses it"),
    "Harbinger of Dawn": dict(r=5, note="+28% CRIT Rate only above 90% HP: not counted (Furina drains HP)"),
    "Cool Steel": dict(r=5, dmg=0.24, note="+24% DMG vs Hydro/Cryo-affected: always on in Freeze"),
    "Prototype Rancour": dict(r=1, base_atk=0.16, note="+16% ATK at 4 stacks from Normal Attacks"),
    "Favonius Sword": dict(r=1, note="energy only: no damage for Skirk"),
}

# Party buffs (wiki values; uptimes are assumptions and say so).
TEAMS = {
    "now: Furina (Burst 4), Escoffier, Charlotte": dict(
        fanfare=4, base_atk=0.20 + 0.48 * 0.5, shred=0.55,
        note="Noblesse +20% base ATK; Thrilling Tales +48% half the time"),
    "planned: Furina (Burst 4), Escoffier, Mona (Burst 4)": dict(
        fanfare=4, omen=0.48 * 0.35, shred=0.55, note="Omen 48% on ~35% of hits (4s)"),
    "planned, Furina Burst 10, Mona Burst 9": dict(
        fanfare=10, omen=0.58 * 0.35, shred=0.55, note="Omen 58% on ~35% of hits"),
}
FANFARE_SHARE = 0.6        # average Fanfare as a share of 300 points: assumption


def fanfare(level):
    return (0.0007 + 0.0002 * (level - 1)) * 300 * FANFARE_SHARE


def assemble(level, weapon, mains, subs, set_cryo=0.15):
    """Sheet stats: base + weapon + artifacts. Returns dict like the in-game sheet."""
    c = character_stats(10000114, level)
    w = weapon_stats(weapon_id(weapon), 90, WEAPONS.get(weapon, {}).get("r", 1))
    base = c["atk"] + w["atk"]
    pct = w.get("atk%", 0) + subs.get("atk%", 0) + sum(MAIN[m] for m in mains if m == "atk%")
    flat = PLUME_ATK + subs.get("atk", 0)
    return dict(base=base, atk=base * (1 + pct) + flat,
                cr=0.05 + w.get("cr", 0) + subs.get("cr", 0) + sum(MAIN[m] for m in mains if m == "cr"),
                cd=0.50 + c.get("cd", 0) + w.get("cd", 0) + subs.get("cd", 0) + sum(MAIN[m] for m in mains if m == "cd"),
                cryo=set_cryo + sum(MAIN[m] for m in mains if m == "elem"))


def rotation_dps(sheet, weapon, team, skill=7, burst=6, level=87):
    p = WEAPONS.get(weapon, {})
    build = dict(level=level, atk=sheet["atk"], cr=sheet["cr"], cd=sheet["cd"], cryo=sheet["cryo"],
                 skill=skill, burst=burst, weapon_na=p.get("na", 0), stacks=3, rifts=3,
                 enemy_level=110, enemy_res=0.10, shred=team["shred"],
                 team_atk=sheet["base"] * (team.get("base_atk", 0) + p.get("base_atk", 0)),
                 team_dmg=fanfare(team["fanfare"]) + team.get("omen", 0) + p.get("dmg", 0))
    return sum(d for _, d in rot.damage(build)) / rot.ROTATION_SECONDS


def allocate(n, level, weapon, mains, team, skill, burst):
    """n good rolls, each to the wanted stat that adds most damage."""
    subs = {"cr": 0.0, "cd": 0.0, "atk%": 0.0}
    for _ in range(n):
        best = max(ROLL, key=lambda s: rotation_dps(
            assemble(level, weapon, mains, dict(subs, **{s: subs[s] + ROLL[s]})), weapon, team, skill, burst, level))
        subs[best] += ROLL[best]
    return subs


def check_16_nov():
    """Rebuild the 16 Nov HoYoLAB sheet from its own pieces: ATK 2244, CRIT 66.2% / 124.9%."""
    subs = {"cr": 0.070 + 0.062 + 0.022 + 0.074 + 0.109, "cd": 0.117 + 0.124 + 0.124, "atk%": 0.0, "atk": 11}
    s = assemble(80, "The Black Sword", ["atk%", "atk%", "atk%"], subs)
    s["atk"] -= 0.466 * s["base"] - 0.348 * s["base"]       # her sands was +16: 34.8%, not 46.6%
    print("CHECK 16 Nov sheet: ATK %.0f (HoYoLAB 2244) | CRIT %.1f%% / %.1f%% (66.2 / 124.9)"
          % (s["atk"], 100 * s["cr"], 100 * s["cd"]))


def main():
    check_16_nov()
    level, skill, burst = 90, 9, 9
    mains = ["atk%", "elem", "cd"]                            # sands ATK%, Cryo goblet, CRIT DMG circlet
    print("\nSkirk Lv %d, Skill %d / Burst %d, Finale 4pc, KQM rotation (21.5s), dummy Lv 110, 10%% RES." % (level, skill, burst))
    print("Mains: ATK%% sands, Cryo goblet, CRIT DMG circlet. Fanfare averages %.0f%% of max (assumed).\n" % (100 * FANFARE_SHARE))
    for tname, team in TEAMS.items():
        print("== %s  (%s)" % (tname, team["note"]))
        print("   %-20s %8s %8s %8s" % ("weapon", *CASES))
        for weapon in WEAPONS:
            row = []
            for case, n in CASES.items():
                subs = allocate(n, level, weapon, mains, team, skill, burst)
                row.append(rotation_dps(assemble(level, weapon, mains, subs), weapon, team, skill, burst, level))
            print("   %-20s %8.0f %8.0f %8.0f" % (weapon, *row))
        print()
    print("Skirk's DPS only (rotation damage / 21.5s). Her team adds Escoffier and Furina on top.")
    for w, p in WEAPONS.items():
        print("  %-18s %s" % (w, p["note"]))


if __name__ == "__main__":
    main()
