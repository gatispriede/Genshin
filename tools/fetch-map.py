#!/usr/bin/env python3
"""Download a region map into assets/ and print its pixel size.

Why the size matters: marker positions in the HTML pages are PERCENTAGES, so
once you know the image is e.g. 1800x1800 you can convert any pixel coordinate
you read off the image into a position the page can use.

Fandom blocks scripted page requests (403), so this tool can't look the URL up
for you — you pass it in. Getting the URL takes one line in a browser:

    1. Open  https://genshin-impact.fandom.com/wiki/<Region_Name>
    2. Run in the console:

       Array.from(document.images)
         .map(i => (i.dataset.src || i.src || '').split('/revision')[0])
         .find(s => /Map\\.png$/.test(s))

    3. Paste the result below.

Note the saved file is named .webp — the wiki serves WebP even from .png URLs.

Usage
-----
    python tools/fetch-map.py --url "https://static.wikia.../Foo_Map.png" --name foo
    python tools/fetch-map.py --url "..." --name chenyu-south
"""

import argparse
import re
import struct
import sys
import urllib.request
from pathlib import Path

ASSETS = Path(__file__).resolve().parent.parent / "assets"
UA = {"User-Agent": "Mozilla/5.0 (GenshinResearchLocal)"}


def default_stem(url: str) -> str:
    """'.../Chenyu_Vale_Southern_Mountain_Map.png' -> 'chenyu-vale-southern-mountain'"""
    tail = url.split("/")[-1]
    tail = re.sub(r"_?Map\.png$", "", tail, flags=re.I)
    tail = re.sub(r"[^\w-]", "-", tail).strip("-").lower()
    return re.sub(r"[-_]+", "-", tail) or "map"


def webp_size(data: bytes):
    """Return (w, h) for a WebP, or None if it isn't one we can read."""
    if data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        return None
    chunk = data[12:16]
    if chunk == b"VP8X":
        return (int.from_bytes(data[24:27], "little") + 1,
                int.from_bytes(data[27:30], "little") + 1)
    if chunk == b"VP8 ":
        return (struct.unpack("<H", data[26:28])[0] & 0x3FFF,
                struct.unpack("<H", data[28:30])[0] & 0x3FFF)
    return None


def main() -> int:
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--url", required=True, help="direct image URL from the wiki")
    ap.add_argument("--name", help="output stem; derived from the URL if omitted")
    args = ap.parse_args()

    stem = args.name or default_stem(args.url)
    out = ASSETS / f"{stem}.webp"
    ASSETS.mkdir(exist_ok=True)

    print(f"GET   {args.url}")
    try:
        req = urllib.request.Request(args.url, headers=UA)
        with urllib.request.urlopen(req, timeout=40) as resp:
            data = resp.read()
    except Exception as exc:
        print(f"FAIL  {exc}", file=sys.stderr)
        return 1

    out.write_bytes(data)
    print(f"SAVED assets/{out.name}  ({len(data):,} bytes)")

    size = webp_size(data)
    if size:
        w, h = size
        print(f"SIZE  {w} x {h}")
        print(f"\nPixel -> percent:   x% = px / {w} * 100     y% = py / {h} * 100")
    else:
        print("SIZE  unreadable header — open the file and check manually")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
