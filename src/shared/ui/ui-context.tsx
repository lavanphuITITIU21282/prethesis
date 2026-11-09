'use client';

import { createContext, useContext, type ReactNode } from 'react';

export interface Artwork {
  name: string;
  story: string;
  assetStem: string;
}
export interface ModalContent {
  title: string;
  body: ReactNode;
  className?: string;
}
export interface UIContextValue {
  lessonArt: Record<string, Artwork>;
  showModal(content: ModalContent): void;
  closeModal(): void;
  openTerm(id: string): void;
  openSource(id: string, page: number): void;
}
export const UIContext = createContext<UIContextValue | null>(null);
export function useUI() {
  const value = useContext(UIContext);
  if (!value) throw new Error('useUI must be used inside StudyShell.');
  return value;
}
