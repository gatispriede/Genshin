# Research coverage ledger

**What has already been looked up, so the next session only researches what is new.**

Last reconciled: **2026-11-12**, against a live HoYoLAB roster read the same day.

Check this page before researching anything. A ✅ row means the answer is already in
this repo at the named file — read it rather than re-fetching the wiki.

---

## Roster — 33 characters

The roster grew from **22 → 33** since the 30 Oct pull. README's account snapshot and
`research/03-character-materials.md` both still say 22 and are stale on this point.

**Levels are from the 12 Nov read and are reliable.**

> **Constellations — told by the user, 12 Nov:** **no 5★ has any constellation** (all C0),
> while **several 4★ are at high constellation**. The HoYoLAB grid shows a badge per card,
> but it could not be read unambiguously from screenshots, so no individual 4★ count in
> this repo is verified. Assume **C0 for every 5★** — Varesa, Skirk, Escoffier, Furina,
> Tighnari, Yumemizuki Mizuki — and look up any 4★ before relying on a constellation.

| Character | Lv | Kit researched | Where |
|---|---|---|---|
| **Furina** | 27 | ✅ | **NEW 12 Nov.** Full kit, Fanfare table, HP and weapon scaling → `furina-build.html` |
| Varesa | 90 | ✅ ✅ | `kits.md` + full wiki read 12 Nov → `research/12-varesa-team.md` |
| Skirk | 80 | ✅ | `kits.md` |
| Escoffier | 70 | 🟡 | raw JSON only — `data/char_10000112.json`, **not written up** |
| Tighnari | 70 | ✅ | `kits.md` |
| Barbara | 70 | ✅ | `kits.md` |
| **Yumemizuki Mizuki** | 60 | ✅ | full wiki read 12 Nov → `research/12-varesa-team.md` + `mizuki-build.html` (swirl team, rotation, gear). **No `kits.md` entry, no raw JSON** |
| Alyosha | 60 | ✅ ✅ | `kits.md` + full wiki read 12 Nov |
| **Valeriy** | 60 | 🟡 | full wiki read 12 Nov → `research/12-varesa-team.md`. **No `kits.md` entry, no raw JSON** |
| Dahlia | 60 | ✅ ✅ | `kits.md` + full wiki read 12 Nov |
| Fischl | 60 | ✅ | `kits.md` |
| Lisa | 60 | ✅ | `kits.md` |
| **Mona** | 57 | ❌ | **never researched** |
| **Kachina** | 50 | 🟡 | full wiki read 12 Nov → `research/12-varesa-team.md`. **No `kits.md` entry, no raw JSON** |
| **Charlotte** | 50 | ❌ | **never researched** |
| Sucrose | 50 | ✅ | `kits.md` |
| Mika | 45 | ✅ | `kits.md` |
| Traveler | 40 | ✅ | `kits.md` |
| Chongyun | 40 | ✅ | `kits.md` |
| Noelle | 40 | ✅ | `kits.md` |
| Xiangling | 40 | ✅ | `kits.md` |
| Amber | 40 | ✅ | `kits.md` |
| Kaeya | 32 | ✅ | `kits.md` |
| Manekina | 20 | ✅ | `kits.md` |
| Manekin | 20 | ✅ | `kits.md` |
| **Keqing** | 20 | ❌ | **never researched** |
| Lynette | 20 | ✅ | `kits.md` |
| Candace | 20 | ✅ | `kits.md` |
| Collei | 20 | ✅ | `kits.md` |
| Beidou | 20 | ✅ | `kits.md` |
| Razor | 20 | ✅ | `kits.md` |
| Prune | 12 | 🟡 | raw JSON + element/weapon confirmed 12 Nov. **No `kits.md` entry** |
| **Sayu** | 1 | ❌ | **never researched** |
| **Rosaria** | 1 | ❌ | **never researched** |

✅ written up · 🟡 partial — data exists but not written up · ❌ nothing

### The to-do list, shortest first

1. **Never researched at all (5):** Mona, Charlotte, Keqing, Sayu, Rosaria.
2. **Read but not written into `kits.md` (4):** Yumemizuki Mizuki, Valeriy, Kachina, Prune.
3. **Raw JSON sitting unused (1):** Escoffier — `data/char_10000112.json` is already on disk.

> `reference/data/` also holds `char_*.json` for **Wanderer**, **Neuvillette** and
> **Citlali**, none of which are on the account. Leftovers from earlier research — ignore
> them, don't mistake them for owned characters.

### Scanned for RES reduction only — *12 Nov, result: none*

Lisa · Fischl · Beidou · Keqing · Razor · Sucrose · Lynette · Sayu · Candace, plus the
seven fully-read characters above. **No character on this account reduces elemental RES.**
A future "who shreds X RES?" question is already answered: nobody — see
`research/12-varesa-team.md`.

---

## Gear

| Source | State |
|---|---|
| `research/05-current-loadouts.md` | **28 Oct, stale.** Covers the 22-character roster |
| Varesa, live | ✅ read 12 Nov → `research/12-varesa-team.md` |
| Yumemizuki Mizuki, live | ✅ read 12 Nov — **4pc Viridescent Venerer confirmed** |
| Everyone else, live | ❌ not re-read since 28 Oct |

Enka returns full build data only for characters in the in-game **showcase**, which is
empty. Until that changes, gear must be read per character from HoYoLAB by hand.

---

## Weapons

> ⚠️ **`weapons-owned.md` is badly stale (30 Oct).** It records **three swords**; the
> in-game inventory on 12 Nov held roughly **twenty**, including two at Lv 90 and a
> Favonius Sword that isn't listed. Treat the whole file as unreliable and regenerate it
> before quoting anything from it.

Known good, read live on 12 Nov: **Favonius Sword** R1 (ER substat, 28.9% at Lv 31 →
61.3% at Lv 90) — equipped on Furina, scaling table in `furina-build.html`.

---

## Artifact sets

**63 of the game's 64 sets are catalogued** in [`artifact-sets.md`](artifact-sets.md),
generated from Project Amber on 30 Oct, with full 2pc and 4pc text. Do not re-fetch set
bonuses.

> Checked against the live wiki category on 12 Nov: the only absentee is **Initiate**, a
> 2★ set that carries **no set bonus at all** — no 2pc, no 4pc. Nothing is missing that
> can affect a build.

Derived conclusions already drawn from that table — don't re-derive:

| Question | Answer | Where |
|---|---|---|
| Which sets reduce elemental RES? | **Only two in the game** — Deepwood Memories (Dendro) and Viridescent Venerer (swirled element) | `research/12-varesa-team.md` |
| Which sets buff the whole party? | 12 of them; the four that matter for an Electro DPS are Celestial Gift, Scroll of the Hero of Cinder City, Noblesse Oblige, Tenacity of the Millelith | `research/12-varesa-team.md` |
| Per-character set recommendations | tier tables by damage / support / utility | `research/09-artifact-sets.md` |

---

## Mechanics nailed down

| Mechanic | Where |
|---|---|
| **Nightsoul Burst** — triggered by dealing Elemental DMG with a Natlan character in the party; interval **18s / 12s / 9s** for 1 / 2 / 3+ Natlan characters | `research/12-varesa-team.md` |
| **Viridescent Venerer** — holder must be **on-field at the moment of the swirl**; debuff then persists 10s | `research/12-varesa-team.md` |
| **Superconduct shreds Physical RES only** — not Cryo, not Electro | `research/12-varesa-team.md` |
| **Electro resonance** (*High Voltage*) — particle generation on reaction, no damage | `research/12-varesa-team.md` |
| **Theater Vigor** — 2 per character, 1 per stage, **cannot be restored** except by a Mystery Cache (which is free). A *failed* act costs no Vigor — retry freely | `research/10-imaginarium-theater.md` · `10a` |
| **Lord of the Hidden Depths (Theater Act 6 / Nod-Krai boss)** — Deepdark Shield, the four Fishers, and the −70% RES paralysis you only get by *failing* the 18s timer | `research/10a-theater-normal-run.md` |
| **Rewind** returns to the last Climactic Showdown and **un-ticks the acts after it** until re-cleared | `research/10a-theater-normal-run.md` |
| **Theater difficulty gates** — Easy 3 acts / 8 chars, Normal 6 / 12, Hard 8 / 16, Visionary 10 / 22, Lunar 12 / 28 | `research/10-imaginarium-theater.md` |
| **Theater event costs** — every Battle, Companion, Blessing and Cache card priced | `research/10-imaginarium-theater.md` |
| **On-field / off-field tags** for the Season 29 cast — only Flins and Varesa are On-Field | `research/10-imaginarium-theater.md` |
| **Swirl damage** — fixed, scales on **character level and EM only**; not ATK, CRIT, Elemental DMG%, generic DMG% or talent level. Hydro Swirl deals no AoE. 2 instances/0.5s per target, **separate limit per swirled element** | `mizuki-build.html` |
| **Enemy wards** — the full Reaction Coefficient table (which element breaks which shield, and how fast), plus per-enemy gauge units. **Anemo and Geo are 0.5 against everything** | `enemy-coverage.html` |
| RES → damage multiplier formula, all three branches | `research/11a-tactical-sweep-bosses.md` |
| Boss shields, paralysis windows, resistance tables | `research/11a-tactical-sweep-bosses.md` |
| Resin costs, Trounce discount | `verified-facts.md` |
| Reputation quest inventory, 172 quests ranked | `reputation-quests.html` |

---

## How to refresh this page

The roster comes from the **HoYoLAB Battle Chronicle** in a logged-in browser:

```
https://act.hoyolab.com/app/community-game-records-sea/index.html?bbs_presentation_style=fullscreen&gid=2#/ys
```

Open **All Characters**, read the grid, then click a character for weapon, stats and the
five artifact slots. No credential is stored in this repository and none should be.

Kit text comes from the Fandom wiki's `api.php` — `action=parse&page=<Name>&prop=text`
with `section=3` for Talents. `prop=revisions` returns only the transclusion stubs, not
the talent text, so `parse` is the one that works.
