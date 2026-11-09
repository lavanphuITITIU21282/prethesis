import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

test('each practice lesson has a distinct complete painting, independent of reading artwork', () => {
  const course = JSON.parse(readFileSync('public/data/course.json', 'utf8'));
  const art = JSON.parse(readFileSync('public/data/practice-lesson-art.json', 'utf8'));
  const reading = JSON.parse(readFileSync('public/data/lesson-backgrounds.json', 'utf8'));
  const readingHashes = new Set(reading.works.map((w) => w.pixelHash));
  assert.equal(art.count, course.lessons.length);
  assert.equal(new Set(art.works.map((w) => w.id)).size, course.lessons.length);
  assert.equal(new Set(art.works.map((w) => w.pixelHash)).size, course.lessons.length);
  assert.equal(new Set(art.works.map((w) => w.category)).size, 5);
  for (const lesson of course.lessons) {
    const work = art.works.find((w) => w.id === lesson.id);
    assert.ok(work, lesson.id);
    assert.equal(work.lessonTitle, lesson.title);
    assert.ok(!readingHashes.has(work.pixelHash));
    assert.deepEqual(
      work.variants.map((v) => v.width),
      [480, 960, 1536],
    );
    for (const variant of work.variants) {
      const bytes = readFileSync(resolve('public', variant.url.slice(1)));
      assert.equal(bytes.byteLength, variant.bytes);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), variant.sha256);
    }
  }
});
