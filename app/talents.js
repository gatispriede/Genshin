/* Talent farming, answered for today rather than as a table you have to read.

   Talent domains gate by day of week, so the only question that matters when
   you log in is "what can I farm right now, and does anyone I own need it".
   This leads with that and keeps the full week underneath.

   The day is the game's, not the browser's: the server rolls over at 04:00
   local, so before 04:00 you are still on yesterday's rotation. Europe runs on
   the EU server, which is what the clock here assumes.

   Data comes from reference/data/talents.json, built by
   tools/build-talent-data.py. Do not hand-edit the JSON. */
(function () {
  'use strict';

  var mount = document.getElementById('talents');
  if (!mount) return;

  var RESET_HOUR = 4;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* Game day: before the 04:00 reset you are still on yesterday's books. */
  function gameDay(now) {
    var d = new Date(now.getTime());
    if (d.getHours() < RESET_HOUR) d.setDate(d.getDate() - 1);
    return d.getDay();
  }

  function availableToday(series, day) {
    return day === 0 || series.days.indexOf(day) !== -1;
  }

  fetch('reference/data/talents.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(render)
    .catch(function () {
      mount.innerHTML = '<div class="note">Could not read ' +
        '<code>reference/data/talents.json</code>. Run ' +
        '<code>python tools/build-talent-data.py</code>.</div>';
    });

  function render(d) {
    var now = new Date();
    var day = gameDay(now);
    var dayName = d.days[day];

    /* series name -> characters who need it, strongest first */
    var owners = {};
    d.characters.forEach(function (c) {
      (owners[c.series] = owners[c.series] || []).push(c);
    });

    var openNow = [];
    var blockedNow = [];

    d.domains.forEach(function (dom) {
      dom.series.forEach(function (s) {
        if (!availableToday(s, day)) return;
        var who = owners[s.name] || [];
        if (!who.length) return;
        var row = { dom: dom, series: s, who: who };
        if (dom.blocked) blockedNow.push(row); else openNow.push(row);
      });
    });

    /* Most useful first: the series whose best character is highest level. */
    openNow.sort(function (a, b) { return b.who[0].level - a.who[0].level; });

    mount.innerHTML =
      lede(d, day, dayName, openNow, blockedNow) +
      todayCards(openNow, blockedNow) +
      weekTable(d) +
      rosterTable(d, owners, day);
  }

  function lede(d, day, dayName, openNow, blockedNow) {
    var head, body;
    if (day === 0) {
      head = 'It is <b>' + esc(dayName) + '</b> — every series is open.';
      body = 'Sunday is the only day you can farm any book you like. If one ' +
             'character is the priority, today is when you catch up on them.';
    } else if (openNow.length) {
      head = 'It is <b>' + esc(dayName) + '</b>. <b>' + openNow.length +
             '</b> series you actually need ' +
             (openNow.length === 1 ? 'is' : 'are') + ' open.';
      body = 'Everything else is locked until its day comes round.';
    } else {
      head = 'It is <b>' + esc(dayName) + '</b>, and nothing you need is open.';
      body = 'Spend the resin on artifacts, a world boss or ley lines instead — ' +
             'resin does not bank past 200.';
    }
    if (blockedNow.length) {
      body += ' ' + blockedNow.length + ' more ' +
              (blockedNow.length === 1 ? 'is' : 'are') +
              ' open today but sit in a region you have never reached.';
    }
    return '<div class="bar key"><b>' + head + '</b><br>' + body + '</div>';
  }

  function card(row, blocked) {
    var who = row.who.map(function (c) {
      return '<span class="tal__who' + (c.level >= 40 ? ' is-main' : '') + '">' +
             esc(c.name) + ' <i>Lv.' + c.level + '</i></span>';
    }).join('');
    return '<div class="tal__card' + (blocked ? ' is-blocked' : '') + '">' +
      '<h3>' + esc(row.series.name) + '</h3>' +
      '<p class="tal__where"><b>' + esc(row.dom.domain) + '</b> · ' +
        esc(row.dom.region) + '<em>' + esc(row.dom.where) + '</em></p>' +
      (blocked ? '<p class="tal__blocked">' + esc(row.dom.blocked) + '</p>' : '') +
      '<div class="tal__owners">' + who + '</div>' +
      '</div>';
  }

  function todayCards(openNow, blockedNow) {
    var out = '';
    if (openNow.length) {
      out += '<h2>Open today</h2><div class="tal__grid">' +
        openNow.map(function (r) { return card(r, false); }).join('') + '</div>';
    }
    if (blockedNow.length) {
      out += '<h2>Open today, but you cannot get there</h2>' +
        '<div class="tal__grid">' +
        blockedNow.map(function (r) { return card(r, true); }).join('') +
        '</div>';
    }
    return out;
  }

  function weekTable(d) {
    var head = '<tr><th>Domain</th><th>Mon · Thu</th><th>Tue · Fri</th>' +
               '<th>Wed · Sat</th></tr>';
    var rows = d.domains.map(function (dom) {
      var cells = dom.series.map(function (s) {
        return '<td>' + esc(s.name) + '</td>';
      }).join('');
      return '<tr' + (dom.blocked ? ' class="is-blocked"' : '') + '>' +
        '<th scope="row">' + esc(dom.domain) + '<em>' + esc(dom.region) +
        (dom.blocked ? ' — unreachable' : '') + '</em></th>' + cells + '</tr>';
    }).join('');
    return '<h2>The whole rotation</h2>' +
      '<p class="sub">Every Domain of Mastery runs the same pattern, and ' +
      '<b>Sunday opens all three</b>.</p>' +
      '<table class="asc tal__week"><tbody>' + head + rows + '</tbody></table>';
  }

  function rosterTable(d, owners, day) {
    var rows = d.characters.map(function (c) {
      var dom = null, series = null;
      d.domains.forEach(function (x) {
        x.series.forEach(function (s) {
          if (s.name === c.series) { dom = x; series = s; }
        });
      });
      if (!dom) return '';
      var open = availableToday(series, day);
      var when = series.days.map(function (n) { return d.days[n]; }).join(' · ');
      return '<tr class="' + (dom.blocked ? 'is-blocked' : open ? 'is-open' : '') + '">' +
        '<th scope="row">' + esc(c.name) + '</th>' +
        '<td class="asc__qty">Lv.' + c.level + '</td>' +
        '<td>' + esc(c.series) + '</td>' +
        '<td>' + esc(when) + ' · Sunday</td>' +
        '<td>' + esc(dom.region) +
          (dom.blocked ? ' <b class="tal__no">unreachable</b>'
                       : open ? ' <b class="tal__yes">open now</b>' : '') +
        '</td></tr>';
    }).join('');
    return '<h2>Everyone you own</h2>' +
      '<p class="sub">Generated from the character data and the roster on the ' +
      '<a href="build-coverage.html">builds page</a> — not typed by hand.</p>' +
      '<table class="asc tal__roster"><tbody>' +
      '<tr><th>Character</th><th>Level</th><th>Book</th><th>Days</th>' +
      '<th>Region</th></tr>' + rows + '</tbody></table>' +
      (d._unmapped && d._unmapped.length
        ? '<div class="note"><b>Not listed:</b> ' + d._unmapped.map(esc).join(', ') +
          '. The Traveler\'s talent books change with the element they are ' +
          'using, so no single series is correct.</div>'
        : '');
  }
})();
