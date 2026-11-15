"""site_profiles.json: researched text, facts and one photo per site, merged from data/reference/site_enrichment.json.

The enrichment file is written once from public sources (each fact names its source URL) and is unreviewed.
This step only validates and copies it. It computes nothing.

Rules enforced here (the build stops on a violation):
- prose fields hold no digits; every measurement is a `facts` row, and every number in a fact has a claims.csv row
- no banned word (data/banned_words.txt), no em or en dash
- an image names a file that exists under public/img/places and has a free licence
- every slug exists in sites.json
"""
import json
import os
import re

from .claims import banned_terms, term_regex, text_numbers
from .fmt import make_meta, sha256_file, write_json

ENRICH = "data/reference/site_enrichment.json"
# Photos live in public/img/places. public/img/sites is rebuilt by the v2 step and holds the satellite chips (chipFor in src/lib/data.ts).
IMG_DIR = "public/img/places"
OUT = "public/data/site_profiles.json"
PROSE = ("place", "summary", "terrain_geology", "climate", "access_and_facilities", "hazards")
CONFIDENCE = {"high", "medium", "low", "teammate"}  # "teammate": text written by a team member, not researched from a page
LICENSE = re.compile(r"^(CC0(?: \d\.\d)?|CC BY(?:-SA)?(?: \d\.\d)?(?: [A-Za-z]{2,3})?|PD(?:-[\w-]+)?|Public domain.*)$", re.I)
DASH = re.compile("[—–−]")
URL = re.compile(r"^https?://\S+$")
LABEL = "Researched from public sources, unreviewed. Text, facts and photos for each site, with the source behind each fact."
LIMITS = [
    "Researched from public web pages and unreviewed. Each fact names the page it came from; a person has not checked them.",
    "A fact describes the place. It says nothing about how well the place matches a Moon or Mars target.",
    "Photos are of the place or of satellite views of it, used under the licence named beside each one.",
    "A missing field means no source was found for it.",
]


def problems(entries, site_slugs, root):
    """Return a list of strings describing every violation in the enrichment entries."""
    rx = term_regex(banned_terms(os.path.join(root, "data/banned_words.txt")))
    out, seen = [], set()
    for e in entries:
        slug = e.get("slug")
        if slug in seen:
            out.append(f"{slug}: duplicate entry")
        seen.add(slug)
        if slug not in site_slugs:
            out.append(f"{slug}: not a slug in sites.json")
        texts = []
        for k in PROSE:
            v = e.get(k)
            if v is None:
                continue
            if not isinstance(v, str) or not v.strip():
                out.append(f"{slug}.{k}: must be text or null")
                continue
            # Researched prose keeps its numbers in facts. Teammate prose may hold numbers; each one gets a claims row (see build).
            if re.search(r"\d", v) and e.get("origin") != "teammate":
                out.append(f"{slug}.{k}: holds a digit; put measurements in facts")
            texts.append((k, v))
        for i, f in enumerate(e.get("facts") or []):
            for key in ("label", "value", "unit"):
                v = f.get(key)
                # A unit may be empty (a year, a count, a name); label and value may not.
                if not isinstance(v, str) or (key != "unit" and not v.strip()):
                    out.append(f"{slug}.facts[{i}].{key}: must be text")
                else:
                    texts.append((f"facts[{i}].{key}", v))
            if not URL.match(f.get("source_url") or ""):
                out.append(f"{slug}.facts[{i}].source_url: needs a URL")
        for k, v in texts:
            if rx.search(v):
                out.append(f"{slug}.{k}: banned word")
            if DASH.search(v):
                out.append(f"{slug}.{k}: dash character")
        for body, par in (e.get("parameters") or {}).items():
            if body not in ("Moon", "Mars"):
                out.append(f"{slug}.parameters: unknown body {body!r}")
            for key in ("strong", "partial", "weak"):
                items = (par or {}).get(key)
                if not isinstance(items, list) or not all(isinstance(i, str) and i.strip() for i in items):
                    out.append(f"{slug}.parameters.{body}.{key}: must be a list of text")
                else:
                    for i in items:
                        if rx.search(i) or DASH.search(i):
                            out.append(f"{slug}.parameters.{body}.{key}: banned word or dash in {i!r}")
        if e.get("confidence") not in CONFIDENCE:
            out.append(f"{slug}.confidence: must be one of {sorted(CONFIDENCE)}")
        for u in e.get("sources") or []:
            if not URL.match(u):
                out.append(f"{slug}.sources: not a URL: {u}")
        img = e.get("image")
        if img is not None:
            if not LICENSE.match(img.get("license") or ""):
                out.append(f"{slug}.image: licence {img.get('license')!r} is not on the allowed list")
            if not os.path.isfile(os.path.join(root, IMG_DIR, img.get("file") or "?")):
                out.append(f"{slug}.image: file {img.get('file')!r} is missing under {IMG_DIR}")
            for k in ("author", "source_url", "credit"):
                if not img.get(k):
                    out.append(f"{slug}.image.{k}: missing")
    return out


def build(ctx):
    path = ctx.path(ENRICH)
    if not os.path.exists(path):
        ctx.log("profiles: no enrichment file, skipped")
        return
    with open(path, encoding="utf-8") as fh:
        entries = json.load(fh)
    with open(ctx.path("public/data/sites.json"), encoding="utf-8") as fh:
        slugs = {s["slug"] for s in json.load(fh)["sites"]}
    bad = problems(entries, slugs, ctx.root)
    if bad:
        raise SystemExit("site enrichment rejected:\n" + "\n".join(bad[:60]) + (f"\n... {len(bad) - 60} more" if len(bad) > 60 else ""))
    sha = sha256_file(path)
    facts, profiles = [], {}
    for e in sorted(entries, key=lambda x: x["slug"]):
        slug = e["slug"]
        p = {k: e.get(k) for k in PROSE}
        p["facts"] = []
        for i, f in enumerate(e.get("facts") or []):
            p["facts"].append({"label": f["label"], "value": f["value"], "unit": f["unit"], "source_url": f["source_url"]})
            for j, n in enumerate(text_numbers(f["value"]) + text_numbers(f["label"])):
                facts.append({"claim": f"profiles.{slug}.f{i}.n{j}", "number": n, "source_file": ENRICH, "sha256": sha})
        if e.get("origin") == "teammate":
            for k in PROSE:
                for j, n in enumerate(text_numbers(e.get(k) or "")):
                    facts.append({"claim": f"profiles.{slug}.{k}.n{j}", "number": n, "source_file": ENRICH, "sha256": sha})
        p["origin"] = e.get("origin", "researched")
        p["parameters"] = e.get("parameters") or {}
        p["image"] = e.get("image")
        p["source_urls"] = list(e.get("sources") or [])
        p["confidence"] = e["confidence"]
        profiles[slug] = p
    meta = make_meta(OUT, LABEL, LIMITS, [{"source_file": ENRICH, "sha256": sha}], facts=facts, text_label="researched from public sources, unreviewed")
    write_json(ctx.path(OUT), {"meta": meta, "profiles": profiles})
    ctx.log(f"profiles: {len(profiles)} sites, {sum(1 for p in profiles.values() if p['image'])} photos, {len(facts)} fact numbers")
