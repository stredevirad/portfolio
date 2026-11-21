// GSAP entry point (client only).
// - GSAP core is eager: the preloader, hero intro, cursor and page curtain need it on first paint.
// - The scroll kit (ScrollTrigger, SplitText, Flip, Lenis) is a lazy chunk, loaded when the main thread is idle
//   after hydration or on the first scroll/pointer/key input, whichever comes first (see primeScrollKit).
import { gsap } from 'gsap';
import { whenIdle } from './device';

export type ScrollKit = typeof import('./gsap-scroll');

let kit: ScrollKit | null = null;
let pending: Promise<ScrollKit> | null = null;
let defaultsSet = false;

/** GSAP core with the site defaults applied. Safe to call any time on the client. */
export function coreGsap(): typeof gsap {
  if (!defaultsSet && typeof window !== 'undefined') {
    gsap.defaults({ ease: 'expo.out', duration: 0.7 });
    defaultsSet = true;
  }
  return gsap;
}

/** Starts (or joins) loading the scroll kit. */
export function loadScrollKit(): Promise<ScrollKit> {
  if (kit) return Promise.resolve(kit);
  coreGsap();
  pending ??= import('./gsap-scroll').then((m) => (kit = m));
  return pending;
}

/** The scroll kit if it has loaded, else null. */
export function scrollKit(): ScrollKit | null {
  return kit;
}

/**
 * Resolves when the scroll kit is wanted: on the first user input, or on idle after hydration — and, on a first
 * visit with the preloader, only after the preloader has finished (registering ScrollTrigger forces a full-page
 * layout, which must not land while the hero name is still settling; that is the LCP element).
 * Callers that only need it eventually (section setups, smooth scroll, velocity effects) wait on this,
 * so the chunk never competes with hydration or the intro.
 */
let primed: Promise<ScrollKit> | null = null;
export function primeScrollKit(): Promise<ScrollKit> {
  if (kit) return Promise.resolve(kit);
  if (primed) return primed;
  primed = new Promise<void>((resolve) => {
    const events = ['wheel', 'touchstart', 'pointerdown', 'keydown', 'scroll'] as const;
    let cancelIdle: () => void = () => {};
    const go = () => {
      cancelIdle();
      events.forEach((e) => window.removeEventListener(e, go, true));
      resolve();
    };
    events.forEach((e) => window.addEventListener(e, go, { capture: true, passive: true, once: true }));
    const idle = () => (cancelIdle = whenIdle(go, 1500));
    if (document.documentElement.hasAttribute('data-preload')) {
      const cap = window.setTimeout(idle, 6000); // never wait forever on the preloader
      window.addEventListener('jhj:preloaded', () => (window.clearTimeout(cap), idle()), { once: true });
    } else idle();
  }).then(loadScrollKit);
  return primed;
}

/** Core + scroll kit. Only valid once the kit has loaded (inside useGsap callbacks, or after loadScrollKit()). */
export function ensureGsap() {
  if (!kit) throw new Error('GSAP scroll kit not loaded yet — use useGsap(), or await loadScrollKit()');
  return { gsap: coreGsap(), ScrollTrigger: kit.ScrollTrigger, SplitText: kit.SplitText, Flip: kit.Flip };
}

export { gsap };
