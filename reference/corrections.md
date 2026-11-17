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

**Took aggregator prose over the wiki's reward tables (8 Nov)**
`02-wishes-and-primogems.md` carried three wrong income figures, all from guide sites:
**Spiral Abyss 1,200/month** ("resets 1st and 16th, 600 each" — it now resets **once, on
the 16th, for 800**), **Imaginarium Theater 420–800/season** (the per-season total is
**1,000**), and daily commissions as **"30 + 30"** (it is **40 + 20**; the report-back
bonus is 20). The wiki had exact tables for all three the whole time.
→ *Pattern, and the second instance this week: the project's own rule says Fandom is the
authority for numbers, and I keep reaching for a guide because it is phrased as an
answer. Reward tables first, prose second.*

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

**A cross-reference to a doc that never existed (8 Nov)**
`01-mora-farming.md` sent the reader to `05-quests-and-progression.md` for the Serenitea
Pot unlock. There is no such file and there never was — doc 05 is `05-current-loadouts.md`,
and **nothing in this repo covers quests and progression**. Found while filing the
Frostbearing Tree, not by looking for it.
→ *Fix: a `see other-doc.md` is a claim like any other. Check the filename resolves before
writing it. Cheap to verify: `ls research/`.*

**Told them to go claim 2,400 Primogems they had already claimed (10 Nov)**
On 8 Nov I put Spiral Abyss floors 1–8 at the top of doc 02 as *"the single biggest
unclaimed lump"* and onto the setup checklist. Enka reports the deepest descent at
**floor 11, chamber 3, 24 stars** — floors 1–8 were taken long ago. The same pull
flattened the rest of that section: Imaginarium Theater and Stygian Onslaught, both
written off as "clears this account can't make," show **act 3** and **index 3**. And the
account is **AR 51 / World Level 7**, not the AR 40 the file assumed.
→ *The worst part is the sentence I wrote next to it: "worth checking whether any of it
is already banked." I named the check and didn't run it. `curl -s
"https://enka.network/api/uid/790160140/"` needs no credentials and answers all of it in
one call. The README has documented that endpoint since 30 Oct.*

**Quoted the older of two figures the repo already disagreed on (10 Nov)**
Doc 02 said "Dragonspine is 5.9% explored." That is the README's **23 Oct** number;
`account.md` had **29.5%** from **28 Oct**, five days newer, sitting in the same
repository. I took the one I happened to read first.
→ *Fix: when two files in this repo carry the same statistic, they are a dated series,
not two sources. Take the newest and say when it was read.*

**Invented an unlock condition for Sanctifying Elixir (10 Nov)**
`06-artifact-plan.md` said *"Unlocking it needs 25 five-star artifacts"* and told you to
revisit at AR 45. There is no such threshold. The **Artifact Transmuter** is a gadget
claimed from the **Adventurer Handbook → Embattle: Chapter IV**; the 25 is the maximum
number of artifacts selectable in one extraction batch, which I had read and converted
into a gate. The mechanic itself was described right — set, main affix, two minor
affixes — which is what made the wrong gate plausible.
→ *Cause: a number seen near a mechanic became the rule for the mechanic. Also: a doc
titled "at AR 40" went three Adventure Ranks past AR 45 still saying "revisit at AR 45,"
because nothing re-reads a document's premise once it is written.*

**TCG sharing codes**
Claimed I could not produce one. True, and correctly stated — but I should have
reached for **published decks with existing share codes** much sooner instead
of hand-building a list from card text.

**Announced seven missing quests that were never missing (12 Nov)**
Comparing `reputation-quests.html` against the wiki's reputation category, I reported that
our Inazuma list carried 35 world quests to the wiki's 42, called out "seven quests — 700
EXP — missing from that page," and wrote it into the page as a red warning. All 42 were
there. The seven I could not see are the seven **marked done**: completed rows render as
`<td class="q"><span class="ok">&#10003;</span> <a…>`, and the pattern I counted with
(`<td class="q">(?:<a[^>]*>)?([^<]+)`) matched the `<span>` and captured nothing. Every
completed quest in every region was invisible to my count.
→ *Cause: I measured a file with a throwaway regex, got a number, and trusted it over the
generator that produced the file. The tell was there — Liyue showed 13 "missing" too, and I
read that as the page being broadly stale instead of my count being wrong. **Re-running the
pipeline produced a byte-identical file**, which should have been my first check, not my
last.*

> Rule: when a count disagrees with a generated artifact, **re-run the generator and diff**
> before writing the discrepancy down as fact. One `git diff` would have killed this in
> seconds. Writing it into the page as a warning made a private measurement error into a
> published one.

**Tactical Sweep: diagnosed the difficulty multiplier without looking at the screen (10 Nov)**
Four scores clustered in a narrow 16k–24k band across four unrelated bosses. I read that
as the signature of a shared multiplicative ceiling and concluded the account was running
a low difficulty — recommending a step up to Brutal Eradication's ×18. The user's next
screenshot read **`Goldflame Qucusaur Tyrant — Lv. 90`**, which *is* Brutal Eradication.
They were already on the top difficulty and already taking the ×18.
→ *Cause: an elegant inference from aggregate numbers, offered before asking for the one
screen that settles it. The clustering was real; my explanation for it was not. Pattern 3
again — a plan built on an unchecked premise — except here the premise was checkable in a
single screenshot I had not requested. **Ask for the state before theorising about it.***

> What saved it: the same screenshot showed the party was one Lv 90 trial plus three own
> characters including a **Lv 32**, which was the actual cause. Swapping to four trials
> measured **+20%** immediately. The right answer came from reading the screen, not from
> the inference.

**Treated "the wiki has no section for it" as "there is nothing there" (10 Nov)**
I built a whole Tactical Sweep analysis from Fandom's stat tables and boss pages, and it
held up. But the wiki's **Operations** section reads `''To be added''` for all four stages,
and I quietly skipped past it — so I described Morale as "resolving events before the boss"
and moved on. The user pushed back: *"you are guessing look answers on reddit or google."*
Community guides document the whole system — rounds with **deployment objectives** (element,
weapon type, member count, support faction), harder operations paying more Morale, and
**deployment order mattering because a deployed character is spent for that round.** That
last point is a real tactic I had no idea existed.
→ *Cause: I treated one source's silence as the absence of a mechanic. **A stub is a gap in
the source, not a gap in the game.** When a wiki section says "to be added" on the exact
thing being asked about, that is the signal to go elsewhere, not to route around it.*

> Worth recording honestly: the wiki-derived half was **confirmed** by the community guides,
> not contradicted — "preferably with Pyro to break the boss's shields" on Mondstadt matched
> the resistance tables exactly. The failure was one of **coverage, not accuracy.**
## Two agreeing sources still got 7 of 9 codes wrong (11 Nov)

I checked `reference/data/codes.json` against the Fandom *Promotional Code* page
and cross-checked it with a web search, found nine codes the file was missing,
and reported them. The account holder redeemed them the same day:
**two worked, seven came back expired.**

The two that worked — `KeepUpWithMitya` and `MIJIQ23V2437` — were the two added
after the file's 1 Nov baseline. Everything older was dead, including all three
untried members of the `GS71X` group, which settles a conflict I had logged as
unresolved: the file's "expired" on `GS71XYNSYJ` was right and the wiki's
*Active Codes* listing was stale.

**What I actually got wrong.** Not the sourcing — the confidence. The wiki lists
a code as active until someone edits it, and "expiry: unknown" means *nobody
recorded a death date*, not *this is alive*. I treated absence of an expiry as
evidence of life. The one code I flagged as single-source and low-confidence,
`CDOF4X83H7X2`, was dead; so were five I had not flagged at all. My confidence
markings were not wrong where I made them, they were missing where it mattered.

**The rule this refines.** Pattern 2 below says one source is a hypothesis and
two agreeing is a fact. That holds for stable facts. For **perishable** ones —
codes, banners, event windows — two agreeing sources are still only a
hypothesis, because both can be downstream of the same stale edit and neither
re-tests anything. The only validation is redemption. So: report perishable
finds as *candidates to try*, never as *available*, and say plainly that a dead
code costs nothing but a moment.

Useful corollary: because trying is free, a wrong guess here is cheap and worth
making. The failure was in how it was framed, not in surfacing the codes.

## Gave a quest list without the one fact that makes it work (11 Nov)

I ranked the shortest Inazuma reputation quests, mapped them, published the maps —
and never said that **finishing them awards nothing at the time**. The EXP is banked
and has to be collected from the Reputation NPC. The account holder did the quests,
saw the bar not move, and reported that none of them paid.

The galling part: `verified-facts.md` already said so, in a line I had read earlier
in the same session while pulling resin costs out of that very file. I quoted the
page's weekly-Request cap from four lines above it and walked straight past the claim
mechanic.

**What made it invisible.** I was answering "which are shortest", so I checked length,
gates and prerequisites — everything that decides *which quest to pick*. The claim step
is not a property of any quest, so nothing in the per-quest data could surface it. It
lives one level up, in how the system pays out.

**The rule.** Before handing over a list of things to go and do, ask separately: *what
does the reward actually require, beyond doing the thing?* Length, gates and
prerequisites answer "can I start it" and "how long is it". They never answer "how do I
get paid". Those are different questions and the second one has to be asked on purpose.

Also recorded, because it was missing entirely: the Inazuma Reputation NPC is
**Madarame Hyakubei**. Only Mondstadt's and Liyue's were in the file, in a section
whose own heading warns that Katheryne is not the Reputation NPC.

## Read a cast list as a quest giver (11 Nov)

I sent the user to **Harrison** for *The Ritou Road* and **Furuya Noboru** for
*Reminiscence of Seirai*. Neither starts their quest. The Ritou Road begins at a
**trapdoor** behind a house in Ritou — Harrison happens to stand there, and only
**at night**. Reminiscence of Seirai begins by **picking up an item** near a shrine
north-east of Seirai's Statue of the Seven. The user walked to both NPCs, got
nothing, and reported them as busts.

**Where it came from.** `tools/fetch-reputation-quests.py` fills `npcs` from the
infobox `characters` field minus Traveler and Paimon. That field is the **cast
list** — everyone who appears — in no particular order. I read `npcs[0]` as "start
NPC" and printed it in every ranking I gave.

The wiki had the right answer the whole time, in a `==Starting Location==` section
with its own prose and its own `World Quest X Start Location.png` screenshot. I
never looked at it, and worse, `fetch-quest-maps.py` sorted images by name length,
so the shorter `NPC Location X.png` beat the real start shot. Across Inazuma, Sumeru
and Fontaine, **37 quests** were leading with a picture of a bystander.

Two related finds in the same pass:
- `Home Lies Over the Ocean` is an **Inazuma** reputation quest whose `startLocation`
  is **Liyue Harbor**. The quest's `area` and its start are different fields and can
  disagree; I had been using `area`.
- The Gourmet Supremos chain interleaves paying and non-paying parts. *Assemble!*,
  *On the Road* and *The Importance of Eating Well* pay 100 each; the four parts
  between them pay nothing. A user doing the chain in order gets reputation on some
  quests and not others, which looks exactly like the system being broken.

**The rule.** A field named for its contents is not a field named for its role.
`characters` lists who is in the quest; it does not say who gives it. Before telling
someone where to go, find the field or section that actually answers *that* question
— here `startLocation` and `==Starting Location==` — and when neither exists, say the
start is unknown rather than promoting a cast member.

Fixed: new `tools/fetch-quest-starts.py` records how each quest really begins,
`fetch-quest-maps.py` now ranks a Start Location shot above an NPC shot, and the
filename regex no longer drops names containing `!`, `?`, `:` or quotes.

## Substring-matched a conjunction (11 Nov)

I sent the user to Aratani for *Yae Publishing House's Invitation*. Right NPC,
right spot, map correct — and the quest would not start, because it needs
**Bookworm Swordsman** first.

The requirement string is `"Complete Bookworm Swordsman and Ritou Escape Plan"`.
My filter for "is this gated?" was:

    req and "Ritou Escape Plan" not in req

Ritou Escape Plan *is* in the string, so the test said ungated. But the string is
a **conjunction** — it names two prerequisites, and I only looked for one. A
substring test answers "is this name mentioned", never "is this the whole
condition".

**What it cost.** Not one bad recommendation but a whole bad picture. Running a
proper check, only **6 of 31** outstanding Inazuma quests are startable; I had
been ranking as though most were. Three of the four I had called "clear of
gates" over the last several turns were not.

**The rule.** When a field is prose written for humans, parse it or quote it —
never pattern-match a fragment of it and treat the match as the answer. If
parsing is too fragile, show the user the raw requirement and let them judge.

Fixed by `tools/quest-gates.py`, which splits requirements on `and` / `;` /
commas, strips the "Complete"/"Start" verbs and "N times" tails, and checks every
name against claimed.json. It also credits a claimed series part for its series,
so `Orobashi's Legacy: Part V` satisfies "Orobashi's Legacy series", and carries
an explicit allowlist of story quests known finished from progress rather than
from the reputation list.

## Ran a counter off chat instead of the screen (11 Nov)

I tracked the user's reputation by incrementing my own tally every time they
said "done" or "nice next". After six of those the Reputation screen read
**16/45, Level 7, 530/750** — 3,980 EXP. My record said 17 claimed and 4,080.

Two things made it drift. Messages like "great next" are ambiguous between *I
finished one, what's next* and *great — what's next*, and I resolved them the
flattering way every time. And the in-game counter tracks **claimed**, not
completed, so even a genuinely finished quest does not move it until the user
walks back to Madarame Hyakubei. My tally had no way to represent
"done but not claimed", so it recorded the optimistic state as fact.

**The rule, already written in this very file.** Pattern 4 says *the account is
the authority*. I had the authority available — the user had been sending
screenshots all session — and I still preferred my own arithmetic because it was
cheaper than asking. A derived counter must never outrank a direct reading, and
when the two disagree the derived one is wrong by default.

`claimed.json` now carries the warning in `_inazuma_status`: do not increment
this list from conversation, only from the screen.

---

## Told the user not to level, and it was the wrong call (1 Nov → 12 Nov)

`research/10-imaginarium-theater.md` said in bold: *"Do not level for Season 29 …
Four characters raced to Lv. 60 for November expire in thirty days."*

They levelled anyway. Alyosha, Valeriy, Lisa and Dahlia reaching Lv. 60 took the
Theater cast from 8 to 12 and unlocked **Normal Mode — six Acts instead of three.**

Two things were wrong with the reasoning:

- **It priced only one use.** Lv. 60 is a floor for Spiral Abyss, Stygian Onslaught and
  event combat as well. A level does not expire when the Theater element rotates.
- **It treated a rotating requirement as a sunk cost.** Doubling this season's Acts was
  worth more than the rotation cost, and the characters stay levelled afterwards.

*Lesson: when advice is "don't invest", check what else the investment unlocks before
writing it in bold. A narrow cost-benefit on one system is not a verdict on the account.*

---

## Claimed Lunar blessings existed without checking the branch list (1 Nov → 12 Nov)

The Season 29 section asserted the available reactions were "Electro-Charged, **Lunar-Charged
and Lunar Crystallize**". The wiki's Brilliant Blessing page lists eighteen branches and
**none of them is Lunar.** The claim was inferred from the season's three elements rather
than read off the source.

It mattered: the Act 6 villain card says *"Lunar reactions have an advantage"*, so a plan
built on that sentence would have chased a blessing line that may not be purchasable.

*Lesson: deriving "what reactions are available" from "what elements are required" is a
guess. The blessing branches are a published list — read it.*

---

## Built a whole build page on the wrong damage source (12 Nov)

`mizuki-build.html` was written around one sentence from the wiki's Swirl page:
*"Swirl damage is fixed damage based only on character level and elemental
mastery."* From that I concluded CRIT was irrelevant on her, told the user not
to build it, and judged the Cryo Traveler a downgrade because converting Cryo
Swirl into Stellar Swirl more than halves the EM coefficient.

Every step of that reasoning was sound. The premise was the wrong premise.

**Mizuki's damage is not Swirl.** Her Witch's Revelation passive, *Vast Be the
Dream*, adds **1,000% of her Elemental Mastery** to her next periodic AoE Anemo
hit after she triggers a Swirl. That is an ordinary damage instance carrying a
large additive base — it **crits**, and it takes DMG% buffs. The swirl is the
trigger; that hit is the payload. **Radiance: Stellar Swirl** then adds a second
instance at another 1,000% of EM — so a Stellar enabler roughly **doubles** her
biggest hit, which is exactly why the community builds her around it.

So the advice inverted: build CRIT, want the Cryo Traveler, run the Cryo team,
and move Viridescent Venerer onto Sucrose.

**How it was caught:** the user's own three team screenshots — one of which was
already the Cryo Traveler team I had argued against — plus a cross-check of
KQM, Prydwen and Mobalytics through Google's AI search, at the user's
suggestion.

*Lesson: I read the reaction's mechanics page and stopped. I never read the
character's own passive list to the end — the passive that mattered was the one
I skipped as flavour. **Read the whole kit before reasoning from a mechanic.**
And when the user's build disagrees with mine, check their premise before
defending mine: they had been playing the correct team all along.*

---

## Sized Mizuki's Stellar hit with the wrong formula (15 Nov)

In research/14 I modelled Mizuki's damage with the ordinary formula
(ATK/EM base × DMG% × DEF × RES × CRIT). I then assumed her **Radiance: Stellar
Swirl** instance was "roughly the same size" and told the user she "never gets
near 100k per hit".

That instance is **Stellar Glimmer reaction DMG**, and it uses the Lunar formula:
- no DEF multiplier;
- generic DMG% does not apply;
- a (1 + 6·EM/(EM+2000)) EM bonus, on top of a base that is already 1,000% of EM.

At 715 EM it is ~17–22k before crits, not ~4.6k. Built, it crits for ~80k+.

**How it was caught:** the user's screenshot of a showcase with ~500k numbers.

*Lesson: "considered Stellar Swirl reaction DMG" was in the talent text I quoted.
That phrase names the formula. When a talent says its damage counts as a
reaction, look up that reaction's damage formula before estimating it. This is
the same failure as 12 Nov, one level down: read the mechanic the text points
at, not the one you already know.*

---

## Built every Mizuki plan on a talent the account hadn't unlocked (12–15 Nov)

From 12 Nov, the Mizuki page, the team pages and research/14 all reasoned from
**Vast Be the Dream**: the 1,000%-EM payload and Radiance: Stellar Swirl. I read
the talent text from the wiki and never checked whether **this account** had it.

It doesn't. It is a **Witch's Revelation** talent, unlocked by a quest that
needs Mizuki at **Lv 70**. She is 60.

**How it was caught:** the user's ~4k ceiling in a Lv 90 domain. Then their
screenshot of the talent screen showing the lock and "Complete the relevant
Witch's Revelation quest to unlock".

My own 15 Nov read-out of the ~4k ("Radiance never triggered, Cryo was too
thin") was a sound inference from a false premise, the same shape as the
12 Nov entry. The Cryo point still matters, but only after the unlock.

*Lesson: a talent on the wiki is not a talent on the account. Any talent
marked "Witch's Revelation", "Hexerei" or similar is quest-gated. research/11
already knew this for Fischl and Sucrose's Witch's Homework, also gated at
Lv 70. **Before reasoning from a talent, confirm it is unlocked: the level
gate, the quest gate, or the in-game talent screen.***

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
40 in a week, then **40 → 51 in under two**. Search engines still think
Snezhnaya isn't playable while the Chronicle reports 19 Cryoculi.
**The account is the authority.**

> This one keeps recurring and it is the most expensive of the four, because it
> sends the user to do things they have already done. **Rule, as of 10 Nov:**
> before writing any sentence about what this account has, hasn't, can or can't
> do, run `curl -s "https://enka.network/api/uid/790160140/"`. It is free, needs
> no credentials, and takes one call. There is no excuse for a stale AR again.

The user's own standing rule covers all four: *verify the actual current state
before acting on it.* Every entry here is a case of not doing that.

## 17 Nov 2026 — Sumeru shortest-first list ignored gating (twice over)

**What I said.** Read the live flux page and reported 32 Sumeru world quests
shortest-first, leading with *Adventure Takes Courage!* (3.5) and *Memory's
Final Chapter* (6.7). Handed that to the user as a running order.

**What was wrong.** Both are prerequisite-locked. Effort score is not a running
order until gates are applied — the same mistake class as the Inazuma
"6 of 31 were actually startable" unwind, repeated one region later.

**Then the gate check was wrong too.** `quest-chains.json` reported
*Purbiruni's Commandment* and *The Price* as prerequisite-free. The wiki says
they need *Solitary Sea-Beast* and *The End of the Sabzeruz Festival*. Cached
chain data is stale for Sumeru.

**And the wiki's own field is not enough.** *A Delicacy for Nara* has an empty
`|requirement=`, but its lede reads *"the last quest of the series An
Unwavering Culinary Dream."* **An empty requirement field does not mean
ungated — check the lede for series membership as well.** Of 40 Sumeru
entries, exactly one survives both tests: **Even Beasts Stumble**.

**Rule.** Gate first, sort second, and clear a Sumeru quest only when the
requirement field is empty *and* the lede names no series.
