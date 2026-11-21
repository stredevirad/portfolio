// Base-path helpers. The site lives under import.meta.env.BASE_URL ('/portfolio/').
export const BASE: string = import.meta.env.BASE_URL || '/';

/** '/work/aegis/' -> '/portfolio/work/aegis/' */
export function withBase(path: string): string {
  if (/^[a-z]+:/i.test(path)) return path;
  const clean = path.replace(/^\/+/, '');
  return BASE + clean;
}

/** '/portfolio/work/aegis/' -> '/work/aegis' (no trailing slash, '' -> '/') */
export function stripBase(pathname: string): string {
  let p = pathname;
  const b = BASE.replace(/\/+$/, '');
  if (b && p.startsWith(b)) p = p.slice(b.length);
  if (!p.startsWith('/')) p = '/' + p;
  p = p.replace(/\/+$/, '');
  return p === '' ? '/' : p;
}

export const asset = (p: string) => withBase(p);
