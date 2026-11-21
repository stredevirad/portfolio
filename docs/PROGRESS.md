# PROGRESS.md

Resume point for any later session: read `CLAUDE.md` (once it exists), then this file, then `docs/PORTFOLIO_FACTS.md`.
Environment: WSL Debian, project at `/mnt/d/JHJportfolio` (D:\JHJportfolio), bash. node 24, gh logged in as `stredevirad`.
Brief: `JHJportfolio_MASTERPROMPT.md` (git-ignored: private brief, not published).

## Phase 0 — Prerequisites, research, validation ✅ (2026-11-21)
- Tools: node v24.22.3, npm 11.19.1, git 2.39.5, gh 2.23.0 (auth OK, scopes repo + workflow).
- Repo name: `stredevirad/portfolio` is free → using `portfolio`. Older repos (stredevirad.github.io, my-portfolio-joshua-herbert-japheth, joshua-ai-sphere) untouched.
- Repos read (clones in /tmp/jhj-research): aegis, kerala-flood-gis-agent, DeepLearningTutor, grammar-tax, ai-resume-builder-assistant, ColdChainHandshake. Local-only: RuleLens (`D:\DM lab project`), WebRank (`D:\DM course project`). Tern/UrbanTherm: nothing found.
- Wrote `docs/PORTFOLIO_FACTS.md` (sourced), `docs/OPEN_QUESTIONS.md`, `docs/DESIGN_RESEARCH.md` (10 Awwwards SOTD portfolios, Sep–Nov 2026), `docs/COUNCIL_PHASE0.md` (llm-council: 5 advisors, 5 reviews, chairman).
- Key verified numbers: Aegis 366 backend / 137 PG / 81 frontend / 3 E2E, v1.0.0 + v1.0.1, 15 synthetic scenarios (0 confident-wrong), 8 real captures (0 CW, 2 partial, 6 abstained). Kerala repeat 1: 12/52, 39/40 failures tool-protocol confusion. Grammar Tax 1.47× mask / ~1.5 % e2e.
- Skills: only `llm-council` is installed here. Not installed (discipline applied by hand): frontend-design, system-design, architecture, design-system, ux-copy, tech-resume-optimizer, accessibility-review, design-critique, testing-strategy, code-review, deploy-checklist, documentation.
- Next: Phase 1 — architecture docs + ADRs (drafted), scaffold Vite app.

## Phase 1 — Architecture ✅ (2026-11-21)
- `docs/ARCHITECTURE.md` (routes, component tree, content model, animation orchestration, perf strategy, deploy pipeline) + ADRs 001–007 in `docs/adr/`.
- Deviations from the brief, each with an ADR: plain three.js instead of R3F/drei (ADR-004), plain CSS + tokens instead of Tailwind (ADR-005), prerendered routes instead of hash/404 fallback (ADR-002).
- Scaffold: Vite 8 + React 19 + TS 7 (strict), `base: '/portfolio/'`, typed content in `src/content/*.ts` (claims ledger with sources), lib layer (router, prefs store, storage, gsap, Lenis, audio, scramble, device checks), fonts + optimized AVIF/WebP images. `tsc --noEmit` passes.
- Skills `system-design` / `architecture` not installed → applied by hand.
- Next: Phase 2 — global CSS on top of tokens, then Phase 3/4 components (App shell, hero, reel, case studies, toggles).

## Phases 2–5 — Design system, content, build, verification ✅ (2026-11-21)
- Design system: `src/styles/tokens.css` (palette, fluid type, space, radii, z-layers, motion) + `global.css` / `sections.css`.
  Concept "Signal vs. Noise": hero particle field (lazy three.js) snaps from noise into an evidence graph on scroll and under the
  pointer; static SVG fallback shares the same graph layout.
- Built: preloader (first visit, name is the shared element), WebGL hero + fallback, custom cursor (labels, magnetic, tilt),
  pinned horizontal work reel with hover distortion and Flip hand-off into case studies, case studies (problem → approach →
  animated architecture diagram → stack → what I owned → verified results → caveats → prev/next), self-drawing timeline,
  counters (real values only) + marquee, skills ↔ projects highlighting, contact (magnetic copy-email CTA, toast, IST clock),
  curtain page transitions, scroll-velocity weight/skew, grain. Toggles: theme (View Transitions reveal), motion, sound
  (Web Audio, synthesised), recruiter mode (plain resume + PDF), filter chips (Flip), command palette, terminal, hidden unlock.
- SEO: per-route title/description/canonical/OG/Twitter, JSON-LD Person, sitemap, robots, llms.txt, favicon set, OG image (build).
- Verification: Playwright 39/39 (routes, no-JS deep links, 404, toggles persist, recruiter/no WebGL, reduced motion, preloader
  once, PDF real text, palette, terminal, toast, exclusions, axe 0 serious in both themes, keyboard). Initial JS 161 KB gzip.
  Lighthouse mobile (local build): home 96/100/100/100, /work/aegis/ 100/100/100/100.
- Skills `frontend-design`, `design-system`, `ux-copy`, `tech-resume-optimizer`, `accessibility-review`, `design-critique`,
  `testing-strategy`, `code-review` are not installed → applied by hand (screenshots reviewed at 390/768/1440, both themes).
- Next: Phase 6 — final council review, create `stredevirad/portfolio`, push, Pages deploy, production smoke + Lighthouse.
