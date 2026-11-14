# Varesa — why ~50k, when showcases show ~150k

**Researched:** 2026-11-14 · **Roster:** HoYoLAB read, same day
**Model:** [`tools/varesa-damage.mjs`](../tools/varesa-damage.mjs) — every input is a named
constant; change one and re-run.
**Sources:** Fandom talent page (multipliers and passives, fetched 14 Nov); base ATK from
`reference/data/char_10000111.json` (≈341 at Lv 90, + The Widsith's 510).

## Answer

**Nothing is broken. Five ordinary gaps multiply.** The model puts her current Volcano Kablam
crit at **45.7k** — matching the ~50k seen in game, which is the check that the assumptions
are right — and a well-built C0 at **158.9k**, matching the clips.

| Gap | Kablam | Flying Kick |
|---|---|---|
| DMG bonus — Electro goblet + Furina's burst talent | ×1.46 | ×1.83 |
| CRIT DMG 123% → 200% | ×1.35 | ×1.35 |
| Electro RES shred — Viridescent Venerer swirling Electro | ×1.28 | ×1.28 |
| Burst talent 6 → 10 | ×1.22 | ×1.29 |
| ATK — a second Nightsoul Burst stack | ×1.14 | ×1.14 |
| **Together** | **×3.48** | **×4.62** |

Many clips are also **C6**, which adds +100% CRIT DMG and +10% CRIT Rate to exactly these
hits: the same build reaches **~212k**. No C0 build closes that.

## Her big hits, from the talent text

- **Fiery Passion Flying Kick** — her burst while in Fiery Passion. **805%** ATK at talent 6,
  1035% at 10. Not a plunge, so Long Night's Oath does *nothing* for it.
- **Volcano Kablam** — in Fiery Passion, a plunge triggers **Apex Drive**; during it she can
  cast a cheaper special burst that "is considered Plunging Attack DMG". **564%** at talent 6,
  725% at 10. Because it counts as a plunge, **Long Night's Oath applies** (2pc +25%, 4pc up to
  +75%), and so does her A1.
- **A1, Rainbow Crash** — after her Skill, a Fiery Passion ground impact gains **+180% of ATK**
  as flat damage. On Kablam that is a third of the hit; **skipping the Skill first throws it away**.
- **A4** — each party Nightsoul Burst gives **+35% ATK** for 12s, **max 2 stacks**. Nightsoul
  Bursts come from Natlan characters dealing Nightsoul damage, faster the more of them are in
  the party. She is the only Natlan character in her team now. **Kachina was the second** —
  moving her out cost this stack, though she was not built.
- **Plunges scale with her Normal Attack talent**, not her skill. Bursts scale with the burst
  talent.

## What to do, cheapest first

1. **Use the sequence.** Skill → Fiery Passion plunge → Kablam. Without the Skill first,
   Rainbow Crash is lost; without the plunge, there is no Apex Drive and no Kablam.
2. **Furina's burst talent.** 1 → 10 lifts Fanfare from +21% to +75% DMG for the whole team —
   the biggest single lever, and her buff ignores her level.
3. **Make Viridescent Venerer shred *Electro*.** VV shreds the element that was swirled. With
   Furina's Hydro and Charlotte's Cryo around, Sucrose's swirls can pick those up instead.
   Swirl after Varesa has applied Electro, or the ×1.28 does not land.
4. **Electro DMG goblet.** Worth less than its 46.6% suggests: it replaces an ATK% goblet, so
   ATK drops ~300. Net roughly **×1.08 on Kablam** (already diluted by Long Night's Oath's plunge
   bonus) and **×1.24 on Flying Kick**. Still the right goblet.
5. **CRIT DMG circlet**, then crit substats. Her crit is 44.9% / 123% — CRIT DMG is the short side.
6. **Burst talent 6 → 10.** Crowns needed at the top.
7. **A second Natlan teammate** for the second A4 stack — a roster question, not a farm.

## Assumptions in "now"

One Nightsoul stack; Furina at 300 Fanfare; Long Night's Oath at 5 stacks; Rainbow Crash
active on Kablam; Electro shred *not* landing; Charlotte's Noblesse Oblige up; Widsith's random
buff ignored; Lv 90 enemy with no DEF shred. That the model lands on ~46k against ~50k
observed suggests these are close.
