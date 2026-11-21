// Copies the latin-subset variable WOFF2 files + OFL licenses from @fontsource-variable into public/fonts/.
// Run: npm run fonts (outputs are committed).
import { copyFile, mkdir } from 'node:fs/promises';

const map = [
  ['bricolage-grotesque', 'bricolage-grotesque-latin-wght-normal.woff2', 'bricolage-grotesque-wght.woff2'],
  ['instrument-sans', 'instrument-sans-latin-wght-normal.woff2', 'instrument-sans-wght.woff2'],
  ['instrument-sans', 'instrument-sans-latin-wght-italic.woff2', 'instrument-sans-wght-italic.woff2'],
  ['jetbrains-mono', 'jetbrains-mono-latin-wght-normal.woff2', 'jetbrains-mono-wght.woff2'],
];
await mkdir('public/fonts', { recursive: true });
for (const [pkg, from, to] of map) {
  await copyFile(`node_modules/@fontsource-variable/${pkg}/files/${from}`, `public/fonts/${to}`);
}
for (const pkg of ['bricolage-grotesque', 'instrument-sans', 'jetbrains-mono']) {
  await copyFile(`node_modules/@fontsource-variable/${pkg}/LICENSE`, `public/fonts/LICENSE-${pkg}.txt`).catch(() => {});
}
console.log('fonts copied');
