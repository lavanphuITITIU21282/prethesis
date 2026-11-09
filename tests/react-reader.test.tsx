import './helpers/dom.mjs';
import React, { StrictMode } from 'react';
import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime.js';
import Reader from '../src/modules/content/presentation/reader';
import { StudyProvider, useStudy } from '../src/modules/learning/presentation/study-provider';
import { UIContext } from '../src/shared/ui/ui-context';
import { FocusTimer } from '../src/modules/learning/presentation/focus-timer';
import { SettingsDialog, SourceDialog } from '../src/shared/ui/dialogs';
import { freshState, STORAGE_KEY } from '../src/shared/domain/study-core.js';
import type { Course, Source, StudyState } from '../src/shared/domain/models';
const course: Course = JSON.parse(readFileSync('public/data/course.json', 'utf8'));
const sources: Source[] = JSON.parse(readFileSync('public/data/sources.json', 'utf8'));
const pushes: string[] = [];
const opened: string[] = [];
const router = {
  push: (href: string) => pushes.push(href),
  replace() {},
  refresh() {},
  prefetch() {},
  back() {},
  forward() {},
};
const ui = {
  lessonArt: {},
  showModal() {},
  closeModal() {},
  openTerm: (id: string) => opened.push(id),
  openSource() {},
};
beforeEach(() => {
  localStorage.clear();
  pushes.length = 0;
  opened.length = 0;
});
afterEach(cleanup);

function Ready({ children }: { children: React.ReactNode }) {
  return useStudy().ready ? children : <p>Loading</p>;
}
const wrap = (children: React.ReactNode) => (
  <AppRouterContext.Provider value={router}>
    <StudyProvider course={course} sources={sources}>
      <UIContext.Provider value={ui}>
        <Ready>{children}</Ready>
      </UIContext.Provider>
    </StudyProvider>
  </AppRouterContext.Provider>
);

test('React reader retains expanded material and source figures across all five chapters', () => {
  for (const chapter of course.modules) {
    const lesson = course.lessons.find((item) => item.module === chapter.id)!;
    const view = render(wrap(<Reader lessonId={lesson.id} />));
    assert.ok(view.getByRole('heading', { level: 1, name: lesson.title }));
    assert.ok(view.getByRole('heading', { name: 'Hiểu kỹ cơ chế và giới hạn' }));
    assert.ok(view.container.querySelector('.study-source-figure img'));
    assert.equal(
      view.container.querySelectorAll('.study-example li').length,
      lesson.sections[0].study.example.steps.length,
    );
    view.unmount();
  }
});

test('React reader notes, progress and delegated term actions survive remount', () => {
  let view = render(wrap(<Reader lessonId="cia" part="2" />));
  const note = view.getByRole('textbox', { name: 'MỘT VÍ DỤ HOẶC MỘT ĐIỀU CÒN VƯỚNG' });
  fireEvent.change(note, { target: { value: 'Keep this personal note across migration.' } });
  fireEvent.click(view.getByRole('button', { name: /Đã hiểu.*Hoàn thành bài/ }));
  fireEvent.click(view.getByRole('button', { name: /Đã ghi nhận.*Hoàn thành bài/ }));
  const saved: StudyState = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
  assert.deepEqual(saved.read.cia, [2]);
  assert.equal(
    Object.values(saved.activity).reduce((total, value) => total + value.sections, 0),
    1,
  );
  view.unmount();
  view = render(wrap(<Reader lessonId="cia" part="2" />));
  assert.equal((view.getByRole('textbox') as HTMLTextAreaElement).value, saved.notes.cia);
  const termButton = view.container.querySelector<HTMLButtonElement>('.study-keyword')!;
  fireEvent.click(termButton);
  assert.equal(opened[0], termButton.dataset.id);
  fireEvent.click(
    view.getByRole('button', { name: 'Phần 1: CIA: ba câu hỏi trước mọi giải pháp' }),
  );
  assert.equal(pushes.at(-1), '/learn/cia/0');
});

test('React settings preserve font, focus and timer choices', () => {
  const view = render(wrap(<SettingsDialog />));
  fireEvent.click(view.getByRole('button', { name: '25 phút' }));
  fireEvent.click(view.getByRole('button', { name: '120%' }));
  fireEvent.click(view.getByRole('button', { name: 'Bật tập trung trong bài' }));
  const saved: StudyState = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
  assert.equal(saved.settings.minutes, 25);
  assert.equal(saved.settings.font, 120);
  assert.equal(saved.settings.focus, true);
});

test('a completed timer credits minutes only once under Strict Mode', () => {
  const state = freshState();
  state.timer = { duration: 5, remaining: 1, running: true, endsAt: Date.now() - 1000 };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  render(<StrictMode>{wrap(<FocusTimer />)}</StrictMode>);
  const saved: StudyState = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
  assert.equal(saved.timer.completed, true);
  assert.equal(
    Object.values(saved.activity).reduce((total, value) => total + value.minutes, 0),
    5,
  );
});

test('PDF text navigation keeps previous, next and direct page controls', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        id: 'source-1',
        file: 'Example.pdf',
        pages: [
          { number: 1, text: 'First page' },
          { number: 2, text: 'Second page' },
        ],
      }),
    );
  try {
    const view = render(<SourceDialog id="source-1" page={1} />);
    assert.ok(await view.findByText('First page'));
    fireEvent.click(view.getByRole('button', { name: 'Sau →' }));
    assert.ok(view.getByText('Second page'));
    fireEvent.change(view.getByLabelText(/Trang/), { target: { value: '1' } });
    fireEvent.click(view.getByRole('button', { name: 'Đến trang' }));
    assert.ok(view.getByText('First page'));
  } finally {
    globalThis.fetch = originalFetch;
  }
});
