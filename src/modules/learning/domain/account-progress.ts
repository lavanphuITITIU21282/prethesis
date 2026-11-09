import type { StudyState } from '@/shared/domain/models';
export interface ProgressRecord {
  revision: number;
  state: StudyState;
  updatedAt?: string;
}
export interface PendingProgress extends ProgressRecord {
  dirty: boolean;
}
export interface AccountProgressGateway {
  load(): Promise<ProgressRecord | null>;
  save(state: StudyState, revision: number): Promise<ProgressRecord>;
}
export interface AccountProgressCache {
  read(): string | null;
  write(value: string): void;
  preserve(value: string, slot?: string): void;
  recoveries?(): { key: string; raw: string; createdAt: number }[];
  readGuest(): string | null;
}
