// Verify all original practice artworks before publishing the manifest and CSS.
import sharp from 'sharp';
import { readFile, writeFile, readdir, mkdir, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const course = JSON.parse(await readFile('public/data/course.json', 'utf8'));
const catalog = JSON.parse(await readFile('scripts/assets/practice-art-catalog.json', 'utf8'));
const reading = JSON.parse(await readFile('public/data/lesson-backgrounds.json', 'utf8'));
const readingHashes = new Set(reading.works.map((w) => w.pixelHash));
const works = [],
  hashes = new Set();
for (const lesson of course.lessons) {
  const spec = catalog.find((w) => w.id === lesson.id);
  if (!spec) throw Error('Missing practice specification: ' + lesson.id);
  const work = JSON.parse(
    await readFile(`resources/artwork/practice-lesson-art/${spec.assetStem}.json`, 'utf8'),
  );
  const raw = await sharp(work.original).removeAlpha().raw().toBuffer();
  const pixelHash = createHash('sha256').update(raw).digest('hex');
  if (hashes.has(pixelHash) || readingHashes.has(pixelHash))
    throw Error('Reused artwork: ' + lesson.id);
  hashes.add(pixelHash);
  for (const variant of work.variants) {
    const data = await readFile(resolve('public', variant.url.slice(1)));
    if (data.length !== variant.bytes) throw Error('Invalid runtime file: ' + variant.url);
    variant.sha256 = createHash('sha256').update(data).digest('hex');
  }
  works.push({
    ...spec,
    lessonTitle: lesson.title,
    width: work.width,
    height: work.height,
    pixelHash,
    variants: work.variants,
  });
}
if (works.length !== course.lessons.length) throw Error('Incomplete practice artwork');
await writeFile(
  'public/data/practice-lesson-art.json',
  JSON.stringify(
    {
      version: 1,
      generator: 'Built-in ImageGen, original Chinese Xianxia practice art',
      scope: 'Specific lesson or term; chapter and whole-bank views unchanged',
      count: works.length,
      works,
    },
    null,
    2,
  ) + '\n',
);
const rules = works
  .map(
    (w) =>
      `body[data-page="quiz"][data-practice-lesson="${w.id}"]{--practice-photo:url('/assets/practice-lesson-art/${w.assetStem}.webp');--practice-photo-small:url('/assets/practice-lesson-art/${w.assetStem}-960.webp');--practice-deep:${w.deep};--practice-left:${w.deep}f5;--practice-mid:${w.deep}d9;--practice-wash:${w.deep}55}`,
  )
  .join('\n');
const selected = 'body[data-page=quiz][data-practice-lesson]:not([data-practice-lesson=""])';
const css = `/* Per-lesson practice artwork; no rules match chapter-only or whole-bank scopes. */\n${rules}
${selected}{--practice-display-photo:var(--practice-photo)}
${selected} .workspace::before{background-image:linear-gradient(180deg,#eadfd5c9,#eadfd5e8),var(--practice-display-photo);background-position:75% center}
${selected} .practice-hero{background:var(--practice-deep)}
${selected} .practice-hero::before{background:linear-gradient(90deg,var(--practice-left),var(--practice-mid) 39%,var(--practice-wash) 69%,transparent 95%)}
${selected} .practice-hero .practice-diptych img:first-child{object-position:75% center}
${selected} .practice-run-masthead{background:var(--practice-deep)}
${selected} .practice-run-masthead>img{object-position:78% center}
${selected} .practice-lesson-tag{display:inline-block;max-width:100%;margin-top:18px;padding:7px 10px;border:1px solid #d8bd7e70;background:#cdb88712;color:#f3e4c3;font-size:.74rem;line-height:1.65;font-weight:600}
body.dark[data-page=quiz][data-practice-lesson]:not([data-practice-lesson=""]) .workspace::before{background-image:linear-gradient(180deg,#201a2488,#201a24d4),var(--practice-display-photo)}
@media(max-width:760px){
 ${selected}{--practice-display-photo:var(--practice-photo-small)}
 ${selected} .practice-hero{min-height:0;background:var(--practice-deep)}
 ${selected} .practice-hero-copy{padding:32px 27px 28px}
 ${selected} .practice-hero .practice-diptych{position:relative;inset:auto;width:auto;height:auto;max-height:none;margin:0 17px 19px;z-index:0;min-height:0}
 ${selected} .practice-hero .practice-diptych img:first-child{width:100%;height:auto;min-height:0;aspect-ratio:2/1;object-fit:contain;border:1px solid #d8bd7e70}
 ${selected} .practice-hero::before{background:linear-gradient(140deg,var(--practice-deep),#161d201a)}
 ${selected} .practice-art-seal{right:12px;bottom:12px;font-size:17px;padding:5px 6px;opacity:.85}
 ${selected} .practice-lesson-tag{font-size:.7rem;margin-top:14px}
}
@media print{${selected} .workspace::before{display:none!important}${selected} .practice-hero{background:white}${selected} .practice-lesson-tag{color:black;background:white;border-color:#777}}
`;
await writeFile('src/styles/practice-lesson-art.css', css);
// Retain earlier drafts outside the served asset folder; never remove originals.
const active = new Set(works.flatMap((w) => w.variants.map((v) => v.url.split('/').pop())));
const runtime = resolve('public/assets/practice-lesson-art');
const archive = resolve('resources/artwork/practice-lesson-art/unused-runtime-drafts');
await mkdir(archive, { recursive: true });
for (const name of await readdir(runtime)) {
  if (!/^[a-z0-9-]+\.webp$/.test(name) || active.has(name)) continue;
  await rename(resolve(runtime, name), resolve(archive, name));
}
console.log(
  JSON.stringify({
    lessons: works.length,
    uniquePracticePaintings: hashes.size,
    variants: works.flatMap((w) => w.variants).length,
    totalBytes: works.flatMap((w) => w.variants).reduce((n, v) => n + v.bytes, 0),
  }),
);
