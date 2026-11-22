"""Reaction damage, from the wiki's Damage page (read 22 Nov 2026).

Transformative (Overloaded, Swirl, Superconduct, Electro-Charged, Shatter, ...):
    coefficient x level multiplier x (1 + 16 EM / (EM + 2000) + reaction bonus) x RES
    - only the TRIGGERING character's level and EM count; ignores DEF; no crit by default.

Indirect Lunar and Stellar Glimmer (Stellar Swirl, Lunar-Charged, Lunar-Crystallize):
    each contributor: coefficient x their level multiplier x (1 + reaction BASE bonus)
                      x (1 + 6 EM / (EM + 2000) + reaction bonus) x RES x their own crit
    then ranked: 0.6 x highest + 0.3 x 2nd + 0.05 x 3rd + 0.05 x 4th.
    Reaction base bonus: Cryo Traveler up to +7%, Odette and Sandrone up to +14% (Stellar).

    python -I tools/damage/reactions.py       # worked examples for the owner's teams
"""

import io
import json
import os

_LEVELS = json.load(io.open(os.path.join("reference", "data", "reaction-level-multiplier.json"), encoding="utf-8"))
LEVEL = {int(k): v for k, v in _LEVELS["character"].items()}

TRANSFORMATIVE = {"burning": 0.25, "swirl": 0.6, "superconduct": 1.5, "electro-charged": 2.0,
                  "bloom": 2.0, "overloaded": 2.75, "hyperbloom": 3.0, "shatter": 3.0}
LUNAR_STELLAR = {"stellar swirl": 0.75, "stellar vortex lv1": 2.0, "stellar vortex lv2": 3.0,
                 "lunar-crystallize": 1.6, "lunar-charged": 3.0}
RANK_WEIGHTS = (0.6, 0.3, 0.05, 0.05)


def res_multiplier(res):
    if res < 0:
        return 1 - res / 2
    return 1 - res if res < 0.75 else 1 / (1 + 4 * res)


def transformative(reaction, level, em, bonus=0.0, res=0.10, shred=0.0):
    """One instance of a transformative reaction (no crit)."""
    return (TRANSFORMATIVE[reaction] * LEVEL[level] * (1 + 16 * em / (em + 2000) + bonus)
            * res_multiplier(res - shred))


def lunar_stellar_individual(reaction, level, em, cr, cd, base_bonus=0.0, bonus=0.0, res=0.10, shred=0.0):
    """One contributor's share before ranking; average crit on their normal CRIT stats."""
    return (LUNAR_STELLAR[reaction] * LEVEL[level] * (1 + base_bonus) * (1 + 6 * em / (em + 2000) + bonus)
            * res_multiplier(res - shred) * (1 + min(cr, 1.0) * cd))


def lunar_stellar(individuals):
    """Combine contributors' individual damage, highest first, with the 0.6/0.3/0.05/0.05 weights."""
    ranked = sorted(individuals, reverse=True)
    return sum(w * d for w, d in zip(RANK_WEIGHTS, ranked))


def main():
    print("Overloaded, Lv 90, EM 0 / 100 / 300, dummy 10%% RES:  %.0f / %.0f / %.0f"
          % tuple(transformative("overloaded", 90, em) for em in (0, 100, 300)))
    print("  with Chevreuse's -40%% Pyro/Electro RES:            %.0f"
          % transformative("overloaded", 90, 0, shred=0.40))
    # Mizuki (Lv 90, EM 644 + 100 from her A4, CRIT 20% / 63%) and the Cryo Traveler (Lv 40,
    # EM ~0, crit 5%/50%, +7% Stellar base bonus at 2000 ATK; less at Lv 40).
    mizuki = dict(level=90, em=744, cr=0.20, cd=0.63)
    trav = dict(level=40, em=0, cr=0.05, cd=0.50)
    for kind in ("stellar swirl", "stellar vortex lv1", "stellar vortex lv2"):
        m = lunar_stellar_individual(kind, base_bonus=0.03, **mizuki)
        t = lunar_stellar_individual(kind, base_bonus=0.03, **trav)
        print("%-19s Mizuki alone %6.0f | Mizuki + Lv 40 Traveler %6.0f" % (kind, lunar_stellar([m]), lunar_stellar([m, t])))
    m90 = lunar_stellar_individual("stellar vortex lv2", base_bonus=0.03, **mizuki)
    t90 = lunar_stellar_individual("stellar vortex lv2", base_bonus=0.07, level=90, em=0, cr=0.05, cd=0.50)
    print("Stellar Vortex Lv 2 with a Lv 90 Traveler (2000+ ATK, +7%%):    %6.0f" % lunar_stellar([m90, t90]))
    crit_m = lunar_stellar_individual("stellar vortex lv2", base_bonus=0.03, level=90, em=744 - 187, cr=0.51, cd=0.63)
    print("Mizuki with a CRIT Rate circlet instead of EM (EM -187, CR +31%%): %6.0f vs %6.0f alone"
          % (lunar_stellar([crit_m]), lunar_stellar([m90])))


if __name__ == "__main__":
    main()
