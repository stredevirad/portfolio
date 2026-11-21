// Achievements and certifications — owner's fact sheet (docs/PORTFOLIO_FACTS.md).
// Counters animate only to these real values; the final value is always in the HTML.
// Hard exclusions (never add): see CLAUDE.md.
import type { Achievement } from './types';

export const achievements: Achievement[] = [
  {
    id: 'throttle',
    count: 1,
    suffix: 'st',
    display: '1st',
    title: 'THROTTLE',
    detail: '1st place with Cold Chain Handshake, team of four.',
    gloss: 'A 16-hour inter-college hackathon.',
    project: 'cold-chain-handshake',
    status: 'owner-stated',
  },
  {
    id: 'vguard',
    count: 17,
    display: '17 of 1,000+',
    suffix: ' of 1,000+',
    title: 'V-Guard Big Idea 2026',
    detail: 'One of 17 finalist teams from 1,000+, and a Special Jury Award — with teammates Rohith and Dane.',
    gloss: 'An innovation challenge run by V-Guard Industries.',
    status: 'owner-stated',
  },
  {
    id: 'nptel-cloud',
    count: 91,
    suffix: '%',
    display: '91%',
    title: 'NPTEL Cloud Computing',
    detail: 'IIT Kharagpur · Elite + Gold · top 5%.',
    gloss: 'NPTEL: India’s national online-course programme from the IITs, with a proctored exam.',
    status: 'owner-stated',
  },
  {
    id: 'nest',
    count: 4,
    suffix: 'th',
    display: '4th',
    title: 'NeST Digital GIS Mapathon',
    detail: '4th place with UrbanTherm.',
    project: 'urbantherm',
    status: 'owner-stated',
  },
  {
    id: 'nptel-dl',
    count: 79,
    suffix: '%',
    display: '79%',
    title: 'NPTEL Deep Learning',
    detail: 'IIT Ropar · Elite + Silver.',
    status: 'owner-stated',
  },
];

export const marqueeItems = [
  'THROTTLE — 1st place',
  'V-Guard Big Idea 2026 — Special Jury Award',
  'NeST Digital GIS Mapathon — 4th place',
  'NPTEL Cloud Computing — Elite + Gold',
  'NPTEL Deep Learning — Elite + Silver',
] as const;
