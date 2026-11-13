"""Regenerate src/data/pages.ts from the cards in index.html.

index.html is the hand-maintained hub, so it stays the source of truth for
which pages exist and how they are described. This script turns it into typed
data the React app can search and filter, which means the two cannot drift.

    python -I tools/build-pages-index.py

Writes src/data/pages.ts
"""

import html as html_mod
import io
import json
import os
import re
import sys

OUT = os.path.join('src', 'data', 'pages.ts')

CARD = re.compile(
    r'<a class="card (\w+)" href="([^"]+)">\s*<b>(.*?)</b><span>(.*?)</span></a>',
    re.S,
)

# index.html grew one 50-card "Maps" heading holding maps, tools and build
# pages together, which is the thing the React app exists to fix. Rather than
# hand-restructure the hub, derive the section from signals already in the
# markup, so a page added later files itself:
#
#   *-build.html  -> Builds   (filename convention, nothing to maintain)
#   class="map"   -> Maps
#   class="tool"  -> Tools
#
# Headings other than that overloaded one are meaningful, so they win.
OVERLOADED = {'Maps'}
BY_KIND = {'map': 'Maps', 'tool': 'Tools', 'doc': 'Reference'}


def clean(s):
    return html_mod.unescape(
        re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', s))).strip()


def section_for(heading, kind, href):
    if heading not in OVERLOADED:
        return heading
    if href.endswith('-build.html'):
        return 'Builds'
    return BY_KIND.get(kind, heading)


def read_cards(html):
    """Walk the document so every card inherits the <h2> above it."""
    parts = re.split(r'<h2>(.*?)</h2>', html)
    heading = 'Other'
    for i, chunk in enumerate(parts):
        if i % 2 == 1:
            heading = clean(chunk)
            continue
        for kind, href, title, blurb in CARD.findall(chunk):
            yield {
                'href': href,
                'title': clean(title),
                'blurb': clean(blurb),
                'kind': kind,
                'section': section_for(heading, kind, href),
            }


def main():
    html = io.open('index.html', encoding='utf-8').read()

    seen, pages = set(), []
    for entry in read_cards(html):
        if entry['href'] in seen:
            continue
        seen.add(entry['href'])
        pages.append(entry)

    missing = [p['href'] for p in pages
               if not p['href'].startswith('http') and not os.path.exists(p['href'])]
    if missing:
        print('WARNING: index.html links to files that do not exist:', file=sys.stderr)
        for m in missing:
            print('  ' + m, file=sys.stderr)

    rows = ',\n'.join(
        '  { href: %s, title: %s, blurb: %s, kind: %s, section: %s }' % (
            json.dumps(p['href']), json.dumps(p['title']), json.dumps(p['blurb']),
            json.dumps(p['kind']), json.dumps(p['section']))
        for p in pages)

    io.open(OUT, 'w', encoding='utf-8', newline='\n').write(
        'export interface PageEntry {\n'
        '  href: string;\n  title: string;\n  blurb: string;\n'
        '  /** map | tool | doc - the existing index.html card classes */\n'
        '  kind: string;\n  section: string;\n}\n\n'
        '/**\n'
        ' * Every existing static page, generated from index.html so the two cannot\n'
        ' * drift. These still render as themselves; the React shell frames them and\n'
        ' * makes them searchable. Pages migrate to components one at a time.\n'
        ' *\n'
        ' * Regenerate: python -I tools/build-pages-index.py\n'
        ' */\n'
        'export const pages: PageEntry[] = [\n' + rows + ',\n];\n\n'
        'export const sections = [...new Set(pages.map((p) => p.section))];\n')

    print('wrote %s - %d pages, %d sections'
          % (OUT, len(pages), len({p['section'] for p in pages})), file=sys.stderr)


if __name__ == '__main__':
    main()
