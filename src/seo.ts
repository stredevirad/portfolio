// Per-route <head> tags. Used by the prerender (entry-server) and kept in sync on client-side navigation.
import { site } from './content/site';
import { projectBySlug } from './content/projects';
import { matchRoute } from './lib/router';
import type { Route } from './lib/router';

export interface Meta {
  title: string;
  description: string;
  /** Absolute canonical URL. */
  url: string;
  noindex?: boolean;
  type: 'website' | 'article' | 'profile';
}

export function metaFor(route: Route): Meta {
  switch (route.name) {
    case 'home':
      return { title: site.metaTitle, description: site.metaDescription, url: site.url, type: 'profile' };
    case 'work': {
      const p = projectBySlug(route.slug);
      return {
        title: `${p?.title ?? 'Case study'} — case study · ${site.name}`,
        description: p ? `${p.oneLiner} ${p.role}.` : site.metaDescription,
        url: `${site.url}work/${route.slug}/`,
        type: 'article',
      };
    }
    case 'resume':
      return {
        title: `Resume — ${site.name}`,
        description: `Plain, printable resume of ${site.name}: ${site.role} in ${site.locationShort}. Experience, projects, awards and skills.`,
        url: `${site.url}resume/`,
        type: 'profile',
      };
    default:
      return { title: `Not found — ${site.name}`, description: site.metaDescription, url: site.url, noindex: true, type: 'website' };
  }
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function personJsonLd(): string {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    url: site.url,
    email: `mailto:${site.email}`,
    jobTitle: site.role,
    description: site.metaDescription,
    address: { '@type': 'PostalAddress', addressLocality: 'Kochi', addressRegion: 'Kerala', addressCountry: 'IN' },
    alumniOf: { '@type': 'CollegeOrUniversity', name: site.school },
    knowsAbout: ['Python', 'LLM agents', 'Evaluation pipelines', 'FastAPI', 'PostgreSQL', 'Android', 'GIS'],
    sameAs: [site.github, site.linkedin],
  };
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function headHtml(path: string): string {
  const route = matchRoute(path);
  const m = metaFor(route);
  const og = `${site.url}og.png`;
  const tags = [
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.description)}" />`,
    m.noindex ? `<meta name="robots" content="noindex" />` : `<link rel="canonical" href="${m.url}" />`,
    `<meta name="author" content="${esc(site.name)}" />`,
    `<meta property="og:type" content="${m.type}" />`,
    `<meta property="og:site_name" content="${esc(site.name)}" />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta property="og:title" content="${esc(m.title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:url" content="${m.url}" />`,
    `<meta property="og:image" content="${og}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(`${site.name} — I build AI that knows when to say “I don’t know.”`)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(m.title)}" />`,
    `<meta name="twitter:description" content="${esc(m.description)}" />`,
    `<meta name="twitter:image" content="${og}" />`,
  ];
  if (route.name === 'home') tags.push(`<script type="application/ld+json">${personJsonLd()}</script>`);
  return tags.join('\n    ');
}

/** Client-side: keeps title/description/canonical in sync after navigation. */
export function applyMeta(path: string): void {
  const m = metaFor(matchRoute(path));
  document.title = m.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', m.description);
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', m.url);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', m.url);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', m.title);
}
