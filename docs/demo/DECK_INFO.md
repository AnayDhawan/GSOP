# Demo deck: everything the slides need

Written for the people building the demo deck (issues #63 and #64). Every number is copied from `public/data/claims.csv`; the claim id is in square brackets so it can be checked. Rebuild this file if a claim changes. Rules for every slide: no em dashes, no word from `data/banned_words.txt`, statuses printed literally (PASS, FAIL, NOT TESTED), the AI-made hero satellite carries a visible "AI-generated illustration" label wherever it appears.

## Deck at a glance

| Slide | Title | One job |
|---|---|---|
| 1 | GSOP | Say what it is and who made it |
| 2 | Why Earth analogs | The problem in one breath |
| 3 | What it does | The tool and its size |
| 4 | How it works | The method in four steps |
| 5 | What v2 found | The results as they are, failures shown |
| 6 | India first | The local angle: places, map, the call for ground data |
| 7 | What comes next | The plan after the hackathon |
| 8 | Open and honest | How to check us, and how AI was used |

A five-minute talk fits about forty seconds a slide. Slide 5 is the one to slow down on.

## Slide 1: GSOP

- Title: GSOP
- Full name, small: Geospatial Similarity Observation Platform
- Line: An open screening tool that ranks places on Earth by how closely they match Moon base and Mars sites. Every result, failures included, is published.
- Team: Anay Dhawan, Yash Kewlani, Vihaan Bhagwat, Shiven Sood, Shaurya Jani, Shaurya Gangrade
- Links: https://gsoplatform.vercel.app and https://github.com/AnayDhawan/GSOP
- Visual: `docs/img/landing.jpg` (Earth with the AI-made satellite). Credit it as "Hero satellite image: AI-generated illustration" (the site footer carries this line).

## Slide 2: Why Earth analogs

- Teams that plan Moon and Mars missions need somewhere on Earth to try rovers, drills and habitats first.
- Famous analog sites are few and well worn. A ranked screen can say where to look first.
- A screen is not a verdict: the ranking tells you where to look, not that a place is a good analog.
- Visual: `public/brand/motifs/gsop-planetary-comparison-dark.webp` (Moon, Earth, Mars).

## Slide 3: What it does

- Earth is cut into equal-area tiles, 6 km on a side. 3,972,955 land tiles [metrics.earth.land_tiles].
- Each tile is compared with Moon base and Mars (Jezero) reference profiles, on terrain and, in the second run, land surface temperature.
- 120 sites are in the reference list: 100 known, 20 candidates not in our reference list [landing.n_sites, landing.n_known, landing.n_candidates].
- 248 thermal reference values for 4 Moon and Mars targets, from LRO Diviner and Mars Global Surveyor TES [landing.n_thermal_values].
- 12 open data sources, each listed with its licence and caveats [landing.n_sources].
- Visual: `docs/img/dashboard-site-card.jpg` and `docs/img/dashboard-india.jpg`.

## Slide 4: How it works

1. Build tiles and reference profiles from open data: Copernicus DEM, SRTM, MODIS land surface temperature and land cover, LRO LOLA and Diviner, MOLA, TES.
2. Score every tile against each target. A Monte Carlo varies the weights and the slope and relief measurement error.
3. Write the pass marks down before the second run (pre-registration, hash-pinned files).
4. Print every result with its literal status, and put every number on the site in a claims file with its source file and hash.
- Visual: `docs/img/methodology-map.jpg`.
- Say once: the ranking is a screening aid. No Earth place has lunar gravity, vacuum or radiation.

## Slide 5: What v2 found

Use `docs/demo/SLIDE5.md` as the source text (built from the template, do not edit it by hand). Short version for the slide:

| Gate | Status | Evidence |
|---|---|---|
| G1 thermal coverage | FAIL | 73.4% of land tiles, against 85% required [v2.result.coverage_pct] |
| G2 scoring | FAIL | Moon controls scored 58.2 and 38.0, above the 25 maximum. 0 of 4 scorable Mars positives reached the top group |
| G2(c) engine reproduces v1 | PASS | It checks the engine, not the analogy |
| G3 supported regions | FAIL | Both supported regions are at the Shackleton rim |
| D1, D2, Moon recall | NOT TESTED | Blocked by the coverage gate, or too few scorable positives |

- The one improvement: adding the Earth thermal layer lowered the own-tile percentile of the Namib sand sea, a Moon negative control, from 41.9 to 5.1, and the Rub' al Khali from 11.5 to 3.4. Lower is better for a control.
- The fitted model's held-out Moon false-positive rate fell from 21.4% to 1.0%, against a chance range of 11.4% to 34.8% [v2.result.d.fpr.*].
- Mars is a low-confidence secondary result. The ranking has not been checked against independent data.
- The sentence below must stay word for word wherever results are shown:

> The Monte Carlo varies the weights and, for the Moon only, the slope and relief measurement error, and applies no systematic Earth bias to any of the 15 Earth columns, so the reported score bands and robust-tile counts understate the real uncertainty.

- Visual: `docs/img/gate-results.jpg`.

## Slide 6: India first

- 6 India entries are in our reference list, and one of the 20 candidate regions overlaps the India outline (Region 04) [landing.n_india_known, regions.count].
- Ladakh (Puga) scored 8.3 in the Mars thermal run, the lowest of the 4 scorable Mars positives. We do not know why. Ground data would show whether the coarse view holds [v2.result.g2b.ladakh_puga].
- New: an India highlights layer. Places that public sources describe as Moon or Mars analogs, marked on the dashboard India map and listed at `/india`. Gathered from public sources, not scored.
- The ask: if you hold measurements with a date, a place and an instrument, send them (`/contribute`).
- Visual: `docs/img/dashboard-india.jpg` (violet markers are the highlights; violet rings mark places already in the reference list).

### India highlights, one line each

In our reference list:

- Lonar crater (Maharashtra): Impact crater lake in basalt.
- Ladakh: Tso Kar and Puga (Ladakh): Cold desert with hot springs and salt lakes.
- Kutch: Matanomadh jarosite (Gujarat): Jarosite, a mineral NASA found on Mars.
- Sittampundi anorthosite complex (Tamil Nadu): Source rock of ISRO's lunar soil simulant.
- ISRO lunar terrain test facility (Karnataka): Where ISRO tests rovers on simulant soil.

Not in our reference list (suggestions, not findings):

- Sambhar Lake (Rajasthan): Inland salt lake, evaporite basin.
- Great Rann of Kutch (Gujarat): Salt marsh of flat saline clay.
- Tso Moriri (Ladakh): High lake with geothermal input.
- Spiti Valley (Himachal Pradesh): Cold desert with ice at altitude.
- Thar Desert (Rajasthan): Dust storms and dune fields.
- Deccan Traps (Western and central India): Flood basalt with clay-bearing soil layers.
- Baratang mud volcanoes (Andaman Islands): The only mud volcanoes in India.
- Borra Caves (Andhra Pradesh): Limestone caves, a sheltered setting.
- Kolar Gold Fields (Karnataka): Deep mines shielded from radiation.
- Dhala impact structure (Madhya Pradesh): Old impact structure in granite.

Sources are on each card at `/india`. The main ones: a 2025 review of planetary analog sites in the Indian subcontinent (Frontiers in Astronomy and Space Sciences), the Kachchh Mars-analog study (Michigan Tech), the ISRO lunar soil simulant paper (Icarus), and the Wikipedia page of each place for coordinates.

## Slide 7: What comes next

- Weeks one and two: build the simulation properly. One package, typed inputs, tests, every step cached and hashed.
- Weeks three to six: one month of simulation. Full Monte Carlo over every land tile and target, more Moon and Mars targets, drop-one-layer checks, a fresh negative set, held-out sites.
- After the run: check it against the ground, India first (Ladakh, Kutch, Lonar), then score the pre-registered gates and publish every result.
- Where results lead: gates pass, a ranked shortlist checked on the ground; some pass, narrow the claim; fail again, publish the negative result.
- Dates are targets, not promises. Nothing is funded or agreed with an agency.
- Visual: `docs/img/roadmap.jpg`.

## Slide 8: Open and honest

- Code and data are open (MIT). No login, no server-side queries: the data is static files.
- Every number on the site has a row in a claims file with its source file and sha256. A number with no row stops the build.
- Pre-registered files are hash-pinned and never edited after a run.
- Candidates are suggestions, not findings. Site text is teammate-written or gathered from public sources, and each card links its sources.
- How AI was used (say it on the slide, it is a submission requirement): the site, scripts and docs were written with Claude Code under human direction and checked by automated tests; the hero satellite was generated with ChatGPT's image tool and is credited in the footer of every page; the descriptive text for the analog sites came from a spreadsheet made with an AI model, and each profile links its sources; no number is generated by AI at build time or in the browser.
- Data credits: NASA MODIS, LRO LOLA and Diviner, MOLA, TES; USGS; ESA Copernicus DEM; Natural Earth; NASA Blue Marble; Earth textures in the hero from Solar System Scope (CC BY 4.0).
- Links: site, repository, `/gates`, `/ledger`, `/roadmap`, `/india`.

## How GSOP answers the challenge, honestly

| Goal | What GSOP does | The gap |
|---|---|---|
| Find places that resemble a Moon or Mars target | Ranks Earth land tiles and stores a percentile for every listed site | The pre-registered checks failed, and the ranking is not checked against independent data |
| Describe a place well enough to compare it | Photo, short profile, facts and open Earth data around each site | Profiles are short and point to their sources, and there are no full case studies yet |
| Cover more than terrain | Terrain and, in the second run, surface temperature | Nothing on biology, caves and lava tubes, dust or wind |
| Use data from space agencies | NASA, USGS and ESA open data | Other agencies' data is not used yet |
| Make it open and repeatable | Open code and data, claims file, pre-registered pass marks | A full rebuild needs the v1 results archive, which is not in the repository |
| Put India first | Indian sites in the list, an India map view, the India highlights layer | No ground measurements from India yet |

## Questions to expect, and the plain answer

- Does it work? Not yet. Three gates failed, one passed (the engine check), three could not be tested. It is a screening aid.
- Why publish failures? Pass marks were written before the run. Showing the failures is the point.
- Is Mars useful? Low confidence. Only a few Mars analog sites could be scored.
- Are the India places real findings? No. They come from public sources and are not scored. They are where we would ask for ground data.
- Who made the satellite? ChatGPT's image tool. It is labelled.
- What would change your mind? A rerun that passes its gates on independent ground data.

## Asset list

| Use | File |
|---|---|
| Hero / title | `docs/img/landing.jpg` |
| Dashboard and site card | `docs/img/dashboard-site-card.jpg` |
| India map | `docs/img/dashboard-india.jpg` |
| Gate results | `docs/img/gate-results.jpg` |
| Methodology map | `docs/img/methodology-map.jpg` |
| Roadmap | `docs/img/roadmap.jpg` |
| Logos | `public/brand/logos/` (horizontal dark and light SVG) |
| Moon, Earth, Mars | `public/brand/motifs/gsop-planetary-comparison-dark.webp` |
| Fonts | `public/brand/fonts/` (Space Grotesk for titles, Inter for text, JetBrains Mono for labels; SIL Open Font Licence) |
| Colours | Earth blue `#287DB5`; control red `#E8806E` for text; positive green `#43BD8B` for text; India highlight violet `#7C3AED` |

