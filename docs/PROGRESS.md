# PROGRESS.md

Resume point for any later session: read `CLAUDE.md` (once it exists), then this file, then `docs/PORTFOLIO_FACTS.md`.
Environment: WSL Debian, project at `/mnt/d/JHJportfolio` (D:\JHJportfolio), bash. node 24, gh logged in as `stredevirad`.
Brief: `JHJportfolio_MASTERPROMPT.md` (git-ignored: private brief, not published).

## Phase 0 — Prerequisites, research, validation ✅ (2026-11-21)
- Tools: node v24.22.3, npm 11.19.1, git 2.39.5, gh 2.23.0 (auth OK, scopes repo + workflow).
- Repo name: `stredevirad/portfolio` is free → using `portfolio`. Older repos (stredevirad.github.io, my-portfolio-joshua-herbert-japheth, joshua-ai-sphere) untouched. *(Correction 2026-11-21: only joshua-ai-sphere actually exists; the other two were names from the brief, not verified.)*
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

## Phase 6 (part 1) — Final council ✅ (2026-11-21)
- `docs/COUNCIL_FINAL.md`: 5 advisors + 5 peer reviews + chairman. Applied: Aegis claim at equal weight with the README's
  own caveat, hero proof strip + smaller name (fits 1440×900), WebGL snap plays once on load, readable Aegis card crop,
  "How I work" after the principles, "Released … on GitHub", "Experience & milestones", private repo name removed from
  public files. Playwright 39/39 after the fixes.
- Next: create `stredevirad/portfolio`, enable Pages (Actions), push, watch the run, production smoke + Lighthouse.

## Phase 6 (part 2) — Ship ✅ (2026-11-21)
- Repo `stredevirad/portfolio` (public) created and pushed; Pages source = GitHub Actions; `deploy.yml` builds, checks the
  JS budget, runs Playwright, then deploys. Description, homepage URL and 10 topics set. No other repo touched.
- Live: https://stredevirad.github.io/portfolio/ — CI runs green (latest: perf commit `4d5dffe`).
- First production Lighthouse (mobile): home 89 (TBT 380 ms). Fix in `4d5dffe`: below-the-fold animation setup deferred to
  idle, slimmer covers, shorter preloader, + a reel-pin test (suite is now 40 tests).
- Production after the fix (mobile, Perf/A11y/BP/SEO): home 95/100/100/100 (LCP 1.4 s, CLS 0, TBT 180 ms),
  /work/aegis/ 99/100/100/100, /resume/ 100/100/100/100. Reports in `docs/lighthouse/production-*`.
- Playwright against production (`BASE_URL=https://stredevirad.github.io/portfolio/`): 40/40 passed.
- Not done: pinning the repo (GitHub has no API for profile pins → owner does it in the UI); backup deploy on
  Cloudflare/Vercel (needs an account login — optional); custom domain (paid, no spend approved; see OPEN_QUESTIONS #15).
- Skill `deploy-checklist` not installed → applied by hand.

## Phase 7 — Docs and memory ✅ (2026-11-21)
- `README.md` (hero screenshot, live link, stack, dev commands, content editing, deploys) and `CLAUDE.md` (rules, hard
  exclusions, file map, tokens, motion rules, perf budget, deploys) are current. Skill `documentation` not installed → by hand.
- `docs/PORTFOLIO_FACTS.md` stays the single source of truth; `docs/OPEN_QUESTIONS.md` lists 15 items for Joshua.
- Project memory saved in Claude Code's project memory (`~/.claude/projects/-mnt-d-JHJportfolio/memory/`), not the global file.
- Next (optional): answer OPEN_QUESTIONS, pin the repo, update resume/LinkedIn links to the live URL.

## Perf follow-up — lazy scroll kit ✅ (2026-11-21)
- ScrollTrigger, SplitText, Flip and Lenis moved into a lazy chunk (`src/lib/gsap-scroll.ts`, 33.5 KB gzip); GSAP core
  stays eager. Initial JS 161.3 → 129.1 KB gzip. `useGsap(fn(late))` waits for the kit; late setups never hide content
  already on screen. Commits `8b57d31`, `d39352a`.
- First version (`8b57d31`) primed the kit on idle and, in a controlled local A/B, pushed LCP from 0.9 s to 1.4 s in 2 of
  3 runs (ScrollTrigger registration forced a full-page layout during the preloader). `d39352a` primes it after the
  preloader → LCP back to 0.9 s.
- Local A/B (same machine, alternating): Performance median 98 → 98, TBT median 126 → 134 ms (noise), Speed Index
  3.56 → 3.07 s (~14 % better).
- Production after (median of 3 mobile runs): / 98/100/100/100 (TBT 150 ms, LCP 1.2 s), /work/aegis/ 100/100/100/100,
  /resume/ 100/100/100/100. Before (single run): / 95, /work/aegis/ 99, /resume/ 100. All runs in
  `docs/lighthouse/RUNS-2026-11-21.md`. Playwright: 40/40 locally and 40/40 against production.
- Lesson: compare Lighthouse runs only at a similar `benchmarkIndex` (one run at 903 vs ~2,700 scored home 71) and A/B
  locally before trusting a single production number.
- Next: the remaining home TBT is style/layout work from the large DOM, not JS size — see RUNS file.
