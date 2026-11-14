# Varesa — Electro RES shred and the team around her

**Researched:** 2026-11-12 · **Roster read:** HoYoLAB Battle Chronicle, same day
**Sources:** Fandom `api.php` (talent text parsed per character), the repo's own
`reference/artifact-sets.md`, HoYoLAB for live gear.

The starting question was narrow — *does anything I own strip Electro RES?* — and the
answer turned out to be one line. The useful finding is underneath it: **Varesa's gear,
not her teammates, is what is holding her back.**

---

## Varesa as she is equipped today

Read off HoYoLAB, 12 Nov 2026.

| | |
|---|---|
| Level | **90** |
| Weapon | **The Widsith** Lv 90 — 4★, base ATK 510, CRIT DMG 55.1% |
| ATK | 2,304 |
| CRIT | **44.9% / 123.0%** |
| **Electro DMG Bonus** | **0.0%** |
| Energy Recharge | 116.3% |
| Elemental Mastery | 63 |
| Artifacts | **5-piece Long Night's Oath**, Lv 16–20 — 4pc active. *(Corrected 14 Nov: this row once read the five piece names as five sets.)* |

Her five pieces are Lightkeeper's…, Nightingale's Tail…, Undying One's…, A Horn
Unwinded and Dyed Tassel. Three of them roll ATK% mains (46.6 / 34.8 / 34.8), which
means **the goblet is an ATK% goblet** — hence 0.0% Electro DMG Bonus.

> This is the same systemic gap README names as headline finding #1, still unfixed on
> the account's best character.

---

## 1. Electro RES shred

### No character you own does it

Talent text pulled and searched for RES reduction on every plausible candidate:
Alyosha, Valeriy, Yumemizuki Mizuki, Prune, Kachina, Lisa, Fischl, Beidou, Keqing,
Razor, Sucrose, Lynette, Sayu, Candace. **Zero hits.** Not one of them touches
elemental RES.

Worth stating plainly because it is the usual wrong guess: **Superconduct shreds
*Physical* RES only.** Pairing Varesa with Skirk or Escoffier does nothing for her
Electro damage and eats the aura doing it.

### Only two artifact sets in the game shred elemental RES

Checked against every artifact set in the game — the 63 in
[`reference/artifact-sets.md`](../reference/artifact-sets.md) plus a live wiki sweep of
the category, which added only **Initiate**, a 2★ set with no set bonus:

| Set | Shred |
|---|---|
| **Deepwood Memories** | Dendro RES −30%, 8s — *Dendro only, irrelevant here* |
| **Viridescent Venerer** | **Swirled element's RES −40%, 10s** |

That is the complete list. For Electro there is exactly one option, and it is an
artifact set, not a character.

### And it is already on the account

**Yumemizuki Mizuki is wearing four Viridescent pieces** — In Remembrance of Viridescent
Fields (flower), Viridescent Arrow Feather (plume), and two more Viridescent pieces in
sands and circlet — with a **Royal Silver Urn** in the goblet slot, which is Noblesse
Oblige's goblet and therefore off-set and contributing nothing. Four VV pieces is the
4-piece bonus. Her sheet confirms the 2-piece half: **Anemo DMG Bonus 15.0%**.

The pieces are Lv 0–8. **Set bonuses ignore artifact level**, so the −40% is live today
with no farming at all.

| | Electro RES | Multiplier |
|---|---|---|
| Before | 10% | 0.90 |
| After VV | −30% | 1.15 |

**+28% Electro damage**, for the cost of putting her in the party.

> *Corrected 14 Nov: this said +44%, using a multiplier of 1.30. Below zero RES the
> multiplier is `1 − RES/2`, so −30% gives 1.15, not 1.30 — a +28% gain over 0.90.*

> **The holder must be on-field at the instant the swirl triggers.** The wiki's gameplay
> notes are explicit: *"the RES reduction cannot be applied if the equipping character is
> off-field."* Mizuki casts, swirls, swaps out — the debuff then rides on for its full
> 10s. Her Sacrificial Fragments (Lv 70, EM 182) lets her do it twice.

---

## 2. Nightsoul Burst — the mechanic that caps this account

Varesa's 4th Ascension Passive, *The Hero Twice-Returned!*:

> When a nearby party member triggers a **Nightsoul Burst**, Varesa's ATK increases by
> **35% for 12s. Max 2 stacks.**

Neither Varesa nor Kachina *triggers* a Nightsoul Burst — both only benefit from one.
What actually triggers it, from the wiki's mechanics page:

> Nightsoul Bursts are triggered when dealing Elemental DMG to an opponent **while the
> party contains a Natlanese character**. The interval between each Nightsoul Burst
> depends on the amount of Natlanese characters in the party: **18 seconds for 1
> character, 12 seconds for 2, and 9 seconds for 3 or more.**

Set the 12s buff duration against that interval:

| Natlan characters in party | Burst every | Varesa's A4 |
|---|---|---|
| 1 — Varesa alone | 18s | 1 stack, **lapses 6s in every 18** (~67% uptime) |
| **2 — + Kachina** | **12s** | **1 stack, effectively permanent** |
| 3 or more | 9s | 2 stacks — **+70% ATK** |

**This account owns exactly two Natlan characters: Varesa and Kachina.** Two stacks are
unreachable. That is the structural ceiling, and it explains the measured Tactical Sweep
result in [`11-tactical-sweep.md`](11-tactical-sweep.md): the all-Natlan trial party
(Chasca · Aino · Ifa · Ororon) was sitting at the 9-second interval the account cannot
otherwise reach.

Kachina's job in a Varesa team is **cadence, nothing else**. She needs no investment to
do it — only to be in the party.

---

## 3. The team

### Varesa · Yumemizuki Mizuki · Alyosha · Kachina

| Slot | Why |
|---|---|
| **Varesa** Lv 90 | On-field Electro plunge DPS |
| **Mizuki** Lv 60 | **VV 4pc → −40% Electro RES.** Her A4 also gives *her* +100 EM whenever a teammate lands Electro. Sacrificial Fragments = double swirl |
| **Alyosha** Lv 60 | *Hunter's Precision* — **+11.7% → +22.5% ATK** by talent level, 15s. Tugarin heals 120% of his ATK, so no healer slot needed |
| **Kachina** Lv 50 | Second Natlan body → 18s drops to 12s → Varesa's +35% ATK stays up |

**Alyosha's buff is a flat percentage, so his Lv 60 does not weaken it.** Only his heal
scales off his ATK. That is what makes him the right pick over better-looking options on
an account where no support is built.

Varesa + Alyosha also gives Electro resonance — *High Voltage*, which is particle
generation on reaction, not damage. Useful for her 70-cost burst, not a reason on its own.

### Swap: Valeriy in for Kachina when you are being interrupted

Plunge DPS gets knocked out of the air. Valeriy's Supercharged Shield absorbs at **250%
efficiency against Electro**, his burst feeds on Varesa's own Electro hits, and his A4
*Offensive Directive* adds damage to every instance of Electro she deals.

**Take him for the shield, not the damage** — Offensive Directive scales off *his* ATK,
and he is Lv 60 with uninvested gear. The trade is Varesa's A4 uptime for survivability.

### Do not run

Skirk or Escoffier alongside her. Cryo + Electro = Superconduct, Physical shred only.

---

## 4. Party-wide buff sets, ranked for Varesa

From the 64-set sweep, the ones that matter here:

| Set | Effect | Verdict |
|---|---|---|
| **Celestial Gift** | After the wearer's E: **all nearby party members +20% Elemental DMG Bonus matching the wearer's element**, 20s, fires off-field | **Best in slot for Alyosha or Valeriy** — both Electro, so it reads as party-wide +20% Electro. **Gated behind *Witch's Homework*** |
| **Scroll of the Hero of Cinder City** | Wearer triggers a reaction involving their element → party +12% Elemental DMG Bonus, **+28% more (40% total) if the wearer is in Nightsoul's Blessing**, 20s, off-field | **Kachina.** Crystallize on an Electro-soaked enemy → party +40% Electro DMG Bonus. Only Natlan characters reach the big half |
| **Noblesse Oblige** | +20% ATK, all party, 12s, on burst | Ungated fallback |
| **Tenacity of the Millelith** | +20% ATK, all nearby, off-field, 3s refresh on skill hit | Ungated fallback |

> **Witch's Homework is now worth two things.** [`11-tactical-sweep.md`](11-tactical-sweep.md)
> already flags it as the Lv 70+ Mondstadt lock keeping that stage under 18,000. It is
> also the gate on Celestial Gift — and on *A Day Carved From Rising Winds*. One quest,
> three payoffs.

---

## 5. Varesa's own set: Obsidian Codex

| | |
|---|---|
| **2pc** | +15% DMG while in Nightsoul's Blessing **and on the field** |
| **4pc** | After consuming 1 Nightsoul point while on-field, **CRIT Rate +40% for 6s** (1s ICD) |

Both halves are permanently on for her, and her own talent text is why:

- *"When Varesa is in the Sudden Onrush state or Fiery Passion state, she will always be
  counted as being in the Nightsoul's Blessing state."*
- Her Fiery Passion plunge *"consumes all her Nightsoul points"*.

44.9% → **~85% CRIT Rate** from the 4pc alone, against her existing 123% CRIT DMG.

**Obsidian Codex and Scroll of the Hero of Cinder City drop from the same domain —
Sanctum of Rainbow Spirits.** One domain outfits Varesa and Kachina both.

---

## 6. Ordered by payoff

1. **Electro DMG goblet on Varesa** — +46.6% at Lv 20 5★, the same scaling as the 46.6%
   ATK% sands she is already wearing. She currently has **zero**.
2. **Mizuki in the party** — +28%, available right now, costs nothing.
3. **Obsidian Codex 4pc** — CRIT Rate 45% → 85%.
4. **Kachina in the party** — +35% ATK from ~67% to ~100% uptime, so roughly +12% average.
5. **Alyosha in the party** — +15–20% ATK, plus the heal that frees a slot.
6. *Witch's Homework* → Celestial Gift on an Electro support → party-wide +20% Electro.

Items 2, 4 and 5 are free. Item 1 is one artifact.

---

## What was checked, so it is not re-derived

- Talent text for **Varesa, Alyosha, Valeriy, Dahlia, Yumemizuki Mizuki, Kachina,
  Prune** — read in full from the wiki, 12 Nov.
- Talent text **searched for RES reduction** on those plus Lisa, Fischl, Beidou, Keqing,
  Razor, Sucrose, Lynette, Sayu, Candace. None.
- **Every artifact set in the game** scanned for RES reduction and for party-wide buffs.
- **Nightsoul Burst** trigger condition and interval table.
- Elements and weapons for the Nod-Krai characters: **Alyosha** Electro Polearm,
  **Valeriy** Electro Sword, **Prune** Anemo Catalyst.
- Live gear for **Varesa** and **Mizuki**.

See [`../reference/research-coverage.md`](../reference/research-coverage.md) for the
account-wide ledger of what has and has not been looked at.

---

## Open questions

- **Does Varesa's own damage trigger her A4?** The passive says *"a nearby party member"*,
  while a Nightsoul Burst is a party-wide event fired by anyone dealing Elemental DMG. The
  wiki carries no gameplay note either way. The interval table above holds regardless, so
  this only changes whether she self-sustains one stack solo.
- **Mizuki's goblet.** Royal Silver Urn belongs to Noblesse Oblige, so it contributes no
  set bonus at all. A *Viridescent Venerer's Vessel* from Valley of Remembrance would
  complete the set — but the 4pc is already active off the other four slots, so this is a
  stat upgrade, not an unlock.
- **Does the account hold any Obsidian Codex pieces?** Not visible from HoYoLAB; needs a
  look at the in-game artifact inventory.
- **Alyosha's and Valeriy's talent levels** — unread. Hunter's Precision swings from
  11.66% to 22.47% across them, which is the difference between a filler and a real buff.
