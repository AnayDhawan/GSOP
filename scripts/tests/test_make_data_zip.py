"""make_data must explain a missing v1 zip instead of failing with a traceback (E3). Standard library only."""
import contextlib
import io
import os
import sys
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))

import make_data  # noqa: E402


class MissingZipTests(unittest.TestCase):
    def test_a_missing_zip_gives_a_clear_message_and_exit_code_two(self):
        err = io.StringIO()
        with contextlib.redirect_stderr(err), contextlib.redirect_stdout(io.StringIO()):
            code = make_data.main(["--zip", "/no/such/dir/gsop_v1_results_2026-11-14.zip", "--no-export", "--root", "/tmp"])
        text = err.getvalue()
        self.assertEqual(code, 2)
        self.assertIn("gsop_v1_results_2026-11-14.zip", text)
        self.assertIn(make_data.V1_ZIP_SHA256, text)
        self.assertIn("check_claims.py", text)
        self.assertNotIn("Traceback", text)


if __name__ == "__main__":
    unittest.main()
