// Lighthouse (mobile, default throttling) against the local production build or a live URL.
// Usage: node scripts/lighthouse.mjs [url] [label]
//   no url → serves dist/ locally (GitHub-Pages-like server) and audits /portfolio/
// Reports: docs/lighthouse/<label>-<page>.report.{html,json}; prints the four category scores.
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { chromium } from '@playwright/test';
import { createServer, listen } from './serve.mjs';

const label = process.argv[3] ?? (process.argv[2] ? 'production' : 'local');
let base = process.argv[2];
let server;
if (!base) {
  server = createServer();
  const port = await listen(server, 0);
  base = `http://127.0.0.1:${port}/portfolio/`;
}
const pages = (process.env.LH_PAGES ?? ',work/aegis/').split(',');
await mkdir('docs/lighthouse', { recursive: true });


const ROOT = process.cwd();
const OUT = path.join(ROOT, 'docs/lighthouse');
process.chdir(os.tmpdir());
const chrome = await chromeLauncher.launch({
  chromePath: process.env.CHROME_PATH ?? chromium.executablePath(),
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
  // Under WSL, chrome-launcher assumes a Windows Chrome and rewrites the profile path to a UNC path, which a Linux
  // Chromium then creates relative to the cwd — so the cwd is moved to a temp dir while Chrome runs (see below).
  userDataDir: await mkdtemp(path.join(os.tmpdir(), 'lh-')),
});
process.chdir(ROOT);
const summary = [];
try {
  for (const p of pages) {
    const url = base + p;
    const result = await lighthouse(url, {
      port: chrome.port,
      output: ['html', 'json'],
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor: 'mobile',
    });
    if (!result) throw new Error(`no result for ${url}`);
    const name = `${label}-${p.replace(/\//g, '_').replace(/_$/, '') || 'home'}`;
    const [html, json] = result.report;
    await writeFile(path.join(OUT, `${name}.report.html`), html);
    await writeFile(path.join(OUT, `${name}.report.json`), json);
    const c = result.lhr.categories;
    const a = result.lhr.audits;
    const row = {
      page: '/' + p,
      performance: Math.round(c.performance.score * 100),
      accessibility: Math.round(c.accessibility.score * 100),
      bestPractices: Math.round(c['best-practices'].score * 100),
      seo: Math.round(c.seo.score * 100),
      LCP: a['largest-contentful-paint'].displayValue,
      CLS: a['cumulative-layout-shift'].displayValue,
      TBT: a['total-blocking-time'].displayValue,
    };
    summary.push(row);
    console.log(JSON.stringify(row));
  }
  // Merge with earlier runs of the same label (pages can be audited one at a time on low-memory machines).
  const file = path.join(OUT, `${label}-summary.json`);
  let prev = [];
  try {
    prev = JSON.parse(await readFile(file, 'utf8')).results ?? [];
  } catch {
    /* first run */
  }
  const merged = [...prev.filter((r) => !summary.some((s) => s.page === r.page)), ...summary];
  await writeFile(file, JSON.stringify({ base, date: new Date().toISOString(), results: merged }, null, 2) + '\n');
} finally {
  await chrome.kill();
  server?.close();
}
