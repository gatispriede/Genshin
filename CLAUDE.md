# Genshin Impact project — working rules

This file loads automatically. Read it before answering anything about the game.

## Why this file exists

Across one long session I got the following wrong by answering from memory
instead of checking: who sells the Anemoculus Resonance Stone, which NPC opens
the Reputation menu, how many Primogems a code list was worth, whether the
official map has a World Quest layer, what Temple of the Wolf is, when Goulash
unlocks, whether Emberwell is a sword or catalyst, where Pine Wood grows, and
when artifact farming becomes worthwhile. Every one was a confident assertion
that turned out false. The user noticed. **Checking is cheaper than the
unwind.**

## The rule

**Never state a game fact from memory.** My training data on this game is stale
and the game patches constantly. Specifically, always look up:

| Class of fact | Why it bites |
|---|---|
| **Where an item comes from** | Vendor vs. craft vs. quest reward changes, and I guess "vendor" by default |
| **Which NPC does what** | Katheryne ≠ Ms. Yu ≠ Hertha |
| **Any cost, threshold or total** | Resin, Reputation EXP, dice cost, oculi counts |
| **Quest unlock conditions** | Gated behind Archon acts, AR, other quests |
| **Artifact / weapon / talent effects** | Rebalanced regularly; numbers were doubled in a recent patch |
| **What's in the current patch** | Characters, cards, regions, events |
| **Whether a redemption code works** | Livestream codes die in 24–48h |

If I can't verify it, say so plainly and mark it unverified in the output. A
flagged gap is useful; a confident wrong answer costs the user real time.

## Where to check — see `reference/sources.md`

Short version: **Fandom wiki is the authority** for numbers, thresholds and
item sources. **KeqingMains** for builds and rotations. **The official HoYoLAB
interactive map** for anything positional. **Their Battle Chronicle** for what
the account actually has.

Access quirks that waste time if forgotten:
- **Fandom returns HTTP 402 to WebFetch** for *article HTML*. But
  **`api.php` answers plain `curl`** with a User-Agent — so bulk data should go
  through the API and a script, never through the browser:
  ```
  curl -s -H "User-Agent: Mozilla/5.0" \
    "https://genshin-impact.fandom.com/api.php?action=query&prop=revisions\
&rvprop=content&rvslots=main&format=json&titles=A|B|C"
  ```
  20 titles per call. The wikitext infobox carries `startLocation`, `area`,
  `subarea`, `characters`, `type`, `group`. See
  `tools/fetch-reputation-quests.py` for the working pattern.
- **Prefer an auto-generated wiki Category over a hand-written list page.**
  Categories are emitted by each page's own infobox, so they cannot drift;
  prose list pages are transcribed by editors and go stale. Checking
  *`Category:Liyue Quests with Reputation Reward`* against the
  *Liyue Reputation EXP* page is what produced the complete dataset.
- **Quest length is measurable, not a guess.** Dialogue-section size plus the
  numbered step count rank quests by effort. The user's idea, and it works.
- **The official map's World Quest pins are unnamed** — all 576 return
  `name: null` and empty `ext_attrs`. You cannot map a pin to a quest. Give
  the start NPC and subarea from the wiki instead of inventing coordinates.
- **HoYoLAB map has more layers than the sidebar suggests** — search the pin
  categories before concluding a layer doesn't exist. There *is* a World Quest
  layer (576 pins) and a Statue layer; there is *no* TCG layer.
- Battle Chronicle needs their logged-in Chrome, and the SPA routes break on
  direct URLs — go via the profile card.

## The account — read `reference/account.md` first

Full roster, per-slot gear, exploration percentages and the refresh procedure
are in **`reference/account.md`**. Read it before giving advice; don't re-derive
it through the browser unless the snapshot is stale or the question needs
something it doesn't cover. Re-pull if it's more than a few days old — this
account went **AR 33 → AR 40 in one week**.

The thing that explains most of it: **seven of eight regions sit at 0–6%
exploration.** Mondstadt 70%, Liyue 23%, everything else barely touched. Advice
that assumes open regions, unlocked systems or farmed materials is usually
wrong here. Check exploration before recommending a region.

## Kit, weapon and artifact text is stored — use it

**Don't describe a skill, constellation, weapon passive or set bonus from
memory. It's all on disk:**

- **`reference/kits.md`** — all 23 owned characters: ascension stat, every
  talent and passive, all six constellations, full text
- **`reference/artifact-sets.md`** — all 63 sets, 2pc and 4pc
- **`reference/weapons-owned.md`** — every weapon they hold, R1 passive text
- **`reference/data/*.json`** — the raw Project Amber payloads. Grep these for
  anything the markdown condensed away

Source: `https://gi.yatta.moe/api/v2/en/{avatar|weapon|reliquary}/{id}`.
Works via **curl** — `urllib` gets 403 without a User-Agent. Character IDs are
in `reference/account.md`. Regenerate when a patch lands.

## Before answering, check `reference/open-questions.md`

Things already flagged as unverified live there, several answerable in-game in
seconds. Don't re-flag the same caveat every session — either resolve it, or
point the user at the 30-second check that would.

## How the user wants to work

- **Locations get a map.** Always. An annotated image, not prose directions.
  Base images come from the HoYoLAB map; see `docs/AUTHORING.md` for the recipe
  and `app/annotate.js` for the renderer.
- **Direct and opinionated.** Give the number or the recommendation first,
  reasoning second. No hedging on factual lookups.
- **Name mistakes plainly**, including my own earlier ones in the same session,
  and correct them in the files rather than only in chat.
- Keep prose short. The pages carry the detail.

## Project conventions

- Shared stylesheet `styles/map.css` — **never define a class that collides
  with one it already owns.** This has bitten twice: `.key` on `.bar`, then
  `.tag`, which is `position:absolute` for map pin labels and silently dragged
  a page badge out of its container. A page-local `<style>` that re-uses one of
  these names inherits whatever it didn't override. The 36 reserved names:

  ```
  .bad .bar .best .chest .diagram .do-now .dot-m .dotkey .farm .goal .good
  .hub .key .legend .lg .map-wrap .md .note .num .off .offmap .pin .pulse
  .rect .row .rows .sm .step .steps .sub .tag .warn .wp .wrap .zone .zone-label
  ```

  Prefix anything page-specific (`.qtag`, `.qt`, `.quest`) rather than
  guessing whether a short name is free.
- Map pages: `.map-wrap` + `drawMap()` from `app/annotate.js`, percentage
  coordinates so they stay responsive.
- **HoYoLAB map pins are teardrops** — their point marks the spot, so a dot
  placed on the visual centre lands ~4% too low. Offset upward.
- The preview server may serve a different folder than this one. If a page
  404s, copy it across before concluding it's broken. The session's
  `.claude/launch.json` now passes `--directory` so it serves this project.
- **Character portraits are on disk** in `assets/portraits/`, pulled from
  `https://gi.yatta.moe/assets/UI/UI_AvatarIcon_<Name>.png` (~37 KB each).
  Add more with that URL pattern — the name matches the `icon` field in the
  Project Amber character JSON.
- **The inline-visual widget tool cannot load those portraits.** Its sandbox
  only allows cdnjs, esm.sh, jsdelivr, unpkg and Google Fonts, so
  `gi.yatta.moe` is blocked and images render as broken icons — a `curl`
  returning 200 tells you nothing about this. Base64 is too token-expensive at
  ~37 KB a portrait. **Make a project page and serve it instead**, which is
  also what the user can keep.
- Corrections go in the page itself, dated, not silently edited away — the user
  reads these pages later and needs to know what changed.
