import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assertOwnership } from '../src/modules/identity';
import { createSourceService } from '../src/modules/content';
import { createStudyApiService } from '../src/modules/assessment';
import { createBrowserProgressRepository } from '../src/modules/learning/infrastructure/browser-progress-repository';
import { loadProgress, saveProgress } from '../src/modules/learning';
import { freshState, STORAGE_KEY } from '../src/shared/domain/study-core.js';
import type { Course } from '../src/shared/domain/models';

const course: Course = JSON.parse(readFileSync('public/data/course.json', 'utf8'));
test('ownership rejects anonymous callers and access to another user resource', () => {
  assert.doesNotThrow(() => assertOwnership({ userId: 'alice' }, { userId: 'alice' }));
  assert.throws(() => assertOwnership(null, { userId: 'alice' }), /Authentication/);
  assert.throws(() => assertOwnership({ userId: 'bob' }, { userId: 'alice' }), /denied/);
});
test('learning application accepts an injected repository without browser globals', () => {
  const values = new Map<string, string>();
  const repository = createBrowserProgressRepository(() => ({
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
  }));
  const state = freshState();
  state.notes.cia = 'A portable personal note';
  assert.equal(saveProgress(repository, state), true);
  assert.ok(values.has(STORAGE_KEY));
  assert.equal(loadProgress(repository, course).state.notes.cia, state.notes.cia);
});
test('content search runs through its repository contract and preserves source pages', async () => {
  const calls: string[] = [];
  const service = createSourceService({
    findById: async (id) => {
      calls.push(id);
      return { id, file: 'Source.pdf', pages: [{ number: 7, text: 'Mật mã và tính toàn vẹn' }] };
    },
  });
  const hits = await service.search(
    [{ id: 'source-1', file: 'Source.pdf', pageCount: 7 }],
    'toan ven',
  );
  assert.deepEqual(calls, ['source-1']);
  assert.equal(hits[0].page, 7);
});
test('assessment validates submissions before calling the external gateway', async () => {
  let calls = 0;
  const service = createStudyApiService({
    gradingStatus: async () => ({ configured: true }),
    grade: async () => {
      calls++;
      return {};
    },
  });
  assert.equal(await service.isGradingAvailable(), true);
  await assert.rejects(service.grade(course.lessons[0], 'short'), /10/);
  assert.equal(calls, 0);
  await assert.rejects(
    service.grade(course.lessons[0], 'A sufficiently long answer for validation.'),
    /rubric/,
  );
  assert.equal(calls, 1);
});
