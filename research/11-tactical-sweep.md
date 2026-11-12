# Tactical Sweep — getting all four stages to 36,000

**Researched:** 2026-11-10 · **Game version:** 7.2.0 (installed build, read from `config.ini`)
**Event:** *The Grand Defense: Defy the Unjust Judgment* — Flagship, Version 7.2
**Window:** 2026-11-04 11:00 → **2026-12-16 03:59** (GMT+8). Five weeks left as of writing.

> **How each boss actually works** — shields, paralysis windows, resistance tables —
> is in [`11a-tactical-sweep-bosses.md`](11a-tactical-sweep-bosses.md). This file is the
> scores, the diagnosis and the plan.

---

## Where this account stands

Read off the event screens, 10 Nov 2026.

| Stage | Region | Boss | Best score | 6k | 18k | 36k |
|---|---|---|---|---|---|---|
| **Traversing Forest and Sand** | Sumeru | Jadeplume Terrorshroom | **24,156** | ✓ | ✓ | ✗ |
| **Isles of Lingering Thunder** | Inazuma | Primordial Bathysmal Vishap | **19,764** | ✓ | ✓ | ✗ |
| **Plains of Blazing Fire** | Natlan | Goldflame Qucusaur Tyrant | **24,000** ↑↑ | ✓ | ✓ | ✗ |
| **Foothills of Wind and Snow** | Mondstadt | Cryo Regisvine | **16,020** | ✓ | **✗** | ✗ |

**No stage has reached 36,000.** Mondstadt has not reached 18,000 either — that is the
cheapest unclaimed reward on the board, at less than half the bar everything else is
chasing.

> ✅ **Tested twice, 10 Nov. 18,288 → 22,000 → 24,000, a 31% gain with no farming.**
>
> | Party | Score |
> |---|---|
> | 1 trial + own Lv 80, Lv 70, **Lv 32** | 18,288 |
> | 4 trials: Chasca · Aino · Ifa · Ororon | 22,000 |
> | **Varesa (own, Lv 80) · Ororon · Aino · Chasca** | **24,000** |
>
> **"Field the trials" was too blunt a rule.** The third party swaps a Lv 90 trial *out*
> for an own Lv 80 and gains 2,000. The rule that actually holds is in the next section:
> **field whoever triggers the stage's Morale condition hardest**, trial or not.

---

## What is actually still unclaimed

| Objective | Reward |
|---|---|
| Reach 20 overall Morale | 40 Primogems · 100 Threat Suppression · 3 Hero's Wit |
| Top score 6,000 | 20 Primogems · 100 Threat Suppression · 3 Hero's Wit |
| Top score 18,000 | 60,000 Mora · 6 Mystic Enhancement Ore · 3 Sanctifying Unction |
| Top score 36,000 | 30,000 Mora · 3 Mystic Enhancement Ore · 3 Sanctifying Unction |

> **Every Primogem in Tactical Sweep is already banked.** Both Primogem objectives sit at
> the 20-Morale and 6,000 tiers, and all four stages have cleared both. Pushing to 36,000
> pays **materials only** — no gems. Decide with that in mind.

**Outstanding across all four stages:** 180,000 Mora, 18 Mystic Enhancement Ore,
15 Sanctifying Unction.
(4 × the 36,000 tier, plus Mondstadt's missing 18,000 tier.)

**Sanctifying Unction** is a 3-star artifact EXP material worth **2,500 Artifact EXP** each.
Fifteen of them is 37,500 EXP — real, but not transformative. It is not Sanctifying
*Elixir*; the two are unrelated. See [`06-artifact-plan.md`](06-artifact-plan.md).

---

## The difficulty multiplier is already maxed — this was my first wrong guess

| Difficulty | Score multiplier | Enemy level |
|---|---|---|
| Standard Strike | ×1 | 40 |
| Crippling Blow | ×6 | *unlisted on the wiki* |
| **Brutal Eradication** | **×18** | **90** |

The four scores cluster in a narrow 16k–24k band across four unrelated bosses, which
looks exactly like a shared multiplicative ceiling. It is not. **The in-game Opposing
Lineup reads `Goldflame Qucusaur Tyrant — Lv. 90`, which is Brutal Eradication.** The
account is already on the top difficulty and already taking the ×18.

> **Consequence:** there is no multiplier left to buy. The gap to 36,000 is **pure
> damage**, and it is roughly **2× on every stage** (36,000 ÷ 18,288 = 1.97, ÷ 16,020 = 2.25,
> ÷ 24,156 = 1.49).

---

## Why the damage is low — two causes, both fixable without farming

### 1. Four party slots, five Lv 90 trials offered, one used

Observed on the Natlan stage, 10 Nov:

| Slot | Who | Level |
|---|---|---|
| 1 | own character, Cryo | **Lv 80** |
| 2 | **trial** | Lv 90 |
| 3 | own character, Cryo | **Lv 70** |
| 4 | own character, Cryo | **Lv 32** |

Each stage offers **five trial characters, all Lv 90, pre-built**, for four slots. Three
slots went to own characters instead, one of them **Lv 32 against a Lv 90 boss under Ley
Line Disorders** — a quarter of the party contributing close to nothing in a timed damage
race.

This account's own roster is the weakness the repo has documented since October: talents
at Lv 1, Crit Rate near base, no Elemental DMG goblets
([`05-current-loadouts.md`](05-current-loadouts.md)). The trials have none of those
problems. **Field them.**

### 2. The Morale 30 buff is not firing — and your own roster often *cannot* fire it

Morale unlocks buffs at **10 / 20 / 30**. All four stages show "Reach 20 overall Morale"
ticked, so the 10 and 20 buffs are live. **The 30-tier buff is the large one, and every
stage gates it behind a trigger the trial lineup is built to satisfy:**

| Stage | Morale 30 buff | Trigger | Can this roster trigger it? |
|---|---|---|---|
| Sumeru | −100% Dendro RES on target, 6s | Bloom / Lunar-Bloom / Quicken / Aggravate / Spread | Barely — Tighnari Lv 20, Collei Lv 1 |
| Natlan | **+60% CRIT DMG**, party-wide, 6s | **Nightsoul points consumed** | Not with a 3× Cryo party |
| Mondstadt | **+40% ATK**, party-wide | "Hexerei: Secret Rite" active | **No — hard lock, see below** |
| Inazuma | +60% DEF, party-wide, 6s | Crystallize / Lunar-Crystallize | Barely — only Geo is Noelle Lv 32 |

The Morale 10 and 20 buffs gate the same way:

| Stage | Morale 10 | Morale 20 |
|---|---|---|
| Sumeru | Skill/Burst → Electro shockwave, True DMG, 6s CD | Three Retainers of King Deshret ranged strike |
| Natlan | **Charged Attack** → shockwave, True DMG, **−50% all RES 6s** | Mountain King + Spiritspeaker ranged strike |
| Mondstadt | *Witch's Homework* character triggers a reaction → True DMG | Stormterror ranged strike |
| Inazuma | Crystallize → Geo shockwave, True DMG; **resonates off Geo Constructs, up to 2 extra** | Kamuijima Cannon ranged strike |

---

## Mondstadt is a hard lock, and that is why it scores worst

Both the Morale 10 and Morale 30 buffs on *Foothills of Wind and Snow* require characters
who have completed **Witch's Homework**.

Witch's Homework unlocks a Hexerei character's *Witch's Eve Rite Passive*, and the
requirement is explicit: **you must own the character, and the character must be Level 70
or higher.** The **Hexerei: Secret Rite** team bonus then needs **at least two Hexerei
characters in the party**.

Hexerei characters are Albedo, Klee, Mona, Venti, Durin, Varka, Nicole, Lohen, **Fischl**,
Razor and **Sucrose**.

This account owns Fischl and Sucrose. As of the 23 Oct roster read they were **Lv 50 and
Lv 40** — both under the Lv 70 gate. **Neither Mondstadt buff has ever fired.**

> **The fix is free.** The Mondstadt trial lineup is **Xilonen, Klee, Prune, Fischl,
> Bennett** — Klee and Fischl are both Hexerei, which is exactly the two that Secret Rite
> needs. Field both. This stage is not a damage problem, it is a switch that could not be
> reached.
>
> ⚠️ *Inference, not verified:* that trial-version characters count as having completed
> Witch's Homework. The trial lineup containing precisely two Hexerei characters is strong
> circumstantial evidence, but the wiki does not state it. One run confirms it.

---

## The remaining 1.5× is rotational, not a stat problem

Natlan sits at **24,000** with Varesa · Ororon · Aino · Chasca. 36,000 ÷ 24,000 = **1.5×**.
The team is done; what is left needs no resin and no character levels.

### 1. Hold the −50% RES debuff — worth about 1.33×

The Morale 10 buff fires on a **Charged Attack** hit: True DMG plus **−50% All Elemental
and Physical RES for 6 seconds, once every 6 seconds.** The cooldown exactly matches the
duration, so it can be held at **100% uptime** — a charged attack every 6 seconds, forever.

The RES multiplier is nonlinear. For `RES < 0` it is `1 − (RES ÷ 2)`:

| Target RES | RES multiplier |
|---|---|
| 10% (typical enemy base) | `1 − 0.1` = **0.90** |
| 10% − 50% = **−40%** | `1 − (−0.4 ÷ 2)` = **1.20** |

**0.90 → 1.20 is a 1.33× damage gain**, on every element, for every party member, for the
whole fight. **Chasca and Ororon are both bows** — charged shots are their natural rhythm.
If this debuff is not up continuously, it is the largest single thing being left on the
table.

### 1b. Nightsoul is the real selection rule on Natlan — and you own one of the best

The Morale 30 condition is *"the active character consumes **Nightsoul points**."* That is
a **Nightsoul's Blessing talent**, and exactly **12 characters in the game have one**:

| Talent | Character |
|---|---|
| Riding the Night-Rainbow | **Varesa** |
| Airborne Disease Prevention | Ifa |
| Nightshade Synesthesia | Ororon |
| Spirit Reins, Shadow Hunt | Chasca |
| Thunderbolt Rush | Iansan |
| Surfshark Wavebreaker | Mualani |
| Canopy Hunter: Riding High | Kinich |
| Go, Go Turbo Twirly! | Kachina |
| Dawnfrost Darkstar | Citlali |
| Yohual's Scratch | Xilonen |
| The Named Moment | Mavuika |
| Flowfire Blade | Traveler (Pyro) |

**Varesa is on that list, and this account owns her at Lv 80.** Swapping her in for Ifa
keeps the Nightsoul trigger intact while trading a 4★ support catalyst for a 5★ DPS
catalyst — which is the whole of the 22,000 → 24,000 gain. **Aino is the only non-Nightsoul
slot in the current party, and she earns it** as the Hydro answer to a 24 GU Pyro shield.

**Nightsoul Burst** is a second, separate reason to stack Natlanese characters. It fires on
dealing Elemental DMG while the party contains a Natlanese character, and **the interval
depends on how many you field:**

| Natlanese in party | Burst interval |
|---|---|
| 1 | 18s |
| 2 | 12s |
| **3 or more** | **9s** |

Varesa, Ororon and Chasca are all Natlan → **already at the 9-second cap**. Replacing Aino
with a fourth Natlanese buys nothing here and loses the shield-breaker. **Keep this party.**

### 2. Reach Morale 30 before engaging — +60% CRIT DMG

*"Reach 20 overall Morale"* is a reward threshold, not a cap. The **Morale 30** buff on
Natlan is **+60% CRIT DMG party-wide** on Nightsoul consumption — which Varesa, Chasca and
Ororon all do. The condition is satisfiable; the Morale just has to be there, and it comes
from the deployment phase — **see "The deployment phase is the real Morale lever" below.**

### 3. Clear every Flamewind Feather

Miss one and the boss returns to high-altitude, out of melee reach, burning the timer
behind a 24 GU Pyro shield. Aino's Hydro is the shield-breaker. Full mechanics in
[`11a-tactical-sweep-bosses.md`](11a-tactical-sweep-bosses.md).

---

## The deployment phase is the real Morale lever — *added 2026-11-10 after checking community guides*

> **This is the correction.** Fandom's **Operations** section is literally `''To be added''`
> for all four stages, so a wiki-only reading — which the rest of this document was — misses
> the system that actually produces Morale. Community guides have it. The boss mechanics in
> [`11a-tactical-sweep-bosses.md`](11a-tactical-sweep-bosses.md) were **confirmed**, not
> contradicted; this section is what was **missing**.

Before each boss there are **rounds of operations**, and each operation carries
**deployment objectives**. Meeting them is what raises Morale:

- **dispatch at least N members** (often 2)
- **a Main Force member with a specific trait** — an element, e.g. Hydro or Pyro
- **specific weapon types** — e.g. Catalyst or Sword
- **a named Support Squad faction** — Knights of Favonius, Shogunate Forces, Folk
  Craftsman, Shrine Maiden, Scions of the Canopy…

> **"Harder events require more traits but award more Morale on completion."**
> So the optimisation is not "clear the events" — it is **take the demanding ones and
> satisfy every listed objective.**

### Deployment order matters, because deployed characters are spent

This is the non-obvious part. A character sent on one round is **tied up** and cannot serve
a later round that names them. Two documented consequences:

| Stage | What the guides say |
|---|---|
| **Isles of Lingering Thunder** | Round 2 (Kannazuka) only needs **Thoma**. Deploy him *alone* to reserve **Itto and Gorou** for Round 3 (Tatarasuna), which "secures all remaining Morale." |
| **Plains of Blazing Fire** | Round 2 **cannot** reach full Morale — the required support is not available yet. Round 3 can reach maximum. Do not burn resources chasing it. |

**Rule: deploy the minimum that satisfies a round's objectives, and hold back anyone a
later round names.** Round 3 of each stage tends to demand specific characters —
Layla + Tighnari (Sumeru), Ororon + Chasca (Natlan), Bennett + Mona (Mondstadt),
Gorou + Itto (Inazuma).

### Round requirements, per community guides

In-game screen is authoritative; these are third-party summaries.

| Stage | Rounds want | Boss team |
|---|---|---|
| **Sumeru** | R1 Cryo/Pyro/Dendro + sword/bow · R2 Electro/Dendro + polearm/bow, 2+ members · R3 **Layla + Tighnari**, Folk Craftsman · R4 Pyro/Dendro, Jardinage Chamber | Bloom or Quicken — Nilou, Baizhu, Yaoyao, Tighnari, Fischl, Collei |
| **Natlan** | R1 Anemo/Electro + bow/polearm, Scions of the Canopy · R2 Electro/Hydro/Anemo + catalyst/bow/polearm · R3 **Ororon + Chasca** · R4 Electro/Anemo, Flower-Feather Clan | Natlan characters — **Chasca's Charged Attacks deal bonus damage** |
| **Mondstadt** | R1 Cryo/Pyro, 2 elements, 2× Knights of Favonius · R2 Pyro/Electro · R3 **Bennett + Mona**, Anemo/Electro · R4 Cryo/Pyro + sword/bow | **Hexerei: Secret Rite characters, preferably with Pyro to break the shields** |
| **Inazuma** | R1 Pyro/Anemo, Folk Craftsman / Shogunate Forces · R2 Geo/Pyro, Shogunate Forces · R3 **Gorou + Itto**, Folk Craftsman · R4 Geo/Pyro + claymore/polearm | Crystallize — **a Geo character is required** |

### What this confirms

Every boss-team line matches what the resistance tables already implied — **Mondstadt**
*"preferably with Pyro to break the boss's shields"* (the 12 GU Cryo shield), **Sumeru**
Bloom/Quicken/Aggravate/Spread, **Inazuma** *"a Geo character is required"* (supporting the
Geo-Construct idea), **Natlan** Chasca's charged attacks (the −50% RES buff).

### ⚠️ Conflicting reward figure

| Source | 36,000 tier Mora |
|---|---|
| Fandom wiki | **30,000** |
| Game8 | **60,000** |

The two also disagree on the event total for Mystic Enhancement Ore (27 vs 36). Unresolved
— the in-game reward screen settles it, and the screenshots in this file show the icon but
not a legible count.

---

## The plan

1. **Keep Varesa · Ororon · Aino · Chasca on Natlan.** Measured at +31% over the original
   party. On the other three stages, pick for the Morale condition first and raw level
   second — trial or own character, whichever triggers it harder.
2. **Charged attack every 6 seconds** to hold −50% RES. Largest remaining multiplier, free.
3. **Work the deployment phase properly** — take the demanding operations, satisfy every
   listed objective, deploy the *minimum* per round, and reserve the characters Round 3
   names. This is where Morale 30 comes from, and it is the lever this document originally
   under-described.
4. **Do Mondstadt next, with Klee + Bennett + Fischl.** Double Pyro for the 12 GU Cryo
   shield, and Klee + Fischl for Hexerei: Secret Rite. It is the only stage still short of
   **18,000**, and the biggest expected jump on the board.
5. **Break the shield first on every stage.** Shielded, the Regisvine takes **18.5%** and
   the Vishap **21.7%** of your damage. Nothing else you do matters until it is down.
6. **On Natlan, clear every Flamewind Feather** before the Dive, and open the shield with
   Aino's Hydro.
7. **On Sumeru, bring Electro and no Pyro.** Quicken fills the Fury bar at 15% a trigger;
   Pyro drains it at 34% a hit.

### Element cheat-sheet

| Stage | Break with | Never bring | Morale condition |
|---|---|---|---|
| Mondstadt — Cryo Regisvine | **Pyro** (12 GU Cryo) | — | 2× Hexerei (Klee + Fischl) |
| Sumeru — Jadeplume | *no shield* — overload Fury | **Pyro** ⚠️ | Quicken / Aggravate / Spread |
| Inazuma — Bathysmal Vishap | **Dendro** best (16 GU Hydro) | — | Crystallize (Geo) |
| Natlan — Goldflame Tyrant | **Hydro** (24 GU Pyro) | — | Nightsoul consumption |

**Pyro breaks Mondstadt and ruins Sumeru.** That is the one thing not to get backwards.

---

## Prerequisites and recruitment

Each stage has a prerequisite World Quest, all unlocked by step 1 of *Trial of the Usurper*:

| Stage | Prerequisite quest | Starts at |
|---|---|---|
| Traversing Forest and Sand | *From Trees to a Forest* | Sumeru City, Sumeru |
| Plains of Blazing Fire | *Embers Never Fade* | Tezcatepetonco Range, Natlan |
| Foothills of Wind and Snow | *Banners of the Northwind* | Starfell Valley, Mondstadt |
| Isles of Lingering Thunder | *Thunder Purges All Spite* | Inazuma City, Inazuma |

**Main Force** squads are recruited through *Allies in Action* events, and a bigger roster
is what lets you satisfy a round's trait and weapon objectives without over-deploying.

| Stage | Main Force squads |
|---|---|
| Sumeru | Tighnari's Squad (Tighnari, Cyno) · Dehya's Squad (Candace, Dehya) · Nilou's Squad (Nilou, **Layla**) |
| Natlan | Ororon · Chasca's Squad (Chasca, Ifa) · Mualani's Squad (Kachina, Mualani) |
| Mondstadt | Klee's Squad (Klee, Prune, Rosaria) · Bennett's Squad (Bennett, Fischl, **Mona**) |
| Inazuma | Thoma's Squad (Thoma, Heizou, **Itto, Gorou**) · Kaedehara Kazuha |

Bold names are the ones a Round 3 demands. **Inazuma is already 2/2 recruited** (10 Nov),
so recruitment is not its bottleneck — deployment order and team composition are.

---

## Event completion

Dropping the overall "Holy Soil phenomenon" threat to **30%** lets you invite one 4-star:
Amber, Xiangling, Thoma, Collei, Lynette, Kachina, Aino or Alyosha.

> **Take Xiangling if she is still the gap.** [`03-character-materials.md`](03-character-materials.md)
> has had her flagged as the account's biggest untapped asset since 23 Oct — but that read
> listed her at **Lv 1**, and the roster has moved a long way since. **Check before
> choosing.**

After the event ends, "Trial of Usurpation" remains playable through Archon Quest
Chapter VII Act VI *A Yesterday Sent From Beyond*, and progress is retained.

---

## Open questions

- **Crippling Blow's enemy level** is blank on the wiki, and the exact scoring formula is
  undocumented. "Roughly 2×" is arithmetic from this account's own scores, not a published
  number.
- **Do trial characters satisfy Witch's Homework?** See the warning above.
- **Is there a cap on how many trial characters a party may field?** Five are offered for
  four slots, which implies none, but the wiki does not say.
- **How much Morale does each deployment objective pay, and what is the maximum?** No
  source found gives numbers — not the wiki, not Game8, not the Russian guide. Only the
  relative rule, that harder operations pay more. **The in-game operation screen is the
  only authority here.**
- **How many operation rounds does each stage have?** Guides show three for Inazuma and
  four for the others; nobody states a general rule.
- **Which Mora figure is right at the 36,000 tier**, 30,000 or 60,000? See the conflict
  above.
- **Which statline does the event's Bathysmal Vishap use?** The shield and 90% global RES
  come from the wiki's **Local Legend / Battle-Hardened** variants. The plain Normal variant
  has no shield listed. The event calls it "Defiled" and "exceedingly difficult to take
  down," which fits the elite statline, but that is an inference.
- **Does a Geo Construct from a low-level Traveler trigger the Inazuma resonance?** The
  buff text says the shockwave resonates off Geo Constructs for up to 2 extra shockwaves,
  and True DMG should not care about the construct's owner — untested.
- **The roster is more levelled than [`03-character-materials.md`](03-character-materials.md)
  records.** The 23 Oct read lists Skirk at Lv 57 as the highest; the 10 Nov character
  grid shows multiple Lv 80 and Lv 70 characters. That doc needs a refresh.
