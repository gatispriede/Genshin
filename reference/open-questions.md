# Open questions

Things flagged as unverified across the project. Each one is currently stated
somewhere as a caveat. **Resolve them here rather than re-flagging them every
session** — and when one is answered, move it to `verified-facts.md`.

Most are answerable in-game in seconds, which is why they're listed: the user
can settle them far faster than I can search for them.

---

## Answerable in-game in under a minute

**Current Mondstadt Reputation level?**
Liyue is now known (Lv 4 — see below). Mondstadt still isn't, and it decides
whether the Anemo Compass is near or far. Mondstadt sits at **70.4%
exploration**, so all three exploration milestones (20/40/60%) should be
claimable — 300 EXP, plus whatever world quests are unclaimed.
→ *Hertha → Reputation → Quests / Exploration tabs. Read the "x/y" counter and
the "n/NNN" under the level.*

**Is the "Treasure Collection Cost" currency actually Original Resin?**
The icon is a crescent moon, not the usual resin symbol. The mechanic and
timing are unmistakably a Trounce Domain, but if the cost draws on something
else the resin budgeting in `verified-facts.md` needs adjusting.

**~~Does Alyosha have a Stellar-Conduct enabler in the party?~~** **Answered
2026-11-02: yes — the Cryo Traveler.** The enabling passive is called *Stellar
Jubilee*, and exactly three characters in the game carry one: Odette, Sandrone
and the **Traveler in Cryo form**. The Traveler's version is the weakest of the
three (0.35% per 100 ATK, max 7%, against 14% for the two 5-stars) but it still
flips the reaction on, which is the part that matters. Alyosha's passive was
never inert, just unreachable. See [`stellar.html`](../stellar.html).
→ *Read his passive text; check whether anything owned enables it.*

---

## Needs a proper look

**Does Mona's Illusory Bubble double Skirk's piercing damage, or only the main
hit?** (TCG) The card says "double the DMG dealt for this instance." Affects
whether the 7-stack Burst is 14 + 3 piercing or 14 + 6.

**What Reputation level is Inazuma actually at?** (opened 7 Nov 2026)
Screenshots of the Inazuma Reputation **quest list** arrived, and nine claimed
rows are now recorded in `claimed.json` — 2 Archon acts ×200 plus 7 world
quests ×100 = **1,100 EXP floor**. What they do *not* show is the **level bar**,
and the capture is two scroll positions so rows between or below them may be
missing. Until the bar is read, `build-reputation-pages.py` has no `KNOWN`
entry for Inazuma, so the region gets no "take the top N and you're done"
banner the way Liyue does.
→ *30-second check: Reputation menu in Inazuma City, read the level and the
`x/y` bar, same as Liyue's "Level 4, 40/460". Also worth re-reading **Inazuma
exploration %** — `account.md` and `build-quest-maps-page.py` both still say
**0%**, which nine claimed quests disprove. The 0% is now flagged stale in both
and no longer printed on the page.*

**Sumeru's quest EXP total — 4,300 or 4,700?**
`verified-facts.md` records **4,300** from a wiki summary. Counting the actual
quest list gives **4,700** (33 world quests ×100 + 7 Archon/story acts ×200).
The other three regions agree exactly between the two methods — Liyue 6,300,
Inazuma 4,800, Fontaine 5,000 — so Sumeru is the odd one.
Most likely cause: two of the seven I classify as "acts" aren't worth 200.
I detect acts by *no dialogue section and no step list*, which is reliable for
Archon chapters but may misfire on a Story Quest such as
*An Unwavering Culinary Dream*.
→ *Only matters if Sumeru reputation is ever actually chased; the pages show
the derived 4,700. Resolve by reading two of those quests' reward lines.*

**Natlan reputation.**
No `Category:Natlan Quests with Reputation Reward` exists — Natlan uses
**per-tribe reputation**, a different system with six separate tracks. The Pyro
Treasure Compass needs **Tribal Level 4 in three of six tribes**. Never mapped
out; would need its own pull.

---

## Resolved

*30 Oct 2026 — settled from an in-game screenshot:*

- ~~Current Liyue Reputation level?~~ **Level 4, 40/460** → cumulative 1,300.
  **900 EXP = 9 world quests to Level 6** and the Geo Compass. The menu reads
  **8/60**, so 52 quests remain. Confirms Liyue shares Mondstadt's level curve.
- ~~Can reputation-quest completion be read from a file?~~ **No.** The install
  keeps quest data in encrypted `.blk` bundles and progress is server-side;
  Battle Chronicle doesn't expose it. The in-game menu is the only source.
- ~~Liyue world quest start NPCs?~~ **All of them, for four regions.** Pulled
  from the wiki infoboxes into `reference/data/reputation-quests.json` and
  rendered in `reputation-quests.html`.
- ~~Quest length rankings — unverifiable?~~ **No, measurable.** The user's
  idea: dialogue-section size plus numbered step count. Both are in the
  wikitext. The ranking is now derived, not borrowed from guides.
- ~~Does the official map let me pin individual quests?~~ **No.** All 576 World
  Quest pins return `name: null` and empty `ext_attrs` — unlabeled dots.

*28 Oct 2026 — chased down, moved to `verified-facts.md`:*

- ~~Cryoculus total?~~ **140 available** in Snezhnaya as of 7.0 (→ 121 left on
  this account). Statue maxes at Lv 10 wanting ~270, so 140 only reaches Lv 6.
- ~~Teachings of Charity / Fortitude / Glory — which region?~~ **Snezhnaya**,
  from *Relics of the Fallen Grace* in Fellfrost Peak. **Fortitude is
  Alyosha's**; Charity and Glory serve Cryo Traveler.
- ~~Exaiphanes Blade — does five statues reach Lv 90?~~ **Yes.** 608 ATK,
  33.1% CRIT Rate. Only *refinement* is capped, and that scales the
  Traveler-only passive — irrelevant when another character holds it.
- ~~AR 40 Quick Challenge for locked Trounce Domains?~~ **Confirmed**, exact
  in-game wording recorded. Every weekly boss is reachable on this account.

*Earlier:*

- ~~Does the HoYoLAB map have a World Quest layer?~~ **Yes** — 576 pins, under
  *Experience*, searchable as "quest". I wrongly said no.
- ~~Is Reputation EXP retroactive?~~ **Yes**, but must be claimed manually.
- ~~Lunoculus total?~~ **271** as of 6.7.
- ~~Who sells the Anemoculus Resonance Stone?~~ **Nobody** — Reputation Lv 2
  instructions, then Alchemy.

## Is Skirk's A4 passive "Return to Oblivion" unlocked? (1 Nov 2026)

She reads **Lv 60** in the Chronicle, which is the Ascension-3 level cap — so she is
probably *not* ascended, and her second passive is probably still locked. Her
**+19.2% CRIT DMG** is consistent with Ascension 3 *or* 4 (the Project Amber
`addProps` give +19.2% for both), so the snapshot cannot settle it.

This matters more than anything else on the account: at three Death's Crossing stacks
the passive is **×1.6 on her Burst and ×1.7 on her Seven-Phase Flash Normal Attacks**.

**The 30-second check:** open Skirk's talent screen. If "Return to Oblivion" is greyed
out, one ascension roughly 2.4× her biggest hit. See `big-numbers.html`.

## What talent levels are Varesa and Skirk actually on? (1 Nov 2026)

The Battle Chronicle snapshot in `reference/account.md` does not carry talent levels.
Every damage figure in `big-numbers.html` therefore states the talent level it assumes
(1 for the "today" rows, on the basis that the account was 11 days old). Talent 1 → 10
is worth about **2×** on both characters' big hits, so this is worth reading off the
character screen once.
