import { useRef } from 'react';
import { achievements, marqueeItems } from '../content/achievements';
import { useGsap } from '../lib/hooks';
import { ensureGsap } from '../lib/gsap';
import { revealIn } from '../lib/anim';
import { motionAllowed, usePrefs } from '../lib/prefs';

export function Achievements() {
  const ref = useRef<HTMLElement>(null);
  const prefs = usePrefs();

  // Counters animate only to the real values; the final value is already in the HTML.
  useGsap(
    ref,
    () => {
      revealIn(ref.current);
      if (!motionAllowed() || !ref.current) return;
      const { gsap } = ensureGsap();
      ref.current.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
        const end = Number(el.dataset.count);
        const num = el.querySelector<HTMLElement>('.award__num');
        if (!num || !Number.isFinite(end)) return;
        const final = num.textContent ?? '';
        const o = { v: 0 };
        gsap.to(o, {
          v: end,
          duration: end > 20 ? 1.6 : 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          onStart: () => (num.textContent = '0'),
          onUpdate: () => (num.textContent = String(Math.round(o.v))),
          onComplete: () => (num.textContent = final),
        });
      });
    },
    [prefs.motion, prefs.recruiter],
  );

  return (
    <section className="section" id="achievements" ref={ref} aria-labelledby="awards-title">
      <div className="wrap">
        <div className="section__head section__head--split">
          <div style={{ display: 'grid', gap: 'var(--space-m)' }}>
            <p className="eyebrow" data-reveal>
              05 — Awards &amp; certificates
            </p>
            <h2 className="h-section" id="awards-title" data-split data-vel>
              Results, not adjectives.
            </h2>
          </div>
          <p className="lede" data-reveal>
            Hackathons, an innovation challenge and two national certification exams.
          </p>
        </div>
        <ul className="awards" role="list">
          {achievements.map((a) => (
            <li className="award" key={a.id} data-count={a.count} data-reveal>
              <p className="award__value">
                {a.prefix}
                <span className="award__num">{a.count}</span>
                <small>{a.suffix}</small>
              </p>
              <h3>{a.title}</h3>
              <p>{a.detail}</p>
              {a.gloss && <p className="award__gloss">{a.gloss}</p>}
            </li>
          ))}
        </ul>
      </div>
      <div className="marquee">
        <div className="marquee__track">
          <ul role="list">
            {marqueeItems.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <ul role="list" aria-hidden="true">
            {marqueeItems.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
