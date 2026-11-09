// node scripts/prepare-backgrounds.mjs /absolute/path/to/input-manifest.json
// Copy original generated images into the project and make responsive WebP files.
import sharp from 'sharp';
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const data = JSON.parse(await readFile(process.argv[2], 'utf8'));
await mkdir('resources/artwork/backgrounds', { recursive: true });
await mkdir('public/assets/backgrounds', { recursive: true });
for (const work of data.works) {
  const original = resolve('resources/artwork/backgrounds', `${work.id}.png`);
  if (resolve(work.source) !== original) await copyFile(work.source, original);
  const meta = await sharp(original).metadata();
  work.width = meta.width;
  work.height = meta.height;
  work.variants = [];
  for (const width of [960, 1536]) {
    const name = `${work.id}${width === 960 ? '-960' : ''}.webp`;
    const result = await sharp(original)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 86, effort: 6 })
      .toFile(resolve('public/assets/backgrounds', name));
    work.variants.push({
      url: `/assets/backgrounds/${name}`,
      width: result.width,
      height: result.height,
      bytes: result.size,
    });
  }
  delete work.source;
  console.log(work.id, work.width, work.height, work.variants);
}
await writeFile('public/data/section-background-art.json', JSON.stringify(data, null, 2) + '\n');
