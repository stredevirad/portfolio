// SSR entry used only at build time by scripts/postbuild.mjs to prerender every route to static HTML.
import { renderToString } from 'react-dom/server';
import { App } from './App';
import { headHtml } from './seo';
import { staticRoutes } from './lib/router';
import { site } from './content/site';
import { projects, caseStudies } from './content/projects';

export function render(url: string): { html: string; head: string } {
  return { html: renderToString(<App initialPath={url} />), head: headHtml(url) };
}

export { staticRoutes, site, projects, caseStudies };
export { evidenceGraph } from './webgl/layout';
