// Content model. Every number on the site is a Claim with a source, a date and a status.
// The compiler enforces the required fields, so an unsourced claim fails `npm run typecheck`
// (council Phase 0, amendment 1). Facts come from docs/PORTFOLIO_FACTS.md.

import type { ImageName } from './images.generated';

export type ClaimStatus = 'verified' | 'owner-stated';

export interface Source {
  /** Human label, e.g. "aegis/README.md · Results". */
  label: string;
  /** Public URL when one exists. Owner-stated facts may have none. */
  href?: string;
}

export interface Claim {
  /** The headline value, e.g. "0 confidently wrong". */
  value: string;
  /** What it measures, in plain English. */
  label: string;
  /** Context that must always render next to the value (coverage, caveat, sample size). */
  context?: string;
  source: Source;
  /** ISO date the source was read or the event happened. */
  asOf: string;
  status: ClaimStatus;
}

export type ProjectTag = 'ai' | 'backend' | 'android' | 'gis';
export type Tier = 'flagship' | 'lab' | 'archive';

export type SkillId =
  | 'python' | 'java' | 'kotlin' | 'sql'
  | 'android'
  | 'tensorflow' | 'gradcam' | 'llm-apis' | 'agents-eval'
  | 'fastapi' | 'postgresql' | 'supabase'
  | 'git' | 'docker' | 'gh-actions' | 'pytest' | 'linux'
  | 'gcp' | 'earth-engine' | 'qgis';

export interface DiagramNode {
  id: string;
  label: string;
  sub?: string;
  /** Position in a 1000 × 560 viewBox (top-left of the node box). */
  x: number;
  y: number;
  w?: number;
  kind?: 'input' | 'core' | 'store' | 'model' | 'output';
  /** Highlighted as the part Joshua owned (team projects). */
  owned?: boolean;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
}

export interface Diagram {
  summary: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface ProjectImage {
  name: ImageName;
  alt: string;
  caption?: string;
}

export interface Ownership {
  /** What Joshua decided / did himself. */
  mine: string[];
  /** What AI coding agents did, only if the repo itself says so. */
  agents?: string;
  /** What teammates did. */
  team?: string;
}

export interface CaseStudy {
  problem: string;
  approach: string[];
  architecture: Diagram;
  ownership: Ownership;
  results: Claim[];
  caveats: string[];
  credits?: string[];
}

export interface CoverSpec {
  /** Seed for the generative SVG cover. */
  seed: number;
  /** Visual motif. */
  motif: 'graph' | 'radar' | 'chain' | 'grid' | 'wave' | 'rings';
}

export interface Project {
  slug: string;
  title: string;
  kicker: string;
  tier: Tier;
  tags: ProjectTag[];
  /** Card sentence 1: what it is (plain English, no jargon). */
  oneLiner: string;
  /** Card sentence 2: why it's hard or interesting. */
  whyHard?: string;
  /** The single claim shown on the card. Context always renders with it. */
  headline?: Claim;
  role: string;
  team?: string;
  status?: string;
  award?: string;
  year?: string;
  stack: string[];
  skills: SkillId[];
  repo?: string;
  cover: CoverSpec;
  image?: ProjectImage;
  gallery?: ProjectImage[];
  caseStudy?: CaseStudy;
}

export interface ExperienceItem {
  id: string;
  kind: 'work' | 'education' | 'milestone';
  title: string;
  org: string;
  orgGloss?: string;
  period: string;
  start: string;
  location?: string;
  points: string[];
  link?: { label: string; href: string; internal?: boolean };
  status: ClaimStatus;
}

export interface Achievement {
  id: string;
  /** Numeric part for the counter animation. */
  count: number;
  prefix?: string;
  suffix?: string;
  /** Full value as plain text — rendered in HTML so it is correct without JS. */
  display: string;
  title: string;
  detail: string;
  gloss?: string;
  project?: string;
  status: ClaimStatus;
}

export interface SkillGroup {
  id: string;
  label: string;
  skills: { id: SkillId; label: string; primary?: boolean }[];
}
