// Shared scroll reveals, used inside each section's gsap.context (so everything is reverted on unmount).
import { ensureGsap } from './gsap';
import { motionAllowed } from './prefs';

/** Split-line reveals for [data-split] headings and fade-up reveals for [data-reveal] blocks inside `scope`. */
export function revealIn(scope: HTMLElement | null): void {
  if (!scope || !motionAllowed()) return;
  const { gsap, ScrollTrigger, SplitText } = ensureGsap();

  scope.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
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

  const items = gsap.utils.toArray<HTMLElement>(scope.querySelectorAll('[data-reveal]'));
  if (items.length) {
    gsap.set(items, { autoAlpha: 0, y: 40 });
    ScrollTrigger.batch(items, {
      start: 'top 92%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.95, ease: 'expo.out', stagger: 0.08, overwrite: true }),
    });
  }
}
