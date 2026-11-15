## Project Name

GSOP: Geospatial Similarity Observation Platform

## High-Level Project Summary

GSOP is an open screening tool that ranks places on Earth by how closely they match Moon base and Mars sites. We wrote down our pass marks, called gates, before the second run, and we publish every result, failures included. Several gates failed and some could not be tested, so GSOP is a screening aid, not a finding. One thing did improve: adding an Earth thermal layer moved the Namib sand sea, a place that should score low, from percentile 41.9 to 5.1. Every number on the site traces to a source file, and the data build is one command.

## Link to Project Demo

Demo deck (PDF): https://github.com/AnayDhawan/GSOP/blob/main/docs/demo/GSOP_demo_deck.pdf

## Link to Final Project

https://gsoplatform.vercel.app

## Detailed Project Description

The challenge asks for Earth places that could stand in for candidate Moon-base locations or Mars landing and exploration sites, and for an honest account of what makes a place analogous and where the analogy breaks down. GSOP is a transparent, reproducible screening method for that search, with an India focus.

What we built. Earth is cut into equal-area tiles, 6 km on a side. Every land tile is compared with two lunar south pole targets (Connecting Ridge C1 and the Shackleton rim) and with Jezero crater on Mars, and tiles that fail the land-cover gates get no score. The site has a dashboard that ranks the 120 sites we list (100 known sites and 20 candidates not in our reference list) against the Moon or Mars, with a World view and an India view. It also has an Honest Map, a page for every site, a gates page, a Failure-First Ledger, and a Methods and limits page. We list 20 regions of flagged tiles, and every one is marked Unreviewed.

How we tested it. The first run scored terrain only, against criteria written down in advance. The second run added an Earth thermal layer from MODIS land surface temperature and a fitted model, and its gate thresholds were also written down and hash-pinned before any score existed.

What failed, shown first. In the first run the negative-control test failed: the Namib sand sea scored at percentile 90.2 and the Rub' al Khali at percentile 75.6, against a pre-registered maximum of percentile 25.0. The Mars median was 61.3, below the minimum of 90.0. In the second run, the gates read as stored: G1 FAIL (thermal coverage 73.4 percent of land tiles against 85 required), G2 FAIL (the Moon controls scored 58.2 and 38.0 against a maximum of 25, and 0 of 4 scorable Mars analog sites reached the top group), G2(c) PASS (it only checks that our engine reproduces the first run, not the analogy), G3 FAIL (2 supported regions, both at the Shackleton rim), and D1 NOT TESTED, D2 NOT TESTED and Moon recall NOT TESTED.

What improved. Adding the Earth thermal layer reduced Moon-side false positives. Own-tile percentile fell from 41.9 to 5.1 at the Namib sand sea and from 11.5 to 3.4 at the Rub' al Khali. The fitted model's held-out Moon false-positive rate fell from 21.4% (terrain only) to 1.0% (chance range 11.4% to 34.8% over 1000 draws with the thermal layer shuffled across tiles). It did not improve Mars analog retrieval. The thermal weight 0.75 was chosen in 204 of 205 cross-validation folds.

Where the analogy breaks down. The v1 site score is the best of the 34 to 38 gated tiles within 20 km of a site. A site with random features scores about 97.1 on that statistic, so the v1 control and analog scores say little. The own-tile statistic (the single nearest tile) has a chance level near 50 and is reported as the honest secondary. See the engine audit. About a quarter of the Moon-side weight (0.2513) went to illumination. Earth tiles did not match the lunar polar lighting: the similarity was below 0.0000001 for every gated Earth tile. That weight contributed nothing, so the weights shown for v1 overstate what its score used. Only 4 Mars analog sites could be scored. Mars recall was 0 at the top 5, 10 and 25 percent of tiles. The area under the ROC curve (AUC) for Mars analogs was 0.037 to 0.112; an AUC under one half means the analog sites ranked lower than most of the negative tiles. Mars stays a low-confidence secondary result. Gravity, air pressure, dust, radiation and regolith are not scored. An Earth place can match a target's terrain and still differ in everything else that matters for a mission. The ledger lists these differences, most of them provisional, and every site page has a section on where its analogy breaks down.

India focus. 6 India sites are in our reference list, each shown with its stored result, and most have no score because land-cover or data gates removed them. We also show a layer of Indian places gathered from public sources; they are unreviewed, not scored and not added to the reference list. Of our listed regions, one overlaps the India outline: Region 04, with 94 tiles inside it. It is unreviewed, and the outline is a generalised shape, not an official map.

Making it checkable. Every number on the site has a row in a claims file that names its source file and hash. One command rebuilds every data file, and a second run gives identical output. A check on every change fails on banned wording, an unsourced number, or an altered uncertainty statement. The uncertainty statement from the analysis is printed word for word beside the results: "The Monte Carlo varies the weights and, for the Moon only, the slope and relief measurement error, and applies no systematic Earth bias to any of the 15 Earth columns, so the reported score bands and robust-tile counts understate the real uncertainty."

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
