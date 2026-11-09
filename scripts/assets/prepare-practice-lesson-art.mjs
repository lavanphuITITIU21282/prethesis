// Copy one independently generated practice lesson painting and make LAN-friendly variants.
// Usage: node scripts/prepare-practice-lesson-art.mjs /absolute/path/to/input.json
import sharp from 'sharp';
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const work = JSON.parse(await readFile(process.argv[2], 'utf8'));
if (!/^[a-z0-9-]+$/.test(work.id)) throw new Error('Invalid lesson id');
await mkdir('resources/artwork/practice-lesson-art', { recursive: true });
await mkdir('public/assets/practice-lesson-art', { recursive: true });
const stem = work.assetStem || `${work.id}-practice-v1`;
if (!/^[a-z0-9-]+$/.test(stem)) throw new Error('Invalid asset stem');
const original = resolve('resources/artwork/practice-lesson-art', `${stem}.png`);
await copyFile(work.source, original);
const meta = await sharp(original).metadata();
work.width = meta.width;
work.height = meta.height;
work.variants = [];
for (const width of [480, 960, 1536]) {
  const name = `${stem}${width === 1536 ? '' : '-' + width}.webp`;
  const info = await sharp(original)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 86, effort: 6 })
    .toFile(resolve('public/assets/practice-lesson-art', name));
  work.variants.push({
    url: `/assets/practice-lesson-art/${name}`,
    width: info.width,
    height: info.height,
    bytes: info.size,
  });
}
work.original = original;
delete work.source;
await writeFile(
  resolve('resources/artwork/practice-lesson-art', `${stem}.json`),
  JSON.stringify(work, null, 2) + '\n',
);
console.log(
  JSON.stringify({
    id: work.id,
    width: work.width,
    height: work.height,
    variants: work.variants.length,
  }),
);
