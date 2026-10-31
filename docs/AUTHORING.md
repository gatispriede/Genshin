# Making a new map page

The recipe. Should take about two minutes once the image is in `assets/`.

---

## 1 · Get the map image

**From the wiki** — Fandom blocks scripted page requests, so grab the URL in a browser
first. Open `https://genshin-impact.fandom.com/wiki/<Region_Name>` and run in the console:

```js
Array.from(document.images)
  .map(i => (i.dataset.src || i.src || '').split('/revision')[0])
  .find(s => /Map\.png$/.test(s))
```

Then:

```bash
python tools/fetch-map.py --url "<paste>" --name dragonspine
```

It saves to `assets/` and prints the pixel size plus the percent conversion.

**From a screenshot** — usually better. The player's own map shows their real fog,
unlocked waypoints and position. Just drop it in `assets/` and read its size:

```bash
python -c "import struct;d=open('assets/foo.webp','rb').read(40);print(int.from_bytes(d[24:27],'little')+1, int.from_bytes(d[27:30],'little')+1)"
```

---

## 2 · Work out marker positions

Positions are **percentages**, so the page stays responsive.

```
x% = pixel_x / image_width  * 100
y% = pixel_y / image_height * 100
```

Read the pixel coordinates straight off the image. Landmark labels are the easiest
anchors — put the pin on the label, not on empty terrain.

---

## 3 · Write the page

```html
<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Thing — location</title>
<link rel="stylesheet" href="styles/map.css">
</head><body>
<div class="wrap">

  <h1>Thing</h1>
  <p class="sub">One line of context.</p>

  <div class="map-wrap" id="map" data-map="assets/foo.webp" data-alt="Foo region"></div>

  <div class="bar key"><b>The one thing that matters.</b></div>

  <div class="rows">
    <div class="row"><div class="num">1</div>
      <div><b>Step name</b><span>What to do.</span></div></div>
  </div>

</div>
<script type="module">
  import { drawMap } from "./app/annotate.js";
  drawMap("#map", [
    { x: 48, y: 31, role: "do-now", label: "1",  tag: "Start here" },
    { x: 70, y: 66, role: "goal",   label: "★", tag: "Objective", pulse: true },
    { x: 55, y: 50, role: "hub",    label: "W", tag: "Waypoint", size: "sm" },
    { zone: true, x: 37, y: 20, w: 22, h: 30, role: "farm", tag: "Approximate area" }
  ]);
</script>
</body></html>
```

Pages that use `annotate.js` **need a server** — run `tools/serve.cmd`. If you'd rather the
page open by double-clicking, skip the script and hand-write the `.pin` / `.tag` divs with
inline `left` / `top` percentages instead.

---

## 4 · Link it from `index.html`

Add a card in the Maps grid. Keep the one-line description concrete.

---

## Marker roles

Pick by **meaning**, so colour stays consistent across every page.

| Role | Colour | Use for |
|---|---|---|
| `do-now` | red | the thing to act on first, numbered steps |
| `goal` | green | the objective / destination |
| `hub` | blue | waypoints, statues, teleport anchors |
| `farm` | cyan | resource nodes, fishing, ore |
| `best` | gold | the best option among several |
| `off` | grey | inactive, "don't touch this one" |

Modifiers: `size: "sm" | "lg"`, and `pulse: true` — **one pulsing pin per page**, on the
single most important marker.

Zones use `{ zone: true, x, y, w, h }` and are ellipses by default; add `rect: true` for a
rounded box. Always label them as approximate.

---

## House rules

- **Mark zones as approximate** when you can't verify an exact spot. Don't imply precision
  you don't have.
- **Say when something is off-view** rather than guessing a position — use `.offmap`.
- **Keep prose short.** The map carries the answer; the text is a caption.
- **Screenshot the rendered page and show it inline.** Links alone often go unopened.
- **Flag what you couldn't verify** in a `.note` at the bottom.

---

## Callout classes

| Class | Use |
|---|---|
| `.bar.key` | the headline fact, red border |
| `.bar.good` | what works / what to bring |
| `.bar.bad` | what will waste your time |
| `.bar.warn` | caution, prerequisites |
| `.note` | detail, caveats, sources |
| `.legend` | a row of colour swatch + label pairs (`<span><i style="background:var(--farm)"></i>Farm spots</span>`) |

Don't name a new class `.key` — that's the `.bar` modifier above. The colour legend
is `.legend` for exactly that reason.
