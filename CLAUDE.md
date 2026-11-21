# CLAUDE.md — read this first

Portfolio of **Joshua Herbert Japheth** (GitHub `stredevirad`). Static, prerendered Vite + React 19 + TypeScript site,
deployed to GitHub Pages at **https://stredevirad.github.io/portfolio/** from the public repo `stredevirad/portfolio`.

Read order for any new session: this file → `docs/PROGRESS.md` → `docs/PORTFOLIO_FACTS.md` → `docs/ARCHITECTURE.md`.

## Non-negotiable rules

1. **Never invent metrics, users, awards, dates, employers, skills, testimonials, clients, visitor counters or GitHub stats.**
   Every number on the site is a typed `Claim` in `src/content/*.ts` with a source, a date and a status, and it must
   trace to a line in `docs/PORTFOLIO_FACTS.md`. Missing is fine; made up is not. Unverified → `docs/OPEN_QUESTIONS.md`.
2. **Hard exclusions — deliberate, set by Joshua; never add them back:**
   - AtomQuest, ExaThon / VoltProof, gIGNITE and TELIPORT are unfinished or dropped. Not achievements, not shown.
   - The NPTEL Modern C++ top-2 % result is a friend's, not Joshua's. Exclude it.
   - C++ is **not** a headline skill. Python leads every skills list. C++ may appear only in the Grammar Tax case-study stack.
   - One private repo (named only in the owner's private brief) must never be linked, named or described.
   - No phone number, no street address.
   - The easter-egg nickname appears only inside the hidden unlock (below) — never in visible copy, titles, meta,
     sitemap, the resume PDF or the README.
3. Context that must always render next to numbers (council Phase 0): Aegis "0 confidently wrong" always with
   "2 partially correct · 6 abstained · 0 fully correct" on 8 captures; the 15 synthetic scenarios are "a regression gate,
   not an accuracy estimate"; KeralaFloodBench leads with the failure finding (39 of 40), then 12/52 with "one complete run";
   Grammar Tax 1.47× always with "~+1.5 % end-to-end … not merged upstream". Test counts are static, never animated.
4. Team projects are credited as team projects with Joshua's role. AI-assistance disclosures only where the repo states them.

## Hidden easter egg (documented here only)

- Triggers: the Konami code (↑ ↑ ↓ ↓ ← → ← → B A) anywhere, or typing the nickname in the terminal (press `` ` ``).
- Effect: two SVG blade strokes slash across the screen, a level-up chime (if sound is on), a card reading
  "Player: Kirito, a.k.a. Joshua", and a secret accent colour (`data-secret`) until reload.
- Disabled in recruiter mode. The word is char-code encoded in the lazy `src/overlays/Unlock.tsx` chunk and
  `src/lib/keys.ts`; tests assert it never appears in any prerendered page, sitemap, robots or llms.txt.

## Commands

```bash
npm ci                    # install
npm run dev               # Vite dev server (client-rendered; no prerender) → http://localhost:5173/portfolio/
npm run build             # typecheck → Vite client + SSR build → prerender routes, sitemap, robots, OG image, resume PDF
npm run preview           # GitHub-Pages-like static server for dist/ → http://127.0.0.1:4173/portfolio/
npm run size              # initial-JS budget check (≤ 200 KB gzip)
npx playwright test       # full suite (use --workers=1 on low-memory machines)
npm run lighthouse        # mobile Lighthouse on the local build → docs/lighthouse/
node scripts/lighthouse.mjs https://stredevirad.github.io/portfolio/ production   # against production
node scripts/shots.mjs /tmp/shots 390,768,1440 dark,light                        # visual pass screenshots
npm run images            # re-encode assets-src/projects/*.png → public/images (AVIF + WebP) + images.generated.ts
```

Playwright needs Chromium: `npx playwright install --with-deps chromium`.

## File map

```
index.html                 head template + inline pre-paint prefs script (theme/motion/recruiter/preloader flags)
src/main.tsx               client entry: hydrateRoot (prerendered) or createRoot (dev)
src/entry-server.tsx       SSR entry used only by scripts/postbuild.mjs
src/App.tsx                shell: router, global effects (Lenis, shortcuts, velocity, route changes), overlays
src/seo.ts                 per-route title/description/canonical/OG/JSON-LD
src/content/*.ts           ALL facts and copy (projects, experience, achievements, skills, site). Edit here, not in components.
src/content/types.ts       content model incl. Claim { value, label, context, source, asOf, status }
src/sections/*.tsx         home sections: Hero, Manifesto, WorkReel, ProjectIndex, Experience, Achievements, Skills, Contact
src/pages/*.tsx            Home, CaseStudy, Resume (recruiter mode + /resume + PDF), NotFound
src/components/*.tsx       Header, Toggles, Cursor, Preloader, ArchitectureDiagram, Claim, Media (Picture/Cover), Chrome
src/overlays/*.tsx         lazy: CommandPalette (Ctrl/⌘+K), Terminal (`), Unlock (hidden)
src/webgl/hero.ts          lazy three.js particle field; layout.ts shares the graph with the SVG fallback
src/lib/*                  router, prefs store, storage, gsap registration, Lenis, transitions, audio, device checks
src/styles/tokens.css      design tokens (colour, type, space, radii, z, motion) — the single styling API
src/styles/global.css      fonts, reset, shell; sections.css — sections, case study, resume, print CSS
scripts/                   postbuild (prerender/PDF/OG), serve (Pages-like), size, lighthouse, shots, images, icons, fonts
tests/site.spec.ts         Playwright: routes, deep links, toggles, modes, PDF, overlays, content rules, axe, keyboard
docs/                      facts, open questions, architecture, ADRs, design research, council verdicts, lighthouse, progress
```

## Design tokens and motion rules

- Palette: ink `#0b0c0e` / paper `#efebe3`; one accent — signal lime `#c5f23a` (dark), ultramarine `#3a2bff` (light).
- Type: Bricolage Grotesque (display, variable wght), Instrument Sans (text), JetBrains Mono (labels). Fluid `clamp()` scale `--step-*`.
- Motion tokens (`src/design/tokens.ts`): durations 0.2 / 0.4 / 0.7 / 1.1 / 1.6 s; eases `expo.out`, `power3.inOut`, `back.out(1.4)`.
- One `gsap.context()` per section via `useGsap()`; everything reverts on unmount. Use `revealIn()` for `[data-split]` / `[data-reveal]`.
- Reduced motion (OS or toggle) and recruiter mode: no preloader, no Lenis, no pinning, no WebGL, no cursor; content is identical.
- Never hide the hero name (LCP) with opacity. The preloader overlays it; the name sits above the overlay.

## Performance budget (enforced in CI)

Initial JS ≤ 200 KB gzip (currently ~161 KB); three.js is a lazy chunk, loaded only after idle (fine pointers) or first
interaction (touch), and only if WebGL + capability check + FPS probe pass. DPR ≤ 1.5; loop pauses offscreen/hidden.
Targets: LCP < 2.5 s, CLS < 0.05 (mobile). Lighthouse mobile: Perf ≥ 90, A11y ≥ 95, BP ≥ 95, SEO 100.

## Deploys

Push to `main` → `.github/workflows/deploy.yml`: `npm ci` → Chromium → `npm run build` → `npm run size` → Playwright →
`upload-pages-artifact` → `deploy-pages`. Pages source = GitHub Actions. Vite `base` is `/portfolio/` and must match the repo name.
Never push to, rename or modify any other repo of the owner without an explicit request.
`stredevirad/stredevirad.github.io` (created 2026-11-21 at the owner's request) only redirects the root URL to `/portfolio/`
(meta refresh + JS + fallback link + canonical). Keep it that way; if the portfolio's repo name/base ever changes, update it too.
