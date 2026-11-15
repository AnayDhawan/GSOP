"""E7: render the submission text from a template. Every number comes from claims.csv; the E32 sentence from docs/E32.txt."""
import json
import os
import re

from .claims import NUM_RE, read_claims, text_numbers

PLACEHOLDER = re.compile(r"\{\{(claim:[^}\s]+|status:[^}\s]+|v2:[^}\s]+|e32|india_region|india_tiles)\}\}")

# Hand-written templates and the generated files built from them. Neither may hold a typed number.
PAIRS = [("submission/template.md", "submission/SUBMISSION.md"), ("submission/slide5_template.md", "docs/demo/SLIDE5.md")]


class SubmissionError(Exception):
    pass


def _v2_results(root):
    p = os.path.join(root, "public/data/v2.json")
    if not os.path.exists(p):
        raise SubmissionError("public/data/v2.json is missing")
    with open(p, encoding="utf-8") as f:
        r = json.load(f).get("results")
    if not r:
        raise SubmissionError("v2.json has no results block")
    return r


def _v2_text(r, key):
    """Text written by the v2 build, so it already holds only numbers that have claims rows."""
    if key == "positive":
        if not r.get("positive_finding"):
            raise SubmissionError("v2.json has no positive_finding")
        return r["positive_finding"]["text"]
    if key == "positive_note":
        return r["positive_finding"]["model_note"]
    if key.startswith("limit."):
        for lim in r["limitations"]:
            if lim["id"] == key[len("limit.") :]:
                return lim["text"]
    raise SubmissionError(f"no v2 text named {key}")


def render(root, template_rel="submission/template.md"):
    with open(os.path.join(root, template_rel), encoding="utf-8") as f:
        template = f.read()
    claims = {c[0]: c[1] for c in read_claims(os.path.join(root, "public/data/claims.csv"))}
    with open(os.path.join(root, "docs/E32.txt"), encoding="utf-8") as f:
        e32 = f.read().rstrip("\n")

    with open(os.path.join(root, "public/data/regions.json"), encoding="utf-8") as f:
        regions = json.load(f)["regions"]
    india = [r for r in regions if r["n_tiles_in_india"] > 0]

    def sub(m):
        key = m.group(1)
        if key == "e32":
            return e32
        if key in ("india_region", "india_tiles"):
            # The India paragraph says exactly one listed region overlaps the outline. If that stops being true, stop.
            if len(india) != 1:
                raise SubmissionError(f"the India paragraph assumes one region overlaps India, but {len(india)} do; rewrite it")
            rid = india[0]["id"]
            if key == "india_region":
                return rid
            cid = f"regions.{rid.replace(' ', '_')}.n_tiles_in_india"
            if cid not in claims:
                raise SubmissionError(f"no claims.csv row for {cid}")
            return claims[cid]
        if key.startswith("status:"):
            k = key[len("status:") :]
            st = _v2_results(root)["gate_statuses"].get(k)
            if st is None:
                raise SubmissionError(f"no gate status for {k}")
            return st
        if key.startswith("v2:"):
            return _v2_text(_v2_results(root), key[len("v2:") :])
        cid = key[len("claim:") :]
        if cid not in claims:
            raise SubmissionError(f"no claims.csv row for {cid}")
        return claims[cid]

    return PLACEHOLDER.sub(sub, template)


def typed_numbers(template):
    """Numbers typed into the template outside placeholders. There must be none."""
    stripped = PLACEHOLDER.sub("", template)
    stripped = re.sub(r"https?://\S+", "", stripped)  # addresses are not statistics
    return text_numbers(stripped)
