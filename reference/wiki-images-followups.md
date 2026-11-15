# Wiki images — review follow-ups

Review of commit `969fbbe` ("Load quest-map pictures straight from the wiki"),
15 Nov 2026. The pages work locally (391/391 pictures at full size). On flux they
wait on the CMS sanitizer keeping `referrerpolicy` (asked of the CMS local thread
the same day). Nothing below is done yet.

## To fix (in order)

1. **Thumbnails download full-size originals.**
   - The reputation page shows 103 thumbnails at 64×44, each pulling the wiki's
     1920–2560px original: about 89 KB each, ~9.5 MB per page view.
   - Appending `/scale-to-width-down/160` after `/revision/latest` returns ~9 KB
     each (measured), 10× less.
   - The quest-map page figures have the same problem at a larger display width.
   - Fix: `wiki_image.src(shot, width)` adds the scaling. Thumbs use ~160,
     figures their CSS display width ×2.
   - Done means: the reputation page's images total under 1.5 MB.

2. **The fallback breaks without a warning.**
   - `wiki_image.src()` returns `assets/quest-maps/<file>` when an entry has no
     `url`. That folder is gitignored and absent on flux, so the picture is
     broken and nothing reports it.
   - Fix: raise instead, naming the quest and the file.
   - Done means: a builder run on an entry without `url` exits non-zero.

3. **The no-referrer attribute is written out by hand in four places.**
   - `NO_REFERRER` in `tools/wiki_image.py` is unused. The attribute is typed out
     in `build-reputation-pages.py`, `build-quest-maps-page.py`, `app/live-map.js`
     and `arsenal-keys.html`.
   - Fix: add `wiki_image.img_tag(shot, alt, width, lazy=True)`, which writes the
     whole `<img>`, and use it in both builders. `live-map.js` and the hand-written
     `arsenal-keys.html` keep a comment pointing at it.

4. **Messy imports in `tools/build-quest-maps-page.py`.**
   - It has `import os as _os` / `import sys as _sys` above the existing
     `import os` / `import sys`.
   - Fix: put the `sys.path.insert` after the normal imports, as the other two
     builders do.

5. **`tools/fetch-quest-maps.py` still downloads 102 MB that no page uses.**
   - Fix: record the URLs only by default, and put downloading behind
     `--download`.
   - Update the docstring, which still says it "Writes assets/quest-maps/*.png".

## Worth knowing (no change planned)

6. **All 391 pictures depend on the wiki's hotlink rule.** They load only because
   a request with no Referer gets the real file. If the wiki changes that, every
   picture becomes the 1,976-byte stand-in at once.
   - Fallback: upload copies to flux via `image.upload`.
   - Check now and then: fetch one URL with no Referer and expect more than
     2 KB back.

7. **`dist/` is a stale React build.** Its `quest-map.data.js` still has
   `imageBase: "assets/quest-maps/"`. It is gitignored; rebuild it before using it.

## Process lessons

- Browser checks must bypass cached responses (`fetch(..., {cache:'reload'})`).
  The first local check showed 33 false placeholders that were cached from before
  the attribute was added.
- On flux, push one page and verify it rendered before pushing the batch. All six
  went out before anyone saw that the sanitizer strips `referrerpolicy`. No harm
  this time: the stored content is correct.

## After the CMS fix lands

- On `/genshin-notes/maps/liyue-quests-start-maps`, all 105 images carry
  `referrerpolicy="no-referrer"` and none is 300×171.
- Repeat for the other five pages. No re-push should be needed.
