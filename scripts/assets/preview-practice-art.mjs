// QA-only contact sheet: does not edit the generated artwork or runtime files.
import sharp from 'sharp';
import { readFile, access, mkdir } from 'node:fs/promises';
const themes = JSON.parse(await readFile('scripts/assets/practice-art-catalog.json', 'utf8'));
const selected = [];
for (const work of themes) {
  try {
    await access(`public/assets/practice-lesson-art/${work.assetStem}.webp`);
    selected.push(work);
  } catch {}
}
if (!selected.length) throw Error('No completed paintings');
const columns = 5,
  tileW = 384,
  tileH = 240,
  gap = 12;
const layers = [];
const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
for (const [i, work] of selected.entries()) {
  const left = (i % columns) * (tileW + gap),
    top = Math.floor(i / columns) * (tileH + gap);
  layers.push({
    input: await sharp(`public/assets/practice-lesson-art/${work.assetStem}.webp`)
      .resize(tileW, 192, { fit: 'contain' })
      .toBuffer(),
    left,
    top,
  });
  const label = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="384" height="48"><rect width="384" height="48" fill="#fbf7ef"/><text x="12" y="29" font-family="Segoe UI,Arial,sans-serif" font-size="17" fill="#243b32">${escape(work.id + ' · ' + work.name)}</text></svg>`,
  );
  layers.push({ input: label, left, top: top + 192 });
}
await mkdir('tmp/qa', { recursive: true });
await sharp({
  create: {
    width: columns * (tileW + gap) - gap,
    height: Math.ceil(selected.length / columns) * (tileH + gap) - gap,
    channels: 3,
    background: '#e4ded0',
  },
})
  .composite(layers)
  .webp({ quality: 90 })
  .toFile('tmp/qa/practice-art-contact.webp');
console.log(
  JSON.stringify({ completed: selected.length, path: 'tmp/qa/practice-art-contact.webp' }),
);
