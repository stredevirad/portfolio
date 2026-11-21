# PORTFOLIO_FACTS.md — single source of truth

Every claim on the site must trace to a line in this file. Every line here cites a source:
either the owner's fact sheet (`MASTERPROMPT §1`, the owner's own statement, treated as the LinkedIn data)
or a public repo + file, read on **2026-11-21** (clones of the default branch at that date).

Rule: **never invent a metric, user count, award, date, employer or skill.** Missing is fine; made up is not.
Unverified items live in [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md), not on the site.

Status legend: ✅ verified in a repo · 📝 owner's fact sheet (no repo evidence expected) · ⚠️ changed vs fact sheet · ❌ excluded

---

## Identity

| Fact | Status | Source |
|---|---|---|
| Name: Joshua Herbert Japheth | 📝 ✅ | MASTERPROMPT §1; `aegis/LICENSE` ("© 2026 Joshua Herbert Japheth") |
| GitHub: `stredevirad` | ✅ | `gh api user` |
| LinkedIn: `linkedin.com/in/joshuaherbertjapheth` | 📝 | MASTERPROMPT §1 |
| Location: Kochi, Kerala, India (IST, UTC+5:30) | 📝 | MASTERPROMPT §1 |
| Public email: joshuajapheth14@gmail.com | 📝 ✅ | MASTERPROMPT §1; commit author email in `stredevirad/aegis` |
| Phone number, street address | ❌ never publish | MASTERPROMPT §1 |
| B.Tech, Artificial Intelligence & Data Science, Rajagiri School of Engineering & Technology (RSET), 2024–2028, CGPA 8.52 | 📝 | MASTERPROMPT §1 |
| Positioning: AI-focused, Python-first engineer — LLM agents, evaluation pipelines, well-tested Python backends; open to internships and roles in AI and software engineering | 📝 | MASTERPROMPT §1 |
| Brand idea: "AI that knows when to say *I don't know*" — evidence-grounded systems that abstain rather than guess | 📝 ✅ | MASTERPROMPT §1; `aegis/README.md` ("says plainly when it can't tell", "refuses to guess when the evidence is weak") |

## Experience

### Research Intern, CUSAT — 29 Apr – 12 Jun 2026, under Dr. Sudheep Elayidom 📝
Project: **Deep Learning Tutor** (`stredevirad/DeepLearningTutor`). Features below are **what the code does now** (repo read 2026-11-21), per the ⚠️ in the fact sheet:

| Feature | Status | Source |
|---|---|---|
| Streamlit app; "design, train, understand and test small neural networks, without writing code" | ✅ | `README.md`; `app.py` |
| Simple NN (dense) + small CNN (1–3 conv blocks) for 28×28 images | ✅ | `README.md` §Train; `core/models.py` |
| Built-in datasets: Iris, Wine, Breast Cancer, Digits, MNIST, Fashion-MNIST; own CSV / ZIP-of-folders upload with safety checks | ✅ | `README.md` §Train; `core/data.py` |
| Live loss/accuracy curves during training | ✅ | `README.md`; `components/training_ui.py` |
| Stratified train/validation/test split; test set evaluated once after training; preprocessing fit on train rows only | ✅ | `README.md` §Train, §Tests |
| Confusion matrix, per-class precision/recall/F1 | ✅ | `README.md` §Understand; `components/visualizations.py` |
| Grad-CAM heatmaps (works under Keras 3) | ✅ | `core/gradcam.py`; `README.md` |
| AI tutor: Google Gemini (online) or Ollama (offline); English + Malayalam UI | ✅ | `backend/llm_api.py`, `backend/ollama_api.py`; `config/` translations |
| Agent mode (Gemini function calling) with five validated tools (`run_experiment`, `diagnose_training`, `compare_experiments`, `generate_code`, `explain_concept`) | ✅ | `agent_tools.py`; `README.md` §Ask |
| Knowledge base (RAG) over uploaded PDF/TXT: cosine similarity, BM25 fallback | ✅ | `core/rag.py` |
| Export: `.keras` model + standalone Python script reproducing the same split | ✅ | `core/codegen.py`; `README.md` |
| 478 tests (hermetic: network blocked, LLM calls faked), CI on GitHub Actions | ✅ | `README.md` §Tests; `.github/workflows/tests.yml` |
| Measured: MNIST CNN 98.7 % test accuracy, Fashion-MNIST 89.8 %, on a laptop CPU, 3 epochs | ✅ | `README.md` §Measured results (2026-11-12) |
| Reworked after completing the NPTEL Deep Learning course | 📝 | MASTERPROMPT §1 |
| A "dashboard" | ✅ (as an API-usage panel + results views) | `README.md` §Ask ("API usage panel") |

Wording rule: describe it as an educational workbench that runs on a laptop CPU (the README says so). Do not call it production.

## Flagship projects (in this order)

### 1. Aegis — `stredevirad/aegis` ✅
- What: evidence-grounded incident investigation and root-cause analysis for microservices; "says plainly when it can't tell" and "refuses to guess when the evidence is weak". `README.md` L1–5
- Core rule: a **deterministic RCA engine decides** with tri-state checks (pass / fail / not evaluable); an optional LLM may select, explain and **lower** confidence, never raise it — enforced by a validator (`backend/aegis/llm/validate.py`, ADR-009). `README.md` §The rule that matters
- Stack: Python 3.12+, FastAPI, PostgreSQL (row-level security, `SKIP LOCKED` job queue), React 19 + TypeScript frontend, Docker Compose, OpenTelemetry/Prometheus/Loki/Jaeger collectors. `README.md` §Architecture, §Project layout
- Tests (current, ⚠️ differ from fact sheet's 360/134/78): **366 backend tests, 0 skipped, 137 against real PostgreSQL**; ruff + **mypy --strict**; **81 frontend unit tests**; **3 Playwright E2E tests** against the one-command stack; gitleaks over full history — all in CI. `README.md` §Results, commit `d9650e9` ("366 backend, 137 on PostgreSQL")
- Release: **v1.0.0** (2026-11-09, "portfolio release") and **v1.0.1** (2026-11-09). `gh release list -R stredevirad/aegis`
- One-command Docker demo: `scripts/demo-up.sh`. `README.md` §Quickstart
- **Scenario count behind "0 confident-wrong" — FOUND:** synthetic regression benchmark of **15 scenarios** (`eval/scenarios/s01…s15`): **12 correct, 3 appropriate abstentions, 0 confident-wrong**; plus **8 held-out real captures: 0 confident-wrong (6 abstained, 2 partially correct)**. `README.md` §Results
  - Mandatory caveat (from the README itself): the synthetic set is a **regression gate, not an accuracy estimate**; accuracy is unmeasured beyond these. The site must carry this caveat wherever the number appears.
- Under the hood (each claim cited in the README): fail-closed multi-tenancy (`FORCE ROW LEVEL SECURITY`), PostgreSQL job queue with leases, SSRF-safe egress (62 tests), hash-chained audit log, OIDC + PKCE, pure clock-free RCA core enforced by an AST test, human-gated remediation (API only).
- Research history: error-focused querying made investigations **2.3× faster** (137 s vs 312 s), 59 % less evidence noise. `README.md` §Research history
- Limitations stated by the repo: DEMO MODE only, no production deployment; no live LLM output accepted so far (1B local model always rejected by the validator). `README.md` §Limitations
- Authorship (repo's own disclosure): "The owner designed and directed Aegis: the scope, the architecture decisions (ADRs and LLM-council reviews) and the acceptance criteria. Claude Code wrote most of the implementation under those decisions." `README.md` §Built with AI assistance → "What I owned" must say design, architecture decisions, acceptance criteria, verification.
- Visuals: `docs/media/rca-verdict.png`, `docs/media/abstention.png`, `docs/media/demo.gif` (owner's own).

### 2. Kerala Flood GIS Agent / KeralaFloodBench — `stredevirad/kerala-flood-gis-agent` ✅
- What: an LLM agent that answers plain-English questions about the August 2018 Kerala floods by writing and running real GIS code on Sentinel-1 radar, elevation and OpenStreetMap data, and checks its own answers (AnswerChecker). `README.md` L1–4, `REPORT.md` §2
- Built on **GISclaw** (AGPL-3.0, credited). `README.md` §Credits
- Benchmark: frozen, hash-locked; 23 questions (12 parameter, 8 controls, 3 dev); 3 arms (noparam / inline / pack); 52-run matrix; gold answers from an independent script. `REPORT.md` §4
- **First benchmark run (repeat 1, `matrix_gptoss_v1`), model gpt-oss:20b (local, Ollama): 12 / 52 runs correct.** `README.md` headline table; `REPORT.md` §7
  - Key finding: **39 of the 40 incorrect runs** contain a tool call the toolkit rejects before any GIS runs — **tool-protocol confusion**, not missing domain knowledge. `README.md` §Key findings
  - Arm differences are **not statistically meaningful** (p = 1.00). Must not be presented as a win/score to brag about; present as a failure-analysis study.
  - A second repeat was stopped at 35/52 and is **not used**. `README.md`
- Found and fixed **two upstream GISclaw bugs**, each with a regression test (F1 empty-polygon count = 1; F2 slope on geographic DEM ≈ 89.95° for a 0.57° ramp). `README.md`, `REPORT.md` §6
- Model floor check: gpt-oss:20b 2/6 (borderline pass) vs gemini-3.5-flash-lite 1/6, qwen3.5:9b 0/6, qwen2.5-coder:7b 0/6. `README.md`
- Stack: Python, GeoPandas, Shapely, Rasterio, NumPy, Ollama; data Sentinel-1 RTC (Microsoft Planetary Computer), JRC Global Surface Water, Copernicus DEM GLO-30, OpenStreetMap. `REPORT.md` §3
- Authorship: "Implemented with AI coding agents (Codex, Claude Code) under my direction; design decisions, validation and fixes are logged in PROGRESS.md." `README.md` §Credits
- Visuals: `docs/screenshots/*.png` (GISclaw desktop UI with Kerala data — owner's run).

### 3. Cold Chain Handshake — `ColdChainHandshake/ColdChainHandshake` ✅ 📝
- What: offline-first native Android prototype for pharmaceutical (vaccine) cold-chain tracking: simulated temperature telemetry, local buffering + auto sync, breach detection, multi-level alert escalation, quarantine, hash-chained telemetry integrity, QR shipment pairing, worker + pharmacist handover with PASS/FAIL verdict. `README.md`; code under `app/src/main/java/com/coldchain/handshake/` (`safety/BreachDetector.kt`, `safety/AlertEscalationEngine.kt`, `crypto/HashChainService.kt`, `handover/HandoverOrchestrator.kt`, `ui/components/QRScannerDialog.kt`)
- Stack: Kotlin, Jetpack Compose (Material 3), Room, Supabase (postgrest-kt). `app/build.gradle`
- **Team project (team of four). Joshua owned the dispatch and handover layer.** 📝 MASTERPROMPT §1
- **1st place, THROTTLE** — 16-hour inter-college hackathon. 📝 MASTERPROMPT §1 (no repo evidence; owner's statement)

## Secondary / lab projects

| Project | Facts | Source |
|---|---|---|
| **Deep Learning Tutor** | see Experience | — |
| **Grammar Tax** (`stredevirad/grammar-tax`) ✅ | A study I designed and measured: cost of grammar-constrained (GBNF) sampling in llama.cpp on CPU. Record/replay benchmark (206 grammars incl. 198 JSONSchemaBench schemas; 23,448 replayed tokens). 3 small C++ patches → **1.47× faster full-vocab mask** (geomean, 95 % CI 1.455–1.486; 5 paired runs), median per-token mask cost **−32.7 %**, p99 **−17.9 %**, **206 of 206** grammars faster, masks **bit-identical** on 44,650 trace steps. End-to-end: **~+1.5 %** tokens/s on the default path, **+24.2 %** where the mask runs every step. **Not merged upstream; never claim "merged" or "1.47× faster inference".** Written with an AI assistant (Claude), disclosed. | `README.md` §Results, §Status; `RESUME.md` "Do not claim" |
| **Tern** 📝 | Redis-inspired in-memory database server — **in progress**, labelled that way. No public repo found → no link. | MASTERPROMPT §1 |
| **UrbanTherm** 📝 | NeST Digital GIS Mapathon — **4th place**. No public repo found → no link, no further claims. | MASTERPROMPT §1 |
| **AI Resume Builder Assistant** (`stredevirad/ai-resume-builder-assistant`) ✅ | Course project, team project (archive tier). Conversational resume builder: Next.js 16 / React 19 / TS frontend, Python FastAPI backend, multi-provider LLM registry with failover (Groq, NVIDIA NIM, Ollama), **deterministic, explainable ATS-style score (no LLM produces the score)**, LaTeX → PDF across 10 templates. | `README.md` |
| **RuleLens** ✅ (local `D:\DM lab project`, not on GitHub) | Data Mining Lab course project (archive tier, team project). Apriori and FP-Growth implemented from scratch, closed frequent itemsets, association rules by support/confidence/lift, Streamlit app. No public repo → no link. | `D:\DM lab project\README.md` |
| **WebRank** ✅ (local `D:\DM course project`, not on GitHub) | Data Warehousing & Data Mining course project (archive tier, team project). ETL into DuckDB warehouse; PageRank, HITS, centrality, Louvain communities; validated against NetworkX; Streamlit dashboard. No public repo → no link. | `D:\DM course project\README.md` |
| `forge-mini` | **Private. Never link or describe.** | MASTERPROMPT §1 |

## Achievements and certifications 📝 (owner's fact sheet)

| Achievement | Counter value allowed |
|---|---|
| **V-Guard Big Idea 2026 — Special Jury Award**; one of **17 finalist teams out of 1,000+** (with teammates Rohith and Dane) | "17 of 1,000+" |
| **THROTTLE — 1st place** (Cold Chain Handshake; 16-hour inter-college hackathon, team of four) | "1st" |
| **NeST Digital GIS Mapathon — 4th place** (UrbanTherm) | "4th" |
| **NPTEL Cloud Computing (IIT Kharagpur) — 91 %, Elite + Gold, top 5 %** | "91%" |
| **NPTEL Deep Learning (IIT Ropar) — 79 %, Elite + Silver** | "79%" |

## Skills (grouped, no bars/percentages; Python leads every list) 📝

- **Languages:** Python (primary), Java, Kotlin, SQL — (TypeScript used in Aegis frontend + this site ✅, but not a fact-sheet skill: may appear as a project stack tag only)
- **Mobile:** Android (Jetpack Compose, Room)
- **AI/ML:** TensorFlow/Keras, Grad-CAM, LLM APIs (Gemini, Ollama), agents and evaluation
- **Backend/Data:** FastAPI, PostgreSQL, Supabase
- **Tools:** Git, Docker, GitHub Actions, Pytest, Linux
- **Cloud/GIS:** Google Cloud, Earth Engine, QGIS

## Hard exclusions ❌ (owner's corrections — never add back)

- AtomQuest, ExaThon / VoltProof, gIGNITE, TELIPORT: unfinished or dropped — **not achievements, not shown**. (Note: `stredevirad/voltproof-exathon-2026` is public; it is deliberately **not** listed on the site.)
- NPTEL Modern C++ top 2 % — a friend's result, not Joshua's.
- C++ is **not** a headline skill (grammar-tax is C++ but appears as a performance *study*, and C++ is not in the skills list).
- "Kirito" only inside the hidden easter egg — never in visible copy, titles, meta, sitemap, PDF, README.
- No invented metrics, testimonials, "clients", visitor counters or fake GitHub stats.
- Other public repos not in the fact sheet (`student-search`, `activity-points-management-system`, `wikilynx` fork, `joshua-ai-sphere`, `GameJam`, older portfolios) are not featured.

## Council (Phase 0) amendments

See [`COUNCIL_PHASE0.md`](COUNCIL_PHASE0.md). Amendments folded in here (they override earlier wording above):

1. **Claims ledger.** Every number on the site is a typed claim `{ value, label, source, asOf, status: 'verified' | 'owner-stated', context? }` in `src/content/`. `asOf` for repo numbers = **2026-11-21** (date read).
2. **Aegis — coverage always beside "0 confident-wrong".** Required rendering: "8 real incident captures: 0 confidently wrong · 2 partially correct · 6 abstained · 0 fully correct". The 15 synthetic scenarios are always labelled "regression gate, not an accuracy estimate". Test counts are static facts in the case study, never animated counters.
3. **KeralaFloodBench — finding first.** Lead: "39 of 40 failed runs were the agent misusing its tools, not missing flood knowledge" + "found and fixed 2 upstream GISclaw bugs". Then "12 / 52 runs correct — one complete run (repeat 1), 23 questions, arm differences not statistically significant". Do not say "first run".
4. **Grammar Tax — both figures, one sentence.** "1.47× faster grammar mask, bit-identical output — about +1.5 % end-to-end on llama.cpp's default path, +24 % where the mask runs every step. Not merged upstream." C++ appears only in this case study's stack, never in Skills.
5. **AI-assistance disclosure.** Home page, "How I work": "I design, specify and verify. AI coding agents write much of the implementation; acceptance criteria, strict types, tests and CI decide what ships." Per case study, only what the repo states: Aegis ("Claude Code wrote most of the implementation"), KeralaFloodBench ("implemented with AI coding agents — Codex, Claude Code — under my direction"), Grammar Tax ("written with an AI assistant (Claude)"). Deep Learning Tutor and Cold Chain repos make no statement → the site makes none (→ OPEN_QUESTIONS). This portfolio's own footer + README: "Designed and directed by Joshua; built with Claude Code."
6. **Hero.** Name; "AI & Python engineer · B.Tech AI & Data Science, RSET (2024–2028)"; brand line + gloss "Systems that show their evidence — or refuse to guess when it's thin."; "Open to internships and roles in AI & software engineering"; Resume / GitHub / Email. Availability month → OPEN_QUESTIONS.
7. **Glosses** (plain English, used once near first mention): RSET = Rajagiri School of Engineering & Technology, Kochi · CUSAT = Cochin University of Science and Technology · THROTTLE = 16-hour inter-college hackathon · NPTEL = India's national online-course programme run by the IITs (proctored exam) · V-Guard Big Idea = innovation challenge run by V-Guard Industries.
   - CUSAT expansion and NPTEL/V-Guard glosses are general public knowledge about the institutions, not claims about Joshua.
8. **Awards lead with scale:** "1 of 17 finalist teams from 1,000+ — Special Jury Award, V-Guard Big Idea 2026".
9. **Status labels:** Tern = "In progress · no public repo yet"; UrbanTherm = "NeST Digital GIS Mapathon — 4th place" only (no description invented).
10. **Credits:** KeralaFloodBench is "built on GISclaw (open source, AGPL-3.0)" with a link to `github.com/geumjin99/GISclaw`; Cold Chain Handshake credits "team of four" (teammate names → OPEN_QUESTIONS).
11. **Production build ships without source maps.** The easter-egg nickname is in a lazy JS chunk and lightly encoded; treat it as discoverable, never as secret.
