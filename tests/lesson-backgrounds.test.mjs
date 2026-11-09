import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const course = JSON.parse(readFileSync('public/data/course.json', 'utf8'));
const art = JSON.parse(readFileSync('public/data/lesson-backgrounds.json', 'utf8'));

test('every lesson has its own independently generated Chinese scene and complete responsive image files', () => {
  assert.equal(art.works.length, course.lessons.length);
  assert.equal(new Set(art.works.map((w) => w.id)).size, course.lessons.length);
  assert.equal(new Set(art.works.map((w) => w.pixelHash)).size, course.lessons.length);
  const fullImages = new Set(),
    fileHashes = new Set();
  for (const lesson of course.lessons) {
    const work = art.works.find((w) => w.id === lesson.id);
    assert.ok(work, lesson.id);
    assert.equal(work.country, 'China');
    assert.equal(work.genre, 'Chinese Xianxia');
    assert.ok(work.emotion.length > 3);
    assert.ok(work.story.length > 45);
    assert.equal(work.lessonTitle, lesson.title);
    assert.ok(work.width >= 1536 && work.height >= 700);
    assert.deepEqual(
      work.variants.map((v) => v.width),
      [480, 960, 1536],
    );
    for (const variant of work.variants) {
      const path = resolve('public', variant.url.slice(1));
      assert.ok(existsSync(path), variant.url);
      const bytes = readFileSync(path);
      assert.equal(bytes.byteLength, variant.bytes);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), variant.sha256);
    }
    const full = work.variants.find((v) => v.width === 1536);
    fullImages.add(full.url);
    fileHashes.add(full.sha256);
  }
  assert.equal(fullImages.size, course.lessons.length);
  assert.equal(fileHashes.size, course.lessons.length);
});
