"""Tests for the v2 gate results intake (W1). Standard library only: python3 -m unittest discover -s scripts/tests"""
import hashlib
import json
import os
import shutil
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.dirname(HERE))

from gsop_data import claims, v2  # noqa: E402

RUNS = os.path.join(REPO, "data/v2/runs/v2")
PREREG_HASHES = {
    "PREREG_A.md": "1758b132701ea831dea51c82ee9ebc3bd5c2c3a9e1544fdfe3eb7cd7a1e7992e",
    "PREREG_A_addendum1.md": "8e4fb4c8c555b30d748d763bd18b88d597b291663a2cab732a33d1e7511c7d92",
    "PREREG_D.md": "78b4c00cd1df5219ca8dbc2919d744d0414083aeba2e0cc35b5086e41a529610",
}


class Ctx:
    def __init__(self, repo, root):
        self.repo, self.root, self.sites = repo, root, []

    def log(self, m):
        pass


class CommittedFiles(unittest.TestCase):
    def test_preregistration_files_are_the_registered_bytes(self):
        for name, want in PREREG_HASHES.items():
            with open(os.path.join(RUNS, name), "rb") as f:
                self.assertEqual(hashlib.sha256(f.read()).hexdigest(), want, name)

    def test_every_text_file_is_lf(self):
        for dp, _, fs in os.walk(os.path.join(REPO, "data/v2")):
            for f in fs:
                if f.endswith((".md", ".json", ".csv", ".sha256")):
                    with open(os.path.join(dp, f), "rb") as fh:
                        self.assertNotIn(b"\r", fh.read(), os.path.join(dp, f))


class Build(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.repo = os.path.join(self.tmp, "repo")
        self.root = os.path.join(self.tmp, "out")
        shutil.copytree(os.path.join(REPO, "data/v2"), os.path.join(self.repo, "data/v2"))
        os.makedirs(os.path.join(self.root, "public/data"))

    def tearDown(self):
        shutil.rmtree(self.tmp)

    def build(self):
        v2.build(Ctx(self.repo, self.root))
        with open(os.path.join(self.root, "public/data/v2.json"), encoding="utf-8") as f:
            return json.load(f)

    def edit(self, rel, fn):
        p = os.path.join(self.repo, "data/v2", rel)
        with open(p, encoding="utf-8") as f:
            d = json.load(f)
        fn(d)
        with open(p, "w", encoding="utf-8", newline="") as f:
            json.dump(d, f)

    def test_real_results(self):
        d = self.build()
        self.assertTrue(d["run_completed"])
        r = d["results"]
        self.assertEqual(
            r["gate_statuses"],
            {"G1": "FAIL", "G2": "FAIL", "G2a": "FAIL", "G2b": "FAIL", "G2c": "PASS", "G2_moon_layer2": "NOT TESTED", "G3": "FAIL", "D1": "NOT TESTED", "D2": "NOT TESTED", "moon_recall": "NOT TESTED"},
        )
        self.assertEqual({p["id"]: p["matches"] for p in d["preregistrations"]}, {"A": True, "A_addendum1": True, "B": True, "C": True, "D": True})

    def test_unscorable_positives_are_not_counted_or_shown(self):
        r = self.build()["results"]
        by = {s["slug"]: s for s in r["g2b_sites"]}
        self.assertEqual([s for s, v in by.items() if v["scorable"]], ["haughton", "atacama_salars", "ladakh_puga", "mdrs_utah"])
        self.assertNotIn("claim", by["mcmurdo_dry_valleys"])  # its stored 0.0 is a placeholder (no gated tile)
        self.assertNotIn("claim", by["lonar"])

    def test_claims_cover_every_number_in_the_text(self):
        self.build()
        got = {r[0]: r for r in claims.build_claims(self.root)}
        want = {
            "v2.result.g1.coverage": "0.7340",
            "v2.result.g1.required": "0.85",
            "v2.result.g2a.namib": "58.2",
            "v2.result.g2a.rak": "38.0",
            "v2.result.g2a.max": "25",
            "v2.result.g2b.haughton": "86.6",
            "v2.result.g2b.atacama_salars": "52.7",
            "v2.result.g2b.ladakh_puga": "8.3",
            "v2.result.g2b.mdrs_utah": "75.0",
            "v2.result.g2b.n_scorable": "4",
            "v2.result.g2b.n_at_or_above": "0",
            "v2.result.g2c.namib": "90.19",
            "v2.result.g2c.rub": "75.56",
            "v2.result.g2c.mars_median": "61.29",
            "v2.result.g3.total": "2",
            "v2.result.coverage_pct": "73.4",
            "v2.result.own.namib.before": "41.9",
            "v2.result.own.namib.after": "5.1",
            "v2.result.own.rak.before": "11.5",
            "v2.result.own.rak.after": "3.4",
            "v2.result.d.fpr.terrain_only": "21.4",
            "v2.result.d.fpr.fitted": "1.0",
            "v2.result.d.fpr.chance_min": "11.4",
            "v2.result.d.fpr.chance_max": "34.8",
            "v2.result.d.weight": "0.75",
            "v2.result.d.folds_at_weight": "204",
            "v2.result.d.folds_total": "205",
            "v2.result.d.n_positives": "4",
            "v2.result.neg.n_tiles": "200",
            "v2.result.d.auc_min": "0.037",
            "v2.result.d.auc_max": "0.112",
        }
        for cid, n in want.items():
            self.assertEqual(got[cid][1], n, cid)
            self.assertTrue(got[cid][2].startswith("data/v2/"), cid)
        with open(os.path.join(self.root, "public/data/v2.json"), encoding="utf-8") as f:
            doc = json.load(f)
        nums = {r[1] for r in got.values()}
        for lim in doc["results"]["limitations"] + [doc["results"]["positive_finding"]]:
            for n in claims.text_numbers(lim["text"]):
                self.assertIn(n, nums, lim.get("id", "positive"))

    def test_a_boolean_or_lowercase_status_stops_the_build(self):
        for bad in (True, "fail", "N/A"):
            shutil.rmtree(os.path.join(self.repo, "data/v2"))
            shutil.copytree(os.path.join(REPO, "data/v2"), os.path.join(self.repo, "data/v2"))

            def mutate(d, bad=bad):
                for e in d["entries"]:
                    if e["id"] == "gate.G1":
                        e["status"] = bad

            self.edit("runs/v2/metrics.json", mutate)
            with self.assertRaises(SystemExit, msg=repr(bad)):
                self.build()

    def test_a_changed_failure_cause_stops_the_build(self):
        def mutate(d):
            for e in d["metrics"]:
                if e["id"] == "gate.D1":
                    e["reason"] = "something else"

        self.edit("runs/v2/metrics_d.json", mutate)
        with self.assertRaises(SystemExit):
            self.build()

    def test_track_a_alone_builds_without_track_d_text(self):
        for f in ("metrics_d.json", "ledger_d.json", "negative_set_d.csv"):
            os.remove(os.path.join(self.repo, "data/v2/runs/v2", f))
        r = self.build()["results"]
        self.assertFalse(r["d_track_present"])
        self.assertIsNone(r["positive_finding"])
        self.assertNotIn("D1", r["gate_statuses"])
        self.assertEqual([x["id"] for x in r["limitations"]], ["coverage", "dead_illumination", "statistic", "sigma"])

    def test_role_d_text_does_not_carry_the_banned_word(self):
        d = self.build()
        text = json.dumps(d["results"]["ledger"])
        self.assertNotIn("validated", text)
        self.assertIn("checked on held-out data", text)

    def test_empty_metrics_file_is_not_a_results_layout(self):
        shutil.rmtree(os.path.join(self.repo, "data/v2"))
        os.makedirs(os.path.join(self.repo, "data/v2/runs/v2"))
        for f in ("metrics.json", "ledger.json"):
            with open(os.path.join(self.repo, "data/v2/runs/v2", f), "w") as fh:
                fh.write("{}")
        d = self.build()
        self.assertTrue(d["run_completed"])
        self.assertIsNone(d["results"])


if __name__ == "__main__":
    unittest.main()
