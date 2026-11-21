import { useRef } from 'react';
import { caseStudies, projectBySlug } from '../content/projects';
import { Link } from '../lib/router';
import { useGsap, useIsoLayoutEffect } from '../lib/hooks';
import { scrollKit } from '../lib/gsap';
import { revealIn } from '../lib/anim';
import { usePrefs } from '../lib/prefs';
import { takeFlip } from '../lib/transition';
import { scrollTo } from '../lib/smooth';
import { Picture, Cover } from '../components/Media';
import { Claim } from '../components/Claim';
import { ArchitectureDiagram } from '../components/ArchitectureDiagram';
import { IconArrowUpRight } from '../components/Icons';
import { NotFound } from './NotFound';

export function CaseStudy({ slug }: { slug: string }) {
  const ref = useRef<HTMLElement>(null);
  const prefs = usePrefs();
  const p = projectBySlug(slug);

  useGsap(ref, (late) => revealIn(ref.current, late), [prefs.motion, slug]);

  // Shared-element hand-off from the work card (GSAP Flip).
  useIsoLayoutEffect(() => {
    const state = takeFlip(`media-${slug}`);
    if (!state || !ref.current) return;
    scrollTo(0, { immediate: true });
    const target = ref.current.querySelector(`[data-flip-id="media-${slug}"]`);
    if (!target) return;
    const kit = scrollKit();
    if (!kit) return;
    kit.Flip.from(state, { targets: target, duration: 1.05, ease: 'expo.inOut', absolute: true, scale: true, zIndex: 60 });
  }, [slug]);

  if (!p || !p.caseStudy) return <NotFound />;
  const cs = p.caseStudy;
  const i = caseStudies.findIndex((c) => c.slug === slug);
  const prev = caseStudies[(i - 1 + caseStudies.length) % caseStudies.length]!;
  const next = caseStudies[(i + 1) % caseStudies.length]!;
  let n = 0;
  const label = (t: string) => {
    n += 1;
    return (
      <h2 className="cs-section__label">
        <span>{String(n).padStart(2, '0')}</span>
        {t}
      </h2>
    );
  };

  return (
    <article className="page-case" ref={ref} aria-labelledby="cs-title">
      <header className="cs-hero wrap">
        <Link to="/#work" className="cs-back">
          ← All work
        </Link>
        <p className="eyebrow">{p.kicker}</p>
        <h1 className="cs-title" id="cs-title" data-split>
          {p.title}
        </h1>
        <div className="cs-intro">
          <div style={{ display: 'grid', gap: 'var(--space-m)' }}>
            <p className="cs-intro__one">{p.oneLiner}</p>
            {p.whyHard && <p className="lede">{p.whyHard}</p>}
            <div className="cs-links">
              {p.repo && (
                <a className="btn btn--primary" href={p.repo} target="_blank" rel="noopener noreferrer" data-magnetic data-cursor="open">
                  Repository <IconArrowUpRight />
                </a>
              )}
              <a className="btn" href="#results" onClick={(e) => (e.preventDefault(), scrollTo('results'))}>
                Jump to results
              </a>
            </div>
          </div>
          <ul className="cs-facts" role="list">
            <li>
              <span className="k">Role</span>
              <span>{p.role}</span>
            </li>
            {p.award && (
              <li>
                <span className="k">Award</span>
                <span>{p.award}</span>
              </li>
            )}
            {p.year && (
              <li>
                <span className="k">Year</span>
                <span>{p.year}</span>
              </li>
            )}
            <li>
              <span className="k">Stack</span>
              <span>{p.stack.join(' · ')}</span>
            </li>
          </ul>
        </div>
        <figure>
          <div className={`cs-media${p.image ? '' : ' cs-media--cover'}`} data-flip-id={`media-${p.slug}`}>
            {p.image ? <Picture name={p.image.name} alt={p.image.alt} sizes="(min-width: 1680px) 1600px, 94vw" eager /> : <Cover spec={p.cover} title={p.title} />}
          </div>
          {p.image?.caption && <figcaption className="cs-figcap">{p.image.caption}</figcaption>}
        </figure>
      </header>

      <div className="wrap">
        <section className="cs-section" aria-labelledby="cs-problem">
          <div id="cs-problem">{label('Problem')}</div>
          <div className="cs-section__body">
            <p className="cs-problem" data-reveal>
              {cs.problem}
            </p>
          </div>
        </section>

        <section className="cs-section" aria-labelledby="cs-approach">
          <div id="cs-approach">{label('Approach')}</div>
          <div className="cs-section__body">
            <ol className="cs-steps" role="list">
              {cs.approach.map((s) => (
                <li key={s} data-reveal>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="cs-section" aria-labelledby="cs-arch">
          <div id="cs-arch">{label('Architecture')}</div>
          <div className="cs-section__body">
            <ArchitectureDiagram diagram={cs.architecture} title={p.title} />
          </div>
        </section>

        <section className="cs-section" aria-labelledby="cs-stack">
          <div id="cs-stack">{label('Stack')}</div>
          <div className="cs-section__body">
            <ul className="cs-stack" role="list">
              {p.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="cs-section" aria-labelledby="cs-owned">
          <div id="cs-owned">{label('What I owned')}</div>
          <div className="cs-section__body cs-owned">
            <ul data-reveal>
              {cs.ownership.mine.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
            {cs.ownership.agents && (
              <p className="cs-owned__note" data-reveal>
                <strong>AI assistance: </strong>
                {cs.ownership.agents}
              </p>
            )}
            {cs.ownership.team && (
              <p className="cs-owned__note" data-reveal>
                <strong>Team: </strong>
                {cs.ownership.team}
              </p>
            )}
          </div>
        </section>

        <section className="cs-section" id="results" aria-labelledby="cs-results">
          <div id="cs-results">{label('Verified results')}</div>
          <div className="cs-section__body">
            <ul className="cs-results" role="list">
              {cs.results.map((r) => (
                <Claim key={r.value + r.label} claim={r} as="li" />
              ))}
            </ul>
            <h3 className="eyebrow" style={{ marginTop: 'var(--space-m)' }}>
              What these numbers don’t show
            </h3>
            <ul className="cs-caveats">
              {cs.caveats.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </section>

        {p.gallery && p.gallery.length > 0 && (
          <section className="cs-section" aria-labelledby="cs-gallery">
            <div id="cs-gallery">{label('More')}</div>
            <div className="cs-section__body cs-gallery">
              {p.gallery.map((g) => (
                <figure key={g.name} data-reveal>
                  <Picture name={g.name} alt={g.alt} sizes="(min-width: 1024px) 70vw, 94vw" />
                  {g.caption && <figcaption>{g.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </section>
        )}

        {cs.credits && (
          <section className="cs-section" aria-labelledby="cs-credits">
            <div id="cs-credits">{label('Credits')}</div>
            <ul className="cs-credits" role="list">
              {cs.credits.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <nav className="cs-pager" aria-label="More case studies">
        <Link to={`/work/${prev.slug}/`} data-cursor="view">
          <span className="k">← Previous</span>
          <strong>{prev.title}</strong>
        </Link>
        <Link to={`/work/${next.slug}/`} data-cursor="view">
          <span className="k">Next →</span>
          <strong>{next.title}</strong>
        </Link>
      </nav>
    </article>
  );
}
