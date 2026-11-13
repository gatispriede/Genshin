"""Classify every static page by the CMS modules it would need.

Step 1 of the HTML -> CMS migration: work out what maps onto a native module
and what has to fall back to RICH_TEXT, before authoring anything.

    python -I tools/classify-pages.py

Static analysis, so script-filled placeholders are counted as placeholders
rather than their rendered output. That is the right granularity for deciding
module types — it is not a substitute for rendering when actually authoring.
"""

import io
import os
import re
import sys
from collections import Counter

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SKIP = {'app.html'}


def pages():
    for f in sorted(os.listdir('.')):
        if f.endswith('.html') and f not in SKIP:
            yield f
    for d in ('farming',):
        if os.path.isdir(d):
            for f in sorted(os.listdir(d)):
                if f.endswith('.html'):
                    yield os.path.join(d, f)


def classify(html):
    """Return (module counts, blockers) for one page."""
    mods = Counter()
    blockers = []

    # A map container needs MAP_ANNOTATED, which does not exist yet.
    maps = len(re.findall(r'class="map-wrap"', html))
    if maps:
        mods['MAP_ANNOTATED'] += maps
        blockers.append(f'{maps} map(s) — module not built')

    # Heavier engines cannot be expressed as content at all.
    for engine in ('map-core', 'live-map', 'collect-map'):
        if re.search(r'app/%s\.js' % engine, html):
            blockers.append(f'{engine}.js — out of scope')

    # Tables: two-column label/value pairs fit KEY_VALUE_DOSSIER; anything
    # wider keeps its shape only as RICH_TEXT.
    for table in re.findall(r'<table.*?</table>', html, re.S):
        cols = max([len(re.findall(r'<t[dh]\b', row))
                    for row in re.findall(r'<tr.*?</tr>', table, re.S)] or [0])
        if re.search(r'colspan|rowspan', table):
            mods['RICH_TEXT (merged cells)'] += 1
        elif cols == 2:
            mods['KEY_VALUE_DOSSIER'] += 1
        else:
            mods['RICH_TEXT (table)'] += 1

    mods['SECTION_HEADING'] += len(re.findall(r'<h2\b|class="bar"', html))
    mods['FAQ_ACCORDION'] += len(re.findall(r'<details\b', html))
    mods['LIST'] += len(re.findall(r'<ul\b|<ol\b', html))

    # Script-filled placeholders mean the source HTML is not the content.
    ph = len(re.findall(r'data-(char|set|weapon)=', html))
    if ph:
        blockers.append(f'{ph} script-filled placeholder(s)')

    if re.search(r'<svg\b', html):
        blockers.append('inline <svg> — sanitiser drops it whole')

    return mods, blockers


def main():
    total = Counter()
    rows = []
    for p in pages():
        html = io.open(p, encoding='utf-8').read()
        mods, blockers = classify(html)
        total.update(mods)
        rows.append((p, mods, blockers))

    native = sum(v for k, v in total.items() if not k.startswith('RICH_TEXT'))
    rich = sum(v for k, v in total.items() if k.startswith('RICH_TEXT'))

    print('%d pages\n' % len(rows))
    print('module demand across all pages:')
    for k, v in total.most_common():
        print('  %-28s %3d' % (k, v))
    print('\n  native %d / rich-text %d  (%.0f%% native)'
          % (native, rich, 100.0 * native / max(native + rich, 1)))

    print('\npages with blockers:')
    for p, _mods, blockers in rows:
        if blockers:
            print('  %-34s %s' % (p, '; '.join(blockers)))

    clean = [p for p, _m, b in rows if not b]
    print('\n%d pages with no blockers — migrate these first:' % len(clean))
    for p in clean:
        print('  ' + p)


if __name__ == '__main__':
    main()
