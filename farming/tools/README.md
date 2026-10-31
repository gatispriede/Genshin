# Building a map for anything else

The Saurian map isn't special. `build-map-data.mjs` will draw **any** category
the official map tracks — reputation-quest turn-ins, oculi, chests, a specific
enemy, a local specialty — onto the real terrain, with the dense spots circled
and the best few joined by arrows.

## 1. Find what you want to map

```bash
node tools/build-map-data.mjs --labels
```

Prints every category with its id, grouped the way the official map groups them:
Waypoints, Special Items, Chests, Local Specialties, Experience, Enemies,
Inventory / Materials, Fishing, Ores, Animals, Wood, Landmarks, Investigation.

Filter it when the list is long:

```bash
node tools/build-map-data.mjs --labels quest
```

Useful ids found so far:

| id  | What it is |
| --- | --- |
| 603 | Natlan Saurians (the current map) |
| 52  | World Quests |
| 3   | Teleport Waypoint |
| 2   | Statue of The Seven |
| 154 | Domain |
| 17  | Common Chest |

### Reputation quests aren't mappable, and that isn't a gap in this tool

Checked against all **793** labels: there is no Reputation, Bounty, Request or
Commission category. The one near-miss, "Bounty Token" (733), is a collectible
in the Experience group, not the reputation bounty system. Investigation holds
exactly two things — Mysterious Conch and Tumbleweed.

The reason is structural: reputation **Bounties and Requests rotate weekly and
spawn from a pool per region**, so they have no fixed coordinates to pin. The
official map only carries static world features. Nothing here can recover them,
and neither can any other map.

What *is* available per region, if that's the shape you wanted:

| what | how |
| --- | --- |
| Shrines of Depths | one label per region (8, 9, 212, 411, 509, 577, 703, 835) |
| Mora chests | one label per region (129, 366, 596, 723, 819, 838, …) |
| Offering trees | Frostbearing Tree 158, Sacred Sakura 316, Tree of Dreams 414 |
| World Quests | 52, all regions in one dataset |

Check `--labels` against the current game version rather than trusting this
table — ids move between patches.

## 2. Build it

```bash
node tools/build-map-data.mjs --label 52 --out features/map/quests.data.js --global QUEST_MAP
```

| flag | default | meaning |
| --- | --- | --- |
| `--label` | `603` | which category to pin |
| `--out` | `features/map/map.data.js` | where to write, relative to `guide/` |
| `--global` | `SAURIAN_MAP` | the `window.<name>` the page reads |
| `--level` | `1` | tile sharpness: `1` sharpest, `3` coarsest |
| `--map` | `2` | map id — `2` is Teyvat, others are sub-maps like Enkanomiya |

The tile window is cropped to whatever you asked for, so a Natlan-only category
pulls Natlan-sized tiles, not all of Teyvat.

**Pick `--level` by how much ground the category covers.** Each step coarser
quarters the tile count. Natlan Saurians at `--level 1` is 176 tiles; world
quests span the whole continent, and the same level would pull **1287**, so
they're built at `--level 3` for 90. If the script reports tiles in the
four figures, you want a coarser level.

## 3. Show it

Copy `quests.html` — it's the worked example. The map component reads whichever
global the host element names, so there is no code to edit:

```html
<div class="smap" id="map-canvas"
     data-source="QUEST_MAP"
     data-noun="quests"
     data-names-from="0.5"></div>
...
<script src="features/map/quests.data.js"></script>
<script src="features/map/map.js"></script>
```

| attribute | default | meaning |
| --- | --- | --- |
| `data-source` | `SAURIAN_MAP` | the global holding your dataset |
| `data-noun` | `Saurians` | what the status line counts |
| `data-names-from` | `0.25` | zoom at which place names appear |
| `data-route-stops` | `6` | how many clusters the arrowed route joins |
| `data-labelled` | `12` | how many circles get a number badge |
| `data-max-zoom` | `4` | zoom ceiling; past 1x the basemap upscales |

Then add it to `PAGES` in `shared/nav.js` and it appears in the nav everywhere.
Clustering, circles, arrows, place names, teleport waypoints, per-day cleared
tracking and `?place=` / `?at=x,y` deep links all come for free.

Every dataset also carries **teleport waypoints, Statues of the Seven and
domains** inside its window, and each cluster records how far it sits from the
nearest teleport — so a circle is reachable, not just findable.

## Things that will bite you

- **Use `detail_v2` from `/v1/map/list`.** The older `/v1/map/info` still serves
  a 2024-04-15 basemap that predates Natlan, so pins land on empty black canvas.
  The script asserts this, but if you write your own, don't repeat it.
- **Pin pixel = `origin + position`, no padding term.** `detail_v2.origin` is
  already in the widened canvas.
- **Tile levels run backwards from zoom.** `N1` is the sharpest (half scale),
  `N3` the coarsest. There is no `N0`.
- **The `--labels` ids change between game versions.** Re-run discovery after
  a patch rather than hardcoding.
- Area names come from the anchor list and don't always match community guides
  — the map says "Children of Echoes", GameWith says "Children of the Echoes".
  The routes page matches on significant words only to paper over this.
