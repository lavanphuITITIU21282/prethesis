import './helpers/dom.mjs';
import React, { useState } from 'react';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { render, fireEvent, act, cleanup } from '@testing-library/react';
import { StudyProvider, useStudy } from '../src/modules/learning/presentation/study-provider';
import { AccountSyncPanel } from '../src/modules/learning/presentation/account-sync-panel';
import { UIContext, type ModalContent } from '../src/shared/ui/ui-context';
import { freshState, STORAGE_KEY } from '../src/shared/domain/study-core.js';
import type { Course } from '../src/shared/domain/models';
import type { ProgressRecord } from '../src/modules/learning/domain/account-progress';
const course: Course = JSON.parse(readFileSync('public/data/course.json', 'utf8'));
function Editor() {
  const { state, ready, update } = useStudy();
  return ready ? (
    <label>
      Note
      <input
        value={state.notes.cia || ''}
        onChange={(event) =>
          update((draft) => {
            draft.notes.cia = event.target.value;
          })
        }
      />
    </label>
  ) : (
    <p>Loading</p>
  );
}
function Fixture({ accountId }: { accountId?: string }) {
  return (
    <StudyProvider course={course} sources={[]} accountId={accountId}>
      <Content key={accountId || 'guest'} />
    </StudyProvider>
  );
}
function Content() {
  const [modal, setModal] = useState<ModalContent | null>(null);
  return (
    <UIContext.Provider
      value={{
        lessonArt: {},
        showModal: setModal,
        closeModal: () => setModal(null),
        openTerm() {},
        openSource() {},
      }}
    >
      <AccountSyncPanel />
      <Editor />
      {modal && <section aria-label={modal.title}>{modal.body}</section>}
    </UIContext.Provider>
  );
}
test('React account progress is isolated, guest import needs confirmation, and logout restores the untouched guest', async () => {
  const original = globalThis.fetch;
  const records = new Map<string, ProgressRecord>();
  localStorage.clear();
  const guest = freshState();
  guest.notes.cia = 'Original guest';
  const raw = JSON.stringify(guest);
  localStorage.setItem(STORAGE_KEY, raw);
  globalThis.fetch = async (_input, init) => {
    const owner = new Headers(init?.headers).get('x-study-account')!;
    if (init?.method === 'PUT') {
      const value = JSON.parse(init.body as string);
      const old = records.get(owner);
      if ((old?.revision || 0) !== value.revision)
        return Response.json({ code: 'PROGRESS_CONFLICT' }, { status: 409 });
      records.set(owner, { revision: value.revision + 1, state: value.state });
    }
    return Response.json({ progress: records.get(owner) || null });
  };
  try {
    let view: ReturnType<typeof render>;
    await act(async () => {
      view = render(<Fixture accountId="alice" />);
    });
    assert.equal((view!.getByLabelText('Note') as HTMLInputElement).value, '');
    fireEvent.change(view!.getByLabelText('Note'), { target: { value: 'Alice private' } });
    await act(async () => {
      fireEvent.click(view!.getByRole('button', { name: 'Đồng bộ lại' }));
    });
    assert.equal(records.get('alice')?.state.notes.cia, 'Alice private');
    fireEvent.click(view!.getByRole('button', { name: 'Nhập từ kho học khách' }));
    assert.ok(
      view!
        .getByRole('region', { name: 'Nhập dữ liệu học khách vào tài khoản?' })
        .textContent?.includes('Alice private'),
    );
    await act(async () => {
      window.dispatchEvent(new window.Event('tram-hoc:account-change'));
    });
    assert.equal(
      view!.queryByRole('region', { name: 'Nhập dữ liệu học khách vào tài khoản?' }),
      null,
    );
    assert.equal((view!.getByLabelText('Note') as HTMLInputElement).value, '');
    assert.equal(
      (view!.getByRole('button', { name: 'Xuất nháp thiết bị' }) as HTMLButtonElement).disabled,
      true,
    );
    assert.equal(
      JSON.parse(localStorage.getItem('tram-hoc-account-v1:alice')!).state.notes.cia,
      'Alice private',
    );
    await act(async () => {
      view!.rerender(<Fixture accountId="bob" />);
    });
    assert.equal((view!.getByLabelText('Note') as HTMLInputElement).value, '');
    assert.equal(records.has('bob'), false);
    fireEvent.click(view!.getByRole('button', { name: 'Nhập từ kho học khách' }));
    assert.equal((view!.getByLabelText('Note') as HTMLInputElement).value, '');
    fireEvent.click(view!.getByRole('button', { name: 'Xác nhận thay bằng bản khách' }));
    await act(async () => {
      fireEvent.click(view!.getByRole('button', { name: 'Đồng bộ lại' }));
    });
    assert.equal(records.get('bob')?.state.notes.cia, 'Original guest');
    assert.equal(records.get('alice')?.state.notes.cia, 'Alice private');
    fireEvent.click(view!.getByRole('button', { name: 'Bản khôi phục', exact: true }));
    assert.ok(
      !view!
        .getByRole('region', { name: 'Bản khôi phục trên thiết bị' })
        .textContent?.includes('Alice private'),
    );
    fireEvent.click(view!.getByRole('button', { name: 'Chọn khôi phục bản 1' }));
    fireEvent.click(view!.getByRole('button', { name: 'Xác nhận dùng bản này' }));
    await act(async () => {
      fireEvent.click(view!.getByRole('button', { name: 'Đồng bộ lại' }));
    });
    assert.equal(records.get('bob')?.state.notes.cia, undefined);
    await act(async () => {
      view!.rerender(<Fixture />);
    });
    assert.equal((view!.getByLabelText('Note') as HTMLInputElement).value, 'Original guest');
    assert.equal(localStorage.getItem(STORAGE_KEY), raw);
  } finally {
    cleanup();
    globalThis.fetch = original;
    localStorage.clear();
  }
});
