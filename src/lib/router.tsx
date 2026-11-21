// ~1 KB History-API router for three route shapes (see docs/adr/001-stack.md).
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { stripBase, withBase } from './base';
import { caseStudies } from '../content/projects';

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

export interface NavigateOptions {
  replace?: boolean;
  /** Element id to scroll to after navigation. */
  hash?: string;
  /** Called after the URL changed and before React renders the new route. */
  before?: () => void;
}

interface RouterValue {
  path: string;
  route: Route;
  navigate: (to: string, opts?: NavigateOptions) => void;
}

const RouterContext = createContext<RouterValue | null>(null);

type NavListener = (to: string, from: string) => void;
const navListeners = new Set<NavListener>();
export function onNavigate(fn: NavListener) {
  navListeners.add(fn);
  return () => navListeners.delete(fn);
}

export function RouterProvider({ initialPath, children }: { initialPath: string; children: ReactNode }) {
  const [path, setPath] = useState(initialPath);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to: string, opts: NavigateOptions = {}) => {
    const url = withBase(to);
    const from = window.location.pathname;
    try {
      window.history.replaceState({ ...(window.history.state ?? {}), scrollY: window.scrollY }, '');
    } catch {
      /* ignore */
    }
    if (opts.replace) window.history.replaceState({}, '', url);
    else window.history.pushState({}, '', url);
    opts.before?.();
    navListeners.forEach((l) => l(url, from));
    setPath(url.split('#')[0] ?? url);
  }, []);

  const value = useMemo(() => ({ path, route: matchRoute(path), navigate }), [path, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterValue {
  const v = useContext(RouterContext);
  if (!v) throw new Error('useRouter outside RouterProvider');
  return v;
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: string;
  onNavigate?: (e: MouseEvent<HTMLAnchorElement>) => boolean | void;
};

/** Internal link: real <a href> (crawlable, works without JS), intercepted for client-side navigation. */
export function Link({ to, onNavigate: hook, onClick, children, ...rest }: LinkProps) {
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
        if (hook && hook(e) === false) return;
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
