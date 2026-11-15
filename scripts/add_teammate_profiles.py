#!/usr/bin/env python3
"""Merge the teammate-written site profiles (W10) into data/reference/site_enrichment.json. Standard library only.

  python3 scripts/add_teammate_profiles.py GSOP_site_profiles_moon_mars.csv

- Every entry gets `parameters`: per body, the teammate's qualitative strong, partial and weak parameter lists
  (a desk assessment against the v2 variables, not a computed result).
- A slug with no researched entry gets one built from the teammate's summary, terrain, climate and access text
  (`origin` "teammate", confidence "teammate"). Researched entries keep their own text.
Nothing is invented: text is copied as written, with whitespace tidied.
"""
import csv
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ENRICH = os.path.join(ROOT, "data/reference/site_enrichment.json")
NOTE = re.compile(r"\s*\(Qualitative desk assessment[^)]*\)\.?\s*$")


def tidy(s):
    s = re.sub(r"\s+", " ", (s or "").replace("—", ", ").replace("–", " to ")).strip()
    return s or None


def parse_parameters(text):
    body = NOTE.sub("", text).strip().rstrip(".")
    out = {"strong": [], "partial": [], "weak": []}
    for part in body.split(";"):
        label, _, items = part.partition(":")
        key = label.strip().lower()
        if key in out:
            out[key] = [i.strip() for i in items.split(",") if i.strip()]
    return out


def main(csv_path):
    rows = list(csv.DictReader(open(csv_path, encoding="utf-8-sig")))
    sites = json.load(open(os.path.join(ROOT, "public/data/sites.json"), encoding="utf-8"))["sites"]
    by = {(s["body"].lower(), s["name"].strip().lower()): s for s in sites}
    entries = {e["slug"]: e for e in json.load(open(ENRICH, encoding="utf-8"))}
    added = 0
    for r in rows:
        s = by[(r["Body"].lower(), r["Site"].strip().lower())]
        slug = s["slug"]
        e = entries.get(slug)
        if e is None:
            e = entries[slug] = {
                "slug": slug,
                "place": None,
                "summary": tidy(r["Summary"]),
                "terrain_geology": tidy(r["Terrain and geology"]),
                "climate": tidy(r["Climate"]),
                "access_and_facilities": tidy(r["Access"]),
                "hazards": None,
                "facts": [],
                "image": None,
                "sources": [],
                "confidence": "teammate",
                "origin": "teammate",
            }
            added += 1
        e.setdefault("parameters", {})[s["body"]] = parse_parameters(r["Parameters matched"])
    out = [entries[k] for k in sorted(entries)]
    with open(ENRICH, "w", encoding="utf-8", newline="\n") as fh:
        json.dump(out, fh, indent=2, ensure_ascii=False)
        fh.write("\n")
    print(f"{len(out)} entries ({added} new from the teammate file), parameters on {sum(1 for e in out if e.get('parameters'))}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(sys.argv[1])
