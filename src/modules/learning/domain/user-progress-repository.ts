import type { StudyState } from '../../../shared/domain/models';

export interface VersionedProgress {
  userId: string;
  revision: number;
  state: StudyState;
  updatedAt: string;
}

/** Server-side port. userId must come from a verified session, never a client payload. */
export interface UserProgressRepository {
  findForUser(userId: string): Promise<VersionedProgress | null>;
  saveForUser(
    userId: string,
    state: StudyState,
    expectedRevision: number,
  ): Promise<VersionedProgress>;
}
