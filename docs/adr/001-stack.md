# ADR-001: Vite + React 19 + TypeScript (strict), static, prerendered

- Status: accepted · 2026-11-21

## Context
A portfolio with heavy motion, a WebGL hero and five case-study routes, hosted for free on a static host.
It must be fast (LCP < 2.5 s on a mid-range phone), crawlable, and editable through content files.

## Decision
Vite 8 + React 19 + TypeScript (strict, `noUncheckedIndexedAccess`). No backend. Every route is prerendered to
HTML at build time with `react-dom/server` `renderToString` from an SSR build, then hydrated with `hydrateRoot`.
Routing is a ~1 KB History-API router instead of React Router (only three route shapes; saves ~20 KB gzip).

## Consequences
+ Real HTML for every route: fast LCP, link previews, SEO 100, no 404-status deep links (council Phase 0).
+ Content lives in typed `src/content/*.ts`; components never hard-code facts.
− Components must be SSR-safe: no `window`/`document` during render; browser-only work goes in effects.
− User prefs (theme, motion, recruiter) are read by an inline `<head>` script before paint and by
  `useSyncExternalStore` with a server snapshot after hydration, so hydration never mismatches.
