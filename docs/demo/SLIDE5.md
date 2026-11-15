# Fifth slide: the result as it is, failures shown

Source text for the fifth slide of the demo deck (issue E10). Built by `python3 scripts/build_submission.py`; do not edit `docs/demo/SLIDE5.md` by hand.

## Title

What the v2 gates found

## Gate table (statuses as stored: PASS, FAIL or NOT TESTED)

| Gate | Status | Evidence |
|---|---|---|
| G1 coverage | FAIL | Coverage 0.7340 vs required 0.85 |
| G2 scoring | FAIL | Fails because a clause failed |
| G2(a) Moon controls | FAIL | Namib 58.2, Rub' al Khali 38.0, maximum 25 |
| G2(b) Mars analogs | FAIL | 0/4 scorable sites at or above the 95th percentile |
| G2(c) baseline | PASS | Reproduces v1: 90.19 / 75.56 / 61.29 |
| G3 regions | FAIL | 2 supported regions, both Shackleton rim |
| D1 held-out false positives | NOT TESTED | Blocked by the coverage gate |
| D2 Mars recall | NOT TESTED | Blocked by the coverage gate |
| Moon recall | NOT TESTED | Two Moon positives, one not scorable |

## The one positive result

Adding the Earth thermal layer reduced Moon-side false positives. Own-tile percentile fell from 41.9 to 5.1 at the Namib sand sea and from 11.5 to 3.4 at the Rub' al Khali. The fitted model's held-out Moon false-positive rate fell from 21.4% (terrain only) to 1.0% (chance range 11.4% to 34.8% over 1000 draws with the thermal layer shuffled across tiles). It did not improve Mars analog retrieval.

The thermal weight 0.75 was chosen in 204 of 205 cross-validation folds.

## Mars, as it is

Only 4 Mars analog sites could be scored. Mars recall was 0 at the top 5, 10 and 25 percent of tiles. The area under the ROC curve (AUC) for Mars analogs was 0.037 to 0.112; an AUC under one half means the analog sites ranked lower than most of the negative tiles. Mars stays a low-confidence secondary result.

## Limitation to keep on the slide

The Earth thermal layer has a value for 73.4% of land tiles between 55 S and 60 N, below the 0.85 share the plan required. The strict quality rule on the MODIS land surface temperature product (quality bits 0 and 1 must equal 0) drops central Australia, Indonesia, the Amazon and part of Siberia. In Antarctica, every land tile in the 90 S to 80 S band is missing (100%), and other Antarctic bands lose many tiles too. Tiles without a value are left out of the scored set, so the Earth set is not a random sample of Earth. A rerun with a looser quality rule was not completed before the freeze.

## Speaker note

Mars is a low-confidence secondary result. The ranking has not been checked against independent data.
