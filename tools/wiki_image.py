"""Where a quest-map picture is loaded from.

Pages reference the wiki's own image URL when the index has it, so they work
wherever they are published — the CMS has no copy of assets/quest-maps/, which
is gitignored. The local file is the fallback for entries indexed before the
URL was recorded (tools/fetch-quest-maps.py now stores it).
"""

LOCAL_DIR = "assets/quest-maps/"

# The wiki's CDN answers any foreign Referer with a 1,976-byte placeholder
# (measured 15 Nov). Every <img> pointing at it must carry this attribute, so
# the request goes out with no Referer, exactly as opening the image directly.
NO_REFERRER = 'referrerpolicy="no-referrer"'


def src(shot):
    """Image source for one entry of reference/data/quest-maps.json `maps`."""
    if not shot:
        return None
    return shot.get("url") or LOCAL_DIR + shot["file"]
