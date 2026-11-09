import 'server-only';
import { createPostgresProgressRepository } from './infrastructure/postgres-progress-repository';
import { createUserProgressService } from './application/user-progress-service';
import type { Course } from '@/shared/domain/models';

export function createLearningServer(
  database: Parameters<typeof createPostgresProgressRepository>[0],
  course: Course,
) {
  return createUserProgressService(
    createPostgresProgressRepository(database, 'tram-hoc-security', 1),
    course,
  );
}
