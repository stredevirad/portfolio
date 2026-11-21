import { useEffect, useLayoutEffect, useRef } from 'react';
import type { DependencyList, RefObject } from 'react';
import { ensureGsap, gsap } from './gsap';
import { whenIdle } from './device';

export const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * One gsap.context() per section, scoped to `scope`, reverted on unmount or when deps change.
 * The callback may return a cleanup for non-GSAP listeners.
 * `defer: true` sets the section up when the main thread is idle (below-the-fold sections), which keeps
 * hydration short (Total Blocking Time); everything still lands inside the same context and is reverted with it.
 */
export function useGsap(
  scope: RefObject<HTMLElement | null>,
  fn: () => void | (() => void),
  deps: DependencyList = [],
  opts: { defer?: boolean } = {},
) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useIsoLayoutEffect(() => {
    ensureGsap();
    let cleanup: void | (() => void);
    const ctx = gsap.context(() => {}, scope.current ?? undefined);
    const run = () => {
      ctx.add(() => {
        cleanup = fnRef.current();
      });
    };
    let cancel: (() => void) | undefined;
    if (opts.defer && !inView(scope.current))
      cancel = whenIdle(() => {
        run();
        scheduleRefresh();
      }, 1200);
    else run();
    return () => {
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
  refreshTimer = setTimeout(() => ensureGsap().ScrollTrigger.refresh(), 150);
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
