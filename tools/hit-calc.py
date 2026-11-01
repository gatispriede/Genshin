#!/usr/bin/env python3
"""
How big a single number can Varesa or Skirk put on screen?

Multipliers come from reference/data/char_*.json (Project Amber payloads).
Base ATK per level is reconstructed from the same payloads:
  base_atk(L) = initValue * curve(L) + ascension_addProp
The curve values were solved from published anchor points and then
cross-checked -- see CURVE below.

Damage formula (KeqingMains / Fandom):
  hit = ATK * MV * (1 + DMG%) * finalMult * (1 + CD) * defMult * resMult
  defMult = (charLv+100) / ((charLv+100) + (enemyLv+100))
  resMult = 1 - RES          (10% base; 4pc Viridescent Venerer -> -30% -> 1.30)
"""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'reference', 'data')

# ---------------------------------------------------------------- level curve
# GROW_CURVE_ATTACK_S5, solved from Skirk's published per-level base ATK table
# (genshinlist / KeqingMains: 28/72/.../233/250/274/292/317/334/359) using
# curve(L) = (published - ascension_add) / initValue.
# Verified independently against Varesa: Lv80(A6)=331 and Lv90=356 (GameWith).
CURVE = {60: 6.063, 70: 6.922, 80: 7.853, 90: 8.747}

def char_base_atk(cid, lvl, asc):
    d = json.load(open(os.path.join(DATA, f'char_{cid}.json')))['data']['upgrade']
    init = next(p['initValue'] for p in d['prop']
                if p['propType'] == 'FIGHT_PROP_BASE_ATTACK')
    add = 0.0
    for p in d['promote']:
        if p.get('promoteLevel') == asc and p.get('addProps'):
            add = p['addProps']['FIGHT_PROP_BASE_ATTACK']
    return init * CURVE[lvl] + add

def talent_params(cid, idx, lvl):
    t = json.load(open(os.path.join(DATA, f'char_{cid}.json')))['data']['talent']
    return t[str(idx)]['promote'][str(lvl)]['params']

def labelled(cid, idx, lvl):
    """{label: param value} for one talent at one level."""
    t = json.load(open(os.path.join(DATA, f'char_{cid}.json')))['data']['talent'][str(idx)]
    p = t['promote'][str(lvl)]['params']
    out = {}
    for line in t['promote']['1']['description']:
        if not line or '|' not in line:
            continue
        name, tpl = line.split('|', 1)
        vals = [p[int(m) - 1] for m in re.findall(r'\{param(\d+):', tpl)]
        out[name] = vals
    return out

# ----------------------------------------------------------------- the formula
def hit(atk, mv, dmg_bonus=0.0, final=1.0, cd=0.0,
        char_lv=90, enemy_lv=73, res=0.10):
    defm = (char_lv + 100) / ((char_lv + 100) + (enemy_lv + 100))
    return atk * mv * (1 + dmg_bonus) * final * (1 + cd) * defm * (1 - res)

VARESA, SKIRK = '10000111', '10000114'

# ------------------------------------------------------------------- ATK model
# Chronicle totals (28 Oct) pin the "now" rows exactly. Artifact contribution is
# split into ATK% (A) and flat (F) so later levels/weapons can be projected:
#   total = (charBase + weaponBase) * (1 + A) + F
WIDSITH   = {70: 414, 90: 510}   # Lv70 45.4% CDM matches the Chronicle read
RANCOUR70 = 458                  # estimated from the 565-base Lv90 tier
EXAIPHANES = 608                 # 5* tier 5, +33.1% CRIT Rate

def atk_total(char_base, weapon_base, A, F):
    return (char_base + weapon_base) * (1 + A) + F

# Varesa: circlet ATK% 31.3%; residual flat from plume + substats
vb70 = char_base_atk(VARESA, 70, 4)
V_A, V_F = 0.35, 1091 - (vb70 + WIDSITH[70]) * 1.35
# Skirk: goblet ATK% 30.8%; residual flat from plume + substats
sb60 = char_base_atk(SKIRK, 60, 3)
S_A, S_F = 0.36, 1206 - (sb60 + RANCOUR70) * 1.36

if __name__ == '__main__':
    print(f"Varesa base ATK  Lv70(A4)={vb70:.0f}  Lv80(A5)={char_base_atk(VARESA,80,5):.0f} "
          f" Lv80(A6)={char_base_atk(VARESA,80,6):.0f}  Lv90(A6)={char_base_atk(VARESA,90,6):.0f}")
    print(f"Skirk  base ATK  Lv60(A3)={sb60:.0f}  Lv70(A4)={char_base_atk(SKIRK,70,4):.0f} "
          f" Lv80(A5)={char_base_atk(SKIRK,80,5):.0f}  Lv90(A6)={char_base_atk(SKIRK,90,6):.0f}")
    print(f"artifact model   Varesa A={V_A:.3f} F={V_F:.0f}   Skirk A={S_A:.3f} F={S_F:.0f}")
    print()
    for lv in (1, 6, 9, 10):
        na = labelled(VARESA, 0, lv)
        q  = labelled(VARESA, 3, lv)
        print(f"V t{lv:>2}: FP high-plunge impact {na['Fiery Passion Low/High Plunge DMG'][1]*100:6.1f}%"
              f"   Volcano Kablam {q['Volcano Kablam DMG'][0]*100:6.1f}%")
    print()
    SSB = "Serpent's Subtlety Bonus"
    for lv in (1, 6, 9, 10):
        e = labelled(SKIRK, 1, lv)
        q = labelled(SKIRK, 3, lv)
        print(f"S t{lv:>2}: 7PF N5 {e['5-Hit DMG'][0]*100:6.1f}%"
              f"   burst final slash {q['Final Slash DMG'][0]*100:6.1f}%"
              f"   SS/pt {q[SSB][0]*100:5.1f}%")

    # ------------------------------------------------------------- scenarios
    # ATK% from any source (artifacts, weapon passive, Varesa's A4) applies to
    # BASE ATK = character base + weapon base, so it is summed into `A`.
    SSB = "Serpent's Subtlety Bonus"
    HDR = (f"{'scenario':<44}{'ATK':>6}{'CR':>5}{'CD':>6}{'t':>3}"
           f"{'avg':>9}{'CRIT':>9}")

    def vrow(label, lv, asc, wep, A, F, cr, cd, ele, t,
             lno=5, res=0.10, enemy=73):
        atk = atk_total(char_base_atk(VARESA, lv, asc), wep, A, F)
        mv  = labelled(VARESA, 0, t)['Fiery Passion Low/High Plunge DMG'][1] + 1.80
        dmg = ele + 0.25 + 0.15 * lno            # LNO 2pc +25%, 4pc 15%/stack
        a = hit(atk, mv, dmg, 1.0, cd * min(cr, 1.0), lv, enemy, res)
        c = hit(atk, mv, dmg, 1.0, cd, lv, enemy, res)
        print(f"{label:<44}{atk:>6.0f}{cr*100:>4.0f}%{cd*100:>5.0f}%{t:>3}{a:>9,.0f}{c:>9,.0f}")

    def srow(label, lv, asc, wep, A, F, cr, cd, t, dc, res=0.10, enemy=73):
        atk = atk_total(char_base_atk(SKIRK, lv, asc), wep, A, F)
        q   = labelled(SKIRK, 3, t)
        mv  = q['Final Slash DMG'][0] + 11 * q[SSB][0]
        dmg = 0.15 + 0.60                        # Finale 2pc Cryo, 4pc burst +60%
        a = hit(atk, mv, dmg, dc, cd * min(cr, 1.0), lv, enemy, res)
        c = hit(atk, mv, dmg, dc, cd, lv, enemy, res)
        print(f"{label:<44}{atk:>6.0f}{cr*100:>4.0f}%{cd*100:>5.0f}%{t:>3}{a:>9,.0f}{c:>9,.0f}")

    print("\nVARESA - Fiery Passion high-plunge ground impact with Rainbow Crash")
    print("         (A1 adds +180% ATK to the impact).  vs enemy Lv73\n" + HDR)
    vrow("now  Lv70, Widsith L70, talents 1",       70,6-2, WIDSITH[70], V_A,V_F, .243,.998, 0,  1, 3)
    vrow("now  Lv70, talents 6",                    70,4,   WIDSITH[70], V_A,V_F, .243,.998, 0,  6, 3)
    vrow("ascend Lv80 (A5), talents 6",             80,5,   WIDSITH[70], V_A,V_F, .291,.998, 0,  6, 3)
    vrow("Lv90 (A6), Widsith L90, talents 9",       90,6,   WIDSITH[90], V_A,V_F, .340,.998, 0,  9, 5)
    vrow("+ Electro goblet, ATK% sands, CR circlet",90,6,   WIDSITH[90], 0.55,200, .600,1.60,.466, 9, 5)
    vrow("+ talents 10, good substats",             90,6,   WIDSITH[90], 0.70,230, .700,2.00,.466,10, 5)
    vrow("+ A4 passive, 1 stack (+35% ATK)",        90,6,   WIDSITH[90], 1.05,230, .700,2.00,.466,10, 5)
    vrow("+ 4pc VV Sucrose (-40% Electro RES)",     90,6,   WIDSITH[90], 1.05,230, .700,2.00,.466,10, 5, res=-0.30)
    vrow("CEILING on Vivid Notions R1 (674/44.1%)", 90,6,   674,         1.33,230, .700,2.441,.466,10,5, res=-0.30)

    print("\nSKIRK - Havoc: Ruin final slash at 61 Serpent's Subtlety (+11 pts)")
    print("        4pc Galleries burst +60%.  DC = Death's Crossing.  vs enemy Lv73\n" + HDR)
    srow("now  Lv60 (A3) - NO 2nd passive, talents 1",60,3, RANCOUR70, S_A,S_F, .205,1.061, 1, 1.00)
    srow("ascend Lv70 (A4): Death's Crossing x3",     70,4, RANCOUR70, S_A,S_F, .205,1.061, 6, 1.60)
    srow("Lv90 (A6) + Exaiphanes Blade, talents 9",   90,6, EXAIPHANES, S_A,S_F, .536,1.253, 9, 1.60)
    srow("+ ATK% sands, CR circlet, talents 10",      90,6, EXAIPHANES, 0.70,260, .750,1.70,10, 1.60)
    srow("CEILING + 4pc VV Sucrose (-40% Cryo RES)",  90,6, EXAIPHANES, 0.70,260, .750,1.70,10, 1.60, res=-0.30)

    print("\nEnemy level sensitivity, Varesa's ceiling-with-Widsith CRIT:")
    for e in (1, 30, 53, 73, 90, 95):
        vrow(f"   vs enemy Lv{e}", 90,6, WIDSITH[90], 1.05,230, .700,2.00,.466,10,5,
             res=-0.30, enemy=e)
