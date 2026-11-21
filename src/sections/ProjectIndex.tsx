import { useRef, useState } from 'react';
import { filterChips, projects } from '../content/projects';
import type { FilterId } from '../content/projects';
import type { Project } from '../content/types';
import { Link } from '../lib/router';
import { useGsap, useIsoLayoutEffect } from '../lib/hooks';
import { ensureGsap, scrollKit } from '../lib/gsap';
import { revealIn } from '../lib/anim';
import { motionAllowed, usePrefs } from '../lib/prefs';
import { sfx } from '../lib/audio';
import { Cover } from '../components/Media';

type FlipState = ReturnType<typeof import('gsap/Flip').Flip.getState>;

const tierLabel: Record<Project['tier'], string> = { flagship: 'Flagship', lab: 'Lab', archive: 'Archive' };

const matches = (p: Project, f: FilterId) => f === 'all' || p.tags.includes(f);

function ProjectItem({ p, shown }: { p: Project; shown: boolean }) {
  return (
    <li className="pitem" hidden={!shown} data-slug={p.slug}>
      <div className="pitem__cover" aria-hidden="true" data-skew>
        <Cover spec={p.cover} title={p.title} />
      </div>
      <div className="pitem__top">
        <span className="tag">{tierLabel[p.tier]}</span>
        {p.award && <span className="tag tag--award">{p.award}</span>}
        {p.status && <span className="tag tag--accent">{p.status}</span>}
        {p.team && <span className="tag">{p.team}</span>}
      </div>
      <p className="pitem__kicker mono">{p.kicker}</p>
      <h3>{p.title}</h3>
      <p>{p.oneLiner}</p>
      {p.whyHard && p.tier !== 'flagship' && <p>{p.whyHard}</p>}
      <div className="pitem__links">
        {p.caseStudy && (
          <Link to={`/work/${p.slug}/`} className="link" data-cursor="view">
            Case study<span className="visually-hidden">: {p.title}</span>
          </Link>
        )}
        {p.repo && (
          <a className="link" href={p.repo} target="_blank" rel="noopener noreferrer" data-cursor="open">
            Repository<span className="visually-hidden">: {p.title} (opens GitHub)</span>
          </a>
        )}
        {!p.caseStudy && !p.repo && <span className="muted mono">No public repo</span>}
      </div>
    </li>
  );
}

export function ProjectIndex() {
  const ref = useRef<HTMLElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const prefs = usePrefs();
  const [filter, setFilter] = useState<FilterId>('all');
  const flip = useRef<FlipState | null>(null);

  useGsap(ref, (late) => revealIn(ref.current, late), [prefs.motion], { defer: true });

  const choose = (f: FilterId) => {
    if (f === filter) return;
    sfx('tick');
    const kit = scrollKit();
    if (motionAllowed() && list.current && kit) {
      flip.current = kit.Flip.getState(list.current.querySelectorAll('.pitem'));
    }
    setFilter(f);
  };

  useIsoLayoutEffect(() => {
    const state = flip.current;
    flip.current = null;
    if (!state) return;
    const { Flip, gsap } = ensureGsap();
    Flip.from(state, {
      duration: 0.7,
      ease: 'power3.inOut',
      absolute: true,
      scale: true,
      stagger: 0.03,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.5, delay: 0.2 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.35 }),
    });
  }, [filter]);

  const count = projects.filter((p) => matches(p, filter)).length;

  return (
    <section className="section pindex" id="projects" ref={ref} aria-labelledby="projects-title">
      <div className="wrap">
        <div className="section__head section__head--split">
          <div style={{ display: 'grid', gap: 'var(--space-m)' }}>
            <p className="eyebrow" data-reveal>
              03 — Everything else
            </p>
            <h2 className="h-section" id="projects-title" data-split data-vel>
              All projects.
            </h2>
          </div>
          <p className="lede" data-reveal>
            Lab work, course projects and works in progress. Team projects are marked; projects without a public repo say so.
          </p>
        </div>
        <div className="chips" role="group" aria-label="Filter projects">
          {filterChips.map((c) => (
            <button type="button" key={c.id} className="chip" aria-pressed={filter === c.id} onClick={() => choose(c.id)} data-magnetic>
              {c.label}
              <sup>{projects.filter((p) => matches(p, c.id)).length}</sup>
            </button>
          ))}
        </div>
        <p className="pindex__status mono" role="status" aria-live="polite">
          Showing {count} of {projects.length} projects
        </p>
        <ul className="pgrid" ref={list} role="list">
          {projects.map((p) => (
            <ProjectItem key={p.slug} p={p} shown={matches(p, filter)} />
          ))}
        </ul>
      </div>
    </section>
  );
}
