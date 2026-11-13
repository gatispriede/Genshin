# `MAP_ANNOTATED` — answers to the eight open questions

Companion to Item 2 in [cms-migration-plan.md](cms-migration-plan.md). Every
value below is read from `app/annotate.js`, `styles/map.css` and
`fishing-spots-map.html`, not recalled.

## 1. `image.src` is a resolved URL

Match the existing convention — whatever `image.upload` returns. I will emit
URLs, not ids. Don't invent a third convention for one module.

## 2. Colour source: bake these literal values

Agreed with your reasoning — a map legend is data, not decoration. From
`styles/map.css:13-19`:

| Role | Hex | Meaning |
|---|---|---|
| `do-now` | `#ff5a3c` | act on this first |
| `goal` | `#18a558` | the objective |
| `hub` | `#2f9fed` | waypoint / teleport |
| `farm` | `#3fb6e0` | resource spot |
| `best` | `#ffb020` | best option of a group |
| `warn` | `#ffc63f` | caution |
| `off` | `#3a4454` | inactive / don't touch |

Two roles override the label colour for contrast on light fills:
`farm` uses `#06222e`, `best` uses `#2a1a00` (`map.css:76-77`). `off` also
takes `color: #8e99a8` and `border-color: #55606f`.

## 3. Tags are always visible, and collisions are the author's problem

Always-on. `buildTag` appends a positioned element unconditionally
(`annotate.js:42`); there is no hover state anywhere in the module.

**No automatic collision handling, and please don't add any.** Positions are
hand-tuned percentages chosen so labels don't overlap — in
`fishing-spots-map.html` the pins sit at y-values of 11.5, 23, 40 and 89
precisely for that reason. If two labels collide the fix is to move a marker in
the content, not for the renderer to reflow. Auto-placement would silently
move a pin off the thing it points at, which is worse than an overlap.

## 4. `title` is a hover tooltip

`annotate.js:66` sets `el.title = m.title` — the native browser tooltip,
nothing more. It is rare in practice; `tag` carries the real label. Treat it as
optional, and feel free to also expose it to assistive tech.

## 5. `dot` kinds differ only by colour, and are never labelled

Same shape and size, different fill (`map.css:143-144`):

- `chest` — `#4ade5a` with a `0 0 7px rgba(74,222,90,.95)` glow
- `wp` — `#ffd666` with a `0 0 8px rgba(255,214,102,.9)` glow

`buildDot` sets no text content, and the `dots()` helper only passes `x` and
`y` (`annotate.js:47-56`). Dots are for scatter — "every chest in this area" —
where individual labels would be noise.

## 6. Accessibility: your default is right

Image `alt`, non-interactive markers with an accessible name from `tag` /
`title`, legend as a real list. A screen reader getting the marker inventory as
text is a better experience than the original gives today.

**No keyboard-focusable markers.** Nothing is clickable — there is no
click-through in scope — so focus stops would add tab stops that lead nowhere.

## 7. Small screens: drop the labels, keep the pins

Your instinct is right and it is a real problem; 40 labels at 375px is
unreadable. Below a breakpoint, render bare pins and let the legend carry the
meaning. The pin's `label` ("1", "2", "★") stays — it is one or two characters
and remains legible — so a reader can match pin to legend entry.

Note the two size modifiers while you are there (`map.css:70-71`):
`.pin.sm` is 26px/11px font, `.pin.lg` is 38px/16px. `pulse` adds an animated
ring via `.pin.pulse::after` and `@keyframes pin-ring`.

## 8. Fixture — `fishing-spots-map.html`, converted

**It has two maps, not one.** That makes it a better acceptance test than
intended: it exercises two `MAP_ANNOTATED` modules on a single page.

There is no `drawKey` call on this page, so **`legend` is absent** — which also
tests that the legend is genuinely optional.

### Module 1 — Mondstadt

```json
{
  "image": { "src": "<uploaded mondstadt-map.webp>", "alt": "Starfell Valley map" },
  "markers": [
    { "kind": "pin", "x": 48.8, "y": 11.5, "role": "best", "size": "lg",
      "label": "★", "pulse": true,
      "tag": "★ Stormbearer lake — most fish types in Mondstadt" },
    { "kind": "pin", "x": 20.5, "y": 23,   "role": "farm", "label": "1",
      "tag": "Cider Lake — 2 spots" },
    { "kind": "pin", "x": 39,   "y": 40,   "role": "farm", "label": "2",
      "tag": "Whispering Woods" },
    { "kind": "pin", "x": 46.5, "y": 89,   "role": "farm", "label": "3",
      "tag": "South of Windrise" }
  ]
}
```

### Module 2 — Liyue

```json
{
  "image": { "src": "<uploaded bishui-map.webp>", "alt": "Bishui Plain map" },
  "markers": [
    { "kind": "pin", "x": 43.1, "y": 32,   "role": "best", "size": "lg",
      "label": "★", "pulse": true,
      "tag": "★ Qingce Village — 3 spots clustered" },
    { "kind": "pin", "x": 57.2, "y": 61,   "role": "farm", "label": "1",
      "tag": "Dihua Marsh" },
    { "kind": "pin", "x": 55,   "y": 79,   "role": "farm", "label": "2",
      "tag": "West of Wangshu Inn" },
    { "kind": "pin", "x": 64.4, "y": 49.5, "role": "farm", "label": "3",
      "tag": "Lake south of Stone Gate" },
    { "kind": "pin", "x": 82.4, "y": 57.5, "role": "farm", "label": "4",
      "tag": "Island east of Bishui Plain — 2 spots" },
    { "kind": "pin", "x": 3,    "y": 62.4, "role": "farm", "label": "5",
      "tag": "Mt. Aocang — Abiding Angelfish" }
  ]
}
```

Note `x: 3` on the last marker — a legitimate near-edge position. Whatever the
renderer does about labels running off the left edge, it must not clamp the
**pin**; the pin is pointing at a real place on the image.

## Not checked

The base `.pin` width/height (the value `.sm` and `.lg` override) — I read the
modifiers but not the base rule. Read `styles/map.css:61` directly rather than
taking a number from me.
