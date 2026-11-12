# Imaginarium Theater — the Normal Mode run, act by act

**Played 2026-11-12 · Season 29 · Normal Mode, 6 Acts · reached Act 5.**

This is the record of an actual run, written against
[`10-imaginarium-theater.md`](10-imaginarium-theater.md), whose Normal-mode plan this
supersedes. The plan was built on Vigor arithmetic and role balance and it was wrong in
three specific ways. They are named at the bottom.

---

## Result

| | |
|---|---|
| Acts cleared | **5 of 6** — previous best was 3 |
| First-ever clears | **Act 4 and Act 5**, both with their Star |
| Stars taken | Acts 1, 2, 4, 5 · missed on 3 and 6 |
| Approx. Primogems | **~480** |
| Also | 2 Toy Medals · 10 Sanctifying Essence · 10 Hero's Wit · ~500,000 Mora |

Act 6 was never close. The reason is in "What actually went wrong" below, and it is not
tactical.

---

## The log

| Act | Team | Time | Star |
|---|---|---|---|
| **1** — Elite Assault | Zhongli · Yelan · Fischl · Aino | **1:08** | ✅ 75s |
| **2** — first attempt | Aino · Kachina · Dahlia · Lv 60 Electro | **failed** | — |
| **2** — retry | **Flins** · Aino · Dahlia · Lv 60 Electro | **0:50** | ✅ 65s |
| **3** — Jadeplume, first attempt | Flins · Kachina · Dahlia · Lv 60 Electro | **failed** | — |
| **3** — retry | Flins · Fischl · Dahlia · Lv 60 Electro | **1:35** | ❌ 70s |
| **4** — Defense Sequence | Yelan · Barbara · Kachina · Lv 60 Electro | **2:10** | ✅ monolith ≥35% |
| **5** | Varesa · Kachina · + two | **1:51** | ✅ 24 opponents |
| **6** — Lord of the Hidden Depths | several attempts | **failed** | — |

> **Act 2's two attempts are the whole lesson in miniature.** The same three bodies, plus
> Flins instead of Kachina, went from *cannot clear at all* to **0:50 with the star**.
> One geared Lv 90 carry was the entire difference.

**Retrying a failed act costs no Vigor.** Confirmed in play — the pips were unchanged
after each failure. Retry freely; the only cost is time.

---

## Act 6 — Lord of the Hidden Depths: Whisperer of Nightmares, Lv 90

*Fandom, enemy page. This is the fight the run died on, and the mechanic is counterintuitive.*

### Deepdark Strike

The boss teleports to the centre, raises a **Deepdark Shield worth 45% of its Max HP**,
and summons **four Fishers of Hidden Depths** while it charges.

- **The shield can only be damaged by Elemental DMG.** Normal attacks do nothing to it.
- **Lunar Reaction DMG against the shield is multiplied by 300%.**
- **Each Fisher killed removes 25% of the shield.** All four removes it entirely.
- The summoned Fishers **do not** get shields of their own.

### The part that matters

> **If the Deepdark Shield is not depleted within ~18 seconds**, the boss consumes all
> remaining Fishers and fires an arena-wide attack — 200% ATK as True Physical CRIT DMG —
> and then **decreases all of its RES by 70% and is paralyzed for 10 seconds.**

So **failing to break the shield is how you get your damage window.** Kill all four
Fishers and the shield breaks early, the arena attack never happens, and there is no
paralysis at all.

### The loop for an under-geared team

1. **Shield phase, 18s.** Kill up to **three** Fishers — that is 75% off the shield —
   and **leave the fourth alive** so the timer runs out. Build energy. Stay shielded.
2. **Arena attack.** Unavoidable, 200% ATK. Be near full HP and behind a shield.
3. **Paralysis, 10s.** Everything goes here. The boss cannot act and its RES is −70%.
   With Zhongli's Jade Shield also up (−20%) that is −80% against a base of 10%, worth
   roughly **1.5× damage** on a stationary target.
4. Repeat.

The shield **does not vanish when the paralysis starts** — whatever is left of it still
has to be chewed through inside the window. That is why killing three Fishers first
matters: it decides how much of your 10 seconds is spent on shield rather than HP.

### Order inside the window

**Lisa's burst** (−15% DEF, 10s) → Electro aura from the Electro bodies →
**a Lv 90 applies Hydro to trigger Electro-Charged** → carry's damage.

> **Electro-Charged damage scales off the level and EM of whoever *triggers* it** — the
> character who applies the second element. Letting a Lv 60 apply Electro onto a wet
> target fires the reaction at Lv 60. Hold the Electro aura with the Lv 60s and let the
> Lv 90 Hydro unit do the triggering.

### Why it still failed

Best result was **40% of the boss remaining**, improving from 70% as the rotation
tightened. The four available bodies were Varesa (Lv 90, **no artifact set, 0.0% Electro
DMG Bonus**), Barbara at Lv 70, and two bare Lv 60s. One on-field damage dealer, and she
was the under-geared one.

---

## What actually went wrong

### 1. Twelve eligible bodies is not twelve usable ones

Normal Mode requires 12 characters at Lv 60+. Nothing checks whether they can fight.
This account's twelve were **six geared Lv 90 trials** plus **six of its own**, of which
one is Lv 90 with no artifact set and four are bare Lv 60s.

That is roughly **seven bodies that can fight, for 24 slots.** The Vigor plan in doc 10
balanced roles and arithmetic across all twelve as though they were interchangeable.
Act 2's first attempt — four characters, zero damage dealers — failed outright because
of it.

> **Rule:** before planning Vigor, sort the cast into *can clear an act alone-ish* and
> *is a passenger*. Every act needs at least one of the former.

### 2. Star Challenges were never accounted for

Every act carries a Star Challenge, usually a time limit (65–75s here, or an objective
like "monolith above 35%"). The doc's plan optimised only for *clearing*. Act 1 came in
at 1:08 against a 75s limit — seven seconds of margin, on the easiest fight in the run
with four Lv 90s.

> **Rule:** a carry-less team can clear a soft act but will miss its star. Choose which
> acts go without a carry; don't let it fall out of the arithmetic.

### 3. Spending the whole geared roster on one blocking act

Act 3 failed, and the fix was to field **all four remaining geared trials at once**.
That won the act — and left Acts 4, 5 and 6 with nothing but Varesa and Lv 60s.

It was the right call in isolation: rewards bank per act, and a blocked run earns
nothing further. But it only arose because Acts 1 and 2 had already spent trials on
fights that cheaper teams could have taken.

> **Rule:** your best four each need **exactly one early act plus the final act**. Not
> zero — a character held back entirely strands their second Vigor, since nobody can
> fill two slots in one act.

---

## Rules that did hold

- **24 Vigor, 24 slots, zero slack.** Everyone plays exactly two acts.
- **Vigor cannot be restored** except by certain Mystery Cache options — and those are
  real: *Companion: Raring to Go* returned **two exhausted characters at full 2 Vigor**.
- **A failed act costs no Vigor.** Retry.
- **Rewind returns to the last Climactic Showdown** (Acts 3 and 6 here), or the start of
  the play if none is cleared. It **un-ticks the acts after that checkpoint** until they
  are re-cleared, so never finalize straight after a rewind.
- **Rewards bank per act on finalizing.** A partial run is not a wasted run.

## Mystery Cache — the one that would have ended the run

**Companion: Impromptu Invitation** reads *"1 random Special Guest Star joins the
Principal Cast, but after completing this Act's Combat Event, no more Alternate Cast
members will join the Principal Cast."* The wiki carries an editor's note confirming the
prohibition is real.

Taking it would have left 18 Vigor for 24 slots — unable to field four bodies in Acts 5
and 6. **Mystery Cache is free, but its options are not all safe.** Read both.

---

## Next time

1. **Invite a friend's Supporting Cast member at run start.** A 13th body, +2 Vigor of
   slack, and it removes the zero-margin problem outright. This run went without one.
2. **Gear one support properly** rather than levelling a fourth one to 60. One built
   character beats three bare ones.
3. **Varesa's Electro DMG goblet** — roughly +47% on everything she does. See
   [`12-varesa-team.md`](12-varesa-team.md).
4. **Furina** — pulled on 12 Nov, and her party-wide buff is level-independent. See
   [`../furina-build.html`](../furina-build.html).

**Sources:** Fandom *Imaginarium Theater*, *Imaginarium Theater/Events*, *Lord of the
Hidden Depths: Whisperer of Nightmares*, *Fisher of Hidden Depths*; everything else read
off the in-game screens on 12 Nov 2026.
