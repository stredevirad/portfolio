# ADR-002: GitHub Pages via Actions, project subpath, prerendered deep links

- Status: accepted · 2026-11-21

## Context
Free hosting, a new public repo `stredevirad/portfolio`, the owner's older user site at the root must not be touched.

## Options considered
1. Hash routing (`/#/work/aegis`): works anywhere, but ugly URLs, no per-route meta, weak SEO.
2. `404.html` SPA redirect trick: clean URLs, but every deep link is served with **HTTP 404** first;
   crawlers and link-preview bots see a 404 page.
3. **Prerender every known route to `dist/<route>/index.html`** (chosen): clean URLs, HTTP 200, per-route meta.
   A real `404.html` handles unknown paths.

## Decision
Option 3. Vite `base: '/portfolio/'`; the router's basename is `import.meta.env.BASE_URL`. All asset and font URLs
are base-relative. Deploy with `actions/upload-pages-artifact` + `actions/deploy-pages`; Pages `build_type=workflow`.

## Consequences
+ `https://stredevirad.github.io/portfolio/work/aegis/` loads directly with content.
− Adding a route means adding it to `src/content/routes.ts` (the prerender list reads from it).
− Backup host (Cloudflare Pages/Vercel) would need `base: '/'`; documented in README as an optional extra.
