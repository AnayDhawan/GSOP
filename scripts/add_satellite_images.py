#!/usr/bin/env python3
"""Add a NASA satellite view for every site that has no photo (W10). Needs network and Pillow (not part of the CI build).

  python3 scripts/add_satellite_images.py

For each entry in data/reference/site_enrichment.json without an image, fetch a 1200 x 600 crop around the listed
coordinates from NASA GIBS (Landsat WELD true colour, annual composite), draw a ring at the listed point, save it to
public/img/places/<slug>.jpg and record it as the entry's image. NASA imagery is public domain; the caption says it is
a satellite view and not a photo of the place. Where the first layer is blank (high latitudes) it falls back to
VIIRS true colour. The build step (make_data.py) validates the result.
"""
import io
import json
import math
import os
import subprocess
import time
import urllib.parse

from PIL import Image, ImageDraw, ImageStat

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ENRICH = os.path.join(ROOT, "data/reference/site_enrichment.json")
IMG_DIR = os.path.join(ROOT, "public/img/places")
WMS = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi"
LAYERS = [
    ("Landsat_WELD_CorrectedReflectance_TrueColor_Global_Annual", None, 0.045, "Landsat WELD annual composite"),
    ("VIIRS_SNPP_CorrectedReflectance_TrueColor", "2023-07-10", 0.3, "VIIRS true colour, one day in 2023"),
    ("MODIS_Terra_CorrectedReflectance_TrueColor", "2023-01-12", 0.6, "MODIS true colour, one southern summer day in 2023"),
]


def fetch(layer, time_, lat, lon, half):
    dlon = min(2 * half / max(math.cos(math.radians(lat)), 0.17), 40)
    bbox = f"{lat - half},{lon - dlon / 2},{lat + half},{lon + dlon / 2}"
    q = {"SERVICE": "WMS", "REQUEST": "GetMap", "VERSION": "1.3.0", "LAYERS": layer, "STYLES": "", "CRS": "EPSG:4326", "BBOX": bbox, "WIDTH": 1200, "HEIGHT": 600, "FORMAT": "image/jpeg"}
    if time_:
        q["TIME"] = time_
    # curl rather than urllib: it uses the system certificate store, which a stock macOS Python lacks.
    r = subprocess.run(["curl", "-s", "-f", "-m", "60", "-A", "GSOP-site-build/1.0", WMS + "?" + urllib.parse.urlencode(q)], capture_output=True, check=True)
    return Image.open(io.BytesIO(r.stdout)).convert("RGB")


def blank(im):
    st = ImageStat.Stat(im.convert("L"))
    return st.mean[0] < 6 or st.stddev[0] < 2.5


def ring(im):
    d = ImageDraw.Draw(im)
    cx, cy = im.width // 2, im.height // 2
    d.ellipse((cx - 19, cy - 19, cx + 19, cy + 19), outline=(0, 0, 0), width=7)
    d.ellipse((cx - 19, cy - 19, cx + 19, cy + 19), outline=(255, 255, 255), width=3)
    return im


def main():
    entries = json.load(open(ENRICH, encoding="utf-8"))
    sites = {}
    for s in json.load(open(os.path.join(ROOT, "public/data/sites.json"), encoding="utf-8"))["sites"]:
        sites.setdefault(s["slug"], s)
    os.makedirs(IMG_DIR, exist_ok=True)
    done = 0
    for e in entries:
        if e.get("image"):
            continue
        s = sites[e["slug"]]
        lat, lon = s["lat"], s["lon"]
        got = None
        bright = None  # a featureless but real view (an ice plateau is white), used only if every layer is flat
        for layer, t, half, label in LAYERS:
            try:
                im = fetch(layer, t, lat, lon, half)
            except Exception as ex:  # noqa: BLE001
                print(f"{e['slug']}: {layer} failed: {ex}")
                continue
            if not blank(im):
                got = (im, layer, label)
                break
            if ImageStat.Stat(im.convert("L")).mean[0] > 200:
                bright = (im, layer, label)
            time.sleep(0.3)
        got = got or bright
        if not got:
            print(f"{e['slug']}: no usable imagery")
            continue
        im, layer, label = got
        path = os.path.join(IMG_DIR, f"{e['slug']}.jpg")
        ring(im).save(path, "JPEG", quality=80, optimize=True)
        e["image"] = {
            "file": f"{e['slug']}.jpg",
            "title": f"Satellite view of {s['name']}, centred on the listed coordinates ({label})",
            "author": "NASA GIBS",
            "license": "Public domain (NASA)",
            "source_url": f"https://worldview.earthdata.nasa.gov/?l={layer}&v={lon - 0.3},{lat - 0.15},{lon + 0.3},{lat + 0.15}",
            "credit": f"Imagery: NASA GIBS, {label}, public domain. Ring marks the listed point.",
        }
        done += 1
        print(f"{e['slug']}: {layer}")
        time.sleep(0.4)
    with open(ENRICH, "w", encoding="utf-8", newline="\n") as fh:
        json.dump(entries, fh, indent=2, ensure_ascii=False)
        fh.write("\n")
    print(f"added {done} satellite views; {sum(1 for e in entries if e.get('image'))} of {len(entries)} entries now have an image")


if __name__ == "__main__":
    main()
