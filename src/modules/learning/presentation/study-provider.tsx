'use client';

import React from 'react';

import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { buildQuestions, freshState } from '@/shared/domain/study-core.js';
import { loadProgress, saveProgress } from '@/modules/learning/application/progress-service';
import { createBrowserProgressRepository } from '@/modules/learning/infrastructure/browser-progress-repository';
import type { Course, Source, StudyState } from '@/shared/domain/models';
import { StudyContext } from './study-context';
import { AccountStudyProvider } from './account-study-provider';

export function StudyProvider(props: {
  course: Course;
  sources: Source[];
  children: ReactNode;
  accountId?: string;
  sessionUnavailable?: boolean;
}) {
  return props.accountId ? (
    <AccountStudyProvider key={props.accountId} {...props} accountId={props.accountId} />
  ) : (
    <LocalStudyProvider {...props} />
  );
}
function LocalStudyProvider({
  course,
  sources,
  children,
  sessionUnavailable = false,
}: {
  course: Course;
  sources: Source[];
  children: ReactNode;
  sessionUnavailable?: boolean;
}) {
  const [state, setState] = useState<StudyState>(freshState);
  const [ready, setReady] = useState(false);
  const [warning, setWarning] = useState('');
  const [toast, setToast] = useState('');
  const current = useRef(state);
  const blocked = useRef(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const bank = useMemo(() => buildQuestions(course), [course]);
  const progressDAO = useMemo(() => createBrowserProgressRepository(() => window.localStorage), []);

  useEffect(() => {
    if (sessionUnavailable) {
      blocked.current = true;
      // An unverifiable session must never expose or modify the guest's storage.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWarning('Chưa xác minh được phiên đăng nhập. Mở Tài khoản hoặc tải lại trang để thử lại.');
      setReady(true);
      return;
    }
    // Accessing the storage getter itself can fail in restricted browser sessions.
    let result: ReturnType<typeof loadProgress>;
    try {
      result = loadProgress(progressDAO, course);
    } catch {
      result = {
        state: freshState(),
        warning:
          'Trình duyệt không cho truy cập kho tiến độ. Hãy xuất bản sao trước khi đóng trang.',
        blocked: true,
      };
    }
    current.current = result.state;
    blocked.current = result.blocked === true;
    // Browser-only storage must hydrate after SSR; this one-time update preserves saved progress.
    setState(result.state);
    setWarning(result.warning);
    setReady(true);
    return () => clearTimeout(timeout.current);
  }, [course, progressDAO, sessionUnavailable]);

  const notify = useCallback((message: string) => {
    clearTimeout(timeout.current);
    setToast(message);
    timeout.current = setTimeout(() => setToast(''), 4000);
  }, []);

  const commit = useCallback(
    (next: StudyState) => {
      if (sessionUnavailable) return;
      current.current = next;
      setState(next);
      // Persist outside React state updaters; Strict Mode can replay those updaters.
      if (!blocked.current) {
        let saved = false;
        try {
          saved = saveProgress(progressDAO, next);
        } catch {
          /* Storage access can be revoked after startup. */
        }
        if (!saved)
          setWarning('Trình duyệt chưa lưu được tiến độ. Hãy xuất bản sao trước khi đóng trang.');
      }
    },
    [progressDAO, sessionUnavailable],
  );

  const replace = useCallback(
    (next: StudyState) => {
      // Explicit backup import is confirmed by the user before replacing local data.
      blocked.current = false;
      setWarning('');
      commit(next);
    },
    [commit],
  );

  const update = useCallback(
    (recipe: (draft: StudyState) => void) => {
      const next = structuredClone(current.current);
      recipe(next);
      commit(next);
    },
    [commit],
  );

  return (
    <StudyContext.Provider
      value={{
        course,
        sources,
        bank,
        state,
        ready,
        warning,
        toast,
        notify,
        update,
        replace,
        blocked: sessionUnavailable,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const value = useContext(StudyContext);
  if (!value) throw new Error('useStudy must be used inside StudyProvider.');
  return value;
}
