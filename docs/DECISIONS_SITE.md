# Site decisions (issue A6)

## Locked
- **Name:** GSOP. Full name: Geospatial Similarity Observation Platform.
- **Theme tokens:** the GSOP brand pack. Tokens live in `src/app/globals.css` with the `--gsop-*` names, assets in `public/brand`. Dark is the default theme; light is available through `data-theme`.
- **Fonts:** Space Grotesk (headings), Inter (body), JetBrains Mono (labels). Self-hosted.
- **Controls on the Honest Map:** Martian red (`--gsop-martian-red`, utility `text-control`).
- **Wording (decision E32):** say "candidates not in our reference list". The banned words are listed in `data/banned_words.txt`. Mars is a low-confidence secondary result. The failed negative-control test is shown openly. The ranking has not been checked against independent data.

## Headline (locked by Anay, 2026-11-15; changed in the final-sprint brief, W3, to say what the system does; Anay to confirm)
Direction from E32: a transparent, reproducible screening method with an India focus, and what it can and cannot tell us.

Headline: **Screening Earth locations as analogs for Moon base and Mars operations**

Support line: **Open data, open method, and a plain account of what it cannot tell you.** (The landing hero prints a data-scale subline built from claims instead; this line is kept for the page description.)

Change these two lines here only; C4 (landing page) follows this file.

## Open
- Production domain: not chosen. Current deployment: https://gsoplatform.vercel.app
