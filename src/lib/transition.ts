// Route transitions: a curtain wipe between pages, and a GSAP Flip hand-off from a work card to its case study.
import { ensureGsap } from './gsap';
import { motionAllowed } from './prefs';
import { sfx } from './audio';

type FlipState = ReturnType<typeof import('gsap/Flip').Flip.getState>;

let pendingFlip: { id: string; state: FlipState } | null = null;

/** Records the card media's position just before navigating, so the case study can animate from it. */
export function captureFlip(el: Element | null): void {
  if (!el || !motionAllowed()) return;
  const id = el.getAttribute('data-flip-id');
  if (!id) return;
  const { Flip } = ensureGsap();
  pendingFlip = { id, state: Flip.getState(el) };
}

export function takeFlip(id: string): FlipState | null {
  if (!pendingFlip || pendingFlip.id !== id) {
    pendingFlip = null;
    return null;
  }
  const s = pendingFlip.state;
  pendingFlip = null;
  return s;
}

export function hasPendingFlip(): boolean {
  return pendingFlip !== null;
}

let busy = false;

/** Covers the page with the curtain, runs `go` (the route change), then reveals the new page. */
export function pageTransition(go: () => void, label = ''): void {
  const el = typeof document !== 'undefined' ? document.querySelector<HTMLElement>('.curtain') : null;
  if (!el || !motionAllowed() || busy) {
    go();
    return;
  }
  busy = true;
  const { gsap } = ensureGsap();
  const text = el.querySelector<HTMLElement>('.curtain__label');
  if (text) text.textContent = label;
  sfx('open');
  gsap
    .timeline({ onComplete: () => void (busy = false) })
    .set(el, { clipPath: 'inset(100% 0% 0% 0%)' })
    .to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'power3.inOut' })
    .add(go)
    .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.65, ease: 'power3.inOut', delay: 0.12 })
    .set(el, { clipPath: 'inset(100% 0% 0% 0%)' });
}
