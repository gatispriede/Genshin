# Varesa for Stygian Onslaught Fearless — roadmap (21 Nov 2026)

The owner pasted a Varesa roadmap from Google's AI search (pull Varesa C1 or Xilonen,
build targets for Varesa / Iansan / Xilonen / Furina). This note checks it against:

- the account: HoYoLAB roster read 16 Nov (`reference/data/hoyolab-roster-2026-11-16.json`),
  `src/data/characters.ts`, `src/data/teams.ts`; plus the newer numbers the owner gave
  Google (talents 8/6/7, CRIT 54.1% / 209.3%, ER 132.4%);
- the official Version 7.2 Event Wishes notices, Phase I and II (HoYoverse news feed,
  ids 167139 and 167370), read 21 Nov;
- the wiki: Stygian Onslaught, Stygian Onslaught/2026-11-11, Wanderlust Invocation,
  Varesa's Constellations 1–2, Valeriy's C6 "The Strength to Breach Enemy Lines",
  Xilonen's Elemental Skill, read 21 Nov.

Google AI Mode itself was not re-queried: it served the in-app browser a robot check.

## Verdict

**Do not pull for this.** Neither Varesa nor Xilonen is on a banner in Version 7.2:

| Phase | Dates | 5-stars | 4-stars |
|---|---|---|---|
| I | until 24 Nov 17:59 | Mitya, Furina | Valeriy, Charlotte, Rosaria |
| II | 24 Nov – 15 Dec | Zibai, Linnea | Illuga, Aino, Ningguang |

This Stygian cycle runs 11 Nov – 15 Dec, so the clear comes from the current account.

## This cycle (11 Nov – 15 Dec)

On Menacing, Fearless and Dire a character — and their weapon and artifacts — can fight
in only one of the three battlefields, and every character starts each battle with no
Energy. The account's three teams already use 12 different characters:

| Battlefield | Boss (Lv 105 on Fearless) | Advantage | Team |
|---|---|---|---|
| 1 | Wavebinder | Electro, Stellar Glimmer characters | Varesa · Furina · Charlotte · Valeriy |
| 2 | Emperor of Fire and Iron | Hydro (Pyro is a disadvantage) | Skirk · Mona · Escoffier · Mika |
| 3 | Radiant Moongecko | Geo, healing characters | Mizuki · Traveler · Rosaria · Sucrose |

Wavebinder suits Varesa: Electro DMG drains its Courage, and drains more of it during
Valiant Assault (shield, raised RES); when Courage runs out it takes massive backlash DMG.
Battlefield 3 is the weakest fit (no Geo character on that team).

## Upgrades, in order

1. **Furina's Burst talent, 4 → 8–10.** The weakest piece of the team: Lv 60, talents
   2/4/4, Golden Troupe at +0 to +9. Her party buff reads the Burst talent, not her level
   (about +21% at talent 1, +75% at 10). Leave her at Lv 60.
2. **Varesa: Normal Attack to 9, then Burst to 9.** Plunges scale on Normal Attack, the
   mini-Burst on Burst. Skill stays at 6.
3. **CRIT: a CRIT Rate circlet now beats the CRIT DMG one.** Average crit multiplier at
   54.1% / 209.3%:

   | Circlet | Valeriy debuff off | Valeriy C6 debuff on (+10%) |
   |---|---|---|
   | CRIT DMG (equipped) | ×2.13 | ×2.34 |
   | CRIT Rate (31.1% main) | ×2.25 (+6%) | ×2.40 (+3%) |

   This reverses the 16 Nov note in `characters.ts`, which was right at 63.9% CRIT Rate.
   Check first where ~10 points of CRIT Rate went: the 16 Nov flower (Long Night's Oath
   +20) carried 14.8% CRIT Rate; if it was swapped out, putting it back is free.
   Valeriy's C6 is conditional: +10% CRIT Rate on Electro DMG for 7s against enemies hit
   by his special Charged Attack or his Burst's shells.
4. **Energy for the 0-Energy start.** Varesa's 132% is fine. Furina's and Valeriy's
   Favonius Swords only make particles on CRIT hits, and they sit at 18% and 14% CRIT
   Rate: give each a CRIT sub or piece. Furina, the only Hydro unit, wants 180%+ ER
   (now 156%).
5. **Charlotte stays as healer.** Her heals feed Furina's Fanfare; Noblesse Oblige gives
   Varesa +20% ATK and Thrilling Tales R5 +48%. Cost: Cryo with Furina's Hydro makes
   Freeze, which competes with Electro-Charged.

## When the banners return: Xilonen over Varesa C1

- Varesa C1 adds 180% of her ATK to her plunge ground impact. C2 is her real spike:
  every plunge enters Apex Drive and restores 11.5 Energy.
- Xilonen's Skill reduces Pyro, Hydro, Cryo, Electro and Geo RES, so she also lifts the
  Skirk team (Cryo and Hydro). More account value than one Varesa constellation.
- Google's "Option A is safer because of Iansan" does not hold: Iansan is on no current
  banner. She, Bennett and Chevreuse are in the standard pool (Wanderlust Invocation), so
  any wish can drop them, none can be targeted.
- The account data has no Bennett (`characters.ts`: not owned); Google's plan assumed
  him. If he has been pulled since, re-split the teams.

## Not verified

- Google's "110k+ DPS" Fearless threshold: no source found. The last dummy test
  (16 Nov) was 18.4k DPS. Try Menacing first and measure the gap before spending.
- Gear since 16 Nov: the numbers above come from the owner's Google conversation. A
  HoYoLAB refresh (signed-in Chrome, see `reference/sources.md`) would settle the flower.
