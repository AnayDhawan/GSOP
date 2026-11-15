# Fifth slide: the result as it is, failures shown

Source text for the fifth slide of the demo deck (issue E10). Built by `python3 scripts/build_submission.py`; do not edit `docs/demo/SLIDE5.md` by hand.

## Title

What the v2 gates found

## Gate table (statuses as stored: PASS, FAIL or NOT TESTED)

| Gate | Status | Evidence |
|---|---|---|
| G1 coverage | {{status:G1}} | Coverage {{claim:v2.result.g1.coverage}} vs required {{claim:v2.result.g1.required}} |
| G2 scoring | {{status:G2}} | Fails because a clause failed |
| G2(a) Moon controls | {{status:G2a}} | Namib {{claim:v2.result.g2a.namib}}, Rub' al Khali {{claim:v2.result.g2a.rak}}, maximum {{claim:v2.result.g2a.max}} |
| G2(b) Mars analogs | {{status:G2b}} | {{claim:v2.result.g2b.n_at_or_above}}/{{claim:v2.result.g2b.n_scorable}} scorable sites at or above the {{claim:v2.result.g2b.percentile}}th percentile |
| G2(c) baseline | {{status:G2c}} | Reproduces v1: {{claim:v2.result.g2c.namib}} / {{claim:v2.result.g2c.rub}} / {{claim:v2.result.g2c.mars_median}} |
| G3 regions | {{status:G3}} | {{claim:v2.result.g3.total}} supported regions, both Shackleton rim |
| D1 held-out false positives | {{status:D1}} | Blocked by the coverage gate |
| D2 Mars recall | {{status:D2}} | Blocked by the coverage gate |
| Moon recall | {{status:moon_recall}} | Two Moon positives, one not scorable |

## The one positive result

{{v2:positive}}

{{v2:positive_note}}

## Mars, as it is

{{v2:limit.mars_positives}}

## Limitation to keep on the slide

{{v2:limit.coverage}}

## Speaker note

Mars is a low-confidence secondary result. The ranking has not been checked against independent data.
