// Performance budget: initial JS (everything index.html loads eagerly, excluding lazy chunks) ≤ 200 KB gzip.
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';

const BUDGET = 200 * 1024;
const html = await readFile('dist/index.html', 'utf8');
const eager = new Set();
for (const m of html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)) eager.add(m[1]);
for (const m of html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+\.js)"/g)) eager.add(m[1]);
let total = 0;
const rows = [];
for (const src of eager) {
  const file = path.join('dist', src.replace(/^\/portfolio\//, ''));
  const gz = zlib.gzipSync(await readFile(file)).length;
  total += gz;
  rows.push([src, gz]);
}
const all = (await readdir('dist/assets')).filter((f) => f.endsWith('.js'));
const lazy = [];
for (const f of all) {
  if ([...eager].some((e) => e.endsWith(f))) continue;
  lazy.push([f, zlib.gzipSync(await readFile(path.join('dist/assets', f))).length]);
}
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
console.log('Initial JS (gzip):');
rows.forEach(([f, n]) => console.log(`  ${kb(n).padStart(9)}  ${f}`));
console.log(`  ${kb(total).padStart(9)}  TOTAL (budget ${kb(BUDGET)})`);
console.log('Lazy chunks (gzip):');
lazy.sort((a, b) => b[1] - a[1]).forEach(([f, n]) => console.log(`  ${kb(n).padStart(9)}  ${f}`));
if (total > BUDGET) {
  console.error(`✖ Initial JS ${kb(total)} exceeds the ${kb(BUDGET)} budget`);
  process.exit(1);
}
console.log('✔ within budget');
