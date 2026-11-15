# Mizuki team — checking the Google AI advice (15 Nov 2026)

The user pasted build advice for the Mizuki team that came from Google's AI search;
the CMS local thread relayed the same text. It is checked here against:

- the account, from the HoYoLAB roster read on 14 Nov
  (`reference/data/hoyolab-roster-2026-11-14.json`);
- `reference/weapons-owned.md`;
- the wiki's talent text, fetched 15 Nov;
- `reference/corrections.md`, the entry dated 12 Nov.

The team is priority 2, after Varesa and Skirk. **Nothing here is meant to be
farmed yet.**

## The advice assumes characters the account doesn't have yet

| | AI assumes | Account (14 Nov) |
|---|---|---|
| Mizuki | 80, about to go to 90 | **Lv 60**, C0; Sacrificial Fragments Lv 70 R2; 4pc VV +12 (EM/EM/EM, 4★ sands) |
| Cryo Traveler | 80/90 | **Lv 40**, C6; Exaiphanes Blade Lv 90; mixed set |
| Fischl | 80/90 | **Lv 60**, C1; Rust Lv 63 |
| Rosaria | "leave at 60/70" | **Lv 20**, C3; **Beginner's Protector (1★) Lv 1** |

"Leave Rosaria at 60/70" is not a saving. She is at 20, so it means four
ascensions of work.

## Claim by claim

| Claim | Verdict | Why |
|---|---|---|
| Level Mizuki to 90 first, because Swirl scales with level | **Wrong reason** | Plain Swirl does scale with level. But her payload is *Vast Be the Dream*: +1,000% of EM added to her next periodic AoE Anemo hit, plus a second 1,000%-EM instance under Stellar Swirl. That scales with **EM**, not with the level multiplier (corrections.md, 12 Nov). Levelling her still helps (base stats, ascension EM), but she is at 60, so 60 → 80 comes first. |
| Mizuki talents: E 8–9, Q 6–8, NA 1 | **OK** | The payload comes from E (Dreamdrifter). |
| VV EM/EM/EM + Sacrificial Fragments "already exactly right"; artifacts to +20, weapon to 90 | **Mostly OK** | The pieces are already on her at +12 with a 4★ sands. Levelling them is the cheapest gain. Her payload hit can crit, so an EM/EM/**CRIT** circlet is worth considering once CRIT substats exist. |
| Rosaria's A4 "shares up to 15% CRIT Rate" | **Misleading** | Wiki text: after her Burst, other party members gain **15% of Rosaria's CRIT Rate**, capped at 15%. Reaching the cap needs 100% CRIT Rate on her. At a realistic 50–60% it gives +7.5–9%. It does help Mizuki, because her payload crits. |
| Give Rosaria Favonius Lance or "any CRIT Rate polearm" | **Not owned** | Owned polearms: Beginner's Protector (1★), Halberd (3★), Black Tassel (3★). None has CRIT Rate. |
| Fischl: swap Rust for The Stringless | **Not owned** | Owned bows: Slingshot, Favonius Warbow, Rust. Rust's +NA DMG is wasted on Oz, but its **ATK% substat** makes it the best stat stick available. Keep Rust, or use Favonius Warbow if energy is short. |
| Fischl's A4 for off-field Oz | **OK** | Oz strikes when the active character triggers an Electro-related reaction. Mizuki swirling Electro qualifies. |
| Cryo Traveler: drop the unlevelled Gladiator for Emblem, or 2pc Blizzard + 2pc | **Plausible, unchecked** | The Emblem/Blizzard inventory hasn't been checked. |
| 45–55k single-target DPS, 60k+ AoE; clears Abyss 11 | **Unusable** | No rotation, enemy or RES is stated. Not comparable to the Varesa figures, which are measured per hit, not DPS. |

## Team composition differs

`src/data/teams.ts` has **Mizuki · Traveler · Rosaria · Barbara**. The AI's team
swaps **Barbara for Fischl**. That gives a second Swirl element (Electro beside
Cryo) and drops the dedicated healer; Mizuki's Burst heals through snacks.
**The user's call; not changed.**

## What survives, in resin order (when the team's turn comes)

1. Mizuki to 80: her ascension EM, at the cost of little Hero's Wit.
2. Her VV pieces from +12 to +20.
3. Mizuki's E talent.
4. Rosaria past A4, only if she stays in the team, and with a 3★ placeholder
   polearm for now.
5. Traveler to 70+.

## Barbara or Fischl? (user: swap only if it adds damage; this is the ranged team)

Both are ranged, so range doesn't decide it. On-field it's Mizuki either way.

**Rules that decide it** (wiki, fetched 15 Nov):
- **Stellar Swirl is Anemo + Cryo only.** Mizuki's second 1,000%-EM instance
  needs her Radiance state, which a Stellar Swirl starts and which lasts 8s.
- Her first 1,000%-EM bonus fires on *any* Swirl, once every 2.5s.
- Fischl is Hexerei, but Secret Rite needs two Hexerei characters and Fischl at
  Lv 70+. Nobody else in this team is Hexerei, so **no Secret Rite here**.

**What each brings, at current stats** (roster 14 Nov; rough, before enemy DEF/RES):

| | Damage | Cost |
|---|---|---|
| Barbara | ~0 | — her Hydro on Cryo makes Frozen. That is crowd control, and a Cryo aura Mizuki can still Stellar Swirl. |
| Fischl (Lv 60, 875 ATK, 43.7/65.5, E lv 4) | Oz ≈ 1.1–1.3k per hit, about 1 hit/s at ~80% uptime, plus A4 strikes at 80% ATK → **roughly +1–1.5k DPS** | Electro + Cryo = Superconduct, which **eats the Cryo aura** Mizuki needs for Stellar Swirl. No healer. |

For scale: Mizuki has 615 EM, so each 1,000%-EM instance has a base of ~6,150,
and the Stellar one comes at most every 2.5s. That is ~2.5k DPS. Losing Radiance
even a third of the time cancels most of what Oz adds.

**Verdict:** Fischl *probably* adds a little. Whether he does depends on how often
Superconduct starves the Cryo, and that can't be computed from here. **Don't
change the team on paper; test it:**
1. Same Domain or Abyss chamber, same rotation, three runs each line-up.
2. Compare clear times.
3. Fischl stays only if his times are faster.

Until then the team stays Mizuki · Traveler · Rosaria · Barbara.

## "That's low next to Varesa and Skirk — what gets it above 100k?" (15 Nov)

**These are two different numbers.**
- The AI's 45–55k is **team DPS**: all four characters' damage per second over a
  rotation.
- Varesa's ~50k (and the ~150k in showcase clips) is **one hit**
  (research/13).
- Varesa's team DPS is in the same tens-of-thousands range. A 45–55k team is not
  a weak team.

**Per hit, Mizuki never gets near 100k.** Her damage is many mid-size AoE hits,
not one nuke. Rough model: crit hit = (0.5×ATK + 10×EM) × DMG × DEF × RES ×
(1+CRIT DMG), against a Lv 100 enemy.
- **Now** (Lv 60, 615 EM, 63% CRIT DMG): about **4.9k**.
- **Built** (Lv 90, ~1,050 EM, 100% CRIT DMG, VV shred): about **14k**, plus a
  Stellar instance of roughly the same size.

The talent part of the formula is approximated. The EM term dominates, so the
error is small.

**100k team DPS** is beyond this account's 4★ weapons for any team.

### What raises her damage, biggest first
1. **Level 60 → 90, EM pieces to +20, Sacrificial Fragments to 90.** Takes EM
   from 615 to ~1,000: **≈ ×1.6** on the payload, which is 10× EM.
2. **CRIT Rate.** At 15% her average multiplier is ×1.09; 50/100 gives ×1.5.
   **≈ ×1.35** on average.
3. **A DMG buffer.** Furina (fanfare, up to +75% DMG) or Mona (Omen, +DMG taken)
   multiply everything. Both are owned but sit in the Varesa and Skirk teams.
   Abyss needs 8 different characters, so Mizuki can borrow only from the team
   that isn't on the other half.
4. **Constant Cryo** keeps Radiance (the ×2) up.
   - Escoffier, Charlotte and Mika are Cryo too, but are already in teams.
   - Free Cryo characters: Chongyun Lv 40, Kaeya Lv 32 (both melee, both
     unbuilt), and Rosaria.
   - Escoffier's RES shred is Hydro/Cryo only, so it does nothing for Anemo.

### Roster check (14 Nov): who's free for this team
- **Not in the Varesa or Skirk teams:** Traveler, Rosaria, Barbara, Fischl,
  Chongyun, Kaeya, Lisa, Dahlia, Tighnari, Lynette, Sayu, plus unbuilt
  4★s/5★s.
- **None of them is a damage multiplier on Furina/Mona's level.** The current
  four, Mizuki · Traveler · Rosaria · Barbara, is already the best free line-up.
  The gains are in levelling it, not in swapping.

## Valeriy (C6) instead of Fischl? (15 Nov)

Kit from the wiki, fetched 15 Nov. His talent pages: Active Defense: Bastion
Charge, Into the Breach, Ranks That Charge as One, and the rest.

| | For Mizuki | Note |
|---|---|---|
| **C2** — all party members **+100 EM for 18s** after his E; **E cooldown 10s** | **Permanent +100 EM.** Her payload is 10× EM, so +1,000 base on each instance: **≈ +16% now, ≈ +10% built**, on both the Swirl and the Stellar hit | The deciding line |
| Supercharged Shield (ATK-scaled; 250% vs Electro) | Covers the interruption Barbara's healing covered | Mizuki's own burst heals too |
| Offensive Directive (A1) | **Nothing.** It buffs Electro DMG only | — |
| C6 — his charged attack and burst shells +100% DMG | His own damage only | Off-field burst damage is a bonus |
| Electro application | Superconduct eats Cryo, as with Fischl | Only on his E/Q casts, so **less often than Oz** |

**Verdict: Valeriy beats Fischl here.**
- He gives a flat, always-on buff to Mizuki's main stat.
- He uses up less Cryo.
- He's melee, but he only swaps in to cast E every 10s. Mizuki stays the one on
  the field, so the team still fights at range.

Against Barbara he trades healing and Freeze for +100 EM and a shield. That is
likely a damage gain, but **confirm it with the same clear-time test**: three
runs each, same chamber, same rotation.
