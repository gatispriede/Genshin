# Tactical Sweep — boss mechanics

**Researched:** 2026-11-10 · **Game version:** 7.2.0
**Companion to** [`11-tactical-sweep.md`](11-tactical-sweep.md), which holds the scores,
the diagnosis and the plan. This file is the reference for *how each boss works*.

All four bosses have a **state where your damage multiplies 4–6×**, and in every case the
gate is an elemental mechanic, not a stat. That is why levelling characters is the wrong
lever for this event.

---

## The resistance maths, once

Resistance converts to a damage multiplier **nonlinearly**:

| Formula | Interval |
|---|---|
| `1 − (RES ÷ 2)` | RES < 0 |
| `1 − RES` | 0 ≤ RES < 0.75 |
| **`1 ÷ (4 × RES + 1)`** | **RES ≥ 0.75** |

That third row is why shielded states are so punishing — and why breaking a shield is worth
more than any amount of character investment.

| Boss | Worst state | Multiplier | Best state | Multiplier | Swing |
|---|---|---|---|---|---|
| Cryo Regisvine | Shielded, 110% global | **0.185** | Stunned | ~0.90 | **≈4.9×** |
| Bathysmal Vishap | Shielded, 90% global | **0.217** | Shield broken | ~0.90 | **≈4.1×** |
| Jadeplume (Dendro DMG) | Normal, 80% Dendro RES | **0.20** | Paralyzed + Morale 30 | **1.225** | **≈6.1×** |
| Goldflame Tyrant | Golden Flame Form | **0** (immune) | Low-altitude | — | **total** |

---

## Element cheat-sheet

Lives with the plan, in [`11-tactical-sweep.md`](11-tactical-sweep.md#element-cheat-sheet) —
the sections below are where those four rows come from.

---

## Natlan: the 45-second immunity window is eating the timer

The Goldflame Qucusaur Tyrant's wiki page is **Holawaqa Ngoubou** — *Golden Tyrant of the
Broken Oath*, **Pyro**, Normal Boss, Natlan Saurians.

**Golden Flame Transformation** — the mechanic that decides this fight:

- Gains a **Pyro shield, 24 GU**, and **immunity to all damage**
- Lasts **45 seconds**, but **destroying the shield ends it early**
- On entering, it is **high-altitude — melee attacks cannot reach it**

While transformed it alternates two attacks:

- **Flamewind Feather** — fires feather barrages, leaving a **Pyro object worth 2 GU** that
  **can be destroyed with Elemental Reactions**
- **Dive** — and this is the lever:
  - **all** Flamewind Feathers destroyed → 65% ATK Pyro, and it enters **low-altitude,
    vulnerable to melee**
  - **any** feather still intact → 100% ATK Pyro over a larger AoE, and it **returns to
    high-altitude**

> **Leave one feather alive and it flies straight back up.** On a timed damage race, a
> three-Cryo melee party watches 45 seconds burn with no way to reach the boss. Kill every
> feather, take the low-altitude window, burst.

**What the trial lineup gives you for this:**

| Trial | Element | Weapon | Why it matters here |
|---|---|---|---|
| **Aino** | **Hydro** | Claymore | Best element against a 24 GU **Pyro** shield |
| **Chasca** | Anemo | **Bow** | Reaches high-altitude; charged shots feed the Morale 10 −50% RES |
| **Ororon** | Electro | **Bow** | Same — ranged, and Natlan for the Nightsoul condition |
| **Ifa** | Anemo | **Catalyst** | Ranged, applies Anemo for feather-clearing reactions |
| **Ineffa** | Electro | Polearm | Melee — lowest priority while it is airborne |

Three ranged options and a Hydro shield-breaker, for a boss that spends its immunity
phase in the air behind a Pyro shield. The lineup is the answer key.

---


## Foothills of Wind and Snow — Cryo Regisvine *(16,020 — worst stage)*

**This boss is 81.5% damage-immune until you break its shield.**

| State | Global RES | Physical | Cryo |
|---|---|---|---|
| **Shielded** | **110%** | 130% | **170%** |
| **Stunned** | — | 30% | 70% |

- Shield: **Cryo, 12 GU**, on the **Roots Core**. **Pyro is the most effective** against it.
- Breaking the core with elemental reactions **stuns** it — that is the damage window.
- The **Weak Point only appears after you destroy the corolla shield once.**
- It alternates **Roots Phase** (core at the roots) and **Corolla Phase** (core at the flower).

**Trial lineup: Xilonen, Klee, Prune, Fischl, Bennett** — and it solves two problems at once:

> **Klee is Pyro *and* Hexerei. Bennett is Pyro *and* an ATK buffer. Fischl is Hexerei.**
> **Klee + Fischl** satisfies the Hexerei: Secret Rite requirement of two Hexerei characters,
> while **Klee + Bennett** gives you double Pyro for a 12 GU Cryo shield.

This stage was failing for two stacked reasons — a shield that was probably never broken
efficiently, and two Morale buffs that could never fire. **Both are fixed by the same
three characters.** Expect the largest single jump here; it is the only stage still short
of **18,000**.

---

## Traversing Forest and Sand — Jadeplume Terrorshroom *(24,156 — closest)*

**It has a Fury bar you can deliberately overload to force a 15-second paralysis.**

| Trigger | Fury change |
|---|---|
| **Quicken / Aggravate / Spread** reaction | **+15%** |
| Electro hit | +2% |
| **Pyro hit** | **−34%** ⚠️ |

Fill the bar → it performs one attack → **paralyzed ~15 seconds**. Its stats in that state
confirm the ability text exactly: **global RES 25% → 0%, Dendro RES 80% → 55%.**

> ⚠️ **Bring no Pyro to this stage.** A single Pyro hit drains 34% of the bar — more than
> two Quicken reactions put in. Pyro actively undoes the thing you are trying to cause.

**Quicken-family reactions do double duty**, and this is the stage's whole trick:

1. They fill the Fury bar **7.5× faster** than plain Electro (15% vs 2%).
2. They trigger the **Morale 30 buff: −100% Dendro RES for 6s.**

Stack paralysis and Morale 30 together and Dendro RES goes **80% → 55% → −45%**, a
multiplier of **0.20 → 1.225 — about 6.1× on Dendro damage.**

**Quicken needs Dendro + Electro, and the trial lineup has no Electro at all**
(Baizhu, Yaoyao, Nilou, Tighnari, Candace are Dendro and Hydro only). Those five can
Bloom — which triggers the Morale 30 buff — but **Bloom does not fill the Fury bar.**

> **Bring your own Electro, exactly as you did on Natlan.** Varesa at Lv 80, or Fischl.
> Pair with trial **Tighnari** as the Dendro damage dealer: Spread is Dendro-triggered, so
> he is the one who actually cashes in the −100% Dendro RES.

---

## Isles of Lingering Thunder — Primordial Bathysmal Vishap *(19,764)*

| State | Global RES | Physical | Hydro |
|---|---|---|---|
| **Shielded** | **90%** | 110% | **150%** |
| Unshielded | — | 30% | 70% |

- Shield: **Hydro, 16 GU** — the largest of the three.
- **Destroyed with Elemental Reactions, and it is weakest to Dendro.**
- On break: **paralyzed**, and **both the field and the increased RES are removed.**
- **Cleansing Shower drains 10 Energy** from the active character — direct damage to your
  burst uptime on a timed run. Below 10 Energy it converts to HP Loss instead.

**The awkward one.** The trial lineup — Linnea, Yelan, Arataki Itto, Kazuha, Gorou — has
**no Dendro**, and this account's Dendro is Tighnari (Lv 20) and Collei (Lv 1). Any
reaction chips the shield; Dendro is merely the most efficient. Kazuha's Swirl and Electro
are the realistic tools here.

**The Morale buffs point at Geo instead.** Crystallize feeds all three tiers, and the
Morale 10 shockwave **resonates off Geo Constructs for up to 2 extra True DMG shockwaves.**
Itto and Gorou are both Geo; Yelan supplies the Hydro for Crystallize.

> **Worth testing: bring the Geo Traveler for the construct.** Itto and Gorou do not create
> Geo Constructs — the Traveler's stele does. The resonance shockwaves are **True DMG**, so
> a construct from a low-level Traveler still enables them. Unverified, but cheap to try.

---

