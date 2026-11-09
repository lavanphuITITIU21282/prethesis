import { dom } from './helpers/dom.mjs';
import React from 'react';
import test from 'node:test';
import assert from 'node:assert/strict';
import { render, fireEvent, act, cleanup } from '@testing-library/react';
import AccountPage from '../src/modules/identity/presentation/account';
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime.js';
import { accounts, type Account } from '../src/modules/identity/client';

test('account form handles login errors, success, logout and registration controls', async () => {
  const original = { ...accounts };
  const previous = globalThis.FormData;
  Object.defineProperty(globalThis, 'FormData', {
    value: dom.window.FormData,
    configurable: true,
    writable: true,
  });
  let user: Account | null = null;
  let fail = true;
  accounts.session = async () => user;
  accounts.login = async () => {
    if (fail) throw new Error('Tên đăng nhập hoặc mật khẩu không đúng.');
    user = { id: 'test', name: 'Bạn học' };
    return { ok: true };
  };
  accounts.logout = async () => {
    user = null;
    return { ok: true };
  };
  try {
    let view: ReturnType<typeof render>;
    await act(async () => {
      view = render(
        <AppRouterContext.Provider
          value={{ refresh() {}, push() {}, replace() {}, back() {}, forward() {}, prefetch() {} }}
        >
          <AccountPage />
        </AppRouterContext.Provider>,
      );
    });
    await act(async () => {
      fireEvent.submit(view!.getByRole('button', { name: 'Đăng nhập' }).closest('form')!);
    });
    assert.match(view!.getByRole('alert').textContent || '', /không đúng/);
    fail = false;
    await act(async () => {
      fireEvent.submit(view!.getByRole('button', { name: 'Đăng nhập' }).closest('form')!);
    });
    assert.ok(view!.getByRole('heading', { name: 'Chào Bạn học' }));
    await act(async () => {
      fireEvent.click(view!.getByRole('button', { name: 'Đăng xuất' }));
    });
    fireEvent.click(view!.getByRole('button', { name: 'Chưa có tài khoản? Đăng ký' }));
    assert.ok(view!.getByLabelText('Tên hiển thị'));
    assert.equal(view!.getByLabelText('Mật khẩu').getAttribute('minlength'), '15');
  } finally {
    cleanup();
    Object.assign(accounts, original);
    Object.defineProperty(globalThis, 'FormData', {
      value: previous,
      configurable: true,
      writable: true,
    });
  }
});
