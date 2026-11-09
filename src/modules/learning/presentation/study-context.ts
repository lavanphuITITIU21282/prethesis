'use client';
import { createContext } from 'react';
import type { Course, Question, Source, StudyState } from '@/shared/domain/models';
import type { AccountSync, SyncSnapshot } from '../application/account-sync';
export interface StudyContextValue {
  course: Course;
  sources: Source[];
  bank: Question[];
  state: StudyState;
  ready: boolean;
  warning: string;
  toast: string;
  blocked?: boolean;
  accountSync?: AccountSync;
  syncStatus?: SyncSnapshot;
  accountId?: string;
  notify(message: string): void;
  update(recipe: (draft: StudyState) => void): void;
  replace(state: StudyState): void;
}
export const StudyContext = createContext<StudyContextValue | null>(null);
