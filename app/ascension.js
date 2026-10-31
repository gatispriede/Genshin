/* Ascension and talent materials on the build page, where you actually look
   for them - and each row links to the map that shows where to farm it.

   Drop this on a build page:
     <div id="ascension" data-character="Skirk"></div>
   One JSON holds every character, so adding one is a data edit, not a page edit. */
(function () {
  'use strict';

  var mount = document.getElementById('ascension');
  if (!mount) return;

  var who = mount.dataset.character;
  if (!who) return;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function rows(list) {
    return list.map(function (m) {
      var where = esc(m.from);
      if (m.map) {
        where = '<a href="collectible-map.html?set=' + encodeURIComponent(m.map) +
          '">' + where + '</a> <span class="asc__pin">mapped</span>';
      } else if (m.href) {
        where = '<a href="' + esc(m.href) + '">' + where + '</a> ' +
          '<span class="asc__pin asc__pin--away">farming project</span>';
      }
      return '<tr>' +
        '<th scope="row">' + esc(m.item) + '</th>' +
        '<td class="asc__qty">' + esc(m.qty) + '</td>' +
        '<td>' + where +
        (m.note ? '<em>' + esc(m.note) + '</em>' : '') +
        '</td></tr>';
    }).join('');
  }

  fetch('reference/data/ascension.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(function (all) {
      var c = all[who];
      if (!c) {
        mount.innerHTML = '<div class="note">No material list recorded for ' +
          esc(who) + ' yet — add one to <code>reference/data/ascension.json</code>.</div>';
        return;
      }
      var mora = (c.mora.ascension + c.mora.talents).toLocaleString();
      mount.innerHTML =
        '<h2>Ascension &amp; talent materials</h2>' +
        '<p class="sub">Everything to take ' + esc(who) + ' to Lv.&nbsp;90 with all three ' +
        'talents at 10. Rows marked <span class="asc__pin">mapped</span> open a route ' +
        'that assumes you teleport. <b>' + mora + ' Mora</b> all in.</p>' +
        '<table class="asc"><caption>Ascension to Lv. 90</caption><tbody>' +
        rows(c.ascension) + '</tbody></table>' +
        '<table class="asc"><caption>All three talents to 10</caption><tbody>' +
        rows(c.talents) + '</tbody></table>';
    })
    .catch(function () {
      mount.innerHTML = '<div class="note">Could not read ' +
        '<code>reference/data/ascension.json</code>.</div>';
    });
})();
