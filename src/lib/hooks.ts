import { useEffect, useLayoutEffect, useRef } from 'react';
import type { DependencyList, RefObject } from 'react';
import { coreGsap, primeScrollKit, scrollKit } from './gsap';
import { whenIdle } from './device';

export const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * One gsap.context() per section, scoped to `scope`, reverted on unmount or when deps change.
 * The callback may return a cleanup for non-GSAP listeners, and may use ensureGsap() (the scroll kit is loaded).
 * - If the scroll kit is already loaded (e.g. client-side navigation), the section is set up synchronously, as before.
 * - Otherwise setup waits for the lazy kit (see primeScrollKit) and runs in its own task; the callback then gets
 *   `late = true`, meaning the page has already been painted — don't hide content that is already on screen.
 * - `defer: true` sets an off-screen section up when the main thread is idle (below-the-fold sections).
 * Everything lands inside the same context and is reverted with it.
 */
export function useGsap(
  scope: RefObject<HTMLElement | null>,
  fn: (late: boolean) => void | (() => void),
  deps: DependencyList = [],
  opts: { defer?: boolean } = {},
) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useIsoLayoutEffect(() => {
    let cleanup: void | (() => void);
    let cancelled = false;
    let cancel: (() => void) | undefined;
    const ctx = coreGsap().context(() => {}, scope.current ?? undefined);
    const run = (late: boolean) => {
      if (cancelled) return;
      ctx.add(() => {
        cleanup = fnRef.current(late);
      });
    };
    const setup = (late: boolean) => {
      if (cancelled) return;
      if (opts.defer && !inView(scope.current))
        cancel = whenIdle(() => {
          run(true);
          scheduleRefresh();
        }, 1200);
      else {
        run(late);
        if (late) scheduleRefresh();
      }
    };
    if (scrollKit()) setup(false);
    else
      void primeScrollKit().then(() => {
        // Own task per section, so the kit's evaluation and each setup stay short.
        const id = window.setTimeout(() => setup(true), 0);
        cancel = () => window.clearTimeout(id);
      });
    return () => {
      cancelled = true;
      cancel?.();
      if (typeof cleanup === 'function') cleanup();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

let refreshTimer: ReturnType<typeof setTimeout> | undefined;
/** One ScrollTrigger.refresh() after a burst of deferred section setups (pins shift later sections). */
function scheduleRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => scrollKit()?.ScrollTrigger.refresh(), 150);
}

function inView(el: HTMLElement | null): boolean {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight && r.bottom > 0;
}

/** Mounted flag: false during SSR and hydration, true after. */
export function useMounted() {
  const ref = useRef(false);
  useEffect(() => {
    ref.current = true;
  }, []);
  return ref;
}
