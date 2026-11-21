// Visual pass: screenshots of every section / route at several widths and both themes.
// Usage: node scripts/shots.mjs [outDir] [widths=390,768,1440] [themes=dark,light]
// Full-page shots use reduced motion (identical content, no scroll-triggered reveals);
// one extra viewport shot per width captures the full-motion hero.
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { createServer, listen } from './serve.mjs';

const out = process.argv[2] ?? 'docs/screenshots';
const widths = (process.argv[3] ?? '390,768,1440').split(',').map(Number);
const themes = (process.argv[4] ?? 'dark,light').split(',');
const routes = (process.env.ROUTES ?? '/,/work/aegis/,/resume/').split(',');
await mkdir(out, { recursive: true });

const server = createServer();
const port = await listen(server, 0);
const origin = `http://127.0.0.1:${port}/portfolio`;
const browser = await chromium.launch();
const sections = ['top', 'about', 'work', 'projects', 'experience', 'achievements', 'skills', 'contact'];
try {
  for (const theme of themes) {
    for (const w of widths) {
      const h = w < 700 ? 844 : w < 1200 ? 1024 : 900;
      // Full-motion hero, first visit (preloader runs), then settled.
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: w < 1024, isMobile: w < 700 });
      await ctx.addInitScript((t) => localStorage.setItem('jhj:theme', t), theme);
      const page = await ctx.newPage();
      const errors = [];
      page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && errors.push(m.text()));
      page.on('pageerror', (e) => errors.push(String(e)));
      await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2600);
      await page.screenshot({ path: path.join(out, `hero-motion-${theme}-${w}.png`) });
      await ctx.close();

      const rctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: w < 1024, isMobile: w < 700, reducedMotion: 'reduce' });
      await rctx.addInitScript((t) => localStorage.setItem('jhj:theme', t), theme);
      const rp = await rctx.newPage();
      rp.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && errors.push(m.text()));
      rp.on('pageerror', (e) => errors.push(String(e)));
      for (const r of routes) {
        await rp.goto(`${origin}${r}`, { waitUntil: 'networkidle' });
        await rp.evaluate(() => document.fonts.ready);
        if (r === '/') {
          await rp.addStyleTag({ content: '.header,.skip-link,.grain{visibility:hidden!important}' });
          for (const id of sections) {
            const el = rp.locator(`#${id}`);
            if ((await el.count()) === 0) continue;
            await el.scrollIntoViewIfNeeded();
            await rp.waitForTimeout(120);
            await el.screenshot({ path: path.join(out, `home-${id}-${theme}-${w}.png`) });
          }
        } else {
          const name = r.replace(/\//g, '_').replace(/^_|_$/g, '') || 'home';
          await rp.screenshot({ path: path.join(out, `${name}-${theme}-${w}.png`), fullPage: true });
        }
      }
      await rctx.close();
      if (errors.length) console.log(`[${theme} ${w}] console:`, [...new Set(errors)].join('\n  '));
      console.log(`done ${theme} ${w}`);
    }
  }
} finally {
  await browser.close();
  server.close();
}
