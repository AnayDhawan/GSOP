# Security policy

## Supported versions

Only the current `main` branch, which is what https://gsoplatform.vercel.app serves. GSOP is a research prototype with no tagged releases.

## Reporting a vulnerability

Do not open a public issue for a security problem.

Email **dhawansanay@gmail.com** with:

- a description of the problem
- steps to reproduce
- the likely impact
- a suggested fix, if you have one

The deployed site reads static JSON files and never calls a database at runtime, so the usual attack surface is small. The service key for the site-list edit store lives only in a local `.env` and is never committed.

## What to expect

| Stage | Target |
|---|---|
| Acknowledgement | within 72 hours |
| Status update | within 7 days |
| Fix or mitigation | within 30 days |

This is a student team, so these are targets, not guarantees.

## Scope

In scope: cross-site scripting, injection, exposed secrets, a dependency with a known CVE that affects the site.

Out of scope: problems in third-party services (Vercel, Esri tiles, GitHub), and the scientific limits of the ranking, which are published on the site.
