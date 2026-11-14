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
| Static deploy is **cancelled, not blocked** — re-confirmed when the lifted hold was put to him against the MCP-only plan | Gatis | 13 Nov |
| Missing functionality goes through the platform thread | Gatis | 13 Nov |
| **No Caddyfile or `X-Frame-Options` change** — the iframe was removed instead | content thread | 13 Nov |
| Map module to be scoped (below) | Gatis | 13 Nov |
| **Accept losing site-wide search and migrate anyway** — taken knowingly, with the build cost in front of him. Platform thread must NOT start the Search feature | Gatis | 13 Nov |
| flux MCP fixed by `--transport http-only`; Desktop config now launches it through the vault bridge | content thread | 13 Nov |
| Backup set stays a separate change | content thread | 13 Nov |

## Migration route — bundle (decided 14 Nov)

Author into a **local** CMS instance via MCP, `bundle.export` there, then
`bundle.import` on flux. Chosen over direct live writes: no rate limits, the
whole site is reviewable locally first, and one import replaces hundreds of
production writes. Content still goes in **batches** with a review between
each, locally.

- **Transport:** Gatis uploads the bundle to the flux server; `bundle.import`
  reads a server-side `path`. Gatis confirmed this and that versions are
  compatible.
- **Backup taken first:** `/tmp/flux-backup-2026-11-14-pre-genshin-import.json`
  on the flux server — 97,954 bytes, 111 sections, 0 assets. **`/tmp` may not
  survive a restart; move it somewhere durable before importing.**
- **Still open (platform thread):** whether the overwrite also replaces system
  pages, feature flags and `siteIdentity` (Q3), and how to start the local
  instance with MCP (Q4).

## Required on the code / module side

Platform thread owns all of these. Status is the platform thread's to update.

| # | Item | Why | Status |
|---|---|---|---|
| 1 | **Sanitizer: structural table attributes** | `colspan`/`rowspan` were stripped by an `ALLOWED_URI_REGEXP` bug | Fixed on `develop`, **not yet on flux** |
| 2 | **`MAP_ANNOTATED` module** | 19 pages are declarative pin-over-image maps with no home | **Scoped below, not started** |
| 3 | **Site search across pages** | Gatis asked for "wide search/filter"; unknown whether the CMS has it | **Answered by platform thread: it does not exist.** See below — Gatis must decide before batch C |
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

### Item 3 — answered: there is no site-wide content search

**Answered by the platform thread from the code, 13 Nov. The CMS cannot search
across page content today.** This is the one finding that should reach Gatis
before 30 pages move, because "wide search/filter" was his stated reason.

Verified absences:

- No `Search` feature folder in `services/features/` (50+ folders, none match).
- No `/search` route in `ui/client/app/`, and no search endpoint under
  `ui/client/pages/api/`.
- **No Mongo text index anywhere** — zero `createIndex` calls with `text` in
  `services/`.

Four things exist that look like search and are not:

| Surface | What it actually searches | Why it doesn't count |
|---|---|---|
| Command palette (⌘K) | Admin pane names | Admin-only navigation; never touches content |
| `anchor.search` / `linkTarget_*` | **Labels and hrefs only** | `AnchorRegistry` extracts only `title` / `sectionTitle` from parsed module content. Body text is never indexed. It exists to pick link targets |
| FacetedFilter + saved searches | The product catalogue | Per-route facet configs over `Products`; not pages or sections |
| `docs.search` | The `docs/` tree | Operator help for the platform, not tenant content |

**So migrating as-is trades a working client-side search for none.** Every page
would be individually readable and collectively unsearchable.

What it would cost to add (platform thread's estimate): `IItem.content` is a
JSON string, so a naive `$text` index would match JSON keys and HTML tags. It
needs a derived plain-text field per item, maintained on section save — and the
extraction primitive **already exists**: `htmlToBlocks()` in
`shared/utils/htmlBlocks.ts` turns HTML into block text segments and is already
used for translations. On top of that: a `Search` feature folder (loader +
service + `search.*` MCP tools, per the registry pattern), a `$text` index, a
public route and a search module. Mid-sized — bigger than `MAP_ANNOTATED`,
far smaller than checkout.

**Not started, and not to be started without Gatis.** It is a platform feature
in its own right, not a detail of this migration.

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

## Module schemas

Authoring reference lives in [cms-module-schemas.md](cms-module-schemas.md)
— read from the module `.types.ts` files by the platform thread, 13 Nov.
Two things that catch you out: `content` is a JSON **string**, and `style`
is a sibling field on the item, not part of `content`.

Corrections to earlier assumptions recorded there:

- **`TIMELINE` is unusable** for roadmap tiers or ascension steps. It is a
  CV timeline requiring `start`/`end`/`company`/`role`. Use `LIST` with
  `style: "timeline"` or `"numbered"`.
- **There is no page depth cap.** `page.update`'s description claimed a
  3-level limit; the code only logs past 8 and never throws. The
  description was wrong and has been fixed. Nest freely.
- **Slugs are derived server-side**, and reserved names are auto-prefixed
  rather than rejected — a page named "Blog" becomes `page-blog`.

### Item 6 — external bundle export/import over MCP (requested 14 Nov)

Gatis: "MCP should have a way to export / import from external." Today both
bundle tools read and write the server's own disk, so an MCP client on another
machine can neither receive an export nor send an import. Asked of the platform
thread, in value order:

1. Inline (chunked) export in the tool result.
2. Inline (chunked) import — upload session or capped inline field.
3. Scoped import — merge mode or a page/collection filter, so a routine status
   edit does not wipe-and-replace every collection. **The one Gatis's
   status-update workflow depends on.**
4. Dry-run diff before commit.
5. Automatic backup before any import.
6. Explicit `null` for absent settings, so an import can clear them.

Until it ships, routine updates go through targeted MCP writes.

**Status 14 Nov: built, not deployed.** Branch `feat/mcp-bundle-scoped-transfer`
(local only). Three tools: `bundle.exportScoped` (named pages, inline,
structure-only), `bundle.plan` (dry run, per-collection add/replace/delete),
`bundle.importScoped` (inline; `merge` default upserts by id and deletes
nothing; `replace` refused for scoped bundles). Every write-mode import now
writes a backup first and refuses to proceed if it cannot. Inline cap 256 KB;
one page is ~2 KB. Whole-site inline export was dropped deliberately:
measured at 2.8 MB / ~840k tokens, it would land in the client's context.
Item 6 (explicit null) still awaits Gatis. None of it exists on flux until
the branch is deployed.

## Required on the content side

Owned by the content thread.

| # | Item | Status |
|---|---|---|
| A | Get `flux-prod` MCP attached in the content session | **Blocked on Gatis** — see below |
| B | Render-and-push pipeline (see below) | Not started |
| C | Push the build pages — table-heavy, no merged cells | Not started |
| D | Push character/team pages generated from `src/data/*.ts` | Not started |

### A — flux MCP: the endpoint works, only the client is unattached

**Proven, not inferred.** The vault binding `flux-mcp-probe` runs a real
JSON-RPC handshake against `https://flux.siaup.store/mcp` with the token
injected by the vault:

```
initialize  -> HTTP 200, Mcp-Session-Id: c9140f0a-…
               serverInfo { name: "redis-node-js-cloud-cms", version: "0.1.0" }
tools/list  -> returns the tool set (page.list, …)
```

So the credential, the endpoint and the protocol are all good. The only thing
missing is Claude Code's own MCP client connection.

**Gate 2 is now removed.** `.mcp.json` hosts `flux-prod` through
`secrets launch flux-mcp-bridge`, which runs `tools/flux-mcp-stdio.sh`. The
vault injects the token into *that* process, so Claude Code needs nothing in
its own environment and does **not** have to be relaunched through the vault.

**Gate 1 remains, and is Gatis's:** `enabledMcpjsonServers` is `[]`, so the
project `.mcp.json` is not read at all. Approve the project MCP servers —
`/mcp` from an interactive `claude` in this directory — and `flux-prod`
attaches on the next session.

Vault objects backing this, all by name, no value ever exposed:

| Name | Kind | Purpose |
|---|---|---|
| `flux-mcp` | secret | one field, `token` |
| `flux-mcp-bridge` | binding | hosts the stdio bridge for `.mcp.json` |
| `flux-mcp-probe` | binding | full handshake check |
| `flux-mcp-check` | binding | quick auth check (400 = good, 401 = bad) |
| `claude-genshin` | binding | launches Claude with the token in env (now optional) |

### B — content must be the rendered DOM, not the source HTML

The static pages are **partly script-generated**. Every build page carries 2–3
`<script>` tags (`app/icons.js`, `app/ascension.js`, `app/nav.js`) and the
source holds placeholders like `<span data-char="Varesa">` filled at load time
from `reference/data/*.json`.

Copying source HTML into RICH_TEXT ships **empty placeholders**. The pipeline
must load each page, let the scripts run, serialise the result, strip the nav,
and push that.

### B.1 — icons get uploaded, not hotlinked

`app/icons.js`, `app/stellar.js` and `app/theater.js` all emit
`<img src="https://gi.yatta.moe/assets/UI/…png">`. Those `<img>` tags survive
the sanitizer intact, so serialised DOM would work as-is — and would make flux
**hotlink a third-party fan CDN on every page view, forever**. If that host
rate-limits or disappears, the pages silently lose their icons.

**Decision (content thread): upload them and rewrite `src` during
serialisation.** The volume is tens of files, not hundreds — 8 distinct
`data-char` and 2 `data-set` across the build pages, plus the season cast on
`theater` and `stellar`. That is cheap enough that a permanent visitor-side
dependency on someone else's infrastructure isn't worth it, and durability is
the whole reason for moving into the CMS.

This is deliberately *not* the same call as `assets/quest-maps/`, which stays
out: that is 101 MB of full-size wiki screenshots serving out-of-scope pages,
against ~50 small UI icons the pages already display either way.

### B.2 — inline SVG is dropped whole, and costs one page

DOMPurify runs with the html profile only, no svg profile, so an inline `<svg>`
is deleted rather than degraded. Exactly **one** page is affected:
`wuwang-statue-puzzle.html`. Of the `app/` scripts only `collect-map.js` uses
`createElementNS`, and that is out-of-scope map machinery.

**Not worth widening the sanitizer for.** Enabling the svg profile across a
multi-tenant platform for one puzzle page is the wrong trade. If that page
matters, rasterise its SVG to PNG and upload it.

### C — merged cells are not blocking the first batch

Counted across all 51 root pages: only **4** use `colspan`/`rowspan` —
`character-roadmap`, `collectibles-status`, `reputation-compass`, `tcg-skirk`.
Every build page and both team pages use **zero**, so batch C can start before
item 1 reaches flux. `character-roadmap` has 8 and must wait for it.

## Open questions

| Question | For | Blocking |
|---|---|---|
| **Accept losing search, or build item 3 first?** Answered below: the CMS has none. This was the stated reason for the move | **Gatis** | **Batch C — decide before 30 pages move** |
| For `MAP_ANNOTATED`: how does a control module reach a display module? Platform thread recommends URL params (deep-links, survives reload) over `refreshBus` | Gatis | Sets precedent for every future module pair |
| Does a map controller ship in v1 at all? 19 maps are useful with no controller, since the originals have no layer toggle | Gatis | Only if filtering is wanted |
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
