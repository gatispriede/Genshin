/**
 * Builds the per-region compass table and a weeks-remaining estimate.
 *
 * The estimate's whole point is that weekly EXP is shared across regions, so
 * chasing two compasses at once halves the rate for both.
 */
(function () {
  'use strict';

  var R = window.REPUTATION;
  var tbody = document.getElementById('rep-rows');
  if (!R || !tbody) return;

  var weeklyMax = R.weekly.bounties.count * R.weekly.bounties.best +
                  R.weekly.requests.count * R.weekly.requests.each;

  function weeksFor(region, banked) {
    if (!region.expToCompass) return null;
    var left = Math.max(0, region.expToCompass - banked);
    return Math.ceil(left / weeklyMax);
  }

  function oneOffBank(region) {
    /* What you can claim without waiting for a reset. */
    var quests = (region.worldQuests || 0) * 100;
    var exploration = 3 * 100;
    return quests + exploration;
  }

  function render() {
    var banked = document.getElementById('rep-banked').checked;
    tbody.innerHTML = '';

    R.regions.forEach(function (region) {
      var tr = document.createElement('tr');

      var bank = banked ? oneOffBank(region) : 0;
      var weeks = weeksFor(region, bank);

      var cells = [
        '<b>' + region.name + '</b>',
        region.tribe
          ? 'Tribe Lv. ' + region.level + ' ×3 tribes'
          : 'Reputation Lv. ' + region.level,
        region.expToCompass ? region.expToCompass.toLocaleString() + ' EXP' : '—',
        region.worldQuests ? region.worldQuests + ' × 100' : '—',
        weeks === null
          ? 'fastest in game'
          : weeks === 0
            ? '<span class="rep-now">already there</span>'
            : weeks + (weeks === 1 ? ' week' : ' weeks')
      ];

      cells.forEach(function (html, i) {
        var cell = document.createElement(i === 0 ? 'th' : 'td');
        if (i === 0) cell.scope = 'row';
        cell.innerHTML = html;
        tr.appendChild(cell);
      });

      var note = document.createElement('tr');
      note.className = 'rep-note';
      var td = document.createElement('td');
      td.colSpan = 5;
      td.textContent = region.compass + ' — ' + region.caveat;
      note.appendChild(td);

      tbody.appendChild(tr);
      tbody.appendChild(note);
    });

    var out = document.getElementById('rep-rate');
    out.innerHTML =
      'At best you bank <b>' + weeklyMax + ' EXP a week</b> — ' +
      R.weekly.bounties.count + ' bounties at ' + R.weekly.bounties.best +
      ' plus ' + R.weekly.requests.count + ' requests at ' + R.weekly.requests.each +
      '. That total is <b>shared across every region</b>, so two compasses at once ' +
      'take twice as long each. Resets ' + R.weekly.resets + '.';
  }

  document.getElementById('rep-banked').addEventListener('change', render);
  render();
})();
