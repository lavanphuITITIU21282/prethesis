// Usage: node scripts/prepare-ink-worlds.mjs /absolute/path/to/manifest.json
// This only compresses generated artwork; it never generates or edits its content.
import sharp from 'sharp';
import { readFile, mkdir, copyFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const manifest = JSON.parse(await readFile(process.argv[2], 'utf8'));
await mkdir('resources/artwork/ink-worlds', { recursive: true });
await mkdir('public/assets/ink-worlds', { recursive: true });
for (const work of manifest.works) {
  const original = resolve('resources/artwork/ink-worlds', work.id + '.png');
  if (resolve(work.source) !== original) await copyFile(work.source, original);
  const metadata = await sharp(original).metadata();
  work.original = { path: original, width: metadata.width, height: metadata.height };
  work.variants = [];
  for (const width of [480, 960, 1536]) {
    const filename = work.id + (width === 1536 ? '' : '-' + width) + '.webp';
    const info = await sharp(original)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 86, effort: 6 })
      .toFile(resolve('public/assets/ink-worlds', filename));
    work.variants.push({
      url: '/assets/ink-worlds/' + filename,
      width: info.width,
      height: info.height,
      bytes: info.size,
    });
  }
  console.log(
    work.id,
    metadata.width,
    metadata.height,
    work.variants.map((v) => v.bytes),
  );
}
await writeFile(
  'resources/artwork/ink-worlds/manifest.json',
  JSON.stringify(manifest, null, 2) + '\n',
);
await writeFile(
  'public/data/ink-worlds.json',
  JSON.stringify(
    {
      generator: manifest.generator,
      reference: manifest.reference,
      works: manifest.works.map(({ id, prompt, original, variants }) => ({
        id,
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
