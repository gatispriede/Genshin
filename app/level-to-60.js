/* The road to Normal Mode, as pictures of the things you have to collect.

   Grouped by where a material comes from rather than by character, because
   that is the order you actually do it in - one boss trip serves two
   characters, one gathering lap serves four.

   Quantities and icons come from reference/data/level-to-60.json, which was
   built from the per-phase ascension costs in char_*.json. */
(function () {
  'use strict';

  var mount = document.getElementById('lvl');
  if (!mount) return;

  var CDN = 'https://gi.yatta.moe/assets/UI/';

  var TINT = {
    Hydro: '#4cc2ff', Electro: '#b18fff', Geo: '#e0a944',
    Cryo: '#9fe3f0', Pyro: '#ff7b4d', Anemo: '#5fd3b4', Dendro: '#8fd04b'
  };

  var KIND = { guild: 'free', boss: 'resin', gather: 'free', drop: 'free' };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  fetch('reference/data/level-to-60.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(render)
    .catch(function () {
      mount.innerHTML = '<div class="note">Could not read ' +
        '<code>reference/data/level-to-60.json</code>.</div>';
    });

  function target(c) {
    var tint = TINT[c.element] || '#8899aa';
    return '<figure class="lvl__who">' +
      '<div class="lvl__face" style="border-color:' + tint + '">' +
        '<img src="' + CDN + esc(c.icon) + '.png" alt="' + esc(c.name) + '" loading="lazy">' +
        '<span class="lvl__step">' + c.order + '</span>' +
      '</div>' +
      '<figcaption><b>' + esc(c.name) + '</b>' +
        '<span class="lvl__jump">Lv. ' + c.from + ' &rarr; ' + c.to + '</span>' +
        '<span class="lvl__wit">~' + c.wit + ' Hero&rsquo;s Wit</span>' +
        '<span class="lvl__why">' + esc(c.why) + '</span>' +
      '</figcaption></figure>';
  }

  function item(it) {
    var who = (it['for'] || []).join(' · ');
    var body =
      '<img src="' + CDN + esc(it.icon) + '.png" alt="" loading="lazy">' +
      '<span class="lvl__qty">&times;' + it.qty + '</span>' +
      '<b>' + esc(it.name) + '</b>' +
      '<span class="lvl__for">' + esc(who) + '</span>' +
      (it.from ? '<span class="lvl__src">' + esc(it.from) + '</span>' : '') +
      (it.pins ? '<span class="lvl__src">' + it.pins + ' pins mapped</span>' : '') +
      (it.warn ? '<span class="lvl__warn">' + esc(it.warn) + '</span>' : '');

    return it.map
      ? '<a class="lvl__item is-map" href="collectible-map.html?set=' +
          encodeURIComponent(it.map) + '">' + body +
          '<span class="lvl__go">open route &rarr;</span></a>'
      : '<div class="lvl__item">' + body + '</div>';
  }

  function render(d) {
    var wit = d.targets.reduce(function (a, c) { return a + c.wit; }, 0);

    var html =
      '<div class="bar key"><b>' + esc(d._goal) + '</b><br>' + esc(d._bill) + '</div>' +

      '<h2>The four, in the order to do them</h2>' +
      '<p class="sub">Ordered by how many seasons each one survives, not by how cheap ' +
      'it is. The element requirement rotates on the 1st of every month.</p>' +
      '<div class="lvl__grid">' +
        d.targets.slice().sort(function (a, b) { return a.order - b.order; })
          .map(target).join('') +
      '</div>' +
      '<div class="bar"><b>~' + wit + ' Hero&rsquo;s Wit</b> across all four, ' +
        'plus the Mora above.</div>';

    d.groups.forEach(function (g) {
      html += '<h2>' + esc(g.title) +
        ' <span class="lvl__tag lvl__tag--' + esc(KIND[g.kind] || 'free') + '">' +
        esc(g.cost) + '</span></h2>' +
        '<p class="sub"><b>' + esc(g.where) + '</b><br>' + esc(g.note) + '</p>' +
        '<div class="lvl__items">' + g.items.map(item).join('') + '</div>';
    });

    html += '<div class="note"><b>Checked ' + esc(d._checked) + '.</b> ' +
      esc(d._note) + '</div>';

    mount.innerHTML = html;
  }
})();
