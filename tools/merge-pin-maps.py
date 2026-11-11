"""Collapse a wiki gallery of "same map, one pin moved" shots into one map.

Multi-stop quests (photo hunts, collection runs) ship one screenshot per stop,
all of the same base map with a single marker in a different place. Showing
them side by side is noise: you cannot see the route, only four near-identical
pictures. Intersecting the pairwise pixel differences isolates each marker
exactly, so they can be drawn together on one base.

    python -I tools/merge-pin-maps.py OUT.png IN1.png IN2.png [IN3.png ...]

Labels are I, II, III ... in the order the inputs are given.
"""
import itertools
import os
import sys

from PIL import Image, ImageChops, ImageDraw

COLOURS = [(255, 90, 90), (255, 190, 60), (90, 220, 140), (110, 180, 255),
           (220, 140, 255), (120, 230, 230)]
ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"]
SCALE = 1.5


def marker_points(imgs, threshold=40):
    """Centre of the marker unique to each image."""
    def diff(a, b):
        return (ImageChops.difference(imgs[a], imgs[b]).convert("L")
                .point(lambda p: 255 if p > threshold else 0))

    pts = []
    for n in range(len(imgs)):
        others = [m for m in range(len(imgs)) if m != n]
        acc = diff(n, others[0])
        for o in others[1:]:
            acc = ImageChops.multiply(acc, diff(n, o))
        bb = acc.getbbox()
        if bb is None:
            raise SystemExit("image %d has no unique marker - are these the "
                             "same base map?" % (n + 1))
        pts.append(((bb[0] + bb[2]) // 2, (bb[1] + bb[3]) // 2))
    return pts


def main():
    if len(sys.argv) < 4:
        raise SystemExit(__doc__)
    out_path, paths = sys.argv[1], sys.argv[2:]
    imgs = [Image.open(p).convert("RGB") for p in paths]
    if len({i.size for i in imgs}) != 1:
        raise SystemExit("inputs differ in size - they are not the same base map")

    pts = marker_points(imgs)
    w, h = imgs[0].size
    out = imgs[0].copy().resize((int(w * SCALE), int(h * SCALE)), Image.LANCZOS)
    d = ImageDraw.Draw(out)
    for n, (x, y) in enumerate(pts):
        col = COLOURS[n % len(COLOURS)]
        X, Y = x * SCALE, y * SCALE
        d.ellipse([X - 19, Y - 19, X + 19, Y + 19], outline=(15, 20, 30), width=7)
        d.ellipse([X - 19, Y - 19, X + 19, Y + 19], outline=col, width=4)
        d.ellipse([X - 5, Y - 5, X + 5, Y + 5], fill=col)
        lx, ly = X + 24, Y - 30
        d.rectangle([lx - 3, ly - 3, lx + 34, ly + 26], fill=(15, 20, 30))
        d.text((lx + 6, ly + 4), ROMAN[n % len(ROMAN)], fill=col)
    out.save(out_path)
    print("%s  %d pins  %d KB" % (out_path, len(pts), os.path.getsize(out_path) // 1024),
          file=sys.stderr)


if __name__ == "__main__":
    main()
