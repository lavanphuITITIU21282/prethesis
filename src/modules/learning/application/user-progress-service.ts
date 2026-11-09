import type { AuthenticatedPrincipal } from '@/modules/identity';
import type { Course } from '@/shared/domain/models';
import { validateBackup } from '@/shared/domain/study-core.js';
import type { UserProgressRepository } from '../domain/user-progress-repository';

export function createUserProgressService(repository: UserProgressRepository, course: Course) {
  function userId(principal: AuthenticatedPrincipal | null) {
    if (!principal?.userId) throw new Error('Authentication required.');
    return principal.userId;
  }
  return {
    find(principal: AuthenticatedPrincipal | null) {
      return repository.findForUser(userId(principal));
    },
    save(principal: AuthenticatedPrincipal | null, input: unknown, expectedRevision: number) {
      const owner = userId(principal);
      // Reuse v1 import validation; running timers remain device-local instead of crossing sessions.
      const state = validateBackup(input, course);
      return repository.saveForUser(owner, state, expectedRevision);
    },
  };
}
