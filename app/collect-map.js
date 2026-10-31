/* Collectible maps with a teleport-aware route.
   The route is a list of warps, not a walking loop: each stop is a teleport
   with the pins it is closest to, ordered as a short walk out from it, and
   stops are ranked by payout so a half-finished run is still efficient.
   Ticked pins persist per collectible.

   Tiles, teleports, place names and pan/zoom come from app/map-core.js. */
(function () {
  'use strict';

  var host = document.getElementById('map-canvas');
  if (!host || !window.MapCore) return;

  /* Nine datasets is ~290KB; you only ever look at one. Load the small index
     for the picker, then fetch just the set being shown. */
  var INDEX = 'reference/data/collect-index.json';
  var slug, D, core;

  function loadScript(src) {
    return new Promise(function (ok, reject) {
      var el = document.createElement('script');
      el.src = src;
      el.onload = ok;
      el.onerror = function () { reject(new Error('could not load ' + src)); };
      document.head.appendChild(el);
    });
  }

  function fail(msg) {
    host.innerHTML = '<p class="cmap__fail">' + msg + '</p>';
  }

  (async function boot() {
    var index;
    try {
      index = await (await fetch(INDEX, { cache: 'no-cache' })).json();
    } catch (e) {
      return fail('Could not read ' + INDEX +
        '. Run <code>tools/build-collectible-map.py</code> first.');
    }

    var names = Object.keys(index);
    /* A page may pin itself to one dataset (data-set) and skip the picker. */
    var pinned = host.dataset.set;
    slug = pinned || new URLSearchParams(location.search).get('set');
    if (!index[slug]) slug = pinned || names[0];
    if (!pinned) renderPicker(index, names);

    try {
      await loadScript('reference/data/' + index[slug].file);
    } catch (e) {
      return fail(e.message);
    }
    D = (window.COLLECT || {})[slug];
    if (!D) return fail('Dataset was empty.');
    start();
  })();

  function renderPicker(index, names) {
    var picker = document.getElementById('cmap-sets');
    if (!picker) return;
    names.forEach(function (s) {
      var a = document.createElement('a');
      a.className = 'chip';
      a.href = '?set=' + encodeURIComponent(s);
      a.textContent = index[s].title;
      a.title = index[s].count + ' pins · ' + index[s].stops + ' warps';
      if (s === slug) a.setAttribute('aria-pressed', 'true');
      picker.appendChild(a);
    });
  }

  function start() {
    var STORE = 'collect:' + slug;
    var SKIP = 'collect:skip:' + slug;
    var got = load();
    /* The map has one Domain category and no names, so it cannot tell a
       one-time clear from a resin domain. You tag them once; it remembers. */
    var skip = loadSkip();
    var hideSkipped = false;
    var activeStop = -1;

    function load() {
      try { return JSON.parse(localStorage.getItem(STORE)) || {}; }
      catch (e) { return {}; }
    }
    function save() {
      try { localStorage.setItem(STORE, JSON.stringify(got)); } catch (e) {}
    }
    function loadSkip() {
      try { return JSON.parse(localStorage.getItem(SKIP)) || {}; }
      catch (e) { return {}; }
    }
    function saveSkip() {
      try { localStorage.setItem(SKIP, JSON.stringify(skip)); } catch (e) {}
    }

    core = window.MapCore(host, D, {
      maxZoom: 5,
      namesFrom: 0.45,
      dragIgnore: '.cmap__item, .cmap__stop'
    });

    // Lines from each teleport to the pins it serves, so a stop reads as a unit.
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'lmap__svg');
    svg.setAttribute('viewBox', '0 0 ' + D.size.w + ' ' + D.size.h);
    D.stops.forEach(function (s, si) {
      s.items.forEach(function (i) {
        var ln = document.createElementNS(NS, 'line');
        ln.setAttribute('x1', s.x); ln.setAttribute('y1', s.y);
        ln.setAttribute('x2', D.items[i].x); ln.setAttribute('y2', D.items[i].y);
        ln.setAttribute('class', 'cmap__tether');
        ln.dataset.stop = si;
        svg.appendChild(ln);
      });
    });
    core.world.appendChild(svg);

    var itemLayer = core.layer();
    D.items.forEach(function (p, i) {
      var off = p.layer || p.depth;
      var el = document.createElement('button');
      el.type = 'button';
      el.className = 'cmap__item' + (off ? ' is-off' : '');
      el.style.left = p.x + 'px';
      el.style.top = p.y + 'px';
      el.title = (p.layer ? 'Not on the surface — ' + p.layer
                 : p.depth ? 'Underwater, depth level ' + p.depth
                 : 'On the surface') + ' · click to tick off';
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        if (got[i]) delete got[i]; else got[i] = 1;
        save(); paint();
      });
      p._el = el;
      itemLayer.appendChild(el);
    });

    D.stops.forEach(function (s, si) {
      var el = document.createElement('button');
      el.type = 'button';
      el.className = 'cmap__stop';
      el.style.left = s.x + 'px';
      el.style.top = s.y + 'px';
      el.innerHTML = '<span>' + (si + 1) + '</span>';
      el.title = 'Warp ' + (si + 1) + (s.place ? ' — ' + s.place : '') +
                 ' · ' + s.items.length + ' here';
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        focusStop(si);
      });
      s._el = el;
      core.world.appendChild(el);
    });

    // ── Stop list ─────────────────────────────────────────────────────
    var list = document.getElementById('cmap-stops');

    function renderStops() {
      if (!list) return;
      list.innerHTML = '';
      D.stops.forEach(function (s, si) {
        var left = s.items.filter(function (i) { return !got[i]; }).length;
        var li = document.createElement('li');
        if (hideSkipped && skip[si]) return;
        li.className = 'cmap__row' + (left === 0 ? ' is-clear' : '') +
                       (skip[si] ? ' is-skipped' : '') +
                       (si === activeStop ? ' is-active' : '');
        li.innerHTML =
          '<b>' + (si + 1) + '</b>' +
          '<span class="cmap__where">' + (s.place || 'unnamed area') +
          '<em>' + (s.kind === 'statue' ? 'Statue of the Seven'
                   : s.kind === 'domain' ? 'Domain' : 'Teleport waypoint') +
          '</em></span>' +
          '<span class="cmap__n">' + left + '<em>of ' + s.items.length + '</em></span>';
        if (host.dataset.taggable) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'cmap__skip' + (skip[si] ? ' is-on' : '');
          b.textContent = skip[si] ? 'resin' : 'tag';
          b.title = skip[si]
            ? 'Marked as a resin domain — click to un-mark'
            : 'Mark this as a resin domain (talent, weapon or artifact)';
          b.addEventListener('click', function (e) {
            e.stopPropagation();
            if (skip[si]) delete skip[si]; else skip[si] = 1;
            saveSkip(); paint();
          });
          li.appendChild(b);
        }
        if (s.offSurface) {
          li.querySelector('.cmap__where').insertAdjacentHTML('beforeend',
            '<em class="cmap__off">' + s.offSurface + ' not on the surface</em>');
        }
        li.addEventListener('click', function () { focusStop(si); });
        list.appendChild(li);
      });
    }

    function focusStop(si) {
      activeStop = si;
      var s = D.stops[si];
      core.frame([{ x: s.x, y: s.y }].concat(s.items.map(function (i) {
        return D.items[i];
      })), 90);
      paint();
    }

    function paint() {
      /* An item belongs to exactly one stop, so a skipped stop skips its items. */
      var skipped = {};
      D.stops.forEach(function (s, si) {
        if (skip[si]) s.items.forEach(function (i) { skipped[i] = 1; });
      });

      var left = 0, counted = 0;
      D.items.forEach(function (p, i) {
        p._el.classList.toggle('is-got', !!got[i]);
        p._el.classList.toggle('is-skipped', !!skipped[i]);
        p._el.hidden = hideSkipped && !!skipped[i];
        if (skipped[i]) return;
        counted++;
        if (!got[i]) left++;
      });
      D.stops.forEach(function (s, si) {
        var n = s.items.filter(function (i) { return !got[i]; }).length;
        s._el.classList.toggle('is-clear', n === 0);
        s._el.classList.toggle('is-active', si === activeStop);
      });
      Array.prototype.forEach.call(svg.querySelectorAll('.cmap__tether'),
        function (ln) {
          ln.classList.toggle('is-active', +ln.dataset.stop === activeStop);
        });
      var out = document.getElementById('cmap-status');
      if (out) {
        var off = D.items.filter(function (p, i) {
          return !got[i] && !skipped[i] && (p.layer || p.depth);
        }).length;
        /* Domains are "cleared", not "collected"; pages can say so. */
        var verb = host.dataset.verb || 'collected';
        var group = host.dataset.group !== undefined
          ? host.dataset.group
          : (' across ' + D.stops.length + ' warps');
        var tagged = Object.keys(skip).length;
        out.innerHTML = '<b>' + (counted - left) + ' / ' + counted +
          '</b> ' + verb + ' · ' + left + ' left' + group +
          (tagged ? ' · <b>' + tagged + '</b> tagged as resin domains' : '') +
          (off ? ' · <b>' + off + '</b> of those are underground or underwater' : '');
      }
      renderStops();
    }

    core.buttons({
      in: 'cmap-in', out: 'cmap-out', fit: 'cmap-fit',
      onFit: function () { activeStop = -1; core.fit(); paint(); }
    });

    var hide = document.getElementById('cmap-hide-skipped');
    if (hide) hide.addEventListener('change', function () {
      hideSkipped = hide.checked;
      paint();
    });

    var reset = document.getElementById('cmap-reset');
    if (reset) reset.addEventListener('click', function () {
      if (!confirm('Clear everything ticked for ' + D.title + '?')) return;
      got = {}; save(); paint();
    });

    var head = document.getElementById('cmap-head');
    if (head) {
      head.innerHTML = D.title + (D.feeds
        ? ' <span class="dim">— feeds ' + D.feeds + '</span>' : '');
    }

    core.fit();
    paint();
    window.addEventListener('resize', function () {
      if (activeStop === -1) core.fit();
    });
  }
})();
