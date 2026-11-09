import { STORAGE_KEY } from '@/shared/domain/study-core.js';
import { createClientId } from '@/shared/application/client-id';
import type { AccountProgressCache } from '../domain/account-progress';
export function createBrowserAccountCache(
  storage: () => Storage,
  accountId: string,
): AccountProgressCache {
  const key = `tram-hoc-account-v1:${accountId}`;
  const slots = new Map<string, string>();
  return {
    read: () => storage().getItem(key),
    write: (value) => storage().setItem(key, value),
    // A competing tab updates its own draft slot, not an unbounded snapshot per keystroke.
    preserve: (value, slot) => {
      let target = slot ? slots.get(slot) : undefined;
      if (!target) {
        target = `${key}:recovery:${Date.now()}:${createClientId()}`;
        if (slot) slots.set(slot, target);
      }
      storage().setItem(target, value);
    },
    recoveries: () => {
      const store = storage();
      const result = [];
      for (let index = 0; index < store.length; index++) {
        const name = store.key(index);
        if (name?.startsWith(`${key}:recovery:`)) {
          const raw = store.getItem(name);
          if (raw !== null)
            result.push({
              key: name,
              raw,
              createdAt: Number(name.slice(`${key}:recovery:`.length).split(':')[0]) || 0,
            });
        }
      }
      return result.sort((a, b) => b.createdAt - a.createdAt);
    },
    readGuest: () => storage().getItem(STORAGE_KEY),
  };
}
