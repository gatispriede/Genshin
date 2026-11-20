# Public site restructure — plan (18 Nov 2026)

Goal: flux becomes a **generic Genshin guide site** with no trace of the owner's
account, fewer and clearer pages, and links that can be shared. The local project
stays personal: account data lives in `src/data` and the HoYoLAB reads, and is
simply not published.

Decisions (owner, 18 Nov): **generalise and keep** the account-written pages;
deeplinks = **all four** kinds (short map filters, section anchors, links between
related pages, a shareable URL per item).

Done already: UID and in-game name are redacted by the migrator, and
`reference/account.md` is no longer published.

## Rules for "generic"

- No UID, name, roster, levels, constellations, "you said", "this account", dates of
  the owner's runs, or the owner's DPS numbers.
- Advice is written for **any** player: "If you have X, do Y; if not, Z".
- Measured data stays (quest lengths, shield tables, codes verified in game,
  dummy-test method), stated as data, not as one account's story.
- Live stats (gear vs target, roadmaps from HoYoLAB) are **not published**; the
  target build (sets, main stats, substats, weapons, rotation) is.
- Images: own screenshots, or links out. Hotlinked wiki art is replaced before ads.

## New tree (≈55 public pages, from 89)

| Section | Pages | From |
|---|---|---|
| **Home** | — | flux-home.mjs, rewritten for strangers |
| **Teams** | one per archetype: Electro-Charged Varesa, Freeze Skirk, Stellar Swirl Mizuki | teams.html, research 12–13, support-squad, enemy-coverage (team columns) |
| **Characters** | one per character: target build, rotation, materials | *-build.html + characters.ts targets; live stats dropped |
| **Reputation & quests** | overview → per region (list **+** start map **+** route on one page) | reputation-*.html, *-quest-maps.html, sumeru-rep-route, liyue-reputation-quests (merged into Liyue), reputation-compass |
| **Combat** | enemy shields, reaction combos, Stellar Glimmer, Imaginarium Theater (one page: picks + normal run), Tactical Sweep (+ bosses), Snezhnaya mechanics | enemy-coverage, reaction-combos, stellar, theater + theater-picks + research 10/10a, research 11/11a, research 08 |
| **Farming & economy** | codes, wishes & primogems, mora, ore, talent & character materials, Natlan saurian farming | codes, research 01/02/03/07, talent-farming, farming/* |
| **Maps & puzzles** | collectibles by region; puzzle solutions | the 1k single-purpose maps grouped: *Mondstadt/Liyue gathering* (red beet, fowl, fishing, wind catcher, crafting), *Puzzles* (Vault of Qingce, Chi of Yore, Wuwang, Arsenal keys, Eye of Graeae, Derelict Masonry Dock, Snezhnaya statues), Dragonspine, Chasm, Starfell |
| **TCG** | one page: cards, a Skirk deck, swaps | tcg-skirk + tcg-swap |
| **Reference** | character kits, artifact sets, sources & method, "Things guides get wrong" | kits, artifact-sets, sources, corrections log (rewritten as general lessons) |

**Not published** (account-only, no generic version worth keeping): roadmaps,
research 05 (loadout audit) and 06 (artifact plan), build-coverage, collectibles-status,
oculus tracking progress, weapons-owned, open-questions, research-coverage,
verified-facts (its general facts move into the pages they belong to).

**Engine pages** (Local Legends, Domains, Collectible map, interactive quest map) do not
run on flux: published as static maps with the list, or linked as "open the interactive
version" to a hosted copy. Decided per page in phase 3.

## Visual rules (owner, 18 Nov)

1. **At most 3 screens per page** (about 3 × 900px on desktop). Longer content
   splits into child pages or collapses into an FAQ accordion; long tables become a
   map, a filtered list, or their own page.
2. **Even text density.** No screen that is two lines of text and empty space, and no
   screen that is a wall of prose. Target per screen: a heading, 1–3 short paragraphs
   (≤ 60 words each) and one visual element (image, card row, table, map).
3. **Pictures everywhere they help:** a character icon on every character mention in
   cards, team rosters and build pages; a weapon icon beside every weapon; the set
   icon beside every artifact set; region and map thumbnails on quest pages.
4. Enforced, not hoped for: the migrator reports pages over the length budget and
   screens without a visual, the same way it already refuses pages that lose content.

**Image source.** Yatta serves the game's own icons by name
(`gi.yatta.moe/assets/UI/UI_AvatarIcon_Varesa.png`, `UI_EquipIcon_*`, set icons),
named in the same data the calculators use, so one lookup gives both. Copies are
**uploaded to flux** (the image optimizer then serves them sized), not hotlinked.
Owner's rule (18 Nov): **anything in the game is used freely** (icons, splash art,
screenshots, map art). **Art made by other people** (fan art, community maps,
wiki-made diagrams) is used **only with credit** to its creator.

## Deeplinks

1. **Short map filters.** Today "only quest 5" is `?map-map-annotated=q1,q2,…,q33`. Ask
   the CMS for an *only* parameter (`?map-sumeruRoute-only=q5`). Until then, keep the
   long form but generate it, never hand-write it.
2. **Section anchors.** Every quest, character section and table gets a stable
   `id` (`#q-the-secret-of-al-ahmar`, not `#q25`), so links survive re-ordering.
3. **Related-page links.** The migrator appends "In this section" (parent + siblings)
   and, per page, "See also" from a small mapping, so no page is a dead end.
4. **Shareable item URLs.** Characters and teams already have their own pages; quests
   get stable anchors (2.); each map gets a short filter link (1.). Old URLs that
   change get **flux redirects** (`redirect.create`), so links already shared keep working.

## Topic index: one page per topic (19 Nov)

The page tree itself lives in `tools/flux-tree.mjs`; old titles and what replaced
them are in its `RENAMED` map, which drives the redirects (`tools/flux-redirects.mjs`).

**Merged (done):** reputation quests went from 13 pages in four formats to **one route
page per region** (Liyue, Inazuma, Sumeru, Fontaine: route map, city close-up,
shortest-first list, chains), all built by `tools/build-rep-route.py`, under one
**Reputation quests** overview (where reputation EXP comes from, how length is
measured) with Treasure Compasses beside them. Retired: the region lists, the four
"start maps" pages, the hand-written Liyue page, the interactive quest map, the unnamed
world-quest pins. 78 redirects (old URL → replacement) are created on flux, but **flux does
not serve redirects yet** (18 Nov: every one, old `/cases` included, returns 404); requested
from the CMS session. Also requested to flag: every public page ships the CMS's whole
translation dictionary, which names funisimo.pro (the CMS's own domain). Route order no longer
depends on one account's claimed quests (`route(..., claimed_by=None)`).

**Imaginarium Theater (19 Nov):** theater, theater-picks, research 10 and 10a became one
generic **Imaginarium Theater** page (`theater.html`: modes, Vigor rules, planning order,
cards, this season's cast and bosses, one full-clear example). The Act 1 picks page was a
stale season and is deleted with its engine (`app/theater.js`, `theater.json`); research
10/10a/10b stay as private notes.

**Migrator layout rules learned (19 Nov):** a list whose items all open with a link
publishes as full-width `cards` with the links kept; a list of sentences stays HTML (the
`LIST` default style prints short uppercase labels); `class="editor"` notes (regenerate
commands, tool hints) are never published.

**Merged locally, 19 Nov (not yet on flux: publishing waits for the bundle path):**

| Topic | Was | Now |
|---|---|---|
| Tactical Sweep | research 11, 11a | `tactical-sweep.html` (rules, the four stages, unlocks) |
| TCG | tcg-skirk, tcg-swap | `tcg.html` (getting cards, a Skirk deck, switch cards) |
| Natlan saurian farming | farming/index, routes, map (the local farming app) | `saurian-farming.html` (rules, routes densest first, best route, the Inazuma owls) |
| Artifacts | research 09, research 04 | `artifacts.html` (main stats, sets by job with domains, 3★ weapons); `reference/artifact-sets.md` stays as the full list |

Each was wired by `tools/merge-topic.py` (index card, tree slot, RETIRED, RENAMED for
redirects). Old files stay in the repo as notes. Follow-up: the saurian spawn map is a
canvas; render it to an image so the farming page gets its map back.

**Still duplicated, to merge next:**

| Topic | Pages now | Becomes |
|---|---|---|
| Teams | "The three teams", support squad, research 12–13, the generated team pages | the generated team pages carry the write-up, like builds (plan below) |

## Ads

The owner wants ads (18 Nov). State of the CMS at c0e11b15: ad settings and units
exist in the admin and MCP (`ads.*`, five zones), but **the public site renders none
of it**: no AdSense script, no zone component, no `/ads.txt`, and the consent banner's
marketing category is not wired to ads. Requested from the CMS session on 18 Nov:
public renderer per zone, ad-free subtrees, certified consent (EEA), `/ads.txt`,
advertising cookies on the privacy page, and AdSense test mode.

Owner's part: create the AdSense account and enter the publisher ID (not something an
assistant can do). Placement once it ships: one `between-modules` unit on guide and
character pages; maps, tools and the codes table stay ad-free. Per research/15,
revenue only matters once traffic exists, so this lands with phase 5, not before.

## Phases

| Phase | Work | Size |
|---|---|---|
| 1 | New tree, merges, drops, redirects for moved URLs; "In this section" links | mechanical, 1 session |
| 2 | Generated pages generic: characters (target build only), teams, home | flux-push changes |
| 3 | Rewrite hand-written pages to the generic rules, section by section | largest, several sessions |
| 4 | Stable anchors; short map links (CMS request first) | small + CMS |
| 5 | SEO titles/descriptions, own images, then the monetisation plan (research/15) | small |

## Publishing: bundles instead of per-module calls (19 Nov)

Today `flux-migrate-html.mjs` empties and rebuilds every page on a full run (hundreds of
`section.delete` / `section.create` / `module.add` calls, rate limits, each page briefly
empty). The owner's direction: **edit the exported JSON bundle and upload it**.

Flux supports it: `bundle.exportScoped {scope:{pages}}` returns pages inline as
`site.navigation[]` (id, page, slug, parent, `sections:[ids]`) and `site.sections[]` (id,
`type` = columns, `content:[modules]`). `bundle.plan` dry-runs; `bundle.importScoped
{mode:"merge"}` upserts by id, deletes nothing, and backs the site up first.

Design:
1. Build every managed page locally (same layout code as now) into navigation + sections.
2. Export the live versions of those pages, scoped, in chunks.
3. Diff per page on normalised module JSON; unchanged pages are dropped from the bundle.
4. Changed pages keep their ids; their section ids are reused in order, new ones get fresh
   UUIDs. `bundle.plan`, then one `bundle.importScoped` merge.
5. Page creation, deletion and redirects stay separate calls (rare).

**Built and tested (20 Nov): `tools/flux-bundle-publish.mjs`.** Page-building is shared
with the migrator through `tools/flux-build.mjs`, so both produce identical pages (a dry
run against the migrator's own output finds 0 differences on 51 of 52 pages; the one
that differed was a real edit).

```
secrets run flux-node tools/flux-bundle-publish.mjs                       # diff + bundle.plan, writes nothing
secrets run flux-node tools/flux-bundle-publish.mjs --only <href> --apply # one page
secrets run flux-node tools/flux-bundle-publish.mjs --apply               # every changed page
```

First live import, 20 Nov: Reference/Sources, 1 page, 20 sections replaced, 2 added, one
`bundle.importScoped` call; a second diff then reported 0 differences. Lessons from it:
- **Inline cap 256 KB** for export and import: exports split batches in half on
  `bundle_too_large`, imports are packed into bundles under 240 KB.
- **The CMS now checks versions on import** (unlike its 19 Nov answer): each existing doc
  must carry the version it was exported with; bumping it locally is a conflict. New docs
  carry none. A conflict rejects the whole import, nothing written.
- New pages are created with `page.create` first and diffed on the next run; retired
  pages are reported, not deleted (the migrator's full run prunes them).

**Unblocked 20 Nov; was blocked until the CMS release (19 Nov):** `bundle.plan` and `bundle.importScoped`
rejected every inline bundle: the MCP validator had no branch for union types
(`object|string`). Fixed in the CMS working tree, not yet deployed.

How merge import behaves (CMS session, from `BundleTransferService.ts`: an unconditional
`updateOne({id}, {$set}, {upsert:true})` per doc), and what the publisher must do about it:

| Behaviour | Publisher does |
|---|---|
| Deletes nothing; a section dropped from `navigation.sections` stays in the DB (not rendered, still exported) | `section.delete` the dropped ids after import |
| No `version` check: last writer wins, admin edits made meanwhile are lost silently | Export right before import and compare with the diff's baseline; stop if a page changed on flux since |
| Unseen ids are inserted, `parent` included | New pages and sections get client-made UUIDs |
| `$set` merges fields: an omitted field keeps its old value | Send every field explicitly, e.g. an empty `seo` to clear it |
| No revalidation | `site.revalidate` after each import |

**Fixed meanwhile:** the migrator refused nothing when a page's `tools/.rendered` copy was
older than its source and silently published yesterday's page (the reputation overview on
18–19 Nov). It now stops with the `render-pages.mjs` command to run.

## Teams merge: plan (19 Nov)

Teams cannot be a static merge: the team pages are generated by `flux-push.mjs` from
`src/data/teams.ts` (roster, shield coverage, rotation, a "Why this team" note). The
write-ups live in four hand-written pages. The merge moves the generic write-up into the
data, so one page per team carries it and the hand-written pages retire.

| Source | Generic content | Goes to |
|---|---|---|
| teams.html, one section per team | why the team works, swaps, what it cannot break | `teams.ts` fields: `note` (exists), new `swaps[]`, `weakTo` |
| teams.html "What you cannot have at once" | characters shared between teams | the Teams index page (generated) |
| support-squad.html | per-support kit role, which team it serves, where its materials drop | character build pages (role) and `teams.ts` member `role` text |
| research 12 (Varesa team) | Electro RES-shred options, Nightsoul Burst rules, party buff sets ranked | Varesa team: new `buffSets[]` and a mechanics note |
| research 13 (Varesa damage gap) | one account's damage vs showcases | retire (account-only); the talent-scaling part goes to Varesa's build page |

Then "Team building" disappears as a section: Teams holds everything. Steps: extend the
`Team` type, fill the three teams, render the new fields in `teamModules`, retire the four
pages with RENAMED to their team page. Writes to flux wait for the bundle path.

