import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  buildQuestions,
  nextReview,
  freshState,
  validateBackup,
  restoreQuiz,
  modPow,
  inverse,
  gcd,
  isPrime,
  caesar,
  normalize,
  escapeHTML,
  shuffled,
  DAY,
} from '../src/shared/domain/study-core.js';
const course = JSON.parse(readFileSync(new URL('../public/data/course.json', import.meta.url)));
const sources = JSON.parse(readFileSync(new URL('../public/data/sources.json', import.meta.url)));
const bank = buildQuestions(course);
test('each authored term has definition, recognition and scenario questions', () => {
  for (const t of course.terms) {
    const qs = bank.filter((q) => q.term === t.id);
    assert.equal(qs.length, 3, t.id);
    assert.equal(qs.filter((q) => q.kind === 'recall').length, 2);
    assert.equal(qs.filter((q) => q.kind === 'application').length, 1);
    assert.ok(t.definition.length > 15 && t.scenario.length > 15 && t.pitfall.length > 15);
  }
});
test('all questions are unique, have unambiguous distinct options, or a ten-point rubric', () => {
  assert.equal(new Set(bank.map((q) => q.id)).size, bank.length);
  for (const q of bank) {
    assert.ok(course.lessons.some((l) => l.id === q.lesson));
    if (q.kind === 'boss') {
      assert.equal(
        q.rubric.reduce((n, r) => n + r.points, 0),
        10,
      );
      assert.equal(q.rubric.length, 4);
    } else {
      assert.equal(q.options.length, 4, q.id);
      assert.equal(new Set(q.options.map((o) => o.id)).size, 4, q.id);
      assert.equal(new Set(q.options.map((o) => o.text)).size, 4, q.id);
      assert.equal(q.options.filter((o) => o.id === q.correct).length, 1);
    }
  }
});
test('every command token has its own contextual syntax question', () => {
  for (const c of course.commands)
    for (let i = 0; i < c.tokens.length; i++)
      assert.ok(bank.some((q) => q.id === `syntax-${c.id}-${i}`));
});
test('terminology stays in English in choices and feedback, with Vietnamese explanations', () => {
  for (const t of course.terms) {
    const q = bank.find((q) => q.id === t.id + '-case');
    assert.equal(q.options.find((o) => o.id === t.id).text, t.name);
    assert.ok(q.explanation.startsWith(t.name + ': '));
    assert.ok(q.explanation.includes(t.definition));
    for (const o of q.options)
      assert.equal(o.text, course.terms.find((term) => term.id === o.id).name);
  }
});
test('all lessons cite existing pages and contain real local illustrations', () => {
  assert.equal(course.lessons.length, 25);
  assert.equal(
    sources.reduce((n, s) => n + s.pageCount, 0),
    203,
  );
  for (const l of course.lessons) {
    assert.equal(l.sections.length, 3);
    assert.ok(
      l.sections.every((s) => s.body.length > 250),
      l.id,
    );
    const source = sources.find((s) => s.id === l.source);
    assert.ok(source);
    assert.ok(l.pages.every((p) => p > 0 && p <= source.pageCount));
    for (const asset of [l.diagram, l.slide])
      assert.ok(existsSync(resolve('public', '.' + asset)), asset);
    for (const id of l.terms) assert.ok(course.terms.some((t) => t.id === id && t.lesson === l.id));
  }
  for (const s of sources) {
    const d = JSON.parse(readFileSync(`public/data/${s.id}.json`));
    assert.equal(d.pages.length, s.pageCount);
    assert.ok(existsSync(resolve('resources/documents', s.file)));
  }
});
test('toy RSA, DH and modular inverse examples round trip', () => {
  assert.equal(gcd(7, 192), 1);
  assert.equal(inverse(7, 192), 55);
  assert.equal(inverse(4, 8), null);
  assert.equal(modPow(42, 7, 221), 185n);
  assert.equal(modPow(185, 55, 221), 42n);
  assert.equal(modPow(5, 6, 23), 8n);
  assert.equal(modPow(5, 15, 23), 19n);
  assert.equal(modPow(19, 6, 23), 2n);
  assert.equal(modPow(8, 15, 23), 2n);
  assert.equal(isPrime(997), true);
  assert.equal(isPrime(999), false);
});
test('Caesar handles negative keys, case, wraparound and Unicode without data loss', () => {
  assert.equal(caesar('CAT xyz! Việt', 3), 'FDW abc! Ylệw');
  assert.equal(caesar(caesar('Hello, Việt!', 25), -25), 'Hello, Việt!');
});
test('review scheduling advances recall and retries forgotten cards in ten minutes', () => {
  const now = 1000000000;
  const first = nextReview(null, 2, now);
  assert.equal(first.due, now + DAY);
  assert.equal(first.level, 1);
  const next = nextReview(first, 2, now + DAY);
  assert.equal(next.due, now + 4 * DAY);
  assert.equal(next.correct, 2);
  const fail = nextReview(next, 0, now + 2 * DAY);
  assert.equal(fail.level, 0);
  assert.equal(fail.due, now + 2 * DAY + 600000);
  assert.equal(fail.seen, 3);
  assert.equal(fail.correct, 2);
});
test('progress backup round trip preserves user data and rejects unknown version', () => {
  const input = freshState();
  input.notes.cia = 'Ghi chú <b>của tôi</b>';
  input.read.cia = [0, 1];
  input.reviews[course.terms[0].id] = nextReview(null, 2);
  input.bossScores.cia = [3, 2, 1, 2];
  const result = validateBackup(JSON.parse(JSON.stringify(input)), course);
  assert.deepEqual(result, input);
  assert.throws(() => validateBackup({ version: 2 }, course));
});
test('corrupt backup discards unknown lesson ids, invalid sections and injected fields', () => {
  const input = JSON.parse(
    '{"version":1,"notes":{"__proto__":"bad","cia":"safe","unknown":"bad"},"read":{"cia":[0,0,-1,99,"1"]},"settings":{"font":900,"dark":"true"},"reviews":{"cia-t1":{"level":-1,"seen":2,"correct":3,"due":0,"updated":0}}}',
  );
  const s = validateBackup(input, course);
  assert.deepEqual(s.read.cia, [0]);
  assert.deepEqual(s.notes, { cia: 'safe' });
  assert.equal(s.settings.font, 100);
  assert.equal(s.settings.dark, false);
  assert.deepEqual(s.reviews, {});
  assert.equal({}.bad, undefined);
});
test('quiz session restore repairs order, recalculates answers and resumes missing questions', () => {
  const q = bank[0],
    q2 = bank[1];
  const s = restoreQuiz(
    {
      ids: [q.id, q2.id],
      index: 2,
      answers: { [q.id]: { selected: q.correct, correct: false } },
      orders: { [q.id]: 'corrupt' },
    },
    bank,
  );
  assert.equal(s.index, 1);
  assert.equal(s.answers[q.id].correct, true);
  assert.deepEqual(
    s.orders[q.id],
    q.options.map((o) => o.id),
  );
  assert.equal(restoreQuiz({ ids: ['unknown'], index: 0 }, bank), null);
});
test('search normalization, escaping and shuffle preserve invariants', () => {
  assert.equal(normalize('Tính toàn vẹn Đúng'), 'tinh toan ven dung');
  assert.equal(escapeHTML('<script>"&'), '&lt;script&gt;&quot;&amp;');
  const input = [1, 2, 3, 4];
  assert.deepEqual(shuffled(input, () => 0).sort(), input);
  assert.deepEqual(input, [1, 2, 3, 4]);
});
