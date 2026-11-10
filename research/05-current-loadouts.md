# Current Loadouts — Audit

**Gear data pulled:** 2026-10-27 from the HoYoLAB Battle Chronicle (per-slot artifacts)
**Account header corrected:** 2026-11-10 — **AR 51 · World Level 7 · 371 achievements ·
Spiral Abyss 11-3, 24 stars** *(Enka, verified)*. It previously read *"AR 40 · World
Level 5 · Spiral Abyss 10-3 · 192 achievements."*

> 🔴 **Every stat in this file is from 28 Oct and is two weeks and eleven Adventure Ranks
> old. Re-read before acting on any single number.**
>
> The account has since passed **AR 50**, which raises the character cap from Lv 80 to
> **Lv 90** — so any level below is a floor, not a reading. A 9 Nov screenshot showed the
> **Traveler at Lv 90**; the table below says Lv 40.
>
> **This file cannot be refreshed automatically today, and that is fixable.** Enka serves
> full per-slot build data for any character placed in the in-game **showcase** with
> *Show Character Details* enabled. The showcase is currently **empty**, so
> `curl -s "https://enka.network/api/uid/790160140/"` returns profile stats and nothing
> else. Add your top five to the showcase once and this audit becomes a one-command
> refresh instead of a manual HoYoLAB walk.
>
> What is still **structurally** reliable here: which sets are equipped, which weapons are
> on which character, constellation counts, and the reasoning about what each character
> wants. Those change slowly. The numbers do not.

---

## The headline: you are three slots away from a real Skirk

Skirk is already wearing **4-piece Finale of the Deep Galleries**, which is her
best-in-slot set. It is working. What's holding her back is three specific slots:

| Slot | Now | Should be |
|---|---|---|
| **Weapon** | Prototype Rancour — Physical DMG 28.4% | **Exaiphanes Blade** (see below) |
| **Sands** | Finale — HP% 17.0% | **ATK%** |
| **Goblet** | Gladiator's Finale 5★ — ATK% 30.8% | *keep it* — see correction below |

> **Corrected 2026-10-27, after reading the KeqingMains guide:** I first listed a
> **Cryo DMG goblet** as urgent and an **ER sands** as acceptable. Both are wrong.
> KQM lists her goblet as **"Cryo DMG Bonus *or* ATK%"**, so her 5★ ATK% goblet is a
> legitimate build — a Cryo goblet is a modest upgrade, not a transformation. And
> **Energy Recharge is a dead stat on her**: her Burst is paid for in Serpent's Subtlety,
> not Elemental Energy, so her 114% ER is doing nothing. Full detail:
> [`skirk-build.html`](../skirk-build.html).

Nothing else on the account is worth this much.

---

## ⭐ The single biggest free upgrade: Exaiphanes Blade

Your **Traveler** is holding a **5-star sword at Lv 20** — the Exaiphanes Blade, the free
sword from *Everwinter Without Mercy*.

| | |
|---|---|
| Base ATK (Lv 90) | **608** |
| Substat | **CRIT Rate 33.1%** (12.7% at your Lv 20) |
| Passive | Traveler-only — but **base ATK and CRIT Rate apply to anyone** |
| Levelling cost | **None.** No Mora, no enhancement ore |

> **Do not "fix" the rarity above.** `reference/data/weapon_390003.json` reports
> `rank: 4` and carries **zero ascension phases**. The rank is wrong — it is a 5-star —
> and the missing ascension data is correct, because this weapon has no normal ascension
> path at all. *(Checked 1 Nov 2026.)*

**How it levels — the exact steps:**

1. Be past **step 23 of *Great Deeds on the Tundra*** (Archon Quest Ch. VII Act I). The
   enhance option does not appear before that.
2. Put the Traveler in **Cryo** form — done by resonating at a Snezhnaya Statue of the Seven.
3. Holding the blade, hit that Statue with a **Cryo Elemental Skill or Burst**.
4. Interact with the Statue and choose **"Enhance Exaiphanes Blade."**

Each Statue blesses the blade **once only**, and each blessing raises **level *and*
Refinement together**. **Five Statues exist in Snezhnaya**, which is enough to reach
**Lv. 90** — but full refinement reportedly wants seven, so R5 is not attainable yet.

No Mora, no Enhancement Ore, no weapon ascension materials at any point.

**Why this matters more than anything else:** Skirk is a sword user sitting at **20.5%
CRIT Rate** with a weapon whose entire substat (Physical DMG 28.4%) applies to **none** of
her damage, because Seven-Phase Flash converts her attacks to Cryo. Moving her onto the
Exaiphanes Blade fixes the dead substat and the crit problem in one swap.

**Order of operations:** level the blade on the Traveler first (Cryo form, Snezhnaya
statues), *then* hand it to Skirk. You have **19 Cryoculi** already, so you are in
Snezhnaya and the statues are reachable.

> ⚠️ **Verify in game before committing.** The levelling mechanic and the five-statue
> cap come from community sources, not from anything I could read on your account. Check
> the weapon's in-game description first. If the cap turns out lower than Lv 90, the swap
> is still correct — a Lv 70 5-star with 27% CRIT Rate beats Prototype Rancour.

**Then:** Prototype Rancour's Physical DMG 28.4% goes to **Razor** or **Noelle**, where
physical damage is the whole point.

---

## Per character — what's actually equipped

Only the twelve characters above Lv 28 are listed; the rest are at Lv 20 or below with
starter gear and aren't worth auditing yet.

### Varesa — Lv 70, Electro, C0, catalyst ✅ *highest level on the account*
| | |
|---|---|
| Weapon | **The Widsith** 4★ Lv 70 R1 — CRIT DMG 45.4% ✅ |
| Flower | Long Night's Oath 4★ **+0** |
| Plume | Blizzard Strayer 4★ +8 |
| Sands | Long Night's Oath 4★ **+0** — HP% 6.3% 🔴 |
| Goblet | Long Night's Oath 4★ **+0** — **DEF% 7.9%** 🔴 |
| Circlet | Long Night's Oath 4★ +14 — ATK% 31.3% |
| Stats | ATK 1091 · CRIT **24.3% / 99.8%** · Electro DMG **0.0%** 🔴 · ER 103.6% |

**4-piece Long Night's Oath is active** — and it's the correct set. Varesa is a plunge
DPS; that set gives up to **+100% Plunging Attack DMG** (25% from 2pc, 75% from five
stacks of 4pc). The pieces are right; three of them are **unlevelled**.

🔴 **A DEF% goblet on a DPS is the worst slot on the account.** It contributes nothing.
Replace with **Electro DMG%** and her damage jumps immediately.

🔴 **Sands at HP% +0** — should be ATK%.

**Fix:** keep the set, replace goblet and sands, level everything to +12. No new farming
required beyond the goblet.

---

### Skirk — Lv 60, Cryo, C0, sword
| | |
|---|---|
| Weapon | **Prototype Rancour** 4★ Lv 70 R1 — **Physical DMG 28.4%** 🔴 *dead stat* |
| Flower | Finale of the Deep Galleries 4★ +8 |
| Plume | Finale 4★ **+16** ✅ |
| Sands | Finale 4★ +6 — **HP% 17.0%** 🔴 |
| Goblet | Gladiator's Finale 5★ +12 — ATK% 30.8% |
| Circlet | Finale 4★ +12 — CRIT DMG 36.9% ✅ |
| Stats | ATK 1206 · CRIT **20.5% / 106.1%** · Cryo DMG 15.0% · EM 56 · ER 114.0% |

**4-piece Finale of the Deep Galleries is active and is her best-in-slot.**
- 2pc: Cryo DMG +15%
- 4pc: at **0 Elemental Energy**, Normal Attack DMG **+60%** and Burst DMG **+60%**
  (they alternate, 6s lockout after each)

Skirk spends **Serpent's Subtlety**, not Elemental Energy — her energy is permanently 0,
so the 4pc condition is **always satisfied**. This is why the set is made for her.

🔴 **Crit ratio is 20.5 / 106.1.** The rule of thumb is roughly 1:2. She has the damage
half and not the rate half, so her 106% CRIT DMG fires about one hit in five. Everything
that adds **CRIT Rate** is worth more to her than anything else right now — hence the
Exaiphanes Blade.

**Fix list:** Exaiphanes Blade → **Cryo DMG goblet** (same domain as her set) → ATK% sands.

---

### Barbara — Lv 66, Hydro, C0, catalyst
| | |
|---|---|
| Weapon | Magic Guide 3★ Lv 50 R5 — EM 122 |
| Artifacts | **4-piece Maiden Beloved** + Instructor circlet (**Healing 26.8%**) |
| Levelling | Flower +0, Plume +0, Sands +12, Goblet +0, Circlet +16 |
| Stats | HP 10,402 · Healing Bonus **41.8%** ✅ · EM 232 · ER 104.1% |

A coherent healer. 4pc Maiden Beloved is active (+20% healing received by the party).

**Her real job in a Skirk team is freezing targets**, not healing throughput — Hydro
application plus Skirk's Cryo means enemies stay Frozen. Magic Guide's EM substat suits
that fine.

**Consider:** *Thrilling Tales of Dragon Slayers* if you ever want to trade healing for
**up to +48% ATK handed to Skirk** on swap. Not urgent — she's doing a job.

---

### Tighnari — Lv 44, Dendro, C1, bow ⚠️ *a 5-star you are not using*
| | |
|---|---|
| Weapon | Favonius Warbow 4★ Lv 50 R1 — ER 39.7% |
| Flower | **Wanderer's Troupe 5★ +8** |
| Plume | Wanderer's Troupe 4★ +12 |
| Sands | Gambler 3★ **+0** |
| Goblet | Gambler 3★ **+0** — **Dendro DMG 5.2%** |
| Circlet | Prayers for Destiny 4★ **+0** — CRIT DMG 8.4% |
| Stats | ATK 639 · CRIT 16.2% / 71.6% · Dendro 12.4% · EM 99 · ER 147.6% |

A **C1 5-star** stuck at Lv 44 in 3-star artifacts. He has the only real elemental goblet
on the account and it's a 3-star at +0.

At **AR 51** you can take him to **Lv 90** — the old text said Lv 80, which was the AR 40
cap. If you want a second DPS that isn't Electro, he's the one you already own.

---

### Fischl — Lv 50, Electro, C0, bow
| | |
|---|---|
| Weapon | **Rust** 4★ Lv 50 R1 — ATK% 26.8% ✅ |
| Artifacts | All **3-star**: Resolution of Sojourner ×3, Martial Artist ×2 |
| Stats | ATK 852 · CRIT **7.1% / 54.2%** 🔴 · Electro DMG **0.0%** · ER 103.5% |

Rust is a genuinely good Fischl weapon (+40% Normal Attack DMG at R1) and the ATK% substat
is right. **Her artifacts are the problem** — five 3-star pieces, four of which roll the
same ATK% 5.2%.

🔴 **7.1% CRIT Rate** is the worst on the account. She crits one hit in fourteen.

At **AR 51** every 3-star piece she's wearing is replaceable from a single domain run —
and at Lv 90 domains that run **guarantees at least one 5-star**.

---

### Lisa — Lv 50, Electro, C0, catalyst
| | |
|---|---|
| Weapon | Emerald Orb 3★ Lv 40 R5 — EM 53 |
| Artifacts | The Exile ×4 (sands/goblet/circlet/plume) + Instructor flower, all **3-star** |
| Stats | ATK 509 · CRIT 8.3% / 53.3% · EM 143 · ER 120.0% |

4pc The Exile is active — **+20% Energy Recharge and 6 energy to the party** on burst. As a
battery that's not useless, but she's wearing 3-star pieces and a Lv 40 weapon.

Lisa competes with Varesa and Fischl for the Electro slot and loses to both. **Low
priority.**

---

### Traveler (Geo) — Lv 40, C2, sword
| | |
|---|---|
| Weapon | **Exaiphanes Blade 5★ Lv 20 R1 — CRIT Rate 12.7%** ⭐ |
| Artifacts | Instructor flower 3★ + **Traveling Doctor ×3 (1-star)** + 2-star circlet |
| Stats | ATK 226 · CRIT 17.7% / 50.0% |

The artifacts are placeholder junk, which is fine — **the sword is the point.** See the
Exaiphanes Blade section above.

---

### Mika — Lv 40, **C6**, Cryo, polearm
| | |
|---|---|
| Weapon | Black Tassel 3★ Lv 50 R5 — HP% 30.4% |
| Artifacts | Wanderer's Troupe flower, The Exile plume + sands (ER 25.6%), Scholar goblet (**Cryo DMG 6.3%**), Scholar circlet (DEF% 7.9%) |
| Stats | HP 8,304 · ATK 343 · CRIT **5.0% / 50.0%** · ER **175.4%** |

**C6 is a big deal — but not for Skirk.** Mika C6 grants **+60% Physical CRIT DMG** to
characters under Soulwind. Skirk's attacks convert to Cryo, so she gets **none** of it.

Who does benefit: **Razor, Noelle, Kaeya** — physical attackers. That is also where
**Prototype Rancour** should end up. A C6-Mika physical team is a real option you own
outright; it's just not the Skirk team.

What Skirk *does* get from Mika: healing and party **ATK SPD**. Both useful.

🔴 ER 175% on a healer with nothing to spend it on is over-invested. CRIT 5.0% is base —
he has literally no crit at all.

---

### Xiangling — Lv 40, Pyro, C0, polearm
| | |
|---|---|
| Weapon | Black Tassel 3★ **Lv 20** R5 — HP% 18.0% 🔴 *wrong weapon class fit* |
| Artifacts | Blizzard Strayer flower +6, Tiny Miracle plume, Berserker sands (ER 32.8%), Finale goblet (HP% 6.3%), Berserker circlet (EM 92) |
| Stats | ATK 265 · CRIT 22.3% / 54.2% · ER 139.7% · Pyro DMG **0.0%** |

Xiangling is one of the strongest 4-stars in the game and yours has **265 ATK** and a
Lv 20 weapon with an HP% substat. Black Tassel is a shield/HP polearm — wrong for her.

If you want a Pyro off-field DPS, she's the pick, and she needs ER ~200% plus a Pyro
goblet. Currently she has neither the weapon nor the goblet.

---

### Amber — Lv 40, Pyro, C1, bow
Slingshot 3★ Lv 40 R5 (CRIT Rate 17.5% ✅ — her best stat source). Artifacts are a 1-star
Traveling Doctor goblet with **Cryo DMG 3.1%** on a Pyro character, a 2-star Scholar sands,
and mismatched 4-stars. Exploration utility only.

### Noelle — Lv 32, Geo, C0, claymore
Debate Club 3★ Lv 20 R4. Artifacts: Instructor flower, Resolution of Sojourner plume,
1-star Traveling Doctor sands, **Electro DMG 5.2% goblet on a Geo character**, Healing%
circlet. Entirely mismatched.

**Keep her in the exploration party anyway** — she's your only usable claymore for ore
nodes, Ancient Rime and stone-encased chests. Give her **Prototype Rancour** when Skirk
drops it; physical damage is exactly her thing, and Mika C6 amplifies it.

### Sucrose — Lv 40, Anemo, C0, catalyst
🔴 **Apprentice's Notes, 1-star, Lv 1.** She is effectively unarmed — 166 ATK. Artifacts
are an EM pile (254 EM) across four different sets, which is directionally right for a
swirl enabler but built from nothing. A single Viridescent Venerer flower is present; the
other three VV pieces are not.

---

## Fix list, in order of payoff

1. **Level the Exaiphanes Blade on the Traveler** (Cryo form, Snezhnaya statues — free),
   then put it on **Skirk**. Biggest single gain on the account, costs no resin.
2. **Cryo DMG goblet for Skirk**, **Electro DMG goblet for Varesa.** Both drop from the
   same domain as their sets — see `06-artifact-plan.md`.
3. **Replace Varesa's DEF% goblet and HP% sands**, and level her +0 pieces. Her set is
   already correct; the slots are not.
4. **Prototype Rancour → Noelle or Razor.** It is doing nothing on Skirk.
5. **Ascend your top five to Lv 90** — **AR 50 lifted the cap again**; this step used to
   say Lv 80. Varesa, Skirk, Barbara, Fischl, Tighnari.
6. **Fischl's artifacts.** Five 3-star pieces is the cheapest large fix left, and at
   Lv 90 domains a single run is guaranteed to produce a 5-star replacement.
7. **Arm Sucrose and Xiangling.** A Lv 1 and a Lv 20 weapon are wasted slots.
8. **CRIT Rate everywhere.** Only Varesa (24.3%) is anywhere near functional.

---

## What changed since AR 33

| Then (23 Oct, AR 33) | Now (27 Oct, AR 40) |
|---|---|
| "Nobody has an elemental goblet" | Still nearly true — Tighnari 3★ Dendro 5.2%, Mika 4★ Cryo 6.3%. Neither DPS has one. |
| "Skirk Lv 57, 9% CRIT Rate" | Lv 60, **20.5%** — improved, still low |
| "Skirk has no set bonus" | **4pc Finale of the Deep Galleries active** — correct set, already done |
| "Varesa Lv 50, Emerald Orb" | **Lv 70, The Widsith, 4pc Long Night's Oath** — correct set |
| "Mika C2, Halberd Lv 1" | **C6**, Black Tassel Lv 50 |
| "Don't farm artifacts until AR 45" | **Obsolete.** 5-star pieces drop from AR 40. Farm now. |
| "Blizzard Strayer is the answer for Skirk" | **Superseded.** Finale of the Deep Galleries beats it and she already has it. |

Also new since then: **Tighnari** (5★ C1) and **Alyosha** joined the roster, and Spiral
Abyss progress went from 4-3 to **10-3**.

## What changed since AR 40 — *added 2026-11-10*

Profile-level only. **No per-character data has been re-read**, so this section makes no
claims about gear.

| 27 Oct, AR 40 | 10 Nov, AR 51 |
|---|---|
| World Level 5 | **World Level 7** — enemies Lv 72–92, Normal Bosses **91** |
| Character cap **Lv 80** | **Lv 90** (Ascension Phase 6, AR 50) |
| Spiral Abyss 10-3 | **11-3, 24 stars** |
| 192 achievements | **371** |
| Artifact Strongbox locked until AR 45 | **Open** — three 5-stars become one of a chosen set |
| 5-star artifacts drop, not guaranteed | **Lv 90 domains guarantee at least one per run** |
| Imaginarium Theater untouched | **Act 3, 3 stars** |
| Stygian Onslaught untouched | **Index 3**, best time 774s — and its **Dust of Enlightenment** is what powers artifact Reshaping |

The practical consequence for this audit: **the three-slot Skirk plan at the top was
written when a correct 5-star piece was a lucky drop. It is now a guaranteed one per run,
and `06-artifact-plan.md` explains how to simply *define* the goblet outright.**
