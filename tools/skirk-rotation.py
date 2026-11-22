"""Skirk's damage from her stats, hit by hit, with the real damage formula.

    python -I tools/skirk-rotation.py            # checks, then the owner's build and a KQM-like build

Per hit:  talent% x ATK x (1 + DMG bonus) x crit x DEF multiplier x RES multiplier
                   x Death's Crossing (Seven-Phase Flash Normal Attacks only)

  crit: the average (1 + CRIT Rate x CRIT DMG) for rotation damage; (1 + CRIT DMG)
        for a single crit, which is what the dummy's "Strongest Hit" shows.
  DEF:  (level + 100) / ((level + 100) + (enemy level + 100))   (no DEF shred)
  RES:  1 - RES/2 below 0, 1 - RES from 0 to 75%, 1/(1 + 4 RES) above.

Talent values and passives come from reference/data/kit-skirk.json (wiki, 22 Nov).
Rotation: the Genshin Scientist / KQM one (21.5s): Furina EQ, Escoffier EQ, a
support, then Skirk E 2N2D N2Q 2N2D N5D N2D N2C 2N2D N5D.
"""

import io
import json
import os

KIT = json.load(io.open(os.path.join("reference", "data", "kit-skirk.json"), encoding="utf-8"))

# Skirk's hits in the KQM rotation: N2 = hits 1-2, N5 = hits 1-5, C = Charged Attack,
# Q = Havoc: Extinction (no damage itself: it boosts the next 10 Normal Attack hits).
ROTATION = "2N2D N2Q 2N2D N5D N2D N2C 2N2D N5D"
ROTATION_SECONDS = 21.5


def hits(rotation):
    """The rotation as an ordered list of hit names, with 'Q' where Extinction is cast."""
    out = []
    for token in rotation.split():
        count = 1
        if token[0].isdigit() and token[1] == "N":
            count, token = int(token[0]), token[1:]
        for _ in range(count):
            n = int(token[1])
            out += ["hit%d" % i for i in range(1, n + 1)]
            if token[2:3] == "Q":
                out.append("Q")
            if token[2:3] == "C":
                out.append("charged")
    return out


def res_multiplier(res):
    if res < 0:
        return 1 - res / 2
    if res < 0.75:
        return 1 - res
    return 1 / (1 + 4 * res)


def def_multiplier(level, enemy_level):
    return (level + 100) / ((level + 100) + (enemy_level + 100))


def damage(build, crit_mode="average"):
    """Per-hit damage list for one rotation of Seven-Phase Flash."""
    skill, burst = str(build["skill"]), str(build["burst"])
    atk = build["atk"] + build.get("team_atk", 0)
    base_dmg = build["cryo"] + build.get("team_dmg", 0) + KIT["finale4pc"]["normal"] * build.get("finale4", 1)
    weapon_na = build.get("weapon_na", 0)
    stacks = KIT["deathsCrossing"].get(str(build.get("stacks", 3)), 1.0)
    rifts = build.get("rifts", 3)
    crit = (1 + min(build["cr"], 1) * build["cd"]) if crit_mode == "average" else (1 + build["cd"])
    mult = def_multiplier(build["level"], build["enemy_level"]) * res_multiplier(build["enemy_res"] - build.get("shred", 0))
    out, boosted = [], 0
    for h in hits(ROTATION):
        if h == "Q":
            boosted = 10
            continue
        talent = KIT["sevenPhase"][h][skill] / 100
        dmg_bonus = base_dmg + weapon_na
        if boosted and h != "charged":
            dmg_bonus += KIT["extinction"][burst][rifts] / 100
            boosted -= 1
        na = stacks if h != "charged" else 1.0           # Death's Crossing: Normal Attacks only
        out.append((h, talent * atk * (1 + dmg_bonus) * na * crit * mult))
    return out


def report(label, build):
    rot = damage(build)
    total = sum(d for _, d in rot)
    print("%s\n   rotation %.0f damage = %.0f DPS over %.1fs  |  biggest single crit %.0f"
          % (label, total, total / ROTATION_SECONDS, ROTATION_SECONDS,
             max(d for _, d in damage(build, "crit"))))
    return total


# The owner's 22 Nov dummy run: Lv 87 Skirk, sheet ATK 2274, CRIT 66% / 133%, Cryo 15%;
# Skill 7 / Burst 6 (16 Nov read), The Black Sword R1, Finale 4pc; dummy Lv 110, 10% RES.
# Team: Furina (Fanfare at Burst 4, up to 39%), Escoffier (-55% Cryo RES),
# Charlotte (Noblesse +20% of base ATK, Thrilling Tales +48% of base ATK on swap-in).
OWNER = dict(level=87, atk=2274, cr=0.66, cd=1.33, cryo=0.15, skill=7, burst=6,
             weapon_na=KIT["blackSword"]["1"], stacks=3, rifts=3,
             enemy_level=110, enemy_res=0.10, shred=0.55)


def main():
    base_atk = 861
    print("CHECK 1 - the dummy's 'Strongest Hit' 46,290 (22 Nov run), Fanfare and Charlotte's buffs at full:")
    for label, extra in (("  Noblesse only", 0.20), ("  Noblesse + Thrilling Tales", 0.68)):
        b = dict(OWNER, team_atk=base_atk * extra, team_dmg=0.39)
        print("%s: biggest crit %.0f" % (label, max(d for _, d in damage(b, "crit"))))

    print("\nOWNER'S BUILD in the KQM rotation (Fanfare avg 23%, Noblesse + half of Thrilling Tales):")
    owner = report("  now", dict(OWNER, team_atk=base_atk * 0.44, team_dmg=0.234))
    print("   measured on the dummy: 22,726 Skirk DPS over 60s from 0 Energy")

    # KQM-like build: Lv 90, talents 9/9, CRIT 75%/200%, ATK 2300, Cryo goblet (61.6%),
    # Finale of the Deep-type ATK weapon (no Normal Attack bonus), Fanfare at Burst 9 averaged
    # (0.23% x 180 points = 41%), Mona-type support with no extra ATK; standard enemy Lv 100, 10% RES.
    kqm = dict(level=90, atk=2300, cr=0.75, cd=2.00, cryo=0.616, skill=9, burst=9, weapon_na=0,
               stacks=3, rifts=3, enemy_level=100, enemy_res=0.10, shred=0.55, team_dmg=0.41)
    print("\nCHECK 2 - KQM-like build (Genshin Scientist: Skirk ~73% of 2.91M per 21.5s = ~2.12M):")
    total = report("  KQM-like", kqm)
    print("   = %.0f%% of the community figure" % (100 * total / 2.12e6))


if __name__ == "__main__":
    main()
