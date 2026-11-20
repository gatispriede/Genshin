/* "Mark as done" for checklist pages: a tick on each card, and its map pins dim.
 *
 *   <div class="map-wrap" data-track-done …></div>     opt the page in
 *   <div class="stop" id="q7">…</div>                    a card, keyed by its id
 *   drawMap() pins carry data-done-key = their layer      ("q7": same key)
 *
 *   import { trackDone } from "./app/done.js";
 *   trackDone();                                          after the drawMap() calls
 *
 * Storage is the flux CMS's own format (ui/client/lib/doneState), so local
 * pages and flux read progress the same way:
 *   key    "cms:done:<pathname>"   (no query or hash, no trailing slash, "" -> "/")
 *   value  JSON array of folded keys, sorted; removed entirely when empty
 *   cap    500 keys a page: a write past it is refused, nothing is evicted
 *   sync   window CustomEvent "cms:done-state" {page, done} in this tab,
 *          the native "storage" event across tabs
 * `store` is the seam where a server-backed version for logged-in visitors goes.
 */

const CAP = 500;
const EVENT = "cms:done-state";

/** The CMS's key folding: trim, lowercase, runs of other characters -> "-". */
export const fold = (key) =>
  String(key).trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");

const page = location.pathname.replace(/\/+$/, "") || "/";
const storageKey = `cms:done:${page}`;

export const store = {
  /** The set of done keys on this page. A missing entry and [] are the same. */
  list() {
    try { return new Set(JSON.parse(localStorage.getItem(storageKey) || "[]").map(fold)); }
    catch { return new Set(); }
  },
  /** false when the write was refused (the page is at the cap). */
  set(key, done) {
    const keys = store.list();
    const k = fold(key);
    if (done && !keys.has(k) && keys.size >= CAP) return false;
    if (done) keys.add(k); else keys.delete(k);
    const sorted = [...keys].sort();
    if (sorted.length) localStorage.setItem(storageKey, JSON.stringify(sorted));
    else localStorage.removeItem(storageKey);
    dispatchEvent(new CustomEvent(EVENT, { detail: { page, done: sorted } }));
    return true;
  },
};

export function trackDone() {
  if (!document.querySelector("[data-track-done]")) return;
  const cards = [...document.querySelectorAll(".stop[id]")];
  if (!cards.length) return;

  const count = document.createElement("p");
  count.className = "done-count";
  cards[0].before(count);

  const show = () => {
    const done = store.list();
    let n = 0;
    for (const card of cards) {
      const on = done.has(fold(card.id));
      n += on;
      card.classList.toggle("done", on);
      card.querySelector(".done-toggle input").checked = on;
    }
    for (const pin of document.querySelectorAll("[data-done-key]")) {
      pin.classList.toggle("done", done.has(fold(pin.dataset.doneKey)));
    }
    count.textContent = `${n} of ${cards.length} done`;
  };

  for (const card of cards) {
    const label = document.createElement("label");
    label.className = "done-toggle";
    label.innerHTML = '<input type="checkbox"> Done';
    label.querySelector("input").addEventListener("change", (e) => {
      if (!store.set(card.id, e.target.checked)) e.target.checked = false;
      show();
    });
    card.prepend(label);
  }
  addEventListener(EVENT, (e) => { if (e.detail?.page === page) show(); });
  addEventListener("storage", (e) => { if (e.key === storageKey) show(); });
  show();
}
