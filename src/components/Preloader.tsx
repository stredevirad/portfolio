// First-visit preloader. The inline <head> script sets html[data-preload] only on the first visit to the home page
// (sessionStorage), with full motion and outside recruiter mode. The hero name sits above the overlay the whole time
// (it is the LCP element and is never hidden): the counter runs while the name's weight resolves from thin to bold,
// then the curtain lifts and the name is already in place — a shared-element hand-off with no second copy.
import { useEffect, useRef } from 'react';
import { coreGsap } from '../lib/gsap';
import { motion } from '../design/tokens';
import { writeSession } from '../lib/storage';
import { sfx } from '../lib/audio';

export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    writeSession('visited', '1');
    const html = document.documentElement;
    if (!html.hasAttribute('data-preload') || !root.current) return;
    const gsap = coreGsap();
    const name = document.querySelector<HTMLElement>('.hero__name');
    const state = { p: 0 };
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    const started = performance.now();
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      sfx('open');
      gsap
        .timeline({
          onComplete: () => {
            html.removeAttribute('data-preload');
            name?.style.removeProperty('--name-wght');
            window.dispatchEvent(new Event('jhj:preloaded'));
          },
        })
        .to(root.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.8, ease: 'power4.inOut' });
    };

    const tl = gsap.timeline();
    tl.to(state, {
      p: 100,
      duration: motion.preloader.min,
      ease: 'power2.inOut',
      onUpdate: () => {
        const v = Math.round(state.p);
        if (count.current) count.current.textContent = String(v).padStart(3, '0');
        if (bar.current) bar.current.style.transform = `scaleX(${state.p / 100})`;
        name?.style.setProperty('--name-wght', String(Math.round(220 + (state.p / 100) * 540)));
      },
    });
    const cap = window.setTimeout(finish, motion.preloader.max * 1000);
    void Promise.all([fontsReady, new Promise((r) => tl.eventCallback('onComplete', r))]).then(() => {
      const wait = Math.max(0, motion.preloader.min * 1000 - (performance.now() - started));
      window.setTimeout(finish, wait);
    });
    return () => {
      window.clearTimeout(cap);
      tl.kill();
    };
  }, []);

  return (
    <div className="preloader" ref={root} aria-hidden="true">
      <div className="preloader__top">
        <span>Joshua Herbert Japheth · Portfolio</span>
        <span>Kochi, Kerala</span>
      </div>
      <div className="preloader__bottom">
        <span>Collecting evidence</span>
        <span className="preloader__count">
          <span ref={count}>000</span>
        </span>
      </div>
      <div className="preloader__bar" ref={bar} />
    </div>
  );
}
