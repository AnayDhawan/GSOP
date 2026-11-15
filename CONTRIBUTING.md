# Contributing to GSOP

GSOP is a research prototype: a screening method that ranks places on Earth by how closely they match a Moon base or Mars target, built for the NASA Space Apps Challenge 2026. It publishes its failed gates next to its results. Contributions that keep that honesty intact are welcome.

## Ways to help

- **Field measurements.** Logger or instrument data from an analog site, with a date, a place and the instrument. Indian field sites (Ladakh and others) are the most useful.
- **Source corrections.** A wrong coordinate, a dead link, a claim a source does not support.
- **Bug reports and fixes** for the site.
- **Wording fixes** that make a limit clearer.

Nothing you send shows up as a result until it has a source and a row in the claims file.

## Set up

```
npm install
npm run dev
```

Needs Node 24 or newer. Before opening a pull request, run:

```
npm run lint
npm test
npm run build
python3 scripts/check_claims.py
```

CI runs the same four checks.

## Rules that are not negotiable

1. **No new simulation.** The site reads stored v1 and v2 outputs. It never recomputes a score.
2. **Every number comes from a data file and a row in `claims.csv`.** Do not type a number into a page, a script or a text file. `scripts/check_claims.py` fails the build when one slips through.
3. **Statuses are literal.** A gate reads `PASS`, `FAIL` or `NOT TESTED`. Never soften, reword or hide one.
4. **Banned words:** "validated", "discovered", "undiscovered", "new sites". Say "candidates not in our reference list" and "screening tool". The list is in `data/banned_words.txt`.
5. **The E32 uncertainty sentence** (`docs/E32.txt`) is printed word for word next to results.
6. **Mars is a low-confidence secondary result.** Say so wherever Mars scores appear.
7. **Files under `data/v2/runs/v2/` are pre-registration records.** Their hashes were registered before the results. Do not edit them.

## Writing style

- No em dashes. Use commas, colons, semicolons, periods or parentheses.
- Sentence case in headings.
- Bullets over prose where a list is honest.
- No AI-slop vocabulary (delve, seamless, leverage, unlock, showcase and similar).
- No `Co-Authored-By` trailer and no AI attribution in commits or pull requests.

## Pull requests

- Keep each pull request to one change. Atomic commits, imperative subject line.
- Say what you checked and how, in the description.
- Link the issue it closes, one `Closes #n` keyword per issue.
- Screenshots for any visible change, at 1440 px and 360 px wide, dark and light.

## Questions

Open an issue, or see the [contact page](https://gsoplatform.vercel.app/contact).

By contributing you agree that your contribution is released under the project's MIT licence.
