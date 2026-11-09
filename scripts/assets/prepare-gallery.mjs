// Compress the original project-bound ImageGen paintings for local/LAN viewing.
// Usage: node scripts/prepare-gallery.mjs /absolute/path/to/gallery-manifest.json
import sharp from 'sharp';
import { readFile, mkdir, copyFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const manifest = JSON.parse(await readFile(process.argv[2], 'utf8'));
await mkdir('resources/artwork/gallery', { recursive: true });
await mkdir('public/assets/gallery', { recursive: true });
for (const work of manifest.works) {
  const source = resolve('resources/artwork/gallery', work.id + '.png');
  await copyFile(work.source, source);
  const metadata = await sharp(source).metadata();
  work.original = { path: source, width: metadata.width, height: metadata.height };
  work.variants = [];
  for (const width of [480, 960, 1536]) {
    const name = work.id + (width === 1536 ? '' : '-' + width) + '.webp';
    const info = await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 86, effort: 6 })
      .toFile(resolve('public/assets/gallery', name));
    work.variants.push({
      url: '/assets/gallery/' + name,
      width: info.width,
      height: info.height,
      bytes: info.size,
    });
  }
  console.log(work.id, work.variants);
}
await writeFile(
  'resources/artwork/gallery/manifest.json',
  JSON.stringify(manifest, null, 2) + '\n',
);
await writeFile(
  'public/data/gallery-art.json',
  JSON.stringify(
    {
      generator: manifest.generator,
      works: manifest.works.map(({ id, title, prompt, original, variants }) => ({
        id,
        title,
        prompt,
        width: original.width,
        height: original.height,
        variants,
      })),
    },
    null,
    2,
  ) + '\n',
);
