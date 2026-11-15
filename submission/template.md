## Project Name

GSOP: Geospatial Similarity Observation Platform

## High-Level Project Summary

GSOP is an open screening tool that ranks places on Earth by how closely they match Moon base and Mars sites. We wrote down our pass marks, called gates, before the second run, and we publish every result, failures included. Several gates failed and some could not be tested, so GSOP is a screening aid, not a finding. One thing did improve: adding an Earth thermal layer moved the Namib sand sea, a place that should score low, from percentile {{claim:v2.result.own.namib.before}} to {{claim:v2.result.own.namib.after}}. Every number on the site traces to a source file, and the data build is one command.

## Link to Project Demo

Demo deck (PDF): https://github.com/AnayDhawan/GSOP/blob/main/docs/demo/GSOP_demo_deck.pdf

## Link to Final Project

https://gsoplatform.vercel.app

## Detailed Project Description

The challenge asks for Earth places that could stand in for candidate Moon-base locations or Mars landing and exploration sites, and for an honest account of what makes a place analogous and where the analogy breaks down. GSOP is a transparent, reproducible screening method for that search, with an India focus.

What we built. Earth is cut into equal-area tiles, {{claim:landing.tile_km}} km on a side. Every land tile is compared with two lunar south pole targets (Connecting Ridge C1 and the Shackleton rim) and with Jezero crater on Mars, and tiles that fail the land-cover gates get no score. The site has a dashboard that ranks the {{claim:landing.n_sites}} sites we list ({{claim:landing.n_known}} known sites and {{claim:landing.n_candidates}} candidates not in our reference list) against the Moon or Mars, with a World view and an India view. It also has an Honest Map, a page for every site, a gates page, a Failure-First Ledger, and a Methods and limits page. We list {{claim:regions.count}} regions of flagged tiles, and every one is marked Unreviewed.

How we tested it. The first run scored terrain only, against criteria written down in advance. The second run added an Earth thermal layer from MODIS land surface temperature and a fitted model, and its gate thresholds were also written down and hash-pinned before any score existed.

What failed, shown first. In the first run the negative-control test failed: the Namib sand sea scored at percentile {{claim:metrics.moon.control.namib_sand_sea.rank_pct}} and the Rub' al Khali at percentile {{claim:metrics.moon.control.rub_al_khali.rank_pct}}, against a pre-registered maximum of percentile {{claim:metrics.moon.criterion.negative_control_rank_pct_max}}. The Mars median was {{claim:metrics.mars.primary_median_rank_pct}}, below the minimum of {{claim:metrics.mars.criterion.primary_median_rank_pct_min}}. In the second run, the gates read as stored: G1 {{status:G1}} (thermal coverage {{claim:v2.result.coverage_pct}} percent of land tiles against {{claim:v2.result.g1.required_pct}} required), G2 {{status:G2}} (the Moon controls scored {{claim:v2.result.g2a.namib}} and {{claim:v2.result.g2a.rak}} against a maximum of {{claim:v2.result.g2a.max}}, and {{claim:v2.result.g2b.n_at_or_above}} of {{claim:v2.result.g2b.n_scorable}} scorable Mars analog sites reached the top group), G2(c) {{status:G2c}} (it only checks that our engine reproduces the first run, not the analogy), G3 {{status:G3}} ({{claim:v2.result.g3.total}} supported regions, both at the Shackleton rim), and D1 {{status:D1}}, D2 {{status:D2}} and Moon recall {{status:moon_recall}}.

What improved. {{v2:positive}} {{v2:positive_note}}

Where the analogy breaks down. {{v2:limit.statistic}} {{v2:limit.dead_illumination}} {{v2:limit.mars_positives}} Gravity, air pressure, dust, radiation and regolith are not scored. An Earth place can match a target's terrain and still differ in everything else that matters for a mission. The ledger lists these differences, most of them provisional, and every site page has a section on where its analogy breaks down.

India focus. {{claim:landing.n_india_known}} India sites are in our reference list, each shown with its stored result, and most have no score because land-cover or data gates removed them. We also show a layer of Indian places gathered from public sources; they are unreviewed, not scored and not added to the reference list. Of our listed regions, one overlaps the India outline: {{india_region}}, with {{india_tiles}} tiles inside it. It is unreviewed, and the outline is a generalised shape, not an official map.

Making it checkable. Every number on the site has a row in a claims file that names its source file and hash. One command rebuilds every data file, and a second run gives identical output. A check on every change fails on banned wording, an unsourced number, or an altered uncertainty statement. The uncertainty statement from the analysis is printed word for word beside the results: "{{e32}}"

What it cannot tell you. The ranking has not been checked against independent data. Mars is a low-confidence secondary result. GSOP tells you where to look first, not that a place is a good analog, and a human look cannot be replaced by it.

## NASA Data

- SRTM elevation (NASA and CGIAR-CSI version), for Earth slope and relief.
- MODIS land cover (MCD12Q1) and vegetation index (MOD13A2), from NASA LP DAAC, to remove water, ice, vegetated and built or farmed tiles.
- MODIS land surface temperature (MOD11A2), from NASA LP DAAC, for the Earth thermal layer in the second run.
- LRO LOLA south polar elevation and permanently shadowed region maps, from the NASA Planetary Geodesy Data Archive, for the lunar targets.
- LRO Diviner South Polar Resource Product, from the NASA PDS Geosciences Node, for lunar thermal reference values.
- Mars Global Surveyor MOLA elevation (served by USGS Astrogeology) and TES thermal inertia maps (NASA PDS Geosciences Node), for the Mars target and its thermal reference values.
- NASA Glenn atmosphere model, and the NASA Mars fact sheet with the Glenn Mars atmosphere model, for air density and solar constants.
- NASA Blue Marble Earth picture, from NASA Earth Observatory, as the base of the Honest Map.

## Space Agency Partner & Other Data

- ESA Copernicus DEM GLO30 (ESA, DLR and Airbus), for Earth elevation where SRTM does not reach.
- Natural Earth, public domain, for the India outline and for region names (desert, plateau, range and populated place layers).
- Esri World Street Map, with OpenStreetMap contributors, as the dashboard basemap.
- Google Earth Engine, used to read the NASA and Copernicus layers.
- Published sources for target locations and limits: Barker et al. on the LOLA south pole model, and Glaser et al. on lighting at the lunar south pole.
- Site photos come from Wikimedia Commons and each carries its credit on the site page. The India places and the reference site list come from public pages and a team list, and are unreviewed.
- No partner agency endorses this project, and no NASA or ESA logo is used.

## Use of Artificial Intelligence

Yes. AI assistants were used, under human direction, and the site is built so that AI output cannot become a number on the site.
- The website, the data build scripts and the documentation were written with Claude Code, an AI coding assistant from Anthropic. Changes go through pull requests that must pass automated checks, and a person reviews the finished site and this text before submission.
- Parts of the analysis code and its decision log were written with AI assistants. Where the record says so, entries are marked as assistant-written, and evidence gathered by chat assistants is marked as not re-verified.
- The satellite image in the landing page hero was generated with ChatGPT's image tool. It is labelled on the page as an AI-generated illustration.
- The list of analog sites, and its descriptive text, came from a spreadsheet produced with an AI model. The site labels that text "teammate-written, unreviewed". The similarity scores in that spreadsheet are AI estimates and are never shown anywhere on the site.
- Every number shown comes from stored simulation results or from a source file, with a hash. No number is generated by an AI model at build time or in the browser.
