"""Game data for the damage engine: characters, weapons and level curves from
Project Amber (gi.yatta.moe), cached under reference/data/amber/.

    from gamedata import character_stats, weapon_stats, weapon_id

character_stats(char_id, level, ascended=True) -> {"hp", "atk", "def", <ascension stat>: value}
weapon_stats(weapon_id, level, refinement)     -> {"atk", <substat>: value, "passive": [values at R]}
"""

import io
import json
import os
import subprocess

API = "https://gi.yatta.moe/api/v2"
CACHE = os.path.join("reference", "data", "amber")

# Amber property names -> the short names the engine uses.
PROP = {
    "FIGHT_PROP_BASE_HP": "hp", "FIGHT_PROP_BASE_ATTACK": "atk", "FIGHT_PROP_BASE_DEFENSE": "def",
    "FIGHT_PROP_HP_PERCENT": "hp%", "FIGHT_PROP_ATTACK_PERCENT": "atk%", "FIGHT_PROP_DEFENSE_PERCENT": "def%",
    "FIGHT_PROP_CRITICAL": "cr", "FIGHT_PROP_CRITICAL_HURT": "cd", "FIGHT_PROP_CHARGE_EFFICIENCY": "er",
    "FIGHT_PROP_ELEMENT_MASTERY": "em", "FIGHT_PROP_HEAL_ADD": "heal",
    "FIGHT_PROP_ICE_ADD_HURT": "elem", "FIGHT_PROP_WATER_ADD_HURT": "elem", "FIGHT_PROP_ELEC_ADD_HURT": "elem",
    "FIGHT_PROP_FIRE_ADD_HURT": "elem", "FIGHT_PROP_WIND_ADD_HURT": "elem", "FIGHT_PROP_ROCK_ADD_HURT": "elem",
    "FIGHT_PROP_GRASS_ADD_HURT": "elem", "FIGHT_PROP_PHYSICAL_ADD_HURT": "phys",
}


def _get(path, name):
    """Cached GET of an Amber endpoint's `data`."""
    os.makedirs(CACHE, exist_ok=True)
    file = os.path.join(CACHE, name + ".json")
    if not os.path.exists(file):
        raw = subprocess.run(["curl", "-s", API + path], capture_output=True, check=True).stdout
        body = json.loads(raw.decode("utf-8"))
        if body.get("response") != 200:
            raise SystemExit("Amber %s -> %s" % (path, body.get("response")))
        io.open(file, "w", encoding="utf-8").write(json.dumps(body["data"], ensure_ascii=False))
    return json.load(io.open(file, encoding="utf-8"))


def _curve(kind, level, curve_type):
    return _get("/static/%sCurve" % kind, "%s-curve" % kind)[str(level)]["curveInfos"][curve_type]


def _promote(promotes, level, ascended):
    """The ascension phase in effect at `level` (ascended = past the level cap)."""
    current = promotes[0]
    for p in promotes:
        cap = p["unlockMaxLevel"]
        if level > cap or (level == cap and ascended and p is not promotes[-1]):
            continue
        current = p
        break
    # A character at exactly a cap level who has ascended uses the next phase's bonuses.
    idx = promotes.index(current)
    if ascended and level == promotes[idx]["unlockMaxLevel"] and idx + 1 < len(promotes):
        current = promotes[idx + 1]
    return current.get("addProps", {})


def character_stats(char_id, level, ascended=True):
    data = _get("/en/avatar/%s" % char_id, "avatar-%s" % char_id)
    out = {}
    for p in data["upgrade"]["prop"]:
        out[PROP[p["propType"]]] = p["initValue"] * _curve("avatar", level, p["type"])
    for k, v in _promote(data["upgrade"]["promote"], level, ascended).items():
        key = PROP.get(k, k)
        out[key] = out.get(key, 0) + v
    return out


def weapon_index():
    return _get("/en/weapon", "weapon-index")["items"]


def weapon_id(name):
    for wid, w in weapon_index().items():
        if w["name"] == name:
            return wid
    raise SystemExit("no weapon named %r on Amber" % name)


def weapon_stats(wid, level, refinement=1, ascended=True):
    data = _get("/en/weapon/%s" % wid, "weapon-%s" % wid)
    out = {}
    for p in data["upgrade"]["prop"]:
        out[PROP[p["propType"]]] = p["initValue"] * _curve("weapon", level, p["type"])
    for k, v in _promote(data["upgrade"]["promote"], level, ascended).items():
        key = PROP.get(k, k)
        out[key] = out.get(key, 0) + v
    affix = data.get("affix") or {}
    for a in affix.values():
        levels = a.get("upgrade", {})
        out["passive"] = levels.get(str(refinement - 1), "")
        out["passive_name"] = a.get("name")
    out["name"] = data["name"]
    return out
