/* Imaginarium Theater cast, as faces rather than names.

   The whole point: you cannot tell Aino from Kachina from a list of words, and
   the game never shows you a name on the cast row. So this draws the portraits
   at the size you actually recognise them at, with the two things that decide
   the pick stamped on top — rarity and element.

   Portraits come from reference/data/_avatars_index.json (the same index the
   builds page uses), so rank and element are read from data, never a screenshot. */
(function () {
  'use strict';

  var mount = document.getElementById('theater');
  if (!mount) return;

  var CDN = 'https://gi.yatta.moe/assets/UI/';

  var TINT = {
    Hydro: '#4cc2ff', Electro: '#b18fff', Geo: '#e0a944',
    Cryo: '#9fe3f0', Pyro: '#ff7b4d', Anemo: '#5fd3b4', Dendro: '#8fd04b'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function portrait(c, extra) {
    var tint = TINT[c.element] || '#8899aa';
    return '<figure class="th__card th__card--r' + c.rank +
      (c.use ? ' is-' + c.use : '') + '">' +
      '<div class="th__shot">' +
        '<img src="' + CDN + esc(c.icon) + '.png" alt="' + esc(c.name) + '" loading="lazy">' +
        '<span class="th__el" style="background:' + tint + '">' + esc(c.element) + '</span>' +
        '<span class="th__rank">' + c.rank + '&#9733;</span>' +
      '</div>' +
      '<figcaption>' +
        '<b>' + esc(c.name) + '</b>' +
        (c.level ? '<span class="th__lv">Lv. ' + c.level + '</span>' : '') +
        (c.role ? '<span class="th__role">' + esc(c.role) + '</span>' : '') +
        (extra || '') +
      '</figcaption>' +
      '</figure>';
  }

  fetch('reference/data/theater.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(render)
    .catch(function () {
      mount.innerHTML = '<div class="note">Could not read ' +
        '<code>reference/data/theater.json</code>.</div>';
    });

  function render(d) {
    var field = d.cast.filter(function (c) { return c.use === 'act1'; });
    var save = d.cast.filter(function (c) { return c.use === 'save'; });

    mount.innerHTML =
      '<div class="bar key"><b>' + esc(d._season) + ' — ' + esc(d._elements) +
        '.</b> ' + esc(d._reactions) + '.<br>' + esc(d._rule) + '</div>' +

      '<h2>Act 1 — field these four</h2>' +
      '<p class="sub"><b>' + esc(d.act1.goal) + '.</b> ' + esc(d.act1.star) +
        ', against ' + esc(d.act1.enemies).toLowerCase() + '. ' +
        esc(d.act1.blessing) + '</p>' +
      '<div class="th__grid">' +
        field.map(function (c) {
          return portrait(c, '<span class="th__why">' + esc(c.why) + '</span>');
        }).join('') +
      '</div>' +

      '<h2>Bench these two — keep their Vigor</h2>' +
      '<p class="sub">The two best units in the cast. Spending them on an 80-second ' +
        'stage against three normal enemies is the mistake this page exists to stop.</p>' +
      '<div class="th__grid">' +
        save.map(function (c) {
          return portrait(c, '<span class="th__why">' + esc(c.why) + '</span>');
        }).join('') +
      '</div>' +

      '<h2>Your own two — not playable yet</h2>' +
      '<p class="sub">' + esc(d.benchNote) + '</p>' +
      '<div class="th__grid th__grid--small">' +
        d.bench.map(function (c) { return portrait(c, ''); }).join('') +
      '</div>' +

      '<div class="note"><b>Checked ' + esc(d._checked) + '.</b> ' + esc(d._note) + '</div>';
  }
})();
