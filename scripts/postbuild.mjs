// Post-build: prerender every route to static HTML, then generate sitemap.xml, robots.txt, llms.txt,
// the Open Graph image (1200×630) and the resume PDF from the same content data. See docs/adr/002 and 007.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import { createServer, listen } from './serve.mjs';

const DIST = 'dist';
const SSR = 'dist-ssr';
const BASE = '/portfolio/';

const template = await readFile(path.join(DIST, 'index.html'), 'utf8');
if (!template.includes('<!--app-html-->') || !template.includes('<!--app-head-->')) {
  throw new Error('dist/index.html is missing the <!--app-head--> / <!--app-html--> placeholders');
}
const ssr = await import(pathToFileURL(path.resolve(SSR, 'entry-server.js')).href);
const { render, staticRoutes, site, evidenceGraph } = ssr;

const page = (url) => {
  const { html, head } = render(BASE.replace(/\/$/, '') + url);
  return template.replace('<!--app-head-->', head).replace('<!--app-html-->', html);
};

// 1. Prerender
const routes = staticRoutes();
for (const r of routes) {
  const out = path.join(DIST, r, 'index.html');
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, page(r));
  console.log(`prerendered ${r}`);
}
await writeFile(path.join(DIST, '404.html'), page('/404/'));
console.log('prerendered 404.html');

// 2. sitemap, robots, llms.txt
const today = new Date().toISOString().slice(0, 10);
const urls = routes.map((r) => `  <url><loc>${site.url}${r.replace(/^\//, '')}</loc><lastmod>${today}</lastmod></url>`).join('\n');
await writeFile(
  path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);
await writeFile(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}sitemap.xml\n`);
await writeFile(
  path.join(DIST, 'llms.txt'),
  `# ${site.name}\n\n> ${site.role} in ${site.location}. ${site.intro}\n\n- Resume: ${site.url}resume/\n- Resume (PDF): ${site.url}${site.resumePdf}\n${routes
    .filter((r) => r.startsWith('/work/'))
    .map((r) => `- Case study: ${site.url}${r.slice(1)}`)
    .join('\n')}\n- GitHub: ${site.github}\n- LinkedIn: ${site.linkedin}\n`,
);
await rm(SSR, { recursive: true, force: true });

// 3. OG image + resume PDF (headless Chromium)
const server = createServer({ root: DIST, base: BASE });
const port = await listen(server, 0);
const origin = `http://127.0.0.1:${port}`;
const browser = await chromium.launch();
try {
  // Resume PDF: real, selectable text; print CSS gives a single-column A4 layout.
  const ctx = await browser.newContext();
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem('jhj:motion', 'reduced');
      localStorage.setItem('jhj:theme', 'light');
    } catch {
      /* ignore */
    }
  });
  const p = await ctx.newPage();
  await p.goto(`${origin}${BASE}resume/`, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.emulateMedia({ media: 'print' });
  const pdfPath = path.join(DIST, site.resumePdf);
  await mkdir(path.dirname(pdfPath), { recursive: true });
  await p.pdf({ path: pdfPath, format: 'A4', printBackground: true, preferCSSPageSize: true, tagged: true, outline: true });
  console.log(`wrote ${pdfPath}`);

  // OG image
  const g = evidenceGraph(7);
  const X = (x) => Math.round(640 + x * 500);
  const Y = (y) => Math.round(70 + y * 470);
  const edges = g.edges.map(([a, b]) => `<line x1="${X(g.nodes[a].x)}" y1="${Y(g.nodes[a].y)}" x2="${X(g.nodes[b].x)}" y2="${Y(g.nodes[b].y)}" />`).join('');
  const nodes = g.nodes
    .map((n) => (n.hot ? `<circle cx="${X(n.x)}" cy="${Y(n.y)}" r="38" fill="none" stroke="#c5f23a" stroke-opacity=".5"/><circle cx="${X(n.x)}" cy="${Y(n.y)}" r="13" fill="#c5f23a"/>` : `<circle cx="${X(n.x)}" cy="${Y(n.y)}" r="${Math.round(n.r * 5)}" fill="#eeeae2"/>`))
    .join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    @font-face{font-family:B;src:url(${origin}${BASE}fonts/bricolage-grotesque-wght.woff2) format('woff2');font-weight:200 800}
    @font-face{font-family:M;src:url(${origin}${BASE}fonts/jetbrains-mono-wght.woff2) format('woff2');font-weight:100 800}
    @font-face{font-family:I;src:url(${origin}${BASE}fonts/instrument-sans-wght.woff2) format('woff2');font-weight:400 700}
    *{margin:0;box-sizing:border-box}
    body{width:1200px;height:630px;background:#0b0c0e;color:#eeeae2;font-family:I;position:relative;overflow:hidden}
    svg{position:absolute;inset:0}
    .t{position:absolute;left:64px;top:60px;right:64px;bottom:56px;display:flex;flex-direction:column;justify-content:space-between}
    .k{font-family:M;font-size:20px;letter-spacing:.08em;text-transform:uppercase;color:#aaa69e}
    h1{font-family:B;font-weight:780;font-size:104px;line-height:.86;letter-spacing:-.045em;text-transform:uppercase}
    h1 span{display:block}
    h1 span:nth-child(2){color:transparent;-webkit-text-stroke:2px #eeeae2}
    p{font-family:B;font-weight:600;font-size:40px;line-height:1.05;letter-spacing:-.02em;max-width:620px}
    em{font-style:normal;color:#c5f23a}
    .f{display:flex;justify-content:space-between;font-family:M;font-size:19px;color:#85827b}
  </style></head><body>
    <svg width="1200" height="630" viewBox="0 0 1200 630"><g stroke="#aaa69e" stroke-opacity=".35" stroke-width="1.5">${edges}</g>${nodes}</svg>
    <div class="t"><div class="k">AI &amp; Python engineer · Kochi, India</div>
    <h1><span>Joshua</span><span>Herbert</span><span>Japheth</span></h1>
    <p>I build AI that knows when to say <em>“I don’t know.”</em></p>
    <div class="f"><span>stredevirad.github.io/portfolio</span><span>Evidence over guesses</span></div></div>
  </body></html>`;
  const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await og.setContent(html, { waitUntil: 'networkidle' });
  await og.evaluate(() => document.fonts.ready);
  await og.screenshot({ path: path.join(DIST, 'og.png') });
  console.log('wrote dist/og.png');
} finally {
  await browser.close();
  server.close();
}
