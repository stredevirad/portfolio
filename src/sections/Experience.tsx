import { useRef } from 'react';
import { experience } from '../content/experience';
import { Link } from '../lib/router';
import { useGsap } from '../lib/hooks';
import { ensureGsap } from '../lib/gsap';
import { revealIn } from '../lib/anim';
import { motionAllowed, usePrefs } from '../lib/prefs';

const kindLabel = { work: 'Work', education: 'Education', milestone: 'Milestone' } as const;

export function Experience() {
  const ref = useRef<HTMLElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const prefs = usePrefs();

  useGsap(
    ref,
    (late) => {
      revealIn(ref.current, late);
      if (!motionAllowed() || !ref.current || !line.current) return;
      const { gsap, ScrollTrigger } = ensureGsap();
      const list = ref.current.querySelector('.timeline');
      gsap.fromTo(line.current, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: list, start: 'top 70%', end: 'bottom 70%', scrub: 0.6 } });
      ref.current.querySelectorAll<HTMLElement>('.tl-item').forEach((item) => {
        ScrollTrigger.create({
          trigger: item,
          start: 'top 70%',
          onEnter: () => (item.dataset.on = '1'),
          onLeaveBack: () => (item.dataset.on = '0'),
        });
      });
    },
    [prefs.motion, prefs.recruiter],
    { defer: true },
  );

  return (
    <section className="section" id="experience" ref={ref} aria-labelledby="exp-title">
      <div className="wrap">
        <div className="section__head section__head--split">
          <div style={{ display: 'grid', gap: 'var(--space-m)' }}>
            <p className="eyebrow" data-reveal>
              04 — Experience &amp; milestones
            </p>
            <h2 className="h-section" id="exp-title" data-split data-vel>
              What I’ve done so far.
            </h2>
          </div>
          <p className="lede" data-reveal>
            One research internship, one degree in progress, and the projects I shipped along the way — newest first.
          </p>
        </div>
        <div className="timeline">
          <div className="timeline__rail" aria-hidden="true" />
          <div className="timeline__line" ref={line} aria-hidden="true" />
          <ol className="timeline__list" role="list">
          {experience.map((x) => (
            <li className="tl-item" key={x.id} data-on="0">
              <div className="tl-item__side">
                <p className="tl-item__period mono">{x.period}</p>
                <span className={`tag tl-item__kind${x.kind === 'work' ? ' tag--accent' : ''}`}>{kindLabel[x.kind]}</span>
              </div>
              <div className="tl-item__main" data-reveal>
                <h3>{x.title}</h3>
                <p className="tl-item__org">
                  {x.orgGloss ? <abbr title={x.orgGloss}>{x.org}</abbr> : x.org}
                  {x.orgGloss && <span className="muted"> — {x.orgGloss}</span>}
                  {x.location && <span className="muted"> · {x.location}</span>}
                </p>
                <ul>
                  {x.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
                {x.link && (
                  <p>
                    {x.link.internal ? (
                      <Link to={x.link.href} className="link" data-cursor="view">
                        {x.link.label} →<span className="visually-hidden"> {x.title}</span>
                      </Link>
                    ) : (
                      <a className="link" href={x.link.href} target="_blank" rel="noopener noreferrer">
                        {x.link.label}
                      </a>
                    )}
                  </p>
                )}
              </div>
            </li>
          ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
