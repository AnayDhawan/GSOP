#!/usr/bin/env python3
"""Small 176 x 110 thumbnails of the place images, for the dashboard list (W10). Needs Pillow; run after the photos change.

  python3 scripts/make_thumbs.py
"""
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public/img/places")
DST = os.path.join(SRC, "thumb")
os.makedirs(DST, exist_ok=True)
n = 0
for f in sorted(os.listdir(SRC)):
    if not f.endswith(".jpg"):
        continue
    im = Image.open(os.path.join(SRC, f)).convert("RGB")
    w, h = im.size
    # Centre crop to 16:10, then scale down.
    target = 16 / 10
    if w / h > target:
        nw = int(h * target)
        im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        nh = int(w / target)
        im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    im.resize((176, 110), Image.LANCZOS).save(os.path.join(DST, f), "JPEG", quality=72, optimize=True)
    n += 1
print(f"{n} thumbnails")
