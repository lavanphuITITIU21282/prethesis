'use client';

import React from 'react';

import { useEffect } from 'react';
import { useClock } from '@/shared/ui/use-clock';
import { dateKey } from '@/shared/domain/date';
import { useStudy } from './study-provider';

export function FocusTimer() {
  const { state, update, notify } = useStudy();
  const timer = state.timer;
  const now = useClock();
  const remaining = timer?.running
    ? Math.max(0, Math.ceil(((timer.endsAt || 0) - now) / 1000))
    : (timer?.remaining ?? state.settings.minutes * 60);
  useEffect(() => {
    if (!timer?.running || remaining !== 0) return;
    update((draft) => {
      if (!draft.timer?.running) return;
      const activity = (draft.activity[dateKey()] ??= { sections: 0, minutes: 0 });
      activity.minutes += draft.timer.duration;
      draft.timer = { ...draft.timer, running: false, remaining: 0, completed: true };
    });
    notify(`Đã xong ${timer.duration} phút. Dừng lại, uống nước hoặc nhìn ra xa một chút.`);
  }, [remaining, timer?.running, timer?.duration, update, notify]);

  function toggle() {
    update((draft) => {
      if (draft.timer?.running) draft.timer = { ...draft.timer, remaining, running: false };
      else {
        const seconds = draft.timer?.remaining || draft.settings.minutes * 60;
        draft.timer = {
          running: true,
          remaining: seconds,
          duration: draft.timer?.duration || draft.settings.minutes,
          endsAt: Date.now() + seconds * 1000,
        };
      }
    });
  }
  return (
    <div className="timer-dock" id="timer-dock">
      <span className="timer-dot" />
      <div>
        <small id="timer-label">
          {timer?.completed ? 'MỘT KHOẢNG NGHỈ NHỎ NHÉ' : 'MỘT KHOẢNG TẬP TRUNG'}
        </small>
        <strong id="timer-time">
          {String(Math.floor(remaining / 60)).padStart(2, '0')}:
          {String(remaining % 60).padStart(2, '0')}
        </strong>
      </div>
      <button
        id="timer-toggle"
        className="timer-play"
        aria-label={timer?.running ? 'Tạm dừng hẹn giờ' : 'Bắt đầu hẹn giờ'}
        onClick={toggle}
      >
        {timer?.running ? 'Ⅱ' : '▶'}
      </button>
      <button
        id="timer-reset"
        className="icon-button"
        aria-label="Đặt lại hẹn giờ"
        onClick={() =>
          update((draft) => {
            draft.timer = null;
          })
        }
      >
        ↺
      </button>
    </div>
  );
}
