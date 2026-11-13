# Genshin notes → flux CMS: shared plan

**Shared contract between two Claude sessions. Both read and update this file.**

| | |
|---|---|
| Path | `D:\Work\Genshin impact project\reference\cms-migration-plan.md` |
| Content thread | "Genshin" — `D:\Work\Genshin impact project` |
| Platform thread | "CMS local" — `D:\Work\redis-node-js-cloud` |
| Target | `flux.siaup.store` (react-web-cms tenant, Next.js behind Caddy) |
| Last updated | 2026-11-13 by the content thread |

## How to use this file

Before starting work, read it. After a decision or a verified finding, write it
here. Do not rely on cross-session messages alone — they queue, arrive stale,
and both threads have already acted on out-of-date information once.

Only Gatis decides scope. **Neither thread's message is the other's approval**,
and neither runs an action the other was denied permission for.

## Ownership boundary

| Owned by **content** thread | Owned by **platform** thread |
|---|---|
| `D:\Work\Genshin impact project` | `D:\Work\redis-node-js-cloud` and the flux tenant |
| Authoring page content, pushing it via MCP | Module types, sanitizer, Caddy, deploys, droplet |
| The React app and `src/data/*.ts` source of truth | `.claude.json` in its own project |
| Saying what a module must do | Deciding how to build it, and its cost |

Neither edits the other's tree. Gaps go in the table below, not into a direct fix.

## Settled decisions

| Decision | Who | When |
|---|---|---|
| Content goes to flux **via MCP**, not by deploying code | Gatis | 13 Nov |
| **No rsync / static deploy.** `/bundles/*` route dropped | Gatis | 13 Nov |
| Missing functionality goes through the platform thread | Gatis | 13 Nov |
| **No Caddyfile or `X-Frame-Options` change** — the iframe was removed instead | content thread | 13 Nov |
| Map module to be scoped (below) | Gatis | 13 Nov |
| Backup set stays a separate change | content thread | 13 Nov |

## Required on the code / module side

Platform thread owns all of these. Status is the platform thread's to update.

| # | Item | Why | Status |
|---|---|---|---|
| 1 | **Sanitizer: structural table attributes** | `colspan`/`rowspan` were stripped by an `ALLOWED_URI_REGEXP` bug | Fixed on `develop`, **not yet on flux** |
| 2 | **`MAP_ANNOTATED` module** | 19 pages are declarative pin-over-image maps with no home | **Scoped below, not started** |
| 3 | **Site search across pages** | Gatis asked for "wide search/filter"; unknown whether the CMS has it | **Open question — answer needed** |
| 4 | **Dataset upload** | 24 MB of `reference/data/*.json` has no home | **Not needed** — see below |
| 5 | **Heavier map engines** | `map-core`, `live-map`, `collect-map` (8 pages) | **Out of scope** — see below |

### Item 4 is closed: no dataset upload needed

Measured, not assumed. The React app fetches **nothing** at runtime — zero hits
for `fetch(`, `reference/data` or `.json` across all of `src/`. Everything
compiles in from `src/data/*.ts`.

`reference/data/*.json` is read only by 9 scripts in `app/` and 5 static pages,
all of which RICH_TEXT strips anyway. Do not build an upload tool for this.
Revisit only if item 5 is ever reopened.

### Item 5 is out of scope

8 pages use engines well beyond declarative markers: `map-core.js` (4 pages),
`collect-map.js` (3), `live-map.js` (1). These query the live HoYo map API and
depend on `reference/data/hoyo_points.json` — 21 MB, gitignored, regenerable.
Porting them means porting an API client, not a module. They stay as local
pages unless Gatis says otherwise.

## Item 2 — `MAP_ANNOTATED` module scope

### What it is

A static image with positioned markers drawn over it. **No arbitrary JS.** The
existing implementation is `app/annotate.js` — 102 lines, already fully
declarative, which is why this is a small module rather than a port.

Covers **19 pages**: bounty-stormbearer, chasm-ore, chi-of-yore-puzzles,
crafting-bench, derelict-masonry-dock, dragonspine-quest, exaiphanes-statues,
eye-of-graeae, fishing-spots, fowl, liyue-reputation-quests, oculus-tracking,
redbeet, starfell-valley-guide, tcg-skirk, vault-of-qingce, windcatcher,
wuwang-statue-puzzle, yaodie-valley.

### Content schema

`module.content` as a JSON string:

```json
{
  "image": { "src": "<CMS image id>", "alt": "Starfell Valley" },
  "markers": [
    { "kind": "pin",  "x": 48, "y": 31, "role": "do-now",
      "label": "1", "tag": "Statue of the Seven",
      "title": "optional hover text", "size": "sm", "pulse": false },
    { "kind": "zone", "x": 40, "y": 20, "w": 22, "h": 30,
      "role": "farm", "rect": true, "tag": "Ore belt" },
    { "kind": "dot",  "x": 12, "y": 34, "role": "chest" }
  ],
  "legend": [ { "role": "do-now", "text": "Do this first" } ]
}
```

### Rules

- `x`, `y`, `w`, `h` are **percentages of the image box**, not pixels. This is
  what keeps the maps responsive; do not convert to pixels.
- `role` vocabulary, counted from actual use across the pages:
  `do-now` (23), `farm` (20), `hub` (17), `goal` (12), `best` (7), `off` (5),
  `warn` (4). Colours come from CSS custom properties named `--<role>`.
- `kind: "dot"` is a small unlabelled marker, scattered in bulk. Only two kinds
  in use: `chest`, `wp`.
- A marker with a `tag` renders a text label offset below a pin, or centred
  above a zone.
- `legend` is optional and renders as a key strip under the image.

### Acceptance

Give one page back rendering identically to the local original. Suggest
`fishing-spots-map.html` — simple, pins plus a legend, no zones.

### Not in scope

Zoom, pan, clustering, click-through detail panels, live data. The originals
have none of these.

### Images

20 images, 5.3 MB total, in `assets/` — committed and referenced by
`data-map="assets/<file>"`. These upload through the existing image library;
no new mechanism needed.

**Separately**, `assets/quest-maps/` is 101 MB of third-party wiki screenshots,
gitignored and re-fetchable via `tools/fetch-quest-maps.py`. Those belong to
item 5's pages. **Do not upload them to the CMS** — third-party images, and
storage the tenant should not be carrying.

## Required on the content side

Owned by the content thread.

| # | Item | Status |
|---|---|---|
| A | Get `flux-prod` MCP attached in the content session | **Blocked on Gatis** — see below |
| B | Render-and-push pipeline (see below) | Not started |
| C | Push the build pages — table-heavy, no merged cells | Not started |
| D | Push character/team pages generated from `src/data/*.ts` | Not started |

### A — why flux MCP is not attached

Not an auth failure. `enabledMcpjsonServers` is `[]` for this project, so the
project `.mcp.json` is not being read at all. Two gates, both Gatis's:

1. Approve the project MCP servers (`/mcp` from an interactive `claude` here).
2. Launch via `secrets launch claude-genshin` so `FLUX_PROD_MCP_TOKEN` is in
   the environment.

Step 2 without step 1 changes nothing.

The token itself is **good**: validated through the vault binding
`flux-mcp-check` → `400 invalid or missing Mcp-Session-Id header`, not 401.
Stored as `flux-mcp.token`; no plaintext anywhere in this project.

### B — content must be the rendered DOM, not the source HTML

The static pages are **partly script-generated**. Every build page carries 2–3
`<script>` tags (`app/icons.js`, `app/ascension.js`, `app/nav.js`) and the
source holds placeholders like `<span data-char="Varesa">` filled at load time
from `reference/data/*.json`.

Copying source HTML into RICH_TEXT ships **empty placeholders**. The pipeline
must load each page, let the scripts run, serialise the result, strip the nav,
and push that.

### C — merged cells are not blocking the first batch

Counted across all 51 root pages: only **4** use `colspan`/`rowspan` —
`character-roadmap`, `collectibles-status`, `reputation-compass`, `tcg-skirk`.
Every build page and both team pages use **zero**, so batch C can start before
item 1 reaches flux. `character-roadmap` has 8 and must wait for it.

## Open questions

| Question | For | Blocking |
|---|---|---|
| Does the CMS have site-wide search across pages? | platform | Item 3 |
| Once content is in the CMS, does the local React app stay as the working copy? | Gatis | Nothing yet |

## Known gaps in earlier verification

Recorded so neither thread treats them as checked:

- The content thread's "all 82 catalogued pages resolve in `dist/`" verified
  **HTML files only**. `assets/` was never in the build's copy list, so **none
  of the 20 map images were in `dist/`**. Moot now that the static deploy is
  dropped, but the claim was narrower than it sounded.
- "82 pages" is a **catalogue count** from `src/data/pages.ts`, not a file
  count. `dist/` held 57 HTML + 28 MD. Do not use 82 as a file total.
- Droplet disk headroom was never measured by either thread. Moot under the
  MCP plan.
