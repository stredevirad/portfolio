# COUNCIL_PHASE0.md — LLM Council, Phase 0 (facts, concept, stack, hosting)

Run 2026-11-21 with the `llm-council` skill: 5 advisors in parallel (Contrarian, First Principles, Expansionist,
Outsider, Executor) → 5 anonymized peer reviews → chairman synthesis. Framed question: facts + repo findings,
design concept, stack, hosting plan, and "how to frame AI-assistance disclosures and modest benchmark numbers".

Peer-review result: **all five reviewers ranked the Contrarian strongest** (only one that stress-tested the
evidence); the Executor had the best build order; the Expansionist had the biggest blind spot (scope; sourced
numbers can still mislead).

---

## Council Verdict (chairman)

### Where the Council Agrees
- **Lead with the finding, then the score.** 12/52 alone reads as "failed 77%". "39 of 40 failures were the agent misusing its tools, not missing flood knowledge" is a real research result. Number next to it, with the sample-size caveat.
- **Disclose AI assistance up front, as his method.** Found later in a README it looks hidden; said first it reads as a skill: "I specify, constrain and verify; agents write much of the code; tests and CI decide what ships."
- **Prerender every route** instead of the 404.html fallback (deep links would return HTTP 404; link previews don't run JS; SEO 100 unreachable).
- **The plain, scannable page is the real product.** Name, role, availability, three flagships, resume, GitHub, email readable at first paint with JS off.
- **The spectacle is where the risk sits:** preloader vs LCP, three.js vs the 200 KB budget, Lenis/pinned reel/cursor vs keyboard, screen-reader and phone users.

### Where the Council Clashes (and rulings)
1. **Cut vs expand.** Owner fixed the feature list → nothing cut. The "Ask Joshua" box is rejected (one wrong answer contradicts the brand); its idea moves into the command palette: search the claims file, and when nothing matches, say **"Nothing on record for that."**
2. **Are test counts evidence?** Contrarian wins: shown as static, CI-linked facts in case studies, never animated hero counters.
3. **Provenance chips:** yes, but no number renders without its context.
4. **Particle field:** settled state is the real evidence graph (project → evidence → result). Particles are decorative only in transition.
5. **Audience:** layered build — the 10-second scan must pass with JS off before any spectacle loads.
6. **Grammar Tax:** one sentence with both figures: 1.47× mask, ~1.5 % end-to-end default path, +24 % where the mask runs every step, not merged.

### Blind Spots the Council Caught
- "0 confident-wrong" is nearly free at 75 % abstention → always show coverage (n = 8 real: 0 fully correct, 2 partial, 6 abstained) and the "regression gate, not accuracy" label on the synthetic 15.
- Consistency across resume PDF, LinkedIn, READMEs and the earlier over-claimed CUSAT report.
- Uneven AI disclosure across repos; the portfolio itself is AI-built and needs its own disclosure line.
- "Hidden" is not private: the easter-egg nickname ships in the public JS bundle (and source maps, if on).
- Credit and consent: GISclaw authors, Cold Chain teammates, naming the internship supervisor.
- Freshness: "as of" dates on changing numbers; explicit status labels for Tern and UrbanTherm.
- C++ tension: Grammar Tax is C++, C++ is not a headline skill → keep C++ inside that case study.
- The URL doesn't say "Joshua"; trimming to the root lands on the old site → his name in every title/OG tag.
- Jargon and unfamiliar institution names need one-line glosses; the brand line can be misread.
- Hero needs an availability line (not in facts → owner to supply).

### The Recommendation
Build every owner-specified feature as **two layers**: Layer 1 = prerendered HTML from a typed, sourced claims
file (works with JS off, on a phone, with a screen reader; recruiter mode, `/resume/` and the PDF render from it).
Layer 2 = WebGL, GSAP, Lenis, preloader, cursor, sound, palette, terminal, easter eggs — progressive enhancement
after LCP, each with a reduced-motion and keyboard path, never changing what a fact says. CI enforces it.

### The One Thing to Do First
Rewrite the facts as a **typed claims ledger** (value, source, as-of date, status verified/owner-stated, required
context, ownership split) and make the build fail on any claim without a source.

### Concrete amendments (chairman's list) → what we did
| # | Amendment | Adopted? |
|---|---|---|
| 1 | Typed claims ledger; build fails on missing fields | **Yes** — `src/content/types.ts` makes `source`, `asOf`, `status` required at compile time (`tsc` gate) + `scripts/check-content.mjs` |
| 2 | Aegis: always render coverage with "0 confident-wrong"; label synthetic set | **Yes** — and a Playwright test asserts they appear together |
| 3 | Kerala: lead with diagnosis + 2 upstream fixes, then 12/52; drop "first run" | **Yes** — wording "one complete run (repeat 1)" |
| 4 | Grammar Tax: 1.47× never without end-to-end figures and "not merged" | **Yes** |
| 5 | AI disclosure: home sentence + per-case-study "I decided / agents wrote / teammates did" + portfolio footer/README | **Yes**, limited to what each repo states (DLT and Cold Chain repos say nothing → no agent claim made; logged in OPEN_QUESTIONS) |
| 6 | Prerendered hero with role + availability + brand line + Resume/GitHub/Email | **Yes**, availability month → OPEN_QUESTIONS (hero says "Open to internships and roles in AI & software engineering") |
| 7 | Prerender all routes, per-route meta, JSON-LD Person, 404.html for unknown only | **Yes** (ADR-002) |
| 8 | three.js lazy after LCP, gated; SVG fallback | **Yes** (ADR-004; plain three.js, no R3F) |
| 9 | Settled evidence graph = real claims, focusable nodes linking to sources | **Yes** — HTML labels over the graph, real links |
| 10 | Preloader short, first visit only, skipped for reduced motion / recruiter / deep-link entry; hero H1 never opacity 0 | **Yes** (≤ ~1.4 s; hero text painted underneath) |
| 11 | Lenis off under reduced motion; reel vertical < 768 px / reduced motion; cursor only `(pointer: fine)`; dialogs with focus trap + Esc; axe zero | **Yes** |
| 12 | Counters: final value in HTML, animation aria-hidden; test counts static | **Yes**. Owner explicitly requires counters for 91 %, 1st, 4th, 17 of 1,000+ → kept (owner-stated, from the fact sheet) |
| 13 | Visible Resume button; PDF from `/resume/`; PDF numbers checked | **Yes** |
| 14 | Plain English on cards; glosses for RSET/CUSAT/THROTTLE/NPTEL/V-Guard; awards lead with scale; Tern/UrbanTherm status labels | **Yes** |
| 15 | Hygiene: credit GISclaw + teammates; consent; sourcemaps off; update resume/LinkedIn; captioned screenshot per flagship; phone test | Sourcemaps off, GISclaw credited, real screenshots used where they exist. Teammate names, consent, availability, resume/LinkedIn updates → OPEN_QUESTIONS (owner) |

### Brand line decision
Hero: **"I build AI that knows when to say *I don't know*."** (owner's option) followed immediately by the
Outsider-proof gloss: "Systems that show their evidence — or refuse to guess when it's thin." This keeps the
owner's line and removes the "his AI doesn't know things" misreading.

---

## Advisor responses (verbatim summaries)

**Contrarian:** "0 confident-wrong" with 6/8 abstentions is nearly free — show coverage. Agent-written test counts are discounted — don't animate them; he must be able to whiteboard the validator, RLS and SKIP LOCKED. Particle noise vs a signal brand; preloader vs LCP; Lenis/pinned reel/cursor vs a11y and phones. 404.html fallback = HTTP 404 deep links → prerender. Kerala: lead with the finding; Grammar Tax: lead with ~1.5 % end-to-end.

**First Principles:** Real question: can a reviewer trust him to build AI systems that work, in 10 s? The site must be calibrated like the brand. Plain view is the product; AI direction is the headline skill ("I direct AI to build systems, and I build the evidence that they're right"). 12/52 isn't the result — the diagnosis is. Prerender every route.

**Expansionist:** Claims ledger with provenance chips; build check for unsourced claims; abstaining "Ask" box (client-side, no LLM); directing agents as headline skill; machine-readable site (llms.txt, JSON-LD, resume.json); case studies as shareable write-ups.

**Outsider:** Hero must say who/what/availability in plain HTML; brand line can be misread; too much jargon on cards; 12/52 alone reads as failure; disclose AI use first; gloss RSET/CUSAT/THROTTLE/NPTEL/V-Guard; put a plain "Resume / PDF" button in the header; "stredevirad" doesn't say Joshua.

**Executor:** Deploy hello-world first; typed content; prerender; CI gates (typecheck, content test, Playwright + axe, Lighthouse); then GSAP; WebGL last behind the motion toggle; the PDF only if `page.pdf()` works, else print CSS.
