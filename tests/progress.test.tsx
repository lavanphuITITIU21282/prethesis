import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildQuestions,
  createQuizSession,
  freshState,
  normalizeQuizFilters,
  STORAGE_KEY,
  filterQuestions,
  validateBackup,
} from '../src/shared/domain/study-core.js';
import {
  loadProgress as loadService,
  saveProgress as saveService,
} from '../src/modules/learning/application/progress-service';
import {
  answerQuestion,
  moveQuestion,
  recordQuizResult,
  saveEssayScore,
} from '../src/modules/assessment/domain/quiz-operations';
import {
  createBrowserProgressRepository,
  type StorageLike,
} from '../src/modules/learning/infrastructure/browser-progress-repository';
import type { Course, StudyState } from '../src/shared/domain/models';
const course: Course = JSON.parse(readFileSync('public/data/course.json', 'utf8'));
const bank = buildQuestions(course);
const loadProgress = (storage: StorageLike, course: Course) =>
  loadService(
    createBrowserProgressRepository(() => storage),
    course,
  );
const saveProgress = (storage: StorageLike, state: StudyState) =>
  saveService(
    createBrowserProgressRepository(() => storage),
    state,
  );
const memory = (entries: [string, string][] = []) => {
  const values = new Map(entries);
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
};
const make = () => {
  const state = freshState();
  const filters = normalizeQuizFilters({ term: 'cia-t1' }, course);
  state.quiz = createQuizSession(filterQuestions(bank, filters), filters, () => 0.4)!;
  return state;
};
test('legacy notes, filters, timer and active question survive migration', () => {
  const state = make();
  state.notes.cia = 'Ghi chú trước khi đổi nền tảng';
  state.read.cia = [0, 2];
  state.timer = { running: true, remaining: 50, duration: 5, endsAt: Date.now() + 50000 };
  const store = memory([[STORAGE_KEY, JSON.stringify(state)]]);
  const restored = loadProgress(store, course);
  assert.equal(restored.warning, '');
  assert.deepEqual(restored.state, state);
  assert.equal(saveProgress(store, restored.state), true);
});
test('corrupt progress is preserved before any replacement write', () => {
  const raw = '{broken JSON';
  const store = memory([[STORAGE_KEY, raw]]);
  const result = loadProgress(store, course);
  assert.ok(result.warning);
  assert.equal(store.values.get(`${STORAGE_KEY}-recovery`), raw);
  assert.equal(store.values.get(STORAGE_KEY), raw);
  const blocked = loadProgress(
    {
      getItem: () => raw,
      setItem: () => {
        throw new Error('quota');
      },
    },
    course,
  );
  assert.equal(blocked.blocked, true);
  assert.equal(
    saveProgress(
      {
        getItem: () => null,
        setItem: () => {
          throw new Error('quota');
        },
      },
      result.state,
    ),
    false,
  );
});
test('invalid timers are dropped while valid notes survive', () => {
  const state = freshState();
  state.notes.cia = 'Keep me';
  const result = loadProgress(
    memory([
      [
        STORAGE_KEY,
        JSON.stringify({ ...state, timer: { running: true, remaining: -1, duration: 999 } }),
      ],
    ]),
    course,
  );
  assert.equal(result.state.timer, null);
  assert.equal(result.state.notes.cia, 'Keep me');
});
test('navigation retains skipped questions without inventing scores', () => {
  const state = make();
  assert.equal(moveQuestion(state, -1).moved, false);
  moveQuestion(state, 1);
  moveQuestion(state, 1);
  assert.equal(state.quiz!.index, 2);
  assert.equal(moveQuestion(state, 1).foundMissing, true);
  assert.equal(state.quiz!.index, 0);
  assert.deepEqual(state.quiz!.answers, {});
  assert.equal(
    validateBackup(JSON.parse(JSON.stringify(state)), course).quiz!.freeNavigation,
    true,
  );
});
test('repeated answers cannot double count term reviews', () => {
  const state = make();
  const question = bank.find((item) => item.id === state.quiz!.ids[0])!;
  assert.equal(answerQuestion(state, question, question.correct!), true);
  const review = structuredClone(state.reviews[question.term!]);
  assert.equal(answerQuestion(state, question, question.correct!), false);
  assert.deepEqual(state.reviews[question.term!], review);
});
test('results are recorded once even after revisiting the final question', () => {
  const state = make();
  for (const id of state.quiz!.ids) {
    const question = bank.find((item) => item.id === id)!;
    answerQuestion(state, question, question.correct!);
  }
  state.quiz!.index = state.quiz!.ids.length;
  recordQuizResult(state, bank);
  recordQuizResult(state, bank);
  assert.equal(state.history.length, 1);
  assert.equal(state.history[0].correct, 3);
  moveQuestion(state, -1);
  moveQuestion(state, 1);
  recordQuizResult(state, bank);
  assert.equal(state.history.length, 1);
});
test('self grading stays separate from AI and skipped essays remain unanswered', () => {
  const state = freshState();
  const question = bank.find((item) => item.id === 'cia-boss')!;
  state.quiz = createQuizSession(
    [question],
    normalizeQuizFilters({ lesson: 'cia', kind: 'boss' }, course),
  )!;
  moveQuestion(state, 1);
  assert.deepEqual(state.quiz.answers, {});
  state.bossScores.cia = [1, 1, 1, 1];
  assert.equal(saveEssayScore(state, question, 'gemini'), false);
  assert.equal(saveEssayScore(state, question, 'self'), true);
  assert.deepEqual(state.quiz.answers[question.id], { score: 4, selfRated: true });
});
