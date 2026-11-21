// Identity and site-wide copy. Source: docs/PORTFOLIO_FACTS.md (Identity, council amendments 5–7).

export const site = {
  name: 'Joshua Herbert Japheth',
  firstName: 'Joshua',
  initials: 'JHJ',
  nameLines: ['Joshua', 'Herbert', 'Japheth'] as const,
  role: 'AI & Python engineer',
  education: 'B.Tech, Artificial Intelligence & Data Science',
  school: 'Rajagiri School of Engineering & Technology (RSET)',
  schoolShort: 'RSET',
  schoolGloss: 'Rajagiri School of Engineering & Technology, Kochi',
  years: '2024–2028',
  cgpa: '8.52',
  location: 'Kochi, Kerala, India',
  locationShort: 'Kochi, Kerala',
  timeZone: 'Asia/Kolkata',
  email: 'joshuajapheth14@gmail.com',
  github: 'https://github.com/stredevirad',
  githubHandle: 'stredevirad',
  linkedin: 'https://www.linkedin.com/in/joshuaherbertjapheth',
  linkedinHandle: 'joshuaherbertjapheth',
  origin: 'https://stredevirad.github.io',
  basePath: '/portfolio/',
  url: 'https://stredevirad.github.io/portfolio/',
  resumePdf: 'resume/Joshua-Herbert-Japheth-Resume.pdf',

  heroLead: 'I build AI that knows when to say',
  heroEmphasis: 'I don’t know.',
  heroGloss: 'Systems that show their evidence — or refuse to guess when it’s thin.',
  intro:
    'I’m an AI & Data Science undergrad at RSET in Kochi. I build LLM agents, evaluation pipelines and well-tested Python backends.',
  availability: 'Open to internships and roles in AI & software engineering.',
  howIWork:
    'I design, specify and verify. AI coding agents write much of the implementation; acceptance criteria, strict types, tests and CI decide what ships. Each case study says exactly what I owned.',

  metaTitle: 'Joshua Herbert Japheth — AI & Python engineer',
  metaDescription:
    'Joshua Herbert Japheth, AI & Python engineer in Kochi, India. LLM agents, evaluation pipelines and tested Python backends that show their evidence or refuse to guess.',
  lastVerified: '2026-11-21',
} as const;

export const principles = [
  {
    n: '01',
    title: 'Show the evidence.',
    body: 'Every verdict cites what it rests on. In Aegis, each check links to the metric, log or trace behind it.',
  },
  {
    n: '02',
    title: 'Abstain when it’s thin.',
    body: '“Not enough evidence” is a valid answer. A confident wrong answer costs an on-call team more than an honest “I don’t know”.',
  },
  {
    n: '03',
    title: 'Measure, then claim.',
    body: 'Freeze the benchmark, report the misses, publish the caveats. The numbers on this site link to where they came from.',
  },
] as const;

export const nav = [
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'achievements', label: 'Awards' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
] as const;
