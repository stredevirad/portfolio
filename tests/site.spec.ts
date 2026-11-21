import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const slugs = ['aegis', 'kerala-flood-bench', 'cold-chain-handshake', 'deep-learning-tutor', 'grammar-tax'];
const routes = ['', 'resume/', ...slugs.map((s) => `work/${s}/`)];

/** Collects console errors/warnings and page errors (WebGL driver chatter from headless GPUs is ignored). */
function watchConsole(page: Page) {
  const problems: string[] = [];
  page.on('console', (m) => {
    if ((m.type() === 'error' || m.type() === 'warning') && !/GL Driver|GPU stall|WebGL/.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(String(e)));
  return problems;
}

test.describe('routes', () => {
  for (const r of routes) {
    test(`@smoke /${r} loads directly with content and no console errors`, async ({ page }) => {
      const problems = watchConsole(page);
      const res = await page.goto(r);
      expect(res?.status()).toBe(200);
      await expect(page.locator('h1').first()).toBeVisible();
      await expect(page).toHaveTitle(/Joshua Herbert Japheth/);
      await page.waitForLoadState('networkidle');
      expect(problems).toEqual([]);
    });
  }

  test('@smoke deep link HTML is prerendered (works without JavaScript)', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('work/aegis/');
    await expect(page.locator('h1')).toHaveText(/Aegis/i);
    await expect(page.getByText('0 confidently wrong').first()).toBeVisible();
    await ctx.close();
  });

  test('unknown paths return 404 with the not-found page', async ({ page }) => {
    const res = await page.goto('does-not-exist/');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Nothing here.' })).toBeVisible();
  });

  test('client-side navigation to a case study and back', async ({ page }) => {
    await page.goto('');
    await page.locator('#work .pcard__title a').first().click();
    await expect(page).toHaveURL(/\/work\/aegis\/$/);
    await expect(page.locator('h1')).toHaveText(/Aegis/i);
    await page.goBack();
    await expect(page).toHaveURL(/\/portfolio\/$/);
  });
});

test.describe('toggles persist across reload', () => {
  test('@smoke theme', async ({ page }) => {
    await page.goto('');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
    const bar = page.locator('.toggles').getByRole('button', { name: /switch to light theme/i });
    if (await bar.isVisible()) await bar.click();
    else {
      await page.getByRole('button', { name: /^menu$/i }).click();
      await page.locator('.mobile-menu').getByRole('button', { name: /switch to light theme/i }).click();
    }
    await expect(html).toHaveAttribute('data-theme', 'light');
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('motion, sound and recruiter mode', async ({ page }) => {
    await page.goto('');
    await page.getByRole('button', { name: 'Reduce motion' }).first().click();
    await page.getByRole('button', { name: 'Sound' }).first().click();
    await page.getByRole('button', { name: 'Recruiter mode' }).first().click();
    await page.reload();
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-motion', 'reduced');
    await expect(html).toHaveAttribute('data-recruiter', '1');
    await expect(page.getByRole('button', { name: 'Sound' }).first()).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('modes', () => {
  test('@smoke recruiter mode renders the plain resume without WebGL or custom cursor', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('jhj:recruiter', '1'));
    await page.goto('');
    await expect(page.getByRole('heading', { level: 1, name: 'Joshua Herbert Japheth' })).toBeVisible();
    await expect(page.getByText('Recruiter mode: the plain, printable version of this site.')).toBeVisible();
    await expect(page.getByRole('link', { name: /download resume \(pdf\)/i }).first()).toBeVisible();
    await page.waitForTimeout(1500);
    expect(await page.locator('canvas').count()).toBe(0);
    expect(await page.locator('.cursor').count()).toBe(0);
  });

  test('reduced motion disables heavy animation', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto('');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-motion', 'reduced');
    await expect(html).not.toHaveAttribute('data-preload', '1');
    await expect(page.locator('.hero__art')).toHaveAttribute('data-webgl', '0');
    await page.waitForTimeout(3000);
    await expect(page.locator('.hero__art')).toHaveAttribute('data-webgl', '0');
    expect(await page.locator('.cursor').count()).toBe(0);
    expect(await page.evaluate(() => document.documentElement.classList.contains('lenis'))).toBe(false);
    // The work reel is not pinned; every card is reachable by normal scrolling.
    await expect(page.locator('#work')).not.toHaveAttribute('data-pinned', '1');
    await ctx.close();
  });

  test('work reel pins and scrolls horizontally on desktop with full motion', async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem('jhj:visited', '1'));
    await page.goto('');
    await expect(page.locator('#work')).toHaveAttribute('data-pinned', '1', { timeout: 6000 });
    const before = await page.locator('.reel__track').evaluate((el) => getComputedStyle(el).transform);
    await page.locator('#work').evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 900));
    await page.waitForTimeout(1500);
    const after = await page.locator('.reel__track').evaluate((el) => getComputedStyle(el).transform);
    expect(after).not.toBe(before);
  });

  test('preloader runs on the first visit only', async ({ page }) => {
    await page.goto('');
    await expect(page.locator('html')).toHaveAttribute('data-preload', '1');
    await expect(page.locator('html')).not.toHaveAttribute('data-preload', '1', { timeout: 5000 });
    await page.reload();
    await expect(page.locator('html')).not.toHaveAttribute('data-preload', '1');
  });
});

test.describe('resume PDF', () => {
  test('@smoke the PDF downloads and contains real text', async ({ page, request }) => {
    await page.goto('resume/');
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('link', { name: /download resume \(pdf\)/i }).first().click()]);
    expect(download.suggestedFilename()).toBe('Joshua-Herbert-Japheth-Resume.pdf');
    const res = await request.get('resume/Joshua-Herbert-Japheth-Resume.pdf');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/pdf');
    const body = (await res.body()).toString('latin1');
    expect(body.startsWith('%PDF')).toBe(true);
    // Text is real (fonts with ToUnicode maps → selectable/extractable), not a rasterised image.
    expect(body).toMatch(/\/ToUnicode/);
    expect(body).toMatch(/\/Type\s*\/Font/);
  });
});

test.describe('overlays', () => {
  test('command palette (Ctrl+K) jumps to a case study', async ({ page }) => {
    await page.goto('');
    await page.waitForLoadState('networkidle');
    await page.keyboard.press('Control+k');
    const input = page.getByRole('combobox');
    await expect(input).toBeFocused();
    await input.fill('grammar');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/work\/grammar-tax\/$/);
  });

  test('terminal (backtick) answers whoami', async ({ page }) => {
    await page.goto('');
    await page.waitForLoadState('networkidle');
    await page.keyboard.press('`');
    const input = page.getByRole('textbox', { name: 'Terminal command' });
    await expect(input).toBeFocused();
    await input.fill('whoami');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('log')).toContainText('Joshua Herbert Japheth');
    await page.keyboard.press('Escape');
    await expect(input).toHaveCount(0);
  });

  test('copy email shows a toast', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('');
    await page.locator('#contact .contact__cta').click();
    await expect(page.locator('.toast')).toHaveText('Email copied');
  });
});

test.describe('content rules', () => {
  test('the hidden nickname never appears in visible pages, meta, sitemap or robots', async ({ request }) => {
    const word = String.fromCharCode(107, 105, 114, 105, 116, 111);
    for (const r of [...routes, 'sitemap.xml', 'robots.txt', 'llms.txt', '404.html']) {
      const res = await request.get(r);
      expect((await res.text()).toLowerCase()).not.toContain(word);
    }
  });

  test('excluded items never appear', async ({ request }) => {
    for (const r of routes) {
      const html = (await (await request.get(r)).text()).toLowerCase();
      for (const banned of ['atomquest', 'exathon', 'voltproof', 'gignite', 'teliport', String.fromCharCode(102, 111, 114, 103, 101, 45, 109, 105, 110, 105), 'modern c++', 'testimonial']) {
        expect(html, `${banned} on /${r}`).not.toContain(banned);
      }
    }
  });
});

test.describe('accessibility (axe)', () => {
  for (const theme of ['dark', 'light']) {
    for (const r of ['', 'work/aegis/', 'resume/']) {
      test(`no serious violations on /${r} (${theme})`, async ({ browser }) => {
        const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
        await ctx.addInitScript((t) => localStorage.setItem('jhj:theme', t), theme);
        const page = await ctx.newPage();
        await page.goto(r);
        await page.waitForLoadState('networkidle');
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
        expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 5).join(' | ')}`)).toEqual([]);
        await ctx.close();
      });
    }
  }

  test('keyboard: skip link and visible focus', async ({ page }) => {
    await page.goto('');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    const outline = await page.evaluate(() => getComputedStyle(document.activeElement as Element).outlineStyle);
    expect(outline).not.toBe('none');
  });
});
