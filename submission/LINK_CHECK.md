# Link check for the submission (issue F12)

Run on 15 Nov 2026 at 21:43 IST. Method: plain `curl` with no cookies or credentials (logged out), following redirects; screenshots taken with a fresh headless Chrome profile. Final submit is Anay's, at 22:00 IST.

## Links in the submission text and the deck

| URL | Result (status, type, bytes) | In the submission text |
|---|---|---|
| https://github.com/AnayDhawan/GSOP/blob/main/docs/demo/GSOP_demo_deck.pdf | 200 text/html; charset=utf-8 167253 | yes |
| https://gsoplatform.vercel.app | 200 text/html; charset=utf-8 112563 | yes |
| https://github.com/AnayDhawan/GSOP | 200 text/html; charset=utf-8 352379 | no |
| https://raw.githubusercontent.com/AnayDhawan/GSOP/main/docs/demo/GSOP_demo_deck.pdf | 200 application/octet-stream 1663599 | no |
| https://gsoplatform.vercel.app/gates | 200 text/html; charset=utf-8 89814 | no |
| https://gsoplatform.vercel.app/dashboard | 200 text/html; charset=utf-8 219422 | no |
| https://gsoplatform.vercel.app/method | 200 text/html; charset=utf-8 127807 | no |
| https://gsoplatform.vercel.app/ledger | 200 text/html; charset=utf-8 174664 | no |
| https://gsoplatform.vercel.app/india | 200 text/html; charset=utf-8 75927 | no |
| https://gsoplatform.vercel.app/data-sources | 200 text/html; charset=utf-8 68786 | no |
| https://gsoplatform.vercel.app/credits | 200 text/html; charset=utf-8 40667 | no |
| https://gsoplatform.vercel.app/disclaimers | 200 text/html; charset=utf-8 42039 | no |
| https://gsoplatform.vercel.app/privacy | 200 text/html; charset=utf-8 37976 | no |
| https://gsoplatform.vercel.app/license | 200 text/html; charset=utf-8 36241 | no |
| https://gsoplatform.vercel.app/no-such-page | 404 text/html; charset=utf-8 32767 | no |

The address `/no-such-page` is expected to return 404 (the custom 404 page).

## The hosted deck is the committed file

- The raw file starts with `%PDF-`: yes.
- sha256 of the hosted bytes: `01e2d7efa2eb01c68efb198722cfce8f38a78fcc7e4c367c03f1e74742755425`
- sha256 of `docs/demo/GSOP_demo_deck.pdf` in the repo: `01e2d7efa2eb01c68efb198722cfce8f38a78fcc7e4c367c03f1e74742755425`
- Match: yes.

## Crawl of the whole built site

- 82 internal pages reached from the home page, none returned an error.
- 242 external links found on those pages, each tested logged out.

Not OK on the last run, after the fixes in this branch:

| Link | Result | Why it is left |
|---|---|---|
| https://apps.dtic.mil/sti/tr/pdf/ADA273716.pdf | 403 | refuses automated requests; not checked by script |
| https://books.aijr.org/index.php/press/catalog/book/177/chapter/3505 | 403 | refuses automated requests; not checked by script |
| https://etd.iisc.ac.in/handle/2005/4458 | 502 | the server returned an error on this run; retried once with the same result |
| https://ui.adsabs.harvard.edu/abs/2021Icar..36614511A | 405 | refuses automated requests; not checked by script |
| https://www.inkl.com/news/five-kutch-sites-resemble-mars-surface | 403 | refuses automated requests; not checked by script |
| https://www.scmp.com/news/china/science/article/3321150/china-completes-key-lanyue-lander-test-preparation-crewed-moon-mission-2030 | 403 | refuses automated requests; not checked by script |

Five links that returned 404 or no response were replaced with their Internet Archive snapshots in `data/reference/site_enrichment.json` (all five snapshots load, status 200). The facts they support are unchanged.

## Screenshots (live site, logged out, fresh profile, 1440 by 900)

- `submission/evidence/live-home.jpg`: Landing page
- `submission/evidence/live-gates.jpg`: Gate results
- `submission/evidence/live-dashboard.jpg`: Dashboard
- `submission/evidence/live-method.jpg`: Methods and limits

## Not done here

- The submission form itself: it needs a login, so the form is not filled in. The text for every field is in `submission/SUBMISSION.md`. Nobody but Anay presses final submit.
- The confirmation page can only be saved after Anay submits.
