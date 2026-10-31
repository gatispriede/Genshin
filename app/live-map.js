/* Interactive quest map: real basemap tiles, every teleport, and a dot per
   quest that opens what we know about it - start NPC, measured length, and the
   wiki's own start-location screenshot.

   The page names its dataset:
     <div class="lmap" id="map-canvas" data-source="QUEST_MAP"></div>

   Quest dots are placed by named subarea, so they are area-accurate rather
   than pin-accurate. The screenshot in the panel is the precise answer. */
(function () {
  'use strict';

  var host = document.getElementById('map-canvas');
  if (!host) return;
  var DATA = window[host.dataset.source || 'QUEST_MAP'];
  if (!DATA) return;

  var STORE = 'quest-map:done';
  var NAMES_FROM = 0.45;
  var MAX_ZOOM = 5;
  var view = { x: 0, y: 0, k: 0.2 };

  var done = load();
  function load() {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; }
    catch (e) { return {}; }
  }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(done)); } catch (e) {}
  }
  /* The hand-transcribed claimed list seeds it; clicks override from then on. */
  DATA.quests.forEach(function (q) {
    if (q.done && !(q.name in done)) done[q.name] = true;
  });

  var core = window.MapCore(host, DATA, {
    maxZoom: MAX_ZOOM,
    namesFrom: NAMES_FROM,
    dragIgnore: '.lmap__q'
  });
  var world = core.world;
  var view = core.view;
  var apply = core.apply;
  var fit = core.fit;

  // ── Quest dots ──────────────────────────────────────────────────────────
  /* Several quests share a subarea, so fan them out around its centre
     instead of stacking them into one unclickable dot. */
  var seats = {};
  var questLayer = document.createElement('div');
  questLayer.className = 'lmap__layer';

  DATA.quests.forEach(function (q, i) {
    var key = q.x + ',' + q.y;
    var n = seats[key] = (seats[key] || 0) + 1;
    var ring = Math.ceil(Math.sqrt(n / 3));
    var angle = (n * 2.39996);                       // golden angle, spreads evenly
    q._dx = n === 1 ? 0 : Math.cos(angle) * 9 * ring;
    q._dy = n === 1 ? 0 : Math.sin(angle) * 9 * ring;

    var el = document.createElement('button');
    el.type = 'button';
    el.className = 'lmap__q lmap__q--' + q.tier.replace(' ', '-');
    el.style.left = (q.x + q._dx) + 'px';
    el.style.top = (q.y + q._dy) + 'px';
    el.dataset.i = i;
    el.title = q.name + ' — ' + q.tier;
    el.addEventListener('click', function (e) {
      e.stopPropagation();
      open(i);
    });
    q._el = el;
    questLayer.appendChild(el);
  });
  world.appendChild(questLayer);

  // ── Info panel ──────────────────────────────────────────────────────────
  var panel = document.getElementById('lmap-panel');
  var current = -1;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function open(i) {
    var q = DATA.quests[i];
    current = i;
    DATA.quests.forEach(function (o) { o._el.classList.remove('is-open'); });
    q._el.classList.add('is-open');

    var img = q.img
      ? '<a class="lmap__shot" href="' + DATA.imageBase + esc(q.img) +
        '" target="_blank" rel="noopener">' +
        '<img src="' + DATA.imageBase + esc(q.img) + '" alt="Where ' +
        esc(q.name) + ' starts"></a>'
      : '<p class="lmap__noshot">No start-location screenshot on the wiki for ' +
        'this one — use the NPC name in game.</p>';

    panel.innerHTML =
      '<button type="button" class="lmap__close" id="lmap-close" ' +
      'aria-label="Close">×</button>' +
      '<p class="lmap__tier lmap__tier--' + q.tier.replace(' ', '-') + '">' +
      esc(q.tier) + ' · ' + esc(q.region) + '</p>' +
      '<h3>' + esc(q.name) + '</h3>' +
      img +
      '<dl class="lmap__facts">' +
      '<div><dt>Start NPC</dt><dd>' + esc(q.npc || 'no named giver') + '</dd></div>' +
      '<div><dt>Where</dt><dd>' + esc(q.where || q.place) + '</dd></div>' +
      '<div><dt>Objectives</dt><dd>' + q.steps + '</dd></div>' +
      '<div><dt>Dialogue</dt><dd>' + (q.dlg / 1000).toFixed(1) + 'k chars</dd></div>' +
      '</dl>' +
      '<label class="lmap__done"><input type="checkbox" id="lmap-done"' +
      (done[q.name] ? ' checked' : '') + '> Done</label>' +
      '<p class="lmap__fine">Dot sits on <b>' + esc(q.place) + '</b> — the named ' +
      'area, not the exact spot. The screenshot is the precise location.</p>';

    panel.hidden = false;
    document.getElementById('lmap-close').addEventListener('click', close);
    document.getElementById('lmap-done').addEventListener('change', function (e) {
      done[q.name] = e.target.checked;
      if (!e.target.checked) delete done[q.name];
      save();
      paint();
    });
  }

  function close() {
    panel.hidden = true;
    if (current > -1) DATA.quests[current]._el.classList.remove('is-open');
    current = -1;
  }

  function paint() {
    var shown = 0, left = 0;
    DATA.quests.forEach(function (q) {
      var hide = filterRegion !== 'All' && q.region !== filterRegion;
      if (!hide && hideDone && done[q.name]) hide = true;
      q._el.hidden = hide;
      q._el.classList.toggle('is-done', !!done[q.name]);
      if (!hide) { shown++; if (!done[q.name]) left++; }
    });
    var out = document.getElementById('lmap-status');
    if (out) {
      out.textContent = shown + ' quests shown · ' + left + ' still to do · ' +
        DATA.quests.length + ' placed in total';
    }
  }

  // ── Quests with no dot, named rather than silently dropped ─────────────
  (function () {
    var box = document.getElementById('lmap-missing');
    if (!box) return;
    var off = DATA.offMap || [], none = DATA.noArea || [];
    if (!off.length && !none.length) { box.hidden = true; return; }

    var byMap = {};
    off.forEach(function (q) { (byMap[q.map] = byMap[q.map] || []).push(q); });

    var html = '<b>' + (off.length + none.length) + ' quests have no dot.</b> ';
    html += 'All ' + (DATA.quests.length + off.length + none.length) +
            ' are still in the <a href="reputation-quests.html">list</a>.';

    Object.keys(byMap).forEach(function (m) {
      html += '<p><b>' + esc(m) + '</b> is a separate map in game, not part of ' +
        'the Teyvat canvas, so these cannot be drawn here at all: ' +
        byMap[m].map(function (q) {
          return esc(q.name) + (q.npc ? ' <span class="dim">(' + esc(q.npc) + ')</span>' : '');
        }).join(', ') + '.</p>';
    });

    if (none.length) {
      html += '<p>These record no usable area on the wiki, so there is nothing ' +
        'to place them against: ' + none.map(function (q) {
          return esc(q.name) + (q.npc ? ' <span class="dim">(' + esc(q.npc) + ')</span>' : '');
        }).join(', ') + '.</p>';
    }
    box.innerHTML = html;
  })();

  /* Frame whatever is currently shown, so picking a region moves the map
     there instead of leaving you to hunt for it. */
  function frameVisible() {
    var shown = DATA.quests.filter(function (q) { return !q._el.hidden; });
    core.frame(shown.map(function (q) {
      return { x: q.x + q._dx, y: q.y + q._dy };
    }), 140);
  }

  // ── Controls ────────────────────────────────────────────────────────────
  var filterRegion = 'All';
  var hideDone = false;

  var filters = document.getElementById('lmap-filters');
  if (filters) {
    var regions = ['All'].concat(DATA.quests.reduce(function (a, q) {
      if (a.indexOf(q.region) === -1) a.push(q.region);
      return a;
    }, []));
    regions.forEach(function (r) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = r;
      b.setAttribute('aria-pressed', String(r === 'All'));
      b.addEventListener('click', function () {
        filterRegion = r;
        Array.prototype.forEach.call(filters.children, function (c) {
          c.setAttribute('aria-pressed', String(c === b));
        });
        paint();
        if (r === 'All') fit(); else frameVisible();
      });
      filters.appendChild(b);
    });
  }

  var hd = document.getElementById('lmap-hide-done');
  if (hd) hd.addEventListener('change', function () {
    hideDone = hd.checked;
    paint();
    if (filterRegion !== 'All') frameVisible();
  });
  var wt = document.getElementById('lmap-wp');
  if (wt) wt.addEventListener('change', function () {
    wpLayer.style.display = wt.checked ? '' : 'none';
  });

  core.buttons({ in: 'lmap-in', out: 'lmap-out', fit: 'lmap-fit' });

  /* quest-map.html?q=Changchang — jump straight to one from the list page. */
  var want = new URLSearchParams(location.search).get('q');
  fit();
  paint();
  if (want) {
    var hit = DATA.quests.findIndex(function (q) {
      return q.name.toLowerCase().indexOf(want.toLowerCase()) !== -1;
    });
    if (hit > -1) {
      /* A deep link must never land on a dot the current filter hides. */
      filterRegion = 'All';
      hideDone = false;
      if (hd) hd.checked = false;
      if (filters) {
        Array.prototype.forEach.call(filters.children, function (c, i) {
          c.setAttribute('aria-pressed', String(i === 0));
        });
      }
      paint();
      var q = DATA.quests[hit];
      var r = host.getBoundingClientRect();
      view.k = 1.2;
      view.x = r.width / 2 - (q.x + q._dx) * view.k;
      view.y = r.height / 2 - (q.y + q._dy) * view.k;
      apply();
      open(hit);
    }
  }
  window.addEventListener('resize', function () { if (!want) fit(); });
})();
