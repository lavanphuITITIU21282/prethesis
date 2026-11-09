import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildQuestions,
  defaultQuizFilters,
  normalizeQuizFilters,
  filterQuestions,
  createQuizSession,
  activateQuizSession,
  freshState,
  validateBackup,
  restoreQuiz,
} from '../src/shared/domain/study-core.js';
import {
  quizScopeLabel,
  practiceArtFor,
} from '../src/modules/assessment/domain/practice-metadata.js';
import { quizSetupHTML } from './helpers/renderers.tsx';
const course = JSON.parse(readFileSync(new URL('../public/data/course.json', import.meta.url)));
const bank = buildQuestions(course);
const filters = (value = {}) => normalizeQuizFilters(value, course);
const make = (f = filters(), now = 1000) =>
  createQuizSession(filterQuestions(bank, f), f, () => 0.4, now);

test('practice art is lesson-scoped and does not replace chapter or whole-bank artwork', () => {
  assert.equal(practiceArtFor(course, filters()), null);
  for (const chapter of course.modules)
    assert.equal(practiceArtFor(course, filters({ module: chapter.id })), null);
  const sources = new Set();
  for (const lesson of course.lessons) {
    const art = practiceArtFor(course, filters({ lesson: lesson.id }));
    assert.equal(art.id, lesson.id);
    assert.equal(art.lessonTitle, lesson.title);
    assert.ok(art.src.startsWith('/assets/practice-lesson-art/'));
    sources.add(art.src);
  }
  assert.equal(sources.size, course.lessons.length);
  const term = course.terms[0];
  assert.equal(practiceArtFor(course, filters({ term: term.id })).id, term.lesson);
  assert.equal(practiceArtFor(course, { lesson: 'unknown' }), null);
});

test('all practice includes every deep challenge and supports a separate multiple-choice mode', () => {
  const pool = filterQuestions(bank, filters());
  assert.equal(pool.length, bank.length);
  assert.equal(pool.filter((q) => q.kind === 'boss').length, course.lessons.length);
  for (const l of course.lessons) {
    const scope = filterQuestions(bank, filters({ lesson: l.id }));
    assert.ok(scope.some((q) => q.kind === 'boss' && q.lesson === l.id));
  }
  const mcq = filterQuestions(bank, filters({ kind: 'mcq' }));
  assert.equal(mcq.length, bank.length - course.lessons.length);
  assert.ok(mcq.every((q) => q.kind !== 'boss'));
  const state = freshState(),
    f = filters({ lesson: 'cia' });
  state.quiz = createQuizSession(filterQuestions(bank, f), f, () => 0.4, 1000);
  const deep = bank.find((q) => q.kind === 'boss' && q.lesson === 'cia');
  state.quiz.index = state.quiz.ids.indexOf(deep.id);
  state.quiz.freeNavigation = true;
  state.drafts.cia = 'Phân tích giả định và phản ví dụ.';
  state.quiz.answers[deep.id] = { score: 8, selfRated: true };
  const restored = validateBackup(JSON.parse(JSON.stringify(state)), course);
  assert.deepEqual(restored.quiz, state.quiz);
  assert.equal(restored.drafts.cia, state.drafts.cia);
});

test('all 75 subsections have explicitly scoped terms and questions, without losing any term or syntax token', () => {
  for (const l of course.lessons) {
    const assigned = new Set(l.sections.flatMap((s) => s.terms));
    assert.deepEqual([...assigned].sort(), [...l.terms].sort(), l.id);
    for (const [i, s] of l.sections.entries()) {
      assert.ok(s.terms.length > 0, `${l.id}/${i}`);
      const pool = filterQuestions(bank, filters({ lesson: l.id, section: String(i) }));
      assert.ok(pool.length > 0, `${l.id}/${i}`);
      for (const q of pool) {
        assert.equal(q.lesson, l.id);
        assert.ok(q.sections.includes(i));
        assert.ok(q.term ? s.terms.includes(q.term) : s.commands.includes(q.command));
      }
    }
  }
  for (const q of bank.filter((q) => q.kind !== 'boss')) assert.ok(q.sections.length > 0, q.id);
});

test('selecting part 3 only includes its concepts, not unrelated terms from parts 1 and 2', () => {
  const f = filters({ lesson: 'cia', section: '2' });
  assert.equal(f.module, course.lessons.find((l) => l.id === 'cia').module);
  const pool = filterQuestions(bank, f);
  assert.ok(pool.some((q) => q.term === 'cia-t7')); // Privacy, part 3
  assert.ok(pool.some((q) => q.term === 'cia-t8')); // Reliability, part 3
  assert.ok(!pool.some((q) => q.term === 'cia-t4')); // Disclosure, part 2
  assert.ok(!pool.some((q) => q.kind === 'boss'));
  assert.match(quizScopeLabel(course, f), /Phần 3: Ví dụ có ranh giới rõ ràng/);
});

test('subsection, question type and review priority intersect, including contextual command questions', () => {
  const f = filters({ lesson: 'cbc', section: '1', kind: 'syntax' });
  const pool = filterQuestions(bank, f);
  assert.ok(pool.length > 0);
  assert.ok(pool.every((q) => ['enc', 'dec'].includes(q.command)));
  const recall = filters({ lesson: 'cia', section: '2', priority: 'due' });
  assert.deepEqual(filterQuestions(bank, recall), []);
  const reviews = { 'cia-t7': { due: 50 }, 'cia-t8': { due: 200 } };
  assert.equal(filterQuestions(bank, recall, reviews, 100).length, 3);
  assert.ok(
    filterQuestions(bank, { ...recall, priority: 'new' }, reviews).every((q) => !reviews[q.term]),
  );
});

test('invalid filters are repaired and term links resolve the right lesson and chapter', () => {
  assert.deepEqual(
    filters({
      module: 'bad',
      lesson: 'bad',
      section: '2',
      kind: 'bad',
      size: '1000',
      priority: 'bad',
    }),
    defaultQuizFilters(),
  );
  const term = course.terms.find((t) => t.id === 'cbc-t2');
  const f = filters({ module: 'bad', lesson: 'cia', term: term.id, section: '99', kind: 'recall' });
  assert.equal(f.lesson, 'cbc');
  assert.equal(f.module, term.module);
  assert.equal(f.section, '');
  assert.equal(filterQuestions(bank, f).length, 2);
  assert.equal(filters({ lesson: 'cia', section: '0' }).section, '0');
});

test('refresh and backup import preserve exact question, answers, shuffle, filters and essay draft', () => {
  const state = freshState();
  state.quizFilters = filters({ lesson: 'cia', section: '2', size: 'all' });
  state.quiz = make(state.quizFilters);
  const q = bank.find((q) => q.id === state.quiz.ids[0]);
  state.quiz.answers[q.id] = { selected: q.correct, correct: true };
  state.quiz.index = 1;
  state.drafts.cia = 'Bản lập luận đang viết';
  const restored = validateBackup(JSON.parse(JSON.stringify(state)), course);
  assert.deepEqual(restored, state);
  assert.equal(restored.quiz.ids[restored.quiz.index], state.quiz.ids[1]);
});

test('practice opens every matching question, including when old filters still request five', () => {
  const f = filters({ lesson: 'cia', size: '5' });
  assert.equal(f.size, 'all');
  const pool = filterQuestions(bank, f);
  assert.ok(pool.length > 5);
  const session = createQuizSession(pool, { ...f, size: '5' }, () => 0.4);
  assert.equal(session.ids.length, pool.length);
  assert.deepEqual(new Set(session.ids), new Set(pool.map((q) => q.id)));
  assert.equal(session.filters.size, 'all');
  assert.ok(!quizSetupHTML(course, bank, freshState(), f).includes('id="quiz-size"'));
});

test('starting another session and restoring an older one preserves both without duplicates', () => {
  const state = freshState(),
    first = make(filters({ lesson: 'cia', section: '2' }), 1000);
  first.answers[first.ids[0]] = {
    selected: bank.find((q) => q.id === first.ids[0]).correct,
    correct: true,
  };
  first.index = 1;
  activateQuizSession(state, first);
  const second = make(filters({ lesson: 'cbc', kind: 'syntax' }), 2000);
  activateQuizSession(state, second);
  assert.equal(state.quiz, second);
  assert.equal(state.quizSessions[0], first);
  activateQuizSession(state, state.quizSessions[0]);
  assert.equal(state.quiz, first);
  assert.equal(state.quiz.index, 1);
  assert.deepEqual(state.quizSessions, [second]);
  const restored = validateBackup(JSON.parse(JSON.stringify(state)), course);
  assert.deepEqual(restored, state);
  activateQuizSession(state, first);
  assert.deepEqual(state.quizSessions, [second]);
});

test('archive has a bounded size and import rejects corrupt sessions while retaining the active one', () => {
  const state = freshState();
  for (let n = 1; n <= 25; n++) activateQuizSession(state, make(filters(), n));
  assert.equal(state.quizSessions.length, 20);
  state.quizSessions.push(state.quiz, { ids: ['removed'], index: 0 });
  const restored = validateBackup(JSON.parse(JSON.stringify(state)), course);
  assert.equal(restored.quizSessions.length, 20);
  assert.ok(restored.quizSessions.every((s) => s.id !== restored.quiz.id));
});

test('legacy saved quizzes remain resumable, preserve answers and repair an impossible progress marker', () => {
  const q = bank[0],
    q2 = bank[1];
  const state = validateBackup(
    {
      version: 1,
      quiz: {
        ids: [q.id, q2.id],
        index: 1,
        answers: { [q.id]: { selected: q.correct } },
        orders: { [q.id]: q.options.map((o) => o.id).reverse() },
      },
    },
    course,
  );
  assert.equal(state.quiz.index, 1);
  assert.deepEqual(state.quiz.orders[q.id], q.options.map((o) => o.id).reverse());
  const broken = restoreQuiz(
    { ...state.quiz, index: 2, recorded: true, answers: {} },
    bank,
    course,
  );
  assert.equal(broken.index, 0);
  assert.equal(broken.recorded, false);
});

test('completed sessions stay completed and keep their recorded marker through export and import', () => {
  const state = freshState();
  state.quiz = make();
  for (const id of state.quiz.ids) {
    const q = bank.find((q) => q.id === id);
    state.quiz.answers[id] =
      q.kind === 'boss' ? { score: 7, selfRated: true } : { selected: q.correct, correct: true };
  }
  state.quiz.index = state.quiz.ids.length;
  state.quiz.recorded = true;
  const restored = validateBackup(JSON.parse(JSON.stringify(state)), course);
  assert.deepEqual(restored.quiz, state.quiz);
  assert.match(quizSetupHTML(course, bank, restored, restored.quizFilters), /Xem kết quả/);
});

test('practice setup renders selected lesson and subsection, resume actions and archive safely', () => {
  const state = freshState();
  state.quizFilters = filters({ lesson: 'cia', section: '2' });
  activateQuizSession(state, make(state.quizFilters));
  activateQuizSession(state, make(filters({ lesson: 'cbc' }), 2000));
  const html = quizSetupHTML(course, bank, state, state.quizFilters);
  assert.match(html, /id="quiz-lesson"/);
  assert.match(html, /id="quiz-section"/);
  assert.match(html, /<option value="2" selected="">Phần 3/);
  assert.match(html, /data-action="quiz-resume"/);
  assert.match(html, /data-action="quiz-open"/);
  assert.match(html, /Các phiên trước/);
  const modified = structuredClone(course);
  modified.lessons.find((l) => l.id === 'cia').sections[2].title = '<script>alert(1)</script>';
  const escaped = quizSetupHTML(modified, bank, state, state.quizFilters);
  assert.ok(!escaped.includes('<script>'));
  assert.ok(escaped.includes('&lt;script&gt;'));
  assert.match(quizSetupHTML(course, bank, freshState(), filters()), /id="quiz-section" disabled/);
});

test('whole-lesson challenges cannot be mistaken for questions about only one subsection', () => {
  assert.equal(
    filterQuestions(bank, filters({ lesson: 'cia', section: '2', kind: 'boss' })).length,
    0,
  );
  const f = filters({ lesson: 'cia', kind: 'boss' });
  assert.equal(filterQuestions(bank, f).length, 1);
  assert.equal(createQuizSession([], f), null);
  assert.match(
    quizSetupHTML(course, bank, freshState(), { ...f, section: '2' }),
    /quiz-whole-lesson/,
  );
});
