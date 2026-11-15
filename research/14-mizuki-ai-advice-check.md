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

For scale: ~~the Stellar instance is ~2.5k DPS~~ — **corrected 15 Nov, see
"Correction: the Stellar instance" below.** It is about 4× that, so losing
Radiance costs far more than Oz adds. That makes the case against Fischl stronger.

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

~~Per hit, Mizuki never gets near 100k.~~ **Wrong — corrected below.** The model
here is right for her *enhanced hit* (ordinary Anemo DMG): crit hit =
(0.5×ATK + 10×EM) × DMG × DEF × RES × (1+CRIT DMG), against a Lv 100 enemy.
- **Now** (Lv 60, 615 EM, 63% CRIT DMG): about **4.9k**.
- **Built** (Lv 90, ~1,050 EM, 100% CRIT DMG, VV shred): about **14k**.

It was wrong to assume her *Stellar instance* is about the same size. It uses a
different formula and is several times larger; see "Correction: the Stellar
instance".

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

## Field note — Furina in for Rosaria (15 Nov, user)

The user played Mizuki · Traveler · **Furina** · Valeriy and **cleared a Lv 90
material domain**. That is a pass/fail result, not a comparison: no clear time,
and no run with Rosaria in the same domain.

**On paper:**
- Furina's fanfare is a party-wide DMG% buff, which Mizuki's enhanced hits take.
  Her Hydro meets the Traveler's Cryo as Freeze, a Cryo aura Mizuki can still
  Stellar Swirl.
- The team loses Rosaria's second Cryo: Cryo resonance (+15% CRIT Rate against
  Cryo/Frozen targets) and the extra Cryo application that keeps Radiance up.

**Constraint:** Furina is also in the Varesa team. In the Abyss, with 8 distinct
characters, she can sit in only one of the two.

**To settle it:** time the same domain with Rosaria and with Furina, three runs
each.

**Observed max hit: ~4k** (user, same run). The model gives her enhanced hit
against Lv 90 enemies, with Valeriy's +100 EM (715 total) and before Furina's
buff:

| | non-crit | crit |
|---|---|---|
| without VV shred | 3.6k | 5.8k |
| with VV shred | 4.6k | 7.5k |

So **~4k is her normal non-crit enhanced hit.** It is not a bug, and it confirms
the model. Crits of 6–7k are rare because her CRIT Rate is 15%. **CRIT Rate is
the gap you can see**; EM from levels is the next one.

**Status:** Furina was a one-off test, because she has been levelled up since the
14 Nov roster (Lv 40 there). She stays in the Varesa team. The Mizuki team
stays Mizuki · Traveler · Rosaria · Valeriy. Re-read HoYoLAB before quoting
Furina's level or stats.

## Correction: the Stellar instance (15 Nov)

Prompted by a showcase thumbnail with ~500k hits. That thumbnail is unverified,
but it exposed the error.

**The wiki's Damage page** ("Lunar and Stellar Glimmer Reaction Damage", fetched
15 Nov): Stellar Swirl and Stellar-Conduct share the Lunar formula. Direct
Stellar DMG counts as reaction DMG:

> DMG = talent% × stat × (1 + Reaction Base DMG Bonus) × (1 + 6·EM/(EM+2000) +
> Reaction Bonus) × RES × CRIT

- **No DEF multiplier.**
- **Generic DMG% does not apply.**
- EM counts twice: once in the base (1,000% of EM) and again in the bonus.
- Base bonus comes from the Stellar Jubilee passive: Cryo Traveler up to +7%
  (0.35% per 100 of his ATK); Odette, Sandrone and Vesna up to +14%.
- CRIT uses ordinary CRIT stats.

**Mizuki's Radiance instance** (1,000% of EM):

| | EM | non-crit, no shred | with VV shred | crit (with shred) |
|---|---|---|---|---|
| Now + Valeriy | 715 | ~17k | ~22k | ~36k (at 63% CRIT DMG) |
| Built | ~1,100 | ~37k | ~42k | ~83k (at 100% CRIT DMG) |

- **100k+ per hit is reachable** with more CRIT DMG or a +14% enabler. The 500k
  in the thumbnail is beyond that and is not explained here (constellations,
  Theater buffs, or several targets).
- **Valeriy's +100 EM is worth more than estimated:** 615 → 715 EM raises this
  instance by **~24%**, not ~16%.

**Read-out for the Furina test (max ~4k):** the Stellar instance should show as
~17–22k. It never appeared, so **Radiance never triggered**.
- Traveler's passive has no unlock condition: it turns every Cryo Swirl and
  every Superconduct into its Stellar version.
- Without Rosaria, his Skill was the only Cryo source. Mizuki mostly swirled
  Furina's Hydro and Valeriy's Electro, which give plain Swirl and no Radiance.
- **Test with Rosaria back:** numbers around 17–22k (36k on crits) mean the
  team is working. If they never show, Cryo is still too thin.

## Community team list (user screenshot of Google AI, 15 Nov)

**Baseline:** Mizuki · Cryo Traveler/Odette · Sucrose/C6 Faruzan · Qiqi/Diona.
"Core": Mizuki / Cryo Traveler / Sucrose / Odette.

| Pick | Owned? | Note |
|---|---|---|
| Odette | **No** | +14% Stellar base, double the Traveler's +7% |
| Sucrose | Yes, Lv 50 — **in the Varesa team** | Shares 20% of her EM; swirls Cryo herself, which also puts Mizuki into Radiance. Weak at 94 EM today. |
| Faruzan, Kazuha, Qiqi, Diona, Vodyanitsa | **No** | Diona C6 would add +40% Reaction Bonus to Stellar Swirl |

The only owned piece of the community core is Sucrose, and she is committed to
Varesa. **The current line-up stays: Mizuki · Traveler · Rosaria · Valeriy.**
The lesson from that list matches the correction above: **keep Cryo constant
and stack EM.**

## 🔒 Root cause: Vast Be the Dream is locked (15 Nov, user's talent screen)

Every damage figure above for the payload and the Stellar instance assumes
**Vast Be the Dream**. On this account it is **locked**. It is a Witch's
Revelation talent, unlocked by a quest (wiki, read 15 Nov):

1. Mizuki at **Lv 70+**. She is 60.
2. **Revelations by Chance**: booth outside the Court of Fontaine. Needs only
   *Song of the Dragon and Freedom*, which is long done. Gives the Witch's
   Revelation Case.
3. **Witch's Revelation: Instruction Beyond Dreams**: same area. Trial Mizuki
   + Layla, three waves, no falling. Unlocks the talent.

The Furina test's ~4k was therefore **plain Swirl and her ordinary periodic
hits**. It was not a Cryo shortage; that read-out is withdrawn. Cryo uptime
matters again once the talent is unlocked.

**Order for this team is now:** Mizuki to 70 → the two quests → re-test (expect
17–22k Stellar numbers with Rosaria in) → everything else on this page.

## Showcase calibration (user screenshot of a rotation guide, 15 Nov)

Team: Traveler · Faruzan · Odette · Mizuki, against a **Lv 100** enemy.
- A single hit of **102,726**, at 1.98 s, **with no support buffs cast yet** (user).
  Passives still apply without casting: Odette's Stellar Jubilee (+14% Stellar
  base DMG, always on) and the Traveler's conversion. The showcase's own build
  (weapon, constellations, EM, CRIT) is not visible, so the gap to the model's
  ~83k built crit can't be split between gear and passives. The direction holds:
  "100k+ per hit is reachable", and "never near 100k" is confirmed wrong.
- **DPS meter 39,029** (2 s into the fight, so not a rotation average). That is
  the same order as the AI's 45–55k team-DPS claim, with premium supports.
- **Timing rule (from the guide): the 2.5 s cooldown starts when the Swirl is
  triggered**, not when the enhanced hit lands. The payload rides her next
  periodic hit after that Swirl.

### Second calibration — damage log, Lv 90 Mizuki (user screenshot, 15 Nov)

Team: Mizuki · Traveler · Faruzan · Sucrose. The supports dealt 0 damage.
- **Panel:** ATK 1,049; CRIT DMG 167%; CRIT Rate 169%, which includes a
  +102.61% test bonus, so every hit crits. All DMG bonuses 0%; Anemo RES −10%.
  EM is cut off.
- **Log:** Stellar-Swirl, then hits of 14,496 and 15,694 (enhanced), 39,903, and
  **99,758** (the nuke).

**Fit:**

| | Formula | Result |
|---|---|---|
| The nuke, solved for EM | Stellar: 10·EM × 1.03 × (1 + 6·EM/(EM+2000)) × RES × CRIT, **no DEF** | **EM ≈ 1,100** |
| Enhanced hit at that EM | Ordinary: (0.5·ATK + 10·EM) × DEF 0.5 × RES × CRIT | **16.2k**, against **14.5k / 15.7k** logged |

- One EM value explains both the nuke and the enhanced hits. **Both formulas
  are confirmed.**
- ~1,100 EM is what "Built" assumed above.
- Enemy level is not shown; Lv 90 was assumed for DEF.
- **Where the −10% Anemo RES comes from** (a second frame from the same test
  set-up, user screenshot): the target's base RES is **10% for every element**.
  The −10% in the damage log is therefore a 20% shred: Mizuki's **C2** (−20%
  Pyro/Hydro/Cryo/Electro/Anemo RES during her Skill, per the guide [28:41]).
  The showcase Mizuki is C2 or higher; the 39,903 hit is her C1 instance. This
  account's C0 Mizuki gets shred only from 4pc VV (−40% Anemo when she swirls).
  That is similar in size, so the calibration holds.
- The same frame confirms the vortex: **3 s after a Stellar Swirl it explodes
  for Stellar Swirl Cryo DMG**, as the wiki's formula section says.

**For this account, once the talent is unlocked:** the nuke scales on EM roughly
quadratically, since EM sits in both the base and the bonus.
- 1,100 EM → ~100k on a crit.
- 715 EM (Mizuki now, plus Valeriy) → ~36k.
- **EM is the stat to build, and CRIT Rate decides how often the nuke crits.**

## Cross-check: Zajef77, "The Ultimate Mizuki Guide (Part 1)" (recorded 7.1)

Source: `reference/transcripts/zajef-mizuki-guide-part1.md`. Read 15 Nov: the
kit, damage, constellations, weapons, artifacts, damage-expectation and team
chapters (0:09:58–1:15:19). Not read: the rotation chapters (1:15:19 on) and
the minor weapons (0:42:11–0:51:54). Timestamps are in brackets.

**Confirms what this file already says**
- **Stellar damage ignores DEF; EM counts twice** (base and multiplier) [22:17,
  23:19]. This is the 15 Nov correction.
- **Character level does not raise the Stellar nuke** [22:41]. Only the
  vortex/reaction part scales on level [25:34].
- **The enhanced "fart" is ~15k, the nuke ~100k** [18:48, 19:20]. This matches
  the damage-log calibration at ~1,100 EM.
- **Most of her damage is the Stellar passive (Vast Be the Dream)** [18:06].
  The farts and burst barely matter.
- **Skill first; burst is mostly defensive; she doesn't need the crown**
  [32:43].
- **Mains: EM / EM / CRIT circlet.** An EM circlet is fine while EM is low.
  ATK, HP, DEF and ER don't matter [55:04].

**New, and relevant to this account**
- **Double Cryo is close to mandatory** [58:43]. "The nuke will just get skipped
  if you're not triggering reactions." Swirling other elements works only if a
  Stellar Swirl is re-triggered at least every 8 s to keep Radiance [59:17].
  **Keep Rosaria.**
- **Valeriy is a fallback, not a pick:** "Valeri if you have a C2… if you want a
  shielder", then "you don't care about getting a shielder" [1:10:34]. Her farts
  continue through stagger.
  - Separate risk: Electro → Superconduct → **Stellar-Conduct**. He warns that
    Stellar-Conduct "makes Cryo MC worse" as a support, because it costs the
    off-field Cryo application that keeps her swirls coming [1:05:13, about
    Yae]. The same applies to Valeriy.
  - His +100 EM is still real. **Re-test Valeriy against Barbara and Sucrose
    once the talent is unlocked.**
- **His last-slot ranking:** Faruzan C6 > Vodyanitsa > Sucrose, all close
  [1:02:12]. Sucrose is the one this account owns, and she is in the Varesa
  team.
- **Sacrificial Fragments needs R4+** for its double-skill tech [37:08]. **This
  account's is R2**, so it is an EM stat stick only. R1 Widsith is worse than
  R1 Sac Frag on stats [41:52].
- **Sets: Gilded ≈ 2p/2p EM ≈ 4pc VV.** Pick by substats [53:59]. VV on Mizuki
  is best when the second Anemo wears Instructor.
- **Cryo Traveler without Odette** should wear the Stellar team set (caption:
  "furnace" — name unverified) [1:06:30]. Otherwise ATK 2p/2p or Tenacity [1:07:38].
- **Not worth it:** Kazuha (DMG% does nothing for her) [1:11:07], or random
  small EM passives [1:11:40].

**Unresolved:** the 0:56:22 table's "DMG CRIT" row reads 21,286–39,209 (frame
checked at full resolution). The narration around it says "north of 200k to
280–290" and "350… upwards of 400k". Either the auto-captions are wrong or the
two describe different measures. **Don't quote either until the video is
checked by ear.**

**Not in the guide at all:** the quest lock on Vast Be the Dream. Guides assume
it is unlocked.

### Weapon ranking frame (Zajef guide, 0:41:57; user screenshot)

Relative damage, **Widsith R5 = 100%**. From the top: Starsealed Edict 110.4%,
Sunny Morning Sleep-In (signature) 109.1%, Widsith R5 reset for the EM buff
107.5%, Reliquary of Truth 106.9%, Starcaller's Watch 103.1%, Sac Jade R5
102.0%, Thousand Floating Dreams 101.8%. Further down:

| Weapon | % | Owned? |
|---|---|---|
| Widsith R1 | 97.8 | **R2**, on Varesa: ~98% |
| **Sac Frag, only 1 skill** | **97.3** | **R2, on Mizuki.** Below R4 it never gets the double-skill tech, so this row is the one that applies |
| No weapon | 88.7 | — |

**Verdict:** taking the Widsith from Varesa would gain about 1% for Mizuki and
cost Varesa her weapon. **Keep Sacrificial Fragments on Mizuki.** The owned
catalysts not in the frame (Otherworldly Story, Favonius Codex, Emerald Orb,
Thrilling Tales) were not ranked; this file makes no claim about them. Weapon
choice is the smallest lever she has. EM and the unlock come first.
