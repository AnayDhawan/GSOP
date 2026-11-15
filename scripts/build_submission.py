#!/usr/bin/env python3
"""Build submission/SUBMISSION.md from submission/template.md (E7) and docs/demo/SLIDE5.md from submission/slide5_template.md (W1). Standard library only.

    python3 scripts/build_submission.py [--root DIR]
"""
import argparse
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from gsop_data import submission  # noqa: E402


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=os.path.dirname(HERE))
    a = ap.parse_args(argv)
    for tmpl, out in submission.PAIRS:
        if not os.path.exists(os.path.join(a.root, tmpl)):
            continue
        try:
            text = submission.render(a.root, tmpl)
        except submission.SubmissionError as e:
            print(f"build_submission: {e}", file=sys.stderr)
            return 1
        os.makedirs(os.path.dirname(os.path.join(a.root, out)), exist_ok=True)
        with open(os.path.join(a.root, out), "w", encoding="utf-8", newline="") as f:
            f.write(text)
        print(f"build_submission: wrote {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
