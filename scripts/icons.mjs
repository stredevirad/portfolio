// Generates the favicon set from one SVG mark. Run: node scripts/icons.mjs (outputs are committed).
import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0b0c0e"/>
  <g stroke="#eeeae2" stroke-opacity=".55" stroke-width="2.2" stroke-linecap="round">
    <line x1="14" y1="18" x2="30" y2="26"/><line x1="14" y1="46" x2="30" y2="38"/>
    <line x1="30" y1="26" x2="48" y2="32"/><line x1="30" y1="38" x2="48" y2="32"/>
  </g>
  <circle cx="14" cy="18" r="4" fill="#eeeae2"/><circle cx="14" cy="46" r="4" fill="#eeeae2"/>
  <circle cx="30" cy="26" r="3.6" fill="#eeeae2"/><circle cx="30" cy="38" r="3.6" fill="#eeeae2"/>
  <circle cx="48" cy="32" r="7.5" fill="#c5f23a"/>
</svg>
`;
await writeFile('public/favicon.svg', svg);
const buf = Buffer.from(svg);
await sharp(buf, { density: 600 }).resize(32, 32).png().toFile('public/favicon-32.png');
await sharp(buf, { density: 600 }).resize(180, 180).png().toFile('public/apple-touch-icon.png');
await sharp(buf, { density: 600 }).resize(192, 192).png().toFile('public/icon-192.png');
await sharp(buf, { density: 600 }).resize(512, 512).png().toFile('public/icon-512.png');
await writeFile(
  'public/site.webmanifest',
  JSON.stringify(
    {
      name: 'Joshua Herbert Japheth — Portfolio',
      short_name: 'JHJ',
      start_url: '/portfolio/',
      scope: '/portfolio/',
      display: 'standalone',
      background_color: '#0b0c0e',
      theme_color: '#0b0c0e',
      icons: [
        { src: '/portfolio/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/portfolio/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  ) + '\n',
);
console.log('icons written');
