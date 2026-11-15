"""Tests for the site enrichment step (W8). Standard library only: python3 -m unittest discover -s scripts/tests"""
import json
import os
import shutil
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))

from gsop_data import claims, profiles  # noqa: E402


class Ctx:
    def __init__(self, root):
        self.root, self.logged = root, []

    def path(self, rel):
        return os.path.join(self.root, rel)

    def log(self, m):
        self.logged.append(m)


def good(slug="askja", **over):
    e = {
        "slug": slug,
        "place": "Askja caldera, Iceland",
        "summary": "A volcanic caldera in the Icelandic highlands used for lunar rover and astronaut training.",
        "terrain_geology": "Basaltic lava fields and a lake-filled caldera.",
        "climate": None,
        "access_and_facilities": "Reached by a mountain track in summer.",
        "hazards": None,
        "facts": [{"label": "Elevation", "value": "1,100", "unit": "m", "source_url": "https://example.org/askja"}],
        "image": {"file": f"{slug}.jpg", "title": "Askja", "author": "A. Person", "license": "CC BY-SA 4.0", "source_url": "https://commons.wikimedia.org/wiki/File:Askja.jpg", "credit": "Photo: A. Person, CC BY-SA 4.0, via Wikimedia Commons"},
        "sources": ["https://example.org/askja"],
        "confidence": "medium",
    }
    e.update(over)
    return e


class Profiles(unittest.TestCase):
    def setUp(self):
        self.root = tempfile.mkdtemp()
        os.makedirs(os.path.join(self.root, "data/reference"))
        os.makedirs(os.path.join(self.root, "public/data"))
        os.makedirs(os.path.join(self.root, "public/img/places"))
        shutil.copy(os.path.join(os.path.dirname(os.path.dirname(HERE)), "data/banned_words.txt"), os.path.join(self.root, "data/banned_words.txt"))
        with open(os.path.join(self.root, "public/img/places/askja.jpg"), "wb") as f:
            f.write(b"jpeg")
        with open(os.path.join(self.root, "public/data/sites.json"), "w") as f:
            json.dump({"sites": [{"slug": "askja"}, {"slug": "dallol"}]}, f)

    def tearDown(self):
        shutil.rmtree(self.root)

    def check(self, *entries):
        return profiles.problems(list(entries), {"askja", "dallol"}, self.root)

    def test_a_clean_entry_has_no_problems(self):
        self.assertEqual(self.check(good()), [])

    def test_prose_may_not_hold_digits(self):
        self.assertTrue(any("holds a digit" in p for p in self.check(good(summary="Rises to 1100 m."))))

    def test_banned_word_dash_and_unknown_slug_are_refused(self):
        bad_word = "".join(["disc", "overed"])  # spelled in two parts so no source file holds the banned word
        self.assertTrue(any("banned word" in p for p in self.check(good(summary=f"A place {bad_word} by a team."))))
        self.assertTrue(any("dash" in p for p in self.check(good(summary="A caldera — and a lake."))))
        self.assertTrue(any("not a slug" in p for p in self.check(good(slug="nowhere"))))

    def test_image_licence_and_file(self):
        e = good()
        e["image"]["license"] = "CC BY-NC 4.0"
        self.assertTrue(any("licence" in p for p in self.check(e)))
        e = good()
        e["image"]["file"] = "missing.jpg"
        self.assertTrue(any("missing under" in p for p in self.check(e)))
        for ok in ("CC0", "PD-USGov-NASA", "Public domain", "CC BY 2.0", "CC BY-SA 3.0 de"):
            e = good()
            e["image"]["license"] = ok
            self.assertEqual(self.check(e), [], ok)

    def test_fact_needs_a_source_url(self):
        e = good()
        e["facts"][0]["source_url"] = "askja"
        self.assertTrue(any("source_url" in p for p in self.check(e)))

    def test_build_writes_profiles_and_facts(self):
        with open(os.path.join(self.root, "data/reference/site_enrichment.json"), "w") as f:
            json.dump([good()], f)
        ctx = Ctx(self.root)
        profiles.build(ctx)
        doc = json.load(open(os.path.join(self.root, "public/data/site_profiles.json")))
        self.assertEqual(doc["profiles"]["askja"]["facts"][0]["value"], "1,100")
        self.assertEqual([f["number"] for f in doc["meta"]["facts"]], ["1100"])
        self.assertEqual(doc["meta"]["facts"][0]["claim"], "profiles.askja.f0.n0")
        self.assertIn("A. Person", doc["profiles"]["askja"]["image"]["credit"])
        self.assertTrue(claims.text_numbers("1,100") == ["1100"])

    def test_build_stops_on_a_violation(self):
        with open(os.path.join(self.root, "data/reference/site_enrichment.json"), "w") as f:
            json.dump([good(summary="Has 3 lakes.")], f)
        with self.assertRaises(SystemExit):
            profiles.build(Ctx(self.root))

    def test_build_skips_without_a_file(self):
        ctx = Ctx(self.root)
        profiles.build(ctx)
        self.assertFalse(os.path.exists(os.path.join(self.root, "public/data/site_profiles.json")))


if __name__ == "__main__":
    unittest.main()
