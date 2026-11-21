// Tiny static server that behaves like GitHub Pages for a project site:
// serves dist/ under /portfolio/, directory index.html, 301 to add a trailing slash, 404.html with HTTP 404,
// and gzip for text. Used by the prerender (PDF/OG), Playwright tests and local Lighthouse runs.
// CLI: node scripts/serve.mjs [port]
import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
};
const COMPRESS = /\.(html|js|css|json|svg|txt|xml|webmanifest)$/;

export function createServer({ root = 'dist', base = '/portfolio/' } = {}) {
  const abs = path.resolve(root);
  const send = (req, res, file, status = 200) => {
    const ext = path.extname(file);
    const headers = {
      'Content-Type': TYPES[ext] ?? 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'max-age=600',
    };
    const gzip = COMPRESS.test(file) && /\bgzip\b/.test(req.headers['accept-encoding'] ?? '');
    if (gzip) headers['Content-Encoding'] = 'gzip';
    res.writeHead(status, headers);
    if (req.method === 'HEAD') return res.end();
    const stream = createReadStream(file);
    if (gzip) stream.pipe(zlib.createGzip()).pipe(res);
    else stream.pipe(res);
  };
  const notFound = (req, res) => {
    const f = path.join(abs, '404.html');
    if (existsSync(f)) send(req, res, f, 404);
    else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  };
  return http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    let p = decodeURIComponent(url.pathname);
    if (p === base.replace(/\/$/, '')) {
      res.writeHead(301, { Location: base + url.search });
      return res.end();
    }
    if (!p.startsWith(base)) return notFound(req, res);
    const rel = p.slice(base.length);
    const file = path.join(abs, rel);
    if (!file.startsWith(abs)) return notFound(req, res);
    if (existsSync(file)) {
      const st = statSync(file);
      if (st.isFile()) return send(req, res, file);
      if (st.isDirectory()) {
        if (!p.endsWith('/')) {
          res.writeHead(301, { Location: p + '/' + url.search });
          return res.end();
        }
        const index = path.join(file, 'index.html');
        if (existsSync(index)) return send(req, res, index);
      }
    }
    if (existsSync(file + '.html')) return send(req, res, file + '.html');
    return notFound(req, res);
  });
}

export function listen(server, port = 0) {
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server.address().port)));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const port = Number(process.argv[2] ?? process.env.PORT ?? 4173);
  const server = createServer();
  listen(server, port).then((p) => console.log(`Serving dist/ at http://127.0.0.1:${p}/portfolio/`));
}
