// Lenis smooth scroll, driven by the GSAP ticker so ScrollTrigger stays in sync.
// Only on fine pointers with full motion and outside recruiter mode (see App).
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap';
import { getPrefs } from './prefs';

let lenis: Lenis | null = null;

function raf(time: number) {
  lenis?.raf(time * 1000);
}

export function startSmooth(): void {
  if (lenis) return;
  lenis = new Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 0.95 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
}

export function stopSmooth(): void {
  if (!lenis) return;
  gsap.ticker.remove(raf);
  lenis.destroy();
  lenis = null;
}

export function smoothActive(): boolean {
  return lenis !== null;
}

export function lockScroll(locked: boolean): void {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
  document.documentElement.classList.toggle('scroll-locked', locked);
}

/** Scrolls to an element id or y position, honouring the motion preference. */
export function scrollTo(target: string | number, opts: { immediate?: boolean } = {}): void {
  const reduced = getPrefs().motion === 'reduced';
  const el = typeof target === 'string' ? document.getElementById(target) : null;
  if (lenis) {
    lenis.scrollTo(el ?? (typeof target === 'number' ? target : 0), {
      immediate: opts.immediate || reduced,
      offset: 0,
      duration: 1.2,
    });
    return;
  }
  const behavior: ScrollBehavior = opts.immediate || reduced ? 'auto' : 'smooth';
  if (el) el.scrollIntoView({ behavior, block: 'start' });
  else window.scrollTo({ top: typeof target === 'number' ? target : 0, behavior });
}
