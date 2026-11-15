# Judge-criteria audit (issue J1)

Audit of the repository and the live site (https://gsoplatform.vercel.app) against the judging criteria: validity, influence, creativity, relevance and presentation. Run on 15 Nov 2026 after the feature freeze, against main. The QA checklist results are on issue #82 and are not repeated here.

Result words: PASS means checked and met. PARTIAL means part is met. GAP means not met. No new fix issues are opened: the freeze has passed, so each gap carries an accepted reason and is listed for after the hackathon.

## Validity

| Item | Check | Evidence | Result | Fix or accepted reason |
|---|---|---|---|---|
| a | Claims check passes in CI | `python3 scripts/check_claims.py` in every pull request run; green on main | PASS | |
| a | `make_data` gives identical output | A fresh clone of main plus one `make_data.py` run with the v1 zip changes no committed file (`git status` empty), and a second run changes nothing | PASS | |
| a | README has exact reproduce commands and the seed | README, "Rebuild the data": commands, the zip's name and sha256, where to ask for it, and the master seed | PASS | Added with this audit (the seed was missing) |
| b | Ledger shows pre-registration hashes | `/ledger` prints the pre-registration hashes for v1 (Moon and Mars), A, the A addendum, D, B and C | PASS | |
| b | Each hash has a link | Hashes are printed, not linked to the files | PARTIAL | Accepted: the files are in `data/v2/runs/v2` in the repository; adding links is cosmetic |
| c | Gates page shows literal PASS, FAIL, NOT TESTED | `/gates`: G1 FAIL, G2 FAIL, G2(a) FAIL, G2(b) FAIL, G2(c) PASS, G3 FAIL, D1, D2 and Moon recall NOT TESTED, built from the stored v2 results | PASS | |
| c | G-C2 shown as NOT MET (94 of 120 against 110) | Track C (site measurements, `claims_c.csv`) was never delivered, so no measurement count appears anywhere | GAP | Accepted: nothing is claimed that the files do not hold. Show it when track C exists |
| d | "What held up" list with claims rows | No such list on the site. The one positive result is stated on `/gates` with claims rows | GAP | Accepted: the site states the positive result and what it does not show; a separate list risks reading as proof |
| e | Limitations: causes of the high control scores labelled as untested hypotheses | `/gates` gives six limitations (coverage, dead illumination weight, best-of-radius statistic, Mars positives, negative set, sigma). None is labelled an untested hypothesis | GAP | Accepted: the stated causes are measured facts from the run, not guesses; a hypotheses list needs the team's input |
| e | Moon has two positives so recall is untested | `/gates`: Moon recall NOT TESTED, two positives, one not scorable | PASS | |
| e | Arcadia gap | `/ledger` and `/method` | PASS | |
| e | Approximate coordinates (60 of 120) | Said on `/india` only; not on the site pages or the explorer | GAP | Accepted: listed for after the hackathon |
| e | The 120-site list had no source URLs | Site pages say the text was researched from public sources and carry per-fact source links; the original absence of URLs is not stated | PARTIAL | Accepted: the profiles replaced the list text |
| e | Product coverage gaps | `/gates` and `/data-sources`: thermal coverage and the Antarctic gap | PASS | |
| e | Dataset ID substitutions | Not stated on the site | GAP | Accepted: recorded in `data/v2/SOURCES.csv` and the sim ledger; listed for later |
| e | Monte Carlo uncertainty understated | The E32 sentence, word for word, on `/`, `/gates`, `/ledger`, `/method` and `/dashboard` | PASS | |
| f | "What a longer run would do" | `/roadmap` and `/method` ("what would change our mind"), with no dates promised | PASS | |
| g | Completion scorecard page | None | GAP | Accepted: the gates page is the scorecard of the pass marks; a percent complete would be easy to misread as accuracy |

## Influence

| Item | Check | Evidence | Result | Fix or accepted reason |
|---|---|---|---|---|
| h | Three concrete uses tied to site content | `/docs/researchers` and `/docs/organizations` describe two audiences; `/roadmap` and `/india` cover the India places. No educator use | PARTIAL | Accepted: listed for later |
| i | Download buttons for tiles, regions and sites | `/docs/data-access` links 19 static files by URL (JSON for sites, tiles, regions, metrics, ledger; CSV for the claims). There are no buttons and no CSV for tiles, regions or sites | PARTIAL | Accepted: the files are public and documented; CSV exports are listed for later |
| j | Shareable per-site URLs | `/sites/<slug>` for every site, static | PASS | |
| j | Mobile layout passes | Final UI check (issue #120, GO): 26 routes at 1440, 1273 and 390 px in both themes | PASS | |
| j | Lighthouse accessibility and performance, target 90 or more | Reported on #82 (live, mobile): `/` performance 98, accessibility 100; `/dashboard` performance 84, accessibility 100 | PARTIAL | Accepted: the dashboard map is heavy; accessibility meets the target |
| j | Logo link has an accessible name | The header logo link has `aria-label="GSOP home"` and the image `alt="GSOP"` | PASS | |

## Creativity

| Item | Check | Evidence | Result | Fix or accepted reason |
|---|---|---|---|---|
| k | First screen shows the failure-first ledger, pre-registration and traceable numbers | The first screen has "Gate results" beside "Open the dashboard"; "The short version" is directly below. The hash is not on the first screen | PARTIAL | Accepted: the gates are one click away and the strip below the hero states the result |
| k | Click a headline number to reach its claim row | Numbers are not links. `/docs/researchers` explains how to look a number up in `claims.csv` | GAP | Accepted: needs a design for 14 thousand claims; listed for later |
| l | India angle visible | The landing page covers India and `/india` lists the places with sources, labelled unreviewed and not scored | PASS | |

## Relevance

| Item | Check | Evidence | Result | Fix or accepted reason |
|---|---|---|---|---|
| m | Page mapping the challenge text to the site | `/method` opens with "The question", which restates the challenge and what GSOP answers. There is no table that maps each official requirement to a page | PARTIAL | Accepted: listed for later |
| n | No dead links | Crawl of the built site: 82 internal pages all 200; 242 external links, five dead ones replaced with archived copies (PR #131), the rest listed with a reason in `submission/LINK_CHECK.md` (they refuse automated requests or the server errored) | PASS | A few external pages could not be checked by script |
| n | Every nav item loads; build and Vercel pass | Yes, on every pull request | PASS | |
| n | Only the one site address is linked | No other Vercel address appears in the repository | PASS | |

## Presentation

| Item | Check | Evidence | Result | Fix or accepted reason |
|---|---|---|---|---|
| o | Deck follows the slide plan | `docs/demo/GSOP_demo_deck.pdf`: seven slides in the plan's order; the hosted file is byte-identical to the committed one | PASS | Slides 4 and 6 use small dashboard crops |
| o | Landing first screen states the question, the result and the failure | Hero: what GSOP is and that failures are published; "The short version" below states what was built, tested and found, with the gate counts | PASS | |

## Honesty rules

| Rule | Evidence | Result |
|---|---|---|
| Banned words absent | `check_claims.py` and `audit_site.py` in CI | PASS |
| E32 sentence word for word | Allow-listed and compared with `docs/E32.txt` in `check_claims.py` | PASS |
| Every number has a claims row | `check_claims.py`; page source holds no typed number | PASS |
| LLM scores never reach the site | The site list and the profiles carry no score columns; `export_sites.py` refuses a score-like column | PASS |
| Nothing claims more than the numbers show | Gate statuses are literal; Mars is a low-confidence secondary result; the ranking is stated as not checked against independent data | PASS |

## What to do next

Gaps worth doing first after the hackathon: the completion and "what held up" views done with care, the approximate-coordinate note on site pages, CSV exports for tiles, regions and sites, and a table that maps the challenge text to the site. Track C (site measurements) would also close item c.
