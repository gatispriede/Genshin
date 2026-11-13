# CMS module content schemas

Authoring reference for pushing content to flux via MCP. Read from the module
`.types.ts` files by the platform thread, 13 Nov 2026 — not reverse-engineered
from live data.

See [cms-migration-plan.md](cms-migration-plan.md) for the plan these serve.

## The two rules that catch you out

1. **`content` is `JSON.stringify` of the object below.** `module.add` takes it
   as a string, not an object.
2. **`style` is a sibling field on the item, not part of `content`.**

```
module.add { sectionId, module: { type: "LIST", style: "timeline",
                                  content: "{\"items\":[…]}" } }
```

## Page and slug model

| Question | Answer |
|---|---|
| Who sets the slug? | Derived server-side — `safePageSlug(slugifyAnchor(pageName))`. `page.create` takes **no** slug parameter. |
| Reserved names? | **Permitted but auto-prefixed.** A page named "Blog" becomes `page-blog`, not an error. Reserved: `admin` `blog` `app` `auth` `dev` `cart` `checkout` `account` `orders`. Name pages away from these for clean URLs. |
| Nesting | `slug` stays **flat** — it is that page's own segment. The public URL is the **parent chain joined**, so a child of `teams` is `/teams/<slug>`. |
| Setting a specific slug or parent | `page.create` then `page.update` — only `update` accepts `slug` and `parent`. |
| Depth limit | **None.** `page.update`'s description claimed a 3-level cap; that was wrong and is now fixed. The code only logs `PAGE_DEPTH_DEEP` past 8 and never throws. Nest as deep as the content wants. |

## Schemas

### `KEY_VALUE_DOSSIER` — character vitals

Exists precisely because operators were hand-typing `<dl>` into RichText.

```json
{"title":"Vitals","items":[
  {"label":"Element","value":"Electro"},
  {"label":"Weapon","value":"Catalyst","href":"/weapons"}]}
```

`items[].href` optional → wraps the value in an anchor.
Styles: `editorial` (default) · `tech-modern` · `card-grid` · `spec` · `print` · `compact`.
**Use `spec`** — closest to a stat block.

### `STATS_STRIP` — the ATK / CRIT / ER band

```json
{"cells":[{"value":"2,304","unit":"ATK","label":"Base","highlight":false}]}
```

**`value` is a string, not a number.** Styles: `default` · `editorial` · `card` · `neon` · `outline`.

### `STATS_CARD` — a build summary card

```json
{"tag":"BUILD","title":"Varesa","stats":[
  {"value":"2,304","label":"ATK"},{"value":"44.9%","label":"CRIT Rate"}],
 "features":[{"text":"5 pieces, 5 sets — no set bonus"}]}
```

`stats` required, `features` optional checklist.
Styles: `default` · `panel` · `ticker` · `neon` · `outline`.

### `LIST` — rosters, artifact slots, and stepped sequences

The most flexible type, and the workhorse for this migration.

```json
{"title":"Team","items":[
  {"label":"Furina","value":"Hydro, support DPS","meta":"C0 · Lv 27",
   "tags":["Hydro","5★"]}]}
```

Per item, all optional: `value` `href` `prefix` (big accent, e.g. a tier number)
`prefixSub` `meta` (mono sub-label) `tags[]`.

Styles: `default` · `facts` · `inline` · `cases` · `paper-grid` · `checklist` ·
`timeline` · `numbered` · `cards` · `newspaper` · `tasks`.

### `SECTION_HEADING`

```json
{"eyebrow":"§ 01 · Vitals","heading":"Character vitals",
 "subtitle":"Read 12 Nov 2026","align":"left"}
```

`heading` required, renders as the `<h2>`.
Styles: `editorial` · `tech-modern` · `centered-marquee` · `eyebrow-rule` ·
`banner` · `magazine` · `inline-prefix`.

### `FAQ_ACCORDION` — the correction blocks

```json
{"title":"Corrections","rows":[
  {"question":"Does Swirl ignore CRIT?","answer":"No — her payload crits."}],
 "mode":"single"}
```

**`answer` is plain text, not HTML.** Native `<details>/<summary>`.
`mode`: `single` (default) | `multi`. Styles: `default` · `bordered` · `card` · `minimal`.

### `FEATURE_GRID` — team cards on an index page

Hosted via `_MarketingPageModules/wrappers.tsx`, whose interface is **narrower
than the component's**. Two gotchas:

```json
{"features":[{"key":"varesa","title":"Varesa Electro-Charged",
  "description":"Varesa · Furina · Kachina · Sucrose"}],"columns":3}
```

- **`key` is required** per card.
- **`icon` is `ReactNode` — not authorable from JSON. Omit it.**
- **`columns` is typed `2|3` in the host** although the component accepts up to
  5. Stay with 2 or 3; 4 passes at runtime through an untyped cast but is
  outside the contract.

### `RICH_TEXT` — fallback only

```json
{"value":"<table>…</table>"}
```

Sanitised by DOMPurify: tables, `class`, `id`, `data-*`, inline `style`,
`<details>`, `https:` images all survive. `<script>`, `<style>`, `<iframe>` and
inline `<svg>` are stripped. `colspan`/`rowspan` are stripped on flux until the
sanitizer fix deploys.

## Do not use `TIMELINE`

It is **not** a generic timeline — it is a CV timeline, and `entries[]`
requires `start`, `end`, `company` and `role`. Forcing roadmap tiers or
ascension steps into `company`/`role` reads badly in the DOM and pollutes the
anchor registry.

**Use `LIST` with `style: "timeline"`** (vertical rail with dots) or
`style: "numbered"` (oversized outlined numerals).

## Mapping for this project

| Local page | Modules |
|---|---|
| Character build | `SECTION_HEADING` + `KEY_VALUE_DOSSIER` (`spec`) + `STATS_STRIP` + `LIST` (artifact slots) + `FAQ_ACCORDION` (corrections) |
| Teams index | `SECTION_HEADING` + `FEATURE_GRID` (`columns: 2`) |
| One team | `SECTION_HEADING` + `LIST` (roster, `cards`) + `KEY_VALUE_DOSSIER` (ward profile) |
| Character roadmap | `SECTION_HEADING` + `LIST` (`numbered`, `prefix` = tier) |
| Enemy coverage | `SECTION_HEADING` + `LIST` (`facts`) |

Everything above is generated from `src/data/characters.ts` and `teams.ts`, so
a correction still lands in one place.
