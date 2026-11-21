import { useRef } from 'react';
import type { MouseEvent } from 'react';
import { flagships } from '../content/projects';
import type { Project } from '../content/types';
import { Link } from '../lib/router';
import { useGsap } from '../lib/hooks';
import { ensureGsap } from '../lib/gsap';
import { revealIn } from '../lib/anim';
import { motionAllowed, usePrefs } from '../lib/prefs';
import { reelQuery } from '../design/tokens';
import { captureFlip } from '../lib/transition';
import { sfx } from '../lib/audio';
import { Picture, Cover } from '../components/Media';
import { withBase } from '../lib/base';
import { scrollTo } from '../lib/smooth';

function FlagshipCard({ p, index }: { p: Project; index: number }) {
  const onNav = (e: MouseEvent<HTMLAnchorElement>) => {
    const card = e.currentTarget.closest('.pcard');
    captureFlip(card?.querySelector('[data-flip-id]') ?? null);
    sfx('open');
  };
  return (
    <article className="pcard" data-cursor="view">
      <div className="pcard__inner" data-tilt>
        <div className="pcard__media" data-flip-id={`media-${p.slug}`}>
          {p.award && <span className="tag tag--award pcard__badge">{p.award}</span>}
          {(p.cardImage ?? p.image) ? (
            <Picture name={(p.cardImage ?? p.image)!.name} alt={(p.cardImage ?? p.image)!.alt} sizes="(min-width: 1024px) 38vw, 92vw" />
          ) : (
            <Cover spec={p.cover} title={p.title} />
          )}
        </div>
        <div className="pcard__body">
          <p className="pcard__meta">
            <b>{String(index + 1).padStart(2, '0')}</b>
            <span>{p.kicker}</span>
            {p.year && <span>{p.year}</span>}
          </p>
          <h3 className="pcard__title">
            <Link to={`/work/${p.slug}/`} instant beforeNavigate={onNav}>
              {p.title}
            </Link>
          </h3>
          <p className="pcard__one">{p.oneLiner}</p>
          {p.whyHard && <p className="pcard__why">{p.whyHard}</p>}
          {p.headline && (
            <div className="claim">
              <span className="claim__value">{p.headline.value}</span>
              <span className="claim__label">{p.headline.label}</span>
              {p.headline.context && <span className="claim__context">{p.headline.context}</span>}
            </div>
          )}
          <div className="pcard__foot">
            <span className="pcard__role">{p.role}</span>
            <span className="pcard__cta" aria-hidden="true">
              Case study <span>→</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function WorkReel() {
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const prefs = usePrefs();

  useGsap(
    ref,
    () => {
      revealIn(ref.current);
      if (!motionAllowed() || !ref.current || !track.current) return;
      const { gsap } = ensureGsap();
      const section = ref.current;
      const tr = track.current;

      // Hover distortion on card images (one shared SVG filter).
      const disp = document.querySelector('#distort feDisplacementMap');
      const onEnter = (e: Event) => {
        const t = e.target as HTMLElement;
        if (!t.classList?.contains('pcard') || !disp) return;
        sfx('hover');
        gsap.fromTo(disp, { attr: { scale: 0 } }, { attr: { scale: 26 }, duration: 0.3, ease: 'power2.out', yoyo: true, repeat: 1, overwrite: true });
      };
      section.addEventListener('pointerenter', onEnter, true);

      const mm = gsap.matchMedia();
      mm.add(reelQuery, () => {
        section.dataset.pinned = '1';
        const dist = () => Math.max(0, tr.scrollWidth - window.innerWidth);
        const tween = gsap.to(tr, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 0.8,
            start: 'top top',
            end: () => `+=${dist()}`,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
            },
          },
        });
        // Keyboard: focusing a card that is off-screen scrolls the page to the matching point of the reel.
        const onFocus = (e: FocusEvent) => {
          const st = tween.scrollTrigger;
          const item = (e.target as HTMLElement).closest<HTMLElement>('.reel__item');
          if (!st || !item) return;
          const max = dist() || 1;
          const p = Math.min(1, item.offsetLeft / max);
          window.scrollTo({ top: st.start + p * (st.end - st.start), behavior: 'auto' });
        };
        tr.addEventListener('focusin', onFocus);
        return () => {
          tr.removeEventListener('focusin', onFocus);
          delete section.dataset.pinned;
        };
      });
      return () => {
        section.removeEventListener('pointerenter', onEnter, true);
        mm.revert();
      };
    },
    [prefs.motion, prefs.recruiter],
    { defer: true },
  );

  return (
    <section className="section reel" id="work" ref={ref} aria-labelledby="work-title">
      <div className="wrap reel__head section__head section__head--split">
        <div style={{ display: 'grid', gap: 'var(--space-m)' }}>
          <p className="eyebrow" data-reveal>
            02 — Selected work
          </p>
          <h2 className="h-section" id="work-title" data-split data-vel>
            Three projects, evidence attached.
          </h2>
        </div>
        <div style={{ display: 'grid', gap: 'var(--space-s)', justifyItems: 'start' }}>
          <p className="lede" data-reveal>
            Each case study shows the problem, the architecture, what I owned and the measured results — with sources.
          </p>
          <p className="reel__hint mono muted" aria-hidden="true">
            Scroll to move through the work →
          </p>
        </div>
      </div>
      <ol className="reel__track" ref={track} role="list">
        {flagships.map((p, i) => (
          <li className="reel__item" key={p.slug}>
            <FlagshipCard p={p} index={i} />
          </li>
        ))}
        <li className="reel__item reel__item--end">
          <div className="reel__end">
            <div>
              <a
                href={withBase('/#projects')}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('projects');
                }}
              >
                All projects ↓
              </a>
              <p>Lab work, course projects and works in progress.</p>
            </div>
          </div>
        </li>
      </ol>
      <div className="reel__progress" aria-hidden="true">
        <span ref={bar} />
      </div>
    </section>
  );
}
