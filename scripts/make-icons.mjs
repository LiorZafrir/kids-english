// Renders public/favicon.svg into the PNG icons the PWA manifest needs. Run: npm run icons
import { mkdirSync, readFileSync } from 'node:fs';
import sharp from 'sharp';

const svg = readFileSync('public/favicon.svg');
mkdirSync('public/icons', { recursive: true });

async function icon(file, size, padding = 0) {
  const inner = Math.round(size * (1 - padding * 2));
  const art = await sharp(svg, { density: 384 }).resize(inner, inner).png().toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: padding ? '#4338ca' : '#00000000',
    },
  })
    .composite([{ input: art, gravity: 'centre' }])
    .png()
    .toFile(`public/icons/${file}`);
}

await icon('icon-192.png', 192);
await icon('icon-512.png', 512);
// Maskable icons are cropped to a circle or squircle, so keep the art inside the safe zone.
await icon('maskable-512.png', 512, 0.12);
await icon('apple-touch-icon.png', 180, 0.06);
console.log('icons written to public/icons');
