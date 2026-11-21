# COUNCIL_FINAL.md — LLM Council, Phase 6 (pre-launch review)

Run 2026-11-21 with the `llm-council` method: 5 advisors in parallel (Contrarian, First Principles, Expansionist,
Outsider, Executor), 5 anonymized peer reviews, chairman synthesis (by the orchestrating agent).
Inputs: copy of every section, the claims with their context, Playwright 39/39, axe 0 serious, local Lighthouse mobile
(home 96/100/100/100, /work/aegis/ 100/100/100/100), the fact audit, and 8 screenshots (desktop/mobile, dark/light).
Question: would it impress a recruiter in 10 s and an Awwwards juror in 60 s? Is anything over-claimed? What to fix today?

Peer review: **all five reviewers ranked the Contrarian strongest** (the only one that read the claims like a sceptical
engineer); the Executor had the best launch-day order; the **Expansionist had the biggest blind spot** (wanted "6 of 8
abstained" as the headline, which strengthens the always-abstain objection, and proposed a new feature on launch day).

---

## Council verdict (chairman)

### Where the council agrees
- **Nothing is invented — but the Aegis headline layout reads as spin.** "0 confidently wrong" in large type with
  "0 fully correct" in small print is a score an always-abstain system also gets. Fix the layout, not the facts.
- **Above the fold proves nothing yet.** The name takes ~60–65 % of a 1440 × 900 screen; the thesis line and buttons sit at
  the bottom edge; no project or award is visible. Add a proof line and shrink the name ~20 %.
- **The signature idea is invisible in a still frame.** At rest the WebGL field looks like a starfield; the noise → graph
  snap only happens on scroll/hover. Play it once on load.
- **Card visuals undersell.** The Aegis card was an unreadable light-UI screenshot; the Cold Chain cover is abstract.
- **Evidence must come from production**, not only from the local build.

### Where it clashes — and the rulings
1. **Header controls (Outsider, First Principles: "too many, rename Recruiter mode").** Overruled for the structure: the owner
   asked for exactly these toggles and the name "Recruiter mode". Applied the cheap part: a plain-language tooltip
   ("A plain, fast, printable résumé view of this site").
2. **Tern and UrbanTherm cards (Contrarian, Executor: hide them).** Overruled: the owner listed both explicitly, labelled
   honestly. Applied: moved to the end of the grid so they never lead.
3. **"Ask the record" box in the hero (Expansionist).** Rejected for launch day (new feature, and reviewers flagged it);
   the claims search stays in the command palette and now answers "Nothing on record for that."
4. **Aegis wording.** Contrarian's framing wins, with all counts at equal weight and the README's own caveat.

### Blind spots the reviewers caught
- **Public repo ≠ hidden.** The exclusion list lives in `CLAUDE.md` and `docs/PORTFOLIO_FACTS.md` because the owner asked for
  it there; accepted. The private repo's **name** was removed from every public file (tests check it via char codes).
  The easter-egg word is char-code encoded in lazy chunks; source maps are off.
- **Team roles for the course projects** are still unknown → stays in `OPEN_QUESTIONS.md` (#4); the site says
  "Team course project" and does not invent a role.
- **Availability date** still missing → `OPEN_QUESTIONS.md` (#9).
- **Experience lists project releases** → section relabelled "Experience & milestones" (items were already tagged Milestone).
- **"Published KeralaFloodBench"** read like a paper → "Released KeralaFloodBench on GitHub".
- axe can't judge the pinned reel / palette / terminal with a screen reader → keyboard paths are tested in Playwright
  (palette, terminal, skip link, focus); a manual screen-reader pass is listed as a next improvement.

---

## Fixes applied (before launch)

| # | Fix | Where |
|---|---|---|
| 1 | Aegis headline at equal weight: "2 partly right · 6 “can’t tell” · 0 confidently wrong — on 8 held-out real incident captures", context: "0 fully correct. Abstaining is the design goal, but it means this shows no confident wrong answers on degraded telemetry — not accuracy. Small sample, no baseline comparison yet." | `src/content/projects.ts` (card, case study, resume, PDF) |
| 2 | Hero proof strip: 1st place THROTTLE · Special Jury Award, V-Guard Big Idea 2026 (17 finalists of 1,000+) · Research Intern, CUSAT 2026 — each linked | `src/sections/Hero.tsx` |
| 3 | Hero name ~20 % smaller on desktop so the thesis, buttons and proof fit in the first screen | `sections.css` |
| 4 | WebGL plays the noise → evidence-graph snap once on load (0.6–5 s), then relaxes | `src/webgl/hero.ts` |
| 5 | Aegis card image: tight crop of the "Not enough evidence" verdict; the case study opens on the abstention screen | `assets-src/projects/aegis-card.png`, `projects.ts` |
| 6 | "Scroll for evidence" → "Scroll for the work"; kicker "class of 2028" instead of "2024–2028" | `Hero.tsx` |
| 7 | "How I work" (AI-assistance disclosure) moved after the three principles | `Manifesto.tsx` |
| 8 | "Released KeralaFloodBench on GitHub"; "Experience & milestones" | `experience.ts`, `Experience.tsx` |
| 9 | Tern / UrbanTherm moved to the end of the grid; Recruiter-mode tooltip | `projects.ts`, `Toggles.tsx` |
| 10 | Private repo name removed from public files | `CLAUDE.md`, `PORTFOLIO_FACTS.md`, tests |
| 11 | Production verification: Playwright smoke + Lighthouse against the live URL | see `docs/PROGRESS.md`, `docs/lighthouse/` |

## Not applied (owner decisions or no evidence)
- Real Cold Chain app screenshot — none exists in the repo (owner can add one → `assets-src/projects/`).
- Aegis baseline comparison — the repo has none; the site says so instead of implying one.
- Source links for "1,000+" and "top 5 %" — owner-stated; links requested in `OPEN_QUESTIONS.md` (#6).
