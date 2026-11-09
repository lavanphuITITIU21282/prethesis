import type { PoolClient, QueryResult } from 'pg';
import type { StudyState } from '@/shared/domain/models';
import type { UserProgressRepository, VersionedProgress } from '../domain/user-progress-repository';

interface Database {
  withUser<T>(userId: string, work: (client: PoolClient) => Promise<T>): Promise<T>;
}

export class ProgressConflictError extends Error {
  constructor() {
    super('Progress changed on another device. Reload before saving.');
    this.name = 'ProgressConflictError';
  }
}

function progress(result: QueryResult): VersionedProgress | null {
  const row = result.rows[0];
  return row
    ? {
        userId: row.user_id,
        revision: Number(row.revision),
        state: row.state,
        updatedAt: row.updated_at.toISOString(),
      }
    : null;
}

export function createPostgresProgressRepository(
  database: Database,
  courseId: string,
  contentVersion = 1,
): UserProgressRepository {
  return {
    findForUser(userId) {
      return database.withUser(userId, async (client) =>
        progress(
          await client.query(
            'SELECT user_id,revision,state,updated_at FROM learning.user_progress WHERE user_id=$1 AND course_id=$2 AND content_version=$3',
            [userId, courseId, contentVersion],
          ),
        ),
      );
    },
    saveForUser(userId, state: StudyState, expectedRevision) {
      if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0)
        throw new Error('Invalid expected revision.');
      return database.withUser(userId, async (client) => {
        const result =
          expectedRevision === 0
            ? await client.query(
                'INSERT INTO learning.user_progress(user_id,course_id,content_version,revision,state) VALUES ($1,$2,$3,1,$4) ON CONFLICT (user_id,course_id) DO NOTHING RETURNING user_id,revision,state,updated_at',
                [userId, courseId, contentVersion, JSON.stringify(state)],
              )
            : await client.query(
                'UPDATE learning.user_progress SET state=$4,revision=revision+1,updated_at=clock_timestamp() WHERE user_id=$1 AND course_id=$2 AND content_version=$3 AND revision=$5 RETURNING user_id,revision,state,updated_at',
                [userId, courseId, contentVersion, JSON.stringify(state), expectedRevision],
              );
        const saved = progress(result);
        if (!saved) throw new ProgressConflictError();
        return saved;
      });
    },
  };
}
