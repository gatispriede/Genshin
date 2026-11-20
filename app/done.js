/* "Mark as done" for checklist pages: a tick on each card, and its map pins dim.
 *
 *   <div class="map-wrap" data-track-done …></div>     opt the page in
 *   <div class="stop" id="q7">…</div>                    a card, keyed by its id
 *   drawMap() pins carry data-done-key = their layer      ("q7": same key)
 *
 *   import { trackDone } from "./app/done.js";
 *   trackDone();                                          after the drawMap() calls
 *
 * State is per page in localStorage under "done:<page>:<key>", the same key
 * shape the flux CHECKLIST / MAP_ANNOTATED modules use. Storage sits behind
 * `store`, so a server-backed version for logged-in visitors can replace it.
 */

const page = location.pathname.split("/").pop().replace(/\.html$/, "") || "index";

export const store = {
  get: (key) => localStorage.getItem(`done:${page}:${key}`) === "1",
  set: (key, done) => done ? localStorage.setItem(`done:${page}:${key}`, "1")
                           : localStorage.removeItem(`done:${page}:${key}`),
};

export function trackDone() {
  if (!document.querySelector("[data-track-done]")) return;
  const cards = [...document.querySelectorAll(".stop[id]")];
  if (!cards.length) return;

  const count = document.createElement("p");
  count.className = "done-count";
  cards[0].before(count);

  const show = () => {
    let n = 0;
    for (const card of cards) {
      const done = store.get(card.id);
      n += done;
      card.classList.toggle("done", done);
      card.querySelector(".done-toggle input").checked = done;
      for (const pin of document.querySelectorAll(`[data-done-key="${card.id}"]`)) pin.classList.toggle("done", done);
    }
    count.textContent = `${n} of ${cards.length} done`;
  };

  for (const card of cards) {
    const label = document.createElement("label");
    label.className = "done-toggle";
    label.innerHTML = '<input type="checkbox"> Done';
    label.querySelector("input").addEventListener("change", (e) => {
      store.set(card.id, e.target.checked);
      show();
    });
    card.prepend(label);
  }
  // Another tab ticked something: stay in step.
  addEventListener("storage", (e) => { if (e.key?.startsWith(`done:${page}:`)) show(); });
  show();
}
