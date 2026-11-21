// Projects. Every claim cites its source; see docs/PORTFOLIO_FACTS.md.
// Read date for all repo-backed numbers: 2026-11-21.
import type { Claim, Project } from './types';

const READ = '2026-11-21';

const gh = (repo: string, path = '') => `https://github.com/${repo}${path}`;

// ---------- Aegis ----------
const aegisRepo = 'stredevirad/aegis';
const aegisResults = gh(aegisRepo, '#results-and-what-they-dont-show');

export const aegisRealCaptures: Claim = {
  value: '2 partly right · 6 “can’t tell” · 0 confidently wrong',
  label: 'on 8 held-out real incident captures (OpenTelemetry Demo)',
  context:
    '0 fully correct. Abstaining is the design goal, but it means this shows no confident wrong answers on degraded telemetry — not accuracy. Small sample, no baseline comparison yet.',
  source: { label: 'aegis/README.md · Results', href: aegisResults },
  asOf: READ,
  status: 'verified',
};

// ---------- KeralaFloodBench ----------
const keralaRepo = 'stredevirad/kerala-flood-gis-agent';

export const keralaFinding: Claim = {
  value: '39 of 40',
  label: 'failed runs were the agent misusing its tools — not missing flood knowledge',
  context: '12 of 52 runs correct overall · one complete run · 23 questions',
  source: { label: 'kerala-flood-gis-agent/README.md · Key findings', href: gh(keralaRepo, '#key-findings') },
  asOf: READ,
  status: 'verified',
};

// ---------- Grammar Tax ----------
const grammarRepo = 'stredevirad/grammar-tax';

export const grammarHeadline: Claim = {
  value: '1.47× faster grammar mask',
  label: 'with bit-identical output, across 206 of 206 grammars',
  context: 'about +1.5% end-to-end on llama.cpp’s default path, +24% where the mask runs every step · not merged upstream',
  source: { label: 'grammar-tax/README.md · Results', href: gh(grammarRepo, '#results') },
  asOf: READ,
  status: 'verified',
};

export const projects: Project[] = [
  {
    slug: 'aegis',
    title: 'Aegis',
    kicker: 'Incident root-cause analysis',
    tier: 'flagship',
    tags: ['ai', 'backend'],
    oneLiner:
      'When a microservice breaks, Aegis names the service that caused it, shows the evidence — and says so plainly when it can’t tell.',
    whyHard:
      'Telemetry is noisy and incomplete. The hard part is never sounding more confident than the data: a deterministic engine decides, and the LLM may only explain or lower confidence.',
    headline: aegisRealCaptures,
    role: 'Solo project · design, architecture decisions, acceptance criteria, verification',
    year: '2026',
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'TypeScript', 'React', 'Docker', 'OpenTelemetry'],
    skills: ['python', 'fastapi', 'postgresql', 'sql', 'docker', 'gh-actions', 'pytest', 'agents-eval', 'llm-apis', 'git', 'linux'],
    repo: gh(aegisRepo),
    cover: { seed: 7, motif: 'graph' },
    cardImage: {
      name: 'aegis-card',
      alt: 'Aegis verdict panel: “Not enough evidence — next check: find out which services frontend depends on”, and “No root cause is stated”.',
    },
    image: {
      name: 'aegis-abstention',
      alt: 'Aegis abstention screen: “Not enough evidence”, no root cause named, with the next checks to run and the coverage gaps that stopped it.',
      caption: 'An abstention: no root cause named — the next checks to run instead, and the coverage gaps that stopped it.',
    },
    gallery: [
      {
        name: 'aegis-verdict',
        alt: 'Aegis verdict screen: “Strongly supported: catalog — change-induced (feature flag)”, with six passed checks, each citing evidence IDs.',
        caption: 'A confirmed verdict. Every passed check cites the evidence behind it.',
      },
    ],
    caseStudy: {
      problem:
        'During an outage, on-call engineers have metrics, logs and traces from dozens of services and very little time. An AI assistant that guesses makes it worse: a confident wrong root cause sends the whole team down the wrong path.',
      approach: [
        'A deterministic root-cause engine tests each candidate service against explicit checks that can pass, fail or be “not evaluable”: baseline validity, failure propagation in traces, isolation, recent changes, agreement across metrics, logs and traces.',
        'It names a root cause only when those checks support it. Otherwise the verdict is “not enough evidence”, with the next checks to run.',
        'An optional LLM may pick among the engine’s candidates, explain them with citations and lower confidence — never raise it. That rule is enforced by a validator in code, not by a prompt.',
        'Telemetry reaches the model only inside a randomly delimited, explicitly untrusted data block, so instructions injected into logs are treated as data.',
        'Under the hood: tenant isolation with PostgreSQL row-level security, a job queue in PostgreSQL (SKIP LOCKED + leases), SSRF-safe egress, a hash-chained audit log, and a pure, clock-free analysis core.',
      ],
      architecture: {
        summary:
          'Alerts are ingested and queued in PostgreSQL. A worker collects metrics, logs and traces into a redacted snapshot, which a pure analysis core turns into an evidence graph with a verdict. An optional, bounded LLM can only explain or lower confidence. Results reach the React UI through the API, and every action is written to a hash-chained audit log.',
        nodes: [
          { id: 'alert', label: 'Alerts & webhooks', sub: 'Alertmanager', x: 20, y: 30, kind: 'input' },
          { id: 'ingest', label: 'Ingestion', sub: 'dedupe · grouping', x: 270, y: 30 },
          { id: 'queue', label: 'PostgreSQL queue', sub: 'SKIP LOCKED + leases', x: 520, y: 30, kind: 'store' },
          { id: 'worker', label: 'Worker', sub: 'investigation jobs', x: 770, y: 30 },
          { id: 'collect', label: 'Collectors', sub: 'Prometheus · Loki · Jaeger', x: 770, y: 175, kind: 'input' },
          { id: 'snap', label: 'Telemetry snapshot', sub: 'redacted', x: 520, y: 175 },
          { id: 'core', label: 'Pure RCA core', sub: 'pass · fail · not evaluable', x: 270, y: 175, kind: 'core' },
          { id: 'graph', label: 'Evidence graph', sub: 'verdict · checks · next checks', x: 20, y: 175, kind: 'output' },
          { id: 'llm', label: 'Bounded LLM', sub: 'select · explain · lower only', x: 20, y: 320, kind: 'model' },
          { id: 'api', label: 'FastAPI + React UI', sub: 'live progress (SSE)', x: 270, y: 320 },
          { id: 'rem', label: 'Remediation', sub: 'two-person approval', x: 520, y: 320 },
          { id: 'audit', label: 'Audit log', sub: 'hash-chained', x: 270, y: 465, kind: 'store' },
        ],
        edges: [
          { from: 'alert', to: 'ingest' },
          { from: 'ingest', to: 'queue' },
          { from: 'queue', to: 'worker' },
          { from: 'worker', to: 'collect' },
          { from: 'collect', to: 'snap' },
          { from: 'snap', to: 'core' },
          { from: 'core', to: 'graph' },
          { from: 'graph', to: 'llm', dashed: true, label: 'optional' },
          { from: 'graph', to: 'api' },
          { from: 'graph', to: 'rem' },
          { from: 'api', to: 'audit' },
        ],
      },
      ownership: {
        mine: [
          'Scope and the core rule: deterministic checks decide; the LLM may only explain or lower confidence.',
          'Architecture decisions, recorded as ADRs and reviewed with LLM-council sessions.',
          'Acceptance criteria and the verification ledger that every claim in the README points to.',
        ],
        agents: 'Claude Code wrote most of the implementation under those decisions (stated in the repo’s README).',
      },
      results: [
        aegisRealCaptures,
        {
          value: '15 / 15 pass',
          label: 'synthetic regression scenarios: 12 correct, 3 appropriate abstentions, 0 confidently wrong',
          context: 'A regression gate written alongside the engine — not an accuracy estimate.',
          source: { label: 'aegis/README.md · Results', href: aegisResults },
          asOf: READ,
          status: 'verified',
        },
        {
          value: '366 backend tests',
          label: '137 of them against real PostgreSQL; plus mypy --strict, 81 frontend unit tests and 3 Playwright end-to-end tests, all in CI',
          source: { label: 'aegis/README.md · Results (CI)', href: gh(aegisRepo, '/actions/workflows/ci.yml') },
          asOf: READ,
          status: 'verified',
        },
        {
          value: 'v1.0.0 → v1.0.1',
          label: 'tagged releases with a one-command Docker demo',
          source: { label: 'GitHub releases', href: gh(aegisRepo, '/releases') },
          asOf: '2026-11-09',
          status: 'verified',
        },
        {
          value: '2.3× faster',
          label: 'investigations in the research prototype after switching to error-focused queries (137 s vs 312 s)',
          source: { label: 'aegis/README.md · Research history', href: gh(aegisRepo, '#research-history') },
          asOf: READ,
          status: 'verified',
        },
      ],
      caveats: [
        'Demo mode only — there is no production deployment.',
        'No live LLM output has been accepted yet: with a 1B local model, every assessment broke the bounds and was rejected, and the deterministic verdict stood.',
        'Accuracy beyond these benchmarks is unmeasured; thresholds are engineering defaults, not calibrated.',
      ],
    },
  },
  {
    slug: 'kerala-flood-bench',
    title: 'KeralaFloodBench',
    kicker: 'LLM GIS agent + benchmark',
    tier: 'flagship',
    tags: ['ai', 'gis'],
    oneLiner:
      'An AI agent that answers questions about the 2018 Kerala floods by writing and running real GIS code on satellite radar, elevation and map data.',
    whyHard:
      'When a small model fails at GIS, you can’t tell why. I built a frozen benchmark that separates “chose a different expert setting” from “couldn’t run the analysis”.',
    headline: keralaFinding,
    role: 'Solo project · built on the open-source GISclaw agent',
    year: '2026',
    stack: ['Python', 'GeoPandas', 'Rasterio', 'Shapely', 'Ollama', 'Sentinel-1', 'Copernicus DEM', 'OpenStreetMap'],
    skills: ['python', 'agents-eval', 'llm-apis', 'pytest', 'docker', 'git', 'gh-actions'],
    repo: gh(keralaRepo),
    cover: { seed: 18, motif: 'radar' },
    image: {
      name: 'kerala-flood-map',
      alt: 'Map of Ernakulam and Alappuzha districts from Sentinel-1 radar, 21 August 2018: detected flood in blue, permanent water in navy.',
      caption: 'Flood extent on 21 Aug 2018 from Sentinel-1 radar (threshold −14 dB). Contains modified Copernicus Sentinel-1 data (2018).',
    },
    gallery: [
      {
        name: 'kerala-histogram',
        alt: 'Histogram of radar backscatter with water and land peaks, and four threshold candidates marked; the chosen threshold is −14.0 dB.',
        caption: 'Choosing the water threshold: Otsu and Kittler–Illingworth sat on the land shoulder, so the valley (−14 dB) was chosen — post hoc, and reported as such.',
      },
    ],
    caseStudy: {
      problem:
        'Questions like “how many hospitals in Alappuzha were flood-affected?” need a GIS analyst’s expert choices: the radar water threshold, the buffer distance, a point versus a polygon. When an LLM agent gets them wrong, is it missing the expertise — or failing to run the analysis?',
      approach: [
        'An agent layer on top of GISclaw: a ReAct loop with a Python sandbox and geoprocessing tools, plus an AnswerChecker that rejects implausible answers (wrong unit, an area computed in degrees) and lets the agent retry.',
        'A domain pack serves each expert parameter with its value, unit and provenance through a domain_param tool.',
        'A frozen, hash-locked benchmark: 23 questions, gold answers from an independent script that never imports the agent, and three arms — the model picks the settings, gets them inline, or fetches them from the pack.',
        'Sandbox isolation: the agent only ever sees the data layers, never the gold answers, rubric or pack files.',
      ],
      architecture: {
        summary:
          'A plain-English question goes to the agent, which calls GIS tools in a sandbox holding radar, elevation and map layers, and can fetch expert settings from a domain pack. Its answer file passes an AnswerChecker, then a scorer compares it with gold answers computed by an independent script. Every benchmark file is frozen by SHA-256 hashes. Failures are classified into a taxonomy.',
        nodes: [
          { id: 'q', label: 'Question', sub: 'plain English', x: 20, y: 30, kind: 'input' },
          { id: 'agent', label: 'Agent', sub: 'ReAct loop on GISclaw', x: 270, y: 30, kind: 'core' },
          { id: 'tools', label: 'Tools', sub: 'geoprocess · execute', x: 520, y: 30 },
          { id: 'data', label: 'Sandbox data', sub: 'Sentinel-1 · DEM · OSM', x: 770, y: 30, kind: 'store' },
          { id: 'model', label: 'gpt-oss:20b', sub: 'local, via Ollama', x: 270, y: 175, kind: 'model' },
          { id: 'pack', label: 'Domain pack', sub: 'values + provenance', x: 520, y: 175, kind: 'store' },
          { id: 'answer', label: 'answer.json', sub: 'value · unit · params', x: 770, y: 175, kind: 'output' },
          { id: 'checker', label: 'AnswerChecker', sub: 'units · plausibility · retry', x: 770, y: 320, kind: 'core' },
          { id: 'scorer', label: 'Scorer', sub: 'frozen rubric', x: 520, y: 320, kind: 'core' },
          { id: 'gold', label: 'Gold answers', sub: 'independent script', x: 270, y: 320, kind: 'store' },
          { id: 'hash', label: 'SHA-256 freeze', sub: 'questions · gold · layers', x: 20, y: 320, kind: 'store' },
          { id: 'tax', label: 'Failure taxonomy', sub: 'what went wrong, per run', x: 520, y: 465, kind: 'output' },
        ],
        edges: [
          { from: 'q', to: 'agent' },
          { from: 'agent', to: 'tools' },
          { from: 'tools', to: 'data' },
          { from: 'agent', to: 'model' },
          { from: 'tools', to: 'pack', label: 'domain_param' },
          { from: 'data', to: 'answer' },
          { from: 'answer', to: 'checker' },
          { from: 'checker', to: 'scorer' },
          { from: 'gold', to: 'scorer' },
          { from: 'hash', to: 'gold' },
          { from: 'scorer', to: 'tax' },
        ],
      },
      ownership: {
        mine: [
          'The benchmark design: questions, the three arms, the floor check, the pre-committed re-run rule.',
          'Validation of the gold answers and the radar threshold, including the sensitivity analysis.',
          'Diagnosis of the failures and the upstream fixes.',
        ],
        agents: 'Implemented with AI coding agents (Codex, Claude Code) under my direction; decisions, validation and fixes are logged in PROGRESS.md (stated in the repo’s README).',
      },
      results: [
        keralaFinding,
        {
          value: '2 upstream bugs fixed',
          label: 'in GISclaw, each with a regression test: empty polygons counted as 1; slope on a geographic DEM gave ~89.95° for a 0.57° ramp',
          source: { label: 'kerala-flood-gis-agent/REPORT.md · §6', href: gh(keralaRepo, '/blob/HEAD/REPORT.md') },
          asOf: READ,
          status: 'verified',
        },
        {
          value: '12 / 52 runs correct',
          label: 'gpt-oss:20b, one complete run of the 52-run matrix',
          context: 'About one run per question per arm, so arm differences are not statistically meaningful (p = 1.00).',
          source: { label: 'kerala-flood-gis-agent/README.md · Headline results', href: gh(keralaRepo, '#headline-results-repeat-1-matrix_gptoss_v1-52-runs') },
          asOf: READ,
          status: 'verified',
        },
        {
          value: '2 / 6 on the floor check',
          label: 'gpt-oss:20b (borderline pass) vs Gemini 3.5 Flash-Lite 1/6, Qwen3.5 9B 0/6, Qwen2.5-Coder 7B 0/6',
          source: { label: 'kerala-flood-gis-agent/README.md · Floor check', href: gh(keralaRepo, '#headline-results-repeat-1-matrix_gptoss_v1-52-runs') },
          asOf: READ,
          status: 'verified',
        },
      ],
      caveats: [
        'A single complete run, small n, one model. A second run stopped at 35 of 52 when GPU access was lost and is not used anywhere.',
        'The radar water threshold (−14 dB) was chosen after looking at the histogram; ±1 dB sensitivity is reported.',
        'The elevation model is a DSM, not a DTM.',
      ],
      credits: [
        'Built on GISclaw (open source, AGPL-3.0) — github.com/geumjin99/GISclaw.',
        'Contains modified Copernicus Sentinel-1 data (2018), via Microsoft Planetary Computer; JRC Global Surface Water (Pekel et al. 2016); Copernicus DEM GLO-30; © OpenStreetMap contributors (ODbL).',
      ],
    },
  },
  {
    slug: 'cold-chain-handshake',
    title: 'Cold Chain Handshake',
    kicker: 'Offline-first Android · hackathon winner',
    tier: 'flagship',
    tags: ['android'],
    oneLiner:
      'An Android app that keeps a vaccine shipment’s temperature history and chain of custody trustworthy — even when the network isn’t.',
    whyHard:
      'Phones go offline, loggers disconnect and handovers happen in a hurry. Every record has to stay verifiable: hash-chained logs, a QR handover and a PASS / FAIL verdict at delivery.',
    headline: {
      value: '1st place',
      label: 'THROTTLE — a 16-hour inter-college hackathon',
      context: 'Team of four · I owned the dispatch and handover layer',
      source: { label: 'Owner’s record' },
      asOf: '2026',
      status: 'owner-stated',
    },
    role: 'Team of four · I owned the dispatch and handover layer',
    team: 'Team project (4)',
    award: '1st place, THROTTLE',
    year: '2026',
    stack: ['Kotlin', 'Jetpack Compose', 'Room', 'Supabase'],
    skills: ['kotlin', 'android', 'supabase', 'sql', 'git'],
    repo: gh('ColdChainHandshake/ColdChainHandshake'),
    cover: { seed: 42, motif: 'chain' },
    caseStudy: {
      problem:
        'Vaccines and insulin have to stay inside a narrow temperature range from depot to pharmacy. When a logger disconnects or the network drops, nobody can say what happened on the road — or whether the record was changed afterwards.',
      approach: [
        'Offline first: Room buffers every reading on the phone and syncs to Supabase when the network returns.',
        'A safety engine detects temperature breaches, escalates alerts from worker to supervisor to pharmacist, and quarantines the shipment.',
        'Telemetry is hash-chained, so the receiving pharmacist can check that nothing was altered on the way.',
        'Handover: QR pairing between phones, worker and pharmacist sign-off, and a PASS / FAIL verdict.',
      ],
      architecture: {
        summary:
          'A shipment is dispatched and paired to a logger by QR code. Simulated temperature readings are buffered in Room and synced to Supabase. A breach detector escalates alerts and can quarantine the shipment. Readings are hash-chained, and at delivery the handover step checks signatures and the chain to give a PASS or FAIL verdict. Highlighted nodes are the layer I owned.',
        nodes: [
          { id: 'dispatch', label: 'Dispatch', sub: 'create shipment', x: 20, y: 30, kind: 'input', owned: true },
          { id: 'pair', label: 'QR pairing', sub: 'logger ↔ shipment', x: 270, y: 30, owned: true },
          { id: 'stream', label: 'Temperature stream', sub: 'simulated logger', x: 520, y: 30, kind: 'input' },
          { id: 'room', label: 'Room', sub: 'offline-first buffer', x: 770, y: 30, kind: 'store' },
          { id: 'sync', label: 'Sync', sub: 'when the network returns', x: 770, y: 175 },
          { id: 'supa', label: 'Supabase', sub: 'Postgres + REST', x: 770, y: 320, kind: 'store' },
          { id: 'breach', label: 'Breach detector', sub: 'safe range checks', x: 520, y: 175, kind: 'core' },
          { id: 'esc', label: 'Alert escalation', sub: 'worker → supervisor → pharmacist', x: 270, y: 175, kind: 'core' },
          { id: 'quar', label: 'Quarantine', sub: 'hold the shipment', x: 20, y: 175, kind: 'output' },
          { id: 'hash', label: 'Hash chain', sub: 'tamper-evident log', x: 520, y: 320, kind: 'core' },
          { id: 'hand', label: 'Handover', sub: 'signatures · QR', x: 270, y: 320, kind: 'core', owned: true },
          { id: 'verdict', label: 'PASS / FAIL', sub: 'at delivery', x: 20, y: 320, kind: 'output', owned: true },
        ],
        edges: [
          { from: 'dispatch', to: 'pair' },
          { from: 'pair', to: 'stream' },
          { from: 'stream', to: 'room' },
          { from: 'room', to: 'sync' },
          { from: 'sync', to: 'supa' },
          { from: 'stream', to: 'breach' },
          { from: 'breach', to: 'esc' },
          { from: 'esc', to: 'quar' },
          { from: 'breach', to: 'hash', label: 'logged' },
          { from: 'hash', to: 'hand' },
          { from: 'hand', to: 'verdict' },
        ],
      },
      ownership: {
        mine: ['The dispatch and handover layer: creating shipments, QR pairing, and the handover flow that ends in the PASS / FAIL verdict.'],
        team: 'Built in 16 hours by a team of four; my teammates built the other layers.',
      },
      results: [
        {
          value: '1st place',
          label: 'THROTTLE, a 16-hour inter-college hackathon (team of four)',
          source: { label: 'Owner’s record' },
          asOf: '2026',
          status: 'owner-stated',
        },
        {
          value: 'Native Android',
          label: 'Kotlin + Jetpack Compose UI, Room for local storage, Supabase for sync',
          source: { label: 'ColdChainHandshake/app/build.gradle', href: gh('ColdChainHandshake/ColdChainHandshake', '/blob/HEAD/app/build.gradle') },
          asOf: READ,
          status: 'verified',
        },
      ],
      caveats: ['A hackathon prototype: the temperature logger is simulated, and it has not been used with real shipments.'],
    },
  },
  {
    slug: 'deep-learning-tutor',
    title: 'Deep Learning Tutor',
    kicker: 'Research internship · CUSAT',
    tier: 'lab',
    tags: ['ai'],
    oneLiner:
      'A Streamlit workbench for learning deep learning by doing: train small networks, watch live curves, see Grad-CAM, and ask an AI tutor in English or Malayalam.',
    whyHard:
      'Teaching tools mislead when their numbers are rosy. It keeps a held-out test set that is evaluated once, after training — and says so when a dataset is too small for that.',
    headline: {
      value: '478 tests',
      label: 'hermetic — network blocked, every LLM call faked — run in CI on every push',
      source: { label: 'DeepLearningTutor/README.md · Tests', href: gh('stredevirad/DeepLearningTutor', '#tests') },
      asOf: READ,
      status: 'verified',
    },
    role: 'Research internship project at CUSAT, under Dr. Sudheep Elayidom',
    year: '2026',
    stack: ['Python', 'TensorFlow / Keras', 'Streamlit', 'Gemini', 'Ollama'],
    skills: ['python', 'tensorflow', 'gradcam', 'llm-apis', 'agents-eval', 'pytest', 'gh-actions', 'git'],
    repo: gh('stredevirad/DeepLearningTutor'),
    cover: { seed: 3, motif: 'grid' },
    image: {
      name: 'dlt-gradcam',
      alt: 'Deep Learning Tutor test tab: a handwritten 7, the 28×28 input the model sees, and a Grad-CAM heatmap over the stroke.',
      caption: 'Test tab: prediction plus a Grad-CAM heatmap of where the network looked.',
    },
    gallery: [
      {
        name: 'dlt-result',
        alt: 'Deep Learning Tutor result card after training on Iris, with validation and test accuracy shown side by side.',
        caption: 'Result card: validation and test accuracy side by side, with the size of the test set.',
      },
    ],
    caseStudy: {
      problem:
        'Students learning deep learning either copy notebooks they don’t understand or use toy demos that hide the details — and both can show flattering numbers.',
      approach: [
        'Configure a dense network or a small CNN in the sidebar and train it on built-in datasets (Iris, Wine, Breast Cancer, Digits, MNIST, Fashion-MNIST) or your own CSV / ZIP of images, with upload safety checks.',
        'Three splits with one job each: train, validate (live curves, early stopping), and a test set evaluated exactly once, after training.',
        'Understand the run: confusion matrix, per-class precision / recall / F1, and Grad-CAM heatmaps for image predictions.',
        'An AI tutor (Google Gemini online or Ollama offline) in English or Malayalam, an agent mode with five validated tools, and a knowledge base over your own PDFs.',
        'Export the trained model and a standalone Python script that reproduces the same split.',
      ],
      architecture: {
        summary:
          'The Streamlit UI drives a UI-independent core: data splitting and preprocessing, model builders, training and evaluation, Grad-CAM and export. Results feed an AI tutor backed by Gemini or Ollama, which can retrieve from a knowledge base and call validated tools in agent mode.',
        nodes: [
          { id: 'ui', label: 'Streamlit UI', sub: '4 tabs · English + Malayalam', x: 20, y: 30, kind: 'input' },
          { id: 'data', label: 'Data', sub: 'split · fit on train only', x: 270, y: 30 },
          { id: 'models', label: 'Models', sub: 'dense NN · small CNN', x: 520, y: 30 },
          { id: 'train', label: 'Training', sub: 'live curves · early stop', x: 770, y: 30, kind: 'core' },
          { id: 'eval', label: 'Evaluation', sub: 'test set once · per class', x: 770, y: 175, kind: 'output' },
          { id: 'gradcam', label: 'Grad-CAM', sub: 'where the model looked', x: 520, y: 175 },
          { id: 'export', label: 'Export', sub: '.keras + script', x: 270, y: 175, kind: 'output' },
          { id: 'rag', label: 'Knowledge base', sub: 'cosine + BM25', x: 20, y: 320, kind: 'store' },
          { id: 'tutor', label: 'AI tutor', sub: 'Gemini · Ollama', x: 270, y: 320, kind: 'model' },
          { id: 'agent', label: 'Agent mode', sub: '5 validated tools', x: 520, y: 320, kind: 'model' },
        ],
        edges: [
          { from: 'ui', to: 'data' },
          { from: 'data', to: 'models' },
          { from: 'models', to: 'train' },
          { from: 'train', to: 'eval' },
          { from: 'eval', to: 'gradcam' },
          { from: 'gradcam', to: 'export' },
          { from: 'eval', to: 'tutor' },
          { from: 'rag', to: 'tutor' },
          { from: 'tutor', to: 'agent' },
        ],
      },
      ownership: {
        mine: [
          'Built during my research internship at CUSAT (29 Apr – 12 Jun 2026) under Dr. Sudheep Elayidom.',
          'Reworked after I completed the NPTEL Deep Learning course: honest evaluation, the test-once split, measured results.',
        ],
      },
      results: [
        {
          value: '98.7%',
          label: 'MNIST test accuracy for the small CNN (3 epochs on a laptop CPU); Fashion-MNIST 89.8%',
          source: { label: 'DeepLearningTutor/README.md · Measured results', href: gh('stredevirad/DeepLearningTutor', '#measured-results') },
          asOf: '2026-11-12',
          status: 'verified',
        },
        {
          value: '2.7×',
          label: 'Grad-CAM heat lands on the digit’s pixels a median 2.7× more than chance (300 MNIST validation digits)',
          source: { label: 'DeepLearningTutor/README.md · Measured results', href: gh('stredevirad/DeepLearningTutor', '#measured-results') },
          asOf: '2026-11-12',
          status: 'verified',
        },
        {
          value: '478 tests',
          label: 'hermetic: network blocked, every Gemini and Ollama call faked; run in GitHub Actions',
          source: { label: 'DeepLearningTutor/README.md · Tests', href: gh('stredevirad/DeepLearningTutor', '#tests') },
          asOf: READ,
          status: 'verified',
        },
      ],
      caveats: [
        'An educational tool that runs on a laptop CPU — deliberately small models, not a production service.',
        'Small test sets are noisy: Iris has 22 test rows, so one flower is 4.5 points.',
      ],
    },
  },
  {
    slug: 'grammar-tax',
    title: 'Grammar Tax',
    kicker: 'Performance study · llama.cpp',
    tier: 'lab',
    tags: ['ai'],
    oneLiner:
      'A study I designed and measured: what grammar-constrained (JSON-schema) sampling costs in llama.cpp on a CPU, and how much three small patches remove.',
    whyHard:
      'The cost hides inside the sampler, not the model. I built a record/replay benchmark to isolate it, and proved the patched masks bit-identical before trusting any speed-up.',
    headline: grammarHeadline,
    role: 'A study I designed and measured',
    year: '2026',
    stack: ['C++', 'Python', 'llama.cpp', 'perf', 'callgrind'],
    skills: ['python', 'linux', 'agents-eval', 'git'],
    repo: gh(grammarRepo),
    cover: { seed: 11, motif: 'wave' },
    image: {
      name: 'grammar-cdf',
      alt: 'Cumulative distribution of per-token grammar cost on a log scale: the patched series sits clearly left of the baseline.',
      caption: 'Per-token grammar cost, baseline vs patched (log scale).',
    },
    gallery: [
      {
        name: 'grammar-speedup',
        alt: 'Chart of per-grammar speed-up of the mask for all 206 grammars, every one above 1×.',
        caption: 'Per-grammar speed-up: all 206 grammars faster (1.03× to 1.89×).',
      },
    ],
    caseStudy: {
      problem:
        'At every generation step, llama.cpp’s grammar sampler checks the whole vocabulary — 151,936 tokens for Qwen2.5 — against the grammar. On a CPU that mask cost a median of ~27 ms per token, about as much as running the 0.5B model itself.',
      approach: [
        'A record/replay benchmark that isolates mask computation from model inference: 206 grammars (8 built-in + 198 JSONSchemaBench schemas), 23,448 replayed tokens.',
        'Profiling with callgrind and perf found a large share of mask instructions in per-token heap allocation.',
        'Three small patches: one decode buffer per call, an ASCII match table, and reuse of per-stack reject lists.',
        'Correctness first: masks compared bit for bit on every recorded step, plus differential random-walk tests including partial-UTF-8 edge cases.',
        'Statistics: five interleaved runs, paired per grammar, bootstrap 95% confidence intervals — and every rejected idea documented with numbers.',
      ],
      architecture: {
        summary:
          'Constrained generations are recorded into traces, then replayed against the vocabulary without the model. Upstream llama.cpp at a pinned commit and the patched build are compared bit for bit on every step, then timed in interleaved A/B runs with bootstrap confidence intervals.',
        nodes: [
          { id: 'rec', label: 'grammar_record', sub: 'record constrained runs', x: 20, y: 30, kind: 'input' },
          { id: 'traces', label: 'Traces', sub: '44,650 steps · 2 vocabs', x: 270, y: 30, kind: 'store' },
          { id: 'replay', label: 'grammar_replay', sub: 'mask only, no model', x: 520, y: 30, kind: 'core' },
          { id: 'masks', label: 'Mask hashes', sub: '+ timings', x: 770, y: 30, kind: 'output' },
          { id: 'base', label: 'Upstream llama.cpp', sub: 'pinned commit', x: 270, y: 175, kind: 'store' },
          { id: 'patch', label: 'Patches 0001–0003', sub: '+72 / −23 lines', x: 520, y: 175, kind: 'core' },
          { id: 'check', label: 'Bit-exact check', sub: 'every recorded step', x: 770, y: 175, kind: 'output' },
          { id: 'ab', label: 'Interleaved A/B', sub: '5 paired runs · bootstrap CI', x: 520, y: 320, kind: 'core' },
          { id: 'result', label: '1.47× mask', sub: '≈ +1.5% end-to-end', x: 770, y: 320, kind: 'output' },
        ],
        edges: [
          { from: 'rec', to: 'traces' },
          { from: 'traces', to: 'replay' },
          { from: 'replay', to: 'masks' },
          { from: 'base', to: 'patch' },
          { from: 'patch', to: 'replay' },
          { from: 'masks', to: 'check' },
          { from: 'patch', to: 'ab' },
          { from: 'ab', to: 'result' },
          { from: 'check', to: 'result' },
        ],
      },
      ownership: {
        mine: ['The question, the benchmark design, the acceptance bar (bit-identical masks) and the statistics.'],
        agents: 'The code was written with an AI assistant (Claude); the repo discloses this, and says it must be disclosed in any upstream submission.',
      },
      results: [
        grammarHeadline,
        {
          value: '−32.7%',
          label: 'median per-token mask cost (27.3 ms → 18.5 ms); p99 −17.9%',
          source: { label: 'grammar-tax/README.md · Results', href: gh(grammarRepo, '#results') },
          asOf: READ,
          status: 'verified',
        },
        {
          value: 'Bit-identical',
          label: 'masks on every one of 44,650 trace steps (2 vocabularies) plus 17,167 random-walk steps',
          source: { label: 'grammar-tax/README.md · Results', href: gh(grammarRepo, '#results') },
          asOf: READ,
          status: 'verified',
        },
      ],
      caveats: [
        'The 1.47× is for mask computation. llama.cpp’s default sampler builds the full mask on only ~5% of steps, so end-to-end throughput there moves by about 2%.',
        'Nothing has been submitted or merged upstream.',
        'Measured on a 4-vCPU Xeon VM; numbers depend on the machine.',
      ],
    },
  },
  {
    slug: 'ai-resume-builder',
    title: 'AI Resume Builder Assistant',
    kicker: 'Course project · team',
    tier: 'archive',
    tags: ['ai', 'backend'],
    oneLiner: 'A chat assistant that builds a resume around the job you’re applying for.',
    whyHard:
      'Its ATS-style score is deterministic and explainable — no LLM produces it — and its suggestions never ask you to invent experience.',
    role: 'Team course project',
    team: 'Team project',
    year: '2026',
    stack: ['Python', 'FastAPI', 'Next.js', 'TypeScript', 'LaTeX'],
    skills: ['python', 'fastapi', 'llm-apis', 'git'],
    repo: gh('stredevirad/ai-resume-builder-assistant'),
    cover: { seed: 5, motif: 'grid' },
  },
  {
    slug: 'rulelens',
    title: 'RuleLens',
    kicker: 'Data mining · course project · team',
    tier: 'archive',
    tags: [],
    oneLiner: 'Mines buying patterns from retail transactions with Apriori and FP-Growth, both written from scratch.',
    whyHard:
      'It compares the conventional rule set with the smaller, support-preserving closed-itemset representation — and measures the difference.',
    role: 'Team course project',
    team: 'Team project',
    year: '2026',
    stack: ['Python', 'Streamlit'],
    skills: ['python'],
    cover: { seed: 51, motif: 'graph' },
  },
  {
    slug: 'webrank',
    title: 'WebRank',
    kicker: 'Web structure mining · course project · team',
    tier: 'archive',
    tags: ['backend'],
    oneLiner: 'Ranks web pages by link structure — PageRank, HITS and community detection over a DuckDB warehouse.',
    whyHard:
      'Every algorithm is cross-checked against NetworkX, and scalability is benchmarked up to the 5-million-edge web-Google graph.',
    role: 'Team course project',
    team: 'Team project',
    year: '2026',
    stack: ['Python', 'DuckDB', 'SQL', 'Streamlit'],
    skills: ['python', 'sql'],
    cover: { seed: 77, motif: 'rings' },
  },
  {
    slug: 'tern',
    title: 'Tern',
    kicker: 'In-memory database server',
    tier: 'lab',
    tags: ['backend'],
    oneLiner: 'A Redis-inspired in-memory database server.',
    status: 'In progress · no public repo yet',
    role: 'Work in progress',
    stack: [],
    skills: [],
    cover: { seed: 29, motif: 'rings' },
  },
  {
    slug: 'urbantherm',
    title: 'UrbanTherm',
    kicker: 'GIS mapathon entry',
    tier: 'archive',
    tags: ['gis'],
    oneLiner: 'My entry to the NeST Digital GIS Mapathon.',
    award: '4th place, NeST Digital GIS Mapathon',
    role: 'Mapathon entry',
    stack: [],
    skills: [],
    cover: { seed: 64, motif: 'radar' },
  },
];

export const flagships = projects.filter((p) => p.tier === 'flagship');
export const caseStudies = projects.filter((p) => p.caseStudy);
export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);

export const filterChips = [
  { id: 'all', label: 'All' },
  { id: 'ai', label: 'AI & Agents' },
  { id: 'backend', label: 'Backend' },
  { id: 'android', label: 'Android' },
  { id: 'gis', label: 'GIS' },
] as const;
export type FilterId = (typeof filterChips)[number]['id'];
