'use client';

import { useSyncExternalStore } from 'react';

function createClock(interval: number) {
  let snapshot = 0;
  let timer: ReturnType<typeof setInterval> | undefined;
  const listeners = new Set<() => void>();
  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (!timer) {
        snapshot = Date.now();
        timer = setInterval(() => {
          snapshot = Date.now();
          for (const notify of listeners) notify();
        }, interval);
      }
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          clearInterval(timer);
          timer = undefined;
        }
      };
    },
    getSnapshot: () => snapshot,
  };
}

const seconds = createClock(1000);
const minutes = createClock(60_000);
const getServerSnapshot = () => 0;

// Cached snapshots keep renders pure and hydration stable; only mounted consumers run a timer.
export function useClock(precision: 'second' | 'minute' = 'second') {
  const clock = precision === 'second' ? seconds : minutes;
  return useSyncExternalStore(clock.subscribe, clock.getSnapshot, getServerSnapshot);
}
