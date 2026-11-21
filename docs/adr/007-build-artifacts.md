# ADR-007: Resume PDF and OG image generated at build time with Playwright

- Status: accepted · 2026-11-21

## Decision
`scripts/postbuild.mjs` serves `dist/` locally, opens `/portfolio/resume/?print` in headless Chromium and calls
`page.pdf()` (A4, real text, single column) → `dist/resume/Joshua-Herbert-Japheth-Resume.pdf`. The same script
screenshots `/portfolio/og/` (an HTML template driven by `src/content/site.ts`) at 1200×630 → `dist/og.png`.

## Why
One content source for the site, the recruiter view and the PDF — they can never disagree.
Text in the PDF is selectable and ATS-readable. CI installs Chromium (`npx playwright install --with-deps chromium`).
