# Tyrant's Fang farming plan

A small static site about one thing: getting twelve Tyrant's Fang out of the
ground, plus the live map tooling built along the way.

```bash
python -m http.server 5173 --directory .
```

Or use the `genshin-guide` entry in `../.claude/launch.json`.

## There is a second, older Genshin project

**`D:\Work\Genshin impact project`** — 34 pages of notes, 450+ images, built
earlier. It covers far more ground than this one: builds, puzzles, collectibles,
oculi tracking, and the reputation work.

They are not duplicates, and neither replaces the other:

| | this project | the notes project |
| --- | --- | --- |
| maps | **live**, built from the official map API — pan, zoom, click to clear | **static screenshots** from the wiki, one per quest |
| covers | Natlan Saurians, world quest pins, any map category on demand | quests, builds, puzzles, collectibles, reputation |
| quest detail | pins only, and the official pins are **unnamed** | named quests with measured length and start-location maps |

**Go there, not here, for reputation quests.** Its `reputation-quests.html`
ranks 172 world quests shortest-first using measured objective counts and
dialogue length, and 147 of them carry a start-location map. This project's
`reputation.html` only holds the compass maths and points at it.

Come here for anything needing a *live* map of a whole category at once — that
is what `tools/build-map-data.mjs` does, and the notes project has no
equivalent.

## Layout

```
index.html        plan: best spot, planner, rules
map.html          946 Natlan Saurian spawns, clustered and routed
routes.html       16 written routes, each linking to its spot on the map
quests.html       576 world quest pins — the generator pointed elsewhere
reputation.html   compass unlock levels and weeks-to-go per region
field.html        observed in game, including spawns no guide lists

shared/           nav, colophon, base styles — one source of truth each
features/         one folder per concern, owning its data, JS and CSS
tools/            build-map-data.mjs + README on mapping anything else
```

Data files under `features/*/\*.data.js` are generated — don't hand-edit them.
Regenerate with `node tools/build-map-data.mjs`; see `tools/README.md`.
