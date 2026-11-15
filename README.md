# GSOP site

[![CI](https://github.com/AnayDhawan/GSOP/actions/workflows/ci.yml/badge.svg)](https://github.com/AnayDhawan/GSOP/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Live site](https://img.shields.io/badge/live-gsoplatform.vercel.app-287db5.svg)](https://gsoplatform.vercel.app)

Website for GSOP, a screening method that scores every 6 km land tile on Earth by how much it resembles a lunar or Martian target. Built for NASA Space Apps Challenge 2026.

The ranking is a screening aid, not a result that has been checked against independent data. Limits are stated on the site.

**Live site:** https://gsoplatform.vercel.app

## Where we stand

The pre-registered gates are published as they came out, failures included.

| Gate | Status |
|---|---|
| G1 coverage | FAIL |
| G2 scoring | FAIL |
| G2(c) engine reproduction | PASS |
| G3 supported regions | FAIL |
| D1 fitted model, Moon | NOT TESTED |
| D2 fitted model, Mars | NOT TESTED |
| Moon recall | NOT TESTED |

G2(c) only checks that the engine reproduces v1. It does not test the analogy. Mars is a low-confidence secondary result. The full results, the limits and the failure-first ledger are on the site's [gates page](https://gsoplatform.vercel.app/gates).

## Run it

```
npm install
npm run dev
```

Needs Node 24 or newer. Other commands: `npm run build`, `npm run lint`, `npm test`.

## Data and how to reproduce it

The site reads static files under `public/data/`. They are built by one command and never edited by hand. Every number on the site has a row in `public/data/claims.csv` with its source file and hash.

- File layout, schemas and limits: [docs/DATA_CONTRACT.md](docs/DATA_CONTRACT.md)
- Data credits and caveats: [data sources](https://gsoplatform.vercel.app/data-sources)
- Pre-registration records and results: `data/v2/runs/v2/` (hash-pinned, do not edit)

To rebuild and check:

```
pip install -r scripts/requirements.txt
python3 scripts/make_data.py
python3 scripts/check_claims.py
```

`make_data.py` needs the v1 results zip, which is not committed. Without it, the committed files are the reference: `check_claims.py` verifies every claim against them, standard library only, and runs in CI.

## Layout

- `src/app`: pages and global styles
- `src/lib`: shared helpers
- `scripts`: data build and claims check
- `data`: reference data and the v2 run records
- `docs`: data contract, decisions, site notes
- `CLAUDE.md`: project rules for contributors and coding agents

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Field measurements from analog sites, especially in India, and source corrections are the most useful contributions. Security reports go through [SECURITY.md](SECURITY.md).

## Citing

GSOP team (2026). GSOP: Geospatial Similarity Observation Platform, a screening index for Earth analog sites. https://github.com/AnayDhawan/GSOP, commit `<hash>`. There is no DOI.

## Licence

MIT. See `LICENSE`.

Not affiliated with or endorsed by NASA.
