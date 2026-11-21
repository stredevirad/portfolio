// ~1 KB History-API router for three route shapes (see docs/adr/001-stack.md).
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { stripBase, withBase } from './base';
import { caseStudies } from '../content/projects';
import { pageTransition } from './transition';

export type Route =
  | { name: 'home' }
  | { name: 'work'; slug: string }
  | { name: 'resume' }
  | { name: 'notfound' };

export function matchRoute(path: string): Route {
  const p = stripBase(path.split(/[?#]/)[0] ?? '/');
  if (p === '/' || p === '/index.html') return { name: 'home' };
  if (p === '/resume') return { name: 'resume' };
  const m = /^\/work\/([a-z0-9-]+)$/.exec(p);
  if (m && m[1] && caseStudies.some((c) => c.slug === m[1])) return { name: 'work', slug: m[1] };
  return { name: 'notfound' };
}

/** Routes that are prerendered to static HTML at build time. */
export function staticRoutes(): string[] {
  return ['/', '/resume/', ...caseStudies.map((c) => `/work/${c.slug}/`)];
}

export type NavKind = 'initial' | 'push' | 'pop';

export interface NavigateOptions {
  replace?: boolean;
  /** Skip the curtain (e.g. when a Flip transition runs instead). */
  instant?: boolean;
}

interface RouterValue {
  path: string;
  route: Route;
  kind: NavKind;
  /** Bumps on every navigation, including to the same path (e.g. a different #hash). */
  seq: number;
  navigate: (to: string, opts?: NavigateOptions) => void;
}

const RouterContext = createContext<RouterValue | null>(null);

export function RouterProvider({ initialPath, children }: { initialPath: string; children: ReactNode }) {
  const [state, setState] = useState<{ path: string; kind: NavKind; seq: number }>({ path: initialPath, kind: 'initial', seq: 0 });

  useEffect(() => {
    try {
      window.history.scrollRestoration = 'manual';
    } catch {
      /* ignore */
    }
    const onPop = () => setState((s) => ({ path: window.location.pathname, kind: 'pop', seq: s.seq + 1 }));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to: string, opts: NavigateOptions = {}) => {
    const url = withBase(to);
    const go = () => {
      try {
        window.history.replaceState({ ...(window.history.state ?? {}), scrollY: window.scrollY }, '');
      } catch {
        /* ignore */
      }
      if (opts.replace) window.history.replaceState({}, '', url);
      else window.history.pushState({}, '', url);
      setState((s) => ({ path: url.split('#')[0] ?? url, kind: 'push', seq: s.seq + 1 }));
    };
    if (opts.instant) go();
    else pageTransition(go);
  }, []);

  const value = useMemo(() => ({ ...state, route: matchRoute(state.path), navigate }), [state, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterValue {
  const v = useContext(RouterContext);
  if (!v) throw new Error('useRouter outside RouterProvider');
  return v;
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: string;
  instant?: boolean;
  /** Runs before navigating; return false to cancel the client-side navigation. */
  beforeNavigate?: (e: MouseEvent<HTMLAnchorElement>) => boolean | void;
};

/** Internal link: real <a href> (crawlable, works without JS), intercepted for client-side navigation. */
export function Link({ to, instant, beforeNavigate, onClick, children, ...rest }: LinkProps) {
  const { navigate } = useRouter();
  const href = withBase(to);
  return (
    <a
      {...rest}
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (rest.target && rest.target !== '_self') return;
        e.preventDefault();
        if (beforeNavigate && beforeNavigate(e) === false) return;
        navigate(to, instant ? { instant } : {});
      }}
    >
      {children}
    </a>
  );
}
