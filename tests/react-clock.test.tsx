import './helpers/dom.mjs';
import React from 'react';
import test from 'node:test';
import assert from 'node:assert/strict';
import { render, act, cleanup } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { useClock } from '../src/shared/ui/use-clock';

function Clock({ precision = 'second' }: { precision?: 'second' | 'minute' }) {
  return <output>{useClock(precision)}</output>;
}

test('clock uses a stable server snapshot and refreshes after mount and remount', (context) => {
  context.mock.timers.enable({ apis: ['Date', 'setInterval'], now: 1_000_000 });
  try {
    assert.match(renderToString(<Clock />), /<output>0<\/output>/);
    const view = render(<Clock />);
    assert.equal(view.container.textContent, '1000000');
    act(() => context.mock.timers.tick(1000));
    assert.equal(view.container.textContent, '1001000');
    view.unmount();
    act(() => context.mock.timers.tick(10_000));
    const restored = render(<Clock />);
    assert.equal(restored.container.textContent, '1011000');
  } finally {
    cleanup();
    context.mock.timers.reset();
  }
});

test('review clocks update on minute boundaries without second-by-second renders', (context) => {
  context.mock.timers.enable({ apis: ['Date', 'setInterval'], now: 2_000_000 });
  try {
    const view = render(<Clock precision="minute" />);
    assert.equal(view.container.textContent, '2000000');
    act(() => context.mock.timers.tick(59_000));
    assert.equal(view.container.textContent, '2000000');
    act(() => context.mock.timers.tick(1000));
    assert.equal(view.container.textContent, '2060000');
  } finally {
    cleanup();
    context.mock.timers.reset();
  }
});
