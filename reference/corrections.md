# Corrections log

Every claim I made that turned out wrong, what the truth is, and the habit that
caused it. Read the **Patterns** section at the bottom first — it's the useful
part.

---

## Item sources

**Anemoculus Resonance Stone — "buy from Marjorie's Souvenir Shop"**
Wrong, and repeated three times across two pages. It is **not sold anywhere**.
*Instructions: Anemoculus Resonance Stone* is the **Mondstadt Reputation Level 2**
reward; you then craft it via Alchemy. Same pattern for Geoculus at Liyue
Level 2, and Electro/Dendro/Hydro at Level 8.
→ *Cause: assumed "gadget = vendor" without checking the item page.*

**Pine Wood — "Mondstadt has it"**
Mondstadt's conifers are overwhelmingly **Fir**. Reliable Pine is Wuwang Hill
and Dragonspine.
→ *Caught by the user after they wasted a trip.*

**Emberwell — called it a catalyst**
It's a **sword**, 165 Elemental Mastery. Recommended it for Skirk on that basis,
which was doubly wrong since EM does nothing for her.

## NPCs and menus

**"Katheryne → Reputation"**
Katheryne runs the **Adventurers' Guild**. The Reputation NPCs are **Hertha**
in Mondstadt and **Ms. Yu** in Liyue (east of the waypoint, north of the
blacksmith).

## Thresholds and timing

**"Don't farm artifacts until AR 45"**
**5★ artifacts drop from AR 40.** AR 45 only adds the guaranteed-drop tier and
the Strongbox. Stated as a blanket rule in doc 04, then had to be reversed twice.

**"Goulash for Sheer Cold"**
Recommended twice before checking. The recipe comes from *Ah, Fresh Meat!*,
which only unlocks **after** *In the Mountains* — the quest I was advising them
through. Real options: Scarlet Quartz, lit braziers, Warming Seelie.

**Temple of the Wolf**
Described as one of three seal temples gating *Confront Stormterror*. It is a
one-time AR 15 domain from Prologue Act I's *Crash Course*. *Confront
Stormterror* is a separate Trounce Domain at AR 25.

## Build advice

**"Blizzard Strayer is the answer for Skirk"**
Superseded. **4pc Finale of the Deep Galleries** is her best set — her Burst
spends Serpent's Subtlety, so Elemental Energy stays at 0 and the 4pc condition
is permanently satisfied. She already had it equipped.

**"Skirk urgently needs a Cryo DMG goblet"**
KeqingMains lists her goblet as "Cryo DMG Bonus **or** ATK%", and she was
wearing a 5★ ATK% goblet. A legitimate build, not an error. **Varesa's DEF%
goblet** was the one actually costing damage.

**"Give Prototype Rancour to Kaeya"**
Current guidance has moved off Physical Kaeya entirely — he's built Cryo now.
Noelle or Razor are the right homes for a Physical weapon.

**"Barbara is the only Hydro option for Skirk's Void Rifts"**
Too narrow. Superconduct and Cryo Swirl also generate them, so Electro and
Anemo work too. Corrected after reading the in-game talent text.

## Caught by pulling the real kit data (30 Oct)

**"Prototype Rancour is doing nothing on Skirk"**
Overstated. Its **substat** is Physical DMG, which is genuinely dead for her —
but its passive *Smashed Stone* gives **+4% ATK and DEF per Normal or Charged
hit, up to 4 stacks**, and that works fine. The weapon is a weak-but-functional
stat stick, not a dead slot. The Exaiphanes swap is still right; the reasoning
was sloppier than the conclusion.

**Skirk's Void Rift trigger list was incomplete**
I listed Frozen, Superconduct, Cryo Swirl and Cryo Crystallize. The actual text
also includes **Stellar-Conduct** and **Stellar Swirl**.

**Skirk's ascension stat is CRIT DMG**
I never knew this and it sharpens the advice: a meaningful chunk of her 106%
CRIT DMG is free from ascension, which is exactly why piling on more CRIT DMG
is wrong and CRIT Rate is the fix.
→ *Cause for all three: describing kits from memory when a structured API had
the exact text all along.*

## Walked into the one documented CSS trap (30 Oct)

**Defined `.tag` in a page's local `<style>`**
`styles/map.css` already owns `.tag` as the **absolutely positioned map pin
label**, with `transform: translate(-50%, 0)`. My rule didn't set `position`,
so the badge inherited `absolute`, escaped its container and rendered on top of
the quest title. Renamed to `.qtag`.

This is the *second* collision — `.key` on `.bar` was the first — and
`CLAUDE.md` already carried a rule warning about exactly this. Writing the rule
down didn't stop me, so the rule now lists all 36 reserved names, which is
checkable rather than requiring recall.
→ *Cause: picked a short, obvious class name without grepping the stylesheet
that every page loads.*

## Overcorrecting on a source I'd just found (30 Oct)

**"The category has 67 — my list of 57 was missing 10"**
Wrong, and wrong in the user's favour in a way that would have wasted their
time. Pulling all 67 infoboxes showed the split: **57 world quests + 3 Archon
acts + 7 weekly Reputation Requests = 67.** My 57 was the correct world-quest
list all along. The 7 "missing" quests are **weekly Requests** — 80 EXP, capped
at 3/week shared across every nation — which belong in a different bucket
entirely. The in-game counter reading **8/60** (57 + 3 acts) confirms it.
→ *Cause: found a bigger number, announced it as better before checking what
the extra rows were. A superset is not automatically a correction.*

## Estimating instead of asking (30 Oct)

**"You need about 1,600 more EXP — 16 world quests" (Liyue)**
Wrong by nearly half. I derived it from the only number I was sure of (600 from
three Archon acts) and treated everything else as zero. The real figure is
**1,300 banked, 900 to go, 9 quests**. The actual level had been sitting in
`open-questions.md` for two days flagged as *answerable in-game in under a
minute* — I built a whole page on the estimate instead of asking for the one
screenshot that settles it.
→ *Fix: when a quantity is gated behind one thing only the user can see, ask
for it in the same breath as presenting the plan. Don't publish a number
derived from a floor.*

**"Achievements don't give Reputation EXP" — right answer, wrong scope**
True of the **Achievement** system (the trophy menu). But the user was looking
at **Reputation → Quests**, a different screen that lists all 60 reputation
quests at 100 EXP each with an Achieved / Not achieved state. The word
"achieved" appears in both places and means different things. They said
"finishing these achievements/quests gives rep" and they were correct about the
screen in front of them.
→ *Fix: when the user describes a menu, establish which menu before answering
about the mechanic.*

## Research process

**"The official map has no World Quest layer"**
It has one — **576 pins**, filed under *Experience*, findable by searching
"quest" in the pin categories. I checked the sidebar, didn't search, and told
the user I couldn't place their quests.
→ *Cost: an entire page written around an apology that wasn't necessary.*

**"660 Primogems from these codes"**
About half were already expired — the three 100-Primogem ones were Version 7.2
livestream codes from five days earlier, and livestream codes die in 24–48h.
Real total nearer 320. I took one aggregator at face value and even told them
to redeem the dead ones first.
→ *Fix: always cross-check two code sources plus a timestamped tracker.*

**Called a wiki page a stub without reading to the end (7 Nov)**
Asked what the Shadow Realm pays, I answered **225 Primogems**, then **325**, before the
real figure — **475** — came out. Both misses were the same mistake twice: I read the
first couple of thousand characters of a page and stopped. *Shadow Realm* has a
**Mini Shadow Realm** rewards line (20 Primogems × 5) below the fold; *Edge of Survival*
opens with a `{{Stub}}` banner and carries a full `==Rewards==` score-ladder table
(15 Primogems at 50,000 and again at 200,000, **per stage**) near the bottom. I had even
noted "the wiki is a stub here" as if that settled it.
→ *Caught by the user's screenshot of the in-game Challenge Rewards tab, not by me.
Fix: grep the whole page for the thing being counted before concluding it is absent. A
stub banner describes the prose, not the tables.*

**Hardcoded prose numbers in a generated page (7 Nov)**
`build-reputation-pages.py` carried per-region sentences typed by hand:
Inazuma *"45 quests = 4,500"*, Sumeru *"40 quests = 4,000"*, Fontaine
*"45 quests = 4,500"*. All three were wrong, and all three contradicted the
figures the **same project** computes on the quest-map pages (4,800 / 4,700 /
5,000) — the counts ignored that Archon acts pay **200**, not 100. They now
come from the dataset.
→ *Pattern: a number written into prose inside a generator will drift away
from the number the generator computes. If the data can produce it, it must.*

**"At AR 40 these are almost certainly already banked" (7 Nov)**
Printed on every region's Archon-act list. The first Inazuma Reputation
screenshot disproved it — *Omnipresence Over Mortals* is unclaimed, and at
200 EXP it is worth two world quests. Replaced with what the screen actually
showed, and with an explicit "no screen has been read for this region" where
nothing has.
→ *Cause: a guess dressed as a hedge. "Almost certainly" is still a claim.*

**A builder that no longer reproduced its own output (7 Nov)**
`reputation-quests.html` and all four `*-quest-maps.html` shipped
`<script src="app/quest-chains.js">`; neither generator emitted it. Someone had
patched the HTML by hand. Re-running either script would have silently deleted
the chain warnings from every page.
→ *Check before regenerating: does the generator reproduce the committed file
byte for byte? Here it did not, and nothing would have reported it.*

**TCG sharing codes**
Claimed I could not produce one. True, and correctly stated — but I should have
reached for **published decks with existing share codes** much sooner instead
of hand-building a list from card text.

---

## Patterns

Four habits produced nearly every entry above.

**1. Defaulting to the most familiar mechanism.** Gadget → assumed vendor.
Guild NPC → assumed Katheryne. Ask *how does this category of thing actually
work in this game* rather than reaching for the first plausible answer.

**2. Checking one source and stopping.** The codes failure, and the World Quest
layer. One source is a hypothesis. Two agreeing is a fact.

**3. Giving advice built on an unchecked premise.** Goulash and the Blizzard
Strayer plan were both internally sensible and both rested on something I never
verified. Check the premise before building the plan on top of it.

**4. Trusting stale recall over the live account.** The account moved AR 33 →
40 in a week. Search engines still think Snezhnaya isn't playable while the
Chronicle reports 19 Cryoculi. **The account is the authority.**

The user's own standing rule covers all four: *verify the actual current state
before acting on it.* Every entry here is a case of not doing that.
