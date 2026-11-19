# Damage tools — design (18 Nov 2026)

Two tools the owner asked for, for the public site:

1. **Build calculator.** Pick a character, level and weapon; set the five artifacts
   (main stat and four substats each). It shows final stats and a rough damage number
   for the character's main hit. Then change any substat and see the damage move,
   plus **"one more roll of X is worth +N%"** for every substat: the answer to
   "CRIT DMG or CRIT Rate circlet?" without hand maths.
2. **Sets and team buffs.** Pick the carry, then the teammates and their sets
   (Noblesse, Instructor, Viridescent Venerer, Scroll, Golden Troupe, Tenacity…) and
   their buffs (Furina's Fanfare, Valeriy's CRIT Rate debuff, VV shred…). It lists
   every bonus that reaches the carry and estimates the damage multiplier from each.

## The maths (already used in research 13–14)

- Ordinary hit: base (ATK×MV, or DEF/HP for scalers) × (1 + DMG%) × average crit
  (1 + CR×CD, CR capped at 100%) × DEF multiplier × RES multiplier.
- Stellar / Lunar reactions: no DEF term; `(1 + 6·EM/(EM+2000) + reaction bonus)`.
- Electro-Charged and similar: reaction base by character level × EM bonus × RES.
- Output is **rough on purpose**: one representative hit, not a rotation simulator.
  The page says so and links gcsim for full rotations.

## Levels

**Characters: level 90, with level 80 as an option. Weapons: level 90 only**
(owner, 18 Nov). Other levels are a future option; the data supports them (growth
curves), the UI does not offer them yet.

## Data (scouted 18 Nov)

| Source | Current? | Level-90 stats | Talent multipliers | Weapons / sets | Verdict |
|---|---|---|---|---|---|
| **Yatta** `gi.yatta.moe/api/v2` | **yes**: 138 characters incl. Mitya (7.2), Zibai | growth curve × base + ascension; **reproduces Varesa's sheet exactly** (HP 12,699, ATK 356.4, DEF 782) | per talent level, as `params` (Varesa NA lv10: 84.2%, 72.05%, …) | 279 weapons, 63 sets (set effects as text) | **Primary** |
| genshin-db-api (vercel) | **no**: no Mitya | direct `stats?level=90`, matches Varesa | via stats API | yes | Cross-check only |
| dvaJi/genshin-data (GitHub) | updated ~13 days ago | curves + promotions | — | artifact main/sub tables | Artifact value tables |
| Enka `store/characters.json` | yes | no | no | no | IDs/icons only |
| genshin.jmp.blue | down (521) | — | — | — | No |

Endpoints that worked: `en/avatar` (list), `en/avatar/{id}` (detail: `upgrade.prop`
base + curve type, `upgrade.promote[].addProps` ascension, `talent.*.promote[level].params`),
`static/avatarCurve`, `static/weaponCurve`, `en/weapon`, `en/reliquary`.

Set effects come as text; the buffs the calculator applies (Noblesse +20% ATK, VV
−40% RES, Scroll +12/28%…) are **hand-authored** from that text and tested.
Plan: snapshot the API into this repo at build time (no live calls from visitors),
credit Yatta on the tool pages, refresh per game version.

Test rule: every character the tools support is checked against an in-game stat sheet
before release; Varesa, Skirk and Mizuki sheets exist from the dummy tests.

## Where it runs

flux pages are CMS modules; they cannot run this project's scripts, and there is no
embed module (checked: `module.listTypes`, 18 Nov).

| Option | How | Verdict |
|---|---|---|
| **A. Generic EMBED module in the CMS + tools hosted by this project** | CMS adds a sandboxed iframe module with an origin allow-list; the calculators are a small Vite/React app in this repo, hosted statically (e.g. GitHub Pages from `gatispriede/Genshin`) | **Recommended.** Game maths stays in the game repo; the CMS gains a reusable, game-agnostic module |
| B. Native CMS modules (DAMAGE_CALC, TEAM_BUFFS) | CMS renders, we author JSON data | Puts Genshin formulas inside a general CMS: wrong place, and every formula fix needs a CMS deploy |

Trade-off of A: content inside an iframe is not indexed as the page's own text. Each
tool page therefore carries a written intro and FAQ as normal modules, and ads sit
outside the frame.

## Build order

1. Data layer: snapshot Yatta (level 90/80 stats, talents, weapons, sets), tests
   against the dummy stat sheets (Varesa, Skirk, Mizuki).
2. Build calculator: stats → damage → per-substat marginal value.
3. Sets and team buffs: buff list → multiplier per buff.
4. CMS EMBED module (CMS session), hosting, the tool pages on flux.
