/* Icons for artifact sets, weapons and characters, resolved from the data
   already in reference/data — no hand-written image URLs anywhere.

   Ambr serves them at:
     artifacts  https://gi.yatta.moe/assets/UI/reliquary/<icon>.png
     weapons    https://gi.yatta.moe/assets/UI/<icon>.png
     characters https://gi.yatta.moe/assets/UI/<icon>.png

   Three ways to use it:

     <span data-set="Golden Troupe">Golden Troupe</span>   inline set icon
     <span data-char="Skirk">Skirk</span>                  inline portrait
     <div class="setgrid" data-sets="Golden Troupe, Blizzard Strayer"></div>

   The grid also prints each set's 2pc and 4pc effects, straight from the
   game data, so a page can never quote a stale bonus. */
(function () {
  'use strict';

  var AMBR = 'https://gi.yatta.moe/assets/UI/';
  var need = document.querySelector('[data-set], [data-char], .setgrid');
  if (!need) return;

  function load(path) {
    return fetch(path, { cache: 'no-cache' }).then(function (r) { return r.json(); });
  }

  function byName(items) {
    var out = {};
    Object.keys(items).forEach(function (k) { out[items[k].name] = items[k]; });
    return out;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  Promise.all([
    load('reference/data/artifact_sets.json'),
    load('reference/data/_avatars_index.json')
  ]).then(function (res) {
    var sets = byName(res[0].data.items);
    var chars = byName(res[1].data.items);

    // ── inline icons ────────────────────────────────────────────────
    document.querySelectorAll('[data-set]').forEach(function (el) {
      var s = sets[el.dataset.set];
      if (!s) return;
      el.classList.add('ico');
      el.insertAdjacentHTML('afterbegin',
        '<img src="' + AMBR + 'reliquary/' + s.icon + '.png" alt="">');
    });

    document.querySelectorAll('[data-char]').forEach(function (el) {
      var c = chars[el.dataset.char];
      if (!c) return;
      el.classList.add('ico', 'ico--char');
      el.insertAdjacentHTML('afterbegin',
        '<img src="' + AMBR + c.icon + '.png" alt="">');
    });

    // ── set grids ───────────────────────────────────────────────────
    document.querySelectorAll('.setgrid').forEach(function (grid) {
      /* ';' separates entries, so a note can contain commas. */
      var names = (grid.dataset.sets || '').split(';')
        .map(function (n) { return n.trim(); }).filter(Boolean);

      grid.innerHTML = names.map(function (name) {
        var note = '';
        var m = name.match(/^(.*?)\s*\|\s*(.*)$/);   // "Set name | why it's here"
        if (m) { name = m[1].trim(); note = m[2]; }

        var s = sets[name];
        if (!s) {
          return '<div class="gear__card"><div><b>' + esc(name) + '</b>' +
            '<p>Not in the local set data — check the name.</p></div></div>';
        }
        var fx = Object.keys(s.affixList).map(function (k) { return s.affixList[k]; });
        var tiers = (s.levelList || []).join('–') + '★';

        return '<div class="gear__card">' +
          '<img src="' + AMBR + 'reliquary/' + s.icon + '.png" alt="">' +
          '<div><b>' + esc(s.name) +
          ' <span class="gear__tag">' + tiers + '</span></b>' +
          (fx[0] ? '<p class="two">2pc — ' + esc(fx[0]) + '</p>' : '') +
          (fx[1] ? '<p class="four">4pc — ' + esc(fx[1]) + '</p>' : '') +
          (note ? '<p>' + esc(note) + '</p>' : '') +
          '</div></div>';
      }).join('');
    });
  }).catch(function () {
    document.querySelectorAll('.setgrid').forEach(function (g) {
      g.innerHTML = '<div class="note">Could not read the artifact or avatar data.</div>';
    });
  });
})();
