// Shared scroll reveals, used inside each section's gsap.context (so everything is reverted on unmount).
import { ensureGsap } from './gsap';
import { motionAllowed } from './prefs';

/** True if any part of `el` is inside the viewport. */
export function onScreen(el: Element): boolean {
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight && r.bottom > 0;
}

/**
 * Split-line reveals for [data-split] headings and fade-up reveals for [data-reveal] blocks inside `scope`.
 * `late` (set by useGsap when setup ran after first paint): elements already on screen are left as they are,
 * so visible content is never hidden and re-revealed.
 */
export function revealIn(scope: HTMLElement | null, late = false): void {
  if (!scope || !motionAllowed()) return;
  const { gsap, ScrollTrigger, SplitText } = ensureGsap();
  const keep = (el: Element) => late && onScreen(el);

  scope.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    if (keep(el)) return;
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.15,
          ease: 'expo.out',
          stagger: 0.09,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      },
    });
  });

  const items = gsap.utils.toArray<HTMLElement>(scope.querySelectorAll('[data-reveal]')).filter((el) => !keep(el));
  if (items.length) {
    gsap.set(items, { autoAlpha: 0, y: 40 });
    ScrollTrigger.batch(items, {
      start: 'top 92%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.95, ease: 'expo.out', stagger: 0.08, overwrite: true }),
    });
  }
}
