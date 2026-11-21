import { useEffect, useLayoutEffect, useRef } from 'react';
import type { DependencyList, RefObject } from 'react';
import { ensureGsap, gsap } from './gsap';

export const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * One gsap.context() per section, scoped to `scope`, reverted on unmount or when deps change.
 * The callback may return a cleanup for non-GSAP listeners.
 */
export function useGsap(
  scope: RefObject<HTMLElement | null>,
  fn: () => void | (() => void),
  deps: DependencyList = [],
) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useIsoLayoutEffect(() => {
    ensureGsap();
    let cleanup: void | (() => void);
    const ctx = gsap.context(() => {
      cleanup = fnRef.current();
    }, scope.current ?? undefined);
    return () => {
      if (typeof cleanup === 'function') cleanup();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Mounted flag: false during SSR and hydration, true after. */
export function useMounted() {
  const ref = useRef(false);
  useEffect(() => {
    ref.current = true;
  }, []);
  return ref;
}
