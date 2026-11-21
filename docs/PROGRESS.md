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
