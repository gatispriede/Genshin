# Where to look things up

Which source answers which question, and how to actually reach it. Built from
what worked and what failed across this project.

---

## The routing table

| Question | Go here | Notes |
|---|---|---|
| Item source, cost, threshold, totals | **Fandom wiki** | The authority. Has exact tables. |
| Character build, rotation, ER needs | **KeqingMains** | Theorycrafted, versioned, states its own uncertainty |
| "Where is X" — anything positional | **HoYoLAB interactive map** | Real pin data, filterable layers |
| What this account actually has | **Battle Chronicle** | Live. Characters, gear, exploration %, counts |
| Quest walkthroughs, puzzle solutions | **Game8 / GameWith** | Practical, screenshot-heavy, quick to scan |
| Active redemption codes | **Two code APIs, cross-checked** | One source alone gave a 50% failure rate |
| TCG card text and costs | **Fandom card list sub-pages** | Split by Event / Support / Equipment |

---

## Fandom wiki

**`https://genshin-impact.fandom.com/wiki/<Page>`**

The single most reliable source for hard numbers. Reputation thresholds, dice
costs, quest lists, item acquisition — all exact.

> ⚠️ **WebFetch gets HTTP 402 Payment Required.** Every time. Don't retry it.
> Use the browser and pull text out of the DOM instead.

Pages that proved useful:
- `/Reputation` — full level/EXP tables per region, quest EXP totals
- `/World_Quest/List` — every quest, grouped by region
- `/Genius_Invokation_TCG/Card_List/Event_Cards` (also `/Support_Cards`,
  `/Equipment_Cards`) — the costs are in tab-separated innerText
- `/<Item_Name>` — the "Obtain" section settles vendor-vs-craft questions

Extraction pattern that works — the tables render as tab-separated lines:

```js
const t = document.querySelector('main').innerText.split('\n');
for (const line of t) {
  const cells = line.split('\t').map(s => s.trim()).filter(Boolean);
  // cells[0] = name, then type / cost / description
}
```

Equipment cards span **two** lines: name on the first, weapon type and cost on
the second.

---

## HoYoLAB interactive map

**`https://act.hoyolab.com/ys/app/interactive-map/index.html?lang=en-us`**

Best source for anything positional, and the base image for every map page.

**Search the pin categories before concluding a layer doesn't exist.** The
sidebar shows a short list; the search box reaches far more.

Layers confirmed to exist:
- **World Quest** — 576 pins across Teyvat, clustered with counts. Found under
  *Experience*, searchable as "quest"
- **Statue of The Seven**, **Domain**, **Teleportation Points**, chests,
  specialities, ores, fishing

Confirmed **not** to exist: any Genius Invokation TCG layer.

URL controls the view directly, which beats clicking:
```
#/map/2?shown_types=<ids>&center=<x>,<y>&zoom=<n>
```
Region switch is the chip at top-left. Zoom roughly −3 (continent) to +1.5
(city blocks).

Practical notes:
- Collapse the sidebar with the chevron before screenshotting
- The cookie banner can be hidden with JS rather than accepting it
- Clicking a pin opens a card with the real name — use it to confirm identity
  rather than guessing from the icon
- **Pins are teardrops**: the point is the location, so annotations need to sit
  ~4% of image height above the visual centre

---

## Battle Chronicle

**`https://act.hoyolab.com/app/community-game-records-sea/index.html?...#/ys`**

Needs their logged-in Chrome. Direct deep-links to SPA routes render blank —
go via the HoYoLAB profile and click the Genshin card, which opens the right
URL with the user id attached.

Gives: roster with levels and constellations, **per-slot equipped gear with
substats**, per-region exploration %, oculi counts, chest counts, waypoints,
achievements, Spiral Abyss.

The character detail panel reads cleanly out of the DOM:
```js
const all = [...document.querySelectorAll('div')];
const c = all.filter(d => d.innerText?.includes('Character Stats')
                       && d.innerText.includes('Artifacts'));
c[c.length - 1].innerText;
```
Click each portrait in the "My Characters" carousel to switch. Intercepting
`fetch` for `character/detail` also works but the hook dies on navigation.

---

## Redemption codes

**Never trust one list.** Aggregators keep expired codes, and livestream codes
die within 24–48 hours.

```bash
curl -s https://api.ennead.cc/codes/genshin        # broader, keeps stale entries
curl -s "https://hoyo-codes.seria.moe/codes?game=genshin"   # tighter, status field
```

Cross-reference both, then sanity-check against a tracker page that publishes a
"last checked" timestamp. A code in only one source is probably dead.

The big ones (100 Primogems) only ever come from version livestreams and expire
same-day. Everything else is small and long-lived.

---

## Fandom's API — the fast path (added 30 Oct 2026)

The 402 only blocks **article HTML**. `api.php` answers `curl` with a
User-Agent, which means bulk extraction belongs in a script, not the browser.

```bash
curl -s -H "User-Agent: Mozilla/5.0" \
  "https://genshin-impact.fandom.com/api.php?action=query&list=categorymembers\
&cmtitle=Category:Liyue%20Quests%20with%20Reputation%20Reward&cmlimit=500&format=json"
```

Then `prop=revisions&rvprop=content&rvslots=main&titles=A|B|C` (20 at a time)
for wikitext. The `{{Quest Infobox}}` holds `startLocation`, `area`, `subarea`,
`characters`, `type`, `group`, `rep`. Parse it **brace-balanced** — a naive
slice to the first `}}` breaks on nested templates and silently returns nulls.

**Categories beat list pages.** A category is emitted by each page's own
infobox and cannot drift. A prose "X Reputation EXP" page is typed by an editor
and goes stale. Always prefer `Category:<Region> Quests with Reputation Reward`.

Working implementation: `tools/fetch-reputation-quests.py`.

## Sources checked and rejected

**genshindev/api** (`genshin.jmp.blue`) — endpoints are artifacts, boss,
characters, consumables, domains, elements, enemies, materials, nations,
weapons. **No quest data**, and last pushed **2026-03-31**. Project Amber
covers the overlap and is current. Keep only as a fallback for domain/enemy
data, and re-check its freshness before trusting a number from it.

**The game install** (`D:\Genshin Impact game`) — assets are encrypted `.blk`
bundles, and **account progress is server-side**. Nothing readable for what the
player has done.

## Things that don't work

- `WebFetch` on Fandom → 402, always
- `WebFetch` on prydwen.gg → 403
- `api.hakush.in`, `codes.hoyoverse.workers.dev`, `api.gacha.codes` → dead
- HoYoLAB's own wiki (`wiki.hoyolab.com`) renders empty to WebFetch
- Search engines are **stale on recent patches** — one insisted Snezhnaya isn't
  playable while the user's own account reported 19 Cryoculi. **The account
  always wins over a search result.**
