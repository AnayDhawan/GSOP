#!/usr/bin/env python3
"""Cleanup pass for the researched site enrichment (W8). Standard library only.

  python3 scripts/ingest_enrichment.py MERGED_JSON IMAGES_DIR

Reads the merged research output, applies mechanical fixes (duplicate slugs, null units, dash characters, slugs that
are not in sites.json), copies the photos it names into public/img/places, and writes data/reference/site_enrichment.json.
Hand edits for single entries live in OVERRIDES below, each with the reason. The build step (make_data.py) then checks
the result; this script never invents a fact.
"""
import json
import os
import re
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from gsop_data import profiles  # noqa: E402

ROOT = os.path.dirname(HERE)
PROSE = profiles.PROSE

# slug.field -> replacement text. Used where the source sentence is fine but holds a digit in a proper name.
OVERRIDES = {
    "orocopia-mountains.access_and_facilities": "The range lies south of the main interstate highway through the Colorado Desert.",
    "lunodrom-simferopol-28-crimea.place": "Lunodrom near Simferopol, Crimea",
}


def tidy_prose(s):
    s = re.sub(r"\s*[—–]\s*", ", ", s)
    return re.sub(r"\s+", " ", s).strip()


def url(u):
    return u.strip().replace(" ", "%20")


def tidy_value(s):
    s = re.sub(r"\s*–\s*", " to ", s)  # a range written with an en dash
    s = s.replace("−", "-")
    s = re.sub(r"\s*—\s*", ", ", s)
    return re.sub(r"\s+", " ", s).strip()


def main(merged, images):
    with open(merged, encoding="utf-8") as fh:
        raw = json.load(fh)
    with open(os.path.join(ROOT, "public/data/sites.json"), encoding="utf-8") as fh:
        slugs = {s["slug"] for s in json.load(fh)["sites"]}
    best = {}
    for e in raw:
        slug = e.get("slug")
        if slug not in slugs:
            print(f"dropped, not in sites.json: {slug}")
            continue
        old = best.get(slug)
        # Duplicates: keep the entry with a photo, otherwise the one with more facts, otherwise the later one.
        if old is None or (bool(e.get("image")), len(e.get("facts") or [])) >= (bool(old.get("image")), len(old.get("facts") or [])):
            best[slug] = e
    out = []
    img_dir = os.path.join(ROOT, profiles.IMG_DIR)
    os.makedirs(img_dir, exist_ok=True)
    for slug in sorted(best):
        e = best[slug]
        n = {"slug": slug}
        for k in PROSE:
            v = e.get(k)
            n[k] = tidy_prose(v) if isinstance(v, str) and v.strip() else None
            if f"{slug}.{k}" in OVERRIDES:
                n[k] = OVERRIDES[f"{slug}.{k}"]
        n["facts"] = [
            {"label": tidy_prose(f["label"]), "value": tidy_value(f["value"]), "unit": tidy_value(f.get("unit") or ""), "source_url": url(f["source_url"])}
            for f in (e.get("facts") or [])
            if f.get("label") and f.get("value") and f.get("source_url")
        ]
        img = e.get("image")
        if img and os.path.exists(os.path.join(images, img["file"])):
            shutil.copyfile(os.path.join(images, img["file"]), os.path.join(img_dir, img["file"]))
            n["image"] = {k: (tidy_prose(img[k]) if k in ("title", "author", "credit") else img[k]) for k in ("file", "title", "author", "license", "source_url", "credit")}
        else:
            if img:
                print(f"photo file missing, entry kept without a photo: {slug}")
            n["image"] = None
        n["sources"] = [url(u) for u in (e.get("sources") or []) if u]
        n["confidence"] = e.get("confidence") or "low"
        out.append(n)
    path = os.path.join(ROOT, "data/reference/site_enrichment.json")
    with open(path, "w", encoding="utf-8", newline="\n") as fh:
        json.dump(out, fh, indent=2, ensure_ascii=False)
        fh.write("\n")
    bad = profiles.problems(out, slugs, ROOT)
    print(f"wrote {len(out)} entries, {sum(1 for x in out if x['image'])} photos, {sum(1 for x in out if len(x['facts']) >= 3)} with at least three facts")
    if bad:
        print(f"{len(bad)} problems the build will refuse:")
        print("\n".join(bad[:60]))
        return 1
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    sys.exit(main(sys.argv[1], sys.argv[2]))
