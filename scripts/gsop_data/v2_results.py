"""W1: v2 gate results, the one positive finding, limitations and run ledgers. Standard library only.

Reads, from data/v2/ (copied from the handoff, hashes in data/v2/SOURCES.csv):
  runs/v2/metrics.json     role A: {meta, gates, entries}
  runs/v2/ledger.json      role A ledger
  runs/v2/metrics_d.json   role D: {meta, metrics}   (a different shape; mapped here, see docs/DATA_CONTRACT.md)
  runs/v2/ledger_d.json    role D ledger
  runs/v2/results_a.md, STATUS_A.md, STATUS_D.md, negative_set_d.csv, docs/ENGINE_AUDIT.md   (a few stored values, read by pattern)

Rules kept from the contract:
  - No score is computed. Values are read from the stored files. The only derived values are counts, a share written as
    a percentage and min/max over stored values.
  - Every number that appears in text written here is a fact: its claim id, display string, source file and hash are
    returned in `facts` and end up in meta.facts of v2.json, so claims.csv has a row for it.
  - A pattern that is not found in a source file stops the build. Nothing is guessed.
  - Gate statuses are the literal strings PASS, FAIL, NOT TESTED. Anything else stops the build.
"""
import csv
import hashlib
import io
import json
import os
import re

STATUSES = ("PASS", "FAIL", "NOT TESTED")
RUNS = "runs/v2"
NOT_RECORDED = "not recorded"


class ResultsError(SystemExit):
    pass


def fail(msg):
    raise ResultsError(f"v2 results: {msg}")


def _read(base, rel):
    p = os.path.join(base, rel)
    if not os.path.isfile(p):
        return None
    with open(p, "rb") as f:
        return f.read()


def _sha(b):
    return hashlib.sha256(b).hexdigest()


def _grab(text, pattern, what, flags=0):
    m = re.search(pattern, text, flags)
    if not m:
        fail(f"could not find {what} in the source file (pattern {pattern!r})")
    return m


def _pct(x, dp=1):
    """A stored share (0 to 1) shown as a percentage string with dp decimals, no negative zero."""
    r = round(float(x) * 100, dp)
    return f"{r:.{dp}f}"


def _fix(x, dp):
    r = round(float(x), dp)
    return f"{r:.{dp}f}" if dp else str(int(r))


# Decision E32 bans the word "validated". Role D's ledger says "cross-validated"; the published copy says the same thing
# in other words. The source file under data/v2 is not changed. Documented in docs/DATA_CONTRACT.md.
PUBLIC_REWRITES = [("cross-validated", "checked on held-out data")]


def _public(text):
    for old, new in PUBLIC_REWRITES:
        text = text.replace(old, new)
    return text


def _status(v, where):
    if not isinstance(v, str) or v not in STATUSES:
        fail(f"{where}: status {v!r} is not one of {STATUSES}")
    return v


class Facts:
    """Collects (claim, number, source_file, sha256). The same claim id may be added twice only with the same value."""

    def __init__(self):
        self.rows = {}

    def add(self, claim, number, src, sha):
        row = {"claim": claim, "number": number, "source_file": src, "sha256": sha}
        if claim in self.rows and self.rows[claim] != row:
            fail(f"conflicting fact {claim}")
        self.rows[claim] = row
        return number

    def list(self):
        return [self.rows[k] for k in sorted(self.rows)]


def _sources_csv(base):
    """data/v2/SOURCES.csv as {path: {branch, commit}}."""
    raw = _read(base, "SOURCES.csv")
    out = {}
    if raw is None:
        return out
    for r in csv.DictReader(io.StringIO(raw.decode("utf-8"), newline="")):
        out[r["path"]] = {"branch": r["branch"], "commit": r["commit"]}
    return out


def _status_field(text, key):
    m = re.search(rf"^- {key}: (.+)$", text, re.M)
    return m.group(1).strip() if m else NOT_RECORDED


def build(base, v2dir):
    """Return (results dict, facts list), or (None, []) when the role A files are not present in the expected layout."""
    am_raw, al_raw = _read(base, f"{RUNS}/metrics.json"), _read(base, f"{RUNS}/ledger.json")
    if am_raw is None or al_raw is None:
        return None, []
    am, al = json.loads(am_raw), json.loads(al_raw)
    if not (isinstance(am, dict) and "gates" in am and "entries" in am):
        return None, []  # not the role A layout
    F = Facts()
    A_SRC = f"{v2dir}/{RUNS}/metrics.json"
    A_SHA = _sha(am_raw)
    by = {e["id"]: e for e in am["entries"]}

    def a(eid):
        if eid not in by:
            fail(f"{RUNS}/metrics.json has no entry {eid}")
        return by[eid]

    # ---- gate statuses (literal strings, validated)
    statuses, sources = {}, {}
    for key, eid in (("G1", "gate.G1"), ("G2", "gate.G2"), ("G2a", "gate.G2a"), ("G2b", "gate.G2b"), ("G2c", "gate.G2c"), ("G2_moon_layer2", "gate.G2.moon_layer2"), ("G3", "gate.G3")):
        st = _status(a(eid)["status"], eid)
        if a(eid)["display"] != st or a(eid)["value"] != st:
            fail(f"{eid}: value, display and status disagree")
        statuses[key] = st
        sources[key] = {"source_file": A_SRC, "sha256": A_SHA}
    for g in ("G1", "G2", "G3"):
        if _status(am["gates"][g], f"gates.{g}") != statuses[g]:
            fail(f"gates.{g} disagrees with gate.{g} entry")

    # ---- G1: coverage against its threshold
    cov = a("earth.band_valid_share")
    F.add("v2.result.g1.coverage", cov["display"], A_SRC, A_SHA)
    F.add("v2.result.g1.required", _grab(cov["what_this_means_for_the_analogy"], r"threshold is (0\.\d+)", "the G1 threshold").group(1), A_SRC, A_SHA)
    F.add("v2.result.coverage_pct", _pct(cov["value"]), A_SRC, A_SHA)

    # ---- G2(a): Moon controls against the maximum
    for site, slug in (("namib", "namib_sand_sea"), ("rak", "rub_al_khali")):
        F.add(f"v2.result.g2a.{site}", a(f"g2a.{slug}")["display"], A_SRC, A_SHA)
    mx = float(_grab(a("g2a.namib_sand_sea")["what_this_means_for_the_analogy"], r"maximum is (\d+(?:\.\d+)?)", "the G2(a) maximum").group(1))
    F.add("v2.result.g2a.max", _fix(mx, 0), A_SRC, A_SHA)

    # ---- G2(b): Mars positives. Only rows whose stored status is "scored" count; other rows carry a placeholder value.
    results_a = _read(base, f"{RUNS}/results_a.md")
    if results_a is None:
        fail("runs/v2/results_a.md is needed for the G2(b) percentile threshold")
    ra = results_a.decode("utf-8")
    RA_SRC, RA_SHA = f"{v2dir}/{RUNS}/results_a.md", _sha(results_a)
    pct_thr = _grab(ra, r"at or above the (\d+)th percentile", "the G2(b) percentile").group(1)
    F.add("v2.result.g2b.percentile", pct_thr, RA_SRC, RA_SHA)
    lat_s, lat_n = _grab(ra, r"between (\d+) S and (\d+) N", "the latitude band of the coverage share").groups()
    F.add("v2.result.cov.band_south", lat_s, RA_SRC, RA_SHA)
    F.add("v2.result.cov.band_north", lat_n, RA_SRC, RA_SHA)
    names = {"haughton": "Haughton", "atacama_salars": "Atacama salars", "ladakh_puga": "Ladakh (Puga)", "mdrs_utah": "MDRS (Utah)", "lonar": "Lonar", "mcmurdo_dry_valleys": "McMurdo Dry Valleys"}
    sites, n_scorable, n_hit = [], 0, 0
    for slug, nm in names.items():
        e = a(f"g2b.{slug}")
        stt = _grab(e["what_this_means_for_the_analogy"], r"Status (\w+)\.", f"the status of {slug}").group(1)
        scorable = stt == "scored"
        row = {"slug": slug, "name": nm, "scorable": scorable, "stored_status": stt}
        if scorable:
            n_scorable += 1
            if float(e["value"]) >= float(pct_thr):
                n_hit += 1
            F.add(f"v2.result.g2b.{slug}", e["display"], A_SRC, A_SHA)
            row["claim"] = f"v2.result.g2b.{slug}"
        sites.append(row)
    F.add("v2.result.g2b.n_scorable", str(n_scorable), A_SRC, A_SHA)
    F.add("v2.result.g2b.n_at_or_above", str(n_hit), A_SRC, A_SHA)

    # ---- G2(c): the terrain-only baseline reproduces v1 (two decimals so the match is visible)
    for k in ("namib", "rub", "mars_median"):
        F.add(f"v2.result.g2c.{k}", _fix(a(f"g2c.{k}")["value"], 2), A_SRC, A_SHA)

    # ---- G3: supported regions per target
    g3 = []
    for t in ("connecting_ridge_c1", "shackleton_rim", "jezero"):
        n = int(a(f"g3.{t}__base.n_supported")["value"])
        g3.append({"target": t, "n_supported": n})
        F.add(f"v2.result.g3.{t}", str(n), A_SRC, A_SHA)
    F.add("v2.result.g3.total", str(sum(x["n_supported"] for x in g3)), A_SRC, A_SHA)

    # ---- role D: a different file shape ({meta, metrics}); mapped into the same results block
    dm_raw, dl_raw = _read(base, f"{RUNS}/metrics_d.json"), _read(base, f"{RUNS}/ledger_d.json")
    d_present = dm_raw is not None
    D_SRC = f"{v2dir}/{RUNS}/metrics_d.json"
    if d_present:
        dm = json.loads(dm_raw)
        if not (isinstance(dm, dict) and "meta" in dm and isinstance(dm.get("metrics"), list)):
            fail("runs/v2/metrics_d.json is not in the role D layout {meta, metrics}")
        D_SHA = _sha(dm_raw)
        db = {e["id"]: e for e in dm["metrics"]}

        def dd(eid):
            if eid not in db:
                fail(f"{RUNS}/metrics_d.json has no metric {eid}")
            return db[eid]

        for key, eid in (("D1", "gate.D1"), ("D2", "gate.D2"), ("moon_recall", "gate.moon_recall")):
            statuses[key] = _status(dd(eid)["status"], eid)
            sources[key] = {"source_file": D_SRC, "sha256": D_SHA}
        # the positive finding
        for mod, label in (("M0", "terrain_only"), ("M3", "fitted")):
            e = dd(f"d.noill.{mod}.fpr25_moon_all")
            F.add(f"v2.result.d.fpr.{label}", _pct(e["value"]), D_SRC, D_SHA)
        ch = dd("d.noill.M3.fpr25_moon_all")["chance"]
        F.add("v2.result.d.fpr.chance_min", _pct(ch["min"]), D_SRC, D_SHA)
        F.add("v2.result.d.fpr.chance_max", _pct(ch["max"]), D_SRC, D_SHA)
        F.add("v2.result.d.fpr.chance_draws", str(int(ch["n_draws"])), D_SRC, D_SHA)
        folds = {k[len("d.noill.M3.n_folds_w"):]: int(v["value"]) for k, v in db.items() if k.startswith("d.noill.M3.n_folds_w")}
        w_best = max(folds, key=lambda k: folds[k])
        F.add("v2.result.d.weight", w_best, D_SRC, D_SHA)
        F.add("v2.result.d.folds_at_weight", str(folds[w_best]), D_SRC, D_SHA)
        F.add("v2.result.d.folds_total", str(sum(folds.values())), D_SRC, D_SHA)
        # Mars retrieval
        for cut in ("5", "10", "25"):
            vals = {dd(f"d.noill.{m}.recall{cut}")["value"] for m in ("M0", "M3")}
            if vals != {0.0}:
                fail(f"Mars recall at top {cut} percent is no longer zero for M0 and M3; the text must be rewritten")
            F.add(f"v2.result.d.recall_cut{cut}", cut, D_SRC, D_SHA)
        F.add("v2.result.d.recall_value", "0", D_SRC, D_SHA)
        auc = [float(dd(f"d.noill.{m}.auc_mars")["value"]) for m in ("M0", "M1", "M2", "M3")]
        F.add("v2.result.d.auc_min", _fix(min(auc), 3), D_SRC, D_SHA)
        F.add("v2.result.d.auc_max", _fix(max(auc), 3), D_SRC, D_SHA)
        F.add("v2.result.d.n_positives", str(int(dd("d.noill.recall.n")["value"])), D_SRC, D_SHA)
        F.add("v2.result.d.n_units", str(int(dd("d.noill.fpr25_moon_all.n")["value"])), D_SRC, D_SHA)

    # ---- why each gate was not tested. D1 and D2 are blocked by the coverage rule (the page says so, so check the stored reason).
    reasons = {"G2_moon_layer2": a("gate.G2.moon_layer2")["what_this_means_for_the_analogy"]}
    if d_present:
        for g in ("D1", "D2"):
            if "valid share" not in dd(f"gate.{g}")["reason"]:
                fail(f"gate.{g} is no longer blocked by the coverage rule; the page text must be rewritten")
        reasons["moon_recall"] = dd("gate.moon_recall")["reason"]
    for k, v in reasons.items():
        if re.search(r"\d", v):
            fail(f"the stored reason for {k} holds a digit; it needs facts before it can be shown")

    # ---- own-tile percentiles for the one positive claim (role A descriptive entries)
    for site, slug in (("namib", "namib_sand_sea"), ("rak", "rub_al_khali")):
        F.add(f"v2.result.own.{site}.before", a(f"desc.baseline.moon.{slug}.mean_own_tile_pct")["display"], A_SRC, A_SHA)
        F.add(f"v2.result.own.{site}.after", a(f"desc.H.moon.{slug}.mean_own_tile_pct")["display"], A_SRC, A_SHA)

    # ---- stored values read by pattern from the documents
    audit_raw = _read(base, "docs/ENGINE_AUDIT.md")
    audit = audit_raw.decode("utf-8") if audit_raw else None
    if audit is None:
        fail("docs/ENGINE_AUDIT.md is needed for the limitations")
    AU_SRC, AU_SHA = f"{v2dir}/docs/ENGINE_AUDIT.md", _sha(audit_raw)
    F.add("v2.result.audit.dead_weight", _grab(audit, r"family weight (0\.\d+) of the base profile", "the illumination weight").group(1), AU_SRC, AU_SHA)
    F.add("v2.result.audit.dead_similarity", _grab(audit, r"similarity is below (1e-7) for every gated tile", "the illumination similarity bound").group(1).replace("1e-7", "0.0000001"), AU_SRC, AU_SHA)
    F.add("v2.result.audit.radius_km", _grab(audit, r"BEST tile within (\d+) km", "the best-of-radius distance").group(1), AU_SRC, AU_SHA)
    lo, hi = _grab(audit, r"within \d+ km, (\d+) to (\d+) gated tiles", "the number of tiles in the radius").groups()
    F.add("v2.result.audit.tiles_lo", lo, AU_SRC, AU_SHA)
    F.add("v2.result.audit.tiles_hi", hi, AU_SRC, AU_SHA)
    F.add("v2.result.audit.chance_best", _grab(audit, r"best of \d+ random tiles: (\d+\.\d)", "the chance level of the best-of-radius statistic").group(1), AU_SRC, AU_SHA)
    F.add("v2.result.audit.chance_own", _grab(audit, r"mean about \d+, near (\d+)\)", "the chance level of the own-tile statistic").group(1), AU_SRC, AU_SHA)
    sl, rl = _grab(audit, r"\((\d+\.\d) deg slope, (\d+) m relief\)", "the Shackleton window spread").groups()
    F.add("v2.result.audit.sigma_slope", sl, AU_SRC, AU_SHA)
    F.add("v2.result.audit.sigma_relief", rl, AU_SRC, AU_SHA)
    # the polar band with no thermal value at all, and the QC rule, from the role A report and ledger
    row = _grab(ra, r"\|\s*-90 to -80\s*\|\s*([\d,]+)\s*\|\s*([\d,]+)\s*\|\s*([\d.]+)\s*\|", "the -90 to -80 latitude band row")
    if row.group(1) != row.group(2):
        fail("the -90 to -80 band is no longer fully missing; the Antarctica sentence must be rewritten")
    F.add("v2.result.cov.polar_band_south", "90", RA_SRC, RA_SHA)
    F.add("v2.result.cov.polar_band_north", "80", RA_SRC, RA_SHA)
    F.add("v2.result.cov.polar_band_missing_pct", _pct(float(row.group(3)), 0), RA_SRC, RA_SHA)
    modis = next((e for e in json.loads(al_raw)["entries"] if e["id"] == "src.modis"), None)
    if modis is None:
        fail("runs/v2/ledger.json has no src.modis entry")
    LG_SRC, LG_SHA = f"{v2dir}/{RUNS}/ledger.json", _sha(al_raw)
    b0, b1, bv = _grab(modis["statement"], r"QC bits (\d)-(\d) equal (\d)", "the MOD11A2 QC rule").groups()
    F.add("v2.result.qc.bit_first", b0, LG_SRC, LG_SHA)
    F.add("v2.result.qc.bit_second", b1, LG_SRC, LG_SHA)
    F.add("v2.result.qc.bit_value", bv, LG_SRC, LG_SHA)
    # negatives: a count of rows in the committed negative set, and the stored NDVI bound
    neg_raw = _read(base, f"{RUNS}/negative_set_d.csv")
    dl = json.loads(dl_raw) if dl_raw else None
    if neg_raw is not None and dl is not None:
        n_neg = len(list(csv.DictReader(io.StringIO(neg_raw.decode("utf-8"), newline=""))))
        F.add("v2.result.neg.n_tiles", str(n_neg), f"{v2dir}/{RUNS}/negative_set_d.csv", _sha(neg_raw))
        proxy = next((e for e in dl["entries"] if e["id"] == "limit.bare_proxy"), None)
        if proxy is None:
            fail("runs/v2/ledger_d.json has no limit.bare_proxy entry")
        F.add("v2.result.neg.ndvi_max", _grab(proxy["statement"], r"NDVI median at most (0\.\d+)", "the NDVI bound").group(1), f"{v2dir}/{RUNS}/ledger_d.json", _sha(dl_raw))

    c = lambda cid: _fact(F, cid)  # noqa: E731

    # ---- limitations (plain language; every number is a fact above)
    limitations = [
        {
            "id": "coverage",
            "title": "Coverage is low and not random",
            "text": (
                f"The Earth thermal layer has a value for {c('v2.result.coverage_pct')}% of land tiles between {c('v2.result.cov.band_south')} S and {c('v2.result.cov.band_north')} N, below the {c('v2.result.g1.required')} share the plan required. "
                f"The strict quality rule on the MODIS land surface temperature product (quality bits {c('v2.result.qc.bit_first')} and {c('v2.result.qc.bit_second')} must equal {c('v2.result.qc.bit_value')}) drops central Australia, Indonesia, the Amazon and part of Siberia. "
                f"In Antarctica, every land tile in the {c('v2.result.cov.polar_band_south')} S to {c('v2.result.cov.polar_band_north')} S band is missing ({c('v2.result.cov.polar_band_missing_pct')}%), and other Antarctic bands lose many tiles too. "
                "Tiles without a value are left out of the scored set, so the Earth set is not a random sample of Earth. A rerun with a looser quality rule was not completed before the freeze."
            ),
        },
        {
            "id": "dead_illumination",
            "title": "In v1, one scoring weight did nothing",
            "text": (
                f"About a quarter of the Moon-side weight ({c('v2.result.audit.dead_weight')}) went to illumination. Earth tiles did not match the lunar polar lighting: the similarity was below {c('v2.result.audit.dead_similarity')} for every gated Earth tile. "
                "That weight contributed nothing, so the weights shown for v1 overstate what its score used."
            ),
        },
        {
            "id": "statistic",
            "title": "The v1 site statistic sits near chance",
            "text": (
                f"The v1 site score is the best of the {c('v2.result.audit.tiles_lo')} to {c('v2.result.audit.tiles_hi')} gated tiles within {c('v2.result.audit.radius_km')} km of a site. A site with random features scores about {c('v2.result.audit.chance_best')} on that statistic, so the v1 control and analog scores say little. "
                f"The own-tile statistic (the single nearest tile) has a chance level near {c('v2.result.audit.chance_own')} and is reported as the honest secondary. See the engine audit."
            ),
        },
        {
            "id": "sigma",
            "title": "The tolerance for each trait is wide",
            "text": (
                f"Each trait's tolerance (sigma) comes from the spread inside the Shackleton window: {c('v2.result.audit.sigma_slope')} degrees of slope and {c('v2.result.audit.sigma_relief')} m of relief. That is wide, so large differences still score as partial matches, which flattens discrimination."
            ),
        },
    ]

    if d_present and "v2.result.neg.n_tiles" in F.rows:
        limitations[3:3] = [
            {
                "id": "mars_positives",
                "title": "Mars has very few analog positives",
                "text": (
                    f"Only {c('v2.result.d.n_positives')} Mars analog sites could be scored. Mars recall was {c('v2.result.d.recall_value')} at the top {c('v2.result.d.recall_cut5')}, {c('v2.result.d.recall_cut10')} and {c('v2.result.d.recall_cut25')} percent of tiles. "
                    f"The area under the ROC curve (AUC) for Mars analogs was {c('v2.result.d.auc_min')} to {c('v2.result.d.auc_max')}; an AUC under one half means the analog sites ranked lower than most of the negative tiles. Mars stays a low-confidence secondary result."
                ),
            },
            {
                "id": "negatives",
                "title": "The negative set is a proxy and is clustered",
                "text": (
                    f"The negative set is {c('v2.result.neg.n_tiles')} tiles chosen by a vegetation-index proxy (NDVI median at most {c('v2.result.neg.ndvi_max')}), not by a land-cover class. The tiles cluster in a few deserts and are not independent, so false-positive rates look more certain than they are."
                ),
            },
        ]

    positive = None
    if d_present:
        positive = {
            "text": (
                f"Adding the Earth thermal layer reduced Moon-side false positives. Own-tile percentile fell from {c('v2.result.own.namib.before')} to {c('v2.result.own.namib.after')} at the Namib sand sea and from {c('v2.result.own.rak.before')} to {c('v2.result.own.rak.after')} at the Rub' al Khali. "
                f"The fitted model's held-out Moon false-positive rate fell from {c('v2.result.d.fpr.terrain_only')}% (terrain only) to {c('v2.result.d.fpr.fitted')}% (chance range {c('v2.result.d.fpr.chance_min')}% to {c('v2.result.d.fpr.chance_max')}% over {c('v2.result.d.fpr.chance_draws')} draws with the thermal layer shuffled across tiles). "
                "It did not improve Mars analog retrieval."
            ),
            "model_note": f"The thermal weight {c('v2.result.d.weight')} was chosen in {c('v2.result.d.folds_at_weight')} of {c('v2.result.d.folds_total')} cross-validation folds.",
            "caveats": [
                "This is a descriptive result, not a passed test: D1 is NOT TESTED because the coverage gate failed.",
                "The same layer also lowered the own-tile percentile of the Moon analog site and the Mars analog sites, so the drop is not specific to non-analogs.",
                "The false-positive rate rests on a clustered, proxy-based negative set.",
            ],
        }

    # ---- run provenance and ledgers
    src = _sources_csv(base)

    def run(track, label, metrics_rel, status_rel, ledger_rel, engine):
        st = _read(base, status_rel)
        st_text = st.decode("utf-8") if st else ""
        info = src.get(metrics_rel, {})
        r = {"track": track, "label": label, "branch": info.get("branch", NOT_RECORDED), "commit": info.get("commit", NOT_RECORDED), "updated_ist": _status_field(st_text, "updated"), "stage": _status_field(st_text, "stage"), "source_file": f"{v2dir}/{ledger_rel}", "sha256": _sha(_read(base, ledger_rel) or b"")}
        if engine:
            r["engine_commit"] = engine
        return r

    runs = [run("A", "Role A: Earth thermal layer and gates", f"{RUNS}/metrics.json", f"{RUNS}/STATUS_A.md", f"{RUNS}/ledger.json", _grab(ra, r"Engine: v1 run code at commit ([0-9a-f]{7,40})", "the engine commit").group(1))]
    if d_present:
        runs.append(run("D", "Role D: fitted thermal terms, leave-one-site-out", f"{RUNS}/metrics_d.json", f"{RUNS}/STATUS_D.md", f"{RUNS}/ledger_d.json", None))

    def ledger_entries(track, doc, rel, raw):
        out = []
        for e in doc["entries"]:
            row = {"track": track, "id": e["id"], "type": e["type"], "status": e["status"], "statement": _public(e["statement"]), "source_file": f"{v2dir}/{rel}", "sha256": _sha(raw)}
            note = e.get("limit") or e.get("what_this_means_for_the_analogy")
            if note:
                row["note"] = _public(note)
            out.append(row)
        return out

    ledger = ledger_entries("A", json.loads(al_raw), f"{RUNS}/ledger.json", al_raw)
    if d_present and dl is not None:
        ledger += ledger_entries("D", dl, f"{RUNS}/ledger_d.json", dl_raw)

    if not all(statuses.get(k) for k in ("G1", "G2", "G3")):
        fail("a gate status is missing")

    return (
        {
            "gate_statuses": statuses,
            "gate_sources": sources,
            "gate_reasons": reasons,
            "g2b_sites": sites,
            "g3_targets": g3,
            "d_track_present": d_present,
            "positive_finding": positive,
            "limitations": limitations,
            "runs": runs,
            "ledger": ledger,
            "engine_audit": {"path": AU_SRC, "sha256": AU_SHA},
        },
        F.list(),
    )


def _fact(F, cid):
    if cid not in F.rows:
        fail(f"text refers to unknown fact {cid}")
    return F.rows[cid]["number"]
