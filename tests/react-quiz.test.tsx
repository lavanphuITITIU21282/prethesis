import React from 'react';
import './helpers/dom.mjs';
import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { render, fireEvent, cleanup, act } from '@testing-library/react';
import { useCallback } from 'react';
import { StudyProvider, useStudy } from '../src/modules/learning/presentation/study-provider';
import { QuizSetup } from '../src/modules/assessment/presentation/quiz-setup';
import { QuizRun } from '../src/modules/assessment/presentation/quiz-run';
import {
  activateQuizSession,
  buildQuestions,
  createQuizSession,
  filterQuestions,
  freshState,
  normalizeQuizFilters,
  STORAGE_KEY,
} from '../src/shared/domain/study-core.js';
import {
  answerQuestion,
  moveQuestion,
  saveEssayScore,
} from '../src/modules/assessment/domain/quiz-operations';
import type { Course, Source } from '../src/shared/domain/models';
const course: Course = JSON.parse(readFileSync('public/data/course.json', 'utf8'));
const sources: Source[] = JSON.parse(readFileSync('public/data/sources.json', 'utf8'));
const bank = buildQuestions(course);
const originalFetch = globalThis.fetch;
beforeEach(() => {
  localStorage.clear();
  globalThis.fetch = async () => new Response(JSON.stringify({ configured: false }));
});
afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;
  document.querySelectorAll('dialog,body > input').forEach((element) => element.remove());
});

function Harness({ setup = false }: { setup?: boolean }) {
  const { course, bank, state, ready, update } = useStudy();
  const move = useCallback(
    (direction: number) =>
      update((draft) => {
        moveQuestion(draft, direction);
      }),
    [update],
  );
  if (!ready) return <p>Loading</p>;
  if (setup || !state.quiz)
    return (
      <QuizSetup
        course={course}
        bank={bank}
        state={state}
        onFilter={(value) =>
          update((draft) => {
            draft.quizFilters = normalizeQuizFilters(value, course);
          })
        }
        onStart={() =>
          update((draft) =>
            activateQuizSession(
              draft,
              createQuizSession(filterQuestions(bank, draft.quizFilters), draft.quizFilters),
            ),
          )
        }
        onResume={() => {}}
      />
    );
  if (state.quiz.index >= state.quiz.ids.length) return <p>Completed</p>;
  const question = bank.find((item) => item.id === state.quiz!.ids[state.quiz!.index])!;
  return (
    <QuizRun
      onMove={move}
      onAnswer={(selected) => update((draft) => answerQuestion(draft, question, selected))}
      onEssay={(method) =>
        update((draft) => {
          saveEssayScore(draft, question, method);
          moveQuestion(draft, 1);
        })
      }
    />
  );
}
const mount = (setup = false) =>
  render(
    <StudyProvider course={course} sources={sources}>
      <Harness setup={setup} />
    </StudyProvider>,
  );
function seed(filters: { term?: string; lesson?: string; kind?: string }) {
  const state = freshState();
  const scope = normalizeQuizFilters(filters, course);
  state.quiz = createQuizSession(filterQuestions(bank, scope), scope, () => 0.4)!;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
test('React filters preserve subsection scope and open all matching questions', () => {
  const view = mount(true);
  fireEvent.change(view.getByLabelText('2. Bài học'), { target: { value: 'cia' } });
  fireEvent.change(view.getByLabelText('3. Phần nhỏ trong bài'), { target: { value: '2' } });
  const state = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
  assert.equal(state.quizFilters.section, '2');
  assert.equal(state.quizFilters.lesson, 'cia');
  fireEvent.click(view.getByRole('button', { name: /^Mở toàn bộ \d+ câu/ }));
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
  assert.ok(saved.quiz.ids.length > 5);
  assert.equal(saved.quiz.filters.section, '2');
});
test('React answers retain the exact selection and question after remount', () => {
  seed({ term: 'cia-t1' });
  let view = mount();
  const first = view.container.querySelector<HTMLButtonElement>('[data-answer]')!;
  fireEvent.click(first);
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
  assert.equal(saved.quiz.answers[saved.quiz.ids[0]].selected, first.dataset.answer);
  view.unmount();
  view = mount();
  assert.equal(view.container.querySelectorAll('[data-answer]:disabled').length, 4);
  assert.equal(JSON.parse(localStorage.getItem(STORAGE_KEY)!).quiz.index, 0);
});
test('React keyboard navigation respects typing controls and open dialogs', () => {
  seed({ term: 'cia-t1' });
  mount();
  fireEvent.keyDown(document.body, { key: 'ArrowRight' });
  assert.equal(JSON.parse(localStorage.getItem(STORAGE_KEY)!).quiz.index, 1);
  const input = document.createElement('input');
  document.body.append(input);
  fireEvent.keyDown(input, { key: 'ArrowRight' });
  assert.equal(JSON.parse(localStorage.getItem(STORAGE_KEY)!).quiz.index, 1);
  const dialog = document.createElement('dialog');
  dialog.id = 'modal';
  dialog.open = true;
  document.body.append(dialog);
  fireEvent.keyDown(document.body, { key: 'ArrowLeft' });
  assert.equal(JSON.parse(localStorage.getItem(STORAGE_KEY)!).quiz.index, 1);
  dialog.open = false;
  fireEvent.keyDown(document.body, { key: 'ArrowLeft' });
  assert.equal(JSON.parse(localStorage.getItem(STORAGE_KEY)!).quiz.index, 0);
});
test('React essays retain drafts and rubric scores without automatic grading', async () => {
  seed({ lesson: 'cia', kind: 'boss' });
  let view = mount();
  await act(async () => {});
  fireEvent.change(view.getByLabelText('Phần lập luận của bạn'), {
    target: { value: 'My saved reasoning about CIA and ransomware.' },
  });
  fireEvent.change(view.getByLabelText('Điểm tiêu chí 1'), { target: { value: '1' } });
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
  assert.equal(saved.drafts.cia, 'My saved reasoning about CIA and ransomware.');
  assert.deepEqual(saved.quiz.answers, {});
  view.unmount();
  view = mount();
  await act(async () => {});
  assert.equal(
    (view.getByLabelText('Phần lập luận của bạn') as HTMLTextAreaElement).value,
    saved.drafts.cia,
  );
  fireEvent.click(view.getByRole('button', { name: 'Lưu tự chấm · Câu tiếp →' }));
  assert.equal(JSON.parse(localStorage.getItem(STORAGE_KEY)!).quiz.answers['cia-boss'].score, 1);
});
