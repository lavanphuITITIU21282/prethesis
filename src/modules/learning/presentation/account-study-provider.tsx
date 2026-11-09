'use client';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import type { Course, Source } from '@/shared/domain/models';
import { buildQuestions, freshState } from '@/shared/domain/study-core.js';
import type { AccountSync } from '../application/account-sync';
import { createAccountSync } from '../client';
import { StudyContext } from './study-context';

export function AccountStudyProvider({
  course,
  sources,
  accountId,
  children,
}: {
  course: Course;
  sources: Source[];
  accountId: string;
  children: ReactNode;
}) {
  const controller = useMemo(() => createAccountSync(course, accountId), [course, accountId]);
  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getServerSnapshot,
  );
  const bank = useMemo(() => buildQuestions(course), [course]);
  const redacted = useMemo(() => freshState(), []);
  const [toast, setToast] = useState('');
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const notify = useCallback((message: string) => {
    clearTimeout(timeout.current);
    setToast(message);
    timeout.current = setTimeout(() => setToast(''), 4000);
  }, []);
  const update = useCallback(
    (recipe: Parameters<AccountSync['update']>[0]) => controller.update(recipe),
    [controller],
  );
  const replace = useCallback(
    (state: Parameters<AccountSync['replace']>[0]) => {
      try {
        controller.replace(state);
      } catch {
        notify('Chưa giữ được bản khôi phục. Hãy xuất JSON trước khi thay dữ liệu.');
      }
    },
    [controller, notify],
  );
  useEffect(() => {
    void controller.start();
    const retry = () => void controller.retry();
    const lock = () => controller.lockSession();
    window.addEventListener('online', retry);
    window.addEventListener('focus', retry);
    window.addEventListener('tram-hoc:account-change', lock);
    const leaving = (event: BeforeUnloadEvent) => {
      if (controller.getSnapshot().dirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', leaving);
    return () => {
      controller.stop();
      window.removeEventListener('online', retry);
      window.removeEventListener('focus', retry);
      window.removeEventListener('tram-hoc:account-change', lock);
      window.removeEventListener('beforeunload', leaving);
      clearTimeout(timeout.current);
    };
  }, [controller]);
  return (
    <StudyContext.Provider
      value={{
        course,
        sources,
        bank,
        state: snapshot.status === 'session' ? redacted : snapshot.state,
        ready: snapshot.ready,
        warning: snapshot.warning,
        blocked: snapshot.blocked,
        toast,
        notify,
        update,
        replace,
        accountSync: controller,
        syncStatus: snapshot,
        accountId,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
}
