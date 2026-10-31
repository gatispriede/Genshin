/**
 * Mark-your-own-spots map.
 *
 * No published source has the Inazuma owls, so instead of inventing
 * coordinates this takes a screenshot of your own in-game map and lets you
 * click pins onto it. The image and the pins live in localStorage on this
 * machine — nothing is uploaded anywhere.
 */
(function () {
  'use strict';

  var IMG_KEY = 'tyrants-fang:map-image';
  var PIN_KEY = 'tyrants-fang:map-pins';

  var drop = document.getElementById('map-drop');
  var stage = document.getElementById('map-stage');
  var img = document.getElementById('map-img');
  var layer = document.getElementById('map-layer');
  var file = document.getElementById('map-file');
  var clearBtn = document.getElementById('map-clear');
  var resetBtn = document.getElementById('map-reset');
  var countEl = document.getElementById('map-count');

  if (!drop || !stage) return;

  var pins = load(PIN_KEY) || [];

  function load(k) {
    try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; }
  }
  function save(k, v) {
    try { localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); }
    catch (e) { flash('Too large to remember — pins work for this session only.'); }
  }

  function flash(msg) {
    countEl.textContent = msg;
  }

  // ── Image loading ────────────────────────────────────────────
  function showImage(dataUrl) {
    img.src = dataUrl;
    stage.hidden = false;
    drop.hidden = true;
    render();
  }

  function readFile(f) {
    if (!f || !/^image\//.test(f.type)) {
      flash('That is not an image.');
      return;
    }
    var fr = new FileReader();
    fr.onload = function () {
      save(IMG_KEY, fr.result);
      showImage(fr.result);
    };
    fr.readAsDataURL(f);
  }

  file.addEventListener('change', function () { readFile(file.files[0]); });

  drop.addEventListener('click', function () { file.click(); });
  drop.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); }
  });

  ['dragenter', 'dragover'].forEach(function (ev) {
    drop.addEventListener(ev, function (e) {
      e.preventDefault();
      drop.classList.add('is-over');
    });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    drop.addEventListener(ev, function (e) {
      e.preventDefault();
      drop.classList.remove('is-over');
    });
  });
  drop.addEventListener('drop', function (e) {
    var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    readFile(f);
  });

  // Paste straight from the clipboard — fastest path after Print Screen.
  window.addEventListener('paste', function (e) {
    var items = (e.clipboardData && e.clipboardData.items) || [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') === 0) {
        readFile(items[i].getAsFile());
        break;
      }
    }
  });

  // ── Pinning ──────────────────────────────────────────────────
  layer.addEventListener('click', function (e) {
    if (e.target.closest('.pin')) return;
    var rect = layer.getBoundingClientRect();
    var label = prompt('What is here? (e.g. "4 owls, cliff edge")', 'owls');
    if (label === null) return;
    pins.push({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      label: label || 'owls',
      cleared: false
    });
    save(PIN_KEY, pins);
    render();
  });

  function render() {
    layer.innerHTML = '';
    pins.forEach(function (p, i) {
      var el = document.createElement('button');
      el.type = 'button';
      el.className = 'pin' + (p.cleared ? ' pin--cleared' : '');
      el.style.left = p.x + '%';
      el.style.top = p.y + '%';
      el.innerHTML = '<span class="pin__n">' + (i + 1) + '</span>' +
                     '<span class="pin__label">' + escapeHtml(p.label) + '</span>';
      el.title = 'Click to toggle cleared · Shift-click to delete';

      el.addEventListener('click', function (ev) {
        ev.stopPropagation();
        if (ev.shiftKey) pins.splice(i, 1);
        else p.cleared = !p.cleared;
        save(PIN_KEY, pins);
        render();
      });
      layer.appendChild(el);
    });

    var left = pins.filter(function (p) { return !p.cleared; }).length;
    countEl.textContent = pins.length
      ? pins.length + ' pinned · ' + left + ' not yet cleared today'
      : 'Click anywhere on the map to drop a pin.';
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  clearBtn.addEventListener('click', function () {
    if (!pins.length || !confirm('Remove all pins from this map?')) return;
    pins = [];
    save(PIN_KEY, pins);
    render();
  });

  resetBtn.addEventListener('click', function () {
    if (!confirm('Remove the map image and start over? Pins are kept.')) return;
    try { localStorage.removeItem(IMG_KEY); } catch (e) { /* nothing to undo */ }
    img.removeAttribute('src');
    stage.hidden = true;
    drop.hidden = false;
  });

  // ── Boot ─────────────────────────────────────────────────────
  var saved = null;
  try { saved = localStorage.getItem(IMG_KEY); } catch (e) { saved = null; }
  if (saved) showImage(saved);
  else render();
})();
