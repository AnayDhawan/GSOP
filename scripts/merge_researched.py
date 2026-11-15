#!/usr/bin/env python3
"""Replace teammate-written site entries with researched ones (W11). Standard library only.

  python3 scripts/merge_researched.py IMAGES_DIR OUT_JSON [OUT_JSON ...]

For each slug in the research output that is currently a teammate entry in data/reference/site_enrichment.json:
- text, facts, sources and confidence come from the research (cleaned with the same tidy rules as ingest_enrichment.py);
- a field the research left empty keeps the teammate sentence only if it holds no digit (researched prose may not);
- the teammate parameter readings are kept;
- a researched photo replaces the satellite view; with no photo the satellite view stays.
Entries that were already researched are never touched. The build step (make_data.py) validates the result.
"""
import json
import os
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ingest_enrichment as ing  # noqa: E402
from gsop_data import profiles  # noqa: E402

ROOT = ing.ROOT
ENRICH = os.path.join(ROOT, "data/reference/site_enrichment.json")


def clean(e, old, images, img_dir):
    n = {"slug": e["slug"]}
    for k in profiles.PROSE:
        v = e.get(k)
        v = ing.tidy_prose(v) if isinstance(v, str) and v.strip() else None
        if v is None:
            keep = old.get(k)
            v = keep if isinstance(keep, str) and not any(c.isdigit() for c in keep) else None
        n[k] = v
    n["facts"] = [
        {"label": ing.tidy_prose(f["label"]), "value": ing.tidy_value(f["value"]), "unit": ing.tidy_value(f.get("unit") or ""), "source_url": ing.url(f["source_url"])}
        for f in (e.get("facts") or [])
        if f.get("label") and f.get("value") and f.get("source_url")
    ]
    img = e.get("image")
    if img and os.path.exists(os.path.join(images, img["file"])):
        shutil.copyfile(os.path.join(images, img["file"]), os.path.join(img_dir, f"{e['slug']}.jpg"))
        n["image"] = {k: (ing.tidy_prose(img[k]) if k in ("title", "author", "credit") else img[k]) for k in ("title", "author", "license", "source_url", "credit")}
        n["image"]["file"] = f"{e['slug']}.jpg"
    else:
        n["image"] = old.get("image")
    n["sources"] = [ing.url(u) for u in (e.get("sources") or []) if u]
    n["confidence"] = e.get("confidence") or "low"
    if old.get("parameters"):
        n["parameters"] = old["parameters"]
    return n


def main(images, outs):
    entries = json.load(open(ENRICH, encoding="utf-8"))
    by = {e["slug"]: e for e in entries}
    img_dir = os.path.join(ROOT, profiles.IMG_DIR)
    changed = 0
    for path in outs:
        for e in json.load(open(path, encoding="utf-8")):
            old = by.get(e["slug"])
            if not old or old.get("origin") != "teammate":
                continue
            if not (e.get("summary") or "").strip():
                print(f"no research summary, teammate entry kept: {e['slug']}")
                continue
            new = clean(e, old, images, img_dir)
            by[e["slug"]] = new
            changed += 1
            print(f"{e['slug']}: researched, {len(new['facts'])} facts, image {'photo' if new['image'] and new['image'].get('author') != 'NASA GIBS' else 'satellite'}")
    out = [by[k] for k in sorted(by)]
    with open(ENRICH, "w", encoding="utf-8", newline="\n") as fh:
        json.dump(out, fh, indent=2, ensure_ascii=False)
        fh.write("\n")
    sites = {s["slug"] for s in json.load(open(os.path.join(ROOT, "public/data/sites.json"), encoding="utf-8"))["sites"]}
    bad = profiles.problems(out, sites, ROOT)
    print(f"{changed} entries replaced; {len(bad)} problems")
    print("\n".join(bad[:40]))
    return 1 if bad else 0


if __name__ == "__main__":
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    sys.exit(main(sys.argv[1], sys.argv[2:]))
