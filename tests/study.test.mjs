import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { studyGuideHTML } from '../src/modules/content/presentation/renderers/study-guide.js';
import {
  buildQuestions,
  validateBackup,
  defaultQuizFilters,
} from '../src/shared/domain/study-core.js';
const course = JSON.parse(readFileSync(new URL('../public/data/course.json', import.meta.url)));
const sources = JSON.parse(readFileSync(new URL('../public/data/sources.json', import.meta.url)));

test('all 75 sections have substantive explanations, worked steps, solved checkpoints and local source figures', () => {
  for (const l of course.lessons)
    for (const s of l.sections) {
      const g = s.study;
      assert.ok(g, l.id);
      assert.ok(g.paragraphs.length >= 2);
      assert.ok(
        g.paragraphs.every((p) => p.length > 180),
        `${l.id}: ${s.title}`,
      );
      assert.ok(g.example.title.length > 10 && g.example.steps.length >= 3);
      assert.ok(
        g.example.steps.every((step) => step.trim().length > 20),
        `${l.id}: empty worked step`,
      );
      assert.ok(g.checkpoint.question.length > 30 && g.checkpoint.answer.length > 80);
      assert.ok(g.references.length > 0);
      for (const ref of g.references) {
        const source = sources.find((src) => src.id === ref.source);
        assert.ok(source);
        assert.ok(ref.page >= 1 && ref.page <= source.pageCount);
        assert.ok(ref.image.width > 500 && ref.image.height > 300);
        assert.ok(
          existsSync(resolve('public', `assets/source-pages/${ref.source}-p${ref.page}.webp`)),
        );
      }
      assert.ok(s.terms.length > 0);
      assert.ok(s.minutes >= 4);
    }
});

test('study renderer includes scoped English concepts, real command explanations and source links while escaping content', () => {
  const l = course.lessons.find((l) => l.id === 'hash-algorithms'),
    s = l.sections[2];
  const html = studyGuideHTML(s, l, course, sources);
  assert.ok(html.includes('hashlib.sha256()'));
  assert.ok(html.includes('h.hexdigest()'));
  assert.ok(html.includes('Xem lời giải và lập luận'));
  assert.ok(html.includes('height="'));
  assert.ok(html.includes('/documents/source-5#page=16'));
  for (const id of s.terms) assert.ok(html.includes(course.terms.find((t) => t.id === id).name));
  const dirty = structuredClone(s);
  dirty.study.paragraphs[0] = '<script>alert(1)</script>';
  dirty.study.checkpoint.answer = '<img src=x onerror=alert(1)>';
  dirty.study.references.push(
    { source: '../../.env.local', page: 1 },
    { source: 'source-5', page: 999 },
  );
  const safe = studyGuideHTML(dirty, l, course, sources);
  assert.ok(!safe.includes('<script>'));
  assert.ok(!safe.includes('<img src=x'));
  assert.ok(safe.includes('&lt;script&gt;'));
  assert.ok(!safe.includes('.env.local'));
  assert.ok(!safe.includes('#page=999'));
});

test('each lesson shows a source image only the first time it is used and keeps later references accessible', () => {
  for (const lesson of course.lessons) {
    const seen = new Set();
    for (const section of lesson.sections) {
      const html = studyGuideHTML(section, lesson, course, sources);
      assert.ok(!html.includes('/assets/ink-worlds/'), lesson.id);
      for (const ref of section.study.references) {
        const key = `${ref.source}:${ref.page}`;
        const image = `/assets/source-pages/${ref.source}-p${ref.page}.webp`;
        const pdf = `/documents/${ref.source}#page=${ref.page}`;
        assert.ok(html.includes(pdf), `${lesson.id}: missing source link ${key}`);
        assert.equal(
          html.includes(image),
          !seen.has(key),
          `${lesson.id}: duplicate source image ${key}`,
        );
        seen.add(key);
      }
      for (const id of section.terms)
        assert.ok(html.includes(course.terms.find((t) => t.id === id).name));
    }
  }
});

test('new terminology and syntax are included in the bank and old saved ids/notes remain valid', () => {
  const bank = buildQuestions(course);
  const extras = course.terms.filter((t) => t.id.includes('-extra-'));
  assert.equal(extras.length, 48);
  for (const t of extras) {
    assert.equal(bank.filter((q) => q.term === t.id).length, 3);
    assert.ok(bank.filter((q) => q.term === t.id).every((q) => q.sections.length));
  }
  for (const id of ['python-hash', 'python-rsa-key', 'python-pss']) {
    const command = course.commands.find((c) => c.id === id);
    assert.ok(command);
    assert.equal(bank.filter((q) => q.command === id).length, command.tokens.length);
  }
  const q = bank.find((q) => q.id === 'cia-t1-name');
  const old = {
    version: 1,
    read: { cia: [0, 2] },
    notes: { cia: 'Ghi chú trước khi bổ sung' },
    quiz: { ids: [q.id], index: 0, answers: {}, orders: { [q.id]: q.options.map((o) => o.id) } },
  };
  const restored = validateBackup(old, course);
  assert.deepEqual(restored.read.cia, [0, 2]);
  assert.equal(restored.notes.cia, old.notes.cia);
  assert.deepEqual(restored.quiz.ids, [q.id]);
  assert.deepEqual(restored.quizFilters, defaultQuizFilters());
});

test('worked numerical examples independently match modular math, padding, hash and probability', () => {
  // Values published in the guides, computed independently from the authored prose.
  assert.deepEqual(
    [3 * 7 + 3 * 8, 2 * 7 + 5 * 8].map((n) => n % 26),
    [19, 2],
  );
  assert.equal(0b1010 ^ 0b0110, 0b1100);
  assert.equal(0b1100 ^ 0b0101, 0b1010 ^ 0b0011);
  assert.equal(16 - (30 % 16), 2);
  assert.equal(16 - (32 % 16), 16);
  const pow = (b, e, m) => {
    let x = 1n;
    for (let i = 0n; i < e; i++) x = (x * b) % m;
    return x;
  };
  assert.equal(pow(42n, 7n, 221n), 185n);
  assert.equal(pow(185n, 55n, 221n), 42n);
  assert.equal(pow(pow(13n, 7n, 221n), 55n, 221n), 13n);
  assert.equal(pow(19n, 6n, 23n), 2n);
  assert.equal(pow(8n, 15n, 23n), 2n);
  assert.equal(256 - 2 * 32 - 2, 190);
  assert.equal(512 - 2 * 32 - 2, 446);
  assert.equal(
    createHash('sha256').update('abc').digest('hex'),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  );
  assert.ok(Math.abs((1 - Math.exp((-300 * 299) / (2 * 65536))) * 100 - 49.6) < 0.1);
  assert.equal(2 ** 32 * 16, 64 * 2 ** 30);
});
